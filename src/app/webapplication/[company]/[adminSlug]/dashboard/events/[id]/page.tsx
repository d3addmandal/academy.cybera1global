"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Select, Toggle, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import ImageUpload from "@/components/admin/ImageUpload";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Event } from "@/types/cms";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const id = params.id as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();

  const [form, setForm] = useState<Partial<Event>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/${company}/events/${id}`).then((r) => r.json()).then((d) => { if (d.success) { setForm(d.data); setIsLoading(false); } });
  }, [company, id]);

  function update(key: string, value: unknown) { setForm((p) => ({ ...p, [key]: value })); setIsDirty(true); }

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/events/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { toast("Event saved!", "success"); setIsDirty(false); }
      else toast(data.error || "Save failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading…</div>;

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/events`} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader title={`Edit: ${form.title}`} />
      </div>
      <Card title="Event Details">
        <div className="grid gap-4">
          <Field label="Title *"><Input value={form.title ?? ""} onChange={(e) => update("title", e.target.value)} /></Field>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Type">
              <Select value={form.type ?? "workshop"} onChange={(e) => update("type", e.target.value)}>
                <option value="workshop">Workshop</option><option value="bootcamp">Bootcamp</option>
                <option value="ctf">CTF</option><option value="hackathon">Hackathon</option>
                <option value="webinar">Webinar</option><option value="seminar">Seminar</option>
              </Select>
            </Field>
            <Field label="Date"><Input type="date" value={form.date ?? ""} onChange={(e) => update("date", e.target.value)} /></Field>
            <Field label="Time"><Input value={form.time ?? ""} onChange={(e) => update("time", e.target.value)} /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Venue"><Input value={form.venue ?? ""} onChange={(e) => update("venue", e.target.value)} /></Field>
            <Field label="Mode">
              <Select value={form.mode ?? "offline"} onChange={(e) => update("mode", e.target.value)}>
                <option value="offline">Offline</option><option value="online">Online</option><option value="hybrid">Hybrid</option>
              </Select>
            </Field>
          </div>
          <Field label="Description"><Textarea value={form.description ?? ""} rows={4} onChange={(e) => update("description", e.target.value)} /></Field>
          <Field label="Registration Link"><Input value={form.registrationLink ?? ""} onChange={(e) => update("registrationLink", e.target.value)} /></Field>
          <Field label="Cover Image">
            <ImageUpload value={form.image ?? ""} onChange={(url) => update("image", url)} company={company} folder="events" aspectClass="aspect-video" />
          </Field>
          <Field label="Tags (comma-separated)"><Input value={(form.tags ?? []).join(", ")} onChange={(e) => update("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} /></Field>
          <Field label="Status"><Select value={form.status ?? "draft"} onChange={(e) => update("status", e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></Select></Field>
          <div className="flex items-center gap-6">
            <Toggle checked={form.isFree ?? false} onChange={(v) => update("isFree", v)} label="Free Event" />
            <Toggle checked={form.isFeatured ?? false} onChange={(v) => update("isFeatured", v)} label="Featured" />
          </div>
        </div>
      </Card>
      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} />
    </div>
  );
}
