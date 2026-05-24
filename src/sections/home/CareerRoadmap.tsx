"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock, Users, Monitor, Target } from "lucide-react";
import type { CareerRoadmapSection } from "@/types/cms";

const STAGE_ICONS = [Lock, Users, Monitor, Target];
const STAGE_BG = ["bg-gray-900", "bg-red-700", "bg-red-800", "bg-red-700"];

interface Props {
  roadmap?: CareerRoadmapSection | null;
}

export default function CareerRoadmap({ roadmap }: Props) {
  const [activeTrack, setActiveTrack] = useState(0);
  if (!roadmap || !roadmap.tracks?.length) return null;

  const tracks = roadmap.tracks;
  const active = tracks[activeTrack];

  return (
    <div>
      {/* Header */}
      <span className="text-red-600 text-[10px] font-bold uppercase tracking-widest mb-2 block">
        {roadmap.sectionLabel}
      </span>
      <h2 className="text-xl lg:text-2xl font-black text-gray-900 mb-4 leading-snug">
        {roadmap.title}
      </h2>

      {/* Track tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {tracks.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setActiveTrack(i)}
            className={`px-3 py-1 rounded border text-xs font-medium transition-all ${
              activeTrack === i
                ? "bg-red-600 border-red-600 text-white"
                : "bg-white border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active && active.stages?.length > 0 && (
        <>
          {/* Stage header: icon + level + duration */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            {active.stages.map((stage, i) => {
              const Icon = STAGE_ICONS[i] ?? Target;
              const bg = STAGE_BG[i] ?? "bg-red-700";
              return (
                <div key={stage.level} className="flex flex-col items-start gap-1">
                  <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
                    <Icon className="text-white" style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 leading-tight">{stage.level}</p>
                    <p className="text-xs text-gray-500">{stage.duration}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline */}
          <div className="relative h-5 flex items-center mb-4">
            <div className="absolute left-5 right-5 h-px bg-gray-300" />
            <div className="absolute h-px bg-red-500" style={{ left: "10%", right: "1.25rem" }} />
            <ArrowRight className="absolute text-red-500" style={{ right: "0.1rem", top: "50%", transform: "translateY(-50%)", width: 16, height: 16 }} />
            <div className="grid grid-cols-4 w-full relative z-10">
              {active.stages.map((stage, i) => (
                <div key={stage.level} className="flex justify-start pl-5">
                  <div className={`w-3 h-3 rounded-full border-2 ${i === 0 ? "bg-gray-900 border-gray-900" : "bg-white border-red-500"}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Stage detail cards */}
          <div className="grid grid-cols-4 gap-3">
            {active.stages.map((stage) => (
              <div key={stage.level} className="border border-gray-200 rounded-lg p-3 bg-white">
                <ul className="space-y-0.5 mb-2.5">
                  {stage.topics.map((t) => (
                    <li key={t} className="text-[11px] text-gray-700 flex items-start gap-1 leading-snug">
                      <span className="text-gray-400 flex-shrink-0 mt-px">•</span>{t}
                    </li>
                  ))}
                </ul>
                {stage.certifications?.length > 0 && (
                  <div className="mb-2.5">
                    <p className="text-[11px] font-bold text-gray-800 mb-1">Certifications</p>
                    <ul className="space-y-0.5">
                      {stage.certifications.map((c) => (
                        <li key={c} className="text-[11px] text-gray-600 flex items-start gap-1 leading-snug">
                          <span className="text-gray-400 flex-shrink-0 mt-px">•</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {stage.jobs?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-gray-800 mb-1">Job Roles</p>
                    <ul className="space-y-0.5">
                      {stage.jobs.map((j) => (
                        <li key={j} className="text-[11px] text-gray-600 flex items-start gap-1 leading-snug">
                          <span className="text-gray-400 flex-shrink-0 mt-px">•</span>{j}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* CTA */}
      <div className="flex justify-center mt-6">
        <Link
          href={roadmap.ctaLink ?? "/courses"}
          className="inline-flex items-center gap-2 border border-red-500 text-red-600 font-semibold text-sm px-6 py-2 rounded hover:bg-red-600 hover:text-white transition-all duration-200"
        >
          {roadmap.ctaText ?? "View Full Roadmap"} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
