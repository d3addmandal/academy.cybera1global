"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Select, Toggle, SaveBar, Card } from "@/components/admin/FormField";
import IconPicker from "@/components/admin/IconPicker";
import { useToast } from "@/components/admin/Toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const defaults = {
  shortTitle: "", title: "", slug: "", badge: "", category: "career-track",
  level: "Beginner", duration: "3 Months", mode: "Online / Offline", labsType: "Hands-On Practical",
  description: "", overview: "", image: "", heroImage: "", icon: "", color: "#e00000",
  isFeatured: false, status: "draft",
  bestFor: [] as string[], topics: [] as string[], modules: [] as unknown[],
  tools: [] as string[], labs: [] as string[],
  certificationTitle: "", careerPaths: [] as unknown[], faqs: [] as unknown[],
};

export default function NewProgrammePage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();

  const [form, setForm] = useState(defaults);
  const [isSaving, setIsSaving] = useState(false);

  function update(key: string, value: unknown) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function handleShortTitleChange(val: string) {
    update("shortTitle", val);
    update("slug", val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }

  async function handleSave() {
    if (!form.shortTitle || !form.title) { toast("Short title and full title are required.", "error"); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/programmes`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast("Programme created successfully!", "success");
        router.push(`${base}/programmes/${data.data.id}`);
      } else { toast(data.error || "Failed to create.", "error"); }
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/programmes`} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader title="New Programme" subtitle="Fill in the basics to create a new programme. You can add modules, tools & more after saving." />
      </div>
      <div className="space-y-5">
        <Card title="Basic Information">
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Short Title *">
                <Input value={form.shortTitle} onChange={(e) => handleShortTitleChange(e.target.value)} placeholder="CCEH" />
              </Field>
              <Field label="URL Slug *">
                <Input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="cceh-certified..." />
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={(e) => update("status", e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Select>
              </Field>
            </div>
            <Field label="Full Title *">
              <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="CCEH — Cyber A1 Certified Ethical Hacker" />
            </Field>
            <Field label="Badge">
              <Input value={form.badge} onChange={(e) => update("badge", e.target.value)} placeholder="Beginner-Friendly Career Track" />
            </Field>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Category">
                <Select value={form.category} onChange={(e) => update("category", e.target.value)}>
                  <option value="career-track">Career Track</option>
                  <option value="specialized">Specialized</option>
                  <option value="corporate">Corporate</option>
                </Select>
              </Field>
              <Field label="Level">
                <Select value={form.level} onChange={(e) => update("level", e.target.value)}>
                  <option>Beginner</option><option>Intermediate</option>
                  <option>Advanced</option><option>Beginner to Advanced</option>
                </Select>
              </Field>
              <Field label="Duration">
                <Input value={form.duration} onChange={(e) => update("duration", e.target.value)} placeholder="3 Months" />
              </Field>
              <Field label="Mode">
                <Input value={form.mode} onChange={(e) => update("mode", e.target.value)} placeholder="Online / Offline" />
              </Field>
            </div>
            <Field label="Short Description">
              <Textarea value={form.description} rows={3} onChange={(e) => update("description", e.target.value)} />
            </Field>
            <Field label="Card Icon" hint="Overrides the auto-detected icon on the programme card">
              <IconPicker value={form.icon} onChange={(name) => update("icon", name)} />
            </Field>
            <Toggle checked={form.isFeatured} onChange={(v) => update("isFeatured", v)} label="Mark as Featured Programme" />
          </div>
        </Card>
      </div>
      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty label="Create Programme" />
    </div>
  );
}
