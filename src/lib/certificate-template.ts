/**
 * Placeholder substitution engine for certificate HTML/SVG templates.
 *
 * This is the one place admin-authored markup (the template) meets
 * user-supplied data (student name, course name, etc.) — every plain-text
 * token must go through escapeHtml() before being interpolated. Never
 * substitute a data field as raw HTML.
 */

import type { CertificateTemplateField } from "@/types/cms";

/** Shared metadata for the 9 supported {{token}}s — single source of truth for the visual-builder palette and the raw-mode reference card. */
export const CERTIFICATE_TOKENS: { token: string; label: string; description: string }[] = [
  { token: "student_name", label: "Student Name", description: "Student's full name" },
  { token: "student_email", label: "Student Email", description: "Student's email (if provided)" },
  { token: "course_name", label: "Course Name", description: "Course/programme name" },
  { token: "certificate_number", label: "Certificate Number", description: "Unique certificate number" },
  { token: "issue_date", label: "Issue Date", description: "Certificate issue date" },
  { token: "course_start_date", label: "Course Start Date", description: "Course start date" },
  { token: "course_end_date", label: "Course End Date", description: "Course end date" },
  { token: "qr_code", label: "QR Code", description: "Verification QR code image" },
  { token: "verification_url", label: "Verification URL", description: "Public verification link" },
];

export interface CertificatePlaceholderData {
  student_name: string;
  student_email?: string;
  course_name: string;
  certificate_number: string;
  issue_date: string;
  course_start_date?: string;
  course_end_date?: string;
  qr_code: string;
  /** Raw base64 PNG payload (no data: prefix) — for templates that build their own `href="data:image/png;base64,{{qr_code_base64}}"` rather than using the {{qr_code}} <image> tag. */
  qr_code_base64?: string;
  verification_url: string;
}

const IMAGE_TOKENS = new Set(["qr_code"]);

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Tag name is "image", not "img": per the HTML5 parsing spec, a bare <image> start
// tag outside SVG foreign content is auto-corrected to <img> (attributes kept as-is),
// while inside a <svg>...</svg> template it parses as the real SVG <image> element.
// Carrying both `src` (for the <img> case) and `href`/`xlink:href` (for the SVG case)
// makes the same token markup work whether the template is HTML or raw SVG.
function imageTag(url: string, alt: string): string {
  if (!url) return "";
  const safeUrl = escapeHtml(url);
  return `<image src="${safeUrl}" href="${safeUrl}" xlink:href="${safeUrl}" alt="${escapeHtml(alt)}" />`;
}

/**
 * Replaces {{token}} placeholders in a certificate template with escaped
 * data. Unknown tokens are left visible verbatim (not silently stripped)
 * so a template author immediately notices a typo while previewing.
 */
export function renderCertificateHtml(templateHtml: string, data: CertificatePlaceholderData): string {
  return templateHtml.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/g, (match, token: string) => {
    if (!(token in data)) return match;
    const value = data[token as keyof CertificatePlaceholderData];

    if (IMAGE_TOKENS.has(token)) {
      return imageTag(String(value ?? ""), token.replace(/_/g, " "));
    }
    return escapeHtml(value);
  });
}

/** Minimal shape needed to build placeholder data — matches (a subset of) the Certificate record. */
export interface CertificateLikeRecord {
  studentName: string;
  studentEmail?: string;
  courseName: string;
  certificateNumber: string;
  issueDate: string;
  startDate?: string;
  endDate?: string;
  qrCodePath: string;
  qrCodeBase64?: string;
  verificationUrl: string;
}

/** Maps a Certificate record's field names to the {{token}} names used in templates. */
export function toPlaceholderData(cert: CertificateLikeRecord): CertificatePlaceholderData {
  return {
    student_name: cert.studentName,
    student_email: cert.studentEmail,
    course_name: cert.courseName,
    certificate_number: cert.certificateNumber,
    issue_date: cert.issueDate,
    course_start_date: cert.startDate,
    course_end_date: cert.endDate,
    qr_code: cert.qrCodePath,
    qr_code_base64: cert.qrCodeBase64,
    verification_url: cert.verificationUrl,
  };
}

/** Sample data for template preview while authoring (no real certificate exists yet). */
export const SAMPLE_PLACEHOLDER_DATA: CertificatePlaceholderData = {
  student_name: "Jordan Smith",
  student_email: "jordan.smith@example.com",
  course_name: "Certified Ethical Hacker",
  certificate_number: "CERT-2026-SAMPLE1",
  issue_date: new Date().toISOString().slice(0, 10),
  course_start_date: "2026-01-01",
  course_end_date: "2026-03-01",
  qr_code: "",
  qr_code_base64: "",
  verification_url: "https://example.com/certificate/CERT-2026-SAMPLE1",
};

