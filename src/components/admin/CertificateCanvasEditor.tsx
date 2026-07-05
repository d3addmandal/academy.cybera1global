"use client";
import { useCallback, useRef, useState } from "react";
import { X, Bold, AlignLeft, AlignCenter, AlignRight, GripVertical } from "lucide-react";
import { Field, Input } from "@/components/admin/FormField";
import { CERTIFICATE_TOKENS } from "@/lib/certificate-template";
import type { CertificateTemplateField } from "@/types/cms";

interface Props {
  backgroundImageUrl?: string;
  canvasWidth: number;
  canvasHeight: number;
  fields: CertificateTemplateField[];
  onChange: (fields: CertificateTemplateField[]) => void;
}

const MAX_PREVIEW_WIDTH = 760;
const DEFAULT_FONT_SIZE = 20;
const DEFAULT_COLOR = "#111111";
const DEFAULT_QR_SIZE = 100;

function tokenLabel(token: string): string {
  return CERTIFICATE_TOKENS.find((t) => t.token === token)?.label ?? token;
}

function defaultFieldFor(token: string, x: number, y: number): CertificateTemplateField {
  if (token === "qr_code") return { token, x, y, width: DEFAULT_QR_SIZE };
  return { token, x, y, fontSize: DEFAULT_FONT_SIZE, fontWeight: "normal", color: DEFAULT_COLOR, textAlign: "left" };
}

