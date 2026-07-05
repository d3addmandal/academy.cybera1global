"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Select, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Programme, CertificateTemplate } from "@/types/cms";

export default function NewCertificatePage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    programmeId: "", templateId: "", studentName: "", studentEmail: "", studentPhone: "", studentDob: "",
    issueDate: today, startDate: "", endDate: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/${company}/programmes`).then((r) => r.json()),
      fetch(`/api/admin/${company}/certificate-templates`).then((r) => r.json()),
    ]).then(([programmesRes, templatesRes]) => {
      if (programmesRes.success) setProgrammes(programmesRes.data);
      if (templatesRes.success) setTemplates(templatesRes.data);
    });
  }, [company]);

  const courseTemplates = templates.filter((t) => t.programmeId === form.programmeId);

  function update(key: string, value: unknown) { setForm((p) => ({ ...p, [key]: value })); }

  function selectCourse(programmeId: string) {
    const matches = templates.filter((t) => t.programmeId === programmeId);
    setForm((p) => ({ ...p, programmeId, templateId: matches[0]?.id ?? "" }));
  }

  async function handleSave() {
    if (!form.studentName || !form.programmeId || !form.issueDate) {
      toast("Student name, course name, and issue date are required.", "error");
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

      <Card title="Course & Template">
        <div className="grid gap-4">
          <Field label="Course Name *">
            <Select value={form.programmeId} onChange={(e) => selectCourse(e.target.value)}>
              <option value="">Select a course…</option>
              {programmes.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </Select>
          </Field>

          {form.programmeId && courseTemplates.length === 0 && (
            <p className="text-xs text-red-600">
              No certificate template configured for this course.{" "}
              <Link href={`${base}/certificate-templates/new`} className="underline font-semibold">Create one</Link> first.
            </p>
          )}

          {courseTemplates.length > 0 && (
            <Field label="Certificate Template *" hint="Which design to issue this certificate with">
              <Select value={form.templateId} onChange={(e) => update("templateId", e.target.value)}>
                {courseTemplates.map((t) => <option key={t.id} value={t.id}>{t.name}{t.isDefault ? " (Default)" : ""}</option>)}
              </Select>
            </Field>
          )}
        </div>
      </Card>

      <div className="mt-5">
        <Card title="Student Details">
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Student Name *"><Input value={form.studentName} onChange={(e) => update("studentName", e.target.value)} /></Field>
              <Field label="Student Date Of Birth"><Input type="date" value={form.studentDob} onChange={(e) => update("studentDob", e.target.value)} /></Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Student Mobile"><Input value={form.studentPhone} onChange={(e) => update("studentPhone", e.target.value)} /></Field>
              <Field label="Student Email"><Input type="email" value={form.studentEmail} onChange={(e) => update("studentEmail", e.target.value)} /></Field>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-5">
        <Card title="Issuance">
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Issue Date *"><Input type="date" value={form.issueDate} onChange={(e) => update("issueDate", e.target.value)} /></Field>
            <Field label="Course Start Date"><Input type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} /></Field>
            <Field label="Course End Date"><Input type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} /></Field>
          </div>
        </Card>
      </div>

      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty label="Create Certificate" />
    </div>
  );
}
