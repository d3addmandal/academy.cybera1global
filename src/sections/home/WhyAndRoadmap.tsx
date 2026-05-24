import {
  Briefcase, FlaskConical, TrendingUp, Users, Building2,
  CheckCircle2, Shield,
} from "lucide-react";
import type { WhySection } from "@/types/cms";

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase, FlaskConical, TrendingUp, Users, Building2, CheckCircle2, Shield,
};

interface Props {
  why?: WhySection | null;
}

export default function WhySection({ why }: Props) {
  if (!why) return null;

  const features = why.features ?? [];

  return (
    <div>
      <span className="text-red-600 text-[10px] font-bold uppercase tracking-widest mb-2 block">
        {why.sectionLabel}
      </span>
      <h2 className="text-xl lg:text-2xl font-black text-gray-900 mb-5 leading-snug">
        {why.title}
      </h2>

      <div className="space-y-4">
        {features.map((f) => {
          const Icon = ICON_MAP[f.icon] ?? Shield;
          return (
            <div key={f.id} className="flex gap-3.5 items-start">
              <div className="w-11 h-11 rounded-xl bg-red-900 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon className="text-white" style={{ width: 20, height: 20, strokeWidth: 1.6 }} />
              </div>
              <div>
                <p className="font-bold text-red-700 text-[13px] leading-snug mb-0.5">{f.title}</p>
                <p className="text-gray-500 text-[12px] leading-relaxed">{f.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
