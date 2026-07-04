"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Edit2, Trash2, Eye, Download, QrCode, RefreshCw, Link2, FileSpreadsheet, FileText, Upload,
} from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { StatusBadge, PageHeader } from "@/components/admin/FormField";
import Modal, { ConfirmModal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import { renderCertificateHtml, toPlaceholderData } from "@/lib/certificate-template";
import { downloadCertificatePdf, downloadCertificatesZip, waitForImages } from "@/lib/certificate-pdf";
import type { Certificate, CertificateTemplate } from "@/types/cms";

interface BulkImportRowResult {
  row: number;
  studentName: string;
  courseName: string;
  ok: boolean;
  error?: string;
}
interface BulkImportResponse {
  success: boolean;
  error?: string;
  dryRun: boolean;
  total: number;
  successCount: number;
  failureCount: number;
  createdCount: number;
  results: BulkImportRowResult[];
}

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

  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<BulkImportResponse | null>(null);
  const [importBusy, setImportBusy] = useState(false);

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

  function closeImportModal() {
    setImportOpen(false);
    setImportFile(null);
    setImportResult(null);
  }

  async function runImport(dryRun: boolean) {
    if (!importFile) return;
    setImportBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("dryRun", String(dryRun));
      const res: BulkImportResponse = await fetch(`/api/admin/${company}/certificates/bulk-import`, {
        method: "POST", body: formData,
      }).then((r) => r.json());
      if (!res.success) { toast(res.error || "Import failed.", "error"); return; }
      setImportResult(res);
      if (!dryRun) { toast(`Created ${res.createdCount} certificate(s).`, "success"); load(); }
    } catch {
      toast("Network error.", "error");
    } finally {
      setImportBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Certificates"
        subtitle="Issue, manage, and verify student certificates."
        actions={
          <>
            <button onClick={() => setImportOpen(true)} className="inline-flex items-center gap-1.5 text-sm text-slate-500 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              <Upload className="w-3.5 h-3.5" /> Bulk Import
            </button>
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

      <Modal
        open={importOpen}
        onClose={closeImportModal}
        title="Bulk Import Certificates"
        size="lg"
        footer={
          importResult?.dryRun ? (
            <>
              <button onClick={closeImportModal} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={() => runImport(false)} disabled={importBusy || importResult.successCount === 0}
                className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-60 transition-colors">
                {importBusy ? "Importing…" : `Confirm & Create ${importResult.successCount}`}
              </button>
            </>
          ) : (
            <>
              <button onClick={closeImportModal} className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                {importResult ? "Close" : "Cancel"}
              </button>
              {!importResult && (
                <button onClick={() => runImport(true)} disabled={importBusy || !importFile}
                  className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-60 transition-colors">
                  {importBusy ? "Validating…" : "Preview"}
                </button>
              )}
            </>
          )
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Upload a CSV or Excel file with columns: <span className="font-mono text-xs">Student Name, Course Name, Issue Date, Student Date Of Birth, Student Mobile, Student Email, Course Start Date, Course End Date</span>.
          </p>
          <a href={`/api/admin/${company}/certificates/bulk-import/sample`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700">
            <Download className="w-3.5 h-3.5" /> Download sample file
          </a>
          {!importResult && (
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
          )}
          {importResult && (
            <div className="space-y-3">
              <div className="flex gap-4 text-sm">
                <span className="text-slate-600">Total: <strong>{importResult.total}</strong></span>
                <span className="text-emerald-600">Valid: <strong>{importResult.successCount}</strong></span>
                <span className="text-red-600">Errors: <strong>{importResult.failureCount}</strong></span>
                {!importResult.dryRun && <span className="text-slate-600">Created: <strong>{importResult.createdCount}</strong></span>}
              </div>
              <div className="border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-slate-500">Row</th>
                      <th className="text-left px-3 py-2 font-semibold text-slate-500">Student</th>
                      <th className="text-left px-3 py-2 font-semibold text-slate-500">Course</th>
                      <th className="text-left px-3 py-2 font-semibold text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.results.map((r) => (
                      <tr key={r.row} className="border-t border-slate-100">
                        <td className="px-3 py-1.5 text-slate-500">{r.row}</td>
                        <td className="px-3 py-1.5">{r.studentName}</td>
                        <td className="px-3 py-1.5">{r.courseName}</td>
                        <td className="px-3 py-1.5">
                          {r.ok ? <span className="text-emerald-600">OK</span> : <span className="text-red-600">{r.error}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
