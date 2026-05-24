import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/shared/WhatsAppFloat";
import { getSiteTheme, getSiteSettings, getSiteNav, getCRMPublishedProgrammes } from "@/lib/content";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const theme = getSiteTheme();
  const faviconUrl = theme?.logo?.faviconUrl;
  const siteIconUrl = theme?.logo?.siteIconUrl;

  return {
    metadataBase: new URL("https://cybera1academy.com"),
    title: {
      default: "Cyber A1 Academy — Industry-Focused Cybersecurity Training",
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
      title: "Cyber A1 Academy — Industry-Focused Cybersecurity Training",
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

  // Read CRM content for website pages (skipped for admin to avoid unnecessary reads)
  const theme = isAdmin ? null : getSiteTheme();
  const settings = isAdmin ? null : getSiteSettings();
  const nav = isAdmin ? null : getSiteNav();
  const programmes = isAdmin ? [] : getCRMPublishedProgrammes();

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body
        className="min-h-full flex flex-col bg-white text-gray-900 antialiased"
        suppressHydrationWarning
      >
        {!isAdmin && <Header theme={theme} settings={settings} nav={nav} programmes={programmes} />}
        <main className={isAdmin ? "flex-1 h-full" : "flex-1"}>
          {children}
        </main>
        {!isAdmin && <Footer />}
        {!isAdmin && <WhatsAppFloat />}
      </body>
    </html>
  );
}
