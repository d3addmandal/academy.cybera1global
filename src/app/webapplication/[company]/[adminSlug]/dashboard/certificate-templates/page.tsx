"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Edit2, Trash2, Copy, Star } from "lucide-react";
import DataTable from "@/components/admin/DataTable";
import { StatusBadge, PageHeader } from "@/components/admin/FormField";
import { ConfirmModal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import type { CertificateTemplate } from "@/types/cms";

export default function CertificateTemplatesPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const base = `/webapplication/${company}/${adminSlug}/dashboard`;
  const { toast } = useToast();
  const [data, setData] = useState<CertificateTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<CertificateTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function load() {
    setIsLoading(true);
    fetch(`/api/admin/${company}/certificate-templates`).then((r) => r.json()).then((d) => { if (d.success) setData(d.data); setIsLoading(false); });
  }
  useEffect(load, [company]);

  async function handleDuplicate(t: CertificateTemplate) {
    const res = await fetch(`/api/admin/${company}/certificate-templates/${t.id}/duplicate`, { method: "POST" }).then((r) => r.json());
    if (res.success) { toast("Template duplicated.", "success"); load(); }
    else toast(res.error || "Failed.", "error");
  }

  async function handleSetDefault(t: CertificateTemplate) {
    const res = await fetch(`/api/admin/${company}/certificate-templates/${t.id}/set-default`, { method: "POST" }).then((r) => r.json());
    if (res.success) { toast("Default template updated.", "success"); load(); }
    else toast(res.error || "Failed.", "error");
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await fetch(`/api/admin/${company}/certificate-templates/${deleteTarget.id}`, { method: "DELETE" }).then((r) => r.json());
    if (res.success) { toast("Template deleted.", "success"); setData((d) => d.filter((t) => t.id !== deleteTarget.id)); }
    else toast(res.error || "Delete failed.", "error");
    setIsDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <div>
      <PageHeader title="Certificate Templates" subtitle="Reusable HTML templates for certificate generation." />
      <DataTable
        data={data} isLoading={isLoading}
        createHref={`${base}/certificate-templates/new`} createLabel="New Template"
        searchKeys={["name"] as (keyof CertificateTemplate)[]}
        emptyMessage="No certificate templates yet."
        columns={[
          { key: "name", label: "Name", sortable: true, render: (t) => (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">{t.name}</span>
              {t.isDefault && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" aria-label="Default template" />}
            </div>
          ) },
          { key: "status", label: "Status", render: (t) => <StatusBadge status={t.status} /> },
          { key: "updatedAt", label: "Updated", render: (t) => <span className="text-xs text-slate-400">{new Date(t.updatedAt).toLocaleDateString()}</span> },
        ]}
        actions={[
          { label: "Edit", icon: Edit2, onClick: (t) => router.push(`${base}/certificate-templates/${t.id}`) },
          { label: "Duplicate", icon: Copy, onClick: handleDuplicate },
          { label: "Set Default", icon: Star, onClick: handleSetDefault },
          { label: "Delete", icon: Trash2, variant: "danger", onClick: setDeleteTarget },
        ]}
      />
      <ConfirmModal
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={isDeleting}
        title="Delete Template" message={`Delete "${deleteTarget?.name}"? Certificates using this template will need a different one.`}
      />
    </div>
  );
}
