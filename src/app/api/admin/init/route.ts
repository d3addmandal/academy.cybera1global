import { NextRequest, NextResponse } from "next/server";
import { companyExists } from "@/lib/db";
import { blobHydrate } from "@/lib/blob-db";
import { seedCompany } from "@/lib/seed";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const rateResult = checkRateLimit(`init:${ip}`, 3, 60 * 60_000);
    if (!rateResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many initialization requests." },
        { status: 429 }
      );
    }

    const { companySlug } = await req.json();
    if (!companySlug) {
      return NextResponse.json({ success: false, error: "companySlug required" }, { status: 400 });
    }
    await blobHydrate(companySlug);
    if (companyExists(companySlug)) {
      return NextResponse.json({ success: true, message: "Company already initialized.", alreadyExists: true });
    }
    const { email } = await seedCompany(companySlug);
    return NextResponse.json({
      success: true,
      message: "Company initialized. Check server logs for the initial admin credentials.",
      loginEmail: email,
      loginUrl: `/webapplication/${companySlug}/admin-edu-${companySlug}/login`,
    });
  } catch (err) {
    console.error("[init]", err);
    return NextResponse.json({ success: false, error: "Server error." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const companySlug = new URL(req.url).searchParams.get("company") ?? "cybera1";
  await blobHydrate(companySlug);
  const exists = companyExists(companySlug);
  return NextResponse.json({ exists, companySlug });
}
