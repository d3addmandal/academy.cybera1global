"use client";
import { useEffect, useState, useRef, DragEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Select, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { X, Image as ImageIcon, Shield, FolderOpen, Info, CheckCircle2, Loader2 } from "lucide-react";
import type { ThemeSettings } from "@/types/cms";

/* ── Colour picker with preview swatch ────────────────────────────────── */
function ColorField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer flex-shrink-0"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#e00000"
          className="flex-1"
        />
        <div
          className="w-10 h-10 rounded-lg border border-slate-200 flex-shrink-0"
          style={{ backgroundColor: value }}
        />
      </div>
    </Field>
  );
}

/* ── Image upload widget (logo / favicon) ─────────────────────────────── */
function ImageUpload({
  label, hint, value, onChange, uploadType, company,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  uploadType: "logo" | "favicon" | "site-icon";
  company: string;
}) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [dropping, setDropping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml", "image/gif", "image/x-icon", "image/vnd.microsoft.icon"];
    if (!allowed.includes(file.type)) { toast("Only JPG, PNG, WebP, SVG, GIF or ICO files are accepted.", "error"); return; }
    if (file.size > 5 * 1024 * 1024) { toast("File too large. Maximum 5 MB.", "error"); return; }
    setIsUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", uploadType);
    try {
      const res = await fetch(`/api/admin/${company}/upload`, { method: "POST", credentials: "same-origin", body: fd });
      const data = await res.json();
      if (data.success) { onChange(data.url); toast("Image uploaded!", "success"); }
      else toast(data.error || "Upload failed.", "error");
    } catch { toast("Network error during upload.", "error"); }
    finally { setIsUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  }

  function handleFiles(files: FileList | null) { if (files?.[0]) uploadFile(files[0]); }

  const filename = value ? value.split("/").pop() ?? value : "";

  const dropZone = (compact: boolean) => (
    <div
      onClick={() => !isUploading && inputRef.current?.click()}
      onDragOver={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); !isUploading && setDropping(true); }}
      onDragLeave={() => setDropping(false)}
      onDrop={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropping(false); !isUploading && handleFiles(e.dataTransfer.files); }}
      className={[
        "border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all",
        compact ? "p-5" : "p-8",
        isUploading ? "pointer-events-none opacity-60" : "cursor-pointer",
        dropping ? "border-blue-500 bg-blue-50" : "border-blue-200 hover:border-blue-400 hover:bg-blue-50/40",
      ].join(" ")}
    >
      <div className={`rounded-full bg-slate-100 flex items-center justify-center ${compact ? "w-11 h-11" : "w-16 h-16"}`}>
        {isUploading
          ? <Loader2 className={`text-blue-500 animate-spin ${compact ? "w-5 h-5" : "w-8 h-8"}`} />
          : <ImageIcon className={`text-blue-500 ${compact ? "w-5 h-5" : "w-8 h-8"}`} />}
      </div>
      <div className="text-center">
        <p className={`font-bold text-slate-800 ${compact ? "text-xs" : "text-sm"}`}>
          {isUploading ? "Uploading…" : dropping ? "Drop to upload" : "Drag & drop your image here"}
        </p>
        {!isUploading && <p className={`text-slate-400 mt-0.5 ${compact ? "text-[10px]" : "text-xs"}`}>or</p>}
      </div>
      {!isUploading && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          className={`flex items-center gap-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors ${compact ? "text-[11px] px-3 py-1.5" : "text-sm px-5 py-2.5"}`}
        >
          <FolderOpen className={compact ? "w-3 h-3" : "w-4 h-4"} />
          Browse Image
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</p>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {value ? (
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {/* Left: preview */}
            <div className="p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Selected Image</p>
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-900 mb-3 flex items-center justify-center">
                <img src={value} alt="" className="max-w-full max-h-full object-contain p-3" />
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-7 h-7 rounded-md bg-pink-50 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                </div>
                <p className="text-[11px] font-semibold text-slate-700 truncate flex-1 min-w-0">{filename}</p>
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <button type="button" onClick={() => onChange("")} className="text-slate-300 hover:text-red-500 transition-colors shrink-0" title="Remove">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Right: upload */}
            <div className="p-4 flex flex-col gap-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload New Image</p>
              {dropZone(true)}
              <div className="flex items-start gap-1.5">
                <Info className="w-3 h-3 text-blue-400 shrink-0 mt-px" />
                <p className="text-[10px] text-slate-400 leading-snug">JPG, PNG, WebP, SVG, GIF, ICO. Max 5 MB.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            {dropZone(false)}
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-px" />
              <p className="text-xs text-slate-400 leading-snug">Supported formats: JPG, PNG, WebP, SVG, GIF, ICO. Max 5 MB.</p>
            </div>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml,image/gif,image/x-icon" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {/* URL paste field */}
      <Field label="Or paste image URL" hint={hint}>
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={uploadType === "logo" ? "/uploads/cybera1/logo.png" : "/favicon.ico"} />
      </Field>
    </div>
  );
}

