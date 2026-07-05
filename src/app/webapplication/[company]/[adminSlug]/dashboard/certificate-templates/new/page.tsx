"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Select, Toggle, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { ArrowLeft, LayoutTemplate, Code2 } from "lucide-react";
import Link from "next/link";
import { renderCertificateHtml, compileCertificateTemplateHtml, SAMPLE_PLACEHOLDER_DATA, DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from "@/lib/certificate-template";
import { TokenReferenceCard, DEFAULT_TEMPLATE_HTML } from "../TokenReferenceCard";
import CertificateBackgroundUpload from "@/components/admin/CertificateBackgroundUpload";
import CertificateCanvasEditor from "@/components/admin/CertificateCanvasEditor";
import type { Programme, CertificateTemplateField } from "@/types/cms";

export default function NewCertificateTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [form, setForm] = useState({
    programmeId: "", name: "", description: "",
    mode: "visual" as "visual" | "raw",
    backgroundImageUrl: "", canvasWidth: DEFAULT_CANVAS_WIDTH, canvasHeight: DEFAULT_CANVAS_HEIGHT,
    fields: [] as CertificateTemplateField[],
    htmlContent: DEFAULT_TEMPLATE_HTML,
    isDefault: false, status: "draft",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/${company}/programmes`).then((r) => r.json()).then((d) => {
      if (d.success) setProgrammes(d.data);
    });
  }, [company]);

  function update(key: string, value: unknown) { setForm((p) => ({ ...p, [key]: value })); }

  const compiledHtml = useMemo(
    () => compileCertificateTemplateHtml({
      backgroundImageUrl: form.backgroundImageUrl || undefined,
      canvasWidth: form.canvasWidth, canvasHeight: form.canvasHeight, fields: form.fields,
    }),
    [form.backgroundImageUrl, form.canvasWidth, form.canvasHeight, form.fields]
  );
  const effectiveHtml = form.mode === "visual" ? compiledHtml : form.htmlContent;

  async function handleSave() {
    if (!form.programmeId || !form.name) { toast("Course and template name are required.", "error"); return; }
    if (form.mode === "raw" && !form.htmlContent) { toast("HTML/SVG content is required.", "error"); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/certificate-templates`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, htmlContent: effectiveHtml }),
      });
      const data = await res.json();
      if (data.success) { toast("Template created!", "success"); router.push(`${base}/certificate-templates/${data.data.id}`); }
      else toast(data.error || "Failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  const previewHtml = renderCertificateHtml(effectiveHtml, SAMPLE_PLACEHOLDER_DATA);

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/certificate-templates`} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader title="New Certificate Template" />
      </div>

      <Card title="Template Details">
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Associated Course *" hint="Course this certificate template belongs to">
              <Select value={form.programmeId} onChange={(e) => update("programmeId", e.target.value)}>
                <option value="">Select a course…</option>
                {programmes.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </Select>
            </Field>
            <Field label="Template Name *" hint="Distinguishes multiple designs on the same course">
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. CCEH — Classic Red" />
            </Field>
          </div>
          <Field label="Description"><Input value={form.description} onChange={(e) => update("description", e.target.value)} /></Field>
          <Toggle checked={form.isDefault} onChange={(v) => update("isDefault", v)} label="Set as default template" />
        </div>
      </Card>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => update("mode", "visual")}
          className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${form.mode === "visual" ? "border-red-400 bg-red-50 text-red-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
        >
          <LayoutTemplate className="w-4 h-4" /> Visual Builder
        </button>
        <button
          type="button"
          onClick={() => update("mode", "raw")}
          className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${form.mode === "raw" ? "border-red-400 bg-red-50 text-red-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
        >
          <Code2 className="w-4 h-4" /> Raw HTML/SVG
        </button>
      </div>

      {form.mode === "visual" ? (
        <div className="mt-5 space-y-5">
          <Card title="Background Image" subtitle="Optional — uploaded at its own resolution, no cropping">
            <CertificateBackgroundUpload
              value={form.backgroundImageUrl}
              company={company}
              onChange={(result) => {
                if (result) {
                  setForm((p) => ({ ...p, backgroundImageUrl: result.url, canvasWidth: result.width, canvasHeight: result.height }));
                } else {
                  setForm((p) => ({ ...p, backgroundImageUrl: "" }));
                }
              }}
            />
          </Card>
          <Card title="Fields" subtitle="Drag a field onto the certificate, or click to place it — use only what you need">
            <CertificateCanvasEditor
              backgroundImageUrl={form.backgroundImageUrl || undefined}
              canvasWidth={form.canvasWidth}
              canvasHeight={form.canvasHeight}
              fields={form.fields}
              onChange={(fields) => update("fields", fields)}
            />
          </Card>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_260px] gap-5 mt-5">
          <Card title="HTML / SVG Content *" subtitle="Raw HTML or SVG markup — use the tokens listed for dynamic data">
            <Textarea value={form.htmlContent} onChange={(e) => update("htmlContent", e.target.value)} rows={18} className="font-mono text-xs" />
          </Card>
          <TokenReferenceCard />
        </div>
      )}

      <div className="mt-5">
        <Card title="Live Preview" subtitle="Rendered with sample data">
          <div className="overflow-auto border border-slate-200 rounded-lg bg-slate-50">
            <div style={{ width: form.canvasWidth, transform: "scale(0.5)", transformOrigin: "top left", height: form.canvasHeight }}
              dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </Card>
      </div>

      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty label="Create Template" />
    </div>
  );
}
