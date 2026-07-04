import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { isAdmin, forbidden } from "@/lib/permissions";
import { recompressCompanyImages } from "@/lib/recompress-images";

type Params = { params: Promise<{ company: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();

  const { company } = await params;
  const body = await req.json().catch(() => ({}));
  const dryRun = body?.dryRun !== false; // default to dry-run unless explicitly {dryRun: false}

  try {
    const summary = await recompressCompanyImages(company, dryRun);
    return NextResponse.json({ success: true, data: summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[recompress-images]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
