"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Edit2, Trash2, Eye, Download, QrCode, RefreshCw, Link2, FileSpreadsheet, FileText,
} from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { StatusBadge, PageHeader } from "@/components/admin/FormField";
import { ConfirmModal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import { renderCertificateHtml, toPlaceholderData } from "@/lib/certificate-template";
import { downloadCertificatePdf, downloadCertificatesZip, waitForImages } from "@/lib/certificate-pdf";
import type { Certificate, CertificateTemplate } from "@/types/cms";

const MAX_BULK_DOWNLOAD = 25;

export default function CertificatesPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();

  const [data, setData] = useState<Certificate[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkIds, setBulkIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const renderHostRef = useRef<HTMLDivElement>(null);

  const load = () => {
    setIsLoading(true);
    Promise.all([
      fetch(`/api/admin/${company}/certificates`).then((r) => r.json()),
      fetch(`/api/admin/${company}/certificate-templates`).then((r) => r.json()),
    ]).then(([certsRes, templatesRes]) => {
      if (certsRes.success) setData(certsRes.data);
      if (templatesRes.success) setTemplates(templatesRes.data);
      setIsLoading(false);
    });
  };
  useEffect(load, [company]);

  const templateName = (id: string) => templates.find((t) => t.id === id)?.name ?? "—";

  async function renderInto(certificateNumber: string, container: HTMLElement) {
    const cert = data.find((c) => c.certificateNumber === certificateNumber);
    const template = cert ? templates.find((t) => t.id === cert.templateId) : undefined;
    if (!cert || !template) { container.innerHTML = ""; return; }
    container.innerHTML = renderCertificateHtml(template.htmlContent, toPlaceholderData(cert));
    await waitForImages(container);
  }

  async function handleDownloadOne(cert: Certificate) {
    const container = renderHostRef.current;
    if (!container) return;
    setBusy(true);
    try {
      await renderInto(cert.certificateNumber, container);
      await downloadCertificatePdf(container, `${cert.certificateNumber}.pdf`);
      fetch(`/api/admin/${company}/certificates/${cert.id}/log-download`, { method: "POST" }).catch(() => {});
    } catch {
      toast("Failed to generate PDF.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleBulkDownload(ids: string[]) {
    const container = renderHostRef.current;
    if (!container) return;
    if (ids.length > MAX_BULK_DOWNLOAD) {
      toast(`Select up to ${MAX_BULK_DOWNLOAD} certificates at a time to download.`, "error");
      return;
    }
    const numbers = ids.map((id) => data.find((c) => c.id === id)?.certificateNumber).filter(Boolean) as string[];
    setBusy(true);
    try {
      await downloadCertificatesZip(numbers, container, renderInto);
      ids.forEach((id) => fetch(`/api/admin/${company}/certificates/${id}/log-download`, { method: "POST" }).catch(() => {}));
      toast("Certificates downloaded.", "success");
    } catch {
      toast("Bulk download failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegenerateQr(cert: Certificate) {
    setBusy(true);
    const res = await fetch(`/api/admin/${company}/certificates/${cert.id}/regenerate-qr`, { method: "POST" }).then((r) => r.json());
    setBusy(false);
    if (res.success) { toast("QR code regenerated.", "success"); load(); }
    else toast(res.error || "Failed.", "error");
  }

  async function handleBulkRegenerateQr(ids: string[]) {
    setBusy(true);
    const res = await fetch(`/api/admin/${company}/certificates/bulk-regenerate-qr`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }),
    }).then((r) => r.json());
    setBusy(false);
    if (res.success) { toast(res.message, "success"); load(); }
    else toast(res.error || "Failed.", "error");
  }

  async function handleReissue(cert: Certificate) {
    setBusy(true);
    const res = await fetch(`/api/admin/${company}/certificates/${cert.id}/reissue`, { method: "POST" }).then((r) => r.json());
    setBusy(false);
    if (res.success) { toast("Certificate reissued.", "success"); router.push(`${base}/certificates/${res.data.id}`); }
    else toast(res.error || "Failed.", "error");
  }

  function handleCopyLink(cert: Certificate) {
    navigator.clipboard.writeText(cert.verificationUrl).then(
      () => toast("Verification link copied.", "success"),
      () => toast("Could not copy link.", "error")
    );
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await fetch(`/api/admin/${company}/certificates/${deleteTarget.id}`, { method: "DELETE" }).then((r) => r.json());
    if (res.success) { toast("Certificate deleted.", "success"); setData((d) => d.filter((c) => c.id !== deleteTarget.id)); }
    else toast(res.error || "Delete failed.", "error");
    setIsDeleting(false);
    setDeleteTarget(null);
  }

  async function handleBulkDelete(ids: string[]) {
    setBusy(true);
    await Promise.all(ids.map((id) => fetch(`/api/admin/${company}/certificates/${id}`, { method: "DELETE" })));
    setBusy(false);
    setBulkDeleteOpen(false);
    toast(`Deleted ${ids.length} certificate(s).`, "success");
    load();
  }

  return (
    <div>
      <PageHeader
        title="Certificates"
        subtitle="Issue, manage, and verify student certificates."
        actions={
          <>
            <a href={`/api/admin/${company}/certificates/export?format=csv`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              <FileText className="w-3.5 h-3.5" /> CSV
            </a>
            <a href={`/api/admin/${company}/certificates/export?format=xlsx`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </a>
          </>
        }
      />

      <DataTable
        data={data}
        isLoading={isLoading || busy}
        createHref={`${base}/certificates/new`}
        createLabel="New Certificate"
        searchKeys={["studentName", "courseName", "certificateNumber"] as (keyof Certificate)[]}
        emptyMessage="No certificates issued yet."
        pageSize={20}
        selectable
        onSelectionChange={setBulkIds}
        filters={[{
          key: "status", label: "Status",
          options: [
            { value: "active", label: "Active" },
            { value: "revoked", label: "Revoked" },
            { value: "expired", label: "Expired" },
            { value: "suspended", label: "Suspended" },
          ],
        }]}
        bulkActions={[
          { label: "Download PDFs", icon: Download, onClick: handleBulkDownload },
          { label: "Regenerate QR", icon: QrCode, onClick: handleBulkRegenerateQr },
          { label: "Delete", icon: Trash2, variant: "danger", onClick: () => setBulkDeleteOpen(true) },
        ]}
        columns={[
          { key: "studentName", label: "Student", sortable: true, render: (c) => (
            <div><p className="font-semibold text-slate-800">{c.studentName}</p>{c.studentEmail && <p className="text-xs text-slate-400">{c.studentEmail}</p>}</div>
          ) },
          { key: "courseName", label: "Course", sortable: true },
          { key: "certificateNumber", label: "Certificate #", render: (c) => <span className="font-mono text-xs">{c.certificateNumber}</span> },
          { key: "issueDate", label: "Issue Date", sortable: true },
          { key: "status", label: "Status", render: (c) => <StatusBadge status={c.status} /> },
          { key: "templateId", label: "Template", render: (c) => <span className="text-xs text-slate-500">{templateName(c.templateId)}</span> },
        ]}
        actions={[
          { label: "Edit", icon: Edit2, onClick: (c) => router.push(`${base}/certificates/${c.id}`) },
          { label: "View", icon: Eye, onClick: (c) => window.open(c.verificationUrl, "_blank") },
          { label: "Download PDF", icon: Download, onClick: handleDownloadOne },
          { label: "Regenerate QR", icon: QrCode, onClick: handleRegenerateQr },
          { label: "Reissue", icon: RefreshCw, onClick: handleReissue },
          { label: "Copy Verification Link", icon: Link2, onClick: handleCopyLink },
          { label: "Delete", icon: Trash2, variant: "danger", onClick: setDeleteTarget },
        ]}
      />

      {/* Off-screen render target used to snapshot certificates for PDF generation */}
      <div ref={renderHostRef} style={{ position: "fixed", left: -99999, top: 0, width: 1123, pointerEvents: "none" }} aria-hidden="true" />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Certificate"
        message={`Delete the certificate for "${deleteTarget?.studentName}"? This cannot be undone.`}
      />
      <ConfirmModal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={() => handleBulkDelete(bulkIds)}
        isLoading={busy}
        title="Delete Certificates"
        message={`Delete ${bulkIds.length} selected certificate(s)? This cannot be undone.`}
      />
    </div>
  );
}
