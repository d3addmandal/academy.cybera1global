import Link from "next/link";
import {
  ArrowRight, Shield, Target, Code, Cloud, Eye, CheckCircle2,
  Users, Zap, BookOpen, Briefcase, GraduationCap, Link2, Heart, BookMarked,
} from "lucide-react";
import type { CorporateSection, InstitutionalSection } from "@/types/cms";

const ICON_MAP: Record<string, React.ElementType> = {
  Shield, Target, Code, Cloud, Eye, CheckCircle2, Users, Zap,
  BookOpen, Briefcase, GraduationCap, Link2, Heart, BookMarked,
};

const DEFAULT_CORP_SERVICES = [
  { icon: "Eye", label: "Security Awareness" }, { icon: "Target", label: "SOC Awareness" },
  { icon: "Shield", label: "Phishing Simulation" }, { icon: "CheckCircle2", label: "Compliance Awareness" },
  { icon: "Code", label: "Secure Coding" }, { icon: "Zap", label: "Red Team Awareness" },
  { icon: "Cloud", label: "Cloud Security Workshops" }, { icon: "Users", label: "Custom Training Programs" },
];
const DEFAULT_INST_SERVICES = [
  { icon: "BookOpen", label: "Workshops & Seminars" }, { icon: "GraduationCap", label: "Faculty Development" },
  { icon: "Users", label: "Cybersecurity Clubs" }, { icon: "Zap", label: "Bootcamps & Hackathons" },
  { icon: "Briefcase", label: "Internship Collaboration" }, { icon: "Link2", label: "Industry Connect" },
  { icon: "Heart", label: "Placement Support" }, { icon: "BookMarked", label: "Curriculum Support" },
];

interface CardProps {
  sectionLabel: string;
  title: string;
  highlight?: string;
  services: { icon: string; label: string }[];
  ctaText: string;
  ctaHref: string;
  bgImage?: string;
}

function TrainingCard({ sectionLabel, title, highlight, services, ctaText, ctaHref, bgImage }: CardProps) {
  return (
    /* Gradient-border wrapper — creates the glowing neon edge */
    <div
      className="transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01]"
      style={{
        borderRadius: "18px",
        padding: "2px",
        background: "linear-gradient(135deg, #6b6b6b 0%, #2a2a2a 35%, #4a4a4a 60%, #1a1a1a 100%)",
        boxShadow:
          "0 0 6px rgba(180,180,180,0.12), 0 0 18px rgba(80,80,80,0.10), 0 20px 50px rgba(0,0,0,0.55)",
      }}
    >
      {/* Inner metallic card */}
      <div
        className="relative overflow-hidden flex items-stretch min-h-[21vh]"
        style={{
          borderRadius: "16px",
          background: "linear-gradient(160deg, #2c2c3e 0%, #3a3b52 18%, #22233a 40%, #32334c 62%, #1e1f34 100%)",
        }}
      >
        {/* Metallic sheen — diagonal highlight strip */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: 0,
            background: "linear-gradient(115deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 30%, transparent 55%)",
          }}
        />

        {/* Top-edge metallic reflection */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(to right, rgba(200,200,200,0.5), rgba(120,120,120,0.3), rgba(255,255,255,0.12) 60%, transparent)" }}
        />

        {/* Background image */}
        {bgImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-50"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        )}

        {/* Overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background: bgImage
              ? "linear-gradient(to right, rgba(30,31,52,0.92) 28%, rgba(30,31,52,0.60) 58%, rgba(30,31,52,0.10) 100%)"
              : "transparent",
          }}
        />

        {/* Content */}
        <div className="relative z-10 py-5 px-6 sm:px-8 flex flex-col justify-center w-full max-w-full lg:max-w-[65%]">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5 block"
            style={{ color: "#e00000" }}
          >
            {sectionLabel}
          </span>

          <h2 className="text-lg lg:text-xl font-black text-white leading-tight mb-3">
            {highlight ? (
              <>
                {title}
                <br />
                <span style={{ color: "#e00000" }}>{highlight}</span>
              </>
            ) : title}
          </h2>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
            {services.map(({ icon, label }) => {
              const Icon = ICON_MAP[icon] ?? Shield;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #cc3300, #880000)",
                      boxShadow: "0 0 6px rgba(200,50,0,0.35)",
                    }}
                  >
                    <Icon className="text-white" style={{ width: 11, height: 11 }} />
                  </div>
                  <span className="text-gray-200 text-[11px] font-medium leading-snug">{label}</span>
                </div>
              );
            })}
          </div>

          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 text-white font-bold text-xs px-5 py-2 rounded-lg transition-all self-start hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #e63000, #cc0000)",
              boxShadow: "0 0 8px rgba(220,60,0,0.30), 0 3px 8px rgba(0,0,0,0.25)",
            }}
          >
            {ctaText} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

interface Props {
  corporate?: CorporateSection | null;
  institutional?: InstitutionalSection | null;
}

export default function CorporateAndInstitutional({ corporate, institutional }: Props) {
  const corpServices = (corporate?.services && corporate.services.length > 0) ? corporate.services : DEFAULT_CORP_SERVICES;
  const instServices = (institutional?.services && institutional.services.length > 0) ? institutional.services : DEFAULT_INST_SERVICES;

  return (
    <section className="w-full px-[2.5%] lg:w-[95%] lg:px-0 lg:mx-auto">
      <div className="grid lg:grid-cols-2 gap-4 py-8">
        <TrainingCard
          sectionLabel={corporate?.sectionLabel ?? "Corporate Training Solutions"}
          title={corporate?.title ?? "Empower Your Team With"}
          highlight={corporate?.highlight ?? "Cybersecurity Skills"}
          services={corpServices}
          ctaText={corporate?.ctaText ?? "Train Your Team"}
          ctaHref={corporate?.ctaLink ?? "/corporate-training"}
          bgImage={corporate?.image || undefined}
        />
        <TrainingCard
          sectionLabel={institutional?.sectionLabel ?? "Institutional Collaboration"}
          title={institutional?.title ?? "Partner With"}
          highlight={institutional?.highlight ?? "Cyber A1 Academy"}
          services={instServices}
          ctaText={institutional?.ctaText ?? "Partner With Us"}
          ctaHref={institutional?.ctaLink ?? "/institutions"}
          bgImage={institutional?.image || undefined}
        />
      </div>
    </section>
  );
}
