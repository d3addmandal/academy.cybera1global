"use client";
import { useEffect, useState, useRef, DragEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Field, Input, Select, SaveBar, Card } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import {
  X, Image as ImageIcon, Shield, FolderOpen, Info, CheckCircle2, Loader2,
  Check, Palette, Type, Layout, Megaphone, Mail, Monitor,
} from "lucide-react";
import type { ThemeSettings } from "@/types/cms";

const FONTS = [
  "Inter", "Poppins", "Montserrat", "Raleway", "Space Grotesk",
  "DM Sans", "Plus Jakarta Sans", "Nunito", "Work Sans", "Rubik",
  "Outfit", "Sora", "Manrope", "IBM Plex Sans", "Source Sans 3",
  "Lato", "Open Sans", "Barlow", "Mulish", "Urbanist",
];

const PRESETS = [
  {
    id: "dark-cyber",
    name: "Dark Cyber",
    description: "Dark cybersecurity — red accent",
    colors: { primary: "#e00000", primaryDark: "#8b0000", headerBg: "#080b10", footerBg: "#050505", pageBg: "#ffffff", darkBg: "#080b10", semiDark: "#0d1117", black: "#050505" },
    typography: { headingFont: "Space Grotesk", bodyFont: "Inter", baseFontSize: "md" as const },
  },
  {
    id: "light-professional",
    name: "Light Professional",
    description: "Clean white — blue accent",
    colors: { primary: "#2563eb", primaryDark: "#1d4ed8", headerBg: "#ffffff", footerBg: "#1f2937", pageBg: "#f8fafc", darkBg: "#1e293b", semiDark: "#334155", black: "#0f172a" },
    typography: { headingFont: "Poppins", bodyFont: "DM Sans", baseFontSize: "md" as const },
  },
  {
    id: "midnight-navy",
    name: "Midnight Navy",
    description: "Deep navy — electric blue",
    colors: { primary: "#3b82f6", primaryDark: "#1d4ed8", headerBg: "#0f172a", footerBg: "#020617", pageBg: "#0f172a", darkBg: "#0f172a", semiDark: "#1e293b", black: "#020617" },
    typography: { headingFont: "Montserrat", bodyFont: "Inter", baseFontSize: "md" as const },
  },
  {
    id: "forest-executive",
    name: "Forest Executive",
    description: "Deep green — trust & authority",
    colors: { primary: "#16a34a", primaryDark: "#15803d", headerBg: "#14532d", footerBg: "#052e16", pageBg: "#f0fdf4", darkBg: "#14532d", semiDark: "#166534", black: "#052e16" },
    typography: { headingFont: "Raleway", bodyFont: "Nunito", baseFontSize: "md" as const },
  },
  {
    id: "premium-purple",
    name: "Premium Purple",
    description: "Luxurious purple — premium feel",
    colors: { primary: "#7c3aed", primaryDark: "#6d28d9", headerBg: "#1e1b4b", footerBg: "#0f0e1f", pageBg: "#faf5ff", darkBg: "#1e1b4b", semiDark: "#2d2659", black: "#0f0e1f" },
    typography: { headingFont: "Outfit", bodyFont: "Manrope", baseFontSize: "md" as const },
  },
  {
    id: "solar-amber",
    name: "Solar Amber",
    description: "Warm golden — energetic brand",
    colors: { primary: "#d97706", primaryDark: "#b45309", headerBg: "#111827", footerBg: "#030712", pageBg: "#fffbeb", darkBg: "#1f2937", semiDark: "#374151", black: "#030712" },
    typography: { headingFont: "Barlow", bodyFont: "Work Sans", baseFontSize: "md" as const },
  },
];

const PAGE_LAYOUTS = [
  { id: "layout-1", name: "Classic", desc: "Header + sidebar + content" },
  { id: "layout-2", name: "Full Width", desc: "Wide content, no sidebar" },
  { id: "layout-3", name: "Magazine", desc: "Multi-column editorial" },
  { id: "layout-4", name: "Minimal", desc: "Clean whitespace focus" },
  { id: "layout-5", name: "Card Grid", desc: "Content in cards" },
  { id: "layout-6", name: "Dark Mode", desc: "Dark-themed pages" },
];

const PROG_LAYOUTS = [
  { id: "prog-1", name: "Hero + Details", desc: "Banner with course info below" },
  { id: "prog-2", name: "Sidebar Details", desc: "Details in sticky sidebar" },
  { id: "prog-3", name: "Tab Navigation", desc: "Tabbed course sections" },
  { id: "prog-4", name: "Card Grid", desc: "Module cards layout" },
  { id: "prog-5", name: "Timeline", desc: "Chronological curriculum" },
  { id: "prog-6", name: "Immersive", desc: "Full-width visual hero" },
];

