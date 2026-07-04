"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Select, Toggle, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { renderCertificateHtml, SAMPLE_PLACEHOLDER_DATA } from "@/lib/certificate-template";
import { TokenReferenceCard, DEFAULT_TEMPLATE_HTML } from "../TokenReferenceCard";
import type { Programme } from "@/types/cms";

export default function NewCertificateTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [form, setForm] = useState({
    programmeId: "", description: "", htmlContent: DEFAULT_TEMPLATE_HTML,
    isDefault: false, status: "draft",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/${company}/programmes`).then((r) => r.json()).then((d) => {
      if (d.success) setProgrammes(d.data);
    });
  }, [company]);

  function update(key: string, value: unknown) { setForm((p) => ({ ...p, [key]: value })); }

  async function handleSave() {
    if (!form.programmeId || !form.htmlContent) { toast("Course and HTML/SVG content are required.", "error"); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/certificate-templates`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { toast("Template created!", "success"); router.push(`${base}/certificate-templates/${data.data.id}`); }
      else toast(data.error || "Failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  const previewHtml = renderCertificateHtml(form.htmlContent, SAMPLE_PLACEHOLDER_DATA);

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/certificate-templates`} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader title="New Certificate Template" />
      </div>

      <Card title="Template Details">
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Certificate Template *" hint="Course this certificate template belongs to">
              <Select value={form.programmeId} onChange={(e) => update("programmeId", e.target.value)}>
                <option value="">Select a course…</option>
                {programmes.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </Select>
            </Field>
            <Field label="Description"><Input value={form.description} onChange={(e) => update("description", e.target.value)} /></Field>
          </div>
          <Toggle checked={form.isDefault} onChange={(v) => update("isDefault", v)} label="Set as default template" />
        </div>
      </Card>

      <div className="grid lg:grid-cols-[1fr_260px] gap-5 mt-5">
        <Card title="HTML / SVG Content *" subtitle="Raw HTML or SVG markup — use the tokens listed for dynamic data">
          <Textarea value={form.htmlContent} onChange={(e) => update("htmlContent", e.target.value)} rows={18} className="font-mono text-xs" />
        </Card>
        <TokenReferenceCard />
      </div>

      <div className="mt-5">
        <Card title="Live Preview" subtitle="Rendered with sample data">
          <div className="overflow-auto border border-slate-200 rounded-lg bg-slate-50">
            <div style={{ width: 1123, transform: "scale(0.5)", transformOrigin: "top left", height: 560 }}
              dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </Card>
      </div>

      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty label="Create Template" />
    </div>
  );
}
