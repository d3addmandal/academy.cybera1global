import { NextRequest, NextResponse } from "next/server";
import { companyExists } from "@/lib/db";
import { seedCompany } from "@/lib/seed";

export async function POST(req: NextRequest) {
  try {
    const { companySlug } = await req.json();
    if (!companySlug) {
      return NextResponse.json({ success: false, error: "companySlug required" }, { status: 400 });
    }
    if (companyExists(companySlug)) {
      return NextResponse.json({ success: true, message: "Company already initialized.", alreadyExists: true });
    }
    const credentials = await seedCompany(companySlug);
    return NextResponse.json({
      success: true,
      message: "Company initialized successfully.",
      credentials,
      loginUrl: `/webapplication/${companySlug}/admin-edu-${companySlug}/login`,
    });
  } catch (err) {
    console.error("[init]", err);
    return NextResponse.json({ success: false, error: "Server error." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const companySlug = new URL(req.url).searchParams.get("company") ?? "cybera1";
  const exists = companyExists(companySlug);
  return NextResponse.json({ exists, companySlug });
}
