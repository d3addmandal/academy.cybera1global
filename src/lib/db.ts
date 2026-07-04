import fs from "fs";
import path from "path";
import { after } from "next/server";
import { blobWrite } from "@/lib/blob-db";
import type {
  AdminUser, SiteSettings, ThemeSettings, NavigationSettings,
  HomePageContent, Programme, BlogPost, Event, Testimonial, Trainer,
  CustomPage, FAQ, NavigationMenu,
  AcademyPageContent, CorporatePageContent, InstitutionsPageContent, CareerPageContent,
  ContactSubmission, Certificate, CertificateTemplate, CertificateAuditLogEntry,
} from "@/types/cms";

const DATA_DIR = path.join(process.cwd(), "data");

// On Vercel, the deployment bundle is read-only; writes must go to /tmp.
// Reads check /tmp first (for writes made in this invocation) then fall back
// to the committed data/ directory.
const IS_VERCEL = process.env.VERCEL === "1";
const WRITE_DIR = IS_VERCEL ? "/tmp/data" : DATA_DIR;
const READ_DIRS = IS_VERCEL ? ["/tmp/data", DATA_DIR] : [DATA_DIR];

// ─── Low-level file helpers ──────────────────────────────────────────────────

function ensureDir(companySlug: string): void {
  const dir = path.join(WRITE_DIR, companySlug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readFile<T>(companySlug: string, filename: string): T | null {
  for (const base of READ_DIRS) {
    const filePath = path.join(base, companySlug, filename);
    if (fs.existsSync(filePath)) {
      try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
      } catch {
        continue;
      }
    }
  }
  return null;
}

function writeFile<T>(companySlug: string, filename: string, data: T): void {
  ensureDir(companySlug);
  const filePath = path.join(WRITE_DIR, companySlug, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  if (IS_VERCEL) {
    // Use after() so Vercel keeps the function alive until the blob write completes.
    const task = blobWrite(companySlug, filename, data).catch(err =>
      console.error("[db] blobWrite failed:", filename, err)
    );
    try {
      after(task);
    } catch (e) {
      // after() throws outside a request context (e.g. build time) — log so
      // it's visible in Vercel function logs if it fires unexpectedly at runtime.
      console.warn("[db] after() unavailable for blobWrite:", filename, e);
    }
  }
}

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// ─── Sessions (no-concurrent-login + inactivity timeout) ────────────────────

const SESSION_INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes

interface SessionRecord {
  userId: string;
  sessionId: string;
  createdAt: string;
  lastActivityAt: string;
  userAgent?: string;
  ip?: string;
}

export const sessionsDb = {
  getAll(slug: string): SessionRecord[] {
    return readFile<SessionRecord[]>(slug, "sessions.json") ?? [];
  },

  getActive(slug: string, userId: string): string | null {
    const s = this.getAll(slug).find((r) => r.userId === userId);
    return s ? s.sessionId : null;
  },

  /** Validates sessionId AND checks 30-min inactivity. Auto-purges expired sessions. */
  isValid(slug: string, userId: string, sessionId: string): boolean {
    const sessions = this.getAll(slug);
    const s = sessions.find((r) => r.userId === userId && r.sessionId === sessionId);
    if (!s) return false;
    const lastActivity = new Date(s.lastActivityAt ?? s.createdAt).getTime();
    if (Date.now() - lastActivity > SESSION_INACTIVITY_MS) {
      writeFile(slug, "sessions.json", sessions.filter((r) => r.userId !== userId));
      return false;
    }
    return true;
  },

  /** Creates a new session, REPLACING any existing session (no concurrent login). */
  create(slug: string, userId: string, sessionId: string, meta?: { userAgent?: string; ip?: string }): void {
    const sessions = this.getAll(slug).filter((r) => r.userId !== userId);
    sessions.push({ userId, sessionId, createdAt: now(), lastActivityAt: now(), ...meta });
    writeFile(slug, "sessions.json", sessions);
  },

  /** Updates lastActivityAt — called on each verified API request. Writes at most once/min. */
  touch(slug: string, userId: string): void {
    const sessions = this.getAll(slug);
    const idx = sessions.findIndex((r) => r.userId === userId);
    if (idx === -1) return;
    const lastActivity = new Date(sessions[idx].lastActivityAt ?? sessions[idx].createdAt).getTime();
    if (Date.now() - lastActivity < 60_000) return; // throttle writes
    sessions[idx] = { ...sessions[idx], lastActivityAt: now() };
    writeFile(slug, "sessions.json", sessions);
  },

  /** Invalidates the session for this user (logout). */
  invalidate(slug: string, userId: string): void {
    const sessions = this.getAll(slug).filter((r) => r.userId !== userId);
    writeFile(slug, "sessions.json", sessions);
  },
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const usersDb = {
  getAll(slug: string): AdminUser[] {
    return readFile<AdminUser[]>(slug, "users.json") ?? [];
  },
  getByEmail(slug: string, email: string): AdminUser | undefined {
    return this.getAll(slug).find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  getById(slug: string, id: string): AdminUser | undefined {
    return this.getAll(slug).find((u) => u.id === id);
  },
  create(slug: string, data: Omit<AdminUser, "id" | "createdAt">): AdminUser {
    const users = this.getAll(slug);
    const user: AdminUser = { ...data, id: generateId(), createdAt: now() };
    writeFile(slug, "users.json", [...users, user]);
    return user;
  },
  update(slug: string, id: string, data: Partial<AdminUser>): AdminUser | null {
    const users = this.getAll(slug);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...data };
    writeFile(slug, "users.json", users);
    return users[idx];
  },
  updateLastLogin(slug: string, id: string): void {
    this.update(slug, id, { lastLogin: now() });
  },
  delete(slug: string, id: string): boolean {
    const users = this.getAll(slug);
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) return false;
    writeFile(slug, "users.json", filtered);
    return true;
  },
};

// ─── Settings ────────────────────────────────────────────────────────────────

export const settingsDb = {
  get(slug: string): SiteSettings | null {
    return readFile<SiteSettings>(slug, "settings.json");
  },
  save(slug: string, data: Partial<SiteSettings>): SiteSettings {
    const current = this.get(slug) ?? defaultSettings(slug);
    const updated: SiteSettings = { ...current, ...data, companySlug: slug, updatedAt: now() };
    writeFile(slug, "settings.json", updated);
    return updated;
  },
};

// ─── Theme ───────────────────────────────────────────────────────────────────

export const themeDb = {
  get(slug: string): ThemeSettings | null {
    return readFile<ThemeSettings>(slug, "theme.json");
  },
  save(slug: string, data: Partial<ThemeSettings>): ThemeSettings {
    const current = this.get(slug) ?? defaultTheme();
    const updated: ThemeSettings = { ...current, ...data, updatedAt: now() };
    writeFile(slug, "theme.json", updated);
    return updated;
  },
};

// ─── Navigation ──────────────────────────────────────────────────────────────

export const navDb = {
  get(slug: string): NavigationSettings | null {
    return readFile<NavigationSettings>(slug, "navigation.json");
  },
  save(slug: string, data: Partial<NavigationSettings>): NavigationSettings {
    const current = this.get(slug) ?? defaultNavigation();
    const updated: NavigationSettings = { ...current, ...data, updatedAt: now() };
    writeFile(slug, "navigation.json", updated);
    return updated;
  },
};

// ─── Home Content ─────────────────────────────────────────────────────────────

export const homeDb = {
  get(slug: string): HomePageContent | null {
    return readFile<HomePageContent>(slug, "home.json");
  },
  save(slug: string, data: Partial<HomePageContent>): HomePageContent {
    const current = this.get(slug) ?? defaultHomeContent();
    const updated: HomePageContent = { ...current, ...data, updatedAt: now() };
    writeFile(slug, "home.json", updated);
    return updated;
  },
  saveSection<K extends keyof HomePageContent>(slug: string, section: K, data: HomePageContent[K]): HomePageContent {
    const current = this.get(slug) ?? defaultHomeContent();
    const updated = { ...current, [section]: data, updatedAt: now() };
    writeFile(slug, "home.json", updated);
    return updated;
  },
};

// ─── Programmes ──────────────────────────────────────────────────────────────

export const programmesDb = {
  getAll(slug: string): Programme[] {
    return (readFile<Programme[]>(slug, "programmes.json") ?? []).sort((a, b) => a.order - b.order);
  },
  getBySlug(slug: string, progSlug: string): Programme | undefined {
    return this.getAll(slug).find((p) => p.slug === progSlug);
  },
  getById(slug: string, id: string): Programme | undefined {
    return this.getAll(slug).find((p) => p.id === id);
  },
  create(slug: string, data: Omit<Programme, "id" | "createdAt" | "updatedAt" | "companySlug">): Programme {
    const all = this.getAll(slug);
    const programme: Programme = {
      ...data,
      id: generateId(),
      companySlug: slug,
      order: all.length,
      createdAt: now(),
      updatedAt: now(),
    };
    writeFile(slug, "programmes.json", [...all, programme]);
    return programme;
  },
  update(slug: string, id: string, data: Partial<Programme>): Programme | null {
    const all = this.getAll(slug);
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data, updatedAt: now() };
    writeFile(slug, "programmes.json", all);
    return all[idx];
  },
  delete(slug: string, id: string): boolean {
    const all = this.getAll(slug);
    const filtered = all.filter((p) => p.id !== id);
    if (filtered.length === all.length) return false;
    writeFile(slug, "programmes.json", filtered);
    return true;
  },
};

// ─── Blog Posts ──────────────────────────────────────────────────────────────

export const blogDb = {
  getAll(slug: string): BlogPost[] {
    return (readFile<BlogPost[]>(slug, "blog.json") ?? []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  getBySlug(slug: string, postSlug: string): BlogPost | undefined {
    return this.getAll(slug).find((p) => p.slug === postSlug);
  },
  getById(slug: string, id: string): BlogPost | undefined {
    return this.getAll(slug).find((p) => p.id === id);
  },
  create(slug: string, data: Omit<BlogPost, "id" | "createdAt" | "updatedAt" | "companySlug">): BlogPost {
    const all = this.getAll(slug);
    const post: BlogPost = { ...data, id: generateId(), companySlug: slug, createdAt: now(), updatedAt: now() };
    writeFile(slug, "blog.json", [post, ...all]);
    return post;
  },
  update(slug: string, id: string, data: Partial<BlogPost>): BlogPost | null {
    const all = this.getAll(slug);
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data, updatedAt: now() };
    writeFile(slug, "blog.json", all);
    return all[idx];
  },
  delete(slug: string, id: string): boolean {
    const all = this.getAll(slug);
    const filtered = all.filter((p) => p.id !== id);
    if (filtered.length === all.length) return false;
    writeFile(slug, "blog.json", filtered);
    return true;
  },
};

// ─── Events ──────────────────────────────────────────────────────────────────

export const eventsDb = {
  getAll(slug: string): Event[] {
    return (readFile<Event[]>(slug, "events.json") ?? []).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  },
  getById(slug: string, id: string): Event | undefined {
    return this.getAll(slug).find((e) => e.id === id);
  },
  create(slug: string, data: Omit<Event, "id" | "createdAt" | "updatedAt" | "companySlug">): Event {
    const all = this.getAll(slug);
    const event: Event = { ...data, id: generateId(), companySlug: slug, createdAt: now(), updatedAt: now() };
    writeFile(slug, "events.json", [event, ...all]);
    return event;
  },
  update(slug: string, id: string, data: Partial<Event>): Event | null {
    const all = this.getAll(slug);
    const idx = all.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data, updatedAt: now() };
    writeFile(slug, "events.json", all);
    return all[idx];
  },
  delete(slug: string, id: string): boolean {
    const all = this.getAll(slug);
    const filtered = all.filter((e) => e.id !== id);
    if (filtered.length === all.length) return false;
    writeFile(slug, "events.json", filtered);
    return true;
  },
};

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const testimonialsDb = {
  getAll(slug: string): Testimonial[] {
    return (readFile<Testimonial[]>(slug, "testimonials.json") ?? []).sort((a, b) => a.order - b.order);
  },
  getById(slug: string, id: string): Testimonial | undefined {
    return this.getAll(slug).find((t) => t.id === id);
  },
  create(slug: string, data: Omit<Testimonial, "id" | "createdAt" | "updatedAt" | "companySlug">): Testimonial {
    const all = this.getAll(slug);
    const t: Testimonial = {
      ...data,
      id: generateId(),
      companySlug: slug,
      order: all.length,
      createdAt: now(),
      updatedAt: now(),
    };
    writeFile(slug, "testimonials.json", [...all, t]);
    return t;
  },
  update(slug: string, id: string, data: Partial<Testimonial>): Testimonial | null {
    const all = this.getAll(slug);
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data, updatedAt: now() };
    writeFile(slug, "testimonials.json", all);
    return all[idx];
  },
  delete(slug: string, id: string): boolean {
    const all = this.getAll(slug);
    const filtered = all.filter((t) => t.id !== id);
    if (filtered.length === all.length) return false;
    writeFile(slug, "testimonials.json", filtered);
    return true;
  },
};