const BLOG_LAYOUTS = [
  { id: "blog-1", name: "Article Style", desc: "Long-form reading view" },
  { id: "blog-2", name: "Magazine", desc: "Editorial column layout" },
  { id: "blog-3", name: "Card Grid", desc: "Post cards with thumbnails" },
  { id: "blog-4", name: "Timeline", desc: "Chronological post view" },
  { id: "blog-5", name: "Photo Heavy", desc: "Image-first storytelling" },
  { id: "blog-6", name: "Minimal Type", desc: "Typography-focused minimal" },
];

const CTA_STYLES = [
  { id: "cta-1", name: "Full-Width Banner", desc: "Bold full-width call-to-action" },
  { id: "cta-2", name: "Split Layout", desc: "Text left, form right" },
  { id: "cta-3", name: "Centered Cards", desc: "Centered cards with icons" },
  { id: "cta-4", name: "Side-by-Side", desc: "Two button options" },
  { id: "cta-5", name: "Gradient Strip", desc: "Colourful gradient band" },
  { id: "cta-6", name: "Glass Card", desc: "Frosted glass on dark bg" },
];

const CONTACT_FORMS = [
  { id: "form-1", name: "Clean Card", desc: "White card, clean inputs" },
  { id: "form-2", name: "Split Layout", desc: "Form + contact info side by side" },
  { id: "form-3", name: "Full-Width Dark", desc: "Dark immersive form" },
  { id: "form-4", name: "Minimal Inline", desc: "Compact single-line fields" },
];

const CONTACT_PAGES = [
  { id: "contact-1", name: "Standard", desc: "Form + map + details" },
  { id: "contact-2", name: "Dark Immersive", desc: "Full dark with glows" },
  { id: "contact-3", name: "Split Layout", desc: "Left info + right form" },
  { id: "contact-4", name: "Minimal Modern", desc: "Clean, spacious layout" },
];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer flex-shrink-0" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="#000000" className="flex-1" />
        <div className="w-10 h-10 rounded-lg border border-slate-200 flex-shrink-0" style={{ backgroundColor: value }} />
      </div>
    </Field>
  );
}

function ImageUpload({ label, hint, value, onChange, uploadType, company }: {
  label: string; hint?: string; value: string; onChange: (url: string) => void;
  uploadType: "logo" | "favicon" | "site-icon"; company: string;
}) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [dropping, setDropping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml", "image/gif", "image/x-icon", "image/vnd.microsoft.icon"];
    if (!allowed.includes(file.type)) { toast("Only JPG, PNG, WebP, SVG, GIF or ICO files accepted.", "error"); return; }
    if (file.size > 5 * 1024 * 1024) { toast("File too large. Max 5 MB.", "error"); return; }
    setIsUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", uploadType);
    try {
      const res = await fetch(`/api/admin/${company}/upload`, { method: "POST", credentials: "same-origin", body: fd });
      const data = await res.json();
      if (data.success) { onChange(data.url); toast("Image uploaded!", "success"); }
      else toast(data.error || "Upload failed.", "error");
    } catch { toast("Network error.", "error"); }
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
      className={["border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all",
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
          {isUploading ? "Uploading..." : dropping ? "Drop to upload" : "Drag & drop your image here"}
        </p>
        {!isUploading && <p className={`text-slate-400 mt-0.5 ${compact ? "text-[10px]" : "text-xs"}`}>or</p>}
      </div>
      {!isUploading && (
        <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          className={`flex items-center gap-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors ${compact ? "text-[11px] px-3 py-1.5" : "text-sm px-5 py-2.5"}`}>
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
                <button type="button" onClick={() => {
                  if (value.includes(".public.blob.vercel-storage.com/")) {
                    fetch(`/api/admin/${company}/upload`, {
                      method: "DELETE", credentials: "same-origin",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ url: value }),
                    }).catch(() => {});
                  }
                  onChange("");
                }} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
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
              <p className="text-xs text-slate-400 leading-snug">Supported: JPG, PNG, WebP, SVG, GIF, ICO. Max 5 MB.</p>
            </div>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml,image/gif,image/x-icon"
          className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>
      <Field label="Or paste image URL" hint={hint}>
        <Input value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={uploadType === "logo" ? "/uploads/cybera1/logo.png" : "/favicon.ico"} />
      </Field>
    </div>
  );
}

function PresetCard({ preset, isActive, onApply }: {
  preset: typeof PRESETS[0]; isActive: boolean; onApply: () => void;
}) {
  return (
    <div onClick={onApply}
      className={`border-2 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md ${isActive ? "border-red-500 ring-2 ring-red-500/20" : "border-slate-200 hover:border-slate-300"}`}>
      <div className="relative overflow-hidden">
        <div className="h-5" style={{ backgroundColor: preset.colors.headerBg }} />
        <div className="h-10 px-3 py-2 space-y-1.5" style={{ backgroundColor: preset.colors.pageBg }}>
          <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: preset.colors.primary + "60" }} />
          <div className="h-1 rounded-full w-1/2 bg-slate-200" />
        </div>
        <div className="h-4" style={{ backgroundColor: preset.colors.footerBg }} />
        {isActive && (
          <div className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
            <Check className="w-2.5 h-2.5" />
          </div>
        )}
      </div>
      <div className="flex h-2">
        {[preset.colors.primary, preset.colors.headerBg, preset.colors.pageBg, preset.colors.footerBg].map((c, i) => (
          <div key={i} className="flex-1" style={{ backgroundColor: c }} />
        ))}
      </div>
      <div className="p-2.5">
        <p className="font-bold text-xs text-slate-800">{preset.name}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{preset.description}</p>
      </div>
    </div>
  );
}

