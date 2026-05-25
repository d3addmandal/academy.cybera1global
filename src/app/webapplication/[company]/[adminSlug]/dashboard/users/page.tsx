import { getAuthFromCookies } from "@/lib/auth";
import { usersDb, sessionsDb } from "@/lib/db";
import { isAdmin } from "@/lib/permissions";
import { PageHeader } from "@/components/admin/FormField";
import PasswordResetForm from "./PasswordResetForm";
import EmailChangeForm from "./EmailChangeForm";
import UserManagement from "./UserManagement";
import { Shield, Clock, Monitor } from "lucide-react";

const ROLE_BADGE: Record<string, string> = {
  super_admin: "bg-purple-50 text-purple-700 border-purple-100",
  admin:       "bg-red-50 text-red-700 border-red-100",
  editor:      "bg-blue-50 text-blue-700 border-blue-100",
  sales:       "bg-green-50 text-green-700 border-green-100",
  viewer:      "bg-slate-50 text-slate-600 border-slate-200",
};

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  admin:       "Admin",
  editor:      "Editor",
  sales:       "Sales",
  viewer:      "Viewer",
};

export default async function UsersPage({
  params,
}: {
  params: Promise<{ company: string; adminSlug: string }>;
}) {
  const { company, adminSlug } = await params;
  const auth = await getAuthFromCookies();
  const user = auth ? usersDb.getById(company, auth.userId) : null;
  const sessions = auth ? sessionsDb.getAll(company) : [];
  const activeSession = sessions.find((s) => s.userId === auth?.userId);

  const roleBadge = ROLE_BADGE[user?.role ?? "viewer"];
  const roleLabel = ROLE_LABEL[user?.role ?? "viewer"];
  const canManageUsers = auth ? isAdmin(auth.role) : false;

  return (
    <div className="space-y-6">
      <PageHeader
        title={canManageUsers ? "Users & Roles" : "My Profile"}
        subtitle={canManageUsers
          ? "Manage user accounts, roles, and permissions."
          : "View your account details and manage your credentials."}
      />

      {/* ── My Account ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-slate-500" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800">Account Details</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <p className="text-xs text-slate-400 mb-0.5 font-medium">Full Name</p>
            <p className="text-sm font-semibold text-slate-800">{user?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5 font-medium">Email Address</p>
            <p className="text-sm font-semibold text-slate-800">{user?.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1 font-medium">Role</p>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadge}`}>
              {roleLabel}
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5 font-medium">Last Login</p>
            <p className="text-sm text-slate-600">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleString("en-IN") : "—"}
            </p>
          </div>
        </div>

        {activeSession && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Current Session</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 bg-slate-50 rounded-lg p-3">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400">Session Started</p>
                  <p className="text-xs font-semibold text-slate-700">
                    {new Date(activeSession.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              {activeSession.userAgent && (
                <div className="flex items-start gap-2.5 bg-slate-50 rounded-lg p-3">
                  <Monitor className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400">Browser / Device</p>
                    <p className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">
                      {activeSession.userAgent.split(" ").slice(-1)[0] ?? activeSession.userAgent}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Change Email ─────────────────────────────────────────────────────── */}
      {auth && user && (
        <EmailChangeForm company={company} userId={user.id} />
      )}

      {/* ── Change Password ──────────────────────────────────────────────────── */}
      <PasswordResetForm company={company} adminSlug={adminSlug} />

      {/* ── User Management (admin only) ─────────────────────────────────────── */}
      {canManageUsers && auth && (
        <UserManagement
          company={company}
          adminSlug={adminSlug}
          currentUserId={auth.userId}
        />
      )}
    </div>
  );
}
