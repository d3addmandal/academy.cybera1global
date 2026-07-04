import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { certificatesDb, certificateTemplatesDb, certificateAuditLogDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";
import { sanitizeText, sanitizeEmail, sanitizePhone, sanitizeUrl } from "@/lib/sanitize";
import { generateAndStoreQr } from "@/lib/certificate-qr";
import { buildCanonicalString, signCertificateData } from "@/lib/certificate-signing";
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
  const courseName = sanitizeText(body.courseName, 200);
  const organizationName = sanitizeText(body.organizationName, 150);
  const templateId = sanitizeText(body.templateId, 100);
  const issueDate = sanitizeText(body.issueDate, 30);

  if (!studentName || !courseName || !organizationName || !templateId || !issueDate) {
    return NextResponse.json(
      { success: false, error: "Student name, course name, organization, template, and issue date are required." },
      { status: 400 }
    );
  }

  const template = certificateTemplatesDb.getById(company, templateId);
  if (!template) {
    return NextResponse.json({ success: false, error: "Selected certificate template does not exist." }, { status: 400 });
  }

  let certificateNumber: string | undefined;
  if (body.certificateNumber) {
    certificateNumber = sanitizeText(body.certificateNumber, 64).replace(/[^A-Za-z0-9-]/g, "");
    if (certificatesDb.getByCertificateNumber(company, certificateNumber)) {
      return NextResponse.json({ success: false, error: "A certificate with this number already exists." }, { status: 409 });
    }
  }

  const status: CertificateStatus = CERT_STATUSES.includes(body.status) ? body.status : "active";

  const certificate = certificatesDb.create(company, {
    certificateNumber,
    templateId,
    studentName,
    studentEmail: body.studentEmail ? sanitizeEmail(body.studentEmail) : undefined,
    studentPhone: body.studentPhone ? sanitizePhone(body.studentPhone) : undefined,
    studentPhotoUrl: body.studentPhotoUrl ? sanitizeUrl(body.studentPhotoUrl) : undefined,
    courseName,
    courseDescription: body.courseDescription ? sanitizeText(body.courseDescription, 2000) : undefined,
    issueDate,
    startDate: body.startDate ? sanitizeText(body.startDate, 30) : undefined,
    endDate: body.endDate ? sanitizeText(body.endDate, 30) : undefined,
    validityText: body.validityText ? sanitizeText(body.validityText, 100) : undefined,
    instructorName: body.instructorName ? sanitizeText(body.instructorName, 150) : undefined,
    organizationName,
    organizationLogoUrl: body.organizationLogoUrl ? sanitizeUrl(body.organizationLogoUrl) : undefined,
    status,
    qrCodePath: "",
    verificationUrl: "",
    signatureAlgorithm: "ed25519",
    signatureValue: "",
    signedDataVersion: 1,
  });

  // QR + signature both depend on the finalized certificateNumber, which is only
  // known after create() returns (it may have been auto-generated) — so these are
  // filled in via one follow-up update rather than looping create()/generation.
  const verificationUrl = `${req.nextUrl.origin}/certificate/${certificate.certificateNumber}`;
  const qrCodePath = await generateAndStoreQr(company, certificate.id, verificationUrl);
  const signatureValue = signCertificateData(
    buildCanonicalString({
      certificateNumber: certificate.certificateNumber,
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      issueDate: certificate.issueDate,
      organizationName: certificate.organizationName,
    })
  );

  const finalized = certificatesDb.update(company, certificate.id, { qrCodePath, verificationUrl, signatureValue });

  certificateAuditLogDb.append(company, [{
    companySlug: company,
    certificateId: certificate.id,
    certificateNumber: certificate.certificateNumber,
    action: "created",
    actorUserId: auth.userId,
    actorEmail: auth.email,
  }]);

  return NextResponse.json({ success: true, data: finalized, message: "Certificate created." }, { status: 201 });
}
