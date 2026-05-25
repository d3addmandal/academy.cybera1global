"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Lock, Users, Monitor, Target,
  Terminal, UserCheck, Cloud, Code2, Cpu, ShieldCheck,
  GraduationCap, Award, Briefcase, Map, Shield, Globe, ChevronRight,
} from "lucide-react";
import type { CareerRoadmapSection } from "@/types/cms";

const STAGE_CFG = [
  { gradient: "linear-gradient(135deg,#F5C842 0%,#F5A623 60%,#E8960F 100%)", color: "#F5A623", border: "#F5A623", icon: Lock,    num: "1" },
  { gradient: "linear-gradient(135deg,#F07030 0%,#E85D04 60%,#C44D02 100%)", color: "#E85D04", border: "#E85D04", icon: Users,   num: "2" },
  { gradient: "linear-gradient(135deg,#E52020 0%,#CC0000 60%,#AA0000 100%)", color: "#CC0000", border: "#CC0000", icon: Monitor, num: "3" },
  { gradient: "linear-gradient(135deg,#AA1515 0%,#8B0000 60%,#6B0000 100%)", color: "#8B0000", border: "#8B0000", icon: Target,  num: "4" },
] as const;

const TAB_ICON: Record<string, React.ElementType> = {
  "Ethical Hacking": Terminal, "SOC Analyst": UserCheck, "Cloud Security": Cloud,
  "App Security": Code2, "Red Teaming": Target, "AI Security": Cpu, "GRC & Compliance": ShieldCheck,
};

interface Props { roadmap?: CareerRoadmapSection | null }