export default function CertificateCanvasEditor({ backgroundImageUrl, canvasWidth, canvasHeight, fields, onChange }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const dragState = useRef<{ index: number; startX: number; startY: number; fieldX: number; fieldY: number } | null>(null);

  const scale = Math.min(1, MAX_PREVIEW_WIDTH / canvasWidth);
  const previewWidth = Math.round(canvasWidth * scale);
  const previewHeight = Math.round(canvasHeight * scale);
  const placedTokens = new Set(fields.map((f) => f.token));

  function addField(token: string, clientX?: number, clientY?: number) {
    const rect = canvasRef.current?.getBoundingClientRect();
    let x = Math.round(canvasWidth / 2 - 60);
    let y = Math.round(canvasHeight / 2 - 12);
    if (rect && clientX !== undefined && clientY !== undefined) {
      x = Math.round((clientX - rect.left) / scale);
      y = Math.round((clientY - rect.top) / scale);
    }
    x = Math.max(0, Math.min(canvasWidth, x));
    y = Math.max(0, Math.min(canvasHeight, y));
    const next = [...fields, defaultFieldFor(token, x, y)];
    onChange(next);
    setSelected(next.length - 1);
  }

  function updateField(index: number, patch: Partial<CertificateTemplateField>) {
    onChange(fields.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index));
    setSelected(null);
  }

  const handleBoxMouseDown = useCallback((index: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(index);
    const field = fields[index];
    dragState.current = { index, startX: e.clientX, startY: e.clientY, fieldX: field.x, fieldY: field.y };

    function onMove(ev: MouseEvent) {
      const state = dragState.current;
      if (!state) return;
      const dx = (ev.clientX - state.startX) / scale;
      const dy = (ev.clientY - state.startY) / scale;
      const nx = Math.max(0, Math.min(canvasWidth, Math.round(state.fieldX + dx)));
      const ny = Math.max(0, Math.min(canvasHeight, Math.round(state.fieldY + dy)));
      onChange(fields.map((f, i) => (i === state.index ? { ...f, x: nx, y: ny } : f)));
    }
    function onUp() {
      dragState.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [fields, scale, canvasWidth, canvasHeight, onChange]);

  const selectedField = selected !== null ? fields[selected] : null;

  return (
    <div className="grid lg:grid-cols-[200px_1fr_240px] gap-5">
      {/* Palette */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fields</p>
        {CERTIFICATE_TOKENS.map((t) => {
          const placed = placedTokens.has(t.token);
          return (
            <div
              key={t.token}
              draggable={!placed}
              onDragStart={(e) => { e.dataTransfer.setData("text/plain", t.token); }}
              onClick={() => !placed && addField(t.token)}
              title={t.description}
              className={[
                "px-3 py-2 rounded-lg border text-xs font-semibold transition-colors select-none",
                placed
                  ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                  : "border-slate-200 bg-white text-slate-700 cursor-grab hover:border-red-300 hover:bg-red-50",
              ].join(" ")}
            >
              <span className="flex items-center gap-1.5">
                {!placed && <GripVertical className="w-3 h-3 text-slate-300 flex-shrink-0" />}
                {t.label}
              </span>
            </div>
          );
        })}
        <p className="text-[11px] text-slate-400 pt-1">Drag onto the canvas, or click to place. Only the fields you use will appear on the certificate.</p>
      </div>

      {/* Canvas */}
      <div className="flex flex-col items-center gap-2">
        <div
          ref={canvasRef}
          onClick={() => setSelected(null)}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const token = e.dataTransfer.getData("text/plain");
            if (token) addField(token, e.clientX, e.clientY);
          }}
          className={`relative bg-slate-100 border-2 rounded-lg overflow-hidden ${dragOver ? "border-red-400" : "border-slate-200"}`}
          style={{ width: previewWidth, height: previewHeight }}
        >
          {backgroundImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={backgroundImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
          )}
          {fields.map((field, i) => {
            const isQr = field.token === "qr_code";
            const size = isQr ? (field.width ?? DEFAULT_QR_SIZE) * scale : undefined;
            return (
              <div
                key={i}
                onMouseDown={handleBoxMouseDown(i)}
                className={`absolute cursor-move border ${selected === i ? "border-red-500 ring-1 ring-red-300" : "border-transparent hover:border-red-300"}`}
                style={{
                  left: field.x * scale,
                  top: field.y * scale,
                  width: isQr ? size : undefined,
                  height: isQr ? size : undefined,
                  fontSize: isQr ? undefined : (field.fontSize ?? DEFAULT_FONT_SIZE) * scale,
                  fontWeight: isQr ? undefined : (field.fontWeight ?? "normal"),
                  color: isQr ? undefined : (field.color ?? DEFAULT_COLOR),
                  textAlign: isQr ? undefined : (field.textAlign ?? "left"),
                  whiteSpace: "nowrap",
                  background: isQr ? "repeating-conic-gradient(#cbd5e1 0% 25%, #e2e8f0 0% 50%) 50% / 12px 12px" : "rgba(255,255,255,0.55)",
                  fontFamily: "Arial, Helvetica, sans-serif",
                }}
              >
                {isQr ? (
                  <span className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-500">QR</span>
                ) : (
                  tokenLabel(field.token)
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-400">{canvasWidth} × {canvasHeight}px design canvas</p>
      </div>

      {/* Inspector */}
      <div>
        {selectedField ? (
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-600">{tokenLabel(selectedField.token)}</p>
              <button onClick={() => removeField(selected as number)} className="text-slate-300 hover:text-red-500" title="Remove field">
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedField.token === "qr_code" ? (
              <Field label="Size (px)">
                <input
                  type="range" min={40} max={300}
                  value={selectedField.width ?? DEFAULT_QR_SIZE}
                  onChange={(e) => updateField(selected as number, { width: Number(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-slate-400 mt-1">{selectedField.width ?? DEFAULT_QR_SIZE}px</p>
              </Field>
            ) : (
              <>
                <Field label="Font Size">
                  <Input
                    type="number" min={8} max={96}
                    value={selectedField.fontSize ?? DEFAULT_FONT_SIZE}
                    onChange={(e) => updateField(selected as number, { fontSize: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Color">
                  <input
                    type="color"
                    value={selectedField.color ?? DEFAULT_COLOR}
                    onChange={(e) => updateField(selected as number, { color: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-200 cursor-pointer"
                  />
                </Field>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateField(selected as number, { fontWeight: selectedField.fontWeight === "bold" ? "normal" : "bold" })}
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${selectedField.fontWeight === "bold" ? "border-red-400 bg-red-50 text-red-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  {([
                    { value: "left", icon: AlignLeft },
                    { value: "center", icon: AlignCenter },
                    { value: "right", icon: AlignRight },
                  ] as const).map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateField(selected as number, { textAlign: value })}
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${(selectedField.textAlign ?? "left") === value ? "border-red-400 bg-red-50 text-red-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                      title={`Align ${value}`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="border border-dashed border-slate-200 rounded-xl p-4 text-xs text-slate-400">
            Select a field on the canvas to edit its style, or drag a new one in from the left.
          </div>
        )}
      </div>
    </div>
  );
}
