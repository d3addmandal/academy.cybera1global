"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Card, SaveBar } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { Plus, Trash2 } from "lucide-react";
import type { CorporatePageContent } from "@/types/cms";

type Page = CorporatePageContent;
function uid() { return Math.random().toString(36).slice(2); }

export default function CorporatePageEditor() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const { toast } = useToast();
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/${company}/corporate-training`, { credentials: "same-origin" })
      .then((r) => { if (r.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); throw new Error("401"); } return r.json(); })
      .then((d) => { if (d.success) setPage(d.data); })
      .catch((e) => { if (e.message !== "401") toast("Failed to load", "error"); })
      .finally(() => setIsLoading(false));
  }, [company, adminSlug, router, toast]);

  function mark(updater: (prev: Page) => Page) {
    setPage((p) => { if (!p) return p; return updater(p); });
    setIsDirty(true);
  }

  function setHero(k: keyof Page["hero"], v: string) { mark((p) => ({ ...p, hero: { ...p.hero, [k]: v } })); }
  function setHeroCta(k: "text" | "href", v: string) { mark((p) => ({ ...p, hero: { ...p.hero, primaryCta: { ...p.hero.primaryCta, [k]: v } } })); }

  async function handleSave() {
    if (!page) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/corporate-training`, { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(page) });
      if (res.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); return; }
      const d = await res.json();
      if (d.success) { toast("Corporate page saved!", "success"); setIsDirty(false); }
      else toast(d.error || "Save failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!page) return <div className="text-center py-20 text-slate-400">Failed to load page content.</div>;

  return (
    <div className="pb-20 space-y-5">
      <PageHeader title="Corporate Training Page" subtitle="Edit content for the /corporate-training page." />

      {/* Hero */}
      <Card title="Hero Section">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Badge Text"><Input value={page.hero.badge} onChange={(e) => setHero("badge", e.target.value)} /></Field>
          <Field label="Headline"><Input value={page.hero.headline} onChange={(e) => setHero("headline", e.target.value)} /></Field>
          <Field label="Headline Accent (red)"><Input value={page.hero.headlineAccent} onChange={(e) => setHero("headlineAccent", e.target.value)} /></Field>
          <Field label="Description" className="sm:col-span-2"><Textarea rows={3} value={page.hero.description} onChange={(e) => setHero("description", e.target.value)} /></Field>
          <Field label="CTA Text"><Input value={page.hero.primaryCta.text} onChange={(e) => setHeroCta("text", e.target.value)} /></Field>
          <Field label="CTA Link"><Input value={page.hero.primaryCta.href} onChange={(e) => setHeroCta("href", e.target.value)} /></Field>
        </div>
      </Card>

      {/* Training Programs */}
      <Card
        title="Training Programs"
        action={
          <button onClick={() => mark((p) => ({ ...p, programs: [...p.programs, { id: uid(), icon: "Shield", title: "New Program", description: "", duration: "", mode: "", audience: "" }] }))}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
            <Plus className="w-3.5 h-3.5" /> Add Program
          </button>
        }
      >
        <div className="space-y-3">
          {page.programs.map((prog, i) => (
            <div key={prog.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Program {i + 1}</span>
                <button onClick={() => mark((p) => ({ ...p, programs: p.programs.filter((_, idx) => idx !== i) }))} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Field label="Icon" hint="e.g. Shield, Eye, Code"><Input value={prog.icon} onChange={(e) => { const arr = [...page.programs]; arr[i] = { ...prog, icon: e.target.value }; mark((p) => ({ ...p, programs: arr })); }} /></Field>
                <Field label="Title" className="sm:col-span-2"><Input value={prog.title} onChange={(e) => { const arr = [...page.programs]; arr[i] = { ...prog, title: e.target.value }; mark((p) => ({ ...p, programs: arr })); }} /></Field>
                <Field label="Description" className="sm:col-span-3"><Textarea rows={2} value={prog.description} onChange={(e) => { const arr = [...page.programs]; arr[i] = { ...prog, description: e.target.value }; mark((p) => ({ ...p, programs: arr })); }} /></Field>
                <Field label="Duration"><Input value={prog.duration} onChange={(e) => { const arr = [...page.programs]; arr[i] = { ...prog, duration: e.target.value }; mark((p) => ({ ...p, programs: arr })); }} /></Field>
                <Field label="Mode"><Input value={prog.mode} onChange={(e) => { const arr = [...page.programs]; arr[i] = { ...prog, mode: e.target.value }; mark((p) => ({ ...p, programs: arr })); }} /></Field>
                <Field label="Audience"><Input value={prog.audience} onChange={(e) => { const arr = [...page.programs]; arr[i] = { ...prog, audience: e.target.value }; mark((p) => ({ ...p, programs: arr })); }} /></Field>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Benefits */}
      <Card title="Benefits" subtitle="One benefit per line." action={
        <button onClick={() => mark((p) => ({ ...p, benefits: [...p.benefits, ""] }))}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      }>
        <div className="space-y-2">
          {page.benefits.map((b, i) => (
            <div key={i} className="flex gap-2">
              <Input value={b} onChange={(e) => { const arr = [...page.benefits]; arr[i] = e.target.value; mark((p) => ({ ...p, benefits: arr })); }} />
              <button onClick={() => mark((p) => ({ ...p, benefits: p.benefits.filter((_, idx) => idx !== i) }))} className="text-slate-300 hover:text-red-500 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </Card>

      {/* Industries */}
      <Card title="Industries Served" action={
        <button onClick={() => mark((p) => ({ ...p, industries: [...p.industries, { id: uid(), icon: "Building2", name: "" }] }))}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      }>
        <div className="grid sm:grid-cols-2 gap-3">
          {page.industries.map((ind, i) => (
            <div key={ind.id} className="flex items-center gap-2 border border-slate-200 rounded-lg p-3 bg-slate-50">
              <Input className="w-28 flex-shrink-0" placeholder="Icon" value={ind.icon} onChange={(e) => { const arr = [...page.industries]; arr[i] = { ...ind, icon: e.target.value }; mark((p) => ({ ...p, industries: arr })); }} />
              <Input value={ind.name} placeholder="Industry name" onChange={(e) => { const arr = [...page.industries]; arr[i] = { ...ind, name: e.target.value }; mark((p) => ({ ...p, industries: arr })); }} />
              <button onClick={() => mark((p) => ({ ...p, industries: p.industries.filter((_, idx) => idx !== i) }))} className="text-slate-300 hover:text-red-500 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </Card>

      {/* Process */}
      <Card title="Training Process" action={
        <button onClick={() => mark((p) => ({ ...p, process: [...p.process, { step: String(p.process.length + 1).padStart(2, "0"), title: "", description: "" }] }))}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
          <Plus className="w-3.5 h-3.5" /> Add Step
        </button>
      }>
        <div className="space-y-3">
          {page.process.map((s, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4 bg-slate-50 grid sm:grid-cols-[64px_1fr_1fr_auto] gap-3 items-start">
              <Field label="Step"><Input value={s.step} onChange={(e) => { const arr = [...page.process]; arr[i] = { ...s, step: e.target.value }; mark((p) => ({ ...p, process: arr })); }} /></Field>
              <Field label="Title"><Input value={s.title} onChange={(e) => { const arr = [...page.process]; arr[i] = { ...s, title: e.target.value }; mark((p) => ({ ...p, process: arr })); }} /></Field>
              <Field label="Description"><Textarea rows={2} value={s.description} onChange={(e) => { const arr = [...page.process]; arr[i] = { ...s, description: e.target.value }; mark((p) => ({ ...p, process: arr })); }} /></Field>
              <button onClick={() => mark((p) => ({ ...p, process: p.process.filter((_, idx) => idx !== i) }))} className="mt-6 text-slate-300 hover:text-red-500 self-start"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </Card>

      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} />
    </div>
  );
}
