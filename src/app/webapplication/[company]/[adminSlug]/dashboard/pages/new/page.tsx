"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Select, Toggle, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPagePage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();
  const [form, setForm] = useState({ title: "", slug: "", template: "default", metaTitle: "", metaDescription: "", sections: [], isPublished: false });
  const [isSaving, setIsSaving] = useState(false);
  function update(key: string, value: unknown) { setForm((p) => ({ ...p, [key]: value })); }
  async function handleSave() {
    if (!form.title || !form.slug) { toast("Title and slug are required.", "error"); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/pages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { toast("Page created!", "success"); router.push(`${base}/pages/${data.data.id}`); }
      else toast(data.error || "Failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }
  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/pages`} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader title="New Page" />
      </div>
      <Card title="Page Details">
        <div className="grid gap-4">
          <Field label="Page Title *"><Input value={form.title} onChange={(e) => { update("title", e.target.value); update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")); }} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="URL Slug *" hint="e.g. /about-us"><Input value={form.slug} onChange={(e) => update("slug", e.target.value)} /></Field>
            <Field label="Template">
              <Select value={form.template} onChange={(e) => update("template", e.target.value)}>
                <option value="default">Default</option><option value="landing">Landing Page</option>
                <option value="about">About</option><option value="contact">Contact</option><option value="blog">Blog</option>
              </Select>
            </Field>
          </div>
          <Field label="SEO Title"><Input value={form.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} /></Field>
          <Field label="SEO Description"><Textarea value={form.metaDescription} rows={2} onChange={(e) => update("metaDescription", e.target.value)} /></Field>
          <Toggle checked={form.isPublished} onChange={(v) => update("isPublished", v)} label="Publish immediately" />
        </div>
      </Card>
      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty label="Create Page" />
    </div>
  );
}
