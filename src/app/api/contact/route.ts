import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { settingsDb, contactsDb } from "@/lib/db";
import { sanitizeText, sanitizeEmail, sanitizePhone } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";
import { notifyWhatsApp } from "@/lib/whatsapp";
import { appendToGoogleSheet } from "@/lib/google-sheets";
import { blobHydrate } from "@/lib/blob-db";

const COMPANY = process.env.COMPANY_SLUG ?? "cybera1";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const rateResult = checkRateLimit(`contact:${ip}`, 5, 60_000);
    if (!rateResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait before submitting again." },
        { status: 429, headers: { "Retry-After": String(rateResult.retryAfterSeconds) } }
      );
    }

    // Ensure existing contacts are loaded from Blob before reading/writing.
    // API routes don't go through layout.tsx so blobHydrate must be called here.
    await blobHydrate(COMPANY);

    const body = await req.json().catch(() => ({}));

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
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? undefined,
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
