import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/types/cms";

interface BlogCardProps {
  post: BlogPost;
  variant?: "default" | "compact";
}

export default function BlogCard({ post, variant = "default" }: BlogCardProps) {
  if (variant === "compact") {
    return (
      <div className="flex gap-3 group">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
          <div className="w-full h-full bg-gradient-to-br from-red-900/40 to-gray-800" />
        </div>
        <div>
          <span className="text-xs text-red-500 font-semibold">{post.category}</span>
          <h4 className="text-sm text-white font-semibold mt-0.5 group-hover:text-red-400 transition-colors line-clamp-2">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h4>
          <p className="text-xs text-gray-500 mt-1">{post.publishedAt}</p>
        </div>
      </div>
    );
  }

  return (
    <article className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {post.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.publishedAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime}
          </span>
        </div>

        <h3 className="text-gray-900 font-bold text-base mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-3">{post.excerpt}</p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-xs font-bold">
                {post.author.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700">{post.author.name}</p>
              <p className="text-xs text-gray-400">{post.author.role}</p>
            </div>
          </div>
          <Link
            href={`/blog/${post.slug}`}
            className="text-red-600 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            Read <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
