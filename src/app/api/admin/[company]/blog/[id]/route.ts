import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { blogDb } from "@/lib/db";
import { canWriteBlog, canDeletePublished, canDeleteDraft, forbidden } from "@/lib/permissions";

type Params = { params: Promise<{ company: string; id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { company, id } = await params;
  const item = blogDb.getById(company, id);
  if (!item) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: item });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!canWriteBlog(auth.role)) return forbidden();
  const { company, id } = await params;
  const updated = blogDb.update(company, id, await req.json());
  if (!updated) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: updated, message: "Post updated." });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { company, id } = await params;
  const item = blogDb.getById(company, id);
  if (!item) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  const isPublished = item.status === "published";
  if (isPublished && !canDeletePublished(auth.role)) return forbidden("Only admins can delete published posts.");
  if (!isPublished && !canDeleteDraft(auth.role)) return forbidden("Insufficient permissions to delete this post.");
  blogDb.delete(company, id);
  return NextResponse.json({ success: true, message: "Post deleted." });
}
