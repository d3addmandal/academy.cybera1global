/**
 * Server-side WhatsApp notification for new form submissions.
 *
 * Supported providers (tried in order):
 *
 *  1. Meta WhatsApp Business Cloud API  — official, reliable, free up to 1 000 conversations/month
 *     Set these in Vercel → Project → Environment Variables:
 *       WHATSAPP_TOKEN          — permanent access token from Meta developer portal
 *       WHATSAPP_PHONE_NUMBER_ID — phone number ID of the sender (from Meta app dashboard)
 *       WHATSAPP_TO_NUMBER      — recipient number with country code, digits only (e.g. 918240006007)
 *
 *  2. CallMeBot  — free, zero business verification, works with personal WhatsApp
 *     Set these in Vercel → Project → Environment Variables:
 *       CALLMEBOT_PHONE   — your WhatsApp number with country code (e.g. +918240006007)
 *       CALLMEBOT_APIKEY  — API key received from CallMeBot
 *     Setup: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 *
 * If neither provider is configured this is a silent no-op.
 */

export interface WhatsAppPayload {
  name: string;
  phone: string;
  email?: string;
  program?: string;
  company?: string;
  city?: string;
  message?: string;
  inquiryType?: string;
  submittedAt?: string;
  companyName?: string;
}

const INQUIRY_LABELS: Record<string, string> = {
  counseling: "Free Counseling",
  corporate: "Corporate Training",
  institutional: "Institutional Partnership",
  course: "Course Enquiry",
  general: "General Enquiry",
};

function formatMessage(d: WhatsAppPayload): string {
  const type = INQUIRY_LABELS[d.inquiryType ?? ""] ?? d.inquiryType ?? "Enquiry";
  const when = new Date(d.submittedAt ?? Date.now()).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const lines: (string | null)[] = [
    `🔔 New ${type} — ${d.companyName ?? "Cyber A1 Academy"}`,
    ``,
    `👤 Name: ${d.name}`,
    `📞 Phone: ${d.phone}`,
    d.email   ? `📧 Email: ${d.email}`           : null,
    d.program ? `🎓 Program: ${d.program}`        : null,
    d.company ? `🏢 Organisation: ${d.company}`   : null,
    d.city    ? `🏙️ City: ${d.city}`             : null,
    d.message ? `📝 Message: ${d.message}`        : null,
    ``,
    `📅 ${when}`,
  ];

  return lines.filter((l): l is string => l !== null).join("\n");
}

// ── Provider 1: Meta WhatsApp Business Cloud API ─────────────────────────────

async function sendViaMeta(message: string): Promise<boolean> {
  const token         = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const toNumber      = (process.env.WHATSAPP_TO_NUMBER ?? "").replace(/\D/g, "");

  if (!token || !phoneNumberId || !toNumber) return false;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: toNumber,
          type: "text",
          text: { body: message },
        }),
        signal: AbortSignal.timeout(10_000),
      }
    );
    if (res.ok) return true;
    const err = await res.text();
    console.error("[whatsapp:meta] send failed:", err);
    return false;
  } catch (err) {
    console.error("[whatsapp:meta] error:", err);
    return false;
  }
}

// ── Provider 2: CallMeBot ─────────────────────────────────────────────────────

async function sendViaCallMeBot(message: string): Promise<boolean> {
  const apiKey = process.env.CALLMEBOT_APIKEY;
  const phone  = process.env.CALLMEBOT_PHONE;

  if (!apiKey || !phone) return false;

  try {
    const url =
      `https://api.callmebot.com/whatsapp.php` +
      `?phone=${encodeURIComponent(phone)}` +
      `&text=${encodeURIComponent(message)}` +
      `&apikey=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (res.ok) return true;
    console.error("[whatsapp:callmebot] send failed:", res.status);
    return false;
  } catch (err) {
    console.error("[whatsapp:callmebot] error:", err);
    return false;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function notifyWhatsApp(payload: WhatsAppPayload): Promise<void> {
  const message = formatMessage(payload);

  const sent = await sendViaMeta(message) || await sendViaCallMeBot(message);

  if (!sent) {
    const hasConfig = !!(
      process.env.WHATSAPP_TOKEN ||
      process.env.CALLMEBOT_APIKEY
    );
    if (hasConfig) {
      console.warn("[whatsapp] notification failed — check provider env vars");
    }
  }
}

/** Returns which providers are configured (for admin status display). */
export function whatsappProviderStatus() {
  return {
    meta: !!(
      process.env.WHATSAPP_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_TO_NUMBER
    ),
    callmebot: !!(
      process.env.CALLMEBOT_APIKEY &&
      process.env.CALLMEBOT_PHONE
    ),
  };
}