// ─── Pages ───────────────────────────────────────────────────────────────────

export const pagesDb = {
  getAll(slug: string): CustomPage[] {
    return readFile<CustomPage[]>(slug, "pages.json") ?? [];
  },
  getById(slug: string, id: string): CustomPage | undefined {
    return this.getAll(slug).find((p) => p.id === id);
  },
  getBySlug(slug: string, pageSlug: string): CustomPage | undefined {
    return this.getAll(slug).find((p) => p.slug === pageSlug);
  },
  create(slug: string, data: Omit<CustomPage, "id" | "createdAt" | "updatedAt" | "companySlug">): CustomPage {
    const all = this.getAll(slug);
    const page: CustomPage = { ...data, id: generateId(), companySlug: slug, createdAt: now(), updatedAt: now() };
    writeFile(slug, "pages.json", [page, ...all]);
    return page;
  },
  update(slug: string, id: string, data: Partial<CustomPage>): CustomPage | null {
    const all = this.getAll(slug);
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data, updatedAt: now() };
    writeFile(slug, "pages.json", all);
    return all[idx];
  },
  delete(slug: string, id: string): boolean {
    const all = this.getAll(slug);
    const filtered = all.filter((p) => p.id !== id);
    if (filtered.length === all.length) return false;
    writeFile(slug, "pages.json", filtered);
    return true;
  },
};

