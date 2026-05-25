"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Edit2, Trash2, Menu } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/FormField";
import { ConfirmModal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import type { NavigationMenu } from "@/types/cms";

export default function MenusPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();
  const [data, setData] = useState<NavigationMenu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<NavigationMenu | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/${company}/menus`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); setIsLoading(false); });
  }, [company]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await (await fetch(`/api/admin/${company}/menus/${deleteTarget.id}`, { method: "DELETE" })).json();
    if (res.success) {
      toast("Menu deleted.", "success");
      setData(d => d.filter(m => m.id !== deleteTarget.id));
    } else toast("Delete failed.", "error");
    setIsDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <div>
      <PageHeader title="Navigation Menus" subtitle="Create and manage reusable link groups. Assign them to footer columns from the Home Content editor." />
      <DataTable
        data={data} isLoading={isLoading}
        createHref={`${base}/menus/new`} createLabel="Create Menu"
        searchKeys={["header"] as (keyof NavigationMenu)[]}
        emptyMessage="No menus yet. Create your first menu."
        columns={[
          {
            key: "header", label: "Menu Name", sortable: true,
            render: (m) => (
              <div className="flex items-center gap-2">
                <Menu className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-800">{m.header}</span>
              </div>
            )
          },
          {
            key: "items", label: "Items",
            render: (m) => <span className="text-slate-600">{m.items.length} item{m.items.length !== 1 ? "s" : ""}</span>
          },
          {
            key: "updatedAt", label: "Last Updated", sortable: true,
            render: (m) => <span className="text-xs text-slate-400">{new Date(m.updatedAt).toLocaleDateString()}</span>
          },
        ]}
        actions={[
          { label: "Edit", icon: Edit2, onClick: (m) => router.push(`${base}/menus/${m.id}`) },
          { label: "Delete", icon: Trash2, variant: "danger", onClick: setDeleteTarget },
        ]}
      />
      <ConfirmModal
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} isLoading={isDeleting}
        title="Delete Menu" message={`Delete menu "${deleteTarget?.header}"? This may affect footers or headers using this menu.`}
      />
    </div>
  );
}
