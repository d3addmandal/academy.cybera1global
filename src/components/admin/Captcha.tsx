"use client";
import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { RefreshCw } from "lucide-react";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function genCode(len = 6) {
  return Array.from({ length: len }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
}

function draw(canvas: HTMLCanvasElement, code: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, w, h);

  // Noise lines
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = `rgba(${80 + Math.random() * 80},${20 + Math.random() * 30},${20 + Math.random() * 30},${0.5 + Math.random() * 0.3})`;
    ctx.lineWidth = Math.random() * 1.5 + 0.5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * w, Math.random() * h);
    ctx.bezierCurveTo(
      Math.random() * w, Math.random() * h,
      Math.random() * w, Math.random() * h,
      Math.random() * w, Math.random() * h,
    );
    ctx.stroke();
  }

  // Noise dots
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.15})`;
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Characters
  const cellW = w / code.length;
  code.split("").forEach((ch, i) => {
    ctx.save();
    const cx = cellW * i + cellW / 2;
    const cy = h / 2 + (Math.random() * 8 - 4);
    ctx.translate(cx, cy);
    ctx.rotate((Math.random() - 0.5) * 0.45);
    const size = 20 + Math.floor(Math.random() * 7);
    ctx.font = `bold ${size}px 'Courier New', monospace`;
    // alternate between red/orange tones and lighter grey
    const hue = i % 2 === 0 ? Math.random() * 30 + 345 : Math.random() * 20 + 200;
    const light = 60 + Math.random() * 20;
    ctx.fillStyle = `hsl(${hue},70%,${light}%)`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
}

export interface CaptchaHandle {
  refresh: () => void;
  validate: (input: string) => boolean;
}

interface Props {
  onValidChange?: (valid: boolean) => void;
}

const Captcha = forwardRef<CaptchaHandle, Props>(function Captcha({ onValidChange }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [code, setCode] = useState(() => genCode());
  const [input, setInput] = useState("");

  const refresh = useCallback(() => {
    const c = genCode();
    setCode(c);
    setInput("");
    onValidChange?.(false);
  }, [onValidChange]);

  useImperativeHandle(ref, () => ({
    refresh,
    validate: (val: string) => val.toUpperCase() === code,
  }));

  useEffect(() => {
    if (canvasRef.current) draw(canvasRef.current, code);
  }, [code]);

  useEffect(() => {
    onValidChange?.(input.toUpperCase() === code);
  }, [input, code, onValidChange]);

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-300 mb-1.5">Verification Code</label>
      <div className="flex items-center gap-3 mb-2">
        <canvas
          ref={canvasRef}
          width={200}
          height={52}
          className="rounded-lg border border-slate-700 flex-shrink-0"
          style={{ imageRendering: "crisp-edges" }}
        />
        <button
          type="button"
          onClick={refresh}
          title="Refresh captcha"
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors flex-shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value.toUpperCase())}
        placeholder="Enter the code above"
        maxLength={6}
        autoComplete="off"
        className="w-full bg-slate-800 border border-slate-700 text-white text-sm px-4 py-3 rounded-xl placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all tracking-[0.25em] font-mono uppercase"
      />
    </div>
  );
});

export default Captcha;
