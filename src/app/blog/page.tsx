export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Search } from "lucide-react";
import { getCRMBlogPosts, getSiteNav } from "@/lib/content";
import BlogCard from "@/components/shared/BlogCard";

export const metadata: Metadata = {
  title: "Blog - Cybersecurity Insights, Tips & Career Guides",
  description: "Read expert articles on cybersecurity, ethical hacking, VAPT, cloud security, SOC operations, and career development.",
};

export default function BlogPage() {
  const posts = getCRMBlogPosts();
  const featured = posts.find((b) => b.isFeatured);
  const rest = posts.filter((b) => b.id !== featured?.id);

  const categories = ["All", ...Array.from(new Set(posts.map(p => p.category)))];

  // Sticky offset must account for the announcement bar's height only when it's actually shown —
  // otherwise (admin disabled it in CRM) there'd be a stale gap under the sticky category bar.
  const announcementOn = getSiteNav()?.announcementBar?.enabled ?? true;
  const stickyTopClass = announcementOn ? "top-[65px] md:top-[105px]" : "top-16";

  return (
    <div className="pt-16">
      <section className="bg-[#080b10] py-16">
        <div className="site-container">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-gray-300">Blog</span>
          </div>
          <div className="max-w-2xl">
            <span className="text-red-500 text-sm font-bold uppercase tracking-widest mb-4 block">Latest From Our Blog</span>
            <h1 className="text-4xl font-black text-white mb-4">
              Cybersecurity <span className="text-red-500">Insights &amp; Resources</span>
            </h1>
            <p className="text-gray-400">Expert articles, career guides, and technical insights from our security professionals.</p>
          </div>
        </div>
      </section>

      {/* Category bar */}
      <div className={`bg-white border-b border-gray-100 sticky z-30 ${stickyTopClass}`}>
        <div className="site-container py-4 flex items-center gap-3 overflow-x-auto">
          {categories.map((cat) => (
            <button key={cat} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${cat === "All" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="site-container py-16">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">No blog posts published yet.</p>
            <p className="text-sm mt-2">Create blog posts in the CRM to see them here.</p>
          </div>
        ) : (
          <>
            {featured && (
              <div className="mb-14">
                <h2 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-6">Featured Article</h2>
                <Link href={`/blog/${featured.slug}`} className="group grid lg:grid-cols-2 gap-8 bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-red-200 hover:shadow-xl transition-all duration-300">
                  <div className="relative h-64 lg:h-auto bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-center p-6">
                      <span className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3 block">{featured.category}</span>
                      <div className="w-12 h-12 mx-auto rounded-xl bg-red-600/20 flex items-center justify-center">
                        <ArrowRight className="w-6 h-6 text-red-500" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5 sm:p-8 flex flex-col justify-center">
                    <span className="text-xs bg-red-50 text-red-600 font-bold px-3 py-1 rounded-full self-start mb-4">{featured.category}</span>
                    <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-red-600 transition-colors">{featured.title}</h3>
                    <p className="text-gray-500 mb-6">{featured.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-600 text-xs font-bold">{featured.author.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-700">{featured.author.name}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(featured.publishedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</p>
                        </div>
                      </div>
                      <span className="text-red-600 font-semibold text-sm flex items-center gap-1">{featured.readTime} <Clock className="w-3.5 h-3.5" /></span>
                    </div>
                  </div>
                </Link>
              </div>
            )}
            {rest.length > 0 && (
              <>
                <h2 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-6">All Articles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post) => <BlogCard key={post.id} post={post} />)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}


