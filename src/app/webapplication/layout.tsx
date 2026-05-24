import type { Metadata } from "next";

/**
 * All /webapplication/** routes are admin-panel routes.
 * - This layout exports noindex metadata (belt-and-suspenders on top of
 *   the X-Robots-Tag header and the meta tag in the login page).
 * - It does NOT add <html>/<body> — those live in the root layout only.
 * - Header/Footer are suppressed by the root layout when x-is-admin header
 *   is present (injected by proxy.ts for every /webapplication/** request).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin",
};

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