function TemplateCard({ id, name, desc, isActive, onSelect, preview }: {
  id: string; name: string; desc: string; isActive: boolean; onSelect: () => void; preview: React.ReactNode;
}) {
  return (
    <div onClick={onSelect}
      className={`border-2 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md ${isActive ? "border-red-500 ring-2 ring-red-500/20" : "border-slate-200 hover:border-slate-300"}`}>
      <div className="bg-slate-50 h-20 flex items-center justify-center relative">
        {preview}
        {isActive && (
          <div className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
            <Check className="w-2.5 h-2.5" />
          </div>
        )}
      </div>
      <div className="p-2 border-t border-slate-100">
        <p className="font-semibold text-xs text-slate-800">{name}</p>
        <p className="text-[10px] text-slate-400">{desc}</p>
      </div>
    </div>
  );
}

const layoutPreviews: Record<string, React.ReactNode> = {
  "layout-1": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#f1f5f9" rx="4" /><rect x="4" y="4" width="64" height="8" fill="#e2e8f0" rx="2" /><rect x="4" y="16" width="44" height="34" fill="#e2e8f0" rx="2" /><rect x="52" y="16" width="16" height="34" fill="#cbd5e1" rx="2" /></svg>,
  "layout-2": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#f1f5f9" rx="4" /><rect x="4" y="4" width="64" height="8" fill="#e2e8f0" rx="2" /><rect x="4" y="16" width="64" height="34" fill="#e2e8f0" rx="2" /></svg>,
  "layout-3": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#f1f5f9" rx="4" /><rect x="4" y="4" width="64" height="8" fill="#e2e8f0" rx="2" /><rect x="4" y="16" width="30" height="20" fill="#e2e8f0" rx="2" /><rect x="38" y="16" width="30" height="20" fill="#e2e8f0" rx="2" /><rect x="4" y="40" width="64" height="10" fill="#e2e8f0" rx="2" /></svg>,
  "layout-4": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#ffffff" rx="4" /><rect x="16" y="8" width="40" height="6" fill="#e2e8f0" rx="2" /><rect x="10" y="18" width="52" height="28" fill="#f1f5f9" rx="2" /></svg>,
  "layout-5": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#f1f5f9" rx="4" /><rect x="4" y="4" width="64" height="6" fill="#e2e8f0" rx="2" /><rect x="4" y="14" width="20" height="18" fill="#e2e8f0" rx="2" /><rect x="28" y="14" width="20" height="18" fill="#e2e8f0" rx="2" /><rect x="52" y="14" width="16" height="18" fill="#e2e8f0" rx="2" /><rect x="4" y="36" width="20" height="14" fill="#e2e8f0" rx="2" /><rect x="28" y="36" width="20" height="14" fill="#e2e8f0" rx="2" /></svg>,
  "layout-6": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#0f172a" rx="4" /><rect x="4" y="4" width="64" height="8" fill="#1e293b" rx="2" /><rect x="4" y="16" width="64" height="34" fill="#1e293b" rx="2" /></svg>,
};

const progPreviews: Record<string, React.ReactNode> = {
  "prog-1": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="20" fill="#1e293b" rx="4" /><rect x="4" y="24" width="64" height="26" fill="#f1f5f9" rx="2" /><rect x="8" y="6" width="28" height="3" fill="#94a3b8" rx="1" /><rect x="8" y="12" width="20" height="2" fill="#64748b" rx="1" /></svg>,
  "prog-2": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#f1f5f9" rx="4" /><rect x="4" y="4" width="44" height="46" fill="#e2e8f0" rx="2" /><rect x="52" y="4" width="16" height="46" fill="#cbd5e1" rx="2" /></svg>,
  "prog-3": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#f1f5f9" rx="4" /><rect x="4" y="4" width="12" height="6" fill="#e2e8f0" rx="2" /><rect x="20" y="4" width="12" height="6" fill="#e2e8f0" rx="2" /><rect x="36" y="4" width="12" height="6" fill="#e2e8f0" rx="2" /><rect x="4" y="14" width="64" height="36" fill="#e2e8f0" rx="2" /></svg>,
  "prog-4": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#f1f5f9" rx="4" /><rect x="4" y="4" width="30" height="22" fill="#e2e8f0" rx="2" /><rect x="38" y="4" width="30" height="22" fill="#e2e8f0" rx="2" /><rect x="4" y="30" width="30" height="20" fill="#e2e8f0" rx="2" /><rect x="38" y="30" width="30" height="20" fill="#e2e8f0" rx="2" /></svg>,
  "prog-5": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#f1f5f9" rx="4" /><line x1="36" y1="4" x2="36" y2="50" stroke="#cbd5e1" strokeWidth="2" /><circle cx="36" cy="14" r="4" fill="#e2e8f0" /><circle cx="36" cy="27" r="4" fill="#e2e8f0" /><circle cx="36" cy="40" r="4" fill="#e2e8f0" /><rect x="40" y="12" width="24" height="4" fill="#e2e8f0" rx="1" /><rect x="8" y="25" width="24" height="4" fill="#e2e8f0" rx="1" /></svg>,
  "prog-6": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#0f172a" rx="4" /><rect x="0" y="0" width="72" height="30" fill="#1e293b" rx="4" /><rect x="10" y="8" width="52" height="4" fill="#475569" rx="1" /><rect x="20" y="16" width="32" height="2" fill="#334155" rx="1" /><rect x="4" y="34" width="64" height="16" fill="#1e293b" rx="2" /></svg>,
};

