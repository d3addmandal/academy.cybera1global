"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Linkedin, Github } from "lucide-react";
import type { Trainer } from "@/types/cms";

interface Props {
  trainers: Trainer[];
}

function inits(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function TrainerCard({ trainer }: { trainer: Trainer }) {
  const badges = trainer.certBadges && trainer.certBadges.length > 0
    ? trainer.certBadges
    : trainer.certifications.map((c) => ({ name: c, logoUrl: "" }));

  const expertiseList = trainer.expertise && trainer.expertise.length > 0
    ? trainer.expertise
    : trainer.certifications.slice(0, 4);

  const hasLinkedIn = trainer.linkedIn && trainer.linkedIn !== "#" && trainer.linkedIn !== "";
  const hasGithub   = trainer.github   && trainer.github   !== "#" && trainer.github   !== "";

  return (
    <div className="flex flex-col sm:flex-row bg-[#0c0d15] border border-white/[0.06] rounded-xl overflow-hidden sm:h-[215px]">

      {/* ── Col 1: Photo ── */}
      <div className="w-full h-40 sm:h-auto sm:w-[155px] sm:flex-shrink-0 relative bg-[#090a11]">
        {trainer.imageUrl ? (
          <img
            src={trainer.imageUrl}
            alt={trainer.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#1a1c28] to-[#0c0d15]">
            <span className="text-white/20 text-5xl font-black select-none">{inits(trainer.name)}</span>
          </div>
        )}
        {/* right-edge fade blending photo into card (desktop row layout only) */}
        <div className="hidden sm:block absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#0c0d15] to-transparent" />
      </div>

      {/* ── Col 2: Name + Certifications ── */}
      <div className="flex-1 min-w-0 px-5 py-4 flex flex-col border-b sm:border-b-0 sm:border-r border-white/[0.05] relative">
        {/* Social icons */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {hasGithub && (
            <a href={trainer.github} target="_blank" rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors">
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
          {hasLinkedIn && (
            <a href={trainer.linkedIn} target="_blank" rel="noopener noreferrer"
              className="text-[#0a66c2] hover:opacity-75 transition-opacity">
              <Linkedin className="w-4 h-4 fill-[#0a66c2]" />
            </a>
          )}
        </div>

        {/* Identity */}
        <h3 className="text-white font-bold text-[15px] leading-tight pr-14 truncate">{trainer.name}</h3>
        <p className="text-gray-400 text-[12px] mt-1 leading-snug line-clamp-1">{trainer.designation}</p>
        <p className="text-gray-500 text-[11px] mt-0.5">{trainer.experience} Experience</p>

        {/* Certifications */}
        <div className="mt-4 flex-1">
          <p className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.14em] mb-2.5">Certifications</p>
          <div className="flex flex-wrap items-center gap-3">
            {badges.slice(0, 5).map((badge) =>
              badge.logoUrl ? (
                <img
                  key={badge.name}
                  src={badge.logoUrl}
                  alt={badge.name}
                  title={badge.name}
                  loading="lazy"
                  className="h-8 w-auto max-w-[64px] object-contain flex-shrink-0"
                />
              ) : (
                <span
                  key={badge.name}
                  className="text-[9px] font-bold text-gray-300 bg-white/[0.06] border border-white/[0.08] px-2 py-1 rounded leading-none flex-shrink-0"
                >
                  {badge.name}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Col 3: Expertise ── */}
      <div className="w-full sm:w-[170px] sm:flex-shrink-0 px-4 py-4 sm:overflow-hidden flex flex-col">
        <p className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.14em] mb-2.5">Expertise</p>
        <ul className="space-y-1.5">
          {expertiseList.slice(0, 5).map((item) => (
            <li key={item} className="flex items-start gap-2 text-gray-300 text-[11px] leading-snug">
              <span className="text-gray-600 mt-[3px] flex-shrink-0 text-[10px]">•</span>
              <span className="sm:line-clamp-2">{item}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}

export default function TrainersSection({ trainers }: Props) {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = trainers.length;

  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % count);
    }, 4000);
  }, [count]);

  useEffect(() => {
    if (count < 2) return;
    startAutoPlay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startAutoPlay, count]);

  const go = useCallback((dir: 1 | -1) => {
    setCurrent((c) => (c + dir + count) % count);
    startAutoPlay();
  }, [count, startAutoPlay]);

  if (!count) return null;

  // Desktop shows 2 cards; on single trainer just show 1
  const showTwo = count > 1;
  const cardA = trainers[current];
  const cardB = showTwo ? trainers[(current + 1) % count] : null;

  return (
    <section className="bg-[#07080e] py-14 overflow-hidden">
      <div className="w-[95%] mx-auto">
        <div className="flex items-stretch gap-5 lg:gap-7">

          {/* ── Left panel (desktop) ── */}
          <div className="hidden lg:flex flex-col justify-between flex-shrink-0 w-[168px] py-1">
            <div>
              <span className="text-red-500 text-[10px] font-bold uppercase tracking-[0.18em] block mb-3">
                Our Trainers
              </span>
              <h2 className="text-white font-black text-[22px] leading-[1.25]">
                Learn From<br />Industry<br />Experts
              </h2>
            </div>
            <button
              onClick={() => go(-1)}
              className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:border-red-500 hover:text-red-400 transition-colors mt-6"
              aria-label="Previous trainer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* ── Mobile header ── */}
          <div className="lg:hidden w-full mb-4">
            <span className="text-red-500 text-[10px] font-bold uppercase tracking-[0.18em] block mb-1">Our Trainers</span>
            <h2 className="text-white font-black text-xl">Learn From Industry Experts</h2>
          </div>

          {/* ── Cards area ── */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
            <TrainerCard key={`a-${current}`} trainer={cardA} />
            {cardB && (
              <div className="hidden lg:block">
                <TrainerCard key={`b-${current}`} trainer={cardB} />
              </div>
            )}
          </div>

          {/* ── Right arrow (desktop) ── */}
          <div className="hidden lg:flex items-center flex-shrink-0">
            <button
              onClick={() => go(1)}
              className="w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:border-red-500 hover:text-red-400 transition-colors"
              aria-label="Next trainer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Dots + mobile arrows ── */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {/* Mobile prev */}
          <button
            onClick={() => go(-1)}
            className="lg:hidden w-7 h-7 rounded-full border border-gray-700 flex items-center justify-center text-gray-400"
            aria-label="Previous"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {trainers.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); startAutoPlay(); }}
              aria-label={`Go to trainer ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-5 h-2 bg-red-500"
                  : "w-2 h-2 bg-gray-700 hover:bg-gray-500"
              }`}
            />
          ))}

          {/* Mobile next */}
          <button
            onClick={() => go(1)}
            className="lg:hidden w-7 h-7 rounded-full border border-gray-700 flex items-center justify-center text-gray-400"
            aria-label="Next"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
