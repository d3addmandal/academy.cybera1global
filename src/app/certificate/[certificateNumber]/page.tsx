export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ShieldCheck, ShieldOff, ShieldAlert, ShieldQuestion, CalendarDays, User, BadgeCheck } from "lucide-react";
import { getCRMCertificateByNumber, getCRMCertificateTemplate, getSiteTheme, COMPANY_SLUG } from "@/lib/content";
import { renderCertificateHtml, toPlaceholderData, DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from "@/lib/certificate-template";
import { checkRateLimit } from "@/lib/rate-limit";
import { blobHydrate, invalidateHydration } from "@/lib/blob-db";
import CertificateViewer from "./CertificateViewer";
import type { CertificateStatus } from "@/types/cms";

interface Props {
  params: Promise<{ certificateNumber: string }>;
}

const STATUS_META: Record<CertificateStatus, { label: string; icon: typeof ShieldCheck; color: string; bg: string; message?: string }> = {
  active: { label: "Verified", icon: ShieldCheck, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  revoked: { label: "Revoked", icon: ShieldOff, color: "text-red-700", bg: "bg-red-50 border-red-200", message: "This certificate has been revoked and is no longer valid." },
  expired: { label: "Expired", icon: ShieldQuestion, color: "text-slate-600", bg: "bg-slate-100 border-slate-200", message: "This certificate has expired." },
  suspended: { label: "Suspended", icon: ShieldAlert, color: "text-amber-700", bg: "bg-amber-50 border-amber-200", message: "This certificate is currently suspended pending review." },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { certificateNumber } = await params;
  const certificate = getCRMCertificateByNumber(certificateNumber);
  if (!certificate) return { title: "Certificate Not Found" };
  return { title: `Certificate Verification — ${certificate.studentName}`, robots: { index: false, follow: false } };
}

export default async function CertificateVerificationPage({ params }: Props) {
  const { certificateNumber: rawNumber } = await params;

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rateResult = checkRateLimit(`certpage:${ip}`, 30, 60_000);
  if (!rateResult.allowed) {
    return (
      <div className="pt-32 pb-20 text-center site-container">
        <p className="text-gray-500">Too many requests. Please try again shortly.</p>
      </div>
    );
  }

  const certificateNumber = rawNumber.replace(/[^A-Za-z0-9-]/g, "");
  let certificate = getCRMCertificateByNumber(certificateNumber);
  if (!certificate) {
    // A certificate created moments ago on a different serverless container can be briefly
    // invisible here until this container's next scheduled Blob re-hydration (bounded by
    // HYDRATE_TTL_MS in blob-db.ts). Certificate verification is a public trust feature, so
    // force one immediate re-check against Blob before treating this as a genuine miss.
    invalidateHydration(COMPANY_SLUG);
    await blobHydrate(COMPANY_SLUG);
    certificate = getCRMCertificateByNumber(certificateNumber);
  }
  if (!certificate) notFound();

  const template = getCRMCertificateTemplate(certificate.templateId);
  const theme = getSiteTheme();
  const certificateHtml = template ? renderCertificateHtml(template.htmlContent, toPlaceholderData(certificate)) : "";
  const meta = STATUS_META[certificate.status];
  const StatusIcon = meta.icon;

  return (
    <div className="pt-28 pb-20 bg-gray-50 min-h-screen">
      <div className="site-container max-w-4xl">
        {theme?.logo?.imageUrl && (
          <img src={theme.logo.imageUrl} alt="Certificate issuer logo" className="h-10 mx-auto mb-6" />
        )}

        <div className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-4 mb-6 ${meta.bg}`}>
          <StatusIcon className={`w-6 h-6 ${meta.color}`} />
          <span className={`text-lg font-black ${meta.color}`}>{meta.label}</span>
        </div>

        {meta.message && (
          <p className="text-center text-sm font-medium text-gray-600 mb-6 -mt-3">{meta.message}</p>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-8">
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <DetailRow icon={User} label="Student Name" value={certificate.studentName} />
            <DetailRow icon={BadgeCheck} label="Course Name" value={certificate.courseName} />
            <DetailRow icon={BadgeCheck} label="Certificate Number" value={certificate.certificateNumber} mono />
            <DetailRow icon={CalendarDays} label="Issue Date" value={certificate.issueDate} />
            {certificate.startDate && <DetailRow icon={CalendarDays} label="Course Start" value={certificate.startDate} />}
            {certificate.endDate && <DetailRow icon={CalendarDays} label="Course End" value={certificate.endDate} />}
          </div>
          {certificate.signatureValue && (
            <p className="text-xs text-emerald-600 font-semibold mt-4 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Cryptographically signed at issuance — data has not been altered.
            </p>
          )}
        </div>

        {certificateHtml && (
          <CertificateViewer
            certificateHtml={certificateHtml}
            certificateNumber={certificate.certificateNumber}
            canvasWidth={template?.canvasWidth ?? DEFAULT_CANVAS_WIDTH}
            canvasHeight={template?.canvasHeight ?? DEFAULT_CANVAS_HEIGHT}
          />
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, mono }: { icon: typeof User; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p className={`text-gray-800 font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
