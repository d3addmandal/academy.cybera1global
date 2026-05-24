"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Card, SaveBar } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { Plus, Trash2 } from "lucide-react";
import type { InstitutionsPageContent } from "@/types/cms";

type Page = InstitutionsPageContent;
function uid() { return Math.random().toString(36).slice(2); }

export default function InstitutionsPageEditor() {
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
    fetch(`/api/admin/${company}/institutions`, { credentials: "same-origin" })
      .then((r) => { if (r.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); throw new Error("401"); } return r.json(); })
      .then((d) => { if (d.success) setPage(d.data); })
      .catch((e) => { if (e.message !== "401") toast("Failed to load", "error"); })
      .finally(() => setIsLoading(false));
  }, [company, adminSlug, router, toast]);

  function mark(updater: (prev: Page) => Page) {
    setPage((p) => { if (!p) return p; return updater(p); });
    setIsDirty(true);
  }

  function setHero(k: keyof Page["hero"], v: unknown) { mark((p) => ({ ...p, hero: { ...p.hero, [k]: v } })); }
  function setHeroCta(k: "text" | "href", v: string) { mark((p) => ({ ...p, hero: { ...p.hero, primaryCta: { ...p.hero.primaryCta, [k]: v } } })); }

  async function handleSave() {
    if (!page) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/institutions`, { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(page) });
      if (res.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); return; }
      const d = await res.json();
      if (d.success) { toast("Institutions page saved!", "success"); setIsDirty(false); }
      else toast(d.error || "Save failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!page) return <div className="text-center py-20 text-slate-400">Failed to load page content.</div>;

  return (
    <div className="pb-20 space-y-5">
      <PageHeader title="Institutions Page" subtitle="Edit content for the /institutions page." />

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

      {/* Hero Stats */}
      <Card title="Hero Stats" action={
        <button onClick={() => setHero("stats", [...page.hero.stats, { value: "0+", label: "New Stat" }])}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
          <Plus className="w-3.5 h-3.5" /> Add Stat
        </button>
      }>
        <div className="grid sm:grid-cols-2 gap-3">
          {page.hero.stats.map((s, i) => (
            <div key={i} className="flex items-center gap-2 border border-slate-200 rounded-lg p-3 bg-slate-50">
              <Input className="w-24 flex-shrink-0 font-bold" placeholder="25+" value={s.value} onChange={(e) => { const arr = [...page.hero.stats]; arr[i] = { ...s, value: e.target.value }; setHero("stats", arr); }} />
              <Input value={s.label} placeholder="Label" onChange={(e) => { const arr = [...page.hero.stats]; arr[i] = { ...s, label: e.target.value }; setHero("stats", arr); }} />
              <button onClick={() => setHero("stats", page.hero.stats.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </Card>

      {/* Services */}
      <Card title="Collaboration Services" action={
        <button onClick={() => mark((p) => ({ ...p, services: [...p.services, { id: uid(), icon: "BookOpen", title: "", description: "", duration: "" }] }))}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
          <Plus className="w-3.5 h-3.5" /> Add Service
        </button>
      }>
        <div className="space-y-3">
          {page.services.map((svc, i) => (
            <div key={svc.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500">Service {i + 1}</span>
                <button onClick={() => mark((p) => ({ ...p, services: p.services.filter((_, idx) => idx !== i) }))} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Icon"><Input value={svc.icon} onChange={(e) => { const arr = [...page.services]; arr[i] = { ...svc, icon: e.target.value }; mark((p) => ({ ...p, services: arr })); }} /></Field>
                <Field label="Title" className="sm:col-span-2"><Input value={svc.title} onChange={(e) => { const arr = [...page.services]; arr[i] = { ...svc, title: e.target.value }; mark((p) => ({ ...p, services: arr })); }} /></Field>
                <Field label="Description" className="sm:col-span-2"><Textarea rows={2} value={svc.description} onChange={(e) => { const arr = [...page.services]; arr[i] = { ...svc, description: e.target.value }; mark((p) => ({ ...p, services: arr })); }} /></Field>
                <Field label="Duration"><Input value={svc.duration} onChange={(e) => { const arr = [...page.services]; arr[i] = { ...svc, duration: e.target.value }; mark((p) => ({ ...p, services: arr })); }} /></Field>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Collaboration Models */}
      <Card title="Collaboration Models (Table)" action={
        <button onClick={() => mark((p) => ({ ...p, models: [...p.models, { id: uid(), title: "", duration: "", participants: "", cost: "" }] }))}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
          <Plus className="w-3.5 h-3.5" /> Add Row
        </button>
      }>
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_100px_120px_120px_32px] gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
            <span>Program</span><span>Duration</span><span>Participants</span><span>Cost</span><span />
          </div>
          {page.models.map((m, i) => (
            <div key={m.id} className="grid grid-cols-[1fr_100px_120px_120px_32px] gap-2 items-center">
              <Input value={m.title} placeholder="Program name" onChange={(e) => { const arr = [...page.models]; arr[i] = { ...m, title: e.target.value }; mark((p) => ({ ...p, models: arr })); }} />
              <Input value={m.duration} placeholder="Duration" onChange={(e) => { const arr = [...page.models]; arr[i] = { ...m, duration: e.target.value }; mark((p) => ({ ...p, models: arr })); }} />
              <Input value={m.participants} placeholder="Participants" onChange={(e) => { const arr = [...page.models]; arr[i] = { ...m, participants: e.target.value }; mark((p) => ({ ...p, models: arr })); }} />
              <Input value={m.cost} placeholder="Cost" onChange={(e) => { const arr = [...page.models]; arr[i] = { ...m, cost: e.target.value }; mark((p) => ({ ...p, models: arr })); }} />
              <button onClick={() => mark((p) => ({ ...p, models: p.models.filter((_, idx) => idx !== i) }))} className="text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </Card>

      {/* CTA */}
      <Card title="CTA Section">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Headline"><Input value={page.cta.headline} onChange={(e) => mark((p) => ({ ...p, cta: { ...p.cta, headline: e.target.value } }))} /></Field>
          <Field label="Description"><Input value={page.cta.description} onChange={(e) => mark((p) => ({ ...p, cta: { ...p.cta, description: e.target.value } }))} /></Field>
        </div>
      </Card>

      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} />
    </div>
  );
}
