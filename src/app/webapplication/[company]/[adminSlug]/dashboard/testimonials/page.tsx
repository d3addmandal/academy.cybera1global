"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Edit2, Trash2, Star } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { StatusBadge, PageHeader } from "@/components/admin/FormField";
import { ConfirmModal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import type { Testimonial } from "@/types/cms";

export default function TestimonialsPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();
  const [data, setData] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { fetch(`/api/admin/${company}/testimonials`).then((r) => r.json()).then((d) => { if (d.success) setData(d.data); setIsLoading(false); }); }, [company]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    if ((await (await fetch(`/api/admin/${company}/testimonials/${deleteTarget.id}`, { method: "DELETE" })).json()).success) {
      toast("Deleted.", "success"); setData((d) => d.filter((t) => t.id !== deleteTarget.id));
    } else toast("Delete failed.", "error");
    setIsDeleting(false); setDeleteTarget(null);
  }

  return (
    <div>
      <PageHeader title="Testimonials" subtitle="Manage student success stories." />
      <DataTable
        data={data} isLoading={isLoading}
        createHref={`${base}/testimonials/new`} createLabel="Add Testimonial"
        searchKeys={["name", "company", "programme"] as (keyof Testimonial)[]}
        emptyMessage="No testimonials yet."
        columns={[
          { key: "name", label: "Student", sortable: true, render: (t) => <div><p className="font-semibold text-slate-800">{t.name}</p><p className="text-xs text-slate-400">{t.role} @ {t.company}</p></div> },
          { key: "programme", label: "Programme", sortable: true },
          { key: "rating", label: "Rating", render: (t) => <span className="flex items-center gap-0.5 text-yellow-400">{"★".repeat(t.rating)}</span> },
          { key: "isFeatured", label: "Featured", render: (t) => t.isFeatured ? <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> : <span className="text-slate-300">—</span> },
          { key: "status", label: "Status", render: (t) => <StatusBadge status={t.status} /> },
        ]}
        actions={[
          { label: "Edit", icon: Edit2, onClick: (t) => router.push(`${base}/testimonials/${t.id}`) },
          { label: "Delete", icon: Trash2, variant: "danger", onClick: setDeleteTarget },
        ]}
      />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={isDeleting} title="Delete Testimonial" message={`Delete testimonial from "${deleteTarget?.name}"?`} />
    </div>
  );
}
