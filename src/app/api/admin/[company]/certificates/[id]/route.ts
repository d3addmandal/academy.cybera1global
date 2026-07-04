import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { certificatesDb, certificateAuditLogDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";
import { sanitizeText, sanitizeEmail, sanitizePhone, sanitizeUrl } from "@/lib/sanitize";
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
const SIGNED_FIELDS = ["studentName", "courseName", "issueDate", "organizationName"] as const;

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
  if (body.studentPhotoUrl !== undefined) patch.studentPhotoUrl = body.studentPhotoUrl ? sanitizeUrl(body.studentPhotoUrl) : "";
  if (body.courseName !== undefined) patch.courseName = sanitizeText(body.courseName, 200);
  if (body.courseDescription !== undefined) patch.courseDescription = sanitizeText(body.courseDescription, 2000);
  if (body.issueDate !== undefined) patch.issueDate = sanitizeText(body.issueDate, 30);
  if (body.startDate !== undefined) patch.startDate = sanitizeText(body.startDate, 30);
  if (body.endDate !== undefined) patch.endDate = sanitizeText(body.endDate, 30);
  if (body.validityText !== undefined) patch.validityText = sanitizeText(body.validityText, 100);
  if (body.instructorName !== undefined) patch.instructorName = sanitizeText(body.instructorName, 150);
  if (body.organizationName !== undefined) patch.organizationName = sanitizeText(body.organizationName, 150);
  if (body.organizationLogoUrl !== undefined) patch.organizationLogoUrl = body.organizationLogoUrl ? sanitizeUrl(body.organizationLogoUrl) : "";
  if (body.templateId !== undefined) patch.templateId = sanitizeText(body.templateId, 100);

  const willChangeSignedField = SIGNED_FIELDS.some((f) => f in patch);
  if (willChangeSignedField) {
    const merged = { ...existing, ...patch };
    patch.signatureValue = signCertificateData(
      buildCanonicalString({
        certificateNumber: existing.certificateNumber,
        studentName: merged.studentName,
        courseName: merged.courseName,
        issueDate: merged.issueDate,
        organizationName: merged.organizationName,
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
