import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { certificatesDb, certificateAuditLogDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";
import { createCertificateFull } from "@/lib/certificate-create";

type Params = { params: Promise<{ company: string; id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company, id } = await params;
  const original = certificatesDb.getById(company, id);
  if (!original) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const result = await createCertificateFull(company, req.nextUrl.origin, {
    programmeId: original.programmeId,
    templateId: original.templateId,
    studentName: original.studentName,
    studentEmail: original.studentEmail,
    studentPhone: original.studentPhone,
    studentDob: original.studentDob,
    issueDate: new Date().toISOString().slice(0, 10),
    startDate: original.startDate,
    endDate: original.endDate,
    status: "active",
  });

  if (result.error || !result.certificate) {
    return NextResponse.json({ success: false, error: result.error ?? "Failed to reissue certificate." }, { status: 400 });
  }
  const reissued = result.certificate;

  certificatesDb.update(company, reissued.id, { reissuedFromCertificateId: original.id });

  certificatesDb.update(company, original.id, {
    status: "revoked",
    statusReason: "Reissued",
    statusChangedAt: new Date().toISOString(),
    supersededByCertificateId: reissued.id,
  });

  certificateAuditLogDb.append(company, [
    {
      companySlug: company,
      certificateId: original.id,
      certificateNumber: original.certificateNumber,
      action: "reissued",
      actorUserId: auth.userId,
      actorEmail: auth.email,
      detail: `superseded by ${reissued.certificateNumber}`,
    },
    {
      companySlug: company,
      certificateId: reissued.id,
      certificateNumber: reissued.certificateNumber,
      action: "created",
      actorUserId: auth.userId,
      actorEmail: auth.email,
      detail: `reissued from ${original.certificateNumber}`,
    },
  ]);

  return NextResponse.json({ success: true, data: certificatesDb.getById(company, reissued.id), message: "Certificate reissued." }, { status: 201 });
}
