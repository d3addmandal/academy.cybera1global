import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { programmesDb } from "@/lib/db";

type Params = { params: Promise<{ company: string }> };

const STATIC_PAGES = [
  { label: "Home", href: "/" },
  { label: "About Academy", href: "/academy" },
  { label: "Courses", href: "/courses" },
  { label: "Corporate Training", href: "/corporate-training" },
  { label: "Institutions", href: "/institutions" },
  { label: "Events", href: "/events" },
  { label: "Blog", href: "/blog" },
  { label: "Career & Placement", href: "/career-placement" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund-policy" },
];

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { company } = await params;

  const programmes = programmesDb.getAll(company)
    .filter(p => p.status === "published")
    .map(p => ({ label: p.shortTitle || p.title, href: `/courses/${p.slug}` }));

  return NextResponse.json({ success: true, data: [...STATIC_PAGES, ...programmes] });
}
