"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen, FileText, Calendar, MessageSquare, Globe, BarChart3,
  TrendingUp, Eye, ArrowRight, RefreshCw, AlertCircle
} from "lucide-react";
import { StatCard, PageHeader } from "@/components/admin/FormField";

interface Stats {
  programmes: { total: number; published: number; featured: number };
  blog: { total: number; published: number; featured: number };
  events: { total: number; upcoming: number };
  testimonials: { total: number; featured: number };
  pages: { total: number; published: number };
}

const quickLinks = [
  { label: "Edit Home Page", desc: "Hero, programmes, FAQ, CTA", href: "home-content", icon: Globe, color: "red" },
  { label: "Manage Programmes", desc: "Add, edit, reorder courses", href: "programmes", icon: BookOpen, color: "blue" },
  { label: "Write Blog Post", desc: "Create new article", href: "blog/new", icon: FileText, color: "green" },
  { label: "Add Event", desc: "Create new event", href: "events/new", icon: Calendar, color: "amber" },
  { label: "Navigation", desc: "Header & footer menus", href: "navigation", icon: BarChart3, color: "purple" },
  { label: "Theme & Branding", desc: "Colors, logo, fonts", href: "theme", icon: Globe, color: "red" },
];

export default function DashboardPage() {
  const params = useParams();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;

  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchStats() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/${company}/stats`, { credentials: "same-origin" });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchStats(); }, [company]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back! Here's an overview of your ${company} CRM.`}
        actions={
          <button onClick={fetchStats} className="flex items-center gap-1.5 text-sm text-slate-500 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        }
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Programmes" value={stats?.programmes.total ?? "—"} icon={BookOpen} color="blue" sub={`${stats?.programmes.published ?? 0} published`} />
        <StatCard label="Blog Posts" value={stats?.blog.total ?? "—"} icon={FileText} color="green" sub={`${stats?.blog.published ?? 0} published`} />
        <StatCard label="Events" value={stats?.events.total ?? "—"} icon={Calendar} color="amber" sub={`${stats?.events.upcoming ?? 0} upcoming`} />
        <StatCard label="Testimonials" value={stats?.testimonials.total ?? "—"} icon={MessageSquare} color="purple" sub={`${stats?.testimonials.featured ?? 0} featured`} />
        <StatCard label="Custom Pages" value={stats?.pages.total ?? "—"} icon={Eye} color="red" sub={`${stats?.pages.published ?? 0} live`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Quick Actions</h2>
              <p className="text-sm text-slate-400">Jump to common tasks</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-0">
              {quickLinks.map((link, i) => (
                <Link
                  key={link.label}
                  href={`${base}/${link.href}`}
                  className={`flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors group ${
                    i % 2 === 0 ? "sm:border-r border-slate-100" : ""
                  } ${i !== quickLinks.length - 1 ? "border-b border-slate-100" : ""} ${
                    i === quickLinks.length - 2 ? "sm:border-b-0" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors">
                    <link.icon className="w-5 h-5 text-red-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm group-hover:text-red-600 transition-colors">{link.label}</p>
                    <p className="text-xs text-slate-400">{link.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* CRM Overview panel */}
        <div className="space-y-4">
          {/* Website status */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-800 mb-4">Website Status</h3>
            <div className="space-y-3">
              {[
                { label: "Homepage", status: "Live", color: "emerald" },
                { label: "Courses Page", status: "Live", color: "emerald" },
                { label: "Blog", status: "Live", color: "emerald" },
                { label: "Contact Page", status: "Live", color: "emerald" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className={`text-xs font-semibold bg-${item.color}-50 text-${item.color}-700 border border-${item.color}-200 px-2 py-0.5 rounded-full`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/" target="_blank" className="mt-4 flex items-center gap-1.5 text-xs text-red-600 font-semibold hover:text-red-700">
              <Eye className="w-3.5 h-3.5" /> Preview Website
            </Link>
          </div>

          {/* Getting started */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-5 text-white">
            <h3 className="font-bold mb-2">Getting Started</h3>
            <ol className="space-y-2 text-sm text-slate-300">
              {[
                "Edit Home Page content",
                "Add your programmes",
                "Customize theme & colors",
                "Update navigation menus",
                "Add blog posts & events",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-600/20 text-red-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
