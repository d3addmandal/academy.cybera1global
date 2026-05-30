import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import type { CTASection } from "@/types/cms";

interface Props {
  cta?: CTASection | null;
  companyName?: string | null;
  phone?: string | null;
}

export default function FinalCTA({ cta, phone }: Props) {
  const eyebrow  = cta?.eyebrow       ?? "READY TO START YOUR JOURNEY?";
  const headline = cta?.headline      ?? "Start Your Cybersecurity Journey With Real Industry-Focused Training";
  const subtext  = cta?.subtext       ?? "Practical Learning | Career Guidance | Industry Exposure | Placement Support";
  const primary  = cta?.primaryButton ?? { text: "Book Free Counseling", href: "/contact" };
  const bgImage  = cta?.bgImage ?? "";
  const callNumber = phone ?? "";
  const telHref = `tel:${callNumber.replace(/\s/g, "")}`;

  return (
    <section className="py-4 bg-white">
      <div className="w-full px-[2%]">
        <div
          className="relative overflow-hidden rounded-2xl py-5 px-5 sm:px-8 lg:px-12"
          style={{
            background: bgImage
              ? `url(${bgImage}) center/cover no-repeat`
              : "linear-gradient(120deg, #0d0000 0%, #2a0404 40%, #1a0303 70%, #0d0000 100%)",
          }}
        >
          {bgImage && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0000]/95 via-[#1a0303]/85 to-[#0d0000]/70 pointer-events-none" />
          )}

          {/* Radial glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[180px] rounded-full blur-[80px]"
              style={{ background: "radial-gradient(ellipse, rgba(180,0,0,0.25) 0%, transparent 70%)" }}
            />
          </div>

          {/* Left chevrons */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-1 pointer-events-none select-none hidden md:flex">
            {[0.6, 0.32, 0.15].map((opacity, i) => (
              <div
                key={i}
                style={{
                  width: 0, height: 0,
                  borderTop:    `${20 - i * 3}px solid transparent`,
                  borderBottom: `${20 - i * 3}px solid transparent`,
                  borderLeft:   `${30 - i * 4}px solid rgba(180,0,0,${opacity})`,
                }}
              />
            ))}
          </div>

          {/* Content grid */}
          <div className="relative z-10 grid lg:grid-cols-[1fr_auto_auto] gap-4 lg:gap-10 items-center">

            {/* Left: text */}
            <div>
              <p className="text-red-400 text-[10px] font-black uppercase tracking-[0.22em] mb-1.5">
                {eyebrow}
              </p>
              <h2 className="text-white font-black text-lg sm:text-xl lg:text-2xl leading-snug mb-2">
                {headline}
              </h2>
              <p className="text-gray-400 text-xs leading-relaxed">
                {subtext.split("|").map((part, i, arr) => (
                  <span key={i}>
                    <span className="text-gray-300">{part.trim()}</span>
                    {i < arr.length - 1 && <span className="text-red-700 mx-1.5">|</span>}
                  </span>
                ))}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Link
                href={primary.href}
                className="inline-flex items-center justify-center gap-2 bg-red-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-red-500 hover:shadow-[0_6px_20px_rgba(200,0,0,0.45)] transition-all text-sm whitespace-nowrap"
              >
                {primary.text} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href={telHref}
                className="inline-flex items-center justify-center gap-2 border border-gray-500 text-gray-200 font-semibold px-6 py-2 rounded-lg hover:border-red-500 hover:text-red-400 transition-all text-sm whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5" /> {callNumber}
              </a>
            </div>

            {/* Right: shield graphic */}
            <div className="hidden lg:flex items-center justify-center relative w-28 h-28 flex-shrink-0">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-70"
                style={{ background: "radial-gradient(circle, rgba(200,0,0,0.55) 0%, transparent 65%)" }}
              />
              <div className="relative flex items-center justify-center w-28 h-28">
                <svg viewBox="0 0 100 115" className="absolute w-28 h-28 opacity-20" fill="none">
                  <path d="M50 5 L90 20 L90 55 C90 80 70 100 50 110 C30 100 10 80 10 55 L10 20 Z" fill="#cc0000" />
                </svg>
                <svg viewBox="0 0 100 115" className="absolute w-20 h-20 opacity-40" fill="none">
                  <path d="M50 5 L90 20 L90 55 C90 80 70 100 50 110 C30 100 10 80 10 55 L10 20 Z" fill="#cc0000" />
                </svg>
                <svg viewBox="0 0 100 115" className="relative w-16 h-16 drop-shadow-[0_0_18px_rgba(200,0,0,0.9)]" fill="none">
                  <path d="M50 5 L90 20 L90 55 C90 80 70 100 50 110 C30 100 10 80 10 55 L10 20 Z" fill="#cc0000" />
                  <circle cx="50" cy="50" r="9" fill="#7a0000" />
                  <rect x="46" y="55" width="8" height="12" rx="2" fill="#7a0000" />
                </svg>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
