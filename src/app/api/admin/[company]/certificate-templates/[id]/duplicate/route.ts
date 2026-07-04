import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { certificateTemplatesDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";

type Params = { params: Promise<{ company: string; id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company, id } = await params;
  const original = certificateTemplatesDb.getById(company, id);
  if (!original) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const duplicate = certificateTemplatesDb.create(company, {
    programmeId: original.programmeId,
    name: `${original.name} (Copy)`,
    description: original.description,
    htmlContent: original.htmlContent,
    isDefault: false,
    status: "draft",
  });

  return NextResponse.json({ success: true, data: duplicate, message: "Template duplicated." }, { status: 201 });
}
