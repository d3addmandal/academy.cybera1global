"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, Toggle, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { FAQ } from "@/types/cms";

export default function FAQsPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/${company}/faqs`, { credentials: "same-origin" })
      .then((r) => {
        if (r.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); throw new Error("401"); }
        return r.json();
      })
      .then((d) => { if (d.success) setFaqs(d.data ?? []); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [company, adminSlug, router]);

  function updateFaq(i: number, key: keyof FAQ, value: unknown) {
    setFaqs((prev) => { const f = [...prev]; f[i] = { ...f[i], [key]: value }; return f; });
    setIsDirty(true);
  }

  function addFaq() {
    setFaqs((prev) => [...prev, { id: crypto.randomUUID(), question: "", answer: "", order: prev.length, isActive: true }]);
    setIsDirty(true);
  }

  function removeFaq(i: number) {
    setFaqs((prev) => prev.filter((_, j) => j !== i).map((f, j) => ({ ...f, order: j })));
    setIsDirty(true);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/faqs`, {
        method: "PUT", credentials: "same-origin",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(faqs),
      });
      if (res.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); return; }
      const data = await res.json();
      if (data.success) { toast("FAQs saved!", "success"); setIsDirty(false); }
      else toast(data.error || "Save failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  if (isLoading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading…</div>;

  return (
    <div className="pb-20">
      <PageHeader title="FAQs" subtitle="Manage frequently asked questions for the homepage." />
      <Card title="FAQ List" subtitle="Drag to reorder (coming soon). Toggle to show/hide individual FAQs.">
        <div className="space-y-3 mb-4">
          {faqs.map((faq, i) => (
            <div key={faq.id} className="p-4 border border-slate-100 rounded-xl bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                  <span className="text-xs font-bold text-slate-400">FAQ {i + 1}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle checked={faq.isActive} onChange={(v) => updateFaq(i, "isActive", v)} label={faq.isActive ? "Visible" : "Hidden"} size="sm" />
                  <button onClick={() => removeFaq(i)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <Field label="Question">
                <Input value={faq.question} onChange={(e) => updateFaq(i, "question", e.target.value)} placeholder="What is your question?" />
              </Field>
              <Field label="Answer" className="mt-2">
                <Textarea value={faq.answer} rows={3} onChange={(e) => updateFaq(i, "answer", e.target.value)} placeholder="Detailed answer..." />
              </Field>
            </div>
          ))}
        </div>
        <button onClick={addFaq} className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </Card>
      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} />
    </div>
  );
}