export const DEFAULT_CANVAS_WIDTH = 1123;
export const DEFAULT_CANVAS_HEIGHT = 794;

const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

function safeNum(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

function safeColor(value: unknown, fallback: string): string {
  return typeof value === "string" && HEX_COLOR.test(value) ? value : fallback;
}

function safeAlign(value: unknown): "left" | "center" | "right" {
  return value === "center" || value === "right" ? value : "left";
}

const VALID_TOKENS = new Set(CERTIFICATE_TOKENS.map((t) => t.token));

/**
 * Server-side validation for a visual-builder `fields` array submitted from the CRM —
 * this is admin-authenticated input, but still untrusted shape/range-wise before it's
 * written to disk and later interpolated (via compileCertificateTemplateHtml) into inline
 * CSS. Drops anything malformed instead of rejecting the whole request.
 */
export function sanitizeTemplateFields(value: unknown): CertificateTemplateField[] {
  if (!Array.isArray(value)) return [];
  const out: CertificateTemplateField[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;
    if (typeof item.token !== "string" || !VALID_TOKENS.has(item.token)) continue;
    const x = Number(item.x);
    const y = Number(item.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

    const field: CertificateTemplateField = { token: item.token, x: Math.round(x), y: Math.round(y) };

    const fontSize = Number(item.fontSize);
    if (Number.isFinite(fontSize)) field.fontSize = Math.max(6, Math.min(200, Math.round(fontSize)));

    const width = Number(item.width);
    if (Number.isFinite(width)) field.width = Math.max(10, Math.min(2000, Math.round(width)));

    if (item.fontWeight === "bold" || item.fontWeight === "normal") field.fontWeight = item.fontWeight;
    if (typeof item.color === "string" && HEX_COLOR.test(item.color)) field.color = item.color;
    if (item.textAlign === "left" || item.textAlign === "center" || item.textAlign === "right") field.textAlign = item.textAlign;

    out.push(field);
  }
  return out.slice(0, 20);
}

export interface CompileTemplateInput {
  backgroundImageUrl?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  fields: CertificateTemplateField[];
}

/**
 * Turns a visual-builder field layout into the same absolute-positioned HTML
 * a raw-mode admin would type by hand — {{token}} placeholders included — so
 * it flows through the exact same renderCertificateHtml()/sanitizeHtml()/PDF
 * pipeline as every other template, visual or raw.
 */
export function compileCertificateTemplateHtml({
  backgroundImageUrl, canvasWidth, canvasHeight, fields,
}: CompileTemplateInput): string {
  const width = safeNum(canvasWidth, DEFAULT_CANVAS_WIDTH);
  const height = safeNum(canvasHeight, DEFAULT_CANVAS_HEIGHT);

  // A CSS background-image (not an <img> with object-fit) — html2canvas (used for PDF
  // generation) doesn't respect object-fit on <img> elements, rendering the image at its
  // native size instead of stretched to fill, which left the rest of the canvas blank.
  // background-size:cover is a normal part of html2canvas's rendering model and works.
  const backgroundTag = backgroundImageUrl
    ? `<div style="position:absolute;top:0;left:0;width:100%;height:100%;background-image:url('${escapeHtml(backgroundImageUrl)}');background-size:cover;background-position:center;background-repeat:no-repeat;"></div>`
    : "";

  const fieldTags = fields.map((field) => {
    const x = safeNum(field.x, 0);
    const y = safeNum(field.y, 0);

    if (field.token === "qr_code") {
      const size = safeNum(field.width, 100);
      const scale = size / 480;
      return `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;overflow:hidden;"><div style="width:480px;height:480px;transform:scale(${scale});transform-origin:top left;">{{qr_code}}</div></div>`;
    }

    const fontSize = safeNum(field.fontSize, 20);
    const fontWeight = field.fontWeight === "bold" ? "bold" : "normal";
    const color = safeColor(field.color, "#111111");
    const textAlign = safeAlign(field.textAlign);
    const token = escapeHtml(field.token).replace(/[^a-z0-9_]/g, "");

    return `<div style="position:absolute;left:${x}px;top:${y}px;font-family:Arial,Helvetica,sans-serif;font-size:${fontSize}px;font-weight:${fontWeight};color:${color};text-align:${textAlign};white-space:nowrap;">{{${token}}}</div>`;
  }).join("\n  ");

  return `<div style="position:relative;width:${width}px;height:${height}px;background:#ffffff;overflow:hidden;">
  ${backgroundTag}
  ${fieldTags}
</div>`;
}
