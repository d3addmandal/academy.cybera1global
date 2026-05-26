export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCRMTrainerBySlug, getCRMProgrammeBySlug, getSiteSettings } from "@/lib/content";
import { Award, BookOpen, ArrowLeft, Linkedin, Github, Twitter, ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trainer = getCRMTrainerBySlug(slug);
  if (!trainer || trainer.status !== "published") return {};
  const settings = getSiteSettings();
  return {
    title: `${trainer.name} - ${trainer.designation} | ${settings?.companyName ?? "Cyber A1 Academy"}`,
    description: trainer.bio.slice(0, 160),
  };
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default async function TrainerProfilePage({ params }: Props) {
  const { slug } = await params;
  const trainer = getCRMTrainerBySlug(slug);

  if (!trainer || trainer.status !== "published") notFound();

  // Resolve course details for programmes this trainer teaches
  const courses = (trainer.courses ?? [])
    .map((s) => getCRMProgrammeBySlug(s))
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-white">
      {/* Back nav */}
      <div className="bg-slate-50 border-b border-slate-100">
        <div className="site-container py-3">
          <Link href="/trainers" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Trainers
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#0f0f0f] py-14 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #e00000 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="site-container relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Photo */}
            {trainer.imageUrl ? (
              <img
                src={trainer.imageUrl}
                alt={trainer.name}
                width={140}
                height={140}
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl object-cover border-2 border-red-500/30 flex-shrink-0"
              />
            ) : (
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center border-2 border-red-500/30 flex-shrink-0">
                <span className="text-white text-4xl font-bold">{initials(trainer.name)}</span>
              </div>
            )}

            {/* Info */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">{trainer.name}</h1>
              <p className="text-red-400 text-base sm:text-lg font-medium mb-3">{trainer.designation}</p>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-5">
                <span className="inline-flex items-center gap-1.5 bg-red-900/40 border border-red-700/30 text-red-300 text-sm font-semibold px-3 py-1 rounded-full">
                  <Award className="w-4 h-4" /> {trainer.experience}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-slate-300 text-sm px-3 py-1 rounded-full">
                  {trainer.specialization}
                </span>
              </div>

              {/* Social links */}
              <div className="flex gap-3 justify-center sm:justify-start">
                {trainer.linkedIn && (
                  <a href={trainer.linkedIn} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#0077b5] hover:bg-white/15 transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {trainer.github && (
                  <a href={trainer.github} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/15 transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {trainer.twitter && (
                  <a href={trainer.twitter} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:bg-white/15 transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-12 lg:py-16">
        <div className="site-container">
          <div className="grid lg:grid-cols-[1fr_320px] gap-10 items-start">
            {/* Main content */}
            <div className="space-y-10">
              {/* Bio */}
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 bg-red-600 rounded-full inline-block" />
                  About {trainer.name.split(" ")[0]}
                </h2>
                <p className="text-slate-600 leading-relaxed text-base">{trainer.bio}</p>
              </div>

              {/* Courses this trainer teaches */}
              {courses.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-red-600 rounded-full inline-block" />
                    Programmes Taught
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {courses.map((prog) => prog && (
                      <Link key={prog.id} href={`/courses/${prog.slug}`}
                        className="group flex items-start gap-4 p-4 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl transition-colors">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${prog.color}15` }}>
                          <BookOpen className="w-5 h-5" style={{ color: prog.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-red-700 leading-snug line-clamp-2">
                            {prog.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{prog.duration} · {prog.mode}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-red-400 flex-shrink-0 mt-0.5 ml-auto transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Certifications */}
              {trainer.certifications.length > 0 && (
                <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {trainer.certifications.map((cert) => (
                      <span key={cert} className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                        <Award className="w-3.5 h-3.5 text-red-500" /> {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-6 text-white">
                <p className="text-red-200 text-xs font-semibold uppercase tracking-wider mb-1">Experience</p>
                <p className="text-3xl font-bold mb-1">{trainer.experience}</p>
                <p className="text-red-200 text-sm">in cybersecurity industry</p>
              </div>

              {/* CTA */}
              <div className="bg-slate-900 rounded-2xl p-6 text-white">
                <h3 className="text-base font-bold mb-2">Learn From {trainer.name.split(" ")[0]}</h3>
                <p className="text-slate-400 text-sm mb-4">Book a free counselling session to get started on your cybersecurity journey.</p>
                <Link href="/contact"
                  className="block text-center bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
                  Book Free Counseling
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
