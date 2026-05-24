"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Select, Toggle, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import ImageUpload from "@/components/admin/ImageUpload";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { BlogPost } from "@/types/cms";

const defaults: Partial<BlogPost> = {
  title: "", slug: "", excerpt: "", content: "", category: "General",
  tags: [], author: { name: "", role: "", imageUrl: "" },
  publishedAt: new Date().toISOString().split("T")[0],
  readTime: "5 min read", image: "", isFeatured: false, status: "draft",
  seo: { metaTitle: "", metaDescription: "" },
};

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const id = params.id as string;
  const isNew = id === "new";
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();

  const [form, setForm] = useState<Partial<BlogPost>>(defaults);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(isNew);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/${company}/blog/${id}`).then((r) => r.json()).then((d) => { if (d.success) { setForm(d.data); setIsLoading(false); } });
    }
  }, [company, id, isNew]);

  function update(key: string, value: unknown) { setForm((p) => ({ ...p, [key]: value })); setIsDirty(true); }

  function handleTitleChange(val: string) {
    update("title", val);
    if (isNew) update("slug", val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const url = isNew ? `/api/admin/${company}/blog` : `/api/admin/${company}/blog/${id}`;
      const res = await fetch(url, { method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) {
        toast(isNew ? "Post created!" : "Post saved!", "success");
        setIsDirty(false);
        if (isNew) router.push(`${base}/blog/${data.data.id}`);
      } else { toast(data.error || "Save failed.", "error"); }
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading…</div>;

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/blog`} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader title={isNew ? "New Blog Post" : "Edit Post"} subtitle={form.slug} />
      </div>
      <div className="space-y-5">
        <Card title="Post Details">
          <div className="grid gap-4">
            <Field label="Title *">
              <Input value={form.title ?? ""} onChange={(e) => handleTitleChange(e.target.value)} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="URL Slug *">
                <Input value={form.slug ?? ""} onChange={(e) => update("slug", e.target.value)} />
              </Field>
              <Field label="Status">
                <Select value={form.status ?? "draft"} onChange={(e) => update("status", e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </Field>
            </div>
            <Field label="Excerpt *">
              <Textarea value={form.excerpt ?? ""} rows={3} onChange={(e) => update("excerpt", e.target.value)} />
            </Field>
            <Field label="Full Content (HTML allowed)">
              <Textarea value={form.content ?? ""} rows={12} onChange={(e) => update("content", e.target.value)} className="font-mono text-xs" />
            </Field>
          </div>
        </Card>
        <Card title="Meta Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Category">
              <Input value={form.category ?? ""} onChange={(e) => update("category", e.target.value)} placeholder="AI Security, VAPT, Career…" />
            </Field>
            <Field label="Read Time">
              <Input value={form.readTime ?? ""} onChange={(e) => update("readTime", e.target.value)} placeholder="5 min read" />
            </Field>
            <Field label="Tags (comma-separated)" className="sm:col-span-2">
              <Input value={(form.tags ?? []).join(", ")} onChange={(e) => update("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </Field>
            <Field label="Published Date">
              <Input type="date" value={form.publishedAt ?? ""} onChange={(e) => update("publishedAt", e.target.value)} />
            </Field>
          </div>
          <Field label="Cover Image">
            <ImageUpload value={form.image ?? ""} onChange={(url) => update("image", url)} company={company} folder="blog" aspectClass="aspect-video" />
          </Field>
        </Card>
        <Card title="Author">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <Field label="Name"><Input value={form.author?.name ?? ""} onChange={(e) => update("author", { ...form.author, name: e.target.value })} /></Field>
            <Field label="Role"><Input value={form.author?.role ?? ""} onChange={(e) => update("author", { ...form.author, role: e.target.value })} /></Field>
          </div>
          <Field label="Author Photo">
            <ImageUpload value={form.author?.imageUrl ?? ""} onChange={(url) => update("author", { ...form.author, imageUrl: url })} company={company} folder="team" aspectClass="aspect-square" />
          </Field>
        </Card>
        <Card title="SEO">
          <div className="grid gap-3">
            <Field label="Meta Title"><Input value={form.seo?.metaTitle ?? ""} onChange={(e) => update("seo", { ...form.seo, metaTitle: e.target.value })} /></Field>
            <Field label="Meta Description"><Textarea value={form.seo?.metaDescription ?? ""} rows={2} onChange={(e) => update("seo", { ...form.seo, metaDescription: e.target.value })} /></Field>
          </div>
        </Card>
        <div className="flex items-center gap-4">
          <Toggle checked={form.isFeatured ?? false} onChange={(v) => update("isFeatured", v)} label="Mark as Featured Post" />
        </div>
      </div>
      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} label={isNew ? "Create Post" : "Save Changes"} />
    </div>
  );
}
