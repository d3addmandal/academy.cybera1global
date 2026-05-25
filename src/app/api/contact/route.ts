import { NextRequest, NextResponse } from "next/server";
import { settingsDb, contactsDb } from "@/lib/db";
import { sanitizeText, sanitizeEmail, sanitizePhone } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";

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

    const body = await req.json().catch(() => ({}));

    const name = sanitizeText(body.name, 100);
    const email = sanitizeEmail(body.email);
    const phone = sanitizePhone(body.phone);
    const city = sanitizeText(body.city, 50);
    const program = sanitizeText(body.program, 200);
    const company = sanitizeText(body.company, 100);
    const message = sanitizeText(body.message, 1000);
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

    let whatsappUrl: string | null = null;
    if (deliveryMethod === "whatsapp" || deliveryMethod === "both") {
      const lines = [
        `New Enquiry - ${settings?.companyName ?? "Cyber A1 Academy"}`,
        ``,
        `Name: ${name}`,
        phone ? `Phone: ${phone}` : null,
        email ? `Email: ${email}` : null,
        program ? `Program: ${program}` : null,
        company ? `Organisation: ${company}` : null,
        city ? `City: ${city}` : null,
        message ? `Message: ${message}` : null,
      ].filter((l): l is string => l !== null);
      whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
    }

    return NextResponse.json({ success: true, data: { id: submission.id, whatsappUrl } });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ success: false, error: "Server error." }, { status: 500 });
  }
}