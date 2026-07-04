"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Textarea, SaveBar, Card } from "@/components/admin/FormField";
import { ConfirmModal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import { CheckCircle2, XCircle, ExternalLink, ImageDown } from "lucide-react";
import type { SiteSettings } from "@/types/cms";
import type { RecompressSummary } from "@/lib/recompress-images";

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
  const [notifStatus, setNotifStatus] = useState<{ configured: boolean; active: string | null } | null>(null);
  const [sheetsStatus, setSheetsStatus] = useState<{ configured: boolean } | null>(null);
  const [recompressBusy, setRecompressBusy] = useState(false);
  const [recompressPreview, setRecompressPreview] = useState<RecompressSummary | null>(null);
  const [recompressResult, setRecompressResult] = useState<RecompressSummary | null>(null);
  const [confirmRecompressOpen, setConfirmRecompressOpen] = useState(false);

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

  useEffect(() => {
    load();
    fetch(`/api/admin/${company}/notification-status`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setNotifStatus(d.data); })
      .catch(() => {});
    fetch(`/api/admin/${company}/google-sheets-status`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => { if (d.success) setSheetsStatus(d.data); })
      .catch(() => {});
  }, [company]);

  async function handlePreviewRecompress() {
    setRecompressBusy(true);
    setRecompressResult(null);
    try {
      const res = await fetch(`/api/admin/${company}/recompress-images`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun: true }),
      });
      const data = await res.json();
      if (data.success) setRecompressPreview(data.data);
      else toast(data.error || "Preview failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setRecompressBusy(false); }
  }

  async function handleRunRecompress() {
    setRecompressBusy(true);
    setConfirmRecompressOpen(false);
    try {
      const res = await fetch(`/api/admin/${company}/recompress-images`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun: false }),
      });
      const data = await res.json();
      if (data.success) {
        setRecompressResult(data.data);
        setRecompressPreview(null);
        toast(`Recompressed ${data.data.processed} image(s).`, "success");
      } else toast(data.error || "Recompression failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setRecompressBusy(false); }
  }

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

        {/* WhatsApp Notification Status */}
        <Card title="WhatsApp Auto-Notifications" subtitle="Automatically send enquiry details to your WhatsApp when a visitor submits any form.">
          <div className="space-y-4">
            {/* Status badge */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              {notifStatus === null ? (
                <div className="w-4 h-4 rounded-full bg-slate-300 animate-pulse" />
              ) : notifStatus.configured ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-amber-500 shrink-0" />
              )}
              <div>
                {notifStatus === null ? (
                  <p className="text-sm text-slate-500">Checking status…</p>
                ) : notifStatus.configured ? (
                  <>
                    <p className="text-sm font-semibold text-green-700">Active — using <span className="uppercase">{notifStatus.active}</span> provider</p>
                    <p className="text-xs text-slate-500 mt-0.5">Every form submission sends an instant WhatsApp message to your number.</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-amber-700">Not configured — no auto-notification active</p>
                    <p className="text-xs text-slate-500 mt-0.5">Follow the setup guide below to activate WhatsApp notifications.</p>
                  </>
                )}
              </div>
            </div>

            {/* Setup guides */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Setup — choose one provider</p>

              {/* Option A: CallMeBot (recommended for quick setup) */}
              <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">Option A — CallMeBot <span className="text-[11px] font-normal text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full ml-1">Free · No business account</span></p>
                  <a href="https://www.callmebot.com/blog/free-api-whatsapp-messages/" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">Guide <ExternalLink className="w-3 h-3" /></a>
                </div>
                <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                  <li>Save <span className="font-mono bg-slate-100 px-1 rounded">+34 644 52 08 35</span> in your phone contacts as <strong>CallMeBot</strong></li>
                  <li>Send this message on WhatsApp to that number: <span className="font-mono bg-slate-100 px-1 rounded">I allow callmebot to send me messages</span></li>
                  <li>You will receive your API key by WhatsApp within a few minutes</li>
                  <li>Add these to Vercel → Project → Environment Variables:</li>
                </ol>
                <div className="font-mono text-[11px] bg-slate-900 text-green-400 rounded-lg px-3 py-2 space-y-1">
                  <p>CALLMEBOT_PHONE=+918240006007</p>
                  <p>CALLMEBOT_APIKEY=your_api_key_here</p>
                </div>
              </div>

              {/* Option B: Meta Cloud API */}
              <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">Option B — Meta WhatsApp Business API <span className="text-[11px] font-normal text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full ml-1">Official · 1 000 free/month</span></p>
                  <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">Docs <ExternalLink className="w-3 h-3" /></a>
                </div>
                <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                  <li>Create a Meta App at <span className="font-mono bg-slate-100 px-1 rounded">developers.facebook.com</span> → Add WhatsApp product</li>
                  <li>Get your Phone Number ID and generate a permanent access token</li>
                  <li>Add these to Vercel → Project → Environment Variables:</li>
                </ol>
                <div className="font-mono text-[11px] bg-slate-900 text-green-400 rounded-lg px-3 py-2 space-y-1">
                  <p>WHATSAPP_TOKEN=your_meta_access_token</p>
                  <p>WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id</p>
                  <p>WHATSAPP_TO_NUMBER=918240006007</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400">After adding env vars, redeploy on Vercel for the changes to take effect. The notification status above will update automatically.</p>
          </div>
        </Card>

        {/* Google Sheets */}
        <Card title="Google Sheets Auto-Sync" subtitle="Every form submission is instantly appended as a new row in your Google Sheet.">
          <div className="space-y-4">
            {/* Status badge */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              {sheetsStatus === null ? (
                <div className="w-4 h-4 rounded-full bg-slate-300 animate-pulse" />
              ) : sheetsStatus.configured ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-amber-500 shrink-0" />
              )}
              <div>
                {sheetsStatus === null ? (
                  <p className="text-sm text-slate-500">Checking status…</p>
                ) : sheetsStatus.configured ? (
                  <>
                    <p className="text-sm font-semibold text-green-700">Active — submissions are syncing to Google Sheets</p>
                    <p className="text-xs text-slate-500 mt-0.5">Every form submission appends a new row instantly.</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-amber-700">Not configured — Google Sheets sync is inactive</p>
                    <p className="text-xs text-slate-500 mt-0.5">Follow the setup guide below to activate instant sync.</p>
                  </>
                )}
              </div>
            </div>

            {/* Step 1: Apps Script deploy */}
            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <p className="text-sm font-bold text-slate-800">Step 1 — Deploy the Apps Script Web App</p>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside">
                <li>Open your Google Sheet → <strong>Extensions → Apps Script</strong></li>
                <li>Delete any existing code, paste the script below → <strong>Save</strong></li>
                <li><strong>Deploy → New deployment</strong> → type: <strong>Web App</strong></li>
                <li><em>Execute as</em>: <strong>Me</strong> · <em>Who has access</em>: <strong>Anyone</strong> → Deploy → copy the <strong>/exec</strong> URL</li>
                <li>Add to Vercel → Environment Variables → Redeploy:</li>
              </ol>
              <div className="font-mono text-[11px] bg-slate-900 text-green-400 rounded-lg px-3 py-2">
                <p>GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-600 mb-1.5">Apps Script code (includes Google Sheets + Telegram):</p>
                <pre className="font-mono text-[10.5px] bg-slate-900 text-green-300 rounded-lg px-3 py-3 overflow-x-auto leading-relaxed whitespace-pre">{`function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // ── 1. Append row to Google Sheet ──────────────────
    var sheet = SpreadsheetApp.getActiveSpreadsheet()
                  .getSheetByName("Sheet1") ||
                SpreadsheetApp.getActiveSpreadsheet()
                  .getActiveSheet();
    sheet.appendRow([
      data.name        || "",
      data.phone       || "",
      data.email       || "",
      data.city        || "",
      data.program     || "",
      data.company     || "",
      data.inquiryType || "",
      data.message     || "",
      data.submittedAt || new Date().toLocaleString("en-IN"),
    ]);

    // ── 2. Send Telegram notification ──────────────────
    sendTelegram(data);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendTelegram(data) {
  var props  = PropertiesService.getScriptProperties();
  var token  = props.getProperty("TELEGRAM_BOT_TOKEN");
  var chatId = props.getProperty("TELEGRAM_CHAT_ID");
  if (!token || !chatId) return;

  var lines = [
    "\\u{1F514} *New Enquiry*",
    "",
    "\\u{1F464} *Name:* "  + (data.name        || "\\u2014"),
    "\\u{1F4DE} *Phone:* " + (data.phone       || "\\u2014"),
  ];
  if (data.email)       lines.push("\\u{1F4E7} *Email:* "    + data.email);
  if (data.program)     lines.push("\\u{1F393} *Program:* "  + data.program);
  if (data.company)     lines.push("\\u{1F3E2} *Org:* "      + data.company);
  if (data.city)        lines.push("\\u{1F3D9} *City:* "     + data.city);
  if (data.inquiryType) lines.push("\\u{1F4CB} *Type:* "     + data.inquiryType);
  if (data.message)     lines.push("\\u{1F4DD} *Message:* "  + data.message);
  lines.push("", "\\u{1F550} " + (data.submittedAt || new Date().toLocaleString("en-IN")));

  UrlFetchApp.fetch(
    "https://api.telegram.org/bot" + token + "/sendMessage",
    {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        chat_id:    chatId,
        text:       lines.join("\\n"),
        parse_mode: "Markdown",
      }),
    }
  );
}`}</pre>
              </div>

              <div className="rounded-md bg-blue-50 border border-blue-100 px-3 py-2">
                <p className="text-xs font-semibold text-blue-700 mb-1">Row 1 headers in your sheet:</p>
                <p className="font-mono text-[11px] text-blue-800">Name | Phone | Email | City | Program/Course | Organisation | Enquiry Type | Message | Submitted At</p>
              </div>
            </div>

            {/* Step 2: Telegram bot */}
            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <p className="text-sm font-bold text-slate-800">Step 2 — Connect your Telegram Bot</p>
              <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside">
                <li>Open Telegram → search <strong>@BotFather</strong> → send <span className="font-mono bg-slate-100 px-1 rounded">/newbot</span> → follow prompts → copy the <strong>bot token</strong></li>
                <li>Start a chat with your new bot (search its username → Send Message)</li>
                <li>Visit this URL to get your Chat ID: <span className="font-mono bg-slate-100 px-1 rounded">https://api.telegram.org/bot&#123;TOKEN&#125;/getUpdates</span> → look for <span className="font-mono bg-slate-100 px-1 rounded">"id"</span> inside <span className="font-mono bg-slate-100 px-1 rounded">chat</span></li>
                <li>In Apps Script → <strong>Project Settings → Script Properties</strong> → Add property:</li>
              </ol>
              <div className="font-mono text-[11px] bg-slate-900 text-green-400 rounded-lg px-3 py-2 space-y-1">
                <p>TELEGRAM_BOT_TOKEN = 123456789:ABCdef...</p>
                <p>TELEGRAM_CHAT_ID   = 987654321</p>
              </div>
              <p className="text-xs text-slate-500">For a group or channel: add the bot as admin, then use the group&apos;s chat ID (starts with <span className="font-mono bg-slate-100 px-1 rounded">-100...</span>).</p>
            </div>

            <p className="text-xs text-slate-400">Telegram is optional — if Script Properties are not set, only the Sheet append runs. No redeploy needed after adding Script Properties.</p>
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

        {/* Maintenance */}
        <Card title="Image Maintenance" subtitle="One-time cleanup for images uploaded before automatic compression existed.">
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Every new upload across the CRM (gallery, logos, photos, banners, etc.) is already
              compressed to WebP automatically. This tool finds images uploaded <em>before</em> that
              existed — still JPG/PNG/GIF — and recompresses them the same way, without touching QR
              codes or favicons/site-icons (those are deliberately left uncompressed).
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePreviewRecompress}
                disabled={recompressBusy}
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
              >
                <ImageDown className="w-4 h-4" /> {recompressBusy ? "Scanning…" : "Preview (no changes made)"}
              </button>
              {recompressPreview && recompressPreview.scanned > 0 && (
                <button
                  onClick={() => setConfirmRecompressOpen(true)}
                  disabled={recompressBusy}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                >
                  Recompress {recompressPreview.processed} Image{recompressPreview.processed === 1 ? "" : "s"} Now
                </button>
              )}
            </div>

            {recompressPreview && (
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600">
                {recompressPreview.scanned === 0
                  ? "Nothing to do — every image is already compressed."
                  : `Found ${recompressPreview.scanned} image(s) that predate compression. ${recompressPreview.remaining > 0 ? `Will process ${recompressPreview.processed} this run, ${recompressPreview.remaining} more on a follow-up run.` : `All ${recompressPreview.processed} will be processed in one run.`}`}
              </div>
            )}

            {recompressResult && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 space-y-1">
                <p className="font-semibold">
                  Recompressed {recompressResult.processed} image(s)
                  {recompressResult.bytesBefore > 0 && (
                    <> — {(recompressResult.bytesBefore / 1024).toFixed(0)}KB → {(recompressResult.bytesAfter / 1024).toFixed(0)}KB
                    ({(100 - (recompressResult.bytesAfter / recompressResult.bytesBefore) * 100).toFixed(0)}% smaller)</>
                  )}
                </p>
                {recompressResult.failed > 0 && <p className="text-amber-700">{recompressResult.failed} failed — check server logs.</p>}
                {recompressResult.remaining > 0 && <p>Run again to process the remaining {recompressResult.remaining}.</p>}
              </div>
            )}
          </div>
        </Card>
      </div>
      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} />

      <ConfirmModal
        open={confirmRecompressOpen}
        onClose={() => setConfirmRecompressOpen(false)}
        onConfirm={handleRunRecompress}
        isLoading={recompressBusy}
        title="Recompress Images"
        message={`This will replace ${recompressPreview?.processed ?? 0} image(s) with smaller WebP versions and update every reference to them. The originals are left in Blob storage (not deleted) in case anything needs reverting. Continue?`}
      />
    </div>
  );
}
