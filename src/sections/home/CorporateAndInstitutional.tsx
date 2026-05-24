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
    <div className="relative overflow-hidden min-h-[30vh] flex items-stretch">
      {/* Background image — right portion only */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      {/* Gradient overlay: solid dark on left, fades to semi-transparent on right */}
      <div
        className="absolute inset-0"
        style={{
          background: bgImage
            ? "linear-gradient(to right, #050505 42%, rgba(5,5,5,0.82) 62%, rgba(5,5,5,0.45) 100%)"
            : "#050505",
        }}
      />

      {/* Content */}
      <div className="relative z-10 py-6 px-8 flex flex-col justify-center w-full max-w-[62%]">
        <span className="text-red-500 text-[10px] font-bold uppercase tracking-[0.18em] mb-2 block">
          {sectionLabel}
        </span>

        <h2 className="text-xl lg:text-2xl font-black text-white leading-tight mb-4">
          {highlight ? (
            <>
              {title}
              <br />
              <span className="text-red-500">{highlight}</span>
            </>
          ) : title}
        </h2>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-5">
          {services.map(({ icon, label }) => {
            const Icon = ICON_MAP[icon] ?? Shield;
            return (
              <div key={label} className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="text-white" style={{ width: 13, height: 13 }} />
                </div>
                <span className="text-gray-200 text-xs font-medium leading-snug">{label}</span>
              </div>
            );
          })}
        </div>

        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-6 py-2.5 rounded transition-colors self-start"
        >
          {ctaText} <ArrowRight className="w-4 h-4" />
        </Link>
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
