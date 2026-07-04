/**
 * Placeholder substitution engine for certificate HTML/SVG templates.
 *
 * This is the one place admin-authored markup (the template) meets
 * user-supplied data (student name, course name, etc.) — every plain-text
 * token must go through escapeHtml() before being interpolated. Never
 * substitute a data field as raw HTML.
 */

export interface CertificatePlaceholderData {
  student_name: string;
  student_email?: string;
  course_name: string;
  certificate_number: string;
  issue_date: string;
  course_start_date?: string;
  course_end_date?: string;
  qr_code: string;
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

function imageTag(url: string, alt: string): string {
  if (!url) return "";
  return `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" />`;
}

/**
 * Replaces {{token}} placeholders in a certificate template with escaped
 * data. Unknown tokens are left visible verbatim (not silently stripped)
 * so a template author immediately notices a typo while previewing.
 */
export function renderCertificateHtml(templateHtml: string, data: CertificatePlaceholderData): string {
  return templateHtml.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (match, token: string) => {
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
  verification_url: "https://example.com/certificate/CERT-2026-SAMPLE1",
};
