import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { pagesDb } from "@/lib/db";

type Params = { params: Promise<{ company: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { company } = await params;
  return NextResponse.json({ success: true, data: pagesDb.getAll(company) });
}

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { company } = await params;
  const body = await req.json();
  if (!body.slug || !body.title) return NextResponse.json({ success: false, error: "Slug and title required." }, { status: 400 });
  return NextResponse.json({ success: true, data: pagesDb.create(company, body), message: "Page created." }, { status: 201 });
}
