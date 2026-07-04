"use client";

/**
 * Plain <img> with an onError handler that hides the element on load failure.
 * Event handlers can't be passed to DOM elements from a Server Component, so
 * this exists as the one small Client Component boundary for pages that are
 * otherwise Server Components (e.g. career-placement/page.tsx).
 */
export default function ImageWithFallback({
  src, alt, className, loading = "lazy",
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
    />
  );
}
