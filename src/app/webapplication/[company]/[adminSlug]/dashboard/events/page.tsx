"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Edit2, Trash2, Eye, Star } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { StatusBadge, PageHeader } from "@/components/admin/FormField";
import { ConfirmModal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import type { Event } from "@/types/cms";

export default function EventsPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();
  const [data, setData] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { fetch(`/api/admin/${company}/events`).then((r) => r.json()).then((d) => { if (d.success) setData(d.data); setIsLoading(false); }); }, [company]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    if ((await (await fetch(`/api/admin/${company}/events/${deleteTarget.id}`, { method: "DELETE" })).json()).success) {
      toast("Event deleted.", "success"); setData((d) => d.filter((e) => e.id !== deleteTarget.id));
    } else toast("Delete failed.", "error");
    setIsDeleting(false); setDeleteTarget(null);
  }

  return (
    <div>
      <PageHeader title="Events" subtitle="Manage workshops, bootcamps, CTFs, and webinars." />
      <DataTable
        data={data} isLoading={isLoading}
        createHref={`${base}/events/new`} createLabel="New Event"
        searchKeys={["title", "type"] as (keyof Event)[]}
        emptyMessage="No events yet."
        columns={[
          { key: "title", label: "Event", sortable: true, render: (e) => <div><p className="font-semibold text-slate-800">{e.title}</p><p className="text-xs text-slate-400 capitalize">{e.type} · {e.mode}</p></div> },
          { key: "date", label: "Date", sortable: true, render: (e) => <span className="text-sm text-slate-500">{new Date(e.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span> },
          { key: "isFree", label: "Free?", render: (e) => e.isFree ? <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">FREE</span> : <span className="text-slate-400 text-xs">Paid</span> },
          { key: "isFeatured", label: "Featured", render: (e) => e.isFeatured ? <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> : <span className="text-slate-300">—</span> },
          { key: "status", label: "Status", render: (e) => <StatusBadge status={e.status} /> },
        ]}
        actions={[
          { label: "Edit", icon: Edit2, onClick: (e) => router.push(`${base}/events/${e.id}`) },
          { label: "Delete", icon: Trash2, variant: "danger", onClick: setDeleteTarget },
        ]}
      />
      <ConfirmModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={isDeleting} title="Delete Event" message={`Delete "${deleteTarget?.title}"?`} />
    </div>
  );
}
