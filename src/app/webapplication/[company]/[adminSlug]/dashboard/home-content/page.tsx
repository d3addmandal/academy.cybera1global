"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Card, Field, Input, Textarea, Toggle, SaveBar, Select } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import ImageUpload from "@/components/admin/ImageUpload";
import MultiImageUpload from "@/components/admin/MultiImageUpload";
import type { HomePageContent } from "@/types/cms";
import { Plus, Trash2, GripVertical } from "lucide-react";

const TABS = [
  { id: "hero", label: "Hero" },
  { id: "trust", label: "Trust Strip" },
  { id: "programmes", label: "Programmes" },
  { id: "stats", label: "Stats" },
  { id: "why", label: "Why Us" },
  { id: "roadmap", label: "Career Roadmap" },
  { id: "corporate", label: "Corporate" },
  { id: "institutional", label: "Institutional" },
  { id: "events", label: "Events" },
  { id: "testimonials", label: "Testimonials" },
  { id: "blog", label: "Blog" },
  { id: "faqs", label: "FAQs" },
  { id: "cta", label: "CTA Banner" },
  { id: "footer", label: "Footer" },
];

export default function HomeContentPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("hero");
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [availableMenus, setAvailableMenus] = useState<{ id: string; header: string }[]>([]);

  async function fetchContent() {
    setFetchError("");
    try {
      const res = await fetch(`/api/admin/${company}/home`, { credentials: "same-origin" });
      if (res.status === 401) {
        router.replace(`/webapplication/${company}/${adminSlug}/login`);
        return;
      }
      const data = await res.json();
      if (data.success && data.data) {
        setContent(data.data);
      } else {
        setFetchError(data.error ?? "Failed to load home content.");
      }
    } catch {
      setFetchError("Network error. Please refresh.");
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchContent();
    fetch(`/api/admin/${company}/menus`).then(r => r.json()).then(d => { if (d.success) setAvailableMenus(d.data.map((m: { id: string; header: string }) => ({ id: m.id, header: m.header }))); });
  }, [company]);

  function update<T>(path: string, value: T) {
    setContent((prev) => {
      if (!prev) return prev;
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let ref: Record<string, unknown> = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        ref = ref[keys[i]] as Record<string, unknown>;
      }
      ref[keys[keys.length - 1]] = value;
      return updated;
    });
    setIsDirty(true);
  }

  async function handleSave() {
    if (!content) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/home`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(content),
      });
      if (res.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); return; }
      const data = await res.json();
      if (data.success) {
        toast("Home page content saved successfully!", "success");
        setIsDirty(false);
      } else {
        toast(data.error || "Failed to save", "error");
      }
    } catch {
      toast("Network error", "error");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading content…</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-2">Failed to load</p>
          <p className="text-slate-400 text-sm mb-4">{fetchError}</p>
          <button onClick={fetchContent} className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors">Retry</button>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="pb-20">
      <PageHeader
        title="Home Page Content"
        subtitle="Control every section of the homepage from here."
      />

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-1.5 mb-6 bg-white border border-slate-200 rounded-xl p-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-5">
        {/* ── HERO ─────────────────────────────────────────── */}
        {activeTab === "hero" && (
          <>
            <Card title="Hero Badge & Headline">
              <div className="grid gap-4">
                <Field label="Badge Text" htmlFor="badge">
                  <Input id="badge" value={content.hero.badge} onChange={(e) => update("hero.badge", e.target.value)} placeholder="Enterprise-Focused Cybersecurity Training Platform" />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Headline Line 1">
                    <Input value={content.hero.headlineLine1} onChange={(e) => update("hero.headlineLine1", e.target.value)} />
                  </Field>
                  <Field label="Headline Line 2">
                    <Input value={content.hero.headlineLine2} onChange={(e) => update("hero.headlineLine2", e.target.value)} />
                  </Field>
                </div>
                <Field label="Headline Accent (red text)">
                  <Input value={content.hero.headlineAccent} onChange={(e) => update("hero.headlineAccent", e.target.value)} />
                </Field>
                <Field label="Sub-headline">
                  <Textarea value={content.hero.subheadline} onChange={(e) => update("hero.subheadline", e.target.value)} rows={3} />
                </Field>
                <Field label="Hero Background Image">
                  <ImageUpload value={content.hero.heroImage} onChange={(url) => update("hero.heroImage", url)} company={company} folder="home" aspectClass="aspect-video" />
                </Field>
              </div>
            </Card>

            <Card title="Hero Buttons">
              <div className="space-y-3">
                {content.hero.buttons.map((btn, i) => (
                  <div key={i} className="grid sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg">
                    <Field label={`Button ${i + 1} Label`}>
                      <Input value={btn.label} onChange={(e) => { const b = [...content.hero.buttons]; b[i] = { ...b[i], label: e.target.value }; update("hero.buttons", b); }} />
                    </Field>
                    <Field label="Link / URL">
                      <Input value={btn.href} onChange={(e) => { const b = [...content.hero.buttons]; b[i] = { ...b[i], href: e.target.value }; update("hero.buttons", b); }} />
                    </Field>
                    <Field label="Style">
                      <Select value={btn.variant} onChange={(e) => { const b = [...content.hero.buttons]; b[i] = { ...b[i], variant: e.target.value as "primary" | "outline" | "ghost" }; update("hero.buttons", b); }}>
                        <option value="primary">Primary (Red)</option>
                        <option value="outline">Outline</option>
                        <option value="ghost">Ghost (Text)</option>
                      </Select>
                    </Field>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Trust Icons Row">
              <div className="space-y-2">
                {content.hero.trustItems.map((item, i) => (
                  <div key={i} className="grid sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
                    <Field label="Icon Name (Lucide)">
                      <Input value={item.icon} onChange={(e) => { const t = [...content.hero.trustItems]; t[i] = { ...t[i], icon: e.target.value }; update("hero.trustItems", t); }} placeholder="Shield, Users, etc." />
                    </Field>
                    <Field label="Label">
                      <Input value={item.label} onChange={(e) => { const t = [...content.hero.trustItems]; t[i] = { ...t[i], label: e.target.value }; update("hero.trustItems", t); }} />
                    </Field>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Floating Cards">
              {(["popularProgram", "upcomingBatch", "careerSupport"] as const).map((cardKey) => {
                const card = content.hero.floatingCards[cardKey];
                const labels: Record<string, string> = { popularProgram: "Popular Program", upcomingBatch: "Upcoming Batch", careerSupport: "Career Support" };
                return (
                  <div key={cardKey} className="mb-4 p-4 border border-slate-100 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-700">{labels[cardKey]} Card</h4>
                      <Toggle checked={card.enabled} onChange={(v) => update(`hero.floatingCards.${cardKey}.enabled`, v)} label="Enabled" size="sm" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="Badge Text">
                        <Input value={card.badgeText} onChange={(e) => update(`hero.floatingCards.${cardKey}.badgeText`, e.target.value)} />
                      </Field>
                      <Field label="Title">
                        <Input value={card.title} onChange={(e) => update(`hero.floatingCards.${cardKey}.title`, e.target.value)} />
                      </Field>
                      <Field label="Subtitle">
                        <Input value={card.subtitle} onChange={(e) => update(`hero.floatingCards.${cardKey}.subtitle`, e.target.value)} />
                      </Field>
                      <Field label="Link URL">
                        <Input value={card.href} onChange={(e) => update(`hero.floatingCards.${cardKey}.href`, e.target.value)} />
                      </Field>
                    </div>
                  </div>
                );
              })}
            </Card>
          </>
        )}

        {/* ── TRUST STRIP ──────────────────────────────────── */}
        {activeTab === "trust" && (
          <Card title="Trust Strip" subtitle="Horizontal scrolling strip below the hero">
            <div className="space-y-2 mb-4">
              {content.trustStrip.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                  <div className="flex-1 grid sm:grid-cols-2 gap-3">
                    <Input value={item.icon} placeholder="Icon name (Lucide)" onChange={(e) => { const t = [...content.trustStrip]; t[i] = { ...t[i], icon: e.target.value }; update("trustStrip", t); }} />
                    <Input value={item.label} placeholder="Label text" onChange={(e) => { const t = [...content.trustStrip]; t[i] = { ...t[i], label: e.target.value }; update("trustStrip", t); }} />
                  </div>
                  <button onClick={() => update("trustStrip", content.trustStrip.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => update("trustStrip", [...content.trustStrip, { icon: "Shield", label: "New Item" }])} className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </Card>
        )}

        {/* ── PROGRAMMES CONFIG ─────────────────────────────── */}
        {activeTab === "programmes" && (
          <Card title="Featured Programmes Section">
            <div className="grid gap-4">
              <Field label="Section Label (small text)">
                <Input value={content.programmes.sectionLabel} onChange={(e) => update("programmes.sectionLabel", e.target.value)} />
              </Field>
              <Field label="Section Title">
                <Input value={content.programmes.title} onChange={(e) => update("programmes.title", e.target.value)} />
              </Field>
              <Field label="Subtitle">
                <Input value={content.programmes.subtitle} onChange={(e) => update("programmes.subtitle", e.target.value)} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="CTA Button Text">
                  <Input value={content.programmes.ctaText} onChange={(e) => update("programmes.ctaText", e.target.value)} />
                </Field>
                <Field label="CTA Button Link">
                  <Input value={content.programmes.ctaLink} onChange={(e) => update("programmes.ctaLink", e.target.value)} />
                </Field>
              </div>
              <Field label="Featured Programme IDs" hint="Comma-separated programme IDs. Leave empty to show all featured programmes.">
                <Textarea
                  value={content.programmes.featuredProgrammeIds.join(", ")}
                  onChange={(e) => update("programmes.featuredProgrammeIds", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                  rows={2}
                />
              </Field>
            </div>
          </Card>
        )}

        {/* ── STATS ─────────────────────────────────────────── */}
        {activeTab === "stats" && (
          <Card title="Statistics Numbers">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Expert Trainers">
                <Input value={content.stats.trainers} onChange={(e) => update("stats.trainers", e.target.value)} placeholder="20+" />
              </Field>
              <Field label="Hands-on Labs">
                <Input value={content.stats.labs} onChange={(e) => update("stats.labs", e.target.value)} placeholder="50+" />
              </Field>
              <Field label="Students Trained">
                <Input value={content.stats.students} onChange={(e) => update("stats.students", e.target.value)} placeholder="1000+" />
              </Field>
              <Field label="Workshops & Events">
                <Input value={content.stats.workshops} onChange={(e) => update("stats.workshops", e.target.value)} placeholder="100+" />
              </Field>
            </div>
          </Card>
        )}

        {/* ── WHY US ────────────────────────────────────────── */}
        {activeTab === "why" && (
          <>
            <Card title="Why Choose Us — Section Header">
              <div className="grid gap-4">
                <Field label="Section Label">
                  <Input value={content.why.sectionLabel} onChange={(e) => update("why.sectionLabel", e.target.value)} />
                </Field>
                <Field label="Title">
                  <Input value={content.why.title} onChange={(e) => update("why.title", e.target.value)} />
                </Field>
                <Field label="Subtitle">
                  <Input value={content.why.subtitle} onChange={(e) => update("why.subtitle", e.target.value)} />
                </Field>
              </div>
            </Card>

            <Card title="Feature Items">
              <div className="space-y-4">
                {content.why.features.map((feat, i) => (
                  <div key={feat.id} className="p-4 border border-slate-100 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-700">Feature {i + 1}</h4>
                      <button onClick={() => update("why.features", content.why.features.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="Icon (Lucide)">
                        <Input value={feat.icon} onChange={(e) => { const f = [...content.why.features]; f[i] = { ...f[i], icon: e.target.value }; update("why.features", f); }} />
                      </Field>
                      <Field label="Title">
                        <Input value={feat.title} onChange={(e) => { const f = [...content.why.features]; f[i] = { ...f[i], title: e.target.value }; update("why.features", f); }} />
                      </Field>
                      <Field label="Description" className="sm:col-span-2">
                        <Input value={feat.description} onChange={(e) => { const f = [...content.why.features]; f[i] = { ...f[i], description: e.target.value }; update("why.features", f); }} />
                      </Field>
                      <Field label="Bullet Points (one per line)" className="sm:col-span-2">
                        <Textarea
                          value={feat.points.join("\n")}
                          rows={3}
                          onChange={(e) => { const f = [...content.why.features]; f[i] = { ...f[i], points: e.target.value.split("\n").filter(Boolean) }; update("why.features", f); }}
                        />
                      </Field>
                    </div>
                  </div>
                ))}
                <button onClick={() => update("why.features", [...content.why.features, { id: crypto.randomUUID(), icon: "Shield", title: "New Feature", description: "", points: [] }])} className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700">
                  <Plus className="w-4 h-4" /> Add Feature
                </button>
              </div>
            </Card>
          </>
        )}

        {/* ── CAREER ROADMAP ───────────────────────────────── */}
        {activeTab === "roadmap" && (
          <>
          <Card title="Section Settings">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Section Label">
                <Input value={content.careerRoadmap.sectionLabel} onChange={(e) => update("careerRoadmap.sectionLabel", e.target.value)} />
              </Field>
              <Field label="Title">
                <Input value={content.careerRoadmap.title} onChange={(e) => update("careerRoadmap.title", e.target.value)} />
              </Field>
              <Field label="CTA Text">
                <Input value={content.careerRoadmap.ctaText} onChange={(e) => update("careerRoadmap.ctaText", e.target.value)} />
              </Field>
              <Field label="CTA Link">
                <Input value={content.careerRoadmap.ctaLink} onChange={(e) => update("careerRoadmap.ctaLink", e.target.value)} />
              </Field>
            </div>
          </Card>

          {content.careerRoadmap.tracks.map((track, ti) => (
            <Card key={track.id} title={`Track: ${track.label || "Untitled"}`}>
              <div className="space-y-4">
                {/* Track name + delete */}
                <div className="flex items-center gap-3">
                  <Field label="Track Name" className="flex-1">
                    <Input
                      value={track.label}
                      onChange={(e) => {
                        const t = JSON.parse(JSON.stringify(content.careerRoadmap.tracks));
                        t[ti].label = e.target.value;
                        update("careerRoadmap.tracks", t);
                      }}
                    />
                  </Field>
                  <button
                    onClick={() => update("careerRoadmap.tracks", content.careerRoadmap.tracks.filter((_, j) => j !== ti))}
                    className="mt-6 text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Stages */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stages (up to 4)</p>
                  {track.stages.map((stage, si) => (
                    <div key={si} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600">Stage {si + 1}</span>
                        <button
                          onClick={() => {
                            const t = JSON.parse(JSON.stringify(content.careerRoadmap.tracks));
                            t[ti].stages = t[ti].stages.filter((_: unknown, j: number) => j !== si);
                            update("careerRoadmap.tracks", t);
                          }}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Field label="Level (e.g. Beginner)">
                          <Input
                            value={stage.level}
                            onChange={(e) => {
                              const t = JSON.parse(JSON.stringify(content.careerRoadmap.tracks));
                              t[ti].stages[si].level = e.target.value;
                              update("careerRoadmap.tracks", t);
                            }}
                          />
                        </Field>
                        <Field label="Duration (e.g. 0–6 Months)">
                          <Input
                            value={stage.duration}
                            onChange={(e) => {
                              const t = JSON.parse(JSON.stringify(content.careerRoadmap.tracks));
                              t[ti].stages[si].duration = e.target.value;
                              update("careerRoadmap.tracks", t);
                            }}
                          />
                        </Field>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <Field label="Topics (one per line)">
                          <textarea
                            rows={4}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none"
                            value={stage.topics.join("\n")}
                            onChange={(e) => {
                              const t = JSON.parse(JSON.stringify(content.careerRoadmap.tracks));
                              t[ti].stages[si].topics = e.target.value.split("\n").filter(Boolean);
                              update("careerRoadmap.tracks", t);
                            }}
                          />
                        </Field>
                        <Field label="Certifications (one per line)">
                          <textarea
                            rows={4}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none"
                            value={stage.certifications.join("\n")}
                            onChange={(e) => {
                              const t = JSON.parse(JSON.stringify(content.careerRoadmap.tracks));
                              t[ti].stages[si].certifications = e.target.value.split("\n").filter(Boolean);
                              update("careerRoadmap.tracks", t);
                            }}
                          />
                        </Field>
                        <Field label="Job Roles (one per line)">
                          <textarea
                            rows={4}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none"
                            value={stage.jobs.join("\n")}
                            onChange={(e) => {
                              const t = JSON.parse(JSON.stringify(content.careerRoadmap.tracks));
                              t[ti].stages[si].jobs = e.target.value.split("\n").filter(Boolean);
                              update("careerRoadmap.tracks", t);
                            }}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                  {track.stages.length < 4 && (
                    <button
                      onClick={() => {
                        const t = JSON.parse(JSON.stringify(content.careerRoadmap.tracks));
                        t[ti].stages.push({ level: "New Level", duration: "0–6 Months", topics: [], certifications: [], jobs: [] });
                        update("careerRoadmap.tracks", t);
                      }}
                      className="w-full border-2 border-dashed border-slate-200 rounded-lg py-2.5 text-sm text-slate-400 hover:border-red-300 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Stage
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          <button
            onClick={() => update("careerRoadmap.tracks", [...content.careerRoadmap.tracks, { id: crypto.randomUUID(), label: "New Track", stages: [] }])}
            className="w-full border-2 border-dashed border-slate-200 rounded-xl py-3 text-sm text-slate-400 hover:border-red-300 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Track
          </button>
          </>
        )}

        {/* ── CORPORATE ────────────────────────────────────── */}
        {activeTab === "corporate" && (
          <Card title="Corporate Training Section">
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Section Label">
                  <Input value={content.corporate.sectionLabel} onChange={(e) => update("corporate.sectionLabel", e.target.value)} />
                </Field>
                <Field label="Title">
                  <Input value={content.corporate.title} onChange={(e) => update("corporate.title", e.target.value)} />
                </Field>
                <Field label="Highlight (red text)">
                  <Input value={content.corporate.highlight} onChange={(e) => update("corporate.highlight", e.target.value)} />
                </Field>
                <Field label="Subtitle">
                  <Input value={content.corporate.subtitle} onChange={(e) => update("corporate.subtitle", e.target.value)} />
                </Field>
                <Field label="CTA Text">
                  <Input value={content.corporate.ctaText} onChange={(e) => update("corporate.ctaText", e.target.value)} />
                </Field>
                <Field label="CTA Link">
                  <Input value={content.corporate.ctaLink} onChange={(e) => update("corporate.ctaLink", e.target.value)} />
                </Field>
                <Field label="Stat Value (e.g. 500+)">
                  <Input value={content.corporate.statValue} onChange={(e) => update("corporate.statValue", e.target.value)} />
                </Field>
                <Field label="Stat Label">
                  <Input value={content.corporate.statLabel} onChange={(e) => update("corporate.statLabel", e.target.value)} />
                </Field>
              </div>
              <Field label="Section Background Image" hint="Upload a photo — it appears on the right side of the card with a dark gradient overlay">
                <ImageUpload value={content.corporate.image} onChange={(url) => update("corporate.image", url)} company={company} folder="home" aspectClass="aspect-video" />
              </Field>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Service Items</label>
                {content.corporate.services.map((svc, i) => (
                  <div key={i} className="flex items-center gap-3 mb-2">
                    <Input value={svc.icon} placeholder="Icon" onChange={(e) => { const s = [...content.corporate.services]; s[i] = { ...s[i], icon: e.target.value }; update("corporate.services", s); }} className="w-28" />
                    <Input value={svc.label} placeholder="Label" onChange={(e) => { const s = [...content.corporate.services]; s[i] = { ...s[i], label: e.target.value }; update("corporate.services", s); }} className="flex-1" />
                    <button onClick={() => update("corporate.services", content.corporate.services.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => update("corporate.services", [...content.corporate.services, { icon: "Shield", label: "New Service" }])} className="flex items-center gap-2 text-sm text-red-600 font-semibold mt-2">
                  <Plus className="w-4 h-4" /> Add Service
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* ── INSTITUTIONAL ────────────────────────────────── */}
        {activeTab === "institutional" && (
          <Card title="Institutional Collaboration Section">
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Section Label">
                  <Input value={content.institutional.sectionLabel} onChange={(e) => update("institutional.sectionLabel", e.target.value)} />
                </Field>
                <Field label="Title">
                  <Input value={content.institutional.title} onChange={(e) => update("institutional.title", e.target.value)} />
                </Field>
                <Field label="Highlight (red text)">
                  <Input value={content.institutional.highlight} onChange={(e) => update("institutional.highlight", e.target.value)} />
                </Field>
                <Field label="Subtitle">
                  <Input value={content.institutional.subtitle} onChange={(e) => update("institutional.subtitle", e.target.value)} />
                </Field>
                <Field label="CTA Text">
                  <Input value={content.institutional.ctaText} onChange={(e) => update("institutional.ctaText", e.target.value)} />
                </Field>
                <Field label="CTA Link">
                  <Input value={content.institutional.ctaLink} onChange={(e) => update("institutional.ctaLink", e.target.value)} />
                </Field>
              </div>
              <Field label="Section Background Image" hint="Upload a photo — it appears on the right side of the card with a dark gradient overlay">
                <ImageUpload value={content.institutional.image} onChange={(url) => update("institutional.image", url)} company={company} folder="home" aspectClass="aspect-video" />
              </Field>
            </div>
          </Card>
        )}

        {/* ── EVENTS CONFIG ────────────────────────────────── */}
        {activeTab === "events" && (
          <>
            <Card title="Events & Community Section">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Section Label">
                  <Input value={content.events.sectionLabel} onChange={(e) => update("events.sectionLabel", e.target.value)} />
                </Field>
                <Field label="Title">
                  <Input value={content.events.title} onChange={(e) => update("events.title", e.target.value)} />
                </Field>
                <Field label="Subtitle" className="sm:col-span-2">
                  <Input value={content.events.subtitle} onChange={(e) => update("events.subtitle", e.target.value)} />
                </Field>
                <Field label="CTA Text">
                  <Input value={content.events.ctaText} onChange={(e) => update("events.ctaText", e.target.value)} />
                </Field>
                <Field label="CTA Link">
                  <Input value={content.events.ctaLink} onChange={(e) => update("events.ctaLink", e.target.value)} />
                </Field>
                <Field label="Featured Event IDs (comma-separated)" className="sm:col-span-2" hint="Leave blank to auto-select featured events">
                  <Input value={content.events.featuredEventIds.join(", ")} onChange={(e) => update("events.featuredEventIds", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
                </Field>
              </div>
            </Card>

            <Card title="Event Gallery Images" subtitle="Photos shown on the homepage (1 large + grid). First image is the main large photo.">
              <MultiImageUpload
                values={content.events.galleryImages ?? []}
                onChange={(urls) => update("events.galleryImages", urls)}
                company={company}
                folder="events/gallery"
                maxFiles={10}
              />
            </Card>
          </>
        )}

        {/* ── TESTIMONIALS CONFIG ──────────────────────────── */}
        {activeTab === "testimonials" && (
          <>
            <Card title="Student Testimonials Section">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Section Label">
                  <Input value={content.testimonials.sectionLabel} onChange={(e) => update("testimonials.sectionLabel", e.target.value)} />
                </Field>
                <Field label="Title">
                  <Input value={content.testimonials.title} onChange={(e) => update("testimonials.title", e.target.value)} />
                </Field>
                <Field label="Featured Testimonial IDs (comma-separated)" className="sm:col-span-2" hint="Leave blank to auto-select featured testimonials">
                  <Input value={content.testimonials.featuredTestimonialIds.join(", ")} onChange={(e) => update("testimonials.featuredTestimonialIds", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
                </Field>
              </div>
            </Card>
            <Card title="Hiring Partner Logos">
              <div className="space-y-2 mb-3">
                {content.testimonials.hiringPartners.map((p, i) => (
                  <div key={i} className="grid sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
                    <Field label={`Partner ${i + 1} Name`}>
                      <Input value={p.name} placeholder="Company name" onChange={(e) => { const hp = [...content.testimonials.hiringPartners]; hp[i] = { ...hp[i], name: e.target.value }; update("testimonials.hiringPartners", hp); }} />
                    </Field>
                    <Field label="Logo">
                      <ImageUpload value={p.logoUrl} onChange={(url) => { const hp = [...content.testimonials.hiringPartners]; hp[i] = { ...hp[i], logoUrl: url }; update("testimonials.hiringPartners", hp); }} company={company} folder="companies" aspectClass="aspect-video" />
                    </Field>
                    <div className="sm:col-span-2 flex justify-end">
                      <button onClick={() => update("testimonials.hiringPartners", content.testimonials.hiringPartners.filter((_, j) => j !== i))} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => update("testimonials.hiringPartners", [...content.testimonials.hiringPartners, { name: "", logoUrl: "" }])} className="flex items-center gap-2 text-sm text-red-600 font-semibold">
                <Plus className="w-4 h-4" /> Add Partner
              </button>
            </Card>
          </>
        )}

        {/* ── BLOG CONFIG ──────────────────────────────────── */}
        {activeTab === "blog" && (
          <Card title="Blog Section">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Section Label">
                <Input value={content.blog.sectionLabel} onChange={(e) => update("blog.sectionLabel", e.target.value)} />
              </Field>
              <Field label="Title">
                <Input value={content.blog.title} onChange={(e) => update("blog.title", e.target.value)} />
              </Field>
              <Field label="CTA Text">
                <Input value={content.blog.ctaText} onChange={(e) => update("blog.ctaText", e.target.value)} />
              </Field>
              <Field label="CTA Link">
                <Input value={content.blog.ctaLink} onChange={(e) => update("blog.ctaLink", e.target.value)} />
              </Field>
              <Field label="Featured Post IDs (comma-separated)" className="sm:col-span-2" hint="Leave blank to auto-show 3 latest featured posts">
                <Input value={content.blog.featuredPostIds.join(", ")} onChange={(e) => update("blog.featuredPostIds", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
              </Field>
            </div>
          </Card>
        )}

        {/* ── FAQs ─────────────────────────────────────────── */}
        {activeTab === "faqs" && (
          <>
          <Card title="Home Page FAQs">
            <div className="space-y-3 mb-4">
              {content.faqs.map((faq, i) => (
                <div key={faq.id} className="p-4 border border-slate-100 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">FAQ {i + 1}</span>
                    <div className="flex items-center gap-2">
                      <Toggle checked={faq.isActive} onChange={(v) => { const f = [...content.faqs]; f[i] = { ...f[i], isActive: v }; update("faqs", f); }} label="Active" size="sm" />
                      <button onClick={() => update("faqs", content.faqs.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <Field label="Question">
                    <Input value={faq.question} onChange={(e) => { const f = [...content.faqs]; f[i] = { ...f[i], question: e.target.value }; update("faqs", f); }} />
                  </Field>
                  <Field label="Answer" className="mt-2">
                    <Textarea value={faq.answer} rows={3} onChange={(e) => { const f = [...content.faqs]; f[i] = { ...f[i], answer: e.target.value }; update("faqs", f); }} />
                  </Field>
                </div>
              ))}
            </div>
            <button
              onClick={() => update("faqs", [...content.faqs, { id: crypto.randomUUID(), question: "New question?", answer: "Answer here.", order: content.faqs.length, isActive: true }])}
              className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
            >
              <Plus className="w-4 h-4" /> Add FAQ
            </button>
          </Card>
          <Card title='"Still Have Questions?" Card'>
            <Field label="Card Background Image" hint="Upload a dark atmospheric photo — an overlay keeps text readable">
              <ImageUpload value={content.faqCardBgImage ?? ""} onChange={(url) => update("faqCardBgImage", url)} company={company} folder="home" aspectClass="aspect-[4/3]" />
            </Field>
          </Card>
          </>
        )}

        {/* ── CTA BANNER ───────────────────────────────────── */}
        {activeTab === "cta" && (
          <Card title="Final CTA Banner">
            <div className="grid gap-4">
              <Field label="Eyebrow (small text above headline)">
                <Input value={content.cta.eyebrow} onChange={(e) => update("cta.eyebrow", e.target.value)} />
              </Field>
              <Field label="Headline">
                <Textarea value={content.cta.headline} rows={2} onChange={(e) => update("cta.headline", e.target.value)} />
              </Field>
              <Field label="Subtext">
                <Input value={content.cta.subtext} onChange={(e) => update("cta.subtext", e.target.value)} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Primary Button Text">
                  <Input value={content.cta.primaryButton.text} onChange={(e) => update("cta.primaryButton", { ...content.cta.primaryButton, text: e.target.value })} />
                </Field>
                <Field label="Primary Button Link">
                  <Input value={content.cta.primaryButton.href} onChange={(e) => update("cta.primaryButton", { ...content.cta.primaryButton, href: e.target.value })} />
                </Field>
                <Field label="Secondary Button Text">
                  <Input value={content.cta.secondaryButton.text} onChange={(e) => update("cta.secondaryButton", { ...content.cta.secondaryButton, text: e.target.value })} />
                </Field>
                <Field label="Secondary Button Link">
                  <Input value={content.cta.secondaryButton.href} onChange={(e) => update("cta.secondaryButton", { ...content.cta.secondaryButton, href: e.target.value })} />
                </Field>
              </div>
              <Field label="Background Style">
                <Select value={content.cta.bgStyle} onChange={(e) => update("cta.bgStyle", e.target.value as "dark" | "gradient" | "light")}>
                  <option value="dark">Dark</option>
                  <option value="gradient">Gradient (Red)</option>
                  <option value="light">Light</option>
                </Select>
              </Field>
              <Field label="Background Image (overrides style)" hint="Upload a dark atmospheric photo — an overlay is applied automatically">
                <ImageUpload value={content.cta.bgImage ?? ""} onChange={(url) => update("cta.bgImage", url)} company={company} folder="home" aspectClass="aspect-[4/1]" />
              </Field>
            </div>
          </Card>
        )}

        {/* ── FOOTER ───────────────────────────────────────── */}
        {activeTab === "footer" && (
          <>
          <Card title="Company Details">
            <div className="grid gap-4">
              <Field label="Company Description">
                <Textarea value={content.footer.description} rows={3} onChange={(e) => update("footer.description", e.target.value)} />
              </Field>
              <Field label="Copyright Text">
                <Input value={content.footer.copyright} onChange={(e) => update("footer.copyright", e.target.value)} />
              </Field>
            </div>
          </Card>

          <Card title="Social Links">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="LinkedIn URL">
                <Input value={content.footer.socialLinks?.linkedin ?? "#"} placeholder="https://linkedin.com/..." onChange={(e) => update("footer.socialLinks", { ...(content.footer.socialLinks ?? {}), linkedin: e.target.value })} />
              </Field>
              <Field label="Instagram URL">
                <Input value={content.footer.socialLinks?.instagram ?? "#"} placeholder="https://instagram.com/..." onChange={(e) => update("footer.socialLinks", { ...(content.footer.socialLinks ?? {}), instagram: e.target.value })} />
              </Field>
              <Field label="YouTube URL">
                <Input value={content.footer.socialLinks?.youtube ?? "#"} placeholder="https://youtube.com/..." onChange={(e) => update("footer.socialLinks", { ...(content.footer.socialLinks ?? {}), youtube: e.target.value })} />
              </Field>
              <Field label="Facebook URL">
                <Input value={content.footer.socialLinks?.facebook ?? "#"} placeholder="https://facebook.com/..." onChange={(e) => update("footer.socialLinks", { ...(content.footer.socialLinks ?? {}), facebook: e.target.value })} />
              </Field>
            </div>
          </Card>

          <Card title="Menu Columns (Sections 2–4)">
            <p className="text-sm text-slate-500 mb-4">Select up to 3 menus to display in the footer. Manage menus in <a href={`/webapplication/${company}/${adminSlug}/dashboard/menus`} className="text-red-600 hover:underline">Website → Menus</a>.</p>
            <div className="space-y-4">
              {([0, 1, 2] as const).map((idx) => {
                const section = content.footer.menuSections?.[idx] ?? { enabled: false, menuId: "" };
                return (
                  <div key={idx} className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex-shrink-0">
                      <Toggle
                        label={`Section ${idx + 2}`}
                        checked={section.enabled}
                        onChange={(v) => {
                          const sections: [typeof section, typeof section, typeof section] = [
                            content.footer.menuSections?.[0] ?? { enabled: false, menuId: "" },
                            content.footer.menuSections?.[1] ?? { enabled: false, menuId: "" },
                            content.footer.menuSections?.[2] ?? { enabled: false, menuId: "" },
                          ];
                          sections[idx] = { ...sections[idx], enabled: v };
                          update("footer.menuSections", sections);
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <Select
                        value={section.menuId}
                        onChange={(e) => {
                          const sections: [typeof section, typeof section, typeof section] = [
                            content.footer.menuSections?.[0] ?? { enabled: false, menuId: "" },
                            content.footer.menuSections?.[1] ?? { enabled: false, menuId: "" },
                            content.footer.menuSections?.[2] ?? { enabled: false, menuId: "" },
                          ];
                          sections[idx] = { ...sections[idx], menuId: e.target.value };
                          update("footer.menuSections", sections);
                        }}
                        disabled={!section.enabled}
                      >
                        <option value="">— Select a menu —</option>
                        {availableMenus.map(m => (
                          <option key={m.id} value={m.id}>{m.header}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Contact Us Column">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Phone">
                <Input value={content.footer.contactPhone ?? ""} placeholder="e.g. +91 8240 006 007" onChange={(e) => update("footer.contactPhone", e.target.value)} />
              </Field>
              <Field label="Email">
                <Input value={content.footer.contactEmail ?? ""} placeholder="e.g. info@example.com" onChange={(e) => update("footer.contactEmail", e.target.value)} />
              </Field>
              <Field label="Address">
                <Input value={content.footer.contactAddress ?? ""} placeholder="e.g. Durgapur, West Bengal" onChange={(e) => update("footer.contactAddress", e.target.value)} />
              </Field>
              <Field label="Office Hours">
                <Input value={content.footer.contactHours ?? ""} placeholder="e.g. Mon–Sat: 9:30 AM – 7:00 PM" onChange={(e) => update("footer.contactHours", e.target.value)} />
              </Field>
              <Field label="WhatsApp Number" hint="Include country code, digits only — e.g. 918240006007">
                <Input value={content.footer.contactWhatsapp ?? ""} placeholder="e.g. 918240006007" onChange={(e) => update("footer.contactWhatsapp", e.target.value)} />
              </Field>
            </div>
            <p className="text-xs text-slate-400 mt-3">Leave blank to fall back to values in Site Settings.</p>
          </Card>

          <Card title="Last Section">
            <Field label="Last Column Type">
              <Select value={content.footer.lastSection ?? "newsletter"} onChange={(e) => update("footer.lastSection", e.target.value as "newsletter" | "achievements")}>
                <option value="newsletter">Newsletter Sign-Up</option>
                <option value="achievements">Achievement Logos (ISO, Startup India, etc.)</option>
              </Select>
            </Field>
            {(content.footer.lastSection ?? "newsletter") === "newsletter" && (
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <Field label="Newsletter Title">
                  <Input value={content.footer.newsletter?.title ?? "Newsletter"} onChange={(e) => update("footer.newsletter", { ...(content.footer.newsletter ?? {}), title: e.target.value })} />
                </Field>
                <Field label="Newsletter Description">
                  <Input value={content.footer.newsletter?.description ?? ""} onChange={(e) => update("footer.newsletter", { ...(content.footer.newsletter ?? {}), description: e.target.value })} />
                </Field>
              </div>
            )}
            {content.footer.lastSection === "achievements" && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Achievement Logos</label>
                {(content.footer.achievements ?? []).map((ach, i) => (
                  <div key={i} className="mb-3 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                    <ImageUpload
                      value={ach.logoUrl} onChange={(url) => {
                        const a = [...(content.footer.achievements ?? [])];
                        a[i] = { ...a[i], logoUrl: url };
                        update("footer.achievements", a);
                      }}
                      company={company} folder="companies" aspectClass="aspect-square"
                    />
                    <div className="flex items-center gap-2">
                      <Input value={ach.name} placeholder="e.g. ISO 27001" onChange={(e) => { const a = [...(content.footer.achievements ?? [])]; a[i] = { ...a[i], name: e.target.value }; update("footer.achievements", a); }} className="flex-1" />
                      <button onClick={() => update("footer.achievements", (content.footer.achievements ?? []).filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => update("footer.achievements", [...(content.footer.achievements ?? []), { name: "", logoUrl: "" }])}
                  className="flex items-center gap-2 text-sm text-red-600 font-semibold mt-1"
                >
                  <Plus className="w-4 h-4" /> Add Achievement Logo
                </button>
              </div>
            )}
          </Card>

          <Card title="Bottom Bar Links">
            <div className="space-y-2">
              {content.footer.bottomLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Input value={link.label} placeholder="Label" onChange={(e) => { const l = [...content.footer.bottomLinks]; l[i] = { ...l[i], label: e.target.value }; update("footer.bottomLinks", l); }} className="flex-1" />
                  <Input value={link.href} placeholder="/path" onChange={(e) => { const l = [...content.footer.bottomLinks]; l[i] = { ...l[i], href: e.target.value }; update("footer.bottomLinks", l); }} className="flex-1" />
                  <button onClick={() => update("footer.bottomLinks", content.footer.bottomLinks.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <button onClick={() => update("footer.bottomLinks", [...content.footer.bottomLinks, { label: "New Link", href: "/" }])} className="flex items-center gap-2 text-sm text-red-600 font-semibold mt-1">
                <Plus className="w-4 h-4" /> Add Link
              </button>
            </div>
          </Card>
          </>
        )}
      </div>

      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} />
    </div>
  );
}
