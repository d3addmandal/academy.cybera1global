import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BlogCard from "@/components/shared/BlogCard";
import { getCRMFeaturedBlogs } from "@/lib/content";

export default function BlogPreview() {
  const posts = getCRMFeaturedBlogs();

  return (
    <section className="py-20 bg-white">
      <div className="site-container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-red-600 text-sm font-bold uppercase tracking-widest mb-3 block">
              Latest From Our Blog
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900">
              Insights &amp; <span className="text-red-600">Resources</span>
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-red-600 font-semibold text-sm hover:gap-3 transition-all whitespace-nowrap"
          >
            Explore All Blogs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

