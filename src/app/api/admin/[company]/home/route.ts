import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { homeDb } from "@/lib/db";

type Params = { params: Promise<{ company: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { company } = await params;
  // Auto-create with defaults if home.json hasn't been seeded yet
  const data = homeDb.get(company) ?? homeDb.save(company, {});
  return NextResponse.json({ success: true, data });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { company } = await params;
  const body = await req.json();

  const data = homeDb.save(company, body);
  return NextResponse.json({ success: true, data, message: "Home content saved." });
}
