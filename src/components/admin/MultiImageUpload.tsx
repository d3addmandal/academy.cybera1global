"use client";
import { useRef, useState, DragEvent } from "react";
import { X, CloudUpload, FolderOpen, Info, Loader2, ImageIcon } from "lucide-react";

interface Props {
  values: string[];
  onChange: (urls: string[]) => void;
  company: string;
  folder?: string;
  label?: string;
  maxFiles?: number;
}

interface UploadItem {
  id: string;
  url: string;
  name: string;
}

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

function filenameFromUrl(url: string): string {
  try { return decodeURIComponent(url.split("/").pop() ?? url); }
  catch { return url.split("/").pop() ?? url; }
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  return Math.round(bytes / 1024) + " KB";
}

export default function MultiImageUpload({
  values, onChange, company, folder = "gallery", label, maxFiles = 20,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropping, setDropping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [errors, setErrors] = useState<string[]>([]);

  // Build display items from URLs
  const items: UploadItem[] = values
    .filter(Boolean)
    .map((url) => ({ id: url, url, name: filenameFromUrl(url) }));

  async function uploadFile(file: File, currentUrls: string[]): Promise<string | null> {
    if (file.size > 15 * 1024 * 1024) { return null; }
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    if (!detectMime(head)) return null;
    const scan = new Uint8Array(await file.slice(0, 4096).arrayBuffer());
    if (hasMaliciousContent(scan)) return null;

    const fd = new FormData();
    fd.append("file", file, "upload");
    fd.append("folder", folder);
    try {
      const res = await fetch(`/api/admin/${company}/upload`, {
        method: "POST", credentials: "same-origin", body: fd,
      });
      const json = await res.json();
      return json.success ? json.url : null;
    } catch { return null; }
  }

  async function processFiles(files: FileList | File[]) {
    const fileArr = Array.from(files).slice(0, maxFiles - values.filter(Boolean).length);
    if (!fileArr.length) return;

    const errs: string[] = [];
    setErrors([]);
    setUploading(true);
    setProgress({ done: 0, total: fileArr.length });

    let currentUrls = [...values.filter(Boolean)];

    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i];

      // Client-side validation
      if (file.size > 15 * 1024 * 1024) {
        errs.push(`${file.name}: too large (max 15 MB)`);
        setProgress((p) => ({ ...p, done: p.done + 1 }));
        continue;
      }
      const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
      if (!detectMime(head)) {
        errs.push(`${file.name}: invalid type`);
        setProgress((p) => ({ ...p, done: p.done + 1 }));
        continue;
      }
      const scan = new Uint8Array(await file.slice(0, 4096).arrayBuffer());
      if (hasMaliciousContent(scan)) {
        errs.push(`${file.name}: suspicious content detected`);
        setProgress((p) => ({ ...p, done: p.done + 1 }));
        continue;
      }

      const fd = new FormData();
      fd.append("file", file, "upload");
      fd.append("folder", folder);
      try {
        const res = await fetch(`/api/admin/${company}/upload`, {
          method: "POST", credentials: "same-origin", body: fd,
        });
        const json = await res.json();
        if (json.success) {
          currentUrls = [...currentUrls, json.url];
          onChange(currentUrls);
        } else {
          errs.push(`${file.name}: ${json.error ?? "upload failed"}`);
        }
      } catch {
        errs.push(`${file.name}: network error`);
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    setErrors(errs);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeItem(url: string) {
    onChange(values.filter((v) => v !== url));
  }

  const canUploadMore = values.filter(Boolean).length < maxFiles;

  return (
    <div className="space-y-1.5">
      {label && <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</p>}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className={`grid ${items.length > 0 ? "sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100" : ""}`}>

          {/* Left: existing images */}
          {items.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Existing Images ({items.length})
                </p>
                <p className="text-[10px] text-slate-400">Manage your uploaded photos</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {items.map((item) => (
                  <div key={item.id} className="group relative">
                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={item.url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 px-0.5">
                      <p className="text-[10px] text-slate-500 truncate flex-1 min-w-0">{item.name}</p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.url)}
                        className="ml-1 text-slate-300 hover:text-red-500 transition-colors shrink-0"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Right: upload zone */}
          <div className={`p-4 flex flex-col gap-3 ${items.length === 0 ? "w-full" : ""}`}>
            {items.length > 0 && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload New Images</p>
            )}

            <div
              onClick={() => canUploadMore && !uploading && inputRef.current?.click()}
              onDragOver={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); canUploadMore && !uploading && setDropping(true); }}
              onDragLeave={() => setDropping(false)}
              onDrop={(e: DragEvent<HTMLDivElement>) => {
                e.preventDefault(); setDropping(false);
                canUploadMore && !uploading && processFiles(e.dataTransfer.files);
              }}
              className={[
                "border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all",
                items.length > 0 ? "p-5" : "p-8",
                !canUploadMore || uploading ? "pointer-events-none opacity-60" : "cursor-pointer",
                dropping ? "border-blue-500 bg-blue-50" : "border-blue-200 hover:border-blue-400 hover:bg-blue-50/40",
              ].join(" ")}
            >
              <div className={`rounded-full bg-slate-100 flex items-center justify-center ${items.length > 0 ? "w-11 h-11" : "w-16 h-16"}`}>
                {uploading
                  ? <Loader2 className={`text-blue-500 animate-spin ${items.length > 0 ? "w-5 h-5" : "w-7 h-7"}`} />
                  : <CloudUpload className={`text-blue-500 ${items.length > 0 ? "w-5 h-5" : "w-7 h-7"}`} />}
              </div>

              <div className="text-center">
                {uploading ? (
                  <>
                    <p className={`font-bold text-slate-800 ${items.length > 0 ? "text-xs" : "text-sm"}`}>
                      Uploading {progress.done}/{progress.total}…
                    </p>
                    <div className="mt-2 w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden mx-auto">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p className={`font-bold text-slate-800 ${items.length > 0 ? "text-xs" : "text-sm"}`}>
                      {dropping ? "Drop to upload" : canUploadMore ? "Drag & drop files here" : "Maximum files reached"}
                    </p>
                    {canUploadMore && (
                      <p className={`text-slate-400 mt-0.5 ${items.length > 0 ? "text-[10px]" : "text-xs"}`}>
                        or click to browse from your device
                      </p>
                    )}
                  </>
                )}
              </div>

              {!uploading && canUploadMore && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  className={`flex items-center gap-2 border-2 border-blue-500 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors ${items.length > 0 ? "text-[11px] px-3 py-1.5" : "text-sm px-5 py-2.5"}`}
                >
                  <FolderOpen className={items.length > 0 ? "w-3 h-3" : "w-4 h-4"} />
                  Select Files
                </button>
              )}
            </div>

            <div className="space-y-1">
              {items.length === 0 && (
                <div className="flex items-center justify-center gap-3 my-1">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">or</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
              )}
              <div className="flex items-start gap-1.5">
                <Info className="w-3 h-3 text-blue-400 shrink-0 mt-px" />
                <p className="text-[10px] text-slate-400 leading-snug">
                  Supported formats: JPG, PNG, WebP. Max 15 MB per file.
                  {maxFiles < 999 && ` Up to ${maxFiles} images.`}
                </p>
              </div>
              <div className="flex items-start gap-1.5">
                <ImageIcon className="w-3 h-3 text-slate-300 shrink-0 mt-px" />
                <p className="text-[10px] text-slate-400">Your files are secure and used only for this project.</p>
              </div>
            </div>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => processFiles(e.target.files ?? [])}
        />
      </div>

      {errors.length > 0 && (
        <div className="space-y-0.5">
          {errors.map((e, i) => (
            <p key={i} className="text-[11px] text-red-500 flex items-center gap-1">
              <X className="w-3 h-3 shrink-0" /> {e}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
