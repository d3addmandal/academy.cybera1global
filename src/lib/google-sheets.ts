/**
 * Google Sheets integration via Google Apps Script Web App.
 *
 * No service account or Google Cloud project needed.
 * The Apps Script Web App acts as a webhook that appends one row per submission.
 *
 * Required Vercel environment variable:
 *   GOOGLE_APPS_SCRIPT_URL — the /exec URL from your deployed Apps Script Web App
 *
 * Setup (one-time, ~3 minutes):
 *   1. Open your Google Sheet → Extensions → Apps Script
 *   2. Paste the doPost() code (shown in Admin → Settings → Google Sheets)
 *   3. Deploy → New deployment → Web App
 *        Execute as: Me  |  Who has access: Anyone
 *   4. Copy the /exec URL → add to Vercel as GOOGLE_APPS_SCRIPT_URL → Redeploy
 */

import type { WhatsAppPayload } from "@/lib/whatsapp";

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

const INQUIRY_LABELS: Record<string, string> = {
  counseling:    "Free Counseling",
  corporate:     "Corporate Training",
  institutional: "Institutional Partnership",
  course:        "Course Enquiry",
  general:       "General Enquiry",
};

export function googleSheetsConfigured(): boolean {
  return !!APPS_SCRIPT_URL;
}

export async function appendToGoogleSheet(payload: WhatsAppPayload): Promise<void> {
  if (!APPS_SCRIPT_URL) return;

  const when = new Date(payload.submittedAt ?? Date.now()).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const body = {
    name:        payload.name,
    phone:       payload.phone,
    email:       payload.email    ?? "",
    city:        payload.city     ?? "",
    program:     payload.program  ?? "",
    company:     payload.company  ?? "",
    inquiryType: INQUIRY_LABELS[payload.inquiryType ?? ""] ?? payload.inquiryType ?? "General Enquiry",
    message:     payload.message  ?? "",
    submittedAt: when,
  };

  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" }, // Apps Script requires text/plain for doPost
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`[google-sheets] Apps Script returned ${res.status}`);
  }
}
