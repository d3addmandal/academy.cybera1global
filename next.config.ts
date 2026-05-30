import type { NextConfig } from "next";

// Content-Security-Policy — allows Next.js inline hydration scripts while
// blocking injection of third-party scripts, objects, and iframes.
const CSP = [
  "default-src 'self'",
  // Next.js requires unsafe-inline for its inline hydration scripts
  "script-src 'self' 'unsafe-inline'",
  // Tailwind + Next.js inject inline styles
  "style-src 'self' 'unsafe-inline'",
  // Images: self, data URIs, and Vercel Blob CDN
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.blob.vercel-storage.com",
  // Fonts: only self (no Google Fonts CDN in use)
  "font-src 'self'",
  // XHR/fetch: self + Blob CDN (for uploads/downloads)
  "connect-src 'self' https://*.public.blob.vercel-storage.com https://*.blob.vercel-storage.com",
  // No plugins/objects allowed
  "object-src 'none'",
  // No embedding in iframes (stronger than X-Frame-Options)
  "frame-ancestors 'none'",
  // Disallow <base> tag hijacking
  "base-uri 'self'",
  // Only allow form submissions to self
  "form-action 'self'",
  // Upgrade insecure requests (HTTP → HTTPS)
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  // Remove the "X-Powered-By: Next.js" header — reduces fingerprinting surface
  poweredByHeader: false,

  reactStrictMode: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cybera1academy.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.blob.vercel-storage.com" },
    ],
    unoptimized: true,
  },

  allowedDevOrigins: [
    "192.168.56.1",
    "192.168.1.0/24",
    "10.0.0.0/8",
    "172.16.0.0/12",
  ],

  async headers() {
    return [
      {
        // ── Admin web app ────────────────────────────────────────────────────
        source: "/webapplication/:path*",
        headers: [
          { key: "X-Robots-Tag",                value: "noindex, nofollow, noarchive, nosnippet" },
          { key: "X-Frame-Options",              value: "DENY" },
          { key: "X-Content-Type-Options",       value: "nosniff" },
          { key: "Referrer-Policy",              value: "no-referrer" },
          { key: "Cache-Control",                value: "no-store, no-cache, must-revalidate, private" },
          { key: "Permissions-Policy",           value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()" },
          { key: "Cross-Origin-Opener-Policy",   value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Content-Security-Policy",      value: CSP },
          // HSTS: 1 year, include subdomains
          { key: "Strict-Transport-Security",    value: "max-age=31536000; includeSubDomains; preload" },
        ],
      },
      {
        // ── Admin API ────────────────────────────────────────────────────────
        source: "/api/admin/:path*",
        headers: [
          { key: "Cache-Control",          value: "no-store, private" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Robots-Tag",           value: "noindex, nofollow" },
          // Prevent admin API responses from being embedded cross-origin
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
      {
        // ── Public API ───────────────────────────────────────────────────────
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control",          value: "no-store, private" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Robots-Tag",           value: "noindex, nofollow" },
        ],
      },
      {
        // ── Public site ──────────────────────────────────────────────────────
        source: "/((?!webapplication|api).*)",
        headers: [
          { key: "X-Content-Type-Options",       value: "nosniff" },
          { key: "X-Frame-Options",              value: "SAMEORIGIN" },
          { key: "Referrer-Policy",              value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",           value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          { key: "Content-Security-Policy",      value: CSP },
          { key: "Strict-Transport-Security",    value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Cross-Origin-Opener-Policy",   value: "same-origin-allow-popups" },
        ],
      },
    ];
  },
};

export default nextConfig;
