import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { certificatesDb, certificateAuditLogDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";
import { sanitizeText, sanitizeEmail, sanitizePhone } from "@/lib/sanitize";
import { createCertificateFull } from "@/lib/certificate-create";
import type { CertificateStatus } from "@/types/cms";

type Params = { params: Promise<{ company: string }> };

const CERT_STATUSES: CertificateStatus[] = ["active", "revoked", "expired", "suspended"];

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company } = await params;
  const data = certificatesDb.getAll(company);
  return NextResponse.json({ success: true, data, total: data.length });
}

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company } = await params;
  const body = await req.json().catch(() => ({}));

  const studentName = sanitizeText(body.studentName, 150);
  const programmeId = sanitizeText(body.programmeId, 100);
  const issueDate = sanitizeText(body.issueDate, 30);

  if (!studentName || !programmeId || !issueDate) {
    return NextResponse.json(
      { success: false, error: "Student name, course, and issue date are required." },
      { status: 400 }
    );
  }

  const status: CertificateStatus = CERT_STATUSES.includes(body.status) ? body.status : "active";
  let certificateNumber: string | undefined;
  if (body.certificateNumber) {
    certificateNumber = sanitizeText(body.certificateNumber, 64).replace(/[^A-Za-z0-9-]/g, "");
  }

  const result = await createCertificateFull(company, req.nextUrl.origin, {
    programmeId,
    studentName,
    studentEmail: body.studentEmail ? sanitizeEmail(body.studentEmail) : undefined,
    studentPhone: body.studentPhone ? sanitizePhone(body.studentPhone) : undefined,
    studentDob: body.studentDob ? sanitizeText(body.studentDob, 30) : undefined,
    issueDate,
    startDate: body.startDate ? sanitizeText(body.startDate, 30) : undefined,
    endDate: body.endDate ? sanitizeText(body.endDate, 30) : undefined,
    status,
    certificateNumber,
  });

  if (result.error || !result.certificate) {
    return NextResponse.json({ success: false, error: result.error ?? "Failed to create certificate." }, { status: 400 });
  }

  certificateAuditLogDb.append(company, [{
    companySlug: company,
    certificateId: result.certificate.id,
    certificateNumber: result.certificate.certificateNumber,
    action: "created",
    actorUserId: auth.userId,
    actorEmail: auth.email,
  }]);

  return NextResponse.json({ success: true, data: result.certificate, message: "Certificate created." }, { status: 201 });
}
