import Link from "next/link";
import { ArrowRight, Shield, Terminal, Activity, Brain, Globe, Cloud, Lock, Code2, Target, FileCheck, Cpu, Wifi, Bug, Award } from "lucide-react";
import type { Programme as Course } from "@/types/cms";

interface ProgramCardProps {
  course: Course;
  variant?: "default" | "compact" | "featured";
}

const ICON_MAP: Record<string, React.ElementType> = {
  Shield, Terminal, Activity, Brain, Globe, Cloud, Lock, Code2,
  Target, FileCheck, Cpu, Wifi, Bug, Award,
};

function getCourseIcon(course: Course): React.ElementType {
  if (course.icon && ICON_MAP[course.icon]) return ICON_MAP[course.icon];
  const text = `${course.shortTitle} ${course.title}`.toLowerCase();
  if (/cloud/.test(text)) return Cloud;
  if (/web|owasp|application/.test(text)) return Globe;
  if (/ai|artificial|machine|ml/.test(text)) return Brain;
  if (/soc|siem|threat|detection/.test(text)) return Activity;
  if (/red.?team|penetration|vapt/.test(text)) return Target;
  if (/grc|compliance|governance/.test(text)) return FileCheck;
  if (/malware|forensic/.test(text)) return Bug;
  if (/network|wireless/.test(text)) return Wifi;
  if (/code|secure.?coding|devsec/.test(text)) return Code2;
  if (/iot|embedded/.test(text)) return Cpu;
  if (/ethical|hacking|cceh/.test(text)) return Terminal;
  if (/ccse|expert|comprehensive/.test(text)) return Lock;
  return Award;
}

export default function ProgramCard({ course, variant = "default" }: ProgramCardProps) {
  const Icon = getCourseIcon(course);

  if (variant === "compact") {
    return (
      <div
        className="group relative rounded-xl overflow-hidden flex flex-col"
        style={{
          backgroundImage: course.image ? `url(${course.image})` : undefined,
          backgroundColor: "#080b14",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "180px",
        }}
      >
        <div className="absolute inset-0 bg-[#06080f]/65" />
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/30 via-transparent to-[#06080f]/90" />
        <div className="relative z-10 flex flex-col flex-1 p-4">
          <Icon className="text-red-500 mb-3" style={{ width: 28, height: 28, strokeWidth: 1.4 }} />
          <p className="text-white font-bold text-sm leading-snug mb-auto line-clamp-2">{course.shortTitle}</p>
          <div className="border-t border-white/10 mt-3 pt-3 flex items-center justify-between">
            <span className="text-gray-400 text-xs">{course.duration}</span>
            <Link href={`/courses/${course.slug}`} className="text-white text-xs font-semibold flex items-center gap-1 hover:text-red-400 transition-colors">
              Learn More <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative rounded-2xl overflow-hidden flex flex-col hover:-translate-y-0.5 transition-transform duration-300"
      style={{
        backgroundImage: course.image ? `url(${course.image})` : undefined,
        backgroundColor: "#080b14",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "300px",
      }}
    >
      <div className="absolute inset-0 bg-[#06080f]/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-red-900/40 via-[#06080f]/60 to-[#06080f]/92" />
      <div className="absolute top-0 left-0 w-44 h-44 bg-red-800/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col flex-1 p-4">

        {/* Icon */}
        <div className="mb-3">
          <Icon
            className="text-red-500"
            style={{ width: 36, height: 36, strokeWidth: 1.25 }}
          />
        </div>

        {/* Title */}
        <h3 className="text-white font-black text-base leading-snug mb-3">
          {course.shortTitle}
        </h3>

        {/* Divider */}
        <div className="border-t border-white/10 mb-3" />

        {/* Duration | Level — single line, small text, no wrap */}
        <div className="flex items-center gap-2 text-xs text-gray-300 mb-3 whitespace-nowrap overflow-hidden">
          <span className="shrink-0">{course.duration}</span>
          <span className="w-px h-3 bg-red-500 shrink-0" />
          <span className="truncate">{course.level}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mb-3" />

        {/* Topics bullet list */}
        <ul className="space-y-1.5 flex-1">
          {course.topics.slice(0, 3).map((t) => (
            <li key={t} className="flex items-start gap-1.5 text-gray-300 text-xs leading-snug">
              <span className="text-gray-500 shrink-0 mt-px">•</span>
              {t}
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div className="border-t border-white/10 mt-3 mb-3" />

        {/* CTA */}
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-1.5 text-white font-semibold text-xs hover:text-red-400 transition-colors group/link"
        >
          Learn More
          <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>

      </div>
    </div>
  );
}
