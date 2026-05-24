import { Award, Briefcase, FlaskConical, Shield, Users, Building2, CheckCircle2, BookOpen } from "lucide-react";
import type { TrustStripItem } from "@/types/cms";

const ICON_MAP: Record<string, React.ElementType> = {
  Award, Briefcase, FlaskConical, Shield, Users, Building2, CheckCircle2, BookOpen,
};

const DEFAULT_ITEMS: TrustStripItem[] = [
  { icon: "Award", label: "CEH Certified Trainers" },
  { icon: "Briefcase", label: "Real Industry Projects" },
  { icon: "FlaskConical", label: "Practical Labs" },
  { icon: "Shield", label: "Enterprise Security Exposure" },
  { icon: "Users", label: "Placement Support" },
  { icon: "Building2", label: "Corporate Training Programs" },
  { icon: "BookOpen", label: "20+ Expert Trainers" },
  { icon: "CheckCircle2", label: "1000+ Students Trained" },
];

export default function TrustStrip({ items }: { items?: TrustStripItem[] | null }) {
  const display = (items && items.length > 0) ? items : DEFAULT_ITEMS;

  return (
    <div className="bg-[#0a0d13] border-y border-gray-800/60 py-4 overflow-hidden">
      <div className="flex whitespace-nowrap">
        {[0, 1].map((key) => (
          <div key={key} aria-hidden={key === 1} className="flex items-center gap-8 flex-shrink-0 animate-marquee">
            {display.map(({ icon, label }) => {
              const Icon = ICON_MAP[icon] ?? Shield;
              return (
                <span key={label} className="inline-flex items-center gap-3 text-gray-400 px-4">
                  <span className="w-7 h-7 rounded-lg bg-red-600/15 border border-red-600/20 inline-flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-red-500" style={{ width: 14, height: 14 }} />
                  </span>
                  <span className="text-sm font-medium">{label}</span>
                  <span className="w-1 h-1 rounded-full bg-red-600/60 ml-3" />
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