// ─── FAQs (global/home) ───────────────────────────────────────────────────────

export const faqsDb = {
  getAll(slug: string): FAQ[] {
    return (readFile<FAQ[]>(slug, "faqs.json") ?? []).sort((a, b) => a.order - b.order);
  },
  save(slug: string, faqs: FAQ[]): FAQ[] {
    writeFile(slug, "faqs.json", faqs);
    return faqs;
  },
};

// ─── Menus ───────────────────────────────────────────────────────────────────

export const menusDb = {
  getAll(slug: string): NavigationMenu[] {
    return readFile<NavigationMenu[]>(slug, "menus.json") ?? [];
  },
  getById(slug: string, id: string): NavigationMenu | undefined {
    return this.getAll(slug).find((m) => m.id === id);
  },
  create(slug: string, data: Omit<NavigationMenu, "id" | "createdAt" | "updatedAt">): NavigationMenu {
    const all = this.getAll(slug);
    const menu: NavigationMenu = { ...data, id: generateId(), createdAt: now(), updatedAt: now() };
    writeFile(slug, "menus.json", [...all, menu]);
    return menu;
  },
  update(slug: string, id: string, data: Partial<NavigationMenu>): NavigationMenu | null {
    const all = this.getAll(slug);
    const idx = all.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data, updatedAt: now() };
    writeFile(slug, "menus.json", all);
    return all[idx];
  },
  delete(slug: string, id: string): boolean {
    const all = this.getAll(slug);
    const filtered = all.filter((m) => m.id !== id);
    if (filtered.length === all.length) return false;
    writeFile(slug, "menus.json", filtered);
    return true;
  },
};

