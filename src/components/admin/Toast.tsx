"use client";
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "warning";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

const CFG = {
  success: {
    icon: CheckCircle2,
    iconBg: "bg-emerald-500",
    title: "Success",
    bar: "bg-emerald-500",
    btn: "bg-slate-900 hover:bg-slate-700",
  },
  error: {
    icon: XCircle,
    iconBg: "bg-red-600",
    title: "Error",
    bar: "bg-red-500",
    btn: "bg-red-600 hover:bg-red-500",
  },
  warning: {
    icon: AlertCircle,
    iconBg: "bg-amber-500",
    title: "Warning",
    bar: "bg-amber-500",
    btn: "bg-amber-600 hover:bg-amber-500",
  },
};

const AUTO_DISMISS_MS = 4000;

function ConfirmationModal({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const cfg = CFG[item.type];
  const Icon = cfg.icon;

  // animate the progress bar width from 100→0 over AUTO_DISMISS_MS
  useEffect(() => {
    const t = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [item.id, onDismiss]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-8 pt-10 pb-7">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-full ${cfg.iconBg} mx-auto mb-5 flex items-center justify-center shadow-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-black text-gray-900 mb-2">{cfg.title}</h3>

          {/* Message */}
          <p className="text-sm text-gray-500 leading-relaxed mb-7">{item.message}</p>

          {/* OK button */}
          <button
            onClick={onDismiss}
            className={`w-full ${cfg.btn} text-white font-bold py-3 rounded-xl transition-colors text-sm`}
          >
            OK
          </button>
        </div>

        {/* Auto-dismiss progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className={`h-full ${cfg.bar} origin-left`}
            style={{ animation: `shrink-bar ${AUTO_DISMISS_MS}ms linear forwards` }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink-bar {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setQueue((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismiss = useCallback(() => {
    setQueue((prev) => prev.slice(1));
  }, []);

  // Show only the first queued item; the rest wait
  const current = queue[0] ?? null;

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {current && <ConfirmationModal key={current.id} item={current} onDismiss={dismiss} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
