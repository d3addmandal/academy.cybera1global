"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Edit2, Trash2, Eye, Star } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { StatusBadge, PageHeader } from "@/components/admin/FormField";
import { ConfirmModal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import type { BlogPost } from "@/types/cms";

export default function BlogPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();

  const [data, setData] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/${company}/blog`).then((r) => r.json()).then((d) => { if (d.success) setData(d.data); setIsLoading(false); });
  }, [company]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await fetch(`/api/admin/${company}/blog/${deleteTarget.id}`, { method: "DELETE" });
    if ((await res.json()).success) { toast("Post deleted.", "success"); setData((d) => d.filter((p) => p.id !== deleteTarget.id)); }
    else toast("Delete failed.", "error");
    setIsDeleting(false); setDeleteTarget(null);
  }

  return (
    <div>
      <PageHeader title="Blog Posts" subtitle="Manage blog articles and insights." />
      <DataTable
        data={data} isLoading={isLoading}
        createHref={`${base}/blog/new`} createLabel="New Post"
        searchKeys={["title", "category"] as (keyof BlogPost)[]}
        emptyMessage="No blog posts yet."
        columns={[
          { key: "title", label: "Title", sortable: true, render: (p) => <div><p className="font-semibold text-slate-800 line-clamp-1">{p.title}</p><p className="text-xs text-slate-400">{p.category} · {p.readTime}</p></div> },
          { key: "publishedAt", label: "Date", sortable: true, render: (p) => <span className="text-sm text-slate-500">{new Date(p.publishedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span> },
          { key: "isFeatured", label: "Featured", render: (p) => p.isFeatured ? <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> : <span className="text-slate-300">—</span> },
          { key: "status", label: "Status", render: (p) => <StatusBadge status={p.status} /> },
        ]}
        actions={[
          { label: "Edit", icon: Edit2, onClick: (p) => router.push(`${base}/blog/${p.id}`) },
          { label: "Preview", icon: Eye, onClick: (p) => window.open(`/blog/${p.slug}`, "_blank") },
          { label: "Delete", icon: Trash2, variant: "danger", onClick: setDeleteTarget },
        ]}
      />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={isDeleting} title="Delete Post" message={`Delete "${deleteTarget?.title}"? This cannot be undone.`} />
    </div>
  );
}