export default function CareerRoadmap({ roadmap }: Props) {
  const [activeTrack, setActiveTrack] = useState(0);
  if (!roadmap?.tracks?.length) return null;

  const tracks = roadmap.tracks;
  const stages = tracks[activeTrack]?.stages ?? [];

  return (
    <div className="relative">
      <div className="relative z-10">

        {/* Label */}
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#e00000" }}>
            {roadmap.sectionLabel ?? "Choose Your Path"}
          </span>
          <ChevronRight className="w-3 h-3" style={{ color: "#e00000" }} />
        </div>

        {/* Heading */}
        <h2 className="text-base sm:text-lg lg:text-xl font-black leading-tight mb-0.5">
          <span className="text-gray-900">Cybersecurity </span>
          <span style={{ color: "#e00000" }}>Career</span>
          <span className="text-gray-900"> Roadmap</span>
        </h2>
        <p className="text-gray-500 text-[11px] mb-3">
          Your journey. Your skills. Your <span className="text-red-600 font-semibold italic">future</span> in cybersecurity.
        </p>

        {/* Track tabs */}
        <div className="flex flex-wrap gap-1 mb-3">
          {tracks.map((t, i) => {
            const Icon = TAB_ICON[t.label] ?? Shield;
            const active = activeTrack === i;
            return (
              <button key={t.id} onClick={() => setActiveTrack(i)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-semibold transition-all duration-200 ${
                  active ? "border-transparent text-gray-900 shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"
                }`}
                style={active ? { background: "linear-gradient(135deg,#F5C842,#F5A623)" } : {}}>
                <Icon style={{ width: 10, height: 10 }} className={active ? "text-gray-900" : "text-gray-400"} />
                {t.label}
              </button>
            );
          })}
        </div>

        {stages.length > 0 && (
          <>
            {/* Stage icons */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {stages.map((stage, i) => {
                const cfg = STAGE_CFG[i] ?? STAGE_CFG[3];
                const Icon = cfg.icon;
                return (
                  <div key={stage.level} className="flex flex-col items-center text-center">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center mb-1 shadow-md"
                      style={{ background: cfg.gradient }}>
                      <Icon className="text-white" style={{ width: 16, height: 16 }} />
                    </div>
                    <p className="text-[11px] font-black text-gray-900 leading-tight">{stage.level}</p>
                    <p className="text-[9px] font-bold" style={{ color: cfg.color }}>{stage.duration}</p>
                  </div>
                );
              })}
            </div>

            {/* Timeline */}
            <div className="relative flex items-center h-5 mb-3">
              <div className="absolute inset-x-0 h-[2px] bg-gray-200" />
              <div className="absolute h-[2px]"
                style={{ left: "12.5%", right: "12%", background: "linear-gradient(to right,#F5A623,#E85D04,#CC0000,#8B0000)" }} />
              <div className="absolute"
                style={{ right: "11.5%", top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "3px solid transparent", borderBottom: "3px solid transparent", borderLeft: "6px solid #8B0000" }} />
              <div className="grid grid-cols-4 w-full relative z-10">
                {stages.map((stage, i) => {
                  const cfg = STAGE_CFG[i] ?? STAGE_CFG[3];
                  return (
                    <div key={stage.level} className="flex justify-center">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-black border-2 border-white shadow-sm"
                        style={{ background: cfg.gradient }}>
                        {cfg.num}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3 items-start">
              {stages.map((stage, i) => {
                const cfg = STAGE_CFG[i] ?? STAGE_CFG[3];
                return (
                  <div key={stage.level} className="rounded-lg bg-white"
                    style={{ border: `1.5px solid ${cfg.border}`, boxShadow: `0 2px 10px ${cfg.color}10` }}>

                    {stage.topics?.length > 0 && (
                      <div className="p-2">
                        <div className="flex items-center gap-1 mb-1.5">
                          <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                            style={{ background: `${cfg.color}18` }}>
                            <GraduationCap style={{ width: 9, height: 9, color: cfg.color }} />
                          </div>
                          <span className="text-[10px] font-black" style={{ color: cfg.color }}>Core Skills</span>
                        </div>
                        <ul className="space-y-0.5">
                          {stage.topics.map(t => (
                            <li key={t} className="flex items-start gap-1 text-[9px] text-gray-700 leading-snug">
                              <span className="mt-[3px] flex-shrink-0 w-1 h-1 rounded-full" style={{ background: cfg.color }} />{t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {stage.certifications?.length > 0 && (
                      <>
                        <div className="mx-2 h-px" style={{ background: `${cfg.color}20` }} />
                        <div className="p-2">
                          <div className="flex items-center gap-1 mb-1.5">
                            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                              style={{ background: `${cfg.color}18` }}>
                              <Award style={{ width: 9, height: 9, color: cfg.color }} />
                            </div>
                            <span className="text-[10px] font-black" style={{ color: cfg.color }}>Certifications</span>
                          </div>
                          <ul className="space-y-0.5">
                            {stage.certifications.map(c => (
                              <li key={c} className="flex items-start gap-1 text-[9px] text-gray-700 leading-snug">
                                <span className="mt-[3px] flex-shrink-0 w-1 h-1 rounded-full" style={{ background: cfg.color }} />{c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}

                    {stage.jobs?.length > 0 && (
                      <>
                        <div className="mx-2 h-px" style={{ background: `${cfg.color}20` }} />
                        <div className="p-2">
                          <div className="flex items-center gap-1 mb-1.5">
                            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                              style={{ background: `${cfg.color}18` }}>
                              <Briefcase style={{ width: 9, height: 9, color: cfg.color }} />
                            </div>
                            <span className="text-[10px] font-black" style={{ color: cfg.color }}>Job Roles</span>
                          </div>
                          <ul className="space-y-0.5">
                            {stage.jobs.map(j => (
                              <li key={j} className="flex items-start gap-1 text-[9px] text-gray-700 leading-snug">
                                <span className="mt-[3px] flex-shrink-0 w-1 h-1 rounded-full" style={{ background: cfg.color }} />{j}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}

                    <div className="px-2 pb-2">
                      <Link href={roadmap.ctaLink ?? "/courses"}
                        className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded text-white transition-opacity hover:opacity-85"
                        style={{ background: cfg.gradient }}>
                        View Path <ArrowRight style={{ width: 8, height: 8 }} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Bottom bar */}
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
          <BottomFeature icon={Map} title="Structured Learning Path" sub="Step-by-step curriculum" />
          <BottomFeature icon={Shield} title="Industry Relevant Skills" sub="Stay ahead of the curve" />
          <Link href={roadmap.ctaLink ?? "/courses"}
            className="inline-flex items-center gap-1.5 text-white font-bold text-[11px] px-4 py-2 rounded-lg flex-shrink-0 whitespace-nowrap transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#E52020,#CC0000,#AA0000)" }}>
            {roadmap.ctaText ?? "View Full Roadmap"} <ArrowRight className="w-3 h-3" />
          </Link>
          <BottomFeature icon={Users} title="In-Demand Career Roles" sub="High growth opportunities" right />
          <BottomFeature icon={Globe} title="Global Opportunities" sub="Work anywhere in the world" right />
        </div>

      </div>
    </div>
  );
}

function BottomFeature({ icon: Icon, title, sub, right }: { icon: React.ElementType; title: string; sub: string; right?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 flex-1 min-w-[100px] ${right ? "lg:justify-end" : ""}`}>
      <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon className="text-gray-400" style={{ width: 13, height: 13 }} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-800 leading-tight">{title}</p>
        <p className="text-[9px] text-gray-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
