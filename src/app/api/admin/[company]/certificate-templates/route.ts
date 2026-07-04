import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { certificateTemplatesDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";
import { sanitizeText, sanitizeUrl, sanitizeHtml } from "@/lib/sanitize";

type Params = { params: Promise<{ company: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company } = await params;
  const data = certificateTemplatesDb.getAll(company);
  return NextResponse.json({ success: true, data, total: data.length });
}

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company } = await params;
  const body = await req.json().catch(() => ({}));

  const name = sanitizeText(body.name, 150);
  const htmlContent = sanitizeHtml(body.htmlContent, 200_000);
  if (!name || !htmlContent) {
    return NextResponse.json({ success: false, error: "Name and HTML content are required." }, { status: 400 });
  }

  const template = certificateTemplatesDb.create(company, {
    name,
    description: body.description ? sanitizeText(body.description, 500) : undefined,
    htmlContent,
    backgroundImageUrl: body.backgroundImageUrl ? sanitizeUrl(body.backgroundImageUrl) : undefined,
    logoUrl: body.logoUrl ? sanitizeUrl(body.logoUrl) : undefined,
    isDefault: Boolean(body.isDefault),
    status: ["published", "draft", "archived"].includes(body.status) ? body.status : "draft",
  });

  return NextResponse.json({ success: true, data: template, message: "Template created." }, { status: 201 });
}
