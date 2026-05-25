import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { trainersDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize";

type Params = { params: Promise<{ company: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company } = await params;
  const data = trainersDb.getAll(company);
  return NextResponse.json({ success: true, data, total: data.length });
}

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company } = await params;
  const body = await req.json().catch(() => ({}));

  const name = sanitizeText(body.name, 100);
  const slug = sanitizeText(body.slug, 200).replace(/[^a-z0-9-]/g, "");
  if (!name || !slug) {
    return NextResponse.json({ success: false, error: "Name and slug are required." }, { status: 400 });
  }

  // Prevent duplicate slugs
  if (trainersDb.getBySlug(company, slug)) {
    return NextResponse.json({ success: false, error: "A trainer with this slug already exists." }, { status: 409 });
  }

  const trainer = trainersDb.create(company, {
    slug,
    name,
    designation: sanitizeText(body.designation, 150),
    specialization: sanitizeText(body.specialization, 150),
    bio: sanitizeText(body.bio, 2000),
    experience: sanitizeText(body.experience, 50),
    certifications: Array.isArray(body.certifications)
      ? body.certifications.map((c: unknown) => sanitizeText(c, 50)).filter(Boolean)
      : [],
    certBadges: Array.isArray(body.certBadges)
      ? body.certBadges
          .map((b: unknown) => {
            if (typeof b !== "object" || b === null) return null;
            const badge = b as Record<string, unknown>;
            const name = sanitizeText(badge.name, 100);
            if (!name) return null;
            return { name, logoUrl: badge.logoUrl ? (sanitizeUrl(badge.logoUrl as string) ?? "") : "" };
          })
          .filter(Boolean)
      : [],
    expertise: Array.isArray(body.expertise)
      ? body.expertise.map((e: unknown) => sanitizeText(e, 100)).filter(Boolean)
      : [],
    imageUrl: sanitizeUrl(body.imageUrl) ?? "",
    linkedIn: body.linkedIn ? sanitizeUrl(body.linkedIn) ?? "" : undefined,
    github: body.github ? sanitizeUrl(body.github) ?? "" : undefined,
    twitter: body.twitter ? sanitizeUrl(body.twitter) ?? "" : undefined,
    courses: Array.isArray(body.courses)
      ? body.courses.map((c: unknown) => sanitizeText(c, 200)).filter(Boolean)
      : [],
    isFeatured: Boolean(body.isFeatured),
    status: ["published", "draft", "archived"].includes(body.status) ? body.status : "draft",
    order: typeof body.order === "number" ? body.order : 0,
  });

  return NextResponse.json({ success: true, data: trainer, message: "Trainer created." }, { status: 201 });
}
