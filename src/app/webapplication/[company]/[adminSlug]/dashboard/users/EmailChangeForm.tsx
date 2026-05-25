"use client";
import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function EmailChangeForm({ company, userId }: { company: string; userId: string }) {
  const [form, setForm] = useState({ email: "", currentPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: "Email updated successfully." });
        setForm({ email: "", currentPassword: "" });
      } else {
        setMsg({ type: "error", text: data.error ?? "Failed to update email." });
      }
    } catch {
      setMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
          <Mail className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Change Email</h2>
          <p className="text-xs text-slate-400">Your password is required to confirm the email change.</p>
        </div>
      </div>

      {msg && (
        <div className={`mb-5 flex items-start gap-2.5 p-3.5 rounded-lg text-sm border ${
          msg.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Email Address</label>
          <input
            type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="new@example.com"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Current Password</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"} required value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              placeholder="Confirm with your current password"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-colors"
            />
            <button type="button" tabIndex={-1} onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={saving}
          className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {saving ? "Updating…" : "Update Email"}
        </button>
      </form>
    </div>
  );
}
