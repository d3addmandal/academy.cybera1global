import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProgramCard from "@/components/shared/ProgramCard";
import type { Programme, ProgrammeSectionConfig } from "@/types/cms";

interface Props {
  programmes: Programme[];
  config?: ProgrammeSectionConfig | null;
}

export default function FeaturedPrograms({ programmes, config }: Props) {
  const label    = config?.sectionLabel ?? "Our Programs";
  const title    = config?.title        ?? "Industry-Focused Cybersecurity Programs";
  const subtitle = config?.subtitle     ?? "Designed for students, professionals, and enterprise teams.";
  const ctaText  = config?.ctaText      ?? "View All Programs";
  const ctaLink  = config?.ctaLink      ?? "/courses";

  return (
    <section className="py-8 bg-white">
      <div className="w-[90%] mx-auto">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <span className="text-red-600 text-[10px] font-bold uppercase tracking-widest mb-2 block">
              {label}
            </span>
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight">{title}</h2>
            <p className="text-gray-500 text-sm mt-1.5">{subtitle}</p>
          </div>
          <Link
            href={ctaLink}
            className="inline-flex items-center gap-2 border border-red-500 text-red-600 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200 whitespace-nowrap self-start sm:mt-1"
          >
            {ctaText} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Cards grid — 2 cols mobile, up to 6 cols on large desktop/ultra-wide */}
        {programmes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No programmes published yet.</div>
        ) : (
          <div className="gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {programmes.map((course) => (
              <ProgramCard key={course.id} course={course} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
