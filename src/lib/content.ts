/**
 * Website content helpers.
 * Called in Server Components — every request gets fresh data directly from the
 * CRM JSON store. No caching layer: admin saves → next page load reflects it.
 *
 * COMPANY_SLUG env var selects the active company (defaults to "cybera1").
 */
import {
  themeDb, settingsDb, navDb, homeDb,
  programmesDb, blogDb, eventsDb, testimonialsDb, faqsDb, menusDb,
  academyPageDb, corporatePageDb, institutionsPageDb, careerPageDb,
} from "./db";
import type { Programme, BlogPost, Event, Testimonial, FAQ, HomePageContent, NavigationMenu, AcademyPageContent, CorporatePageContent, InstitutionsPageContent, CareerPageContent } from "@/types/cms";

const COMPANY = process.env.COMPANY_SLUG ?? "cybera1";

// ── Branding / layout ────────────────────────────────────────────────────────
export function getSiteTheme() {
  try { return themeDb.get(COMPANY); } catch { return null; }
}
export function getSiteSettings() {
  try { return settingsDb.get(COMPANY); } catch { return null; }
}
export function getSiteNav() {
  try { return navDb.get(COMPANY); } catch { return null; }
}

// ── Homepage content ─────────────────────────────────────────────────────────
export function getSiteHome(): HomePageContent | null {
  try { return homeDb.get(COMPANY); } catch { return null; }
}

// ── Programmes (courses) ─────────────────────────────────────────────────────
export function getCRMProgrammes(): Programme[] {
  try { return programmesDb.getAll(COMPANY); } catch { return []; }
}
export function getCRMPublishedProgrammes(): Programme[] {
  try { return programmesDb.getAll(COMPANY).filter(p => p.status === "published"); } catch { return []; }
}
export function getCRMFeaturedProgrammes(ids?: string[]): Programme[] {
  const all = getCRMProgrammes().filter(p => p.status === "published");
  if (!ids || ids.length === 0) return all.filter(p => p.isFeatured).slice(0, 6);
  const byId = ids.map(id => all.find(p => p.id === id)).filter(Boolean) as Programme[];
  return byId.length > 0 ? byId : all.filter(p => p.isFeatured).slice(0, 6);
}
export function getCRMProgrammeBySlug(slug: string): Programme | undefined {
  try { return programmesDb.getBySlug(COMPANY, slug); } catch { return undefined; }
}

// ── Blog posts ───────────────────────────────────────────────────────────────
export function getCRMBlogPosts(): BlogPost[] {
  try { return blogDb.getAll(COMPANY).filter(p => p.status === "published"); } catch { return []; }
}
export function getCRMFeaturedBlogs(ids?: string[]): BlogPost[] {
  const all = getCRMBlogPosts();
  if (!ids || ids.length === 0) return all.filter(p => p.isFeatured).slice(0, 3);
  const byId = ids.map(id => all.find(p => p.id === id)).filter(Boolean) as BlogPost[];
  return byId.length > 0 ? byId : all.filter(p => p.isFeatured).slice(0, 3);
}
export function getCRMBlogBySlug(slug: string): BlogPost | undefined {
  try { return blogDb.getBySlug(COMPANY, slug); } catch { return undefined; }
}

// ── Events ───────────────────────────────────────────────────────────────────
export function getCRMEvents(): Event[] {
  try { return eventsDb.getAll(COMPANY).filter(e => e.status === "published"); } catch { return []; }
}
export function getCRMFeaturedEvents(ids?: string[]): Event[] {
  const all = getCRMEvents();
  if (!ids || ids.length === 0) return all.filter(e => e.isFeatured).slice(0, 6);
  const byId = ids.map(id => all.find(e => e.id === id)).filter(Boolean) as Event[];
  return byId.length > 0 ? byId : all.filter(e => e.isFeatured).slice(0, 6);
}

// ── Testimonials ─────────────────────────────────────────────────────────────
export function getCRMTestimonials(): Testimonial[] {
  try { return testimonialsDb.getAll(COMPANY).filter(t => t.status === "published"); } catch { return []; }
}
export function getCRMFeaturedTestimonials(ids?: string[]): Testimonial[] {
  const all = getCRMTestimonials();
  if (!ids || ids.length === 0) return all.filter(t => t.isFeatured).slice(0, 6);
  const byId = ids.map(id => all.find(t => t.id === id)).filter(Boolean) as Testimonial[];
  return byId.length > 0 ? byId : all.filter(t => t.isFeatured).slice(0, 6);
}

// ── FAQs ─────────────────────────────────────────────────────────────────────
export function getCRMFAQs(): FAQ[] {
  try { return faqsDb.getAll(COMPANY).filter(f => f.isActive); } catch { return []; }
}

// ── Menus ─────────────────────────────────────────────────────────────────────
export function getCRMMenus(): NavigationMenu[] {
  try { return menusDb.getAll(COMPANY); } catch { return []; }
}
export function getCRMMenuById(id: string): NavigationMenu | undefined {
  try { return menusDb.getById(COMPANY, id); } catch { return undefined; }
}

// ── Static page content ──────────────────────────────────────────────────────
export function getAcademyPageContent(): AcademyPageContent | null {
  try { return academyPageDb.get(COMPANY); } catch { return null; }
}
export function getCorporatePageContent(): CorporatePageContent | null {
  try { return corporatePageDb.get(COMPANY); } catch { return null; }
}
export function getInstitutionsPageContent(): InstitutionsPageContent | null {
  try { return institutionsPageDb.get(COMPANY); } catch { return null; }
}
export function getCareerPageContent(): CareerPageContent | null {
  try { return careerPageDb.get(COMPANY); } catch { return null; }
}
