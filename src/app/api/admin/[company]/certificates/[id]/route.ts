import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { certificatesDb, certificateAuditLogDb, certificateTemplatesDb, programmesDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";
import { sanitizeText, sanitizeEmail, sanitizePhone } from "@/lib/sanitize";
import { buildCanonicalString, signCertificateData } from "@/lib/certificate-signing";

type Params = { params: Promise<{ company: string; id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company, id } = await params;
  const item = certificatesDb.getById(company, id);
  if (!item) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, data: item });
}

// Fields that feed the signed canonical string — editing any of these re-signs the certificate.
const SIGNED_FIELDS = ["studentName", "courseName", "issueDate"] as const;

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company, id } = await params;
  const existing = certificatesDb.getById(company, id);
  if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));

  const patch: Record<string, unknown> = {};
  if (body.studentName !== undefined) patch.studentName = sanitizeText(body.studentName, 150);
  if (body.studentEmail !== undefined) patch.studentEmail = body.studentEmail ? sanitizeEmail(body.studentEmail) : "";
  if (body.studentPhone !== undefined) patch.studentPhone = body.studentPhone ? sanitizePhone(body.studentPhone) : "";
  if (body.studentDob !== undefined) patch.studentDob = body.studentDob ? sanitizeText(body.studentDob, 30) : "";
  if (body.issueDate !== undefined) patch.issueDate = sanitizeText(body.issueDate, 30);
  if (body.startDate !== undefined) patch.startDate = sanitizeText(body.startDate, 30);
  if (body.endDate !== undefined) patch.endDate = sanitizeText(body.endDate, 30);

  let targetProgrammeId = existing.programmeId;
  if (body.programmeId !== undefined) {
    const programmeId = sanitizeText(body.programmeId, 100);
    const programme = programmesDb.getById(company, programmeId);
    if (!programme) {
      return NextResponse.json({ success: false, error: "Selected course does not exist." }, { status: 400 });
    }
    patch.programmeId = programme.id;
    patch.courseName = programme.title;
    targetProgrammeId = programme.id;
  }

  const courseTemplates = certificateTemplatesDb.getAll(company).filter((t) => t.programmeId === targetProgrammeId);
  if (body.templateId !== undefined) {
    const templateId = sanitizeText(body.templateId, 100);
    const chosen = courseTemplates.find((t) => t.id === templateId);
    if (!chosen) {
      return NextResponse.json({ success: false, error: "Selected template does not belong to this course." }, { status: 400 });
    }
    patch.templateId = chosen.id;
  } else if (body.programmeId !== undefined) {
    // Course changed but no explicit template chosen — fall back to the course's first template.
    const fallback = courseTemplates[0];
    if (!fallback) {
      const programmeName = (patch.courseName as string) ?? existing.courseName;
      return NextResponse.json(
        { success: false, error: `No certificate template configured for "${programmeName}". Create one under Certificate Templates first.` },
        { status: 400 }
      );
    }
    patch.templateId = fallback.id;
  }

  const willChangeSignedField = SIGNED_FIELDS.some((f) => f in patch);
  if (willChangeSignedField) {
    const merged = { ...existing, ...patch };
    patch.signatureValue = signCertificateData(
      buildCanonicalString({
        certificateNumber: existing.certificateNumber,
        studentName: merged.studentName,
        courseName: merged.courseName,
        issueDate: merged.issueDate,
      })
    );
  }

  const updated = certificatesDb.update(company, id, patch);
  if (!updated) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  certificateAuditLogDb.append(company, [{
    companySlug: company,
    certificateId: id,
    certificateNumber: existing.certificateNumber,
    action: "updated",
    actorUserId: auth.userId,
    actorEmail: auth.email,
  }]);

  return NextResponse.json({ success: true, data: updated, message: "Certificate updated." });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company, id } = await params;
  const existing = certificatesDb.getById(company, id);
  if (!existing) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  certificateAuditLogDb.append(company, [{
    companySlug: company,
    certificateId: id,
    certificateNumber: existing.certificateNumber,
    action: "deleted",
    actorUserId: auth.userId,
    actorEmail: auth.email,
  }]);

  if (!certificatesDb.delete(company, id)) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true, message: "Certificate deleted." });
}
