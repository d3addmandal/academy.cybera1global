// ─────────────────────────────────────────────
// Core Identifiers
// ─────────────────────────────────────────────
export type UserRole = "super_admin" | "admin" | "editor" | "sales" | "viewer";
export type Status = "published" | "draft" | "archived";
export type ProgrammeLevel = "Beginner" | "Intermediate" | "Advanced" | "Beginner to Advanced";
export type ProgrammeCategory = "career-track" | "specialized" | "corporate" | "institutional";

// ─────────────────────────────────────────────
// Admin Users
// ─────────────────────────────────────────────
export interface AdminUser {
  id: string;
  companySlug: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

// ─────────────────────────────────────────────
// Site Settings
// ─────────────────────────────────────────────
export interface SiteSettings {
  companyName: string;
  companySlug: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  locations: string[];
  socialLinks: {
    linkedin: string;
    instagram: string;
    youtube: string;
    facebook: string;
    twitter: string;
  };
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    keywords: string[];
    ogImage: string;
  };
  scripts: {
    headScripts: string;
    bodyStartScripts: string;
    bodyEndScripts: string;
  };
  inquiry?: {
    deliveryMethod: "email" | "whatsapp" | "both";
    whatsappNumber: string;
    emailTo: string;
  };
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Contact Submissions
// ─────────────────────────────────────────────
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  program: string;
  company: string;
  message: string;
  inquiryType: string;
  submittedAt: string;
  ipAddress?: string;
}

