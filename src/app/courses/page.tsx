export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { Search, ArrowRight, Clock } from "lucide-react";
import { getCRMProgrammes } from "@/lib/content";
import ProgramCard from "@/components/shared/ProgramCard";

export const metadata: Metadata = {
  title: "Explore Cybersecurity Programs — All Courses",
  description: "From beginner-friendly cybersecurity foundations to advanced enterprise security training.",
};

const categories = [
  { id: "all", label: "All Programs" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
  { id: "career-track", label: "Career Track" },
  { id: "corporate", label: "Corporate Training" },
];

export default function CoursesPage() {
  const allProgrammes = getCRMProgrammes().filter(p => p.status === "published");
  const careerTrack = allProgrammes.filter(p => p.category === "career-track");
  const specialized = allProgrammes.filter(p => p.category === "specialized");

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="relative bg-[#080b10] py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative site-container">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-300">Explore Programs</span>
          </div>
          <div className="max-w-2xl">
            <span className="text-red-500 text-sm font-bold uppercase tracking-widest mb-4 block">All Programs</span>
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
              Explore Cybersecurity Programs Built For{" "}
              <span className="text-red-500">Every Career Stage</span>
            </h1>
            <p className="text-gray-400 mb-8">
              From beginner-friendly foundations to advanced enterprise training — choose the right program based on your goal.
            </p>
            <div className="flex gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-500 transition-colors">
                Explore Programs <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 border border-gray-700 text-gray-300 font-semibold px-6 py-3 rounded-lg hover:border-red-500 hover:text-red-400 transition-colors">
                Book Free Counseling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Career Track */}
      {careerTrack.length > 0 && (
        <section className="py-16 bg-[#f5f5f5]">
          <div className="site-container">
            <div className="mb-10">
              <span className="text-red-600 text-xs font-bold uppercase tracking-widest mb-2 block">Career Track Programs</span>
              <h2 className="text-2xl lg:text-3xl font-black text-gray-900">
                Launch Your <span className="text-red-600">Cybersecurity Career</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {careerTrack.map(p => <ProgramCard key={p.id} course={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Specialized */}
      {specialized.length > 0 && (
        <section className="py-16 bg-white">
          <div className="site-container">
            <div className="mb-10">
              <span className="text-red-600 text-xs font-bold uppercase tracking-widest mb-2 block">Specialized Skill Programs</span>
              <h2 className="text-2xl lg:text-3xl font-black text-gray-900">
                Upgrade Your Skills. <span className="text-red-600">Go Deeper.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {specialized.map(p => <ProgramCard key={p.id} course={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* All programmes if not categorized */}
      {careerTrack.length === 0 && specialized.length === 0 && allProgrammes.length > 0 && (
        <section className="py-16 bg-[#f5f5f5]">
          <div className="site-container">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {allProgrammes.map(p => <ProgramCard key={p.id} course={p} />)}
            </div>
          </div>
        </section>
      )}

      {allProgrammes.length === 0 && (
        <section className="py-20 bg-[#f5f5f5]">
          <div className="text-center text-gray-400">
            <p className="text-lg font-medium">Programmes coming soon.</p>
            <p className="text-sm mt-2">Check back shortly or contact us for information.</p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-12 bg-[#080b10]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-white mb-3">Not Sure Which Program Is Right For You?</h2>
          <p className="text-gray-400 mb-6">Talk to our counselor and get a personalized cybersecurity learning roadmap.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-500 transition-colors">
            Book Free Counseling <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