// ─── Trainers ────────────────────────────────────────────────────────────────

export const trainersDb = {
  getAll(slug: string): Trainer[] {
    return (readFile<Trainer[]>(slug, "trainers.json") ?? []).sort((a, b) => a.order - b.order);
  },
  getById(slug: string, id: string): Trainer | undefined {
    return this.getAll(slug).find((t) => t.id === id);
  },
  getBySlug(slug: string, trainerSlug: string): Trainer | undefined {
    return this.getAll(slug).find((t) => t.slug === trainerSlug);
  },
  create(slug: string, data: Omit<Trainer, "id" | "createdAt" | "updatedAt" | "companySlug">): Trainer {
    const all = this.getAll(slug);
    const trainer: Trainer = {
      ...data,
      id: generateId(),
      companySlug: slug,
      order: all.length,
      createdAt: now(),
      updatedAt: now(),
    };
    writeFile(slug, "trainers.json", [...all, trainer]);
    return trainer;
  },
  update(slug: string, id: string, data: Partial<Trainer>): Trainer | null {
    const all = this.getAll(slug);
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data, updatedAt: now() };
    writeFile(slug, "trainers.json", all);
    return all[idx];
  },
  delete(slug: string, id: string): boolean {
    const all = this.getAll(slug);
    const filtered = all.filter((t) => t.id !== id);
    if (filtered.length === all.length) return false;
    writeFile(slug, "trainers.json", filtered);
    return true;
  },
};

// ─── Certificate Templates ─────────────────────────────────────────────────────

export const certificateTemplatesDb = {
  getAll(slug: string): CertificateTemplate[] {
    return (readFile<CertificateTemplate[]>(slug, "certificate-templates.json") ?? [])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getById(slug: string, id: string): CertificateTemplate | undefined {
    return this.getAll(slug).find((t) => t.id === id);
  },
  create(slug: string, data: Omit<CertificateTemplate, "id" | "companySlug" | "createdAt" | "updatedAt">): CertificateTemplate {
    let all = this.getAll(slug);
    if (data.isDefault) all = all.map((t) => ({ ...t, isDefault: false }));
    const template: CertificateTemplate = {
      ...data,
      id: generateId(),
      companySlug: slug,
      createdAt: now(),
      updatedAt: now(),
    };
    writeFile(slug, "certificate-templates.json", [...all, template]);
    return template;
  },
  update(slug: string, id: string, data: Partial<CertificateTemplate>): CertificateTemplate | null {
    let all = this.getAll(slug);
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    if (data.isDefault) all = all.map((t) => (t.id === id ? t : { ...t, isDefault: false }));
    all[idx] = { ...all[idx], ...data, updatedAt: now() };
    writeFile(slug, "certificate-templates.json", all);
    return all[idx];
  },
  delete(slug: string, id: string): boolean {
    const all = this.getAll(slug);
    const filtered = all.filter((t) => t.id !== id);
    if (filtered.length === all.length) return false;
    writeFile(slug, "certificate-templates.json", filtered);
    return true;
  },
};

// ─── Certificates ───────────────────────────────────────────────────────────────

const CERT_NUMBER_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ"; // no 0/O/1/I/L ambiguity

function generateCertificateNumber(): string {
  const year = new Date().getFullYear();
  const code = Array.from({ length: 8 }, () =>
    CERT_NUMBER_ALPHABET[Math.floor(Math.random() * CERT_NUMBER_ALPHABET.length)]
  ).join("");
  return `CERT-${year}-${code}`;
}

type CertificateCreateInput = Omit<Certificate, "id" | "companySlug" | "createdAt" | "updatedAt" | "certificateNumber"> & {
  certificateNumber?: string;
};

export const certificatesDb = {
  getAll(slug: string): Certificate[] {
    return (readFile<Certificate[]>(slug, "certificates.json") ?? [])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getById(slug: string, id: string): Certificate | undefined {
    return this.getAll(slug).find((c) => c.id === id);
  },
  getByCertificateNumber(slug: string, certificateNumber: string): Certificate | undefined {
    return this.getAll(slug).find((c) => c.certificateNumber === certificateNumber);
  },
  create(slug: string, data: CertificateCreateInput): Certificate {
    const all = this.getAll(slug);
    let certificateNumber = data.certificateNumber;
    if (!certificateNumber) {
      // Astronomically unlikely to collide, but guard anyway.
      for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = generateCertificateNumber();
        if (!all.some((c) => c.certificateNumber === candidate)) { certificateNumber = candidate; break; }
      }
      if (!certificateNumber) certificateNumber = generateCertificateNumber();
    }
    const certificate: Certificate = {
      ...data,
      certificateNumber,
      id: generateId(),
      companySlug: slug,
      createdAt: now(),
      updatedAt: now(),
    };
    writeFile(slug, "certificates.json", [...all, certificate]);
    return certificate;
  },
  update(slug: string, id: string, data: Partial<Certificate>): Certificate | null {
    const all = this.getAll(slug);
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data, updatedAt: now() };
    writeFile(slug, "certificates.json", all);
    return all[idx];
  },
  delete(slug: string, id: string): boolean {
    const all = this.getAll(slug);
    const filtered = all.filter((c) => c.id !== id);
    if (filtered.length === all.length) return false;
    writeFile(slug, "certificates.json", filtered);
    return true;
  },
};

