"use client";
import { useState, useCallback, useRef } from "react";
import {
  Plus, Trash2, Edit2, CheckCircle2, AlertCircle, X,
  Eye, EyeOff, ExternalLink, UserCheck, Upload, Loader2,
} from "lucide-react";
import type { Trainer, TrainerCertBadge } from "@/types/cms";

type Status = "published" | "draft" | "archived";

interface Props {
  company: string;
  initialTrainers: Trainer[];
}

const STATUS_BADGE: Record<Status, string> = {
  published: "bg-green-50 text-green-700 border-green-200",
  draft:     "bg-yellow-50 text-yellow-700 border-yellow-200",
  archived:  "bg-slate-50 text-slate-500 border-slate-200",
};

const EMPTY_FORM = {
  name: "", slug: "", designation: "", specialization: "",
  bio: "", experience: "", certifications: "", expertise: "",
  imageUrl: "", linkedIn: "", github: "", twitter: "", courses: "",
  isFeatured: false, status: "draft" as Status, order: 0,
  certBadges: [] as TrainerCertBadge[],
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function TrainerManagement({ company, initialTrainers }: Props) {
  const [trainers, setTrainers] = useState<Trainer[]>(initialTrainers);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [badgeUploading, setBadgeUploading] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const badgeFileInputRef = useRef<HTMLInputElement>(null);
  const badgeUploadIndexRef = useRef<number>(-1);

  const flash = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (t: Trainer) => {
    setEditId(t.id);
    setForm({
      name: t.name,
      slug: t.slug,
      designation: t.designation,
      specialization: t.specialization,
      bio: t.bio,
      experience: t.experience,
      certifications: t.certifications.join(", "),
      expertise: (t.expertise ?? []).join(", "),
      imageUrl: t.imageUrl,
      linkedIn: t.linkedIn ?? "",
      github: t.github ?? "",
      twitter: t.twitter ?? "",
      courses: (t.courses ?? []).join(", "),
      isFeatured: t.isFeatured,
      status: t.status as Status,
      order: t.order,
      certBadges: t.certBadges ? [...t.certBadges] : [],
    });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditId(null); };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        certifications: form.certifications.split(",").map(s => s.trim()).filter(Boolean),
        expertise: form.expertise.split(",").map(s => s.trim()).filter(Boolean),
        courses: form.courses.split(",").map(s => s.trim()).filter(Boolean),
      };
      const url = editId
        ? `/api/admin/${company}/trainers/${editId}`
        : `/api/admin/${company}/trainers`;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        flash("success", editId ? "Trainer updated." : "Trainer created.");
        setTrainers(prev =>
          editId
            ? prev.map(t => t.id === editId ? data.data : t)
            : [...prev, data.data]
        );
        closeForm();
      } else {
        flash("error", data.error ?? "Failed to save.");
      }
    } catch {
      flash("error", "Network error.");
    } finally {
      setSaving(false);
    }
  }, [form, editId, company]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/${company}/trainers/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (data.success) {
        flash("success", "Trainer deleted.");
        setTrainers(prev => prev.filter(t => t.id !== id));
        setDeleteId(null);
      } else {
        flash("error", data.error ?? "Failed to delete.");
      }
    } catch {
      flash("error", "Network error.");
    }
  }, [company]);

  const toggleFeatured = useCallback(async (t: Trainer) => {
    const res = await fetch(`/api/admin/${company}/trainers/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ isFeatured: !t.isFeatured }),
    });
    const data = await res.json();
    if (data.success) setTrainers(prev => prev.map(tr => tr.id === t.id ? data.data : tr));
  }, [company]);

  const handlePhotoUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "trainers");
      fd.append("type", "image");
      const res = await fetch(`/api/admin/${company}/upload`, {
        method: "POST",
        credentials: "same-origin",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, imageUrl: data.url }));
      } else {
        flash("error", data.error ?? "Upload failed.");
      }
    } catch {
      flash("error", "Upload failed — network error.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [company]);

  const handleBadgeLogoUpload = useCallback(async (file: File, index: number) => {
    setBadgeUploading(index);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "trainers/certbadges");
      fd.append("type", "image");
      const res = await fetch(`/api/admin/${company}/upload`, {
        method: "POST",
        credentials: "same-origin",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setForm(prev => {
          const badges = [...prev.certBadges];
          badges[index] = { ...badges[index], logoUrl: data.url };
          return { ...prev, certBadges: badges };
        });
      } else {
        flash("error", data.error ?? "Badge upload failed.");
      }
    } catch {
      flash("error", "Badge upload failed.");
    } finally {
      setBadgeUploading(null);
      if (badgeFileInputRef.current) badgeFileInputRef.current.value = "";
    }
  }, [company]);

  const addBadge = () => {
    setForm(prev => ({ ...prev, certBadges: [...prev.certBadges, { name: "", logoUrl: "" }] }));
  };

  const removeBadge = (i: number) => {
    setForm(prev => ({ ...prev, certBadges: prev.certBadges.filter((_, idx) => idx !== i) }));
  };

  const updateBadgeName = (i: number, name: string) => {
    setForm(prev => {
      const badges = [...prev.certBadges];
      badges[i] = { ...badges[i], name };
      return { ...prev, certBadges: badges };
    });
  };

  return (
    <div className="space-y-5">
      {/* Flash message */}
      {msg && (
        <div className={`flex items-center gap-2.5 p-3.5 rounded-xl text-sm border ${
          msg.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{trainers.length} trainer{trainers.length !== 1 ? "s" : ""}</p>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Trainer
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {trainers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No trainers yet. Click "Add Trainer" to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                {trainer.imageUrl ? (
                  <img src={trainer.imageUrl} alt={trainer.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-200" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {trainer.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800">{trainer.name}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_BADGE[trainer.status as Status]}`}>
                      {trainer.status}
                    </span>
                    {trainer.isFeatured && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Featured</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{trainer.designation} · {trainer.experience}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleFeatured(trainer)}
                    title={trainer.isFeatured ? "Remove from featured" : "Mark as featured"}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      trainer.isFeatured ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                    }`}>
                    {trainer.isFeatured ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <a href={`/trainers/${trainer.slug}`} target="_blank" rel="noopener noreferrer"
                    title="View public profile"
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button onClick={() => openEdit(trainer)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(trainer.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="text-base font-bold text-slate-800">{editId ? "Edit Trainer" : "Add New Trainer"}</h2>
              <button onClick={closeForm} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name *">
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: editId ? form.slug : slugify(e.target.value) })}
                    className={INPUT} placeholder="e.g. Rahul Sharma" />
                </Field>
                <Field label="Slug *">
                  <input required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.replace(/[^a-z0-9-]/g, "") })}
                    className={INPUT} placeholder="e.g. rahul-sharma" />
                </Field>
                <Field label="Designation *">
                  <input required value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })}
                    className={INPUT} placeholder="e.g. Senior Penetration Tester" />
                </Field>
                <Field label="Specialization *">
                  <input required value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}
                    className={INPUT} placeholder="e.g. VAPT & Red Teaming" />
                </Field>
                <Field label="Experience *">
                  <input required value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}
                    className={INPUT} placeholder="e.g. 8+ Years" />
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Status })} className={INPUT}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </Field>
              </div>

              <Field label="Bio *">
                <textarea required rows={4} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                  className={INPUT} placeholder="Professional background and teaching approach..." />
              </Field>

              <Field label="Certifications (comma-separated)">
                <input value={form.certifications} onChange={e => setForm({ ...form, certifications: e.target.value })}
                  className={INPUT} placeholder="e.g. OSCP, CEH, CRTP" />
              </Field>

              <Field label="Expertise Bullets (comma-separated)">
                <input value={form.expertise} onChange={e => setForm({ ...form, expertise: e.target.value })}
                  className={INPUT} placeholder="e.g. Penetration Testing, Red Teaming, VAPT" />
              </Field>

              {/* ── Certification Badges ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-semibold text-slate-600">Certification Badges (with logos)</label>
                  <button type="button" onClick={addBadge}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add Badge
                  </button>
                </div>
                {form.certBadges.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No badges yet. Click "Add Badge" to add certification logos.</p>
                ) : (
                  <div className="space-y-2">
                    {form.certBadges.map((badge, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                        {/* Logo preview / upload */}
                        <div className="flex-shrink-0">
                          {badge.logoUrl ? (
                            <img src={badge.logoUrl} alt={badge.name}
                              className="w-10 h-10 rounded-md object-contain border border-slate-200 bg-white p-0.5" />
                          ) : (
                            <div className="w-10 h-10 rounded-md border-2 border-dashed border-slate-300 flex items-center justify-center bg-white">
                              <Upload className="w-4 h-4 text-slate-300" />
                            </div>
                          )}
                        </div>
                        {/* Name input */}
                        <input
                          value={badge.name}
                          onChange={e => updateBadgeName(i, e.target.value)}
                          placeholder="Badge name (e.g. CEH)"
                          className="flex-1 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-white"
                        />
                        {/* Upload button */}
                        <button
                          type="button"
                          disabled={badgeUploading === i}
                          onClick={() => {
                            badgeUploadIndexRef.current = i;
                            badgeFileInputRef.current?.click();
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-white transition-colors disabled:opacity-50 flex-shrink-0"
                        >
                          {badgeUploading === i
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Upload className="w-3.5 h-3.5" />
                          }
                          {badge.logoUrl ? "Replace" : "Upload"}
                        </button>
                        {/* Remove */}
                        <button type="button" onClick={() => removeBadge(i)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Hidden badge file input */}
                <input
                  ref={badgeFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file && badgeUploadIndexRef.current >= 0) {
                      handleBadgeLogoUpload(file, badgeUploadIndexRef.current);
                    }
                  }}
                />
              </div>

              <Field label="Programme Slugs (comma-separated)">
                <input value={form.courses} onChange={e => setForm({ ...form, courses: e.target.value })}
                  className={INPUT} placeholder="e.g. cceh-certified-ethical-hacker, soc-analyst-program" />
              </Field>

              {/* Photo upload */}
              <Field label="Trainer Photo">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {form.imageUrl ? (
                      <img src={form.imageUrl} alt="Preview"
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {form.name ? form.name.split(" ").map(w => w[0]).join("").slice(0, 2) : "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(file);
                      }}
                    />
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {uploading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                        : <><Upload className="w-4 h-4" /> {form.imageUrl ? "Replace Photo" : "Upload Photo"}</>
                      }
                    </button>
                    {form.imageUrl && (
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, imageUrl: "" }))}
                        className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors">
                        <X className="w-3 h-3" /> Remove photo
                      </button>
                    )}
                    <p className="text-xs text-slate-400">JPG, PNG, WebP, GIF or SVG · Max 5 MB</p>
                  </div>
                </div>
              </Field>

              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="LinkedIn URL">
                  <input value={form.linkedIn} onChange={e => setForm({ ...form, linkedIn: e.target.value })}
                    className={INPUT} placeholder="https://linkedin.com/in/..." />
                </Field>
                <Field label="GitHub URL">
                  <input value={form.github} onChange={e => setForm({ ...form, github: e.target.value })}
                    className={INPUT} placeholder="https://github.com/..." />
                </Field>
                <Field label="Twitter URL">
                  <input value={form.twitter} onChange={e => setForm({ ...form, twitter: e.target.value })}
                    className={INPUT} placeholder="https://twitter.com/..." />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Display Order">
                  <input type="number" min={0} value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                    className={INPUT} />
                </Field>
                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="featured" checked={form.isFeatured}
                    onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-red-600" />
                  <label htmlFor="featured" className="text-sm font-medium text-slate-700">
                    Show on homepage (featured)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm}
                  className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50">
                  {saving ? "Saving…" : editId ? "Update Trainer" : "Create Trainer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold text-slate-800 mb-2">Delete Trainer?</h3>
            <p className="text-sm text-slate-500 mb-5">This will remove the trainer profile permanently. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const INPUT = "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-colors bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
