"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Select, Toggle, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import ImageUpload from "@/components/admin/ImageUpload";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Testimonial } from "@/types/cms";

export default function EditTestimonialPage() {
  const params = useParams();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const id = params.id as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Testimonial>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  useEffect(() => { fetch(`/api/admin/${company}/testimonials/${id}`).then((r) => r.json()).then((d) => { if (d.success) { setForm(d.data); setIsLoading(false); } }); }, [company, id]);
  function update(key: string, value: unknown) { setForm((p) => ({ ...p, [key]: value })); setIsDirty(true); }
  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/testimonials/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { toast("Saved!", "success"); setIsDirty(false); } else toast(data.error || "Save failed.", "error");
    } catch { toast("Network error.", "error"); } finally { setIsSaving(false); }
  }
  if (isLoading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading…</div>;
  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/testimonials`} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader title={`Edit: ${form.name}`} />
      </div>
      <Card title="Testimonial">
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name *"><Input value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} /></Field>
            <Field label="Role"><Input value={form.role ?? ""} onChange={(e) => update("role", e.target.value)} /></Field>
            <Field label="Company"><Input value={form.company ?? ""} onChange={(e) => update("company", e.target.value)} /></Field>
            <Field label="Programme"><Input value={form.programme ?? ""} onChange={(e) => update("programme", e.target.value)} /></Field>
          </div>
          <Field label="Quote *"><Textarea value={form.quote ?? ""} rows={4} onChange={(e) => update("quote", e.target.value)} /></Field>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Rating"><Select value={String(form.rating ?? 5)} onChange={(e) => update("rating", Number(e.target.value))}>{[5,4,3,2,1].map((r) => <option key={r} value={r}>{"★".repeat(r)} ({r})</option>)}</Select></Field>
            <Field label="LinkedIn"><Input value={form.linkedIn ?? ""} onChange={(e) => update("linkedIn", e.target.value)} /></Field>
            <Field label="Status"><Select value={form.status ?? "published"} onChange={(e) => update("status", e.target.value)}><option value="published">Published</option><option value="draft">Draft</option></Select></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Student Photo">
              <ImageUpload value={form.imageUrl ?? ""} onChange={(url) => update("imageUrl", url)} company={company} folder="testimonials" aspectClass="aspect-square" />
            </Field>
            <Field label="Company Logo">
              <ImageUpload value={form.companyLogoUrl ?? ""} onChange={(url) => update("companyLogoUrl", url)} company={company} folder="companies" aspectClass="aspect-video" />
            </Field>
          </div>
          <div className="flex items-center gap-6">
            <Toggle checked={form.isFeatured ?? false} onChange={(v) => update("isFeatured", v)} label="Featured on Homepage" />
          </div>
        </div>
      </Card>
      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} />
    </div>
  );
}
