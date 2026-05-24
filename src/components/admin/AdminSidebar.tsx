"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, BookOpen, Calendar, Users, Navigation2,
  Palette, Settings, Globe, HelpCircle, MessageSquare, ChevronRight,
  Shield, LogOut, BarChart3, PanelLeftClose, PanelLeft, Star, Menu,
  GraduationCap, Briefcase, Building2, HeartHandshake
} from "lucide-react";

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
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
      label: "Content",
      items: [
        { label: "Home Page", icon: Globe, href: `${base}/dashboard/home-content` },
        { label: "Programmes", icon: BookOpen, href: `${base}/dashboard/programmes` },
        { label: "Blog Posts", icon: FileText, href: `${base}/dashboard/blog` },
        { label: "Events", icon: Calendar, href: `${base}/dashboard/events` },
        { label: "Testimonials", icon: MessageSquare, href: `${base}/dashboard/testimonials` },
        { label: "FAQs", icon: HelpCircle, href: `${base}/dashboard/faqs` },
      ],
    },
    {
      label: "Static Pages",
      items: [
        { label: "Academy Page", icon: GraduationCap, href: `${base}/dashboard/academy-page` },
        { label: "Corporate Training", icon: Briefcase, href: `${base}/dashboard/corporate-page` },
        { label: "Institutions", icon: Building2, href: `${base}/dashboard/institutions-page` },
        { label: "Career & Placement", icon: HeartHandshake, href: `${base}/dashboard/career-page` },
      ],
    },
    {
      label: "Website",
      items: [
        { label: "Navigation", icon: Navigation2, href: `${base}/dashboard/navigation` },
        { label: "Menus", icon: Menu, href: `${base}/dashboard/menus` },
        { label: "Pages", icon: BarChart3, href: `${base}/dashboard/pages` },
      ],
    },
    {
      label: "Appearance",
      items: [
        { label: "Theme & Branding", icon: Palette, href: `${base}/dashboard/theme` },
      ],
    },
    {
      label: "System",
      items: [
        { label: "Site Settings", icon: Settings, href: `${base}/dashboard/settings` },
        { label: "Users & Roles", icon: Users, href: `${base}/dashboard/users` },
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
}

export default function AdminSidebar({ company, adminSlug, companyName, collapsed, onToggle }: Props) {
  const pathname = usePathname();
  const base = `/webapplication/${company}/${adminSlug}`;
  const navGroups = buildNav(base);

  const isActive = (href: string) => {
    if (href === `${base}/dashboard`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 z-40 flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-slate-800 h-16 flex-shrink-0 ${collapsed ? "justify-center px-2" : "px-5 gap-3"}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{companyName}</p>
            <p className="text-slate-500 text-[10px] uppercase tracking-wider">CRM Admin</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-5 mb-1.5">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                    active
                      ? "bg-red-600 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? "text-white" : "text-slate-500 group-hover:text-white"}`} style={{ width: 18, height: 18 }} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">{item.badge}</span>
                      )}
                    </>
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
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm"
        >
          {collapsed ? <PanelLeft className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} /> : <PanelLeftClose className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <Link
          href={`${base}/login`}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-600/10 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut style={{ width: 18, height: 18 }} />
          {!collapsed && <span>Sign Out</span>}
        </Link>
      </div>
    </aside>
  );
}
