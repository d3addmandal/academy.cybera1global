"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Select, Toggle, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import ImageUpload from "@/components/admin/ImageUpload";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewEventPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();

  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    title: "", slug: "", type: "workshop", date: today, time: "", venue: "",
    mode: "offline", description: "", image: "", tags: [] as string[],
    registrationLink: "#", isFree: true, isFeatured: false, status: "draft",
  });
  const [isSaving, setIsSaving] = useState(false);

  function update(key: string, value: unknown) { setForm((p) => ({ ...p, [key]: value })); }

  async function handleSave() {
    if (!form.title) { toast("Title is required.", "error"); return; }
    if (!form.slug) update("slug", form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    setIsSaving(true);
    try {
      const body = { ...form, slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") };
      const res = await fetch(`/api/admin/${company}/events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { toast("Event created!", "success"); router.push(`${base}/events/${data.data.id}`); }
      else toast(data.error || "Failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/events`} className="text-slate-400 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader title="New Event" />
      </div>
      <Card title="Event Details">
        <div className="grid gap-4">
          <Field label="Title *"><Input value={form.title} onChange={(e) => { update("title", e.target.value); update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")); }} /></Field>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Event Type">
              <Select value={form.type} onChange={(e) => update("type", e.target.value)}>
                <option value="workshop">Workshop</option><option value="bootcamp">Bootcamp</option>
                <option value="ctf">CTF</option><option value="hackathon">Hackathon</option>
                <option value="webinar">Webinar</option><option value="seminar">Seminar</option>
              </Select>
            </Field>
            <Field label="Date"><Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} /></Field>
            <Field label="Time"><Input value={form.time} onChange={(e) => update("time", e.target.value)} placeholder="10:00 AM – 4:00 PM" /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Venue"><Input value={form.venue} onChange={(e) => update("venue", e.target.value)} placeholder="Cyber A1 Academy, Durgapur" /></Field>
            <Field label="Mode">
              <Select value={form.mode} onChange={(e) => update("mode", e.target.value)}>
                <option value="offline">Offline</option><option value="online">Online</option><option value="hybrid">Hybrid</option>
              </Select>
            </Field>
          </div>
          <Field label="Description"><Textarea value={form.description} rows={4} onChange={(e) => update("description", e.target.value)} /></Field>
          <Field label="Registration Link"><Input value={form.registrationLink} onChange={(e) => update("registrationLink", e.target.value)} /></Field>
          <Field label="Cover Image">
            <ImageUpload value={form.image} onChange={(url) => update("image", url)} company={company} folder="events" aspectClass="aspect-video" />
          </Field>
          <Field label="Tags (comma-separated)"><Input value={form.tags.join(", ")} onChange={(e) => update("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} /></Field>
          <Field label="Status"><Select value={form.status} onChange={(e) => update("status", e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></Select></Field>
          <div className="flex items-center gap-6">
            <Toggle checked={form.isFree} onChange={(v) => update("isFree", v)} label="Free Event" />
            <Toggle checked={form.isFeatured} onChange={(v) => update("isFeatured", v)} label="Featured on Homepage" />
          </div>
        </div>
      </Card>
      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty label="Create Event" />
    </div>
  );
}
