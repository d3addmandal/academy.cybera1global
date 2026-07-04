import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/shared/FloatingButtons";
import { getSiteTheme, getSiteSettings, getSiteNav, getCRMPublishedProgrammes } from "@/lib/content";
import { blobHydrate } from "@/lib/blob-db";

export const dynamic = "force-dynamic";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const FONT_SIZE_MAP = { sm: "14px", md: "16px", lg: "18px" } as const;

export async function generateMetadata(): Promise<Metadata> {
  const theme = getSiteTheme();
  const faviconUrl = theme?.logo?.faviconUrl;
  const siteIconUrl = theme?.logo?.siteIconUrl;

  return {
    metadataBase: new URL("https://cybera1academy.com"),
    title: {
      default: "Cyber A1 Academy - Industry-Focused Cybersecurity Training",
      template: "%s | Cyber A1 Academy",
    },
    description:
      "Build real cybersecurity skills with hands-on training in VAPT, cloud security, SOC operations, ethical hacking, and enterprise security workflows.",
    keywords: [
      "cybersecurity training", "ethical hacking course", "VAPT training",
      "SOC analyst", "cloud security", "CEH certification",
      "cybersecurity academy", "penetration testing", "bug bounty",
    ],
    authors: [{ name: "Cyber A1 Academy" }],
    openGraph: {
      type: "website", locale: "en_IN", siteName: "Cyber A1 Academy",
      title: "Cyber A1 Academy - Industry-Focused Cybersecurity Training",
      description: "Build real cybersecurity skills with hands-on programs designed by security professionals.",
      images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Cyber A1 Academy",
      description: "Industry-Focused Cybersecurity Training Platform",
    },
    robots: { index: true, follow: true },
    icons: {
      icon: faviconUrl || "/favicon.ico",
      shortcut: faviconUrl || "/favicon.ico",
      apple: siteIconUrl || faviconUrl || "/favicon.ico",
      other: siteIconUrl ? [{ rel: "apple-touch-icon", url: siteIconUrl }] : [],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The proxy injects x-is-admin:true for all /webapplication/** routes.
  const h = await headers();
  const isAdmin = h.get("x-is-admin") === "true";

  // On Vercel, hydrate /tmp/ from Blob CDN on cold containers (no-op if already warm).
  // Always hydrate — admin routes need up-to-date data too (uploaded images, saved settings).
  await blobHydrate(process.env.COMPANY_SLUG ?? "cybera1");

  // Read CRM content for website pages (skipped for admin to avoid unnecessary reads)
  const theme = isAdmin ? null : getSiteTheme();
  const settings = isAdmin ? null : getSiteSettings();
  const nav = isAdmin ? null : getSiteNav();
  const programmes = isAdmin ? [] : getCRMPublishedProgrammes();

  // Build Google Fonts URL for selected fonts
  const headingFont = theme?.typography?.headingFont ?? "Inter";
  const bodyFont = theme?.typography?.bodyFont ?? "Inter";
  const baseFontSize = theme?.typography?.baseFontSize ?? "md";
  const googleFonts = [...new Set([headingFont, bodyFont])].filter((f) => f !== "Inter");
  const googleFontsUrl = googleFonts.length > 0
    ? `https://fonts.googleapis.com/css2?${googleFonts.map((f) => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700;800;900`).join("&")}&display=swap`
    : null;

  // CSS variables for global theme application
  const cssVars = {
    "--color-primary": theme?.colors?.primary ?? "#e00000",
    "--color-primary-dark": theme?.colors?.primaryDark ?? "#8b0000",
    "--color-header-bg": theme?.colors?.headerBg ?? "#080b10",
    "--color-footer-bg": theme?.colors?.footerBg ?? "#050505",
    "--color-page-bg": theme?.colors?.pageBg ?? "#ffffff",
    "--color-dark-bg": theme?.colors?.darkBg ?? "#080b10",
    "--color-semi-dark": theme?.colors?.semiDark ?? "#0d1117",
    "--color-black": theme?.colors?.black ?? "#050505",
    "--font-heading": headingFont === "Inter" ? `var(--font-inter), sans-serif` : `"${headingFont}", sans-serif`,
    "--font-body": bodyFont === "Inter" ? `var(--font-inter), sans-serif` : `"${bodyFont}", sans-serif`,
    "--font-base-size": FONT_SIZE_MAP[baseFontSize],
    // Template data passed as CSS vars for use in CSS selectors
    "--tmpl-page": `"${theme?.templates?.pageLayout ?? "layout-1"}"`,
    "--tmpl-prog": `"${theme?.templates?.programmeLayout ?? "prog-1"}"`,
    "--tmpl-blog": `"${theme?.templates?.blogLayout ?? "blog-1"}"`,
  } as React.CSSProperties;

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
      style={cssVars}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      data-page-template={theme?.templates?.pageLayout ?? "layout-1"}
      data-prog-template={theme?.templates?.programmeLayout ?? "prog-1"}
      data-blog-template={theme?.templates?.blogLayout ?? "blog-1"}
      data-cta-style={theme?.templates?.ctaStyle ?? "cta-1"}
      data-contact-form={theme?.templates?.contactFormStyle ?? "form-1"}
      data-contact-page={theme?.templates?.contactPageTemplate ?? "contact-1"}
    >
      <head>
        {googleFontsUrl && (
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        )}
        {googleFontsUrl && (
          <link rel="stylesheet" href={googleFontsUrl} />
        )}
      </head>
      <body
        className="min-h-full flex flex-col antialiased"
        style={{ backgroundColor: "var(--color-page-bg)", fontFamily: "var(--font-body)", fontSize: "var(--font-base-size)" }}
        suppressHydrationWarning
      >
        {!isAdmin && <Header theme={theme} settings={settings} nav={nav} programmes={programmes} />}
        <main className={isAdmin ? "flex-1 h-full" : "flex-1"}>
          {children}
        </main>
        {!isAdmin && <Footer />}
        {!isAdmin && <FloatingButtons settings={settings} />}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
