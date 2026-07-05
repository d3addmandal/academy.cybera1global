"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Select, Toggle, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { ArrowLeft, LayoutTemplate, Code2 } from "lucide-react";
import Link from "next/link";
import { renderCertificateHtml, compileCertificateTemplateHtml, SAMPLE_PLACEHOLDER_DATA, DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT } from "@/lib/certificate-template";
import { TokenReferenceCard } from "../TokenReferenceCard";
import CertificateBackgroundUpload from "@/components/admin/CertificateBackgroundUpload";
import CertificateCanvasEditor from "@/components/admin/CertificateCanvasEditor";
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
      if (templateRes.success) {
        const data: CertificateTemplate = templateRes.data;
        // Pre-existing (raw) templates predate this field — default them to Raw mode
        // rather than opening a blank canvas over hand-authored HTML/SVG.
        const mode = data.mode ?? (data.fields?.length ? "visual" : "raw");
        setForm({ ...data, mode });
      }
      if (programmesRes.success) setProgrammes(programmesRes.data);
      setIsLoading(false);
    });
  }, [company, id]);

  function update(key: keyof CertificateTemplate, value: unknown) { setForm((p) => ({ ...p, [key]: value })); setIsDirty(true); }

  function switchMode(mode: "visual" | "raw") {
    if (mode === form.mode) return;
    if (mode === "visual" && !form.fields?.length && form.htmlContent) {
      const ok = window.confirm("Switching to Visual Builder starts a blank canvas and replaces your current HTML/SVG when you save — continue?");
      if (!ok) return;
    }
    update("mode", mode);
  }

  const compiledHtml = useMemo(
    () => compileCertificateTemplateHtml({
      backgroundImageUrl: form.backgroundImageUrl || undefined,
      canvasWidth: form.canvasWidth ?? DEFAULT_CANVAS_WIDTH,
      canvasHeight: form.canvasHeight ?? DEFAULT_CANVAS_HEIGHT,
      fields: form.fields ?? [],
    }),
    [form.backgroundImageUrl, form.canvasWidth, form.canvasHeight, form.fields]
  );
  const effectiveHtml = form.mode === "visual" ? compiledHtml : (form.htmlContent ?? "");

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/certificate-templates/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, htmlContent: effectiveHtml }),
      });
      const data = await res.json();
      if (data.success) { toast("Template updated!", "success"); setForm(data.data); setIsDirty(false); }
      else toast(data.error || "Failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  const previewHtml = useMemo(
    () => renderCertificateHtml(effectiveHtml, SAMPLE_PLACEHOLDER_DATA),
    [effectiveHtml]
  );

  if (isLoading) return <div className="py-16 text-center text-slate-400 text-sm">Loading…</div>;

  const canvasWidth = form.canvasWidth ?? DEFAULT_CANVAS_WIDTH;
  const canvasHeight = form.canvasHeight ?? DEFAULT_CANVAS_HEIGHT;

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/certificate-templates`} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader title={`Edit: ${form.name ?? ""}`} />
      </div>

      <Card title="Template Details">
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Associated Course" hint="Course this certificate template belongs to">
              <Select value={form.programmeId ?? ""} onChange={(e) => update("programmeId", e.target.value)}>
                <option value="">Select a course…</option>
                {programmes.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </Select>
            </Field>
            <Field label="Template Name *" hint="Distinguishes multiple designs on the same course">
              <Input value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} />
            </Field>
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

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => switchMode("visual")}
          className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${form.mode === "visual" ? "border-red-400 bg-red-50 text-red-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
        >
          <LayoutTemplate className="w-4 h-4" /> Visual Builder
        </button>
        <button
          type="button"
          onClick={() => switchMode("raw")}
          className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${form.mode === "raw" ? "border-red-400 bg-red-50 text-red-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
        >
          <Code2 className="w-4 h-4" /> Raw HTML/SVG
        </button>
      </div>

      {form.mode === "visual" ? (
        <div className="mt-5 space-y-5">
          <Card title="Background Image" subtitle="Optional — uploaded at its own resolution, no cropping">
            <CertificateBackgroundUpload
              value={form.backgroundImageUrl ?? ""}
              company={company}
              onChange={(result) => {
                if (result) {
                  setForm((p) => ({ ...p, backgroundImageUrl: result.url, canvasWidth: result.width, canvasHeight: result.height }));
                } else {
                  setForm((p) => ({ ...p, backgroundImageUrl: "" }));
                }
                setIsDirty(true);
              }}
            />
          </Card>
          <Card title="Fields" subtitle="Drag a field onto the certificate, or click to place it — use only what you need">
            <CertificateCanvasEditor
              backgroundImageUrl={form.backgroundImageUrl || undefined}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              fields={form.fields ?? []}
              onChange={(fields) => update("fields", fields)}
            />
          </Card>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_260px] gap-5 mt-5">
          <Card title="HTML / SVG Content" subtitle="Raw HTML or SVG markup — use the tokens listed for dynamic data">
            <Textarea value={form.htmlContent ?? ""} onChange={(e) => update("htmlContent", e.target.value)} rows={18} className="font-mono text-xs" />
          </Card>
          <TokenReferenceCard />
        </div>
      )}

      <div className="mt-5">
        <Card title="Live Preview" subtitle="Rendered with sample data — unresolved {{tokens}} stay visible so typos are obvious">
          <div className="overflow-auto border border-slate-200 rounded-lg bg-slate-50">
            <div style={{ width: canvasWidth, transform: "scale(0.5)", transformOrigin: "top left", height: canvasHeight }}
              dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </Card>
      </div>

      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} />
    </div>
  );
}
