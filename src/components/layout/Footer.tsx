import { Fragment } from "react";
import Link from "next/link";
import {
  Shield, Phone, Mail, MapPin, Linkedin, Instagram,
  Clock, Youtube, Facebook, MessageCircle
} from "lucide-react";
import NewsletterForm from "@/components/shared/NewsletterForm";
import { getSiteSettings, getSiteTheme, getSiteHome, getCRMMenus, getCRMPublishedProgrammes } from "@/lib/content";
import type { NavigationMenu } from "@/types/cms";

function FooterMenuColumn({ menu }: { menu: NavigationMenu }) {
  return (
    <div>
      <h3 className="text-white font-semibold text-[13px] mb-2 uppercase tracking-widest">
        {menu.header}
      </h3>
      <ul className="space-y-1">
        {menu.items.map((link) => (
          <li key={link.id}>
            <Link href={link.href} className="text-[13px] text-gray-500 hover:text-red-400 transition-colors leading-snug block">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const settings = getSiteSettings();
  const theme = getSiteTheme();
  const home = getSiteHome();
  const allMenus = getCRMMenus();
  const publishedProgrammes = getCRMPublishedProgrammes();

  const companyName = settings?.companyName ?? "Cyber A1 Academy";
  const footer = home?.footer;
  const description = footer?.description ?? "Practical cybersecurity education, enterprise training, and career-focused learning for the modern security industry.";
  const copyright = footer?.copyright ?? `© ${new Date().getFullYear()} Cyber A1 Academy. All Rights Reserved.`;
  const bottomLinks = footer?.bottomLinks ?? [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Refund Policy", href: "/refund-policy" },
  ];

  const phone = footer?.contactPhone || settings?.phone || "+91 8240 006 007";
  const whatsapp = footer?.contactWhatsapp || settings?.whatsapp || "";
  const email = footer?.contactEmail || settings?.email || "info@cybera1academy.com";
  const address = footer?.contactAddress || settings?.address || "Durgapur | Delhi | Kolkata";
  const hours = footer?.contactHours || settings?.hours || "Mon-Sat: 9:30 AM - 7:00 PM";

  const logoImageUrl = theme?.logo?.imageUrl ?? "";
  const logoText = theme?.logo?.text ?? "Cyber A1";
  const logoHighlight = theme?.logo?.highlight ?? "A1";
  const primaryColor = theme?.colors?.primary ?? "#e00000";
  const primaryDark = theme?.colors?.primaryDark ?? "#8b0000";

  const socialLinks = footer?.socialLinks ?? settings?.socialLinks ?? {};
  const sl = socialLinks as Record<string, string>;

  const menuSections = footer?.menuSections ?? [];
  const activeMenus: NavigationMenu[] = menuSections
    .filter(s => s.enabled && s.menuId)
    .map(s => {
      const menu = allMenus.find(m => m.id === s.menuId);
      if (!menu) return null;
      if (menu.header.toLowerCase().includes("program")) {
        return {
          ...menu,
          items: publishedProgrammes.map(p => ({
            id: p.id,
            label: p.title,
            href: `/courses/${p.slug}`,
          })),
        };
      }
      return menu;
    })
    .filter(Boolean) as NavigationMenu[];

  const lastSection = footer?.lastSection ?? "newsletter";
  const newsletterTitle = footer?.newsletter?.title ?? "Newsletter";
  const newsletterDesc = footer?.newsletter?.description ?? "Subscribe to get updates on new courses, events and more.";
  const achievements = footer?.achievements ?? [];

  const cappedMenus = activeMenus.slice(0, 4);

  const socialItems = [
    { icon: Linkedin, href: sl.linkedin ?? "#", label: "LinkedIn" },
    { icon: Instagram, href: sl.instagram ?? "#", label: "Instagram" },
    { icon: Youtube, href: sl.youtube ?? "#", label: "YouTube" },
    { icon: Facebook, href: sl.facebook ?? "#", label: "Facebook" },
  ];

  return (
    <footer
      className="text-gray-500 overflow-hidden"
      style={{ backgroundColor: "var(--color-footer-bg, #050505)" }}
      suppressHydrationWarning
    >
      <div className="w-full px-[1%] py-4">
        {/* Flex layout — columns centered, wrap on smaller screens */}
        <div
          className="flex flex-wrap justify-center items-start"
          style={{ columnGap: "2%", rowGap: "1rem" }}
        >
          {/* Brand */}
          <div className="w-full sm:w-44 flex-shrink-0 flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2">
              {logoImageUrl ? (
                <img src={logoImageUrl} alt={companyName} className="h-7 w-auto object-contain" />
              ) : (
                <>
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryDark})` }}
                  >
                    <Shield className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <span className="text-white font-bold text-sm block leading-tight">
                      {logoText.replace(logoHighlight, "")}
                      <span style={{ color: primaryColor }}>{logoHighlight}</span>
                    </span>
                    <span className="text-gray-500 text-[11px] uppercase tracking-wider block">Academy</span>
                  </div>
                </>
              )}
            </Link>
            <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-3">{description}</p>
            <div className="flex items-center gap-1.5">
              {socialItems.map(({ icon: Icon, href, label }) => (
                <a
                  key={label} href={href}
                  target={href !== "#" ? "_blank" : undefined}
                  rel="noopener noreferrer" aria-label={label}
                  className="w-6 h-6 rounded bg-gray-800/80 flex items-center justify-center text-gray-600 hover:bg-red-600 hover:text-white transition-all"
                >
                  <Icon style={{ width: 12, height: 12 }} />
                </a>
              ))}
            </div>
          </div>

          {/* Pipe */}
          <div className="hidden lg:block w-px self-stretch bg-gray-700 flex-shrink-0" />

          {/* CRM menus — each followed by a pipe */}
          {cappedMenus.map(menu => (
            <Fragment key={menu.id}>
              <div className="w-[47%] sm:w-36 flex-shrink-0">
                <FooterMenuColumn menu={menu} />
              </div>
              <div className="hidden lg:block w-px self-stretch bg-gray-700 flex-shrink-0" />
            </Fragment>
          ))}

          {/* Contact Us */}
          <div className="w-[47%] sm:w-40 flex-shrink-0">
            <h3 className="text-white font-semibold text-[13px] mb-2 uppercase tracking-widest">Contact Us</h3>
            <ul className="space-y-1">
              <li className="flex items-center gap-1.5">
                <Phone style={{ width: 13, height: 13 }} className="text-red-500 flex-shrink-0" />
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-[13px] text-gray-500 hover:text-white transition-colors">{phone}</a>
              </li>
              <li className="flex items-center gap-1.5">
                <Mail style={{ width: 13, height: 13 }} className="text-red-500 flex-shrink-0" />
                <a href={`mailto:${email}`} className="text-[13px] text-gray-500 hover:text-white transition-colors truncate">{email}</a>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin style={{ width: 13, height: 13 }} className="text-red-500 flex-shrink-0" />
                <span className="text-[13px] text-gray-500">{address}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Clock style={{ width: 13, height: 13 }} className="text-red-500 flex-shrink-0" />
                <span className="text-[13px] text-gray-500">{hours}</span>
              </li>
              {whatsapp && (
                <li className="pt-0.5">
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-[12px] font-semibold px-2.5 py-1 rounded transition-colors"
                  >
                    <MessageCircle style={{ width: 12, height: 12 }} />
                    Chat on WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Pipe */}
          <div className="hidden lg:block w-px self-stretch bg-gray-700 flex-shrink-0" />

          {/* Last section */}
          <div className="w-[47%] sm:w-44 flex-shrink-0">
            {lastSection === "achievements" && achievements.length > 0 ? (
              <>
                <h3 className="text-white font-semibold text-[13px] mb-2 uppercase tracking-widest">Achievements</h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {achievements.map((a, i) => (
                    <div key={i} className="bg-gray-800/60 rounded p-1.5 flex items-center justify-center">
                      {a.logoUrl
                        ? <img src={a.logoUrl} alt={a.name} className="h-7 w-auto object-contain grayscale hover:grayscale-0 transition-all" />
                        : <span className="text-[11px] text-gray-500 text-center leading-tight">{a.name}</span>
                      }
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-white font-semibold text-[13px] mb-2 uppercase tracking-widest">{newsletterTitle}</h3>
                <p className="text-[13px] text-gray-500 mb-2 leading-snug">{newsletterDesc}</p>
                <NewsletterForm />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800/40">
        <div className="w-full px-[1%] py-2 flex flex-col sm:flex-row items-center justify-between gap-1">
          <p className="text-[12px] text-gray-600">{copyright}</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {bottomLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-[12px] text-gray-600 hover:text-red-400 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
