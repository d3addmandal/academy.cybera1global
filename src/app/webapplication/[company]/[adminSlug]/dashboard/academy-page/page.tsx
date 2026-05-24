"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Card, SaveBar } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { Plus, Trash2 } from "lucide-react";
import type { AcademyPageContent } from "@/types/cms";

type Page = AcademyPageContent;

function uid() { return Math.random().toString(36).slice(2); }

export default function AcademyPageEditor() {
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
    fetch(`/api/admin/${company}/academy`, { credentials: "same-origin" })
      .then((r) => { if (r.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); throw new Error("401"); } return r.json(); })
      .then((d) => { if (d.success) setPage(d.data); })
      .catch((e) => { if (e.message !== "401") toast("Failed to load", "error"); })
      .finally(() => setIsLoading(false));
  }, [company, adminSlug, router, toast]);

  function mark<T>(updater: (prev: Page) => Page) {
    setPage((p) => { if (!p) return p; return updater(p); });
    setIsDirty(true);
  }

  function setHero(k: keyof Page["hero"], v: string) { mark((p) => ({ ...p, hero: { ...p.hero, [k]: v } })); }
  function setHeroCta(which: "primaryCta" | "secondaryCta", k: "text" | "href", v: string) {
    mark((p) => ({ ...p, hero: { ...p.hero, [which]: { ...p.hero[which], [k]: v } } }));
  }
  function setAbout(k: keyof Page["about"], v: unknown) { mark((p) => ({ ...p, about: { ...p.about, [k]: v } })); }
  function setWhy(k: keyof Page["why"], v: unknown) { mark((p) => ({ ...p, why: { ...p.why, [k]: v } })); }
  function setMethodology(k: keyof Page["methodology"], v: unknown) { mark((p) => ({ ...p, methodology: { ...p.methodology, [k]: v } })); }
  function setLabs(k: keyof Page["labs"], v: unknown) { mark((p) => ({ ...p, labs: { ...p.labs, [k]: v } })); }
  function setCta(k: keyof Page["cta"], v: unknown) { mark((p) => ({ ...p, cta: { ...p.cta, [k]: v } })); }

  async function handleSave() {
    if (!page) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/academy`, { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(page) });
      if (res.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); return; }
      const d = await res.json();
      if (d.success) { toast("Academy page saved!", "success"); setIsDirty(false); }
      else toast(d.error || "Save failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!page) return <div className="text-center py-20 text-slate-400">Failed to load page content.</div>;

  return (
    <div className="pb-20 space-y-5">
      <PageHeader title="Academy Page" subtitle="Edit content for the /academy page." />

      {/* Hero */}
      <Card title="Hero Section">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Badge Text"><Input value={page.hero.badge} onChange={(e) => setHero("badge", e.target.value)} /></Field>
          <Field label="Headline"><Input value={page.hero.headline} onChange={(e) => setHero("headline", e.target.value)} /></Field>
          <Field label="Headline Accent (red)" className="sm:col-span-2"><Input value={page.hero.headlineAccent} onChange={(e) => setHero("headlineAccent", e.target.value)} /></Field>
          <Field label="Description" className="sm:col-span-2"><Textarea rows={3} value={page.hero.description} onChange={(e) => setHero("description", e.target.value)} /></Field>
          <Field label="Primary CTA Text"><Input value={page.hero.primaryCta.text} onChange={(e) => setHeroCta("primaryCta", "text", e.target.value)} /></Field>
          <Field label="Primary CTA Link"><Input value={page.hero.primaryCta.href} onChange={(e) => setHeroCta("primaryCta", "href", e.target.value)} /></Field>
          <Field label="Secondary CTA Text"><Input value={page.hero.secondaryCta.text} onChange={(e) => setHeroCta("secondaryCta", "text", e.target.value)} /></Field>
          <Field label="Secondary CTA Link"><Input value={page.hero.secondaryCta.href} onChange={(e) => setHeroCta("secondaryCta", "href", e.target.value)} /></Field>
        </div>
      </Card>

      {/* About / Mission & Vision */}
      <Card title="About / Mission & Vision">
        <div className="space-y-4">
          <Field label="Section Title"><Input value={page.about.title} onChange={(e) => setAbout("title", e.target.value)} /></Field>
          <Field label="Paragraph 1"><Textarea rows={3} value={page.about.para1} onChange={(e) => setAbout("para1", e.target.value)} /></Field>
          <Field label="Paragraph 2"><Textarea rows={3} value={page.about.para2} onChange={(e) => setAbout("para2", e.target.value)} /></Field>
          <Field label="Key Highlights (one per line)" hint="Each line becomes a bullet point">
            <Textarea rows={5} value={page.about.bullets.join("\n")} onChange={(e) => setAbout("bullets", e.target.value.split("\n"))} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Mission Statement"><Textarea rows={3} value={page.about.mission} onChange={(e) => setAbout("mission", e.target.value)} /></Field>
            <Field label="Vision Statement"><Textarea rows={3} value={page.about.vision} onChange={(e) => setAbout("vision", e.target.value)} /></Field>
          </div>
        </div>
      </Card>

      {/* Why Choose Us */}
      <Card
        title="Why Choose Us"
        subtitle="Feature cards explaining what makes the academy different."
        action={
          <button onClick={() => setWhy("items", [...page.why.items, { id: uid(), icon: "Shield", title: "New Feature", description: "" }])}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Field label="Section Label"><Input value={page.why.sectionLabel} onChange={(e) => setWhy("sectionLabel", e.target.value)} /></Field>
          <Field label="Section Title"><Input value={page.why.title} onChange={(e) => setWhy("title", e.target.value)} /></Field>
        </div>
        <div className="space-y-3">
          {page.why.items.map((item, i) => (
            <div key={item.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Item {i + 1}</span>
                <button onClick={() => setWhy("items", page.why.items.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Icon Name" hint="e.g. Shield, Monitor"><Input value={item.icon} onChange={(e) => { const items = [...page.why.items]; items[i] = { ...item, icon: e.target.value }; setWhy("items", items); }} /></Field>
                <Field label="Title" className="sm:col-span-2"><Input value={item.title} onChange={(e) => { const items = [...page.why.items]; items[i] = { ...item, title: e.target.value }; setWhy("items", items); }} /></Field>
                <Field label="Description" className="sm:col-span-3"><Textarea rows={2} value={item.description} onChange={(e) => { const items = [...page.why.items]; items[i] = { ...item, description: e.target.value }; setWhy("items", items); }} /></Field>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Methodology */}
      <Card
        title="Learning Methodology"
        subtitle="Step-by-step training process."
        action={
          <button onClick={() => setMethodology("steps", [...page.methodology.steps, { step: String(page.methodology.steps.length + 1).padStart(2, "0"), title: "New Step", description: "" }])}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
            <Plus className="w-3.5 h-3.5" /> Add Step
          </button>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Field label="Section Label"><Input value={page.methodology.sectionLabel} onChange={(e) => setMethodology("sectionLabel", e.target.value)} /></Field>
          <Field label="Section Title"><Input value={page.methodology.title} onChange={(e) => setMethodology("title", e.target.value)} /></Field>
        </div>
        <div className="space-y-3">
          {page.methodology.steps.map((s, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4 bg-slate-50 grid sm:grid-cols-[64px_1fr_1fr_auto] gap-3 items-start">
              <Field label="Step #"><Input value={s.step} onChange={(e) => { const steps = [...page.methodology.steps]; steps[i] = { ...s, step: e.target.value }; setMethodology("steps", steps); }} /></Field>
              <Field label="Title"><Input value={s.title} onChange={(e) => { const steps = [...page.methodology.steps]; steps[i] = { ...s, title: e.target.value }; setMethodology("steps", steps); }} /></Field>
              <Field label="Description"><Textarea rows={2} value={s.description} onChange={(e) => { const steps = [...page.methodology.steps]; steps[i] = { ...s, description: e.target.value }; setMethodology("steps", steps); }} /></Field>
              <button onClick={() => setMethodology("steps", page.methodology.steps.filter((_, idx) => idx !== i))} className="mt-6 text-slate-300 hover:text-red-500 transition-colors self-start"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </Card>

      {/* Training Domains */}
      <Card title="Training Domains" subtitle="One domain name per line." action={
        <button onClick={() => mark((p) => ({ ...p, domains: [...p.domains, "New Domain"] }))}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
          <Plus className="w-3.5 h-3.5" /> Add Domain
        </button>
      }>
        <div className="space-y-2">
          {page.domains.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={d} onChange={(e) => { const arr = [...page.domains]; arr[i] = e.target.value; mark((p) => ({ ...p, domains: arr })); }} />
              <button onClick={() => mark((p) => ({ ...p, domains: p.domains.filter((_, idx) => idx !== i) }))} className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </Card>

      {/* Labs */}
      <Card title="Labs & Infrastructure">
        <div className="space-y-4">
          <Field label="Section Title"><Input value={page.labs.title} onChange={(e) => setLabs("title", e.target.value)} /></Field>
          <Field label="Description"><Textarea rows={3} value={page.labs.description} onChange={(e) => setLabs("description", e.target.value)} /></Field>
          <Field label="Lab Features (one per line)">
            <Textarea rows={6} value={page.labs.bullets.join("\n")} onChange={(e) => setLabs("bullets", e.target.value.split("\n"))} />
          </Field>
        </div>
      </Card>

      {/* Trainers */}
      <Card
        title="Our Trainers"
        action={
          <button onClick={() => mark((p) => ({ ...p, trainers: [...p.trainers, { id: uid(), name: "", role: "", specialization: "", exp: "", certifications: "" }] }))}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
            <Plus className="w-3.5 h-3.5" /> Add Trainer
          </button>
        }
      >
        <div className="space-y-3">
          {page.trainers.map((t, i) => (
            <div key={t.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trainer {i + 1}</span>
                <button onClick={() => mark((p) => ({ ...p, trainers: p.trainers.filter((_, idx) => idx !== i) }))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Field label="Name"><Input value={t.name} onChange={(e) => { const arr = [...page.trainers]; arr[i] = { ...t, name: e.target.value }; mark((p) => ({ ...p, trainers: arr })); }} /></Field>
                <Field label="Role"><Input value={t.role} onChange={(e) => { const arr = [...page.trainers]; arr[i] = { ...t, role: e.target.value }; mark((p) => ({ ...p, trainers: arr })); }} /></Field>
                <Field label="Specialization"><Input value={t.specialization} onChange={(e) => { const arr = [...page.trainers]; arr[i] = { ...t, specialization: e.target.value }; mark((p) => ({ ...p, trainers: arr })); }} /></Field>
                <Field label="Experience"><Input value={t.exp} onChange={(e) => { const arr = [...page.trainers]; arr[i] = { ...t, exp: e.target.value }; mark((p) => ({ ...p, trainers: arr })); }} /></Field>
                <Field label="Certifications" hint="Comma-separated" className="sm:col-span-2"><Input value={t.certifications} onChange={(e) => { const arr = [...page.trainers]; arr[i] = { ...t, certifications: e.target.value }; mark((p) => ({ ...p, trainers: arr })); }} /></Field>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* CTA */}
      <Card title="CTA Section">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Headline" className="sm:col-span-2"><Input value={page.cta.headline} onChange={(e) => setCta("headline", e.target.value)} /></Field>
          <Field label="Primary CTA Text"><Input value={page.cta.primaryCta.text} onChange={(e) => setCta("primaryCta", { ...page.cta.primaryCta, text: e.target.value })} /></Field>
          <Field label="Primary CTA Link"><Input value={page.cta.primaryCta.href} onChange={(e) => setCta("primaryCta", { ...page.cta.primaryCta, href: e.target.value })} /></Field>
          <Field label="Secondary CTA Text"><Input value={page.cta.secondaryCta.text} onChange={(e) => setCta("secondaryCta", { ...page.cta.secondaryCta, text: e.target.value })} /></Field>
          <Field label="Secondary CTA Link"><Input value={page.cta.secondaryCta.href} onChange={(e) => setCta("secondaryCta", { ...page.cta.secondaryCta, href: e.target.value })} /></Field>
        </div>
      </Card>

      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} />
    </div>
  );
}
