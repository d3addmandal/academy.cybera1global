import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/lib/auth";
import { programmesDb, blogDb, eventsDb, testimonialsDb, pagesDb } from "@/lib/db";

type Params = { params: Promise<{ company: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await getAuthFromRequest(req);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const { company } = await params;

  const programmes = programmesDb.getAll(company);
  const blogs = blogDb.getAll(company);
  const events = eventsDb.getAll(company);
  const testimonials = testimonialsDb.getAll(company);
  const pages = pagesDb.getAll(company);

  return NextResponse.json({
    success: true,
    data: {
      programmes: { total: programmes.length, published: programmes.filter((p) => p.status === "published").length, featured: programmes.filter((p) => p.isFeatured).length },
      blog: { total: blogs.length, published: blogs.filter((b) => b.status === "published").length, featured: blogs.filter((b) => b.isFeatured).length },
      events: { total: events.length, upcoming: events.filter((e) => new Date(e.date) > new Date()).length },
      testimonials: { total: testimonials.length, featured: testimonials.filter((t) => t.isFeatured).length },
      pages: { total: pages.length, published: pages.filter((p) => p.isPublished).length },
    },
  });
}
