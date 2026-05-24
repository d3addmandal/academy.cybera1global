"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Select, Toggle, SaveBar, Card } from "@/components/admin/FormField";
import ImageUpload from "@/components/admin/ImageUpload";
import IconPicker from "@/components/admin/IconPicker";
import { useToast } from "@/components/admin/Toast";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import type { Programme } from "@/types/cms";
import Link from "next/link";

const defaultProgramme: Partial<Programme> = {
  shortTitle: "", title: "", slug: "", badge: "", category: "career-track",
  level: "Beginner", duration: "3 Months", mode: "Online / Offline", labsType: "Hands-On Practical",
  description: "", overview: "", image: "", heroImage: "", icon: "", color: "#e00000",
  isFeatured: false, status: "draft", bestFor: [], topics: [], modules: [], tools: [], labs: [],
  certificationTitle: "", careerPaths: [], faqs: [],
};

export default function EditProgrammePage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const id = params.id as string;
  const isNew = id === "new";
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();

  const [form, setForm] = useState<Partial<Programme>>(defaultProgramme);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(isNew);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/${company}/programmes/${id}`)
        .then((r) => r.json())
        .then((d) => { if (d.success) { setForm(d.data); setIsLoading(false); } });
    }
  }, [company, id, isNew]);

  function update(key: keyof Programme, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }

  // Auto-generate slug from shortTitle
  function handleShortTitleChange(val: string) {
    update("shortTitle", val);
    if (isNew) {
      update("slug", val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const url = isNew ? `/api/admin/${company}/programmes` : `/api/admin/${company}/programmes/${id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) {
        toast(isNew ? "Programme created!" : "Programme saved!", "success");
        setIsDirty(false);
        if (isNew) {
          router.push(`${base}/programmes/${data.data.id}`);
        } else {
          goNextTab();
        }
      } else {
        toast(data.error || "Save failed.", "error");
      }
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  const tabs = ["basic", "content", "modules", "tools & labs", "career paths", "faqs"];

  function goNextTab() {
    const idx = tabs.indexOf(activeTab);
    if (idx < tabs.length - 1) {
      setActiveTab(tabs[idx + 1]);
    } else {
      router.push(`${base}/programmes`);
    }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading…</div>;

  return (
    <div className="pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/programmes`} className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader title={isNew ? "New Programme" : `Edit: ${form.shortTitle}`} subtitle={isNew ? "Create a new programme" : form.slug} />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5 bg-white border border-slate-200 rounded-xl p-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === t ? "bg-red-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{t}</button>
        ))}
      </div>

      {/* Basic Info */}
      {activeTab === "basic" && (
        <Card title="Basic Information">
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Short Title *" hint="e.g. CCEH, CCSE">
                <Input value={form.shortTitle ?? ""} onChange={(e) => handleShortTitleChange(e.target.value)} placeholder="CCEH" required />
              </Field>
              <Field label="URL Slug *" hint="Auto-generated, editable">
                <Input value={form.slug ?? ""} onChange={(e) => update("slug", e.target.value)} placeholder="cceh-certified-ethical-hacker" />
              </Field>
              <Field label="Status">
                <Select value={form.status ?? "draft"} onChange={(e) => update("status", e.target.value)}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </Select>
              </Field>
            </div>
            <Field label="Full Title *">
              <Input value={form.title ?? ""} onChange={(e) => update("title", e.target.value)} placeholder="CCEH — Cyber A1 Certified Ethical Hacker" required />
            </Field>
            <Field label="Badge (small label)">
              <Input value={form.badge ?? ""} onChange={(e) => update("badge", e.target.value)} placeholder="Beginner-Friendly Career Track" />
            </Field>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Category">
                <Select value={form.category ?? "career-track"} onChange={(e) => update("category", e.target.value)}>
                  <option value="career-track">Career Track</option>
                  <option value="specialized">Specialized</option>
                  <option value="corporate">Corporate</option>
                  <option value="institutional">Institutional</option>
                </Select>
              </Field>
              <Field label="Level">
                <Select value={form.level ?? "Beginner"} onChange={(e) => update("level", e.target.value)}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Beginner to Advanced</option>
                </Select>
              </Field>
              <Field label="Duration">
                <Input value={form.duration ?? ""} onChange={(e) => update("duration", e.target.value)} placeholder="3 Months" />
              </Field>
              <Field label="Mode">
                <Input value={form.mode ?? ""} onChange={(e) => update("mode", e.target.value)} placeholder="Online / Offline" />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Labs Type">
                <Input value={form.labsType ?? ""} onChange={(e) => update("labsType", e.target.value)} placeholder="Hands-On Practical" />
              </Field>
              <Field label="Accent Color">
                <div className="flex items-center gap-2">
                  <input type="color" value={form.color ?? "#e00000"} onChange={(e) => update("color", e.target.value)} className="w-10 h-10 rounded border border-slate-200 cursor-pointer" />
                  <Input value={form.color ?? "#e00000"} onChange={(e) => update("color", e.target.value)} className="flex-1" />
                </div>
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <ImageUpload
                label="Card Image"
                value={form.image ?? ""}
                onChange={(url) => update("image", url)}
                company={company}
                folder="courses"
                aspectClass="aspect-video"
              />
              <ImageUpload
                label="Hero Image"
                value={form.heroImage ?? ""}
                onChange={(url) => update("heroImage", url)}
                company={company}
                folder="courses"
                aspectClass="aspect-video"
              />
            </div>
            <Field label="Card Icon" hint="Overrides the auto-detected icon on the programme card">
              <IconPicker value={form.icon ?? ""} onChange={(name) => update("icon", name)} />
            </Field>
            <Toggle checked={form.isFeatured ?? false} onChange={(v) => update("isFeatured", v)} label="Show as Featured Programme on Homepage" />
          </div>
        </Card>
      )}

      {/* Content */}
      {activeTab === "content" && (
        <Card title="Programme Content">
          <div className="grid gap-4">
            <Field label="Short Description *">
              <Textarea value={form.description ?? ""} rows={3} onChange={(e) => update("description", e.target.value)} placeholder="A brief description for the programme card." />
            </Field>
            <Field label="Detailed Overview">
              <Textarea value={form.overview ?? ""} rows={5} onChange={(e) => update("overview", e.target.value)} placeholder="Full programme overview for the detail page." />
            </Field>
            <Field label="Certification Title">
              <Input value={form.certificationTitle ?? ""} onChange={(e) => update("certificationTitle", e.target.value)} placeholder="Cyber A1 Certified Ethical Hacker (CCEH)" />
            </Field>
            <Field label="Best For (one per line)">
              <Textarea value={(form.bestFor ?? []).join("\n")} rows={4} onChange={(e) => update("bestFor", e.target.value.split("\n").filter(Boolean))} placeholder="Students & Freshers&#10;IT Beginners&#10;BCA / B.Tech Students" />
            </Field>
            <Field label="Topic Tags (one per line)">
              <Textarea value={(form.topics ?? []).join("\n")} rows={4} onChange={(e) => update("topics", e.target.value.split("\n").filter(Boolean))} placeholder="Ethical Hacking&#10;Network Security&#10;Linux" />
            </Field>
          </div>
        </Card>
      )}

      {/* Modules */}
      {activeTab === "modules" && (
        <Card title="Course Modules">
          <div className="space-y-3 mb-4">
            {(form.modules ?? []).map((mod, i) => (
              <div key={mod.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500">Module {mod.number}</span>
                  <button onClick={() => update("modules", (form.modules ?? []).filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid sm:grid-cols-4 gap-3">
                  <Field label="No.">
                    <Input value={mod.number} onChange={(e) => { const m = [...(form.modules ?? [])]; m[i] = { ...m[i], number: e.target.value }; update("modules", m); }} />
                  </Field>
                  <Field label="Title" className="sm:col-span-3">
                    <Input value={mod.title} onChange={(e) => { const m = [...(form.modules ?? [])]; m[i] = { ...m[i], title: e.target.value }; update("modules", m); }} />
                  </Field>
                  <Field label="Description" className="sm:col-span-4">
                    <Input value={mod.description} onChange={(e) => { const m = [...(form.modules ?? [])]; m[i] = { ...m[i], description: e.target.value }; update("modules", m); }} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => update("modules", [...(form.modules ?? []), { id: crypto.randomUUID(), number: String((form.modules?.length ?? 0) + 1).padStart(2, "0"), title: "", description: "" }])}
            className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
          >
            <Plus className="w-4 h-4" /> Add Module
          </button>
        </Card>
      )}

      {/* Tools & Labs */}
      {activeTab === "tools & labs" && (
        <div className="space-y-5">
          <Card title="Tools You Will Master">
            <div className="mb-3">
              <Textarea
                value={(form.tools ?? []).join("\n")}
                rows={6}
                placeholder="Kali Linux&#10;Nmap&#10;Burp Suite&#10;Metasploit"
                onChange={(e) => update("tools", e.target.value.split("\n").filter(Boolean))}
              />
              <p className="text-xs text-slate-400 mt-1">One tool per line</p>
            </div>
          </Card>
          <Card title="Hands-On Labs">
            <Textarea
              value={(form.labs ?? []).join("\n")}
              rows={6}
              placeholder="Practical Network Setup&#10;Kali Linux Environment&#10;Reconnaissance Activities"
              onChange={(e) => update("labs", e.target.value.split("\n").filter(Boolean))}
            />
            <p className="text-xs text-slate-400 mt-1">One lab per line</p>
          </Card>
        </div>
      )}

      {/* Career Paths */}
      {activeTab === "career paths" && (
        <Card title="Career Paths After This Programme">
          <div className="space-y-3 mb-4">
            {(form.careerPaths ?? []).map((cp, i) => (
              <div key={cp.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">Path {i + 1}</span>
                  <button onClick={() => update("careerPaths", (form.careerPaths ?? []).filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Job Title">
                    <Input value={cp.title} onChange={(e) => { const c = [...(form.careerPaths ?? [])]; c[i] = { ...c[i], title: e.target.value }; update("careerPaths", c); }} />
                  </Field>
                  <Field label="Description">
                    <Input value={cp.description} onChange={(e) => { const c = [...(form.careerPaths ?? [])]; c[i] = { ...c[i], description: e.target.value }; update("careerPaths", c); }} />
                  </Field>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => update("careerPaths", [...(form.careerPaths ?? []), { id: crypto.randomUUID(), title: "", description: "" }])} className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700">
            <Plus className="w-4 h-4" /> Add Career Path
          </button>
        </Card>
      )}

      {/* FAQs */}
      {activeTab === "faqs" && (
        <Card title="Programme FAQs">
          <div className="space-y-3 mb-4">
            {(form.faqs ?? []).map((faq, i) => (
              <div key={faq.id} className="p-4 border border-slate-100 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">FAQ {i + 1}</span>
                  <button onClick={() => update("faqs", (form.faqs ?? []).filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
                <Field label="Question">
                  <Input value={faq.question} onChange={(e) => { const f = [...(form.faqs ?? [])]; f[i] = { ...f[i], question: e.target.value }; update("faqs", f); }} />
                </Field>
                <Field label="Answer" className="mt-2">
                  <Textarea value={faq.answer} rows={3} onChange={(e) => { const f = [...(form.faqs ?? [])]; f[i] = { ...f[i], answer: e.target.value }; update("faqs", f); }} />
                </Field>
              </div>
            ))}
          </div>
          <button onClick={() => update("faqs", [...(form.faqs ?? []), { id: crypto.randomUUID(), question: "", answer: "", order: (form.faqs?.length ?? 0), isActive: true }])} className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700">
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </Card>
      )}

      <SaveBar
        onSave={handleSave}
        isLoading={isSaving}
        isDirty={isDirty}
        label={
          isNew ? "Create Programme"
          : tabs.indexOf(activeTab) < tabs.length - 1
            ? `Save & Continue to ${tabs[tabs.indexOf(activeTab) + 1].replace(/\b\w/g, (c) => c.toUpperCase())}`
            : "Save & Finish"
        }
      />
    </div>
  );
}
