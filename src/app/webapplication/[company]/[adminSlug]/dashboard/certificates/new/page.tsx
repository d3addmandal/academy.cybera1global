"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Select, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import ImageUpload from "@/components/admin/ImageUpload";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { CertificateTemplate } from "@/types/cms";

export default function NewCertificatePage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();

  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    templateId: "", studentName: "", studentEmail: "", studentPhone: "", studentPhotoUrl: "",
    courseName: "", courseDescription: "", issueDate: today, startDate: "", endDate: "",
    validityText: "", instructorName: "", organizationName: "", organizationLogoUrl: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/${company}/certificate-templates`).then((r) => r.json()).then((d) => {
      if (d.success) {
        setTemplates(d.data);
        const def = d.data.find((t: CertificateTemplate) => t.isDefault) ?? d.data[0];
        if (def) update("templateId", def.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company]);

  function update(key: string, value: unknown) { setForm((p) => ({ ...p, [key]: value })); }

  async function handleSave() {
    if (!form.studentName || !form.courseName || !form.organizationName || !form.templateId) {
      toast("Student name, course name, organization, and template are required.", "error");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/certificates`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { toast("Certificate created!", "success"); router.push(`${base}/certificates/${data.data.id}`); }
      else toast(data.error || "Failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/certificates`} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader title="New Certificate" />
      </div>

      <Card title="Template">
        <Field label="Certificate Template *" hint="Manage templates under Certificate Templates">
          <Select value={form.templateId} onChange={(e) => update("templateId", e.target.value)}>
            <option value="">Select a template…</option>
            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}{t.isDefault ? " (Default)" : ""}</option>)}
          </Select>
        </Field>
      </Card>

      <div className="mt-5">
        <Card title="Student Details">
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Student Name *"><Input value={form.studentName} onChange={(e) => update("studentName", e.target.value)} /></Field>
              <Field label="Student Email"><Input type="email" value={form.studentEmail} onChange={(e) => update("studentEmail", e.target.value)} /></Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Student Mobile"><Input value={form.studentPhone} onChange={(e) => update("studentPhone", e.target.value)} /></Field>
            </div>
            <Field label="Student Photograph">
              <ImageUpload value={form.studentPhotoUrl} onChange={(url) => update("studentPhotoUrl", url)} company={company} folder="certificates/photos" aspectClass="aspect-square" />
            </Field>
          </div>
        </Card>
      </div>

      <div className="mt-5">
        <Card title="Course & Issuance">
          <div className="grid gap-4">
            <Field label="Course Name *"><Input value={form.courseName} onChange={(e) => update("courseName", e.target.value)} /></Field>
            <Field label="Course Description"><Textarea value={form.courseDescription} rows={3} onChange={(e) => update("courseDescription", e.target.value)} /></Field>
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Issue Date *"><Input type="date" value={form.issueDate} onChange={(e) => update("issueDate", e.target.value)} /></Field>
              <Field label="Course Start Date"><Input type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} /></Field>
              <Field label="Course End Date"><Input type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} /></Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Certificate Validity" hint="e.g. Lifetime, Valid for 2 years"><Input value={form.validityText} onChange={(e) => update("validityText", e.target.value)} /></Field>
              <Field label="Instructor Name"><Input value={form.instructorName} onChange={(e) => update("instructorName", e.target.value)} /></Field>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-5">
        <Card title="Organization">
          <div className="grid gap-4">
            <Field label="Organization Name *"><Input value={form.organizationName} onChange={(e) => update("organizationName", e.target.value)} /></Field>
            <Field label="Organization Logo">
              <ImageUpload value={form.organizationLogoUrl} onChange={(url) => update("organizationLogoUrl", url)} company={company} folder="certificates" aspectClass="aspect-square" />
            </Field>
          </div>
        </Card>
      </div>

      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty label="Create Certificate" />
    </div>
  );
}
