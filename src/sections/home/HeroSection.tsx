"use client";
import Link from "next/link";
import {
  ArrowRight, Play, Shield, FlaskConical, Compass, Building2,
  Users, Star, Calendar, TrendingUp, ChevronRight
} from "lucide-react";
import type { HeroSection as HeroData } from "@/types/cms";

const ICON_MAP: Record<string, React.ElementType> = {
  Building2, FlaskConical, Compass, Shield, Users, Star,
  Calendar, TrendingUp, ArrowRight, Play,
};

const DEFAULT_TRUST = [
  { icon: "Building2", label: "Industry-Led Training" },
  { icon: "FlaskConical", label: "Hands-On Labs" },
  { icon: "Compass", label: "Career Guidance" },
  { icon: "Shield", label: "Enterprise Exposure" },
  { icon: "Users", label: "Community Ecosystem" },
];

interface Props { content?: HeroData | null; }

export default function HeroSection({ content }: Props) {
  const badge = content?.badge ?? "Enterprise-Focused Cybersecurity Training Platform";
  const line1 = content?.headlineLine1 ?? "Build Real";
  const line2 = content?.headlineLine2 ?? "Cybersecurity";
  const accent = content?.headlineAccent ?? "Skills For Industry & Enterprise";
  const sub = content?.subheadline ?? "Hands-on cybersecurity programs designed by security professionals with practical exposure in VAPT, cloud security, SOC operations, secure coding, and enterprise security workflows.";
  const heroImage = content?.heroImage ?? "";
  const buttons = content?.buttons ?? [
    { label: "Explore Programs", href: "/courses", variant: "primary" as const },
    { label: "Corporate Training", href: "/corporate-training", variant: "outline" as const },
    { label: "Watch Student Journey", href: "#", variant: "ghost" as const },
  ];
  const trustItems = content?.trustItems ?? DEFAULT_TRUST;
  const cards = content?.floatingCards;

  return (
    <section className="relative min-h-screen bg-[#080b10] flex items-center overflow-hidden">
      {/* Full-bleed background image */}
      {heroImage ? (
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e1520] via-[#080b10] to-[#050508]" />
      )}

      {/* Overlay: heavy on left, fades to semi-dark on right */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#080b10] via-[#080b10]/90 to-[#080b10]/50" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080b10] to-transparent" />
      {/* Subtle red ambient glow top-left */}
      <div className="absolute top-0 left-0 w-[600px] h-[400px] bg-red-950/25 rounded-full blur-[120px] pointer-events-none" />

      {/* Red vertical accent bar */}
      <div className="absolute hidden lg:block w-px bg-gradient-to-b from-transparent via-red-600/50 to-transparent top-16 bottom-16"
        style={{ left: "calc(50% - 80px)" }} />

      <div className="relative z-10 w-full px-5 lg:px-0 lg:w-[95%] mx-auto pt-28 pb-16">
        <div className="grid lg:grid-cols-[1fr_260px] gap-8 lg:gap-12 items-center min-h-[calc(100vh-11rem)]">

          {/* ── LEFT: text content ── */}
          <div className="flex flex-col justify-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-red-600/15 border border-red-600/30 text-red-400 text-[11px] font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              {badge}
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] xl:text-6xl font-black text-white leading-[1.07] mb-5">
              {line1}&nbsp;{line2}<br />
              <span className="text-red-500">{accent}</span>
            </h1>

            {/* Sub */}
            <p className="text-gray-400 text-[15px] lg:text-[16.5px] leading-relaxed mb-8 max-w-[520px]">
              {sub}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-10">
              {buttons.map((btn, i) => {
                if (btn.variant === "ghost") {
                  return (
                    <button key={i} className="inline-flex items-center gap-2.5 text-gray-300 hover:text-red-400 font-semibold text-sm transition-colors">
                      <div className="w-10 h-10 rounded-full border border-red-600/40 bg-red-600/10 flex items-center justify-center flex-shrink-0">
                        <Play className="w-3.5 h-3.5 text-red-400 fill-red-400 ml-0.5" />
                      </div>
                      {btn.label}
                    </button>
                  );
                }
                const variantClass =
                  btn.variant === "primary"
                    ? "bg-gradient-to-r from-red-700 to-red-600 text-white hover:from-red-600 hover:to-red-500 hover:shadow-[0_8px_28px_rgba(224,0,0,0.45)] hover:-translate-y-0.5 px-6 py-3 rounded-lg font-bold text-sm"
                    : "bg-white/5 border border-gray-600 text-white hover:border-gray-400 hover:bg-white/10 px-6 py-3 rounded-lg font-bold text-sm";
                return (
                  <Link key={i} href={btn.href}
                    className={`inline-flex items-center gap-2 transition-all duration-200 ${variantClass}`}>
                    {btn.label}
                    {btn.variant === "primary" && <ArrowRight className="w-4 h-4" />}
                  </Link>
                );
              })}
            </div>

            {/* Mobile floating cards — compact horizontal strip */}
            <div className="flex lg:hidden gap-3 overflow-x-auto pb-2 mb-2 -mx-1 px-1">
              {(!cards || cards.popularProgram?.enabled !== false) && (
                <div className="flex-shrink-0 w-44 bg-[#0d1117]/90 backdrop-blur-md border border-gray-700/60 rounded-xl p-3 shadow-xl">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">{cards?.popularProgram?.badgeText ?? "Popular Program"}</p>
                  <p className="text-white font-bold text-[11px] leading-snug mb-1">{cards?.popularProgram?.title ?? "CCSE (12 Months)"}</p>
                  <Link href={cards?.popularProgram?.href ?? "/courses"} className="text-red-500 text-[10px] font-semibold">View →</Link>
                </div>
              )}
              {(!cards || cards.upcomingBatch?.enabled !== false) && (
                <div className="flex-shrink-0 w-44 bg-[#0d1117]/90 backdrop-blur-md border border-gray-700/60 rounded-xl p-3 shadow-xl">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">{cards?.upcomingBatch?.badgeText ?? "Upcoming Batch"}</p>
                  <p className="text-white font-bold text-[11px] leading-snug mb-1">{cards?.upcomingBatch?.title ?? "24th June 2026"}</p>
                  <Link href={cards?.upcomingBatch?.href ?? "/contact"} className="text-red-500 text-[10px] font-semibold">Enroll →</Link>
                </div>
              )}
              {(!cards || cards.careerSupport?.enabled !== false) && (
                <div className="flex-shrink-0 w-44 bg-[#0d1117]/90 backdrop-blur-md border border-gray-700/60 rounded-xl p-3 shadow-xl">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">{cards?.careerSupport?.badgeText ?? "Career Support"}</p>
                  <p className="text-white font-bold text-[11px] leading-snug mb-1">{cards?.careerSupport?.title ?? "100% Practical"}</p>
                  <Link href={cards?.careerSupport?.href ?? "/career-placement"} className="text-red-500 text-[10px] font-semibold">Know more →</Link>
                </div>
              )}
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap gap-x-5 gap-y-3">
              {trustItems.map((item) => {
                const Icon = ICON_MAP[item.icon] ?? Shield;
                return (
                  <div key={item.label} className="flex items-center gap-2 text-gray-400 text-xs">
                    <div className="w-7 h-7 rounded-md bg-red-600/15 border border-red-600/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: stacked floating cards (desktop) ── */}
          <div className="hidden lg:flex flex-col gap-4 py-4">

            {/* Popular Program */}
            {(!cards || cards.popularProgram?.enabled !== false) && (
              <div className="bg-[#0d1117]/85 backdrop-blur-md border border-gray-700/60 rounded-xl p-4 shadow-2xl">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {cards?.popularProgram?.badgeText ?? "Popular Program"}
                  </span>
                </div>
                <p className="text-white font-bold text-[13px] leading-snug mb-1">
                  {cards?.popularProgram?.title ?? "CCSE (12 Months)"}
                </p>
                <p className="text-gray-500 text-[11px] leading-snug mb-3">
                  {cards?.popularProgram?.subtitle ?? "Comprehensive Cybersecurity Expert Program"}
                </p>
                <Link
                  href={cards?.popularProgram?.href ?? "/courses"}
                  className="inline-flex items-center gap-1 text-red-500 text-[11px] font-semibold hover:gap-1.5 transition-all"
                >
                  View Program <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* Upcoming Batch */}
            {(!cards || cards.upcomingBatch?.enabled !== false) && (
              <div className="bg-[#0d1117]/85 backdrop-blur-md border border-gray-700/60 rounded-xl p-4 shadow-2xl">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Calendar className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {cards?.upcomingBatch?.badgeText ?? "Upcoming Batch"}
                  </span>
                </div>
                <p className="text-white font-bold text-[13px] leading-snug mb-1">
                  {cards?.upcomingBatch?.title ?? "24th June 2026"}
                </p>
                <p className="text-gray-500 text-[11px] leading-snug mb-3">
                  {cards?.upcomingBatch?.subtitle ?? "Weekend Batch (Online + Offline)"}
                </p>
                <Link
                  href={cards?.upcomingBatch?.href ?? "/contact"}
                  className="inline-flex items-center gap-1 text-red-500 text-[11px] font-semibold hover:gap-1.5 transition-all"
                >
                  Enroll Now <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* Career Support */}
            {(!cards || cards.careerSupport?.enabled !== false) && (
              <div className="bg-[#0d1117]/85 backdrop-blur-md border border-gray-700/60 rounded-xl p-4 shadow-2xl">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {cards?.careerSupport?.badgeText ?? "Career Support"}
                  </span>
                </div>
                <p className="text-white font-bold text-[13px] leading-snug mb-1">
                  {cards?.careerSupport?.title ?? "100% Practical"}
                </p>
                <p className="text-gray-500 text-[11px] leading-snug mb-3">
                  {cards?.careerSupport?.subtitle ?? "Placement Guidance, Mock Interviews & More"}
                </p>
                <Link
                  href={cards?.careerSupport?.href ?? "/career-placement"}
                  className="inline-flex items-center gap-1 text-red-500 text-[11px] font-semibold hover:gap-1.5 transition-all"
                >
                  Know More <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}

