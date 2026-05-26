export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, Share2, Tag } from "lucide-react";
import { getCRMBlogBySlug, getCRMBlogPosts } from "@/lib/content";
import BlogCard from "@/components/shared/BlogCard";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getCRMBlogBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getCRMBlogBySlug(slug);
  if (!post) notFound();

  const related = getCRMBlogPosts()
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  const fallbackRelated = getCRMBlogPosts().filter((p) => p.id !== post.id).slice(0, 3);
  const displayRelated = related.length > 0 ? related : fallbackRelated;

  return (
    <div className="pt-16">
      <section className="bg-[#080b10] py-16">
        <div className="site-container">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white">Blog</Link>
            <span>/</span>
            <span className="text-gray-300 line-clamp-1">{post.title}</span>
          </div>
          <span className="inline-block bg-red-600/20 text-red-400 border border-red-600/30 text-xs font-bold px-3 py-1 rounded-full mb-4">{post.category}</span>
          <h1 className="text-3xl lg:text-4xl font-black text-white mb-6 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-5 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center">
                <span className="text-red-400 text-xs font-bold">{post.author.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-white font-semibold text-xs">{post.author.name}</p>
                <p className="text-gray-500 text-xs">{post.author.role}</p>
              </div>
            </div>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(post.publishedAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.readTime}</span>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="site-container">
          <div className="grid lg:grid-cols-4 gap-12">
            <article className="lg:col-span-3">
              <div className="bg-red-50 border-l-4 border-red-600 p-5 rounded-r-xl mb-8">
                <p className="text-gray-700 font-medium leading-relaxed">{post.excerpt}</p>
              </div>
              {post.content ? (
                <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
              ) : (
                <div className="text-gray-500 space-y-4 leading-relaxed">
                  <p>The cybersecurity landscape is constantly evolving. As organizations face increasingly sophisticated threats, the need for skilled security professionals has never been greater. This article explores {post.title.toLowerCase()} and what it means for security practitioners.</p>
                  <p>Security professionals must continuously adapt their approaches to stay ahead of attackers. The integration of AI, cloud computing, and distributed systems has expanded the attack surface dramatically, requiring a more holistic approach to cybersecurity.</p>
                </div>
              )}

              <div className="mt-10 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <Share2 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Share:</span>
                {["LinkedIn", "Twitter", "WhatsApp"].map((p) => (
                  <button key={p} className="text-xs font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-red-300 hover:text-red-600 transition-colors">{p}</button>
                ))}
              </div>

              <Link href="/blog" className="mt-8 inline-flex items-center gap-2 text-gray-500 font-semibold hover:text-red-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Blog
              </Link>
            </article>

            <aside className="space-y-6">
              <div className="bg-[#080b10] border border-gray-800 rounded-xl p-5">
                <h3 className="text-white font-bold mb-4 text-sm">Ready to Learn?</h3>
                <p className="text-gray-400 text-xs mb-4">Start your cybersecurity career with Cyber A1 Academy's practical programs.</p>
                <Link href="/courses" className="block w-full text-center bg-red-600 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-red-500 transition-colors">Explore Programs</Link>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                <h3 className="text-gray-900 font-bold mb-4 text-sm">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => <span key={tag} className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">{tag}</span>)}
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                <h3 className="text-gray-900 font-bold mb-4 text-sm">Newsletter</h3>
                <p className="text-gray-500 text-xs mb-3">Get weekly cybersecurity insights.</p>
                <input type="email" placeholder="Enter email" className="w-full border border-gray-200 text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-red-400 mb-2" />
                <button className="w-full bg-red-600 text-white font-semibold text-xs py-2.5 rounded-lg hover:bg-red-500 transition-colors">Subscribe</button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {displayRelated.length > 0 && (
        <section className="py-16 bg-[#f5f5f5]">
          <div className="site-container">
            <h2 className="text-2xl font-black text-gray-900 mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayRelated.map((p) => <BlogCard key={p.id} post={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