// ─── Certificate Audit Log (append-only) ─────────────────────────────────────────

export const certificateAuditLogDb = {
  getAll(slug: string): CertificateAuditLogEntry[] {
    return (readFile<CertificateAuditLogEntry[]>(slug, "certificate-audit-log.json") ?? [])
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getByCertificateId(slug: string, certificateId: string): CertificateAuditLogEntry[] {
    return this.getAll(slug).filter((e) => e.certificateId === certificateId);
  },
  append(slug: string, entries: Omit<CertificateAuditLogEntry, "id" | "createdAt">[]): CertificateAuditLogEntry[] {
    const all = this.getAll(slug);
    const stamped = entries.map((e) => ({ ...e, id: generateId(), createdAt: now() }));
    writeFile(slug, "certificate-audit-log.json", [...stamped, ...all]);
    return stamped;
  },
};

// ─── Contact Submissions ──────────────────────────────────────────────────────

export const contactsDb = {
  getAll(slug: string): ContactSubmission[] {
    return (readFile<ContactSubmission[]>(slug, "contacts.json") ?? []).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  },
  create(slug: string, data: Omit<ContactSubmission, "id" | "submittedAt">): ContactSubmission {
    const all = this.getAll(slug);
    const submission: ContactSubmission = { ...data, id: generateId(), submittedAt: now() };
    writeFile(slug, "contacts.json", [submission, ...all]);
    return submission;
  },
  delete(slug: string, id: string): boolean {
    const all = this.getAll(slug);
    const filtered = all.filter((c) => c.id !== id);
    if (filtered.length === all.length) return false;
    writeFile(slug, "contacts.json", filtered);
    return true;
  },
};

// ─── Company check / init ─────────────────────────────────────────────────────

export function companyExists(slug: string): boolean {
  return READ_DIRS.some((base) => fs.existsSync(path.join(base, slug, "users.json")));
}

export function isInitialized(slug: string): boolean {
  return companyExists(slug);
}

// ─── Static Page DBs ──────────────────────────────────────────────────────────

export const academyPageDb = {
  get(slug: string): AcademyPageContent | null {
    return readFile<AcademyPageContent>(slug, "academy-page.json");
  },
  save(slug: string, data: AcademyPageContent): AcademyPageContent {
    const updated = { ...data, updatedAt: now() };
    writeFile(slug, "academy-page.json", updated);
    return updated;
  },
};

export const corporatePageDb = {
  get(slug: string): CorporatePageContent | null {
    return readFile<CorporatePageContent>(slug, "corporate-page.json");
  },
  save(slug: string, data: CorporatePageContent): CorporatePageContent {
    const updated = { ...data, updatedAt: now() };
    writeFile(slug, "corporate-page.json", updated);
    return updated;
  },
};

export const institutionsPageDb = {
  get(slug: string): InstitutionsPageContent | null {
    return readFile<InstitutionsPageContent>(slug, "institutions-page.json");
  },
  save(slug: string, data: InstitutionsPageContent): InstitutionsPageContent {
    const updated = { ...data, updatedAt: now() };
    writeFile(slug, "institutions-page.json", updated);
    return updated;
  },
};

export const careerPageDb = {
  get(slug: string): CareerPageContent | null {
    return readFile<CareerPageContent>(slug, "career-page.json");
  },
  save(slug: string, data: CareerPageContent): CareerPageContent {
    const updated = { ...data, updatedAt: now() };
    writeFile(slug, "career-page.json", updated);
    return updated;
  },
};

// ─── Default data factories ──────────────────────────────────────────────────

function defaultSettings(slug: string): SiteSettings {
  return {
    companyName: slug.charAt(0).toUpperCase() + slug.slice(1) + " Academy",
    companySlug: slug,
    tagline: "Industry-Focused Cybersecurity Training",
    phone: "+91 8240 006 007",
    whatsapp: "+918240006007",
    email: `info@${slug}academy.com`,
    address: "Durgapur, West Bengal",
    hours: "Mon–Sat: 9:30 AM – 7:00 PM",
    locations: ["Durgapur", "Delhi", "Kolkata"],
    socialLinks: { linkedin: "#", instagram: "#", youtube: "#", facebook: "#", twitter: "#" },
    seo: {
      defaultTitle: `${slug} Academy — Industry-Focused Cybersecurity Training`,
      titleTemplate: "%s | Academy",
      defaultDescription: "Hands-on cybersecurity programs designed by security professionals.",
      keywords: ["cybersecurity", "ethical hacking", "VAPT", "SOC analyst"],
      ogImage: "/images/og-image.jpg",
    },
    scripts: { headScripts: "", bodyStartScripts: "", bodyEndScripts: "" },
    updatedAt: new Date().toISOString(),
  };
}

function defaultTheme(): ThemeSettings {
  return {
    colors: {
      primary: "#e00000",
      primaryDark: "#8b0000",
      headerBg: "#080b10",
      footerBg: "#050505",
      pageBg: "#ffffff",
      darkBg: "#080b10",
      semiDark: "#0d1117",
      black: "#050505",
    },
    logo: { text: "Cyber A1", highlight: "A1", imageUrl: "", faviconUrl: "" },
    typography: { headingFont: "Inter", bodyFont: "Inter", baseFontSize: "md" },
    templates: {
      preset: "dark-cyber",
      pageLayout: "layout-1",
      programmeLayout: "prog-1",
      blogLayout: "blog-1",
      ctaStyle: "cta-1",
      contactFormStyle: "form-1",
      contactPageTemplate: "contact-1",
    },
    updatedAt: new Date().toISOString(),
  };
}

function defaultNavigation(): NavigationSettings {
  return {
    announcementBar: {
      enabled: true,
      text: "🎓 Admissions Open for 2026 Batch | Corporate Training Available | Free Career Counseling",
      whatsappLabel: "WhatsApp",
      phone: "+91 8240 006 007",
      ctaText: "Book Counseling",
      ctaLink: "/contact",
    },
    headerNav: [
      { id: "1", label: "Home", href: "/", isExternal: false, openInNewTab: false, order: 0, children: [] },
      { id: "2", label: "Academy", href: "/academy", isExternal: false, openInNewTab: false, order: 1, children: [] },
      { id: "3", label: "Courses", href: "/courses", isExternal: false, openInNewTab: false, order: 2, children: [] },
      { id: "4", label: "Corporate Training", href: "/corporate-training", isExternal: false, openInNewTab: false, order: 3, children: [] },
      { id: "5", label: "Institutions", href: "/institutions", isExternal: false, openInNewTab: false, order: 4, children: [] },
      { id: "6", label: "Events", href: "/events", isExternal: false, openInNewTab: false, order: 5, children: [] },
      { id: "7", label: "Blog", href: "/blog", isExternal: false, openInNewTab: false, order: 6, children: [] },
      { id: "8", label: "Career & Placement", href: "/career-placement", isExternal: false, openInNewTab: false, order: 7, children: [] },
      { id: "9", label: "Contact", href: "/contact", isExternal: false, openInNewTab: false, order: 8, children: [] },
    ],
    headerCta: { text: "Contact Us", href: "/contact" },
    footerQuickLinks: [],
    footerProgramLinks: [],
    footerCorporateLinks: [],
    footerBottomLinks: [
      { id: "fp1", label: "Privacy Policy", href: "/privacy-policy", isExternal: false, openInNewTab: false, order: 0, children: [] },
      { id: "fp2", label: "Terms & Conditions", href: "/terms", isExternal: false, openInNewTab: false, order: 1, children: [] },
      { id: "fp3", label: "Refund Policy", href: "/refund-policy", isExternal: false, openInNewTab: false, order: 2, children: [] },
    ],
    updatedAt: new Date().toISOString(),
  };
}

function defaultHomeContent(): HomePageContent {
  return {
    hero: {
      badge: "Enterprise-Focused Cybersecurity Training Platform",
      headlineLine1: "Build Real",
      headlineLine2: "Cybersecurity",
      headlineAccent: "Skills For Industry & Enterprise",
      subheadline: "Hands-on cybersecurity programs designed by security professionals with practical exposure in VAPT, cloud security, SOC operations, secure coding, and enterprise security workflows.",
      buttons: [
        { label: "Explore Programs", href: "/courses", variant: "primary" },
        { label: "Corporate Training", href: "/corporate-training", variant: "outline" },
        { label: "Watch Student Journey", href: "#", variant: "ghost" },
      ],
      trustItems: [
        { icon: "Building2", label: "Industry-Led Training" },
        { icon: "FlaskConical", label: "Hands-On Labs" },
        { icon: "Compass", label: "Career Guidance" },
        { icon: "Shield", label: "Enterprise Exposure" },
        { icon: "Users", label: "Community Ecosystem" },
      ],
      heroImage: "/images/home-hero.jpg",
      floatingCards: {
        popularProgram: {
          enabled: true,
          badgeText: "Popular Program",
          title: "CCSE (12 Months)",
          subtitle: "Comprehensive Cybersecurity Expert Program",
          href: "/courses/ccse-certified-cyber-security-expert",
          iconColor: "#e00000",
        },
        upcomingBatch: {
          enabled: true,
          badgeText: "Upcoming Batch",
          title: "24th June 2026",
          subtitle: "Weekend Batch (Online + Offline)",
          href: "/contact",
          iconColor: "#e00000",
        },
        careerSupport: {
          enabled: true,
          badgeText: "Career Support",
          title: "100% Practical",
          subtitle: "Placement Guidance, Mock Interviews & More",
          href: "/career-placement",
          iconColor: "#10b981",
        },
      },
    },
    trustStrip: [
      { icon: "Award", label: "CEH Certified Trainers" },
      { icon: "Briefcase", label: "Real Industry Projects" },
      { icon: "FlaskConical", label: "Practical Labs" },
      { icon: "Shield", label: "Enterprise Security Exposure" },
      { icon: "Users", label: "Placement Support" },
      { icon: "Building2", label: "Corporate Training Programs" },
    ],
    programmes: {
      sectionLabel: "Our Programs",
      title: "Industry-Focused Cybersecurity Programs",
      subtitle: "Designed for students, professionals, and enterprise teams.",
      ctaText: "View All Programs",
      ctaLink: "/courses",
      featuredProgrammeIds: [],
    },
    stats: { trainers: "20+", labs: "50+", students: "1000+", workshops: "100+" },
    why: {
      sectionLabel: "Why Cyber A1 Academy?",
      title: "Why Students & Organizations Choose Cyber A1",
      subtitle: "We combine enterprise-grade training with practical industry exposure to create job-ready cybersecurity professionals.",
      features: [
        { id: "f1", icon: "Briefcase", title: "Real Industry Exposure", description: "Work on real VAPT projects and learn enterprise reporting methodology.", points: ["Real-world security assessments", "Enterprise security workflows", "Professional reporting standards"] },
        { id: "f2", icon: "FlaskConical", title: "Practical Learning", description: "Hands-on labs, real-world simulations and industry-grade tools.", points: ["Dedicated lab environments", "Virtual machines & attack ranges", "Cloud-based security labs"] },
        { id: "f3", icon: "TrendingUp", title: "Career-Focused Training", description: "Career roadmap, interview preparation, resume building & placement support.", points: ["Resume & LinkedIn optimization", "Mock interview sessions", "Direct company referrals"] },
        { id: "f4", icon: "Users", title: "Community & Events", description: "Active community, GDG Durgapur, workshops, DevFest & tech events.", points: ["GDG Durgapur community", "Monthly workshops & seminars", "CTF competitions"] },
        { id: "f5", icon: "Building2", title: "Corporate Training Capability", description: "Custom training for organizations on latest security topics.", points: ["Tailored corporate programs", "Compliance training", "Security awareness"] },
      ],
    },
    careerRoadmap: {
      sectionLabel: "Choose Your Path",
      title: "Cybersecurity Career Roadmap",
      ctaText: "View Full Roadmap",
      ctaLink: "/courses",
      tracks: [
        {
          id: "ethical-hacking", label: "Ethical Hacking",
          stages: [
            { level: "Beginner", duration: "0–6 Months", topics: ["Networking Basics", "Linux Fundamentals", "Cybersecurity Basics", "Tools & Techniques"], certifications: ["CompTIA Security+"], jobs: ["Junior Security Analyst", "Security Trainee"] },
            { level: "Intermediate", duration: "6–12 Months", topics: ["Ethical Hacking", "VAPT Methodology", "Web & Network Security", "Privilege Escalation"], certifications: ["CEH"], jobs: ["Penetration Tester", "VAPT Analyst"] },
            { level: "Advanced", duration: "1–2 Years", topics: ["Advanced Exploitation", "Post Exploitation", "Red Teaming Basics", "Report Writing"], certifications: ["OSCP", "CRTP"], jobs: ["Security Consultant", "Red Team Operator"] },
            { level: "Specialization", duration: "2+ Years", topics: ["Cloud Security", "AI Security", "Malware Analysis", "Bug Bounty"], certifications: ["AWS Security", "OSWE / OSEP"], jobs: ["Security Architect", "Bug Bounty Hunter"] },
          ],
        },
      ],
    },
    corporate: {
      sectionLabel: "Corporate Training Solutions",
      title: "Empower Your Team With",
      highlight: "Cybersecurity Skills",
      subtitle: "We design role-based and industry-specific training programs to meet your organization's security goals.",
      services: [
        { icon: "Eye", label: "Security Awareness" },
        { icon: "Target", label: "SOC Awareness" },
        { icon: "Shield", label: "Phishing Simulation" },
        { icon: "CheckCircle2", label: "Compliance Awareness" },
        { icon: "Code", label: "Secure Coding" },
        { icon: "Zap", label: "Red Team Awareness" },
        { icon: "Cloud", label: "Cloud Security Workshops" },
        { icon: "Users", label: "Custom Training Programs" },
      ],
      ctaText: "Train Your Team",
      ctaLink: "/corporate-training",
      image: "/images/corporate-training.jpg",
      statValue: "500+",
      statLabel: "Professionals Trained",
    },
    institutional: {
      sectionLabel: "Institutional Collaboration",
      title: "Partner With",
      highlight: "Cyber A1 Academy",
      subtitle: "Build the next generation of cybersecurity professionals with us for training, workshops, internships & placement support.",
      services: [
        { icon: "BookOpen", label: "Workshops & Seminars" },
        { icon: "GraduationCap", label: "Faculty Development" },
        { icon: "Users", label: "Cybersecurity Clubs" },
        { icon: "Zap", label: "Bootcamps & Hackathons" },
        { icon: "Briefcase", label: "Internship Collaboration" },
        { icon: "Link2", label: "Industry Connect" },
        { icon: "Heart", label: "Placement Support" },
        { icon: "BookMarked", label: "Curriculum Support" },
      ],
      ctaText: "Partner With Us",
      ctaLink: "/institutions",
      image: "/images/institution.jpg",
      statValue: "25+",
      statLabel: "Partner Institutions",
    },
    events: {
      sectionLabel: "Events & Community",
      title: "Building A Strong Cybersecurity Community",
      subtitle: "Our events, workshops and community initiatives help you stay connected, up-to-date, and competitive.",
      featuredEventIds: [],
      ctaText: "Explore Events",
      ctaLink: "/events",
    },
    testimonials: {
      sectionLabel: "Student Success Stories",
      title: "Hear From Our Learners",
      subtitle: "",
      featuredTestimonialIds: [],
      hiringPartners: [
        { name: "Deloitte", logoUrl: "" },
        { name: "TCS", logoUrl: "" },
        { name: "Wipro", logoUrl: "" },
        { name: "Infosys", logoUrl: "" },
        { name: "Accenture", logoUrl: "" },
      ],
    },
    blog: {
      sectionLabel: "Latest From Our Blog",
      title: "Insights & Resources",
      subtitle: "",
      featuredPostIds: [],
      ctaText: "Explore All Blogs",
      ctaLink: "/blog",
    },
    faqs: [
      { id: "faq1", question: "Who can join Cyber A1 Academy programs?", answer: "Anyone interested in cybersecurity can join — students, freshers, IT professionals, working professionals, and career switchers.", order: 0, isActive: true },
      { id: "faq2", question: "Do I need coding knowledge to start?", answer: "No coding knowledge is required for our foundation programs like CCEH.", order: 1, isActive: true },
      { id: "faq3", question: "Do you provide practical labs?", answer: "Yes, we have dedicated practical lab environments including virtual machines, attack ranges, vulnerable applications, and SIEM environments.", order: 2, isActive: true },
      { id: "faq4", question: "Do you offer placement assistance?", answer: "Yes, we provide resume building, mock interviews, and direct referrals to our hiring partner companies.", order: 3, isActive: true },
      { id: "faq5", question: "Are the classes online or offline?", answer: "We offer both online and offline modes.", order: 4, isActive: true },
      { id: "faq6", question: "Can working professionals join?", answer: "Yes! We have weekend batches designed for working professionals.", order: 5, isActive: true },
    ],
    cta: {
      eyebrow: "Ready To Start Your Journey?",
      headline: "Start Your Cybersecurity Journey With Real Industry-Focused Training",
      subtext: "Practical Learning • Career Guidance • Industry Exposure • Placement Support",
      primaryButton: { text: "Book Free Counseling", href: "/contact" },
      secondaryButton: { text: "Contact Us", href: "/contact" },
      trustPoints: [
        { icon: "Users", label: "Expert Trainers", sub: "Industry Professionals" },
        { icon: "FlaskConical", label: "Hands-On Labs", sub: "Real-world Experience" },
        { icon: "TrendingUp", label: "Career Support", sub: "Placement Assistance" },
        { icon: "Shield", label: "Practical Learning", sub: "Industry Exposure" },
      ],
      bgStyle: "dark",
    },
    footer: {
      description: "Cyber A1 Academy provides practical cybersecurity education, enterprise training, and career-focused learning experiences designed for the modern security industry.",
      copyright: `© ${new Date().getFullYear()} Cyber A1 Academy. All Rights Reserved.`,
      bottomLinks: [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Refund Policy", href: "/refund-policy" },
      ],
    },
    updatedAt: new Date().toISOString(),
  };
}