const blogPreviews: Record<string, React.ReactNode> = {
  "blog-1": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#ffffff" rx="4" /><rect x="10" y="6" width="52" height="5" fill="#e2e8f0" rx="1" /><rect x="10" y="14" width="36" height="2" fill="#f1f5f9" rx="1" /><rect x="10" y="20" width="52" height="2" fill="#f1f5f9" rx="1" /><rect x="10" y="25" width="52" height="2" fill="#f1f5f9" rx="1" /><rect x="10" y="30" width="40" height="2" fill="#f1f5f9" rx="1" /></svg>,
  "blog-2": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#f8fafc" rx="4" /><rect x="4" y="4" width="40" height="26" fill="#e2e8f0" rx="2" /><rect x="48" y="4" width="20" height="12" fill="#e2e8f0" rx="2" /><rect x="48" y="20" width="20" height="10" fill="#e2e8f0" rx="2" /><rect x="4" y="34" width="64" height="16" fill="#e2e8f0" rx="2" /></svg>,
  "blog-3": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#f1f5f9" rx="4" /><rect x="4" y="4" width="20" height="22" fill="#e2e8f0" rx="2" /><rect x="28" y="4" width="20" height="22" fill="#e2e8f0" rx="2" /><rect x="52" y="4" width="16" height="22" fill="#e2e8f0" rx="2" /><rect x="4" y="30" width="20" height="20" fill="#e2e8f0" rx="2" /><rect x="28" y="30" width="20" height="20" fill="#e2e8f0" rx="2" /></svg>,
  "blog-4": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#f8fafc" rx="4" /><rect x="10" y="4" width="2" height="46" fill="#e2e8f0" /><rect x="16" y="6" width="50" height="10" fill="#e2e8f0" rx="2" /><rect x="16" y="22" width="50" height="10" fill="#e2e8f0" rx="2" /><rect x="16" y="38" width="50" height="10" fill="#e2e8f0" rx="2" /></svg>,
  "blog-5": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="28" fill="#e2e8f0" rx="4" /><rect x="0" y="28" width="72" height="26" fill="#f8fafc" /><rect x="10" y="32" width="50" height="4" fill="#e2e8f0" rx="1" /><rect x="10" y="40" width="35" height="2" fill="#f1f5f9" rx="1" /></svg>,
  "blog-6": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#ffffff" rx="4" /><rect x="16" y="10" width="40" height="6" fill="#1e293b" rx="1" /><rect x="22" y="20" width="28" height="2" fill="#94a3b8" rx="1" /><rect x="10" y="28" width="52" height="1.5" fill="#e2e8f0" rx="1" /><rect x="10" y="32" width="52" height="1.5" fill="#e2e8f0" rx="1" /><rect x="10" y="36" width="40" height="1.5" fill="#e2e8f0" rx="1" /></svg>,
};

