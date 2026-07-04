"use client";
import {
  useRef, useState, useEffect, useCallback,
  DragEvent, MouseEvent, WheelEvent,
} from "react";
import { X, ImageIcon, Loader2, ZoomIn, ZoomOut, Check, Move, FolderOpen, Info, CheckCircle2 } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  company: string;
  folder?: string;
  label?: string;
  aspectClass?: string;
}

interface FileInfo { name: string; size: string }

const ASPECT_MAP: Record<string, number> = {
  "aspect-video": 16 / 9,
  "aspect-square": 1,
  "aspect-[4/3]": 4 / 3,
  "aspect-[3/4]": 3 / 4,
  "aspect-[3/2]": 3 / 2,
  "aspect-[4/1]": 4 / 1,
};

const OUT_W = 960;

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

export default function ImageUpload({
  value, onChange, company, folder = "courses", label, aspectClass = "aspect-video",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef({ sx: 0, sy: 0, ox: 0, oy: 0 });

  const [stage, setStage] = useState<"idle" | "crop" | "uploading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [dropping, setDropping] = useState(false);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [previewDims, setPreviewDims] = useState<{ w: number; h: number } | null>(null);

  const aspect = ASPECT_MAP[aspectClass] ?? 16 / 9;
  const OUT_H = Math.round(OUT_W / aspect);

  useEffect(() => {
    if (!value) { setFileInfo(null); setPreviewDims(null); }
  }, [value]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageEl;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, OUT_W, OUT_H);
    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(0, 0, OUT_W, OUT_H);
    const sw = img.naturalWidth * scale;
    const sh = img.naturalHeight * scale;
    ctx.drawImage(img, OUT_W / 2 - sw / 2 + offset.x, OUT_H / 2 - sh / 2 + offset.y, sw, sh);
  }, [imageEl, scale, offset, OUT_H]);

  useEffect(() => {
    if (stage === "crop" || stage === "uploading") draw();
  }, [stage, draw]);

  async function processFile(file: File) {
    setError(null);
    if (file.size > 15 * 1024 * 1024) { setError("File too large. Maximum 15 MB."); return; }
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    if (!detectMime(head)) { setError("Invalid file. Only JPEG, PNG and WebP are accepted."); return; }
    const scan = new Uint8Array(await file.slice(0, 4096).arrayBuffer());
    if (hasMaliciousContent(scan)) { setError("File rejected: suspicious content detected."); return; }
    setFileInfo({ name: file.name, size: formatBytes(file.size) });
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const ms = Math.max(OUT_W / img.naturalWidth, OUT_H / img.naturalHeight);
      setMinScale(ms); setScale(ms); setOffset({ x: 0, y: 0 });
      setImageEl(img); setStage("crop");
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { setError("Could not load image. The file may be corrupted."); URL.revokeObjectURL(url); };
    img.src = url;
  }

  function handleFiles(files: FileList | null) {
    if (files?.length) processFile(files[0]);
  }

  function clamp(ox: number, oy: number, sc: number) {
    if (!imageEl) return { x: 0, y: 0 };
    const sw = imageEl.naturalWidth * sc;
    const sh = imageEl.naturalHeight * sc;
    const mx = Math.max(0, (sw - OUT_W) / 2);
    const my = Math.max(0, (sh - OUT_H) / 2);
    return { x: Math.max(-mx, Math.min(mx, ox)), y: Math.max(-my, Math.min(my, oy)) };
  }

  function onMouseDown(e: MouseEvent<HTMLCanvasElement>) {
    setPanning(true);
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onMouseMove(e: MouseEvent<HTMLCanvasElement>) {
    if (!panning || !imageEl || !canvasRef.current) return;
    const ratio = OUT_W / canvasRef.current.clientWidth;
    setOffset(clamp(dragRef.current.ox + (e.clientX - dragRef.current.sx) * ratio, dragRef.current.oy + (e.clientY - dragRef.current.sy) * ratio, scale));
  }
  function onMouseUp() { setPanning(false); }
  function onWheel(e: WheelEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    setScale((prev) => {
      const next = Math.max(minScale, Math.min(prev * (1 + delta), minScale * 6));
      setOffset((o) => clamp(o.x, o.y, next));
      return next;
    });
  }
  function zoomBy(delta: number) {
    setScale((prev) => {
      const next = Math.max(minScale, Math.min(prev * (1 + delta), minScale * 6));
      setOffset((o) => clamp(o.x, o.y, next));
      return next;
    });
  }

  async function confirmUpload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setStage("uploading");
    draw();
    canvas.toBlob(
      async (blob) => {
        if (!blob) { setError("Failed to process image."); setStage("crop"); return; }
        const fd = new FormData();
        fd.append("file", blob, "image.jpg");
        fd.append("folder", folder);
        try {
          const res = await fetch(`/api/admin/${company}/upload`, { method: "POST", credentials: "same-origin", body: fd });
          const json = await res.json();
          if (json.success) { onChange(json.url); setStage("idle"); setImageEl(null); }
          else { setError(json.error ?? "Upload failed."); setStage("crop"); }
        } catch { setError("Network error. Please try again."); setStage("crop"); }
      },
      "image/jpeg", 0.90,
    );
  }

  function cancelCrop() {
    setStage("idle"); setImageEl(null); setError(null); setFileInfo(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const pct = Math.round(((scale / minScale) - 1) * 100 + 100);
  const displayName = fileInfo?.name ?? (value ? filenameFromUrl(value) : "");
  const displayMeta = [fileInfo?.size, previewDims ? `${previewDims.w} × ${previewDims.h}` : null].filter(Boolean).join("  •  ");

  const isIdle = stage === "idle";

  // ── Drop zone (reused in both layouts) ────────────────────
  const dropZone = (compact: boolean) => (
    <div
      onClick={() => isIdle && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); isIdle && setDropping(true); }}
      onDragLeave={() => setDropping(false)}
      onDrop={(e: DragEvent<HTMLDivElement>) => {
        e.preventDefault(); setDropping(false);
        isIdle && handleFiles(e.dataTransfer.files);
      }}
      className={[
        "border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all",
        compact ? "p-5 cursor-pointer" : "p-8 cursor-pointer",
        !isIdle ? "pointer-events-none opacity-50" : "",
        dropping ? "border-blue-500 bg-blue-50" : "border-blue-200 hover:border-blue-400 hover:bg-blue-50/40",
      ].join(" ")}
    >
      <div className={`rounded-full bg-slate-100 flex items-center justify-center ${compact ? "w-11 h-11" : "w-16 h-16"}`}>
        <ImageIcon className={`text-blue-500 ${compact ? "w-5 h-5" : "w-8 h-8"}`} />
      </div>
      <div className="text-center">
        <p className={`font-bold text-slate-800 ${compact ? "text-xs" : "text-sm"}`}>
          {dropping ? "Drop to upload" : "Drag & drop your image here"}
        </p>
        <p className={`text-slate-400 mt-0.5 ${compact ? "text-[10px]" : "text-xs"}`}>or</p>
      </div>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); isIdle && inputRef.current?.click(); }}
        className={`flex items-center gap-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors ${compact ? "text-[11px] px-3 py-1.5" : "text-sm px-5 py-2.5"}`}
      >
        <FolderOpen className={compact ? "w-3 h-3" : "w-4 h-4"} />
        Browse Image
      </button>
    </div>
  );

  return (
    <div className="space-y-1.5">
      {label && (
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</p>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {value ? (
          /* ── Two-column: existing image + upload zone ── */
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

            {/* Left: selected image */}
            <div className="p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Selected Image</p>
              <div className={`${aspectClass} w-full rounded-lg overflow-hidden bg-slate-100 mb-3`}>
                <img
                  src={value}
                  alt=""
                  className="w-full h-full object-cover"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setPreviewDims({ w: img.naturalWidth, h: img.naturalHeight });
                  }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              {/* File info row */}
              <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-7 h-7 rounded-md bg-pink-50 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-700 truncate">{displayName}</p>
                  {displayMeta && <p className="text-[10px] text-slate-400">{displayMeta}</p>}
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <button
                  type="button"
                  onClick={() => { deleteBlobImage(value, company); onChange(""); setFileInfo(null); setPreviewDims(null); }}
                  className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: upload zone */}
            <div className="p-4 flex flex-col gap-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload New Image</p>
              {dropZone(true)}
              <div className="flex items-start gap-1.5">
                <Info className="w-3 h-3 text-blue-400 shrink-0 mt-px" />
                <p className="text-[10px] text-slate-400 leading-snug">
                  Clear, high-quality image. JPG, PNG, WebP.<br />Max file size: 15 MB.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ── Single column: empty upload zone ── */
          <div className="p-5 space-y-3">
            {dropZone(false)}
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-px" />
              <p className="text-xs text-slate-400 leading-snug">
                Please upload a clear and high-quality image.<br />
                Supported formats: JPG, PNG, WebP. Max file size: 15 MB.
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

      {/* ── Crop / adjust modal ───────────────────────────── */}
      {(stage === "crop" || stage === "uploading") && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] overflow-hidden">

            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 text-sm">Adjust Image</p>
                <p className="text-gray-400 text-[11px] mt-0.5">
                  Drag to reposition · Scroll or use +/– to zoom · EXIF data will be stripped on upload
                </p>
              </div>
              <button onClick={cancelCrop} className="text-gray-400 hover:text-gray-700 transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative bg-[#0f0f0f] select-none overflow-hidden" style={{ cursor: panning ? "grabbing" : "grab" }}>
              <canvas
                ref={canvasRef}
                width={OUT_W}
                height={OUT_H}
                className="w-full block"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onWheel={onWheel}
              />
              {stage === "uploading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                  <p className="text-white text-xs font-medium">Optimizing &amp; uploading…</p>
                </div>
              )}
            </div>

            <div className="px-5 py-4 bg-gray-50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button onClick={() => zoomBy(-0.15)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-red-400 hover:text-red-600 transition-colors text-gray-600">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-500 w-10 text-center tabular-nums">{pct}%</span>
                <button onClick={() => zoomBy(0.15)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-red-400 hover:text-red-600 transition-colors text-gray-600">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="hidden sm:flex items-center gap-1 ml-2 text-gray-400 text-[11px]">
                  <Move className="w-3 h-3" /> Drag to fit
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={cancelCrop} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={confirmUpload}
                  disabled={stage === "uploading"}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg font-semibold hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {stage === "uploading"
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Optimizing…</>
                    : <><Check className="w-3.5 h-3.5" /> Upload</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
