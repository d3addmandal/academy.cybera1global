import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { settingsDb, contactsDb } from "@/lib/db";
import { sanitizeText, sanitizeEmail, sanitizePhone } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";
import { notifyWhatsApp } from "@/lib/whatsapp";
import { appendToGoogleSheet } from "@/lib/google-sheets";
import { blobHydrate } from "@/lib/blob-db";
import { consumeFormToken } from "@/lib/form-tokens";

const COMPANY = process.env.COMPANY_SLUG ?? "cybera1";

// Generic rejection — same message for all bot/security checks to avoid leaking info
const REJECTED = NextResponse.json({ success: false, error: "Submission rejected. Please refresh the page and try again." }, { status: 403 });

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

    // Rate limit: 3 submissions per 5 minutes per IP (no Retry-After header to avoid leaking timing)
    const rateResult = checkRateLimit(`contact:${ip}`, 3, 5 * 60_000);
    if (!rateResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a few minutes before submitting again." },
        { status: 429 }
      );
    }

    // Ensure existing contacts are loaded from Blob before reading/writing.
    // API routes don't go through layout.tsx so blobHydrate must be called here.
    await blobHydrate(COMPANY);

    const body = await req.json().catch(() => ({}));

    // ── Bot / abuse guards ────────────────────────────────────────────────────

    // 1. Honeypot: hidden field bots fill, legitimate browsers leave empty
    if (body._hp) return REJECTED;

    // 2. One-time HMAC token — prevents replay attacks and scripted submissions
    const tokenResult = consumeFormToken(sanitizeText(body._token, 80) ?? "");
    if (!tokenResult.valid) return REJECTED;

    // 3. Timing: reject submissions faster than 3 seconds (instant-bot speed)
    const formTs = typeof body._t === "number" ? body._t : parseInt(body._t, 10);
    if (!formTs || Date.now() - formTs < 3_000) return REJECTED;

    // ── Sanitise fields ───────────────────────────────────────────────────────
    const name        = sanitizeText(body.name, 100);
    const email       = sanitizeEmail(body.email);
    const phone       = sanitizePhone(body.phone);
    const city        = sanitizeText(body.city, 50);
    const program     = sanitizeText(body.program, 200);
    const company     = sanitizeText(body.company, 100);
    const message     = sanitizeText(body.message, 1000);
    const inquiryType = sanitizeText(body.inquiryType, 50) || "general";

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: "Name and phone are required." }, { status: 400 });
    }

    const submission = contactsDb.create(COMPANY, {
      name, email, phone, city, program, company, message, inquiryType,
      ipAddress: ip,
    });

    const settings = settingsDb.get(COMPANY);
    const deliveryMethod = settings?.inquiry?.deliveryMethod ?? "whatsapp";
    const rawNumber = settings?.inquiry?.whatsappNumber || settings?.whatsapp || "918240006007";
    const whatsappNumber = rawNumber.replace(/\D/g, "");

    // Build wa.me URL so the visitor can also reach out directly
    let whatsappUrl: string | null = null;
    if (deliveryMethod === "whatsapp" || deliveryMethod === "both") {
      const lines = [
        `New Enquiry - ${settings?.companyName ?? "Cyber A1 Academy"}`,
        ``,
        `Name: ${name}`,
        phone   ? `Phone: ${phone}`         : null,
        email   ? `Email: ${email}`         : null,
        program ? `Program: ${program}`     : null,
        company ? `Organisation: ${company}`: null,
        city    ? `City: ${city}`           : null,
        message ? `Message: ${message}`     : null,
      ].filter((l): l is string => l !== null);
      whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
    }

    // Fire-and-forget side effects: WhatsApp notification + Google Sheets append
    const notifyPayload = {
      name, email, phone, city, program, company, message, inquiryType,
      submittedAt: submission.submittedAt,
      companyName: settings?.companyName,
    };

    const sideEffects = Promise.all([
      notifyWhatsApp(notifyPayload).catch((err) => console.error("[contact] WhatsApp notify error:", err)),
      appendToGoogleSheet(notifyPayload).catch((err) => console.error("[contact] Google Sheets error:", err)),
    ]);

    try {
      after(sideEffects);
    } catch {
      // after() unavailable outside request context — side effects still fire normally
    }

    return NextResponse.json({ success: true, data: { id: submission.id, whatsappUrl } });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ success: false, error: "Server error." }, { status: 500 });
  }
}
