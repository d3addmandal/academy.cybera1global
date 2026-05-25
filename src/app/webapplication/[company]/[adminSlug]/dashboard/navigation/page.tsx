"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Toggle, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { Info, Menu, Megaphone, MousePointerClick } from "lucide-react";
import Link from "next/link";
import type { NavigationSettings } from "@/types/cms";

export default function NavigationPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();

  const [nav, setNav] = useState<NavigationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [fetchError, setFetchError] = useState("");

  function load() {
    setIsLoading(true);
    setFetchError("");
    fetch(`/api/admin/${company}/navigation`, { credentials: "same-origin" })
      .then((r) => {
        if (r.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); throw new Error("401"); }
        return r.json();
      })
      .then((d) => {
        if (d.success && d.data) setNav(d.data);
        else setFetchError(d.error ?? "Failed to load navigation.");
      })
      .catch((e) => { if (e.message !== "401") setFetchError("Network error."); })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, [company]);

  function updateNested(path: string, value: unknown) {
    setNav((p) => {
      if (!p) return p;
      const updated = JSON.parse(JSON.stringify(p));
      const keys = path.split(".");
      let ref: Record<string, unknown> = updated;
      for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]] as Record<string, unknown>;
      ref[keys[keys.length - 1]] = value;
      return updated;
    });
    setIsDirty(true);
  }

  async function handleSave() {
    if (!nav) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/navigation`, {
        method: "PUT", credentials: "same-origin",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(nav),
      });
      if (res.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); return; }
      const data = await res.json();
      if (data.success) { toast("Navigation saved!", "success"); setIsDirty(false); }
      else toast(data.error || "Save failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (fetchError) return (
    <div className="flex items-center justify-center h-64 flex-col gap-3">
      <p className="text-red-500 font-semibold">{fetchError}</p>
      <button onClick={load} className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors">Retry</button>
    </div>
  );

  if (!nav) return null;

  return (
    <div className="pb-20">
      <PageHeader
        title="Navigation"
        subtitle="Configure the announcement bar and header CTA button shown across the website."
      />

      <div className="space-y-5">
        {/* Announcement Bar */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-red-500" />
              Announcement Bar
            </span>
          }
          subtitle="Shown as a thin banner above the main header on all pages."
        >
          <div className="space-y-4">
            <Toggle
              checked={nav.announcementBar.enabled}
              onChange={(v) => updateNested("announcementBar.enabled", v)}
              label="Show announcement bar"
            />

            {nav.announcementBar.enabled && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <Field label="Announcement Text" hint="Keep it concise — single line recommended.">
                  <Input
                    value={nav.announcementBar.text}
                    onChange={(e) => updateNested("announcementBar.text", e.target.value)}
                    placeholder="Admissions Open for 2026 Batch | Corporate Training Available"
                  />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Phone Number (shown in bar)">
                    <Input
                      value={nav.announcementBar.phone}
                      onChange={(e) => updateNested("announcementBar.phone", e.target.value)}
                      placeholder="+91 8240 006 007"
                    />
                  </Field>
                  <Field label="WhatsApp Link Label">
                    <Input
                      value={nav.announcementBar.whatsappLabel ?? "WhatsApp"}
                      onChange={(e) => updateNested("announcementBar.whatsappLabel", e.target.value)}
                      placeholder="WhatsApp"
                    />
                  </Field>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="CTA Button Text">
                    <Input
                      value={nav.announcementBar.ctaText}
                      onChange={(e) => updateNested("announcementBar.ctaText", e.target.value)}
                      placeholder="Book Counseling"
                    />
                  </Field>
                  <Field label="CTA Button Link">
                    <Input
                      value={nav.announcementBar.ctaLink}
                      onChange={(e) => updateNested("announcementBar.ctaLink", e.target.value)}
                      placeholder="/contact"
                    />
                  </Field>
                </div>

                {/* Live preview */}
                <div className="rounded-xl overflow-hidden border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold px-3 pt-2.5 pb-1.5 bg-slate-50 border-b border-slate-100">Preview</p>
                  <div className="bg-gradient-to-r from-red-900 to-red-800 text-white px-4 py-2.5 flex items-center justify-between gap-4 text-xs">
                    <p className="font-medium truncate flex-1">{nav.announcementBar.text || "Announcement text..."}</p>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      {nav.announcementBar.phone && (
                        <span className="text-white/80">{nav.announcementBar.phone}</span>
                      )}
                      {nav.announcementBar.ctaText && (
                        <span className="bg-white text-red-700 text-[10px] font-bold px-2.5 py-1 rounded">
                          {nav.announcementBar.ctaText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Header CTA Button */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-red-500" />
              Header CTA Button
            </span>
          }
          subtitle="The main call-to-action button shown in the top-right of the header."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Button Text">
              <Input
                value={nav.headerCta.text}
                onChange={(e) => updateNested("headerCta.text", e.target.value)}
                placeholder="Contact Us"
              />
            </Field>
            <Field label="Button Link">
              <Input
                value={nav.headerCta.href}
                onChange={(e) => updateNested("headerCta.href", e.target.value)}
                placeholder="/contact"
              />
            </Field>
          </div>

          {/* Preview */}
          <div className="mt-4 rounded-xl overflow-hidden border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold px-3 pt-2.5 pb-1.5 bg-slate-50 border-b border-slate-100">Preview</p>
            <div className="bg-[#080b10] px-4 py-3 flex items-center justify-end">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-red-700 to-red-600 px-5 py-2 rounded-lg">
                {nav.headerCta.text || "Contact Us"}
              </span>
            </div>
          </div>
        </Card>

        {/* Info: Footer menus */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-1">Footer navigation is managed in Menus</p>
            <p className="text-xs text-blue-600 leading-relaxed">
              Footer columns (Quick Links, Programs, Corporate, etc.) are created as reusable menus and assigned to the footer from the Home Content editor.
              Go to <Link href={`${base}/menus`} className="font-bold underline hover:text-blue-800">Menus</Link> to create or edit them.
            </p>
          </div>
        </div>

        {/* Info: Header links */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
          <Menu className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">Header navigation links</p>
            <p className="text-xs text-amber-600 leading-relaxed">
              The main header links (Home, Academy, Courses, etc.) are template-defined and driven by your published programmes.
              Course links are automatically added from your <Link href={`${base}/programmes`} className="font-bold underline hover:text-amber-800">Programmes</Link> list when published.
            </p>
          </div>
        </div>
      </div>

      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} />
    </div>
  );
}