/* ── Main theme page ──────────────────────────────────────────────────── */
export default function ThemePage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const { toast } = useToast();
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/${company}/theme`, { credentials: "same-origin" })
      .then((r) => {
        if (r.status === 401) {
          router.replace(`/webapplication/${company}/${adminSlug}/login`);
          throw new Error("401");
        }
        return r.json();
      })
      .then((d) => {
        if (d.success && d.data) setTheme(d.data);
        else setFetchError(d.error ?? "Failed to load theme.");
      })
      .catch((e) => { if (e.message !== "401") setFetchError("Network error."); })
      .finally(() => setIsLoading(false));
  }, [company, adminSlug, router]);

  function updateColors(key: keyof ThemeSettings["colors"], value: string) {
    setTheme((p) => p ? { ...p, colors: { ...p.colors, [key]: value } } : p);
    setIsDirty(true);
  }

  function updateLogo(key: keyof ThemeSettings["logo"], value: string) {
    setTheme((p) => p ? { ...p, logo: { ...p.logo, [key]: value } } : p);
    setIsDirty(true);
  }

  function updateTypography(key: keyof ThemeSettings["typography"], value: string) {
    setTheme((p) => p ? { ...p, typography: { ...p.typography, [key]: value } } : p);
    setIsDirty(true);
  }

  async function handleSave() {
    if (!theme) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/theme`, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      });
      if (res.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); return; }
      const data = await res.json();
      if (data.success) {
        toast("Theme saved! The website will reflect changes on next page load.", "success");
        setIsDirty(false);
      } else {
        toast(data.error || "Save failed.", "error");
      }
    } catch {
      toast("Network error.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading theme…</p>
      </div>
    </div>
  );

  if (fetchError) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-red-500 font-semibold mb-2">Failed to load theme</p>
        <p className="text-slate-400 text-sm">{fetchError}</p>
      </div>
    </div>
  );

  if (!theme) return null;

  return (
    <div className="pb-20">
      <PageHeader title="Theme & Branding" subtitle="Customize colors, logo, and typography. Changes are reflected on the website after saving." />
      <div className="space-y-5">

        {/* ── Logo & Identity ─────────────────────────────────────────── */}
        <Card
          title="Logo & Identity"
          subtitle="Upload an image logo or use text-based branding. Image logo takes priority over text."
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left — uploads */}
            <div className="space-y-6">
              <ImageUpload
                label="Logo Image"
                hint="Recommended: PNG or SVG, transparent background, max 512×512 px"
                value={theme.logo.imageUrl}
                onChange={(url) => { updateLogo("imageUrl", url); }}
                uploadType="logo"
                company={company}
              />
              <ImageUpload
                label="Favicon"
                hint="Recommended: ICO or 32×32 PNG. Shown in browser tab."
                value={theme.logo.faviconUrl}
                onChange={(url) => { updateLogo("faviconUrl", url); }}
                uploadType="favicon"
                company={company}
              />
              <ImageUpload
                label="Site Icon"
                hint="Square icon used for PWA, app shortcuts, and social sharing. Recommended: 512×512 PNG."
                value={theme.logo.siteIconUrl ?? ""}
                onChange={(url) => { updateLogo("siteIconUrl", url); }}
                uploadType="site-icon"
                company={company}
              />
            </div>

            {/* Right — text logo settings + live preview */}
            <div className="space-y-4">
              <Field label="Text Logo — Main Text" hint="Used when no image is uploaded">
                <Input
                  value={theme.logo.text}
                  onChange={(e) => updateLogo("text", e.target.value)}
                  placeholder="Cyber A1"
                />
              </Field>
              <Field label="Text Logo — Highlighted Part" hint="Portion shown in the primary brand colour">
                <Input
                  value={theme.logo.highlight}
                  onChange={(e) => updateLogo("highlight", e.target.value)}
                  placeholder="A1"
                />
              </Field>

              {/* Live preview */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Live Preview</p>
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 inline-flex items-center gap-2.5">
                  {theme.logo.imageUrl ? (
                    <img
                      src={theme.logo.imageUrl}
                      alt="Logo preview"
                      className="w-9 h-9 object-contain rounded-lg bg-black/20 p-0.5"
                    />
                  ) : (
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})` }}
                    >
                      <Shield className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-black text-sm leading-none">
                      {theme.logo.text.replace(theme.logo.highlight, "")}
                      <span style={{ color: theme.colors.primary }}>{theme.logo.highlight}</span>
                    </p>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-0.5">Academy</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {theme.logo.imageUrl
                    ? "Image logo is active — text settings are used as fallback."
                    : "No image uploaded — text logo is active."}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Color Palette ────────────────────────────────────────────── */}
        <Card title="Color Palette" subtitle="These colours control the entire website appearance.">
          <div className="grid sm:grid-cols-2 gap-4">
            <ColorField label="Primary Color (buttons, accents)" value={theme.colors.primary} onChange={(v) => updateColors("primary", v)} />
            <ColorField label="Primary Dark (hover states)" value={theme.colors.primaryDark} onChange={(v) => updateColors("primaryDark", v)} />
            <ColorField label="Dark Background" value={theme.colors.darkBg} onChange={(v) => updateColors("darkBg", v)} />
            <ColorField label="Semi-Dark (cards, sections)" value={theme.colors.semiDark} onChange={(v) => updateColors("semiDark", v)} />
            <ColorField label="Black (footer, deep sections)" value={theme.colors.black} onChange={(v) => updateColors("black", v)} />
          </div>

          {/* Colour preview */}
          <div className="mt-6 p-5 rounded-xl" style={{ backgroundColor: theme.colors.darkBg }}>
            <p className="text-xs text-white/40 mb-3 uppercase tracking-widest font-semibold">Live Colour Preview</p>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ backgroundColor: theme.colors.primary }}>
                Primary Button
              </button>
              <button className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: theme.colors.primary, color: theme.colors.primary }}>
                Outline Button
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: "Primary", color: theme.colors.primary },
                { label: "Dark", color: theme.colors.primaryDark },
                { label: "Dark BG", color: theme.colors.darkBg },
                { label: "Semi", color: theme.colors.semiDark },
                { label: "Black", color: theme.colors.black },
              ].map(({ label, color }) => (
                <div key={label} className="text-center">
                  <div className="h-8 rounded mb-1 border border-white/10" style={{ backgroundColor: color }} />
                  <p className="text-white/40 text-[10px]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Typography ───────────────────────────────────────────────── */}
        <Card title="Typography">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Heading Font">
              <Select value={theme.typography.headingFont} onChange={(e) => updateTypography("headingFont", e.target.value)}>
                <option value="Inter">Inter</option>
                <option value="Poppins">Poppins</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Raleway">Raleway</option>
                <option value="Space Grotesk">Space Grotesk</option>
              </Select>
            </Field>
            <Field label="Body Font">
              <Select value={theme.typography.bodyFont} onChange={(e) => updateTypography("bodyFont", e.target.value)}>
                <option value="Inter">Inter</option>
                <option value="Poppins">Poppins</option>
                <option value="DM Sans">DM Sans</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              </Select>
            </Field>
          </div>
        </Card>
      </div>

      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} />
    </div>
  );
}
