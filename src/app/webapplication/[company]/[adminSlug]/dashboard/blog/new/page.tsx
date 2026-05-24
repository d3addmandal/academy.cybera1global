"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Select, Toggle, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import ImageUpload from "@/components/admin/ImageUpload";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewBlogPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();

  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    title: "", slug: "", excerpt: "", content: "", category: "General",
    tags: [] as string[], author: { name: "", role: "", imageUrl: "" },
    publishedAt: today, readTime: "5 min read", image: "", isFeatured: false, status: "draft",
    seo: { metaTitle: "", metaDescription: "" },
  });
  const [isSaving, setIsSaving] = useState(false);

  function update(key: string, value: unknown) { setForm((p) => ({ ...p, [key]: value })); }
  function handleTitleChange(val: string) {
    update("title", val);
    update("slug", val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }

  async function handleSave() {
    if (!form.title || !form.slug) { toast("Title and slug are required.", "error"); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/blog`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { toast("Post created!", "success"); router.push(`${base}/blog/${data.data.id}`); }
      else toast(data.error || "Failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/blog`} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader title="New Blog Post" />
      </div>
      <div className="space-y-5">
        <Card title="Post Details">
          <div className="grid gap-4">
            <Field label="Title *"><Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} /></Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="URL Slug *"><Input value={form.slug} onChange={(e) => update("slug", e.target.value)} /></Field>
              <Field label="Status">
                <Select value={form.status} onChange={(e) => update("status", e.target.value)}>
                  <option value="draft">Draft</option><option value="published">Published</option>
                </Select>
              </Field>
            </div>
            <Field label="Excerpt *"><Textarea value={form.excerpt} rows={3} onChange={(e) => update("excerpt", e.target.value)} /></Field>
            <Field label="Content (HTML)"><Textarea value={form.content} rows={10} onChange={(e) => update("content", e.target.value)} className="font-mono text-xs" /></Field>
          </div>
        </Card>
        <Card title="Meta">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Category"><Input value={form.category} onChange={(e) => update("category", e.target.value)} /></Field>
            <Field label="Read Time"><Input value={form.readTime} onChange={(e) => update("readTime", e.target.value)} placeholder="5 min read" /></Field>
            <Field label="Tags (comma-sep)" className="sm:col-span-2">
              <Input value={form.tags.join(", ")} onChange={(e) => update("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </Field>
            <Field label="Published Date"><Input type="date" value={form.publishedAt} onChange={(e) => update("publishedAt", e.target.value)} /></Field>
          </div>
          <Field label="Cover Image">
            <ImageUpload value={form.image} onChange={(url) => update("image", url)} company={company} folder="blog" aspectClass="aspect-video" />
          </Field>
        </Card>
        <Card title="Author">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <Field label="Name"><Input value={form.author.name} onChange={(e) => update("author", { ...form.author, name: e.target.value })} /></Field>
            <Field label="Role"><Input value={form.author.role} onChange={(e) => update("author", { ...form.author, role: e.target.value })} /></Field>
          </div>
          <Field label="Author Photo">
            <ImageUpload value={form.author.imageUrl} onChange={(url) => update("author", { ...form.author, imageUrl: url })} company={company} folder="team" aspectClass="aspect-square" />
          </Field>
        </Card>
        <Toggle checked={form.isFeatured} onChange={(v) => update("isFeatured", v)} label="Mark as Featured" />
      </div>
      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty label="Create Post" />
    </div>
  );
}
