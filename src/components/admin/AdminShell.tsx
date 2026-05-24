"use client";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { ToastProvider } from "./Toast";

interface Props {
  children: React.ReactNode;
  company: string;
  adminSlug: string;
  companyName: string;
  userName: string;
  userEmail: string;
}

export default function AdminShell({ children, company, adminSlug, companyName, userName, userEmail }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50" suppressHydrationWarning>
        <AdminSidebar
          company={company}
          adminSlug={adminSlug}
          companyName={companyName}
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
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
          <div className="p-6">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