const ctaPreviews: Record<string, React.ReactNode> = {
  "cta-1": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#dc2626" rx="4" /><rect x="16" y="14" width="40" height="5" fill="#ffffff80" rx="1" /><rect x="20" y="23" width="32" height="3" fill="#ffffff40" rx="1" /><rect x="22" y="32" width="28" height="8" fill="white" rx="4" /></svg>,
  "cta-2": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#1e293b" rx="4" /><rect x="4" y="8" width="30" height="5" fill="#ffffff40" rx="1" /><rect x="4" y="16" width="26" height="2" fill="#ffffff20" rx="1" /><rect x="4" y="30" width="20" height="8" fill="#dc2626" rx="4" /><rect x="40" y="8" width="28" height="38" fill="#0f172a" rx="4" /></svg>,
  "cta-3": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#f8fafc" rx="4" /><rect x="4" y="4" width="20" height="20" fill="#e2e8f0" rx="4" /><rect x="28" y="4" width="20" height="20" fill="#e2e8f0" rx="4" /><rect x="52" y="4" width="16" height="20" fill="#e2e8f0" rx="4" /><rect x="16" y="30" width="40" height="8" fill="#dc2626" rx="4" /></svg>,
  "cta-4": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#0f172a" rx="4" /><rect x="8" y="20" width="24" height="14" fill="#dc2626" rx="4" /><rect x="36" y="20" width="28" height="14" fill="#1e293b" rx="4" /></svg>,
  "cta-5": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><defs><linearGradient id="g1" x1="0" y1="0" x2="72" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#7c3aed" /><stop offset="1" stopColor="#dc2626" /></linearGradient></defs><rect width="72" height="54" fill="url(#g1)" rx="4" /><rect x="16" y="16" width="40" height="5" fill="#ffffff50" rx="1" /><rect x="24" y="26" width="24" height="10" fill="white" rx="4" /></svg>,
  "cta-6": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#0f172a" rx="4" /><rect x="8" y="8" width="56" height="38" fill="#ffffff08" rx="8" stroke="#ffffff15" strokeWidth="1" /><rect x="16" y="16" width="40" height="4" fill="#ffffff30" rx="1" /><rect x="20" y="24" width="32" height="2" fill="#ffffff20" rx="1" /><rect x="22" y="32" width="28" height="8" fill="#dc2626" rx="4" /></svg>,
};

const formPreviews: Record<string, React.ReactNode> = {
  "form-1": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#f8fafc" rx="4" /><rect x="8" y="8" width="56" height="38" fill="white" rx="6" stroke="#e2e8f0" strokeWidth="1" /><rect x="14" y="16" width="44" height="5" fill="#f1f5f9" rx="2" /><rect x="14" y="24" width="44" height="5" fill="#f1f5f9" rx="2" /><rect x="22" y="34" width="28" height="6" fill="#dc2626" rx="3" /></svg>,
  "form-2": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#f1f5f9" rx="4" /><rect x="4" y="4" width="28" height="46" fill="#1e293b" rx="4" /><rect x="36" y="4" width="32" height="46" fill="white" rx="4" /><rect x="40" y="12" width="24" height="4" fill="#f1f5f9" rx="1" /><rect x="40" y="20" width="24" height="4" fill="#f1f5f9" rx="1" /><rect x="40" y="36" width="16" height="6" fill="#dc2626" rx="2" /></svg>,
  "form-3": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#080b10" rx="4" /><rect x="8" y="8" width="56" height="6" fill="#ffffff15" rx="2" /><rect x="8" y="18" width="56" height="6" fill="#ffffff15" rx="2" /><rect x="8" y="28" width="56" height="6" fill="#ffffff15" rx="2" /><rect x="20" y="38" width="32" height="8" fill="#dc2626" rx="4" /></svg>,
  "form-4": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="white" rx="4" /><rect x="4" y="10" width="42" height="8" fill="#f1f5f9" rx="2" /><rect x="50" y="10" width="18" height="8" fill="#dc2626" rx="2" /><rect x="4" y="24" width="42" height="8" fill="#f1f5f9" rx="2" /><rect x="50" y="24" width="18" height="8" fill="#f1f5f9" rx="2" /></svg>,
};

