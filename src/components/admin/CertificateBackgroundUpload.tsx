"use client";
import { useRef, useState, DragEvent } from "react";
import { X, ImageIcon, Loader2, FolderOpen, Info, CheckCircle2 } from "lucide-react";

interface Props {
  value: string;
  onChange: (result: { url: string; width: number; height: number } | null) => void;
  company: string;
}

/**
 * Unlike ImageUpload (used for logos/thumbnails), a certificate background must keep its
 * own natural design resolution — no forced crop to a preset aspect ratio. This uploads the
 * file as-is (the shared upload route already resizes-to-fit within 1920px without cropping)
 * and reports back the *stored* image's natural width/height, which becomes the template's
 * canvas size.
 */
function detectMime(b: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return "image/png";
  if (b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  return null;
}

function hasMaliciousContent(b: Uint8Array): boolean {
  const text = new TextDecoder("latin1").decode(b.slice(0, 4096)).toLowerCase();
  return ["<?php", "<?=", "<script", "<%", "eval(", "base64_decode(", "exec(", "system(", "passthru("]
    .some((p) => text.includes(p));
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  return Math.round(bytes / 1024) + " KB";
}

function filenameFromUrl(url: string): string {
  try { return decodeURIComponent(url.split("/").pop() ?? url); }
  catch { return url.split("/").pop() ?? url; }
}

function deleteBlobImage(url: string, company: string) {
  if (!url || !url.includes(".public.blob.vercel-storage.com/")) return;
  fetch(`/api/admin/${company}/upload`, {
    method: "DELETE", credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }).catch(() => {});
}

export default function CertificateBackgroundUpload({ value, onChange, company }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  async function processFile(file: File) {
    setError(null);
    if (file.size > 15 * 1024 * 1024) { setError("File too large. Maximum 15 MB."); return; }
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    if (!detectMime(head)) { setError("Invalid file. Only JPEG, PNG and WebP are accepted."); return; }
    const scan = new Uint8Array(await file.slice(0, 4096).arrayBuffer());
    if (hasMaliciousContent(scan)) { setError("File rejected: suspicious content detected."); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "certificate-templates/backgrounds");
      const res = await fetch(`/api/admin/${company}/upload`, { method: "POST", credentials: "same-origin", body: fd });
      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Upload failed."); setUploading(false); return; }

      const img = new Image();
      img.onload = () => {
        setDims({ w: img.naturalWidth, h: img.naturalHeight });
        onChange({ url: json.url, width: img.naturalWidth, height: img.naturalHeight });
        setUploading(false);
      };
      img.onerror = () => {
        // Stored fine, just couldn't re-measure it client-side — fall back to the default canvas size.
        onChange({ url: json.url, width: 1123, height: 794 });
        setUploading(false);
      };
      img.src = json.url;
    } catch {
      setError("Network error. Please try again.");
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (files?.length) processFile(files[0]);
  }

  const displayName = value ? filenameFromUrl(value) : "";

  return (
    <div className="space-y-1.5">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {value ? (
          <div className="p-4">
            <div className="w-full rounded-lg overflow-hidden bg-slate-100 mb-3" style={{ aspectRatio: dims ? `${dims.w} / ${dims.h}` : "4 / 3" }}>
              <img src={value} alt="" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-7 h-7 rounded-md bg-pink-50 flex items-center justify-center shrink-0">
                <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-slate-700 truncate">{displayName}</p>
                {dims && <p className="text-[10px] text-slate-400">{dims.w} × {dims.h}</p>}
              </div>
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              <button
                type="button"
                onClick={() => { deleteBlobImage(value, company); onChange(null); setDims(null); }}
                className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                title="Remove background"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <div
              onClick={() => !uploading && inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); !uploading && setDropping(true); }}
              onDragLeave={() => setDropping(false)}
              onDrop={(e: DragEvent<HTMLDivElement>) => {
                e.preventDefault(); setDropping(false);
                !uploading && handleFiles(e.dataTransfer.files);
              }}
              className={[
                "border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 p-8 cursor-pointer transition-all",
                uploading ? "pointer-events-none opacity-50" : "",
                dropping ? "border-blue-500 bg-blue-50" : "border-blue-200 hover:border-blue-400 hover:bg-blue-50/40",
              ].join(" ")}
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                {uploading ? <Loader2 className="w-8 h-8 text-blue-500 animate-spin" /> : <ImageIcon className="w-8 h-8 text-blue-500" />}
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800 text-sm">
                  {uploading ? "Uploading…" : dropping ? "Drop to upload" : "Drag & drop your background image here"}
                </p>
                <p className="text-slate-400 mt-0.5 text-xs">or</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); !uploading && inputRef.current?.click(); }}
                className="flex items-center gap-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm px-5 py-2.5"
              >
                <FolderOpen className="w-4 h-4" />
                Browse Image
              </button>
            </div>
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-px" />
              <p className="text-xs text-slate-400 leading-snug">
                Uploaded at its own resolution — no cropping. JPG, PNG, WebP. Max file size: 15 MB.
              </p>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X className="w-3 h-3 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
