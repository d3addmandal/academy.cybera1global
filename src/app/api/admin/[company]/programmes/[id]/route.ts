import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { programmesDb } from "@/lib/db";
import { canWriteProgramme, canDeletePublished, canDeleteDraft, forbidden } from "@/lib/permissions";

type Params = { params: Promise<{ company: string; id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { company, id } = await params;
  const item = programmesDb.getById(company, id);
  if (!item) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: item });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!canWriteProgramme(auth.role)) return forbidden();
  const { company, id } = await params;
  const body = await req.json();
  const updated = programmesDb.update(company, id, body);
  if (!updated) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: updated, message: "Programme updated." });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { company, id } = await params;
  const item = programmesDb.getById(company, id);
  if (!item) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  const isPublished = item.status === "published";
  if (isPublished && !canDeletePublished(auth.role)) return forbidden("Only admins can delete published programmes.");
  if (!isPublished && !canDeleteDraft(auth.role)) return forbidden("Insufficient permissions to delete this programme.");
  programmesDb.delete(company, id);
  return NextResponse.json({ success: true, message: "Programme deleted." });
}
