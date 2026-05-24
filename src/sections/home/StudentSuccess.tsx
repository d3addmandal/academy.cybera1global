// This section is no longer used — replaced by CommunitySection.tsx
// Kept for backwards compatibility; will not type-error.
"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star, Linkedin } from "lucide-react";
import type { Testimonial } from "@/types/cms";
const testimonials: Testimonial[] = [];
const partnerCompanies: { name: string; logoUrl: string }[] = [];

export default function StudentSuccess() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const t = testimonials[current];

  return (
    <section className="py-20 bg-[#f5f5f5]">
      <div className="site-container">
        <div className="text-center mb-12">
          <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">
            Student Success Stories
          </span>
          <h2 className="text-3xl lg:text-4xl font-black text-gray-900">
            Hear From <span className="text-red-600">Our Learners</span>
          </h2>
        </div>

        {/* Testimonial slider */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm relative">
            <Quote className="w-10 h-10 text-red-100 absolute top-6 right-6" />

            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              ))}
            </div>

            <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 font-medium">
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-black text-xl">
                  {t.imageUrl ? (
                    <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    t.name.charAt(0)
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{t.name}</p>
                  <p className="text-gray-500 text-sm">{t.role}</p>
                  <p className="text-red-600 text-sm font-semibold">{t.company}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs bg-red-50 text-red-600 font-semibold px-3 py-1 rounded-full border border-red-100">
                  {t.programme}
                </span>
                {t.linkedIn && t.linkedIn !== "#" && (
                  <a href={t.linkedIn} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center justify-end gap-1 text-xs text-blue-500 hover:text-blue-600">
                    <Linkedin className="w-3 h-3" /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-red-600 w-6" : "bg-gray-300"}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hiring partners */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm font-medium mb-6 uppercase tracking-widest">
            Our Students Are Placed At
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {partnerCompanies.slice(0, 5).map((company) => (
              <div
                key={company.name}
                className="h-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
              >
                <span className="text-gray-500 font-bold text-sm tracking-wide uppercase">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

