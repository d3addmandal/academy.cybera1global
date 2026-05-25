"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/FormField";
import { useToast } from "@/components/admin/Toast";
import { MessageCircle, Phone, Mail, MapPin, Trash2, RefreshCw, Inbox } from "lucide-react";
import type { ContactSubmission } from "@/types/cms";

const BADGE: Record<string, string> = {
  counseling: "bg-blue-50 text-blue-700 border-blue-100",
  corporate: "bg-purple-50 text-purple-700 border-purple-100",
  institutional: "bg-amber-50 text-amber-700 border-amber-100",
  course: "bg-green-50 text-green-700 border-green-100",
  general: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function ContactsPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const adminSlug = params.adminSlug as string;
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  function load() {
    setLoading(true);
    fetch(`/api/admin/${company}/contacts`, { credentials: "same-origin" })
      .then((r) => {
        if (r.status === 401) { router.replace(`/webapplication/${company}/${adminSlug}/login`); throw new Error("401"); }
        return r.json();
      })
      .then((d) => { if (d.success) setContacts(d.data); })
      .catch((e) => { if (e.message !== "401") toast("Failed to load contacts.", "error"); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [company]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this contact submission?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/${company}/contacts?id=${id}`, { method: "DELETE", credentials: "same-origin" });
      const data = await res.json();
      if (data.success) {
        setContacts((p) => p.filter((c) => c.id !== id));
        toast("Submission deleted.", "success");
      } else {
        toast(data.error || "Delete failed.", "error");
      }
    } catch {
      toast("Network error.", "error");
    } finally {
      setDeleting(null);
    }
  }

  const types = ["all", ...Array.from(new Set(contacts.map((c) => c.inquiryType || "general")))];
  const filtered = filter === "all" ? contacts : contacts.filter((c) => (c.inquiryType || "general") === filter);

  return (
    <div className="space-y-5 pb-10">
      <PageHeader
        title="Contact Submissions"
        subtitle={`${contacts.length} total enquir${contacts.length === 1 ? "y" : "ies"} received.`}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors capitalize ${
                filter === t
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-red-400 hover:text-red-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button onClick={load} className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">No submissions yet</p>
          <p className="text-slate-400 text-sm mt-1">Contact form submissions will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <p className="font-bold text-slate-800">{c.name}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${BADGE[c.inquiryType || "general"] ?? BADGE.general}`}>
                    {c.inquiryType || "general"}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="text-xs text-slate-400">{new Date(c.submittedAt).toLocaleString("en-IN")}</p>
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deleting === c.id}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm mb-3">
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-slate-600 hover:text-red-600 transition-colors">
                    <Phone className="w-3.5 h-3.5" /> {c.phone}
                  </a>
                )}
                {c.email && (
                  <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-slate-600 hover:text-red-600 transition-colors">
                    <Mail className="w-3.5 h-3.5" /> {c.email}
                  </a>
                )}
                {c.city && (
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5" /> {c.city}
                  </span>
                )}
                {c.phone && (
                  <a
                    href={`https://wa.me/${c.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Hi " + c.name + ", thank you for your enquiry at Cyber A1 Academy!")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-green-600 hover:text-green-700 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                )}
              </div>

              {(c.program || c.company) && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {c.program && <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{c.program}</span>}
                  {c.company && <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{c.company}</span>}
                </div>
              )}
              {c.message && (
                <p className="text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3 mt-2">{c.message}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}