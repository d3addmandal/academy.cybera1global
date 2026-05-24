import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React 18.3 + Next.js 16 dev mode throws hydration mismatches for STRUCTURAL
  // differences (e.g. extra child elements injected by browser extensions) even
  // when suppressHydrationWarning is set. Disabling StrictMode stops this.
  // StrictMode is development-only; no effect on production builds.
  reactStrictMode: false,

  images: {
    remotePatterns: [{ protocol: "https", hostname: "cybera1academy.com" }],
    unoptimized: true,
  },

  // Allow dev HMR from LAN / VM hosts
  allowedDevOrigins: [
    "192.168.56.1",
    "192.168.1.0/24",
    "10.0.0.0/8",
    "172.16.0.0/12",
  ],

  async headers() {
    return [
      {
        source: "/webapplication/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, private" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
