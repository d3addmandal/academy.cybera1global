"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Select, SaveBar, Card, StatusBadge } from "@/components/admin/FormField";
import DataTable from "@/components/admin/DataTable";
import { useToast } from "@/components/admin/Toast";
import { renderCertificateHtml, toPlaceholderData } from "@/lib/certificate-template";
import { downloadCertificatePdf, waitForImages } from "@/lib/certificate-pdf";
import { ArrowLeft, Download, QrCode, RefreshCw, Link2 } from "lucide-react";
import Link from "next/link";
import type { Certificate, CertificateTemplate, CertificateAuditLogEntry, CertificateStatus, Programme } from "@/types/cms";

const STATUSES: CertificateStatus[] = ["active", "revoked", "expired", "suspended"];

export default function EditCertificatePage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const id = params.id as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();

  const [cert, setCert] = useState<Certificate | null>(null);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [auditLog, setAuditLog] = useState<CertificateAuditLogEntry[]>([]);
  const [form, setForm] = useState<Partial<Certificate>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [statusReason, setStatusReason] = useState("");
  const [busy, setBusy] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  function load() {
    setIsLoading(true);
    Promise.all([
      fetch(`/api/admin/${company}/certificates/${id}`).then((r) => r.json()),
      fetch(`/api/admin/${company}/certificate-templates`).then((r) => r.json()),
      fetch(`/api/admin/${company}/programmes`).then((r) => r.json()),
    ]).then(([certRes, templatesRes, programmesRes]) => {
      if (certRes.success) { setCert(certRes.data); setForm(certRes.data); }
      if (templatesRes.success) setTemplates(templatesRes.data);
      if (programmesRes.success) setProgrammes(programmesRes.data);
      setIsLoading(false);
    });
    fetch(`/api/admin/${company}/certificates/${id}/audit-log`).then((r) => r.json()).then((d) => { if (d.success) setAuditLog(d.data); }).catch(() => {});
  }
  useEffect(load, [company, id]);

  function update(key: keyof Certificate, value: unknown) { setForm((p) => ({ ...p, [key]: value })); setIsDirty(true); }

  const activeTemplate = templates.find((t) => t.programmeId === form.programmeId) ?? templates.find((t) => t.id === form.templateId);
  const previewHtml = activeTemplate && cert
    ? renderCertificateHtml(activeTemplate.htmlContent, toPlaceholderData({ ...cert, ...form } as Certificate))
    : "";

  async function handleSave() {
    if (!cert) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/certificates/${cert.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { toast("Certificate updated!", "success"); setCert(data.data); setForm(data.data); setIsDirty(false); }
      else toast(data.error || "Failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  async function handleStatusChange(status: CertificateStatus) {
    if (!cert) return;
    setBusy(true);
    const res = await fetch(`/api/admin/${company}/certificates/${cert.id}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, reason: statusReason || undefined }),
    }).then((r) => r.json());
    setBusy(false);
    if (res.success) { toast("Status updated.", "success"); setStatusReason(""); load(); }
    else toast(res.error || "Failed.", "error");
  }

  async function handleRegenerateQr() {
    if (!cert) return;
    setBusy(true);
    const res = await fetch(`/api/admin/${company}/certificates/${cert.id}/regenerate-qr`, { method: "POST" }).then((r) => r.json());
    setBusy(false);
    if (res.success) { toast("QR code regenerated.", "success"); load(); }
    else toast(res.error || "Failed.", "error");
  }

  async function handleReissue() {
    if (!cert) return;
    setBusy(true);
    const res = await fetch(`/api/admin/${company}/certificates/${cert.id}/reissue`, { method: "POST" }).then((r) => r.json());
    setBusy(false);
    if (res.success) { toast("Certificate reissued.", "success"); router.push(`${base}/certificates/${res.data.id}`); }
    else toast(res.error || "Failed.", "error");
  }

  function handleCopyLink() {
    if (!cert) return;
    navigator.clipboard.writeText(cert.verificationUrl).then(
      () => toast("Verification link copied.", "success"),
      () => toast("Could not copy link.", "error")
    );
  }

  async function handleDownloadPdf() {
    if (!cert || !previewRef.current) return;
    setBusy(true);
    try {
      await waitForImages(previewRef.current);
      await downloadCertificatePdf(previewRef.current, `${cert.certificateNumber}.pdf`);
      fetch(`/api/admin/${company}/certificates/${cert.id}/log-download`, { method: "POST" }).catch(() => {});
    } catch {
      toast("Failed to generate PDF.", "error");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>;
  if (!cert) return <div className="py-16 text-center text-slate-400 text-sm">Certificate not found.</div>;

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/certificates`} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader title={`Edit: ${cert.studentName}`} subtitle={cert.certificateNumber} />
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">
        <div className="space-y-5">
          <Card title="Course">
            <Field label="Course Name" hint="Certificate template resolves automatically from the selected course">
              <Select value={form.programmeId ?? ""} onChange={(e) => update("programmeId", e.target.value)}>
                <option value="">Select a course…</option>
                {programmes.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </Select>
            </Field>
          </Card>

          <Card title="Student Details">
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Student Name"><Input value={form.studentName ?? ""} onChange={(e) => update("studentName", e.target.value)} /></Field>
                <Field label="Student Date Of Birth"><Input type="date" value={form.studentDob ?? ""} onChange={(e) => update("studentDob", e.target.value)} /></Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Student Mobile"><Input value={form.studentPhone ?? ""} onChange={(e) => update("studentPhone", e.target.value)} /></Field>
                <Field label="Student Email"><Input type="email" value={form.studentEmail ?? ""} onChange={(e) => update("studentEmail", e.target.value)} /></Field>
              </div>
            </div>
          </Card>

          <Card title="Issuance">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Issue Date"><Input type="date" value={form.issueDate ?? ""} onChange={(e) => update("issueDate", e.target.value)} /></Field>
              <Field label="Course Start Date"><Input type="date" value={form.startDate ?? ""} onChange={(e) => update("startDate", e.target.value)} /></Field>
              <Field label="Course End Date"><Input type="date" value={form.endDate ?? ""} onChange={(e) => update("endDate", e.target.value)} /></Field>
            </div>
          </Card>

          <Card title="Audit Log">
            <DataTable
              data={auditLog}
              columns={[
                { key: "action", label: "Action", render: (e) => <span className="capitalize">{e.action.replace(/_/g, " ")}</span> },
                { key: "actorEmail", label: "By" },
                { key: "detail", label: "Detail", render: (e) => <span className="text-xs text-slate-500">{e.detail ?? "—"}</span> },
                { key: "createdAt", label: "When", render: (e) => <span className="text-xs text-slate-400">{new Date(e.createdAt).toLocaleString()}</span> },
              ]}
              emptyMessage="No activity recorded yet."
            />
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Status">
            <div className="space-y-3">
              <StatusBadge status={cert.status} />
              {cert.statusReason && <p className="text-xs text-slate-500">Reason: {cert.statusReason}</p>}
              <Field label="Change status" hint="Optional reason (visible in the audit log)">
                <Input value={statusReason} onChange={(e) => setStatusReason(e.target.value)} placeholder="Reason (optional)" />
              </Field>
              <div className="flex flex-wrap gap-2">
                {STATUSES.filter((s) => s !== cert.status).map((s) => (
                  <button key={s} disabled={busy} onClick={() => handleStatusChange(s)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 capitalize disabled:opacity-50">
                    Mark {s}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card title="QR Code & Verification">
            <div className="space-y-3">
              {cert.qrCodePath && <img src={cert.qrCodePath} alt="QR code" className="w-32 h-32 border border-slate-200 rounded-lg" />}
              <button onClick={handleRegenerateQr} disabled={busy} className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50">
                <QrCode className="w-4 h-4" /> Regenerate QR
              </button>
              <button onClick={handleCopyLink} className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                <Link2 className="w-4 h-4" /> Copy Verification Link
              </button>
              <p className="text-xs text-slate-400 break-all">{cert.verificationUrl}</p>
            </div>
          </Card>

          <Card title="Signature">
            <p className="text-xs text-emerald-600 font-semibold mb-1">✓ Cryptographically signed (ed25519)</p>
            <p className="text-xs text-slate-400 break-all font-mono">{cert.signatureValue.slice(0, 48)}…</p>
          </Card>

          <Card title="Actions">
            <div className="space-y-2">
              <button onClick={handleDownloadPdf} disabled={busy} className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-50">
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button onClick={handleReissue} disabled={busy} className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50">
                <RefreshCw className="w-4 h-4" /> Reissue Certificate
              </button>
            </div>
          </Card>

          <Card title="Preview">
            <div className="overflow-auto border border-slate-200 rounded-lg">
              <div ref={previewRef} style={{ width: 1123, transform: "scale(0.32)", transformOrigin: "top left", height: 358 }}
                dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </Card>
        </div>
      </div>

      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} />
    </div>
  );
}
