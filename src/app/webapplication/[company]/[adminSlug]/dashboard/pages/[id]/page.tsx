"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Select, Toggle, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import type { CustomPage } from "@/types/cms";

export default function EditPagePage() {
  const params = useParams();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const id = params.id as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<CustomPage>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/${company}/pages/${id}`).then((r) => r.json()).then((d) => { if (d.success) { setForm(d.data); setIsLoading(false); } });
  }, [company, id]);

  function update(key: string, value: unknown) { setForm((p) => ({ ...p, [key]: value })); setIsDirty(true); }

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/pages/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { toast("Page saved!", "success"); setIsDirty(false); }
      else toast(data.error || "Save failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading…</div>;

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/pages`} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader
          title={`Edit: ${form.title}`}
          actions={
            <button onClick={() => window.open(`/${form.slug}`, "_blank")} className="flex items-center gap-1.5 text-sm border border-slate-200 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50">
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          }
        />
      </div>
      <Card title="Page Details">
        <div className="grid gap-4">
          <Field label="Title *"><Input value={form.title ?? ""} onChange={(e) => update("title", e.target.value)} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="URL Slug *"><Input value={form.slug ?? ""} onChange={(e) => update("slug", e.target.value)} /></Field>
            <Field label="Template">
              <Select value={form.template ?? "default"} onChange={(e) => update("template", e.target.value)}>
                <option value="default">Default</option><option value="landing">Landing</option>
                <option value="about">About</option><option value="contact">Contact</option>
              </Select>
            </Field>
          </div>
          <Field label="SEO Title"><Input value={form.metaTitle ?? ""} onChange={(e) => update("metaTitle", e.target.value)} /></Field>
          <Field label="SEO Description"><Textarea value={form.metaDescription ?? ""} rows={2} onChange={(e) => update("metaDescription", e.target.value)} /></Field>
          <Toggle checked={form.isPublished ?? false} onChange={(v) => update("isPublished", v)} label="Published (visible on website)" />
        </div>
      </Card>
      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} />
    </div>
  );
}
