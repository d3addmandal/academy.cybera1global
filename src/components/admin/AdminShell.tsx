"use client";
import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { ToastProvider } from "./Toast";
import type { UserRole } from "@/types/cms";

interface Props {
  children: React.ReactNode;
  company: string;
  adminSlug: string;
  companyName: string;
  userName: string;
  userEmail: string;
  role: UserRole;
}

// 25 min client-side idle limit (server enforces 30 min — client fires first)
const IDLE_MS = 25 * 60 * 1000;
const IDLE_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;

export default function AdminShell({ children, company, adminSlug, companyName, userName, userEmail, role }: Props) {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setCollapsed(!mq.matches);
    const handler = (e: MediaQueryListEvent) => setCollapsed(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const doLogout = useCallback(async () => {
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
    window.location.href = `/webapplication/${company}/${adminSlug}/login?reason=timeout`;
  }, [company, adminSlug]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(doLogout, IDLE_MS);
    };
    IDLE_EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      IDLE_EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [doLogout]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50" suppressHydrationWarning>
        <AdminSidebar
          company={company}
          adminSlug={adminSlug}
          companyName={companyName}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          role={role}
        />
        <AdminHeader
          company={company}
          adminSlug={adminSlug}
          companyName={companyName}
          userName={userName}
          userEmail={userEmail}
          collapsed={collapsed}
        />
        <main
          className="min-h-screen pt-16 transition-all duration-300"
          style={{ marginLeft: collapsed ? 64 : 256 }}
        >
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
