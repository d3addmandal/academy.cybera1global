import { certificatesDb, certificateTemplatesDb, programmesDb } from "@/lib/db";
import { generateAndStoreQr } from "@/lib/certificate-qr";
import { buildCanonicalString, signCertificateData } from "@/lib/certificate-signing";
import type { Certificate, CertificateStatus } from "@/types/cms";

/**
 * Shared certificate-creation flow used by the single-create route, reissue,
 * and bulk import — course (programmeId) resolves the template server-side,
 * so callers never supply a templateId directly.
 */

export interface CertificateInput {
  programmeId: string;
  /** Optional explicit template choice — must belong to programmeId. Falls back to the course's first matching template when omitted. */
  templateId?: string;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  studentDob?: string;
  issueDate: string;
  startDate?: string;
  endDate?: string;
  status?: CertificateStatus;
  certificateNumber?: string;
}

export interface CreateCertificateResult {
  certificate?: Certificate;
  error?: string;
}

export async function createCertificateFull(
  company: string,
  origin: string,
  input: CertificateInput
): Promise<CreateCertificateResult> {
  const programme = programmesDb.getById(company, input.programmeId);
  if (!programme) return { error: "Selected course does not exist." };

  const courseTemplates = certificateTemplatesDb.getAll(company).filter((t) => t.programmeId === input.programmeId);
  let template = courseTemplates[0];
  if (input.templateId) {
    const chosen = courseTemplates.find((t) => t.id === input.templateId);
    if (!chosen) return { error: "Selected template does not belong to this course." };
    template = chosen;
  }
  if (!template) {
    return { error: `No certificate template configured for "${programme.title}". Create one under Certificate Templates first.` };
  }

  if (input.certificateNumber && certificatesDb.getByCertificateNumber(company, input.certificateNumber)) {
    return { error: "A certificate with this number already exists." };
  }

  const certificate = certificatesDb.create(company, {
    certificateNumber: input.certificateNumber,
    templateId: template.id,
    programmeId: programme.id,
    courseName: programme.title,
    studentName: input.studentName,
    studentEmail: input.studentEmail,
    studentPhone: input.studentPhone,
    studentDob: input.studentDob,
    issueDate: input.issueDate,
    startDate: input.startDate,
    endDate: input.endDate,
    status: input.status ?? "active",
    qrCodePath: "",
    verificationUrl: "",
    signatureAlgorithm: "ed25519",
    signatureValue: "",
    signedDataVersion: 1,
  });

  const verificationUrl = `${origin}/certificate/${certificate.certificateNumber}`;
  const qr = await generateAndStoreQr(company, certificate.id, verificationUrl);
  const signatureValue = signCertificateData(
    buildCanonicalString({
      certificateNumber: certificate.certificateNumber,
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      issueDate: certificate.issueDate,
    })
  );

  const finalized = certificatesDb.update(company, certificate.id, {
    qrCodePath: qr.url,
    qrCodeBase64: qr.base64,
    verificationUrl,
    signatureValue,
  });
  return { certificate: finalized ?? certificate };
}
