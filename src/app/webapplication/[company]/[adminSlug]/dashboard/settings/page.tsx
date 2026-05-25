"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import type { SiteSettings } from "@/types/cms";

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [fetchError, setFetchError] = useState("");

  function load() {
    setIsLoading(true);
    setFetchError("");
    fetch(`/api/admin/${company}/settings`, { credentials: "same-origin" })
      .then((r) => {
        if (r.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); throw new Error("401"); }
        return r.json();
      })
      .then((d) => {
        if (d.success && d.data) setSettings(d.data);
        else setFetchError(d.error ?? "Failed to load settings.");
      })
      .catch((e) => { if (e.message !== "401") setFetchError("Network error."); })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { load(); }, [company]);

  function update(key: string, value: unknown) {
    setSettings((p) => p ? { ...p, [key]: value } : p);
    setIsDirty(true);
  }

  function updateNested(path: string, value: unknown) {
    setSettings((p) => {
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
    if (!settings) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/settings`, {
        method: "PUT", credentials: "same-origin",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings),
      });
      if (res.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); return; }
      const data = await res.json();
      if (data.success) { toast("Settings saved!", "success"); setIsDirty(false); }
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

  if (!settings) return null;

  return (
    <div className="pb-20">
      <PageHeader title="Site Settings" subtitle="Configure your website's core information, contact details, and SEO." />
      <div className="space-y-5">
        {/* Basic Info */}
        <Card title="Basic Information">
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Company Name *">
                <Input value={settings.companyName} onChange={(e) => update("companyName", e.target.value)} />
              </Field>
              <Field label="Tagline">
                <Input value={settings.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="Industry-Focused Cybersecurity Training" />
              </Field>
            </div>
          </div>
        </Card>

        {/* Contact Info */}
        <Card title="Contact Information">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone Number">
              <Input value={settings.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 8240 006 007" />
            </Field>
            <Field label="WhatsApp Number">
              <Input value={settings.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="+918240006007" />
            </Field>
            <Field label="Email Address">
              <Input type="email" value={settings.email} onChange={(e) => update("email", e.target.value)} />
            </Field>
            <Field label="Office Hours">
              <Input value={settings.hours} onChange={(e) => update("hours", e.target.value)} placeholder="Mon–Sat: 9:30 AM – 7:00 PM" />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Input value={settings.address} onChange={(e) => update("address", e.target.value)} placeholder="Durgapur, West Bengal" />
            </Field>
            <Field label="Locations (comma-separated)" className="sm:col-span-2">
              <Input value={settings.locations.join(", ")} onChange={(e) => update("locations", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="Durgapur, Delhi, Kolkata" />
            </Field>
          </div>
        </Card>

        {/* Social Links */}
        <Card title="Social Media Links">
          <div className="grid sm:grid-cols-2 gap-4">
            {(["linkedin", "instagram", "youtube", "facebook", "twitter"] as const).map((platform) => (
              <Field key={platform} label={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                <Input value={settings.socialLinks[platform]} onChange={(e) => updateNested(`socialLinks.${platform}`, e.target.value)} placeholder={`https://${platform}.com/...`} />
              </Field>
            ))}
          </div>
        </Card>

        {/* SEO */}
        <Card title="SEO Settings">
          <div className="grid gap-4">
            <Field label="Default Page Title">
              <Input value={settings.seo.defaultTitle} onChange={(e) => updateNested("seo.defaultTitle", e.target.value)} />
            </Field>
            <Field label="Title Template" hint="Use %s for page name — e.g. '%s | Cyber A1 Academy'">
              <Input value={settings.seo.titleTemplate} onChange={(e) => updateNested("seo.titleTemplate", e.target.value)} placeholder="%s | Cyber A1 Academy" />
            </Field>
            <Field label="Default Meta Description">
              <Textarea value={settings.seo.defaultDescription} rows={3} onChange={(e) => updateNested("seo.defaultDescription", e.target.value)} />
            </Field>
            <Field label="Keywords (comma-separated)">
              <Input value={settings.seo.keywords.join(", ")} onChange={(e) => updateNested("seo.keywords", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
            </Field>
            <Field label="OG Image URL">
              <Input value={settings.seo.ogImage} onChange={(e) => updateNested("seo.ogImage", e.target.value)} placeholder="/images/og-image.jpg" />
            </Field>
          </div>
        </Card>

        {/* Inquiry Routing */}
        <Card title="Enquiry Routing" subtitle="Choose how contact form submissions are delivered to you.">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Delivery Method">
              <select
                value={settings.inquiry?.deliveryMethod ?? "whatsapp"}
                onChange={(e) => updateNested("inquiry.deliveryMethod", e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
              >
                <option value="whatsapp">WhatsApp only</option>
                <option value="email">Email only</option>
                <option value="both">WhatsApp + Email</option>
              </select>
            </Field>
            <Field label="WhatsApp Number for Enquiries" hint="With country code, digits only. e.g. 918240006007">
              <Input
                value={settings.inquiry?.whatsappNumber ?? settings.whatsapp ?? ""}
                onChange={(e) => updateNested("inquiry.whatsappNumber", e.target.value)}
                placeholder="918240006007"
              />
            </Field>
            <Field label="Email for Enquiries (when email mode)" className="sm:col-span-2">
              <Input
                type="email"
                value={settings.inquiry?.emailTo ?? settings.email ?? ""}
                onChange={(e) => updateNested("inquiry.emailTo", e.target.value)}
                placeholder="info@cybera1academy.com"
              />
            </Field>
          </div>
        </Card>

        {/* Scripts */}
        <Card title="Custom Scripts" subtitle="Add tracking codes, chat widgets, or analytics scripts.">
          <div className="grid gap-4">
            <Field label="<head> Scripts (e.g. analytics)" hint="Injected inside <head>">
              <Textarea value={settings.scripts.headScripts} rows={4} onChange={(e) => updateNested("scripts.headScripts", e.target.value)} className="font-mono text-xs" placeholder="<script>...</script>" />
            </Field>
            <Field label="<body> Start Scripts" hint="Injected right after <body>">
              <Textarea value={settings.scripts.bodyStartScripts} rows={4} onChange={(e) => updateNested("scripts.bodyStartScripts", e.target.value)} className="font-mono text-xs" />
            </Field>
            <Field label="<body> End Scripts" hint="Injected right before </body>">
              <Textarea value={settings.scripts.bodyEndScripts} rows={4} onChange={(e) => updateNested("scripts.bodyEndScripts", e.target.value)} className="font-mono text-xs" />
            </Field>
          </div>
        </Card>
      </div>
      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} />
    </div>
  );
}