const contactPagePreviews: Record<string, React.ReactNode> = {
  "contact-1": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#f8fafc" rx="4" /><rect x="4" y="4" width="32" height="46" fill="white" rx="4" stroke="#e2e8f0" strokeWidth="1" /><rect x="40" y="4" width="28" height="46" fill="#e2e8f0" rx="4" /><rect x="8" y="10" width="24" height="4" fill="#f1f5f9" rx="1" /><rect x="8" y="18" width="24" height="4" fill="#f1f5f9" rx="1" /><rect x="10" y="38" width="18" height="6" fill="#dc2626" rx="2" /></svg>,
  "contact-2": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#080b10" rx="4" /><rect x="8" y="8" width="56" height="38" fill="#0d1117" rx="6" /><rect x="14" y="14" width="44" height="4" fill="#ffffff20" rx="1" /><rect x="14" y="22" width="44" height="4" fill="#ffffff20" rx="1" /><rect x="22" y="40" width="28" height="6" fill="#dc2626" rx="3" /></svg>,
  "contact-3": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="#f1f5f9" rx="4" /><rect x="0" y="0" width="34" height="54" fill="#1e293b" rx="4" /><rect x="38" y="8" width="30" height="38" fill="white" rx="4" /><rect x="42" y="14" width="22" height="4" fill="#f1f5f9" rx="1" /><rect x="42" y="22" width="22" height="4" fill="#f1f5f9" rx="1" /><rect x="42" y="34" width="14" height="6" fill="#dc2626" rx="2" /></svg>,
  "contact-4": <svg width="72" height="54" viewBox="0 0 72 54" fill="none"><rect width="72" height="54" fill="white" rx="4" /><rect x="16" y="6" width="40" height="5" fill="#e2e8f0" rx="1" /><rect x="4" y="16" width="64" height="6" fill="#f8fafc" rx="2" stroke="#e2e8f0" strokeWidth="1" /><rect x="4" y="26" width="64" height="6" fill="#f8fafc" rx="2" stroke="#e2e8f0" strokeWidth="1" /><rect x="20" y="38" width="32" height="8" fill="#dc2626" rx="4" /></svg>,
};

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
        if (r.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); throw new Error("401"); }
        return r.json();
      })
      .then((d) => {
        if (d.success && d.data) setTheme(d.data);
        else setFetchError(d.error ?? "Failed to load theme.");
      })
      .catch((e) => { if (e.message !== "401") setFetchError("Network error."); })
      .finally(() => setIsLoading(false));
  }, [company, adminSlug, router]);

  function mark() { setIsDirty(true); }
  function updateColors(key: keyof ThemeSettings["colors"], value: string) {
    setTheme((p) => p ? { ...p, colors: { ...p.colors, [key]: value } } : p);
    mark();
  }
  function updateLogo(key: keyof ThemeSettings["logo"], value: string) {
    setTheme((p) => p ? { ...p, logo: { ...p.logo, [key]: value } } : p);
    mark();
  }
  function updateTypography(key: keyof ThemeSettings["typography"], value: string) {
    setTheme((p) => p ? { ...p, typography: { ...p.typography, [key]: value } } : p);
    mark();
  }
  function updateTemplate(key: keyof ThemeSettings["templates"], value: string) {
    setTheme((p) => p ? { ...p, templates: { ...(p.templates ?? defaultTemplates), [key]: value } } : p);
    mark();
  }
  function applyPreset(preset: typeof PRESETS[0]) {
    setTheme((p) => p ? {
      ...p,
      colors: { ...p.colors, ...preset.colors },
      typography: { ...p.typography, ...preset.typography },
      templates: { ...(p.templates ?? defaultTemplates), preset: preset.id },
    } : p);
    mark();
    toast(`Applied "${preset.name}" theme preset.`, "success");
  }

  async function handleSave() {
    if (!theme) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/theme`, {
        method: "PUT", credentials: "same-origin",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(theme),
      });
      if (res.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); return; }
      const data = await res.json();
      if (data.success) { toast("Theme saved! Changes reflected on next page load.", "success"); setIsDirty(false); }
      else toast(data.error || "Save failed.", "error");
    } catch { toast("Network error.", "error"); }
    finally { setIsSaving(false); }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading theme...</p>
      </div>
    </div>
  );
  if (fetchError) return (
    <div className="flex items-center justify-center h-64 text-center">
      <p className="text-red-500 font-semibold">{fetchError}</p>
    </div>
  );
  if (!theme) return null;

  const defaultTemplates = {
    preset: "dark-cyber", pageLayout: "layout-1", programmeLayout: "prog-1",
    blogLayout: "blog-1", ctaStyle: "cta-1", contactFormStyle: "form-1", contactPageTemplate: "contact-1",
  };
  const tmpl = theme.templates ?? defaultTemplates;

  return (
    <div className="pb-20">
      <PageHeader
        title="Theme & Branding"
        subtitle="Control the entire website appearance including colours, fonts, templates, and layout styles."
      />
      <div className="space-y-5">

        {/* Preset Templates */}
        <Card
          title={<span className="flex items-center gap-2"><Palette className="w-4 h-4 text-slate-500" />Theme Presets</span>}
          subtitle="One-click theme starters. Applying a preset overwrites the colour palette and typography."
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PRESETS.map((preset) => (
              <PresetCard key={preset.id} preset={preset}
                isActive={tmpl.preset === preset.id} onApply={() => applyPreset(preset)} />
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
            <Info className="w-3 h-3 flex-shrink-0" />
            Presets set colours and fonts. Fine-tune any value below after applying.
          </p>
        </Card>

        {/* Logo & Identity */}
        <Card
          title={<span className="flex items-center gap-2"><ImageIcon className="w-4 h-4 text-slate-500" />Logo & Identity</span>}
          subtitle="Upload an image logo or use text-based branding. Image logo takes priority."
        >
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ImageUpload label="Logo Image" hint="PNG or SVG, transparent background, max 512x512 px"
                value={theme.logo.imageUrl} onChange={(url) => updateLogo("imageUrl", url)}
                uploadType="logo" company={company} />
              <ImageUpload label="Favicon" hint="ICO or 32x32 PNG. Shown in browser tab."
                value={theme.logo.faviconUrl} onChange={(url) => updateLogo("faviconUrl", url)}
                uploadType="favicon" company={company} />
              <ImageUpload label="Site Icon" hint="Square icon for PWA and social sharing. Recommended 512x512 PNG."
                value={theme.logo.siteIconUrl ?? ""} onChange={(url) => updateLogo("siteIconUrl", url)}
                uploadType="site-icon" company={company} />
            </div>
            <div className="space-y-4">
              <Field label="Text Logo - Main Text" hint="Used when no image is uploaded">
                <Input value={theme.logo.text} onChange={(e) => updateLogo("text", e.target.value)} placeholder="Cyber A1" />
              </Field>
              <Field label="Text Logo - Highlighted Part" hint="Portion shown in the primary brand colour">
                <Input value={theme.logo.highlight} onChange={(e) => updateLogo("highlight", e.target.value)} placeholder="A1" />
              </Field>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Live Preview</p>
                <div className="p-4 rounded-xl border border-slate-700 inline-flex items-center gap-2.5"
                  style={{ backgroundColor: theme.colors.headerBg ?? theme.colors.darkBg }}>
                  {theme.logo.imageUrl ? (
                    <img src={theme.logo.imageUrl} alt="Logo preview" className="w-9 h-9 object-contain rounded-lg bg-black/20 p-0.5" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})` }}>
                      <Shield className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-black text-sm leading-none text-white">
                      {theme.logo.text.replace(theme.logo.highlight, "")}
                      <span style={{ color: theme.colors.primary }}>{theme.logo.highlight}</span>
                    </p>
                    <p className="text-[10px] uppercase tracking-widest mt-0.5 text-slate-500">Academy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Colour Palette */}
        <Card
          title={<span className="flex items-center gap-2"><Palette className="w-4 h-4 text-slate-500" />Colour Palette</span>}
          subtitle="These colours control the entire website including header, footer, and page backgrounds."
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ColorField label="Primary Accent" value={theme.colors.primary} onChange={(v) => updateColors("primary", v)} />
            <ColorField label="Primary Dark (hover)" value={theme.colors.primaryDark} onChange={(v) => updateColors("primaryDark", v)} />
            <ColorField label="Header Background" value={theme.colors.headerBg ?? theme.colors.darkBg} onChange={(v) => updateColors("headerBg", v)} />
            <ColorField label="Footer Background" value={theme.colors.footerBg ?? theme.colors.black} onChange={(v) => updateColors("footerBg", v)} />
            <ColorField label="Page Background" value={theme.colors.pageBg ?? "#ffffff"} onChange={(v) => updateColors("pageBg", v)} />
            <ColorField label="Dark Background (sections)" value={theme.colors.darkBg} onChange={(v) => updateColors("darkBg", v)} />
            <ColorField label="Semi-Dark (cards)" value={theme.colors.semiDark} onChange={(v) => updateColors("semiDark", v)} />
            <ColorField label="Deep Black (strips)" value={theme.colors.black} onChange={(v) => updateColors("black", v)} />
          </div>
          {/* Live preview */}
          <div className="mt-6 rounded-xl overflow-hidden border border-slate-200">
            <div className="h-10 flex items-center px-4 gap-2" style={{ backgroundColor: theme.colors.headerBg ?? theme.colors.darkBg }}>
              <div className="w-16 h-3 rounded" style={{ backgroundColor: theme.colors.primary + "80" }} />
              <div className="flex gap-1.5 ml-auto">
                {[1, 2, 3].map(i => <div key={i} className="w-8 h-2 rounded-full bg-white/10" />)}
              </div>
              <div className="w-14 h-5 rounded-lg ml-2" style={{ backgroundColor: theme.colors.primary }} />
            </div>
            <div className="px-6 py-4" style={{ backgroundColor: theme.colors.pageBg ?? "#ffffff" }}>
              <div className="w-1/2 h-3 rounded mb-2 bg-slate-200" />
              <div className="w-3/4 h-2 rounded bg-slate-100" />
              <div className="flex gap-2 mt-3">
                <div className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: theme.colors.primary }}>Button</div>
                <div className="px-3 py-1.5 rounded-lg text-xs font-semibold border" style={{ borderColor: theme.colors.primary, color: theme.colors.primary }}>Outline</div>
              </div>
            </div>
            <div className="px-6 py-3" style={{ backgroundColor: theme.colors.darkBg }}>
              <div className="grid grid-cols-5 gap-2">
                {([["Primary", theme.colors.primary], ["Header", theme.colors.headerBg ?? theme.colors.darkBg], ["Footer", theme.colors.footerBg ?? theme.colors.black], ["Page BG", theme.colors.pageBg ?? "#ffffff"], ["Dark", theme.colors.darkBg]] as [string, string][]).map(([label, color]) => (
                  <div key={label} className="text-center">
                    <div className="h-6 rounded mb-1 border border-white/10" style={{ backgroundColor: color }} />
                    <p className="text-white/40 text-[9px]">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-6" style={{ backgroundColor: theme.colors.footerBg ?? theme.colors.black }} />
          </div>
        </Card>

        {/* Typography */}
        <Card
          title={<span className="flex items-center gap-2"><Type className="w-4 h-4 text-slate-500" />Typography</span>}
          subtitle="Choose from 20 professional fonts. Changes are applied globally across the website."
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Heading Font" hint="Used for titles, headings, and display text">
              <Select value={theme.typography.headingFont} onChange={(e) => updateTypography("headingFont", e.target.value)}>
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </Select>
            </Field>
            <Field label="Body Font" hint="Used for paragraphs and UI text">
              <Select value={theme.typography.bodyFont} onChange={(e) => updateTypography("bodyFont", e.target.value)}>
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </Select>
            </Field>
            <Field label="Base Font Size">
              <Select value={theme.typography.baseFontSize ?? "md"} onChange={(e) => updateTypography("baseFontSize", e.target.value)}>
                <option value="sm">Small (14px)</option>
                <option value="md">Medium (16px) - Default</option>
                <option value="lg">Large (18px)</option>
              </Select>
            </Field>
          </div>
          <div className="mt-5 p-5 rounded-xl border border-slate-200 bg-slate-50">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-3">Font Preview</p>
            <p className="text-2xl font-black text-slate-900 mb-1" style={{ fontFamily: `"${theme.typography.headingFont}", sans-serif` }}>
              {theme.typography.headingFont} - Heading Style
            </p>
            <p className="text-sm text-slate-600" style={{ fontFamily: `"${theme.typography.bodyFont}", sans-serif` }}>
              {theme.typography.bodyFont} - Body text for paragraphs and UI elements. The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </Card>

        {/* Page Layout Templates */}
        <Card
          title={<span className="flex items-center gap-2"><Layout className="w-4 h-4 text-slate-500" />Page Layout Templates</span>}
          subtitle="Select the default layout style for static content pages."
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PAGE_LAYOUTS.map((tpl) => (
              <TemplateCard key={tpl.id} id={tpl.id} name={tpl.name} desc={tpl.desc}
                isActive={tmpl.pageLayout === tpl.id}
                onSelect={() => updateTemplate("pageLayout", tpl.id)}
                preview={layoutPreviews[tpl.id]} />
            ))}
          </div>
        </Card>

        {/* Programme Templates */}
        <Card
          title={<span className="flex items-center gap-2"><Monitor className="w-4 h-4 text-slate-500" />Programme Page Templates</span>}
          subtitle="Choose the layout style for individual course and programme pages."
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PROG_LAYOUTS.map((tpl) => (
              <TemplateCard key={tpl.id} id={tpl.id} name={tpl.name} desc={tpl.desc}
                isActive={tmpl.programmeLayout === tpl.id}
                onSelect={() => updateTemplate("programmeLayout", tpl.id)}
                preview={progPreviews[tpl.id]} />
            ))}
          </div>
        </Card>

        {/* Blog Templates */}
        <Card
          title={<span className="flex items-center gap-2"><Monitor className="w-4 h-4 text-slate-500" />Blog Post Templates</span>}
          subtitle="Choose the layout style for blog posts and article pages."
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {BLOG_LAYOUTS.map((tpl) => (
              <TemplateCard key={tpl.id} id={tpl.id} name={tpl.name} desc={tpl.desc}
                isActive={tmpl.blogLayout === tpl.id}
                onSelect={() => updateTemplate("blogLayout", tpl.id)}
                preview={blogPreviews[tpl.id]} />
            ))}
          </div>
        </Card>

        {/* CTA Styles */}
        <Card
          title={<span className="flex items-center gap-2"><Megaphone className="w-4 h-4 text-slate-500" />CTA Section Style</span>}
          subtitle="Choose the call-to-action section style used across homepage and landing pages."
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CTA_STYLES.map((tpl) => (
              <TemplateCard key={tpl.id} id={tpl.id} name={tpl.name} desc={tpl.desc}
                isActive={tmpl.ctaStyle === tpl.id}
                onSelect={() => updateTemplate("ctaStyle", tpl.id)}
                preview={ctaPreviews[tpl.id]} />
            ))}
          </div>
        </Card>

        {/* Contact Form Styles */}
        <Card
          title={<span className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-500" />Contact Form Style</span>}
          subtitle="Select the visual style for all contact and enquiry forms."
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CONTACT_FORMS.map((tpl) => (
              <TemplateCard key={tpl.id} id={tpl.id} name={tpl.name} desc={tpl.desc}
                isActive={tmpl.contactFormStyle === tpl.id}
                onSelect={() => updateTemplate("contactFormStyle", tpl.id)}
                preview={formPreviews[tpl.id]} />
            ))}
          </div>
        </Card>

        {/* Contact Page Template */}
        <Card
          title={<span className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-500" />Contact Page Template</span>}
          subtitle="Select the overall layout for the dedicated Contact Us page."
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CONTACT_PAGES.map((tpl) => (
              <TemplateCard key={tpl.id} id={tpl.id} name={tpl.name} desc={tpl.desc}
                isActive={tmpl.contactPageTemplate === tpl.id}
                onSelect={() => updateTemplate("contactPageTemplate", tpl.id)}
                preview={contactPagePreviews[tpl.id]} />
            ))}
          </div>
        </Card>

      </div>
      <SaveBar onSave={handleSave} isLoading={isSaving} isDirty={isDirty} />
    </div>
  );
}
