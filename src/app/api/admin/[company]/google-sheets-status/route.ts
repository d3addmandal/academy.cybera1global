import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { googleSheetsConfigured } from "@/lib/google-sheets";

type Params = { params: Promise<{ company: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  await params;

  return NextResponse.json({
    success: true,
    data: { configured: googleSheetsConfigured() },
  });
}
