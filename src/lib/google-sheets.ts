/**
 * Google Sheets integration — appends one row per form submission.
 *
 * Required Vercel environment variables:
 *   GOOGLE_SHEETS_CLIENT_EMAIL  — service account email from the downloaded JSON key
 *   GOOGLE_SHEETS_PRIVATE_KEY   — private_key from the JSON key (paste as-is; \\n is handled)
 *   GOOGLE_SHEET_ID             — the long ID in the sheet URL between /d/ and /edit
 *
 * Optional:
 *   GOOGLE_SHEET_NAME           — tab name to write to (default: "Sheet1")
 *
 * Setup:
 *   1. Google Cloud Console → APIs & Services → Enable "Google Sheets API"
 *   2. IAM & Admin → Service Accounts → Create → download JSON key
 *   3. Open your Google Sheet → Share → paste the service account email → Editor
 *   4. Add the three env vars to Vercel and redeploy
 *
 * Column order (must match header row you put in row 1 of the sheet):
 *   Name | Phone | Email | City | Program/Course | Organisation | Enquiry Type | Message | Submitted At
 */

import { GoogleAuth } from "google-auth-library";
import type { WhatsAppPayload } from "@/lib/whatsapp";

const CLIENT_EMAIL  = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY   = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
const SHEET_ID      = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME    = process.env.GOOGLE_SHEET_NAME ?? "Sheet1";

const INQUIRY_LABELS: Record<string, string> = {
  counseling:    "Free Counseling",
  corporate:     "Corporate Training",
  institutional: "Institutional Partnership",
  course:        "Course Enquiry",
  general:       "General Enquiry",
};

export function googleSheetsConfigured(): boolean {
  return !!(CLIENT_EMAIL && PRIVATE_KEY && SHEET_ID);
}

let _auth: GoogleAuth | null = null;

function getAuth(): GoogleAuth {
  if (!_auth) {
    _auth = new GoogleAuth({
      credentials: { client_email: CLIENT_EMAIL, private_key: PRIVATE_KEY },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }
  return _auth;
}

export async function appendToGoogleSheet(payload: WhatsAppPayload): Promise<void> {
  if (!googleSheetsConfigured()) return;

  const client = await getAuth().getClient();
  const { token } = await client.getAccessToken();
  if (!token) throw new Error("[google-sheets] failed to obtain access token");

  const when = new Date(payload.submittedAt ?? Date.now()).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const row = [
    payload.name,
    payload.phone,
    payload.email    ?? "",
    payload.city     ?? "",
    payload.program  ?? "",
    payload.company  ?? "",
    INQUIRY_LABELS[payload.inquiryType ?? ""] ?? payload.inquiryType ?? "General Enquiry",
    payload.message  ?? "",
    when,
  ];

  const range = `${SHEET_NAME}!A1`;
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/` +
    `${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [row] }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[google-sheets] append failed:", res.status, err);
    throw new Error(`Google Sheets API error ${res.status}`);
  }
}
