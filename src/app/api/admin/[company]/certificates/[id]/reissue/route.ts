import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { certificatesDb, certificateAuditLogDb } from "@/lib/db";
import { isAdmin, forbidden } from "@/lib/permissions";
import { generateAndStoreQr } from "@/lib/certificate-qr";
import { buildCanonicalString, signCertificateData } from "@/lib/certificate-signing";

type Params = { params: Promise<{ company: string; id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(auth.role)) return forbidden();
  const { company, id } = await params;
  const original = certificatesDb.getById(company, id);
  if (!original) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const reissued = certificatesDb.create(company, {
    templateId: original.templateId,
    studentName: original.studentName,
    studentEmail: original.studentEmail,
    studentPhone: original.studentPhone,
    studentPhotoUrl: original.studentPhotoUrl,
    courseName: original.courseName,
    courseDescription: original.courseDescription,
    issueDate: new Date().toISOString().slice(0, 10),
    startDate: original.startDate,
    endDate: original.endDate,
    validityText: original.validityText,
    instructorName: original.instructorName,
    organizationName: original.organizationName,
    organizationLogoUrl: original.organizationLogoUrl,
    status: "active",
    qrCodePath: "",
    verificationUrl: "",
    signatureAlgorithm: "ed25519",
    signatureValue: "",
    signedDataVersion: 1,
    reissuedFromCertificateId: original.id,
  });

  const verificationUrl = `${req.nextUrl.origin}/certificate/${reissued.certificateNumber}`;
  const qrCodePath = await generateAndStoreQr(company, reissued.id, verificationUrl);
  const signatureValue = signCertificateData(
    buildCanonicalString({
      certificateNumber: reissued.certificateNumber,
      studentName: reissued.studentName,
      courseName: reissued.courseName,
      issueDate: reissued.issueDate,
      organizationName: reissued.organizationName,
    })
  );
  const finalized = certificatesDb.update(company, reissued.id, { qrCodePath, verificationUrl, signatureValue });

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

  return NextResponse.json({ success: true, data: finalized, message: "Certificate reissued." }, { status: 201 });
}