// ─────────────────────────────────────────────
// Theme & Branding
// ─────────────────────────────────────────────
export interface ThemeSettings {
  colors: {
    primary: string;
    primaryDark: string;
    headerBg: string;
    footerBg: string;
    pageBg: string;
    darkBg: string;
    semiDark: string;
    black: string;
  };
  logo: {
    text: string;
    highlight: string;
    imageUrl: string;
    faviconUrl: string;
    siteIconUrl?: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseFontSize: "sm" | "md" | "lg";
  };
  templates: {
    preset: string;
    pageLayout: string;
    programmeLayout: string;
    blogLayout: string;
    ctaStyle: string;
    contactFormStyle: string;
    contactPageTemplate: string;
  };
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Menus (reusable nav menus for header/footer)
// ─────────────────────────────────────────────
export interface NavMenuItem {
  id: string;
  label: string;
  href: string;
}

export interface NavigationMenu {
  id: string;
  header: string;
  items: NavMenuItem[];
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────
export interface NavItem {
  id: string;
  label: string;
  href: string;
  isExternal: boolean;
  openInNewTab: boolean;
  order: number;
  children: NavItem[];
}

export interface NavigationSettings {
  announcementBar: {
    enabled: boolean;
    text: string;
    whatsappLabel: string;
    phone: string;
    ctaText: string;
    ctaLink: string;
  };
  headerNav: NavItem[];
  headerCta: { text: string; href: string };
  footerQuickLinks: NavItem[];
  footerProgramLinks: NavItem[];
  footerCorporateLinks: NavItem[];
  footerBottomLinks: NavItem[];
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Home Page Content (per section)
// ─────────────────────────────────────────────
export interface FloatingCard {
  enabled: boolean;
  badgeText: string;
  title: string;
  subtitle: string;
  href: string;
  iconColor: string;
}

export interface HeroSection {
  badge: string;
  headlineLine1: string;
  headlineLine2: string;
  headlineAccent: string;
  subheadline: string;
  buttons: Array<{ label: string; href: string; variant: "primary" | "outline" | "ghost" }>;
  trustItems: Array<{ icon: string; label: string }>;
  heroImage: string;
  floatingCards: {
    popularProgram: FloatingCard;
    upcomingBatch: FloatingCard;
    careerSupport: FloatingCard;
  };
}

export interface TrustStripItem { icon: string; label: string; }

export interface ProgrammeSectionConfig {
  sectionLabel: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  featuredProgrammeIds: string[];
}

export interface StatsConfig {
  trainers: string;
  labs: string;
  students: string;
  workshops: string;
}

export interface WhyFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
  points: string[];
}

export interface WhySection {
  sectionLabel: string;
  title: string;
  subtitle: string;
  features: WhyFeature[];
}

export interface RoadmapStage {
  level: string;
  duration: string;
  topics: string[];
  certifications: string[];
  jobs: string[];
}

export interface RoadmapTrack {
  id: string;
  label: string;
  stages: RoadmapStage[];
}

export interface CareerRoadmapSection {
  sectionLabel: string;
  title: string;
  tracks: RoadmapTrack[];
  ctaText: string;
  ctaLink: string;
}

export interface ServiceItem { icon: string; label: string; }

export interface CorporateSection {
  sectionLabel: string;
  title: string;
  highlight: string;
  subtitle: string;
  services: ServiceItem[];
  ctaText: string;
  ctaLink: string;
  image: string;
  statValue: string;
  statLabel: string;
}

export interface InstitutionalSection {
  sectionLabel: string;
  title: string;
  highlight: string;
  subtitle: string;
  services: ServiceItem[];
  ctaText: string;
  ctaLink: string;
  image: string;
  statValue: string;
  statLabel: string;
}

export interface EventsSectionConfig {
  sectionLabel: string;
  title: string;
  subtitle: string;
  featuredEventIds: string[];
  ctaText: string;
  ctaLink: string;
  galleryImages?: string[];
}

export interface TestimonialsSectionConfig {
  sectionLabel: string;
  title: string;
  subtitle: string;
  featuredTestimonialIds: string[];
  hiringPartners: Array<{ name: string; logoUrl: string }>;
}

export interface BlogSectionConfig {
  sectionLabel: string;
  title: string;
  subtitle: string;
  featuredPostIds: string[];
  ctaText: string;
  ctaLink: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

export interface CTASection {
  eyebrow: string;
  headline: string;
  subtext: string;
  primaryButton: { text: string; href: string };
  secondaryButton: { text: string; href: string };
  trustPoints: Array<{ icon: string; label: string; sub: string }>;
  bgStyle: "dark" | "gradient" | "light";
  bgImage?: string;
}

export interface FooterMenuSection {
  enabled: boolean;
  menuId: string;
}

export interface FooterContent {
  description: string;
  copyright: string;
  bottomLinks: Array<{ label: string; href: string }>;
  socialLinks?: { linkedin?: string; instagram?: string; youtube?: string; facebook?: string };
  menuSections?: [FooterMenuSection, FooterMenuSection, FooterMenuSection];
  lastSection?: "newsletter" | "achievements";
  newsletter?: { title?: string; description?: string };
  achievements?: Array<{ name: string; logoUrl: string }>;
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  contactHours?: string;
  contactWhatsapp?: string;
}

export interface HomePageContent {
  hero: HeroSection;
  trustStrip: TrustStripItem[];
  programmes: ProgrammeSectionConfig;
  stats: StatsConfig;
  why: WhySection;
  careerRoadmap: CareerRoadmapSection;
  corporate: CorporateSection;
  institutional: InstitutionalSection;
  events: EventsSectionConfig;
  testimonials: TestimonialsSectionConfig;
  blog: BlogSectionConfig;
  faqs: FAQ[];
  cta: CTASection;
  footer: FooterContent;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Programmes
// ─────────────────────────────────────────────
export interface CourseModule {
  id: string;
  number: string;
  title: string;
  description: string;
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
}

export interface Programme {
  id: string;
  companySlug: string;
  slug: string;
  shortTitle: string;
  title: string;
  badge: string;
  category: ProgrammeCategory;
  level: ProgrammeLevel;
  duration: string;
  mode: string;
  labsType: string;
  description: string;
  overview: string;
  image: string;
  heroImage: string;
  icon?: string;
  color: string;
  isFeatured: boolean;
  status: Status;
  bestFor: string[];
  topics: string[];
  modules: CourseModule[];
  tools: string[];
  labs: string[];
  certificationTitle: string;
  sampleCertificate?: string;
  careerPaths: CareerPath[];
  faqs: FAQ[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Blog Posts
// ─────────────────────────────────────────────
export interface BlogPost {
  id: string;
  companySlug: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: { name: string; role: string; imageUrl: string };
  publishedAt: string;
  readTime: string;
  image: string;
  isFeatured: boolean;
  status: Status;
  seo: { metaTitle: string; metaDescription: string };
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────
export type EventType = "workshop" | "bootcamp" | "seminar" | "ctf" | "hackathon" | "webinar";
export type EventMode = "online" | "offline" | "hybrid";

export interface Event {
  id: string;
  companySlug: string;
  slug: string;
  title: string;
  type: EventType;
  date: string;
  time: string;
  venue: string;
  mode: EventMode;
  description: string;
  image: string;
  tags: string[];
  registrationLink: string;
  isFree: boolean;
  isFeatured: boolean;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Testimonials
// ─────────────────────────────────────────────
export interface Testimonial {
  id: string;
  companySlug: string;
  name: string;
  role: string;
  company: string;
  companyLogoUrl: string;
  imageUrl: string;
  quote: string;
  programme: string;
  rating: number;
  linkedIn: string;
  isFeatured: boolean;
  status: Status;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Trainers
// ─────────────────────────────────────────────
export interface TrainerCertBadge {
  name: string;
  logoUrl?: string;
}

export interface Trainer {
  id: string;
  companySlug: string;
  slug: string;
  name: string;
  designation: string;
  specialization: string;
  bio: string;
  experience: string;
  certifications: string[];
  certBadges?: TrainerCertBadge[];
  expertise?: string[];
  imageUrl: string;
  linkedIn?: string;
  github?: string;
  twitter?: string;
  courses?: string[];
  isFeatured: boolean;
  status: Status;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// Certificates
// ─────────────────────────────────────────────
export type CertificateStatus = "active" | "revoked" | "expired" | "suspended";
export type CertificateAuditAction =
  | "created" | "updated" | "deleted" | "status_changed"
  | "downloaded" | "qr_regenerated" | "template_changed" | "reissued";

export interface CertificateTemplateField {
  token: string; // one of the 9 supported {{token}} names
  x: number;
  y: number; // px, at canvasWidth/canvasHeight resolution
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  color?: string;
  textAlign?: "left" | "center" | "right";
  width?: number; // qr_code box size in px — unused for text fields
}

export interface CertificateTemplate {
  id: string;
  companySlug: string;
  programmeId: string; // the course this template belongs to (a course can have several distinct templates)
  name: string; // admin-typed, distinguishes multiple templates on the same course
  description?: string;
  mode: "visual" | "raw"; // which authoring UI produced htmlContent
  backgroundImageUrl?: string; // visual-mode base/background image
  canvasWidth?: number; // defaults to 1123 when absent
  canvasHeight?: number; // defaults to 794 when absent
  fields?: CertificateTemplateField[]; // visual-mode field placements — source of truth for re-editing
  htmlContent: string; // always the compiled (visual mode) or hand-authored (raw mode) render source
  isDefault: boolean;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  companySlug: string;
  certificateNumber: string;
  templateId: string;
  programmeId: string; // the course — resolves templateId server-side

  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  studentDob?: string;

  courseName: string; // denormalized display copy, derived from the programme

  issueDate: string;
  startDate?: string;
  endDate?: string;

  status: CertificateStatus;
  statusReason?: string;
  statusChangedAt?: string;

  qrCodePath: string;
  qrCodeBase64?: string; // raw PNG payload (no data: prefix) — for templates that inline the QR via a data URI instead of loading qrCodePath as an external image
  verificationUrl: string;

  signatureAlgorithm: "ed25519";
  signatureValue: string;
  signedDataVersion: 1;

  reissuedFromCertificateId?: string;
  supersededByCertificateId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CertificateAuditLogEntry {
  id: string;
  companySlug: string;
  certificateId: string;
  certificateNumber: string;
  action: CertificateAuditAction;
  actorUserId: string;
  actorEmail: string;
  detail?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────
// Custom Pages
// ─────────────────────────────────────────────
export type PageTemplate = "default" | "landing" | "course" | "blog" | "contact" | "about";

export interface PageSection {
  id: string;
  type: string;
  data: Record<string, unknown>;
  order: number;
}

export interface CustomPage {
  id: string;
  companySlug: string;
  slug: string;
  title: string;
  template: PageTemplate;
  metaTitle: string;
  metaDescription: string;
  sections: PageSection[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// API Response types
// ─────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────
export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  companySlug: string;
  sessionId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  companySlug: string;
}

// ─────────────────────────────────────────────
// Static Page Content Types
// ─────────────────────────────────────────────

export interface AcademyPageContent {
  hero: {
    badge: string;
    headline: string;
    headlineAccent: string;
    description: string;
    primaryCta: { text: string; href: string };
    secondaryCta: { text: string; href: string };
  };
  about: {
    title: string;
    para1: string;
    para2: string;
    bullets: string[];
    mission: string;
    vision: string;
  };
  why: {
    sectionLabel: string;
    title: string;
    items: Array<{ id: string; icon: string; title: string; description: string }>;
  };
  methodology: {
    sectionLabel: string;
    title: string;
    steps: Array<{ step: string; title: string; description: string }>;
  };
  domains: string[];
  labs: {
    title: string;
    description: string;
    bullets: string[];
  };
  trainers: Array<{
    id: string;
    name: string;
    role: string;
    specialization: string;
    exp: string;
    certifications: string;
    imageUrl?: string;
  }>;
  cta: {
    headline: string;
    primaryCta: { text: string; href: string };
    secondaryCta: { text: string; href: string };
  };
  updatedAt: string;
}

export interface CorporatePageContent {
  hero: {
    badge: string;
    headline: string;
    headlineAccent: string;
    description: string;
    primaryCta: { text: string; href: string };
  };
  programs: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
    duration: string;
    mode: string;
    audience: string;
  }>;
  benefits: string[];
  industries: Array<{ id: string; icon: string; name: string }>;
  process: Array<{ step: string; title: string; description: string }>;
  cta: { headline: string; primaryCta: { text: string; href: string } };
  updatedAt: string;
}

export interface InstitutionsPageContent {
  hero: {
    badge: string;
    headline: string;
    headlineAccent: string;
    description: string;
    primaryCta: { text: string; href: string };
    stats: Array<{ value: string; label: string }>;
  };
  services: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
    duration: string;
  }>;
  models: Array<{
    id: string;
    title: string;
    duration: string;
    participants: string;
    cost: string;
  }>;
  cta: { headline: string; description: string };
  updatedAt: string;
}

export interface CareerPageContent {
  hero: {
    headline: string;
    headlineAccent: string;
    description: string;
    stats: Array<{ value: string; label: string }>;
  };
  services: Array<{ id: string; icon: string; title: string; description: string }>;
  journey: Array<{ id: string; step: string; icon: string; title: string; description: string }>;
  roles: string[];
  cta: {
    headline: string;
    primaryCta: { text: string; href: string };
    secondaryCta: { text: string; href: string };
  };
  updatedAt: string;
}
