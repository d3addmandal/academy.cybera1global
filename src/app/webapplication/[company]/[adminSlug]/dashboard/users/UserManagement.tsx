"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Users, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, X,
  Eye, EyeOff, UserCheck, UserX, Shield, BookOpen, BarChart3,
} from "lucide-react";
import type { UserRole } from "@/types/cms";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

const ROLE_META: Record<string, { label: string; color: string; icon: React.ElementType; desc: string }> = {
  admin:   { label: "Admin",  color: "bg-red-50 text-red-700 border-red-200",    icon: Shield,   desc: "Full access. Can delete published content." },
  editor:  { label: "Editor", color: "bg-blue-50 text-blue-700 border-blue-200", icon: BookOpen, desc: "Can manage programmes and blog posts." },
  sales:   { label: "Sales",  color: "bg-green-50 text-green-700 border-green-200", icon: BarChart3, desc: "Can create and edit blog posts only." },
};

const ROLES: UserRole[] = ["admin", "editor", "sales"];

interface Props {
  company: string;
  adminSlug: string;
  currentUserId: string;
}

export default function UserManagement({ company, adminSlug, currentUserId }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Create form state
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", role: "editor" as UserRole });
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);

  // Edit modal state
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "editor" as UserRole, isActive: true });
  const [saving, setSaving] = useState(false);

  const flash = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${company}/users`, { credentials: "same-origin" });
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } finally {
      setLoading(false);
    }
  }, [company]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ── Create user ─────────────────────────────────────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch(`/api/admin/${company}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.success) {
        flash("success", `User "${createForm.name}" created successfully.`);
        setShowCreate(false);
        setCreateForm({ name: "", email: "", password: "", role: "editor" });
        loadUsers();
      } else {
        flash("error", data.error ?? "Failed to create user.");
      }
    } catch {
      flash("error", "Network error.");
    } finally {
      setCreating(false);
    }
  }

  // ── Edit user ────────────────────────────────────────────────────────────────
  function openEdit(user: User) {
    setEditUser(user);
    setEditForm({ name: user.name, role: user.role, isActive: user.isActive });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/${company}/users/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        flash("success", "User updated.");
        setEditUser(null);
        loadUsers();
      } else {
        flash("error", data.error ?? "Failed to update user.");
      }
    } catch {
      flash("error", "Network error.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete user ──────────────────────────────────────────────────────────────
  async function handleDelete(user: User) {
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/${company}/users/${user.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (data.success) {
        flash("success", `User "${user.name}" deleted.`);
        loadUsers();
      } else {
        flash("error", data.error ?? "Failed to delete user.");
      }
    } catch {
      flash("error", "Network error.");
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">User Accounts</h2>
            <p className="text-xs text-slate-400">{users.length} user{users.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-500 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`mx-6 mt-4 flex items-start gap-2.5 p-3.5 rounded-lg text-sm border ${
          msg.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* User list */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading…</div>
      ) : (
        <div className="divide-y divide-slate-50">
          {users.map((user) => {
            const meta = ROLE_META[user.role] ?? ROLE_META.editor;
            const RoleIcon = meta.icon;
            const isSelf = user.id === currentUserId;
            return (
              <div key={user.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 text-slate-600 font-bold text-sm uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                    {isSelf && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">You</span>}
                    {!user.isActive && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">Inactive</span>}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
                <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.color}`}>
                  <RoleIcon className="w-3 h-3" />
                  {meta.label}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(user)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Edit user"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {!isSelf && (
                    <button
                      onClick={() => handleDelete(user)}
                      className="p-1.5 rounded-lg text-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Role legend */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Role Permissions</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {Object.entries(ROLE_META).map(([key, meta]) => {
            const Icon = meta.icon;
            return (
              <div key={key} className="flex items-start gap-2.5">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${meta.color}`}>
                  <Icon className="w-3 h-3" />{meta.label}
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">{meta.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Create User Modal ────────────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Create New User</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                <input
                  type="text" required value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                <input
                  type="email" required value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="rahul@example.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"} required minLength={8} value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Min. 8 characters"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-colors"
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-white transition-colors"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_META[r]?.label ?? r} — {ROLE_META[r]?.desc}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 bg-red-600 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-red-500 disabled:opacity-50 transition-colors">
                  {creating ? "Creating…" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ──────────────────────────────────────────────────── */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Edit User</h3>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                <input
                  type="text" required value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-white transition-colors"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_META[r]?.label ?? r}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1.5">{ROLE_META[editForm.role]?.desc}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Account Status</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isActive: true })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${editForm.isActive ? "bg-green-50 border-green-300 text-green-700" : "border-slate-200 text-slate-400 hover:bg-slate-50"}`}
                  >
                    <UserCheck className="w-4 h-4" /> Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isActive: false })}
                    disabled={editUser.id === currentUserId}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${!editForm.isActive ? "bg-red-50 border-red-300 text-red-700" : "border-slate-200 text-slate-400 hover:bg-slate-50"}`}
                  >
                    <UserX className="w-4 h-4" /> Inactive
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditUser(null)}
                  className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-red-600 text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-red-500 disabled:opacity-50 transition-colors">
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
