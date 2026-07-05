export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ensureFreshData, getCRMTrainers, getSiteSettings } from "@/lib/content";
import { Award, ArrowRight, Linkedin, Github, Twitter } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSiteSettings();
  return {
    title: `Our Trainers | ${settings?.companyName ?? "Cyber A1 Academy"}`,
    description: "Meet our expert trainers - experienced cybersecurity professionals with real-world industry backgrounds in VAPT, SOC operations, cloud security, and application security.",
  };
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default async function TrainersPage() {
  await ensureFreshData();
  const trainers = getCRMTrainers();

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[#0f0f0f] py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #e00000 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="site-container relative text-center">
          <p className="text-xs font-bold text-red-500 uppercase tracking-[0.2em] mb-3">Expert Faculty</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Our Industry-Expert <span className="text-red-500">Trainers</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            Every trainer at Cyber A1 Academy is a practising security professional, not just educators. They bring real field experience into every session.
          </p>
        </div>
      </section>

      {/* Trainers grid */}
      <section className="py-16 bg-slate-50">
        <div className="site-container">
          {trainers.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-lg">No trainers published yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainers.map((trainer) => (
                <article key={trainer.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                  <div className="h-1 w-full bg-gradient-to-r from-red-600 to-red-400" />
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start gap-4 mb-5">
                      {trainer.imageUrl ? (
                        <img
                          src={trainer.imageUrl}
                          alt={trainer.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-xl object-cover border-2 border-red-100 flex-shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center border-2 border-red-100 flex-shrink-0">
                          <span className="text-white text-2xl font-bold">{initials(trainer.name)}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-slate-800">{trainer.name}</h2>
                        <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{trainer.designation}</p>
                        <span className="inline-flex items-center gap-1 mt-2 bg-red-50 text-red-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-red-100">
                          <Award className="w-3 h-3" /> {trainer.experience}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Specialization</p>
                    <p className="text-sm text-slate-600 mb-4">{trainer.specialization}</p>

                    <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">{trainer.bio}</p>

                    {trainer.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {trainer.certifications.map((cert) => (
                          <span key={cert} className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-md">{cert}</span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {trainer.linkedIn && (
                          <a href={trainer.linkedIn} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#0077b5] transition-colors">
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {trainer.github && (
                          <a href={trainer.github} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors">
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {trainer.twitter && (
                          <a href={trainer.twitter} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-sky-500 transition-colors">
                            <Twitter className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <Link href={`/trainers/${trainer.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
                        Full Profile <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-white border-t border-slate-100">
        <div className="site-container text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Want to Learn From These Experts?</h2>
          <p className="text-slate-500 text-sm mb-6">Book a free counselling session to find the right programme for your goals.</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Book Free Counseling <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
