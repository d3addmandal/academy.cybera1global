"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Menu, X, ChevronDown, Phone, MessageCircle, BookOpen,
  Shield, Globe, Users, Briefcase, Laptop, FileText,
  Award, GraduationCap, Building2, Cpu, BookMarked, Calendar,
} from "lucide-react";
import type { ThemeSettings, SiteSettings, NavigationSettings, Programme } from "@/types/cms";

// Pick an icon per programme based on keywords in shortTitle / category
function programmeIcon(p: Programme): React.ElementType {
  const key = (p.shortTitle + " " + p.category).toLowerCase();
  if (key.includes("soc") || key.includes("monitor")) return Cpu;
  if (key.includes("vapt") || key.includes("pentest")) return FileText;
  if (key.includes("cloud")) return Laptop;
  if (key.includes("ai") || key.includes("ml")) return GraduationCap;
  if (key.includes("web") || key.includes("app")) return Globe;
  if (key.includes("bug") || key.includes("bounty")) return Award;
  if (key.includes("ccse") || key.includes("expert")) return BookMarked;
  return Shield;
}

const staticNavLinks = [
  { label: "Home", href: "/" },
  {
    label: "Academy",
    href: "/academy",
    dropdown: [
      { label: "About Academy", href: "/academy", icon: Shield },
      { label: "Our Mission & Vision", href: "/academy#mission", icon: Award },
      { label: "Training Methodology", href: "/academy#methodology", icon: BookOpen },
      { label: "Labs & Infrastructure", href: "/academy#labs", icon: Laptop },
      { label: "Meet Our Trainers", href: "/academy#trainers", icon: Users },
    ],
  },
  // Courses slot — filled dynamically from CRM
  { label: "Corporate Training", href: "/corporate-training" },
  { label: "Institutions", href: "/institutions" },
  { label: "Events", href: "/events" },
  { label: "Blog", href: "/blog" },
  { label: "Career & Placement", href: "/career-placement" },
];

interface HeaderProps {
  theme?: ThemeSettings | null;
  settings?: SiteSettings | null;
  nav?: NavigationSettings | null;
  programmes?: Programme[];
}

export default function Header({ theme, settings, nav, programmes = [] }: HeaderProps) {
  const logoImageUrl = theme?.logo?.imageUrl ?? "";
  const logoText = theme?.logo?.text ?? "Cyber A1";
  const logoHighlight = theme?.logo?.highlight ?? "A1";
  const primaryColor = theme?.colors?.primary ?? "#e00000";
  const phone = settings?.phone ?? "+91 8240 006 007";
  const whatsappNumber = settings?.whatsapp ?? "+918240006007";
  const announcementText = nav?.announcementBar?.text ??
    "Admissions Open for CCEH & CCSE 2026 Batch | Corporate Training Available | Free Career Counseling";
  const announcementEnabled = nav?.announcementBar?.enabled ?? true;

  // Build dynamic Courses dropdown from CRM published programmes
  const coursesDropdown = [
    { label: "Explore All Programs", href: "/courses", icon: Globe },
    ...programmes.map((p) => ({
      label: `${p.shortTitle} ${p.duration ? `(${p.duration})` : ""}`.trim(),
      href: `/courses/${p.slug}`,
      icon: programmeIcon(p),
    })),
  ];

  // Merge static + dynamic courses entry
  const navLinks = [
    staticNavLinks[0], // Home
    staticNavLinks[1], // Academy
    { label: "Courses", href: "/courses", dropdown: coursesDropdown },
    ...staticNavLinks.slice(2), // Corporate Training ... Career & Placement
  ];

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(label);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Announcement Bar */}
      {announcementEnabled && (
        <div className="announcement-bg text-white py-2 px-4">
          <div className="site-container flex items-center justify-between gap-4">
            <p className="text-xs font-medium text-center flex-1 truncate">{announcementText}</p>
            <div className="flex items-center gap-3 flex-shrink-0">
              <a
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                target="_blank" rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> {phone}
              </a>
              <Link
                href="/contact"
                className="bg-white text-red-700 text-xs font-bold px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors whitespace-nowrap"
              >
                {nav?.announcementBar?.ctaText ?? "Book Counseling"}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <nav
        className={`bg-[#080b10] border-b transition-all duration-300 ${
          scrolled ? "border-red-900/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)]" : "border-gray-800/50"
        }`}
        ref={dropdownRef}
      >
        <div className="site-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              {/* Icon: uploaded image or gradient shield */}
              {logoImageUrl ? (
                <img
                  src={logoImageUrl}
                  alt={logoText}
                  className="w-9 h-9 rounded-lg object-contain bg-black/20 p-0.5 flex-shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(224,0,0,0.4)] flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${theme?.colors?.primaryDark ?? "#8b0000"})` }}
                >
                  <Shield className="w-5 h-5 text-white" />
                </div>
              )}
              {/* Company name text — always shown */}
              <div>
                <span className="text-white font-bold text-base leading-tight block">
                  {logoText.replace(logoHighlight, "")}
                  <span style={{ color: primaryColor }}>{logoHighlight}</span>
                </span>
                <span className="text-gray-400 text-[10px] font-medium leading-tight block">ACADEMY</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden xl:flex items-center gap-0.5">
              {navLinks.map((link) =>
                "dropdown" in link && link.dropdown ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(link.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button className="flex items-center gap-1 px-3 py-2 text-gray-300 text-sm font-medium hover:text-red-400 transition-colors rounded-md hover:bg-white/5">
                      {link.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === link.label ? "rotate-180" : ""}`} />
                    </button>
                    {activeDropdown === link.label && (
                      <div className="absolute top-full left-0 mt-1 bg-[#0d1117] border border-gray-700/50 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] min-w-[240px] py-2 z-50 max-h-[70vh] overflow-y-auto">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-red-400 hover:bg-red-600/10 transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <item.icon className="w-4 h-4 text-red-500/70 flex-shrink-0" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={(link as { href: string }).href}
                    className="px-3 py-2 text-gray-300 text-sm font-medium hover:text-red-400 transition-colors rounded-md hover:bg-white/5"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            {/* Desktop CTA — Contact Us */}
            <div className="hidden xl:flex items-center gap-3">
              <Link
                href="/contact"
                className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-red-700 to-red-600 px-5 py-2 rounded-lg hover:from-red-600 hover:to-red-500 hover:shadow-[0_4px_15px_rgba(224,0,0,0.3)] transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden p-2 text-gray-300 hover:text-white transition-colors rounded-md hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="xl:hidden bg-[#0d1117] border-t border-gray-800 max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) =>
                "dropdown" in link && link.dropdown ? (
                  <div key={link.label}>
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === link.label ? null : link.label)}
                      className="w-full flex items-center justify-between px-4 py-3 text-gray-200 text-sm font-medium rounded-lg hover:bg-white/5 transition-colors"
                    >
                      {link.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded === link.label ? "rotate-180" : ""}`} />
                    </button>
                    {mobileExpanded === link.label && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-red-600/30 pl-4">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
                            onClick={() => setMobileOpen(false)}
                          >
                            <item.icon className="w-3.5 h-3.5 text-red-500/60 flex-shrink-0" />
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    href={(link as { href: string }).href}
                    className="block px-4 py-3 text-gray-200 text-sm font-medium rounded-lg hover:bg-white/5 hover:text-red-400 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="pt-4 border-t border-gray-800 space-y-2">
                <Link
                  href="/contact"
                  className="block w-full text-center bg-gradient-to-r from-red-700 to-red-600 text-white font-semibold py-3 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

