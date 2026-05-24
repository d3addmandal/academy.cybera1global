import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Main website — allow all legitimate bots
        userAgent: "*",
        allow: "/",
        // Completely disallow admin paths — no crawling, no indexing, no trace
        disallow: [
          "/webapplication/",
          "/api/admin/",
        ],
      },
    ],
    // No sitemap entry for admin paths
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://cybera1academy.com"}/sitemap.xml`,
  };
}
