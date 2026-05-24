"use client";
import { useRouter, usePathname } from "next/navigation";
import { Bell, ExternalLink, ChevronRight, User } from "lucide-react";

interface Props {
  companyName: string;
  company: string;
  adminSlug: string;
  userName: string;
  userEmail: string;
  collapsed: boolean;
}

function buildBreadcrumb(pathname: string, base: string): string[] {
  const relative = pathname.replace(`${base}/dashboard`, "");
  const parts = relative.split("/").filter(Boolean);
  return parts.map((p) =>
    p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export default function AdminHeader({ companyName, company, adminSlug, userName, userEmail, collapsed }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const base = `/webapplication/${company}/${adminSlug}`;
  const crumbs = buildBreadcrumb(pathname, base);

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push(`${base}/login`);
  }

  return (
    <header
      className="fixed top-0 right-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center px-6 gap-4 transition-all duration-300"
      style={{ left: collapsed ? 64 : 256 }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
        <span className="text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => router.push(`${base}/dashboard`)}>
          Dashboard
        </span>
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className={i === crumbs.length - 1 ? "text-slate-800 font-semibold" : "text-slate-400"}>{c}</span>
          </span>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-red-300 hover:text-red-600 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Website
        </a>

        <button className="relative w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2.5 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors cursor-pointer" onClick={handleLogout}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">{userName}</p>
            <p className="text-xs text-slate-400 truncate max-w-[120px]">{userEmail}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
