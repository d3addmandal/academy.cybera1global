"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Select, Toggle, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { renderCertificateHtml, SAMPLE_PLACEHOLDER_DATA } from "@/lib/certificate-template";
import { TokenReferenceCard } from "../TokenReferenceCard";
import type { CertificateTemplate, Programme } from "@/types/cms";

export default function EditCertificateTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const id = params.id as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();

  const [form, setForm] = useState<Partial<CertificateTemplate>>({});
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/${company}/certificate-templates/${id}`).then((r) => r.json()),
      fetch(`/api/admin/${company}/programmes`).then((r) => r.json()),
    ]).then(([templateRes, programmesRes]) => {
      if (templateRes.success) setForm(templateRes.data);
      if (programmesRes.success) setProgrammes(programmesRes.data);
      setIsLoading(false);
    });
  }, [company, id]);

  function update(key: keyof CertificateTemplate, value: unknown) { setForm((p) => ({ ...p, [key]: value })); setIsDirty(true); }

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/certificate-templates/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { toast("Template updated!", "success"); setForm(data.data); setIsDirty(false); }
      else toast(data.error || "Failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  const previewHtml = useMemo(
    () => renderCertificateHtml(form.htmlContent ?? "", SAMPLE_PLACEHOLDER_DATA),
    [form.htmlContent]
  );

  if (isLoading) return <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>;

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/certificate-templates`} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader title={`Edit: ${form.name ?? ""}`} />
      </div>

      <Card title="Template Details">
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Certificate Template *" hint="Course this certificate template belongs to">
              <Select value={form.programmeId ?? ""} onChange={(e) => update("programmeId", e.target.value)}>
                <option value="">Select a course…</option>
                {programmes.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </Select>
            </Field>
            <Field label="Description"><Input value={form.description ?? ""} onChange={(e) => update("description", e.target.value)} /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Status">
              <Select value={form.status ?? "draft"} onChange={(e) => update("status", e.target.value)}>
                <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
              </Select>
            </Field>
            <div className="flex items-center">
              <Toggle checked={!!form.isDefault} onChange={(v) => update("isDefault", v)} label="Default template" />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-[1fr_260px] gap-5 mt-5">
        <Card title="HTML / SVG Content" subtitle="Raw HTML or SVG markup — use the tokens listed for dynamic data">
          <Textarea value={form.htmlContent ?? ""} onChange={(e) => update("htmlContent", e.target.value)} rows={18} className="font-mono text-xs" />
        </Card>
        <TokenReferenceCard />
      </div>

      <div className="mt-5">
        <Card title="Live Preview" subtitle="Rendered with sample data — unresolved {{tokens}} stay visible so typos are obvious">
          <div className="overflow-auto border border-slate-200 rounded-lg bg-slate-50">
            <div style={{ width: 1123, transform: "scale(0.5)", transformOrigin: "top left", height: 560 }}
              dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </Card>
      </div>

      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} />
    </div>
  );
}
