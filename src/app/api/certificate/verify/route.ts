import { NextRequest, NextResponse } from "next/server";
import { getCRMCertificateByNumber } from "@/lib/content";
import { sanitizeText } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";

// Same message regardless of malformed input vs. genuinely nonexistent number —
// never distinguishable, to avoid giving an enumeration script a signal.
const NOT_FOUND = NextResponse.json(
  { success: false, error: "Certificate not found. Please check the number and try again." },
  { status: 404 }
);

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rateResult = checkRateLimit(`certverify:${ip}`, 20, 60_000);
  if (!rateResult.allowed) {
    return NextResponse.json({ success: false, error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const certificateNumber = sanitizeText(body.certificateNumber, 64).replace(/[^A-Za-z0-9-]/g, "");
  if (!certificateNumber) return NOT_FOUND;

  const certificate = getCRMCertificateByNumber(certificateNumber);
  if (!certificate) return NOT_FOUND;

  return NextResponse.json({ success: true, data: { certificateNumber: certificate.certificateNumber } });
}
