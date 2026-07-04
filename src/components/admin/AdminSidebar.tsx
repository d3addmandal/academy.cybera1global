"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, FileText, BookOpen, Calendar, Users, Navigation2,
  Palette, Settings, Globe, HelpCircle, MessageSquare, ChevronRight,
  Shield, LogOut, BarChart3, PanelLeftClose, PanelLeft, Star, Menu, X,
  GraduationCap, Briefcase, Building2, HeartHandshake, Inbox, UserCheck,
  Award, LayoutTemplate,
} from "lucide-react";
import type { UserRole } from "@/types/cms";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  roles?: UserRole[]; // undefined = all roles; array = only these roles
}

interface NavGroup {
  label: string;
  roles?: UserRole[]; // undefined = show to all; array = only these roles
  items: NavItem[];
}

function buildNav(base: string): NavGroup[] {
  return [
    {
      label: "Overview",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, href: `${base}/dashboard` },
      ],
    },
    {
      label: "CRM",
      roles: ["admin", "super_admin"],
      items: [
        { label: "Contact Submissions", icon: Inbox, href: `${base}/dashboard/contacts` },
      ],
    },
    {
      label: "Content",
      items: [
        { label: "Home Page",    icon: Globe,         href: `${base}/dashboard/home-content`, roles: ["admin", "super_admin"] },
        { label: "Programmes",  icon: BookOpen,       href: `${base}/dashboard/programmes`,   roles: ["admin", "super_admin", "editor"] },
        { label: "Blog Posts",  icon: FileText,       href: `${base}/dashboard/blog` },
        { label: "Trainers",    icon: UserCheck,      href: `${base}/dashboard/trainers`,      roles: ["admin", "super_admin"] },
        { label: "Events",      icon: Calendar,       href: `${base}/dashboard/events`,        roles: ["admin", "super_admin"] },
        { label: "Testimonials",icon: MessageSquare,  href: `${base}/dashboard/testimonials`,  roles: ["admin", "super_admin"] },
        { label: "FAQs",        icon: HelpCircle,     href: `${base}/dashboard/faqs`,          roles: ["admin", "super_admin"] },
        { label: "Certificates",          icon: Award,          href: `${base}/dashboard/certificates`,          roles: ["admin", "super_admin"] },
        { label: "Certificate Templates", icon: LayoutTemplate, href: `${base}/dashboard/certificate-templates`, roles: ["admin", "super_admin"] },
      ],
    },
    {
      label: "Static Pages",
      roles: ["admin", "super_admin"],
      items: [
        { label: "Academy Page",        icon: GraduationCap,  href: `${base}/dashboard/academy-page` },
        { label: "Corporate Training",  icon: Briefcase,      href: `${base}/dashboard/corporate-page` },
        { label: "Institutions",        icon: Building2,      href: `${base}/dashboard/institutions-page` },
        { label: "Career & Placement",  icon: HeartHandshake, href: `${base}/dashboard/career-page` },
      ],
    },
    {
      label: "Website",
      roles: ["admin", "super_admin"],
      items: [
        { label: "Announcement & CTA", icon: Navigation2, href: `${base}/dashboard/navigation` },
        { label: "Navigation Menus",   icon: Menu,        href: `${base}/dashboard/menus` },
        { label: "Custom Pages",       icon: BarChart3,   href: `${base}/dashboard/pages` },
      ],
    },
    {
      label: "Appearance",
      roles: ["admin", "super_admin"],
      items: [
        { label: "Theme & Branding", icon: Palette, href: `${base}/dashboard/theme` },
      ],
    },
    {
      label: "System",
      roles: ["admin", "super_admin"],
      items: [
        { label: "Site Settings", icon: Settings, href: `${base}/dashboard/settings` },
        { label: "Users & Roles", icon: Users,    href: `${base}/dashboard/users` },
      ],
    },
    {
      label: "Account",
      roles: ["editor", "sales"],
      items: [
        { label: "My Profile", icon: Users, href: `${base}/dashboard/users` },
      ],
    },
  ];
}

interface Props {
  company: string;
  adminSlug: string;
  companyName: string;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  role: UserRole;
}

export default function AdminSidebar({ company, adminSlug, companyName, collapsed, onToggle, mobileOpen, onMobileClose, role }: Props) {
  const pathname = usePathname();
  const base = `/webapplication/${company}/${adminSlug}`;
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      // Even if the request fails, proceed with redirect — cookie will expire naturally
    }
    window.location.href = `${base}/login`;
  };
  const allGroups = buildNav(base);

  // Filter groups and items to only those the current role can see
  const navGroups = allGroups
    .filter((g) => !g.roles || g.roles.includes(role))
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => !item.roles || item.roles.includes(role)),
    }))
    .filter((g) => g.items.length > 0);

  const isActive = (href: string) => {
    if (href === `${base}/dashboard`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 z-50 flex flex-col transition-all duration-300 w-64 ${
        collapsed ? "lg:w-16" : "lg:w-64"
      } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-slate-800 h-16 flex-shrink-0 px-5 gap-3 ${collapsed ? "lg:justify-center lg:px-2" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div className={`min-w-0 flex-1 ${collapsed ? "lg:hidden" : ""}`}>
          <p className="text-white font-bold text-sm truncate">{companyName}</p>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider">CRM Admin</p>
        </div>
        {/* Mobile-only close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden flex-shrink-0 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className={`text-slate-500 text-[10px] font-bold uppercase tracking-widest px-5 mb-1.5 ${collapsed ? "lg:hidden" : ""}`}>
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                    active
                      ? "bg-red-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  } ${collapsed ? "lg:justify-center" : ""}`}
                >
                  <item.icon className={`flex-shrink-0 ${active ? "text-white" : "text-slate-500 group-hover:text-white"}`} style={{ width: 18, height: 18 }} />
                  <span className={`flex-1 truncate ${collapsed ? "lg:hidden" : ""}`}>{item.label}</span>
                  {item.badge && (
                    <span className={`text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full ${collapsed ? "lg:hidden" : ""}`}>{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom: toggle + logout */}
      <div className="border-t border-slate-800 p-3 space-y-1">
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm"
        >
          {collapsed ? <PanelLeft style={{ width: 18, height: 18 }} /> : <PanelLeftClose style={{ width: 18, height: 18 }} />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          title={collapsed ? "Sign Out" : undefined}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-600/10 hover:text-red-400 transition-colors text-sm disabled:opacity-50"
        >
          <LogOut style={{ width: 18, height: 18 }} className={signingOut ? "animate-pulse" : ""} />
          <span className={collapsed ? "lg:hidden" : ""}>{signingOut ? "Signing out…" : "Sign Out"}</span>
        </button>
      </div>
    </aside>
  );
}
