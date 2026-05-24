"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Edit2, Trash2, Eye, Globe } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/FormField";
import { ConfirmModal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import type { CustomPage } from "@/types/cms";

export default function PagesPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();
  const [data, setData] = useState<CustomPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CustomPage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { fetch(`/api/admin/${company}/pages`).then((r) => r.json()).then((d) => { if (d.success) setData(d.data); setIsLoading(false); }); }, [company]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    if ((await (await fetch(`/api/admin/${company}/pages/${deleteTarget.id}`, { method: "DELETE" })).json()).success) {
      toast("Page deleted.", "success"); setData((d) => d.filter((p) => p.id !== deleteTarget.id));
    } else toast("Delete failed.", "error");
    setIsDeleting(false); setDeleteTarget(null);
  }

  return (
    <div>
      <PageHeader title="Pages" subtitle="Create and manage custom website pages." />
      <DataTable
        data={data} isLoading={isLoading}
        createHref={`${base}/pages/new`} createLabel="New Page"
        searchKeys={["title", "slug"] as (keyof CustomPage)[]}
        emptyMessage="No custom pages yet."
        columns={[
          { key: "title", label: "Title", sortable: true, render: (p) => <div><p className="font-semibold text-slate-800">{p.title}</p><p className="text-xs text-slate-400">/{p.slug}</p></div> },
          { key: "template", label: "Template", sortable: true, render: (p) => <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full capitalize">{p.template}</span> },
          { key: "isPublished", label: "Status", render: (p) => p.isPublished ? <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">Live</span> : <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Draft</span> },
          { key: "updatedAt", label: "Updated", render: (p) => <span className="text-xs text-slate-400">{new Date(p.updatedAt).toLocaleDateString()}</span> },
        ]}
        actions={[
          { label: "Edit", icon: Edit2, onClick: (p) => router.push(`${base}/pages/${p.id}`) },
          { label: "View", icon: Eye, onClick: (p) => window.open(`/${p.slug}`, "_blank") },
          { label: "Delete", icon: Trash2, variant: "danger", onClick: setDeleteTarget },
        ]}
      />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={isDeleting} title="Delete Page" message={`Delete page "${deleteTarget?.title}"?`} />
    </div>
  );
}
