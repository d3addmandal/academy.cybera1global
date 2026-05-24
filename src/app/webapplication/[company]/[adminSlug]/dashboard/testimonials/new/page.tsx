"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Select, Toggle, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import ImageUpload from "@/components/admin/ImageUpload";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewTestimonialPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", role: "", company: "", companyLogoUrl: "", imageUrl: "", quote: "", programme: "", rating: 5, linkedIn: "", isFeatured: false, status: "published", order: 0 });
  const [isSaving, setIsSaving] = useState(false);
  function update(key: string, value: unknown) { setForm((p) => ({ ...p, [key]: value })); }
  async function handleSave() {
    if (!form.name || !form.quote) { toast("Name and quote are required.", "error"); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/testimonials`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { toast("Testimonial added!", "success"); router.push(`${base}/testimonials`); }
      else toast(data.error || "Failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }
  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/testimonials`} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader title="Add Testimonial" />
      </div>
      <Card title="Student Details">
        <div className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name *"><Input value={form.name} onChange={(e) => update("name", e.target.value)} /></Field>
            <Field label="Job Role"><Input value={form.role} onChange={(e) => update("role", e.target.value)} placeholder="Security Analyst" /></Field>
            <Field label="Company *"><Input value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Deloitte" /></Field>
            <Field label="Programme Completed"><Input value={form.programme} onChange={(e) => update("programme", e.target.value)} placeholder="CCSE" /></Field>
          </div>
          <Field label="Testimonial Quote *"><Textarea value={form.quote} rows={4} onChange={(e) => update("quote", e.target.value)} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Rating">
              <Select value={String(form.rating)} onChange={(e) => update("rating", Number(e.target.value))}>
                {[5,4,3,2,1].map((r) => <option key={r} value={r}>{"★".repeat(r)} ({r}/5)</option>)}
              </Select>
            </Field>
            <Field label="LinkedIn URL"><Input value={form.linkedIn} onChange={(e) => update("linkedIn", e.target.value)} placeholder="https://linkedin.com/in/..." /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Student Photo">
              <ImageUpload value={form.imageUrl} onChange={(url) => update("imageUrl", url)} company={company} folder="testimonials" aspectClass="aspect-square" />
            </Field>
            <Field label="Company Logo">
              <ImageUpload value={form.companyLogoUrl} onChange={(url) => update("companyLogoUrl", url)} company={company} folder="companies" aspectClass="aspect-video" />
            </Field>
          </div>
          <div className="flex items-center gap-6">
            <Toggle checked={form.isFeatured} onChange={(v) => update("isFeatured", v)} label="Featured on Homepage" />
          </div>
        </div>
      </Card>
      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty label="Save Testimonial" />
    </div>
  );
}
