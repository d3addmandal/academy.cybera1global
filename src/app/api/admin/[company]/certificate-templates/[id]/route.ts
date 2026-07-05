import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { certificateTemplatesDb, certificatesDb, programmesDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";
import { sanitizeText, sanitizeUrl, sanitizeHtml, sanitizeInt } from "@/lib/sanitize";
import { sanitizeTemplateFields } from "@/lib/certificate-template";

type Params = { params: Promise<{ company: string; id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company, id } = await params;
  const item = certificateTemplatesDb.getById(company, id);
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
  if (body.programmeId !== undefined) {
    const programmeId = sanitizeText(body.programmeId, 100);
    const programme = programmesDb.getById(company, programmeId);
    if (!programme) {
      return NextResponse.json({ success: false, error: "Selected course does not exist." }, { status: 400 });
    }
    patch.programmeId = programme.id;
  }
  if (body.name !== undefined) {
    const name = sanitizeText(body.name, 150);
    if (!name) return NextResponse.json({ success: false, error: "Template name cannot be empty." }, { status: 400 });
    patch.name = name;
  }
  if (body.description !== undefined) patch.description = sanitizeText(body.description, 500);
  if (body.htmlContent !== undefined) patch.htmlContent = sanitizeHtml(body.htmlContent, 200_000);
  if (body.mode === "visual" || body.mode === "raw") patch.mode = body.mode;
  if (body.backgroundImageUrl !== undefined) patch.backgroundImageUrl = body.backgroundImageUrl ? sanitizeUrl(body.backgroundImageUrl) : "";
  if (body.canvasWidth !== undefined) patch.canvasWidth = sanitizeInt(body.canvasWidth, 100, 4000);
  if (body.canvasHeight !== undefined) patch.canvasHeight = sanitizeInt(body.canvasHeight, 100, 4000);
  if (body.fields !== undefined) patch.fields = sanitizeTemplateFields(body.fields);
  if (body.isDefault !== undefined) patch.isDefault = Boolean(body.isDefault);
  if (body.status !== undefined && ["published", "draft", "archived"].includes(body.status)) patch.status = body.status;

  const updated = certificateTemplatesDb.update(company, id, patch);
  if (!updated) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: updated, message: "Template updated." });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company, id } = await params;

  const inUseCount = certificatesDb.getAll(company).filter((c) => c.templateId === id).length;
  if (inUseCount > 0) {
    return NextResponse.json(
      { success: false, error: `This template is used by ${inUseCount} certificate(s) and cannot be deleted.` },
      { status: 409 }
    );
  }

  if (!certificateTemplatesDb.delete(company, id)) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, message: "Template deleted." });
}
