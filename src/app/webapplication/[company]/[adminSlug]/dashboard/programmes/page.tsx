"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Edit2, Trash2, Star, Eye, Loader2 } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { StatusBadge, PageHeader } from "@/components/admin/FormField";
import { ConfirmModal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import type { Programme } from "@/types/cms";

export default function ProgrammesPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();

  const [data, setData] = useState<Programme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Programme | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  async function fetchData() {
    setIsLoading(true);
    const res = await fetch(`/api/admin/${company}/programmes`, { credentials: "same-origin" });
    const json = await res.json();
    if (json.success) setData(json.data);
    setIsLoading(false);
  }

  useEffect(() => { fetchData(); }, [company]);

  async function handleToggleStatus(p: Programme) {
    const newStatus = p.status === "published" ? "draft" : "published";
    setPublishingId(p.id);
    const res = await fetch(`/api/admin/${company}/programmes/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ status: newStatus }),
    });
    const json = await res.json();
    if (json.success) {
      toast(`Programme ${newStatus === "published" ? "published" : "unpublished"} successfully.`, "success");
      setData((d) => d.map((item) => item.id === p.id ? { ...item, status: newStatus } : item));
    } else {
      toast(json.error || "Failed to update status.", "error");
    }
    setPublishingId(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await fetch(`/api/admin/${company}/programmes/${deleteTarget.id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      toast("Programme deleted.", "success");
      setData((d) => d.filter((p) => p.id !== deleteTarget.id));
    } else {
      toast(json.error || "Failed to delete.", "error");
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <div>
      <PageHeader title="Programmes" subtitle="Manage all cybersecurity programmes and courses." />

      <DataTable
        data={data}
        isLoading={isLoading}
        createHref={`${base}/programmes/new`}
        createLabel="Add Programme"
        searchKeys={["title", "shortTitle", "level", "category"] as (keyof Programme)[]}
        emptyMessage="No programmes yet. Add your first programme."
        columns={[
          {
            key: "shortTitle", label: "Programme", sortable: true,
            render: (p) => (
              <div>
                <p className="font-bold text-slate-800">{p.shortTitle}</p>
                <p className="text-xs text-slate-400 line-clamp-1">{p.title}</p>
              </div>
            ),
          },
          { key: "level", label: "Level", sortable: true },
          { key: "duration", label: "Duration" },
          { key: "category", label: "Category", sortable: true },
          {
            key: "isFeatured", label: "Featured",
            render: (p) => p.isFeatured ? <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> : <span className="text-slate-300">—</span>,
          },
          {
            key: "status", label: "Status", sortable: true,
            render: (p) => (
              <button
                onClick={() => handleToggleStatus(p)}
                disabled={publishingId === p.id}
                title={p.status === "published" ? "Click to unpublish" : "Click to publish"}
                className="inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
              >
                {publishingId === p.id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  : <StatusBadge status={p.status} />
                }
              </button>
            ),
          },
        ]}
        actions={[
          {
            label: "Edit", icon: Edit2,
            onClick: (p) => router.push(`${base}/programmes/${p.id}`),
          },
          {
            label: "Preview", icon: Eye,
            onClick: (p) => window.open(`/courses/${p.slug}`, "_blank"),
          },
          {
            label: "Delete", icon: Trash2, variant: "danger",
            onClick: setDeleteTarget,
          },
        ]}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Programme"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
      />
    </div>
  );
}
