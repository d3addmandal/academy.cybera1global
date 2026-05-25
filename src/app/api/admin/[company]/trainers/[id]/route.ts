import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { trainersDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize";

type Params = { params: Promise<{ company: string; id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company, id } = await params;
  const item = trainersDb.getById(company, id);
  if (!item) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: item });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company, id } = await params;
  const body = await req.json().catch(() => ({}));

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined)           patch.name           = sanitizeText(body.name, 100);
  if (body.designation !== undefined)    patch.designation    = sanitizeText(body.designation, 150);
  if (body.specialization !== undefined) patch.specialization = sanitizeText(body.specialization, 150);
  if (body.bio !== undefined)            patch.bio            = sanitizeText(body.bio, 2000);
  if (body.experience !== undefined)     patch.experience     = sanitizeText(body.experience, 50);
  if (body.imageUrl !== undefined)       patch.imageUrl       = sanitizeUrl(body.imageUrl) ?? "";
  if (body.linkedIn !== undefined)       patch.linkedIn       = body.linkedIn ? sanitizeUrl(body.linkedIn) ?? "" : "";
  if (body.github !== undefined)         patch.github         = body.github ? sanitizeUrl(body.github) ?? "" : "";
  if (body.twitter !== undefined)        patch.twitter        = body.twitter ? sanitizeUrl(body.twitter) ?? "" : "";
  if (body.isFeatured !== undefined)     patch.isFeatured     = Boolean(body.isFeatured);
  if (body.status !== undefined && ["published", "draft", "archived"].includes(body.status))
    patch.status = body.status;
  if (typeof body.order === "number")    patch.order          = body.order;
  if (Array.isArray(body.certifications))
    patch.certifications = body.certifications.map((c: unknown) => sanitizeText(c, 50)).filter(Boolean);
  if (Array.isArray(body.certBadges))
    patch.certBadges = body.certBadges
      .map((b: unknown) => {
        if (typeof b !== "object" || b === null) return null;
        const badge = b as Record<string, unknown>;
        const name = sanitizeText(badge.name, 100);
        if (!name) return null;
        return { name, logoUrl: badge.logoUrl ? (sanitizeUrl(badge.logoUrl as string) ?? "") : "" };
      })
      .filter(Boolean);
  if (Array.isArray(body.expertise))
    patch.expertise = body.expertise.map((e: unknown) => sanitizeText(e, 100)).filter(Boolean);
  if (Array.isArray(body.courses))
    patch.courses = body.courses.map((c: unknown) => sanitizeText(c, 200)).filter(Boolean);

  // Slug change: ensure uniqueness
  if (body.slug !== undefined) {
    const newSlug = sanitizeText(body.slug, 200).replace(/[^a-z0-9-]/g, "");
    if (!newSlug) return NextResponse.json({ success: false, error: "Invalid slug." }, { status: 400 });
    const existing = trainersDb.getBySlug(company, newSlug);
    if (existing && existing.id !== id) {
      return NextResponse.json({ success: false, error: "Slug already taken." }, { status: 409 });
    }
    patch.slug = newSlug;
  }

  const updated = trainersDb.update(company, id, patch);
  if (!updated) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: updated, message: "Trainer updated." });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company, id } = await params;
  if (!trainersDb.delete(company, id)) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, message: "Trainer deleted." });
}
