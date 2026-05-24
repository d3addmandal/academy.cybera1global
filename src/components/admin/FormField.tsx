"use client";
import { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, required, hint, error, children, className = "" }: FieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputBase = "w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/20 transition-colors bg-white disabled:bg-slate-50 disabled:text-slate-400";

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputBase} ${className}`} {...props} />;
}

export function Textarea({ className = "", rows = 4, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputBase} resize-none ${className}`} rows={rows} {...props} />;
}

export function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${inputBase} ${className}`} {...props}>
      {children}
    </select>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  size?: "sm" | "md";
}

export function Toggle({ checked, onChange, label, size = "md" }: ToggleProps) {
  const w = size === "sm" ? "w-8" : "w-10";
  const h = size === "sm" ? "h-4" : "h-5";
  const dot = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
  const translate = checked ? (size === "sm" ? "translate-x-4" : "translate-x-5") : "translate-x-0.5";

  return (
    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onChange(!checked)}>
      <div className={`${w} ${h} rounded-full flex items-center transition-colors ${checked ? "bg-red-600" : "bg-slate-200"}`}>
        <div className={`${dot} ${translate} rounded-full bg-white shadow transition-transform`} />
      </div>
      {label && <span className="text-sm text-slate-600">{label}</span>}
    </div>
  );
}

interface SaveBarProps {
  onSave: () => void;
  isLoading: boolean;
  isDirty?: boolean;
  label?: string;
}

export function SaveBar({ onSave, isLoading, isDirty = true, label = "Save Changes" }: SaveBarProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between z-10">
      {isDirty ? (
        <p className="text-xs text-amber-600 font-medium">● Unsaved changes</p>
      ) : (
        <p className="text-xs text-emerald-600 font-medium">✓ All changes saved</p>
      )}
      <button
        onClick={onSave}
        disabled={isLoading || !isDirty}
        className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold text-sm px-5 py-2 rounded-lg hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Saving…
          </span>
        ) : label}
      </button>
    </div>
  );
}

interface CardProps { title: string; subtitle?: string; children: ReactNode; action?: ReactNode; }

export function Card({ title, subtitle, children, action }: CardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color = "red", sub }: { label: string; value: string | number; icon: React.ElementType; color?: string; sub?: string }) {
  const colors: Record<string, string> = {
    red: "bg-red-50 text-red-600 border-red-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    draft: "bg-amber-50 text-amber-700 border-amber-200",
    archived: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${map[status] ?? map.draft}`}>
      {status}
    </span>
  );
}
