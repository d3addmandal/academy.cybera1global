"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Linkedin, X } from "lucide-react";
import type { Event, Testimonial, BlogPost, EventsSectionConfig, BlogSectionConfig } from "@/types/cms";
import { formatDate } from "@/lib/utils";

interface HiringPartner { name: string; logoUrl: string; }

interface Props {
  events: Event[];
  testimonials: Testimonial[];
  blogs: BlogPost[];
  hiringPartners?: HiringPartner[];
  eventsConfig?: EventsSectionConfig | null;
  blogConfig?: BlogSectionConfig | null;
}

const PARTNER_COLORS = [
  "bg-rose-100 text-rose-700",
  "bg-slate-700 text-white",
  "bg-gray-200 text-gray-700",
  "bg-blue-100 text-blue-700",
  "bg-slate-400 text-white",
  "bg-amber-100 text-amber-700",
];

function GalleryModal({ images, onClose }: { images: string[]; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-900 text-sm">Event Gallery <span className="text-gray-400 font-normal">({images.length} photos)</span></h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((src, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={src}
                  alt={`Event photo ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventGallery({ images }: { images: string[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const slots = [...images, "", "", "", "", ""].slice(0, 5);
  const extraCount = images.length > 5 ? images.length - 5 : 0;

  return (
    <>
      <div
        className="rounded-xl overflow-hidden mb-4"
        style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "6px", height: "224px" }}
      >
        {slots.map((src, i) => {
          const showOverlay = i === 4 && extraCount > 0;
          return (
            <div
              key={i}
              className={`overflow-hidden bg-gray-100 relative ${i === 0 ? "row-span-2 rounded-lg" : "rounded-md"} ${showOverlay ? "cursor-pointer" : ""}`}
              onClick={showOverlay ? () => setModalOpen(true) : undefined}
            >
              {src ? (
                <img src={src} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
              )}
              {showOverlay && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center hover:bg-black/70 transition-colors">
                  <span className="text-white font-black text-2xl">+{extraCount}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modalOpen && <GalleryModal images={images} onClose={() => setModalOpen(false)} />}
    </>
  );
}

export default function CommunitySection({
  events, testimonials, blogs, hiringPartners = [], eventsConfig, blogConfig,
}: Props) {
  const [current, setCurrent] = useState(0);
  const count = Math.max(testimonials.length, 1);
  const prev = () => setCurrent((c) => (c - 1 + count) % count);
  const next = () => setCurrent((c) => (c + 1) % count);
  const t = testimonials[current] ?? null;

  // Events gallery: prefer explicit gallery images, fall back to event images
  // Pass ALL images — EventGallery handles the 5-cap and +N overflow modal itself
  const galleryImages = (eventsConfig?.galleryImages ?? []).filter(Boolean);
  const fallbackImages = events.map((ev) => ev.image).filter(Boolean);
  const displayImages = galleryImages.length ? galleryImages : fallbackImages;

  return (
    <section className="py-8 bg-white">
      <div className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── COL 1: Events & Community ─── */}
          <div>
            <span className="text-red-600 text-[10px] font-bold uppercase tracking-widest mb-1.5 block">
              {eventsConfig?.sectionLabel ?? "Events & Community"}
            </span>
            <h2 className="text-lg font-black text-gray-900 mb-3 leading-snug">
              {eventsConfig?.title ?? "Building A Strong Cybersecurity Community"}
            </h2>

            <EventGallery images={displayImages} />

            <Link
              href={eventsConfig?.ctaLink ?? "/events"}
              className="inline-flex items-center gap-2 border border-red-500 text-red-600 text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200"
            >
              {eventsConfig?.ctaText ?? "Explore Events"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* ── COL 2: Student Success Stories ─── */}
          <div>
            <span className="text-red-600 text-[10px] font-bold uppercase tracking-widest mb-1.5 block">
              Student Success Stories
            </span>
            <h2 className="text-lg font-black text-gray-900 mb-3 leading-snug">
              Hear From Our Learners
            </h2>

            {/* Card with side arrows */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={prev}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-red-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex-1 bg-gray-50 rounded-xl p-4 min-h-[148px]">
                {t ? (
                  <div className="flex gap-3 items-start">
                    {/* Avatar */}
                    <div className="w-[72px] h-[72px] rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-black text-2xl">
                      {t.imageUrl ? (
                        <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      ) : t.name.charAt(0)}
                    </div>
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-[13px] leading-relaxed mb-3 line-clamp-4">
                        {t.quote}
                      </p>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-bold text-gray-900 text-[13px] leading-tight">{t.name}</p>
                          <p className="text-gray-500 text-xs leading-tight">
                            {t.role}{t.company ? ` @ ${t.company}` : ""}
                          </p>
                        </div>
                        {t.linkedIn && t.linkedIn !== "#" && (
                          <a href={t.linkedIn} target="_blank" rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 transition-colors ml-1">
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center pt-8">No testimonials yet.</p>
                )}
              </div>

              <button
                onClick={next}
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-red-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Dot indicators */}
            {testimonials.length > 1 && (
              <div className="flex justify-center gap-1.5 mb-4">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-1.5 rounded-full transition-all ${i === current ? "bg-red-600 w-5" : "bg-gray-300 w-1.5"}`}
                  />
                ))}
              </div>
            )}

          </div>

          {/* ── COL 3: Blog ─── */}
          <div>
            <span className="text-red-600 text-[10px] font-bold uppercase tracking-widest mb-1.5 block">
              {blogConfig?.sectionLabel ?? "Latest From Our Blog"}
            </span>
            <h2 className="text-lg font-black text-gray-900 mb-3 leading-snug">
              {blogConfig?.title ?? "Insights & Resources"}
            </h2>

            <div className="space-y-2 mb-4">
              {blogs.length === 0
                ? <p className="text-gray-400 text-sm">No blog posts yet.</p>
                : blogs.slice(0, 4).map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="flex gap-3 items-start p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-700 to-gray-900">
                      {post.image && (
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-[13px] leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-400 text-xs mt-1">
                        {formatDate(post.publishedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>

            <Link
              href={blogConfig?.ctaLink ?? "/blog"}
              className="inline-flex items-center gap-2 border border-red-500 text-red-600 text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200"
            >
              {blogConfig?.ctaText ?? "Explore All Blogs"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
