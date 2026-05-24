import { PageHeader } from "@/components/admin/FormField";

export default function UsersPage() {
  return (
    <div>
      <PageHeader title="Users & Roles" subtitle="Manage admin users and their permissions." />
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
          <span className="text-2xl">🔐</span>
        </div>
        <h3 className="font-bold text-slate-800 mb-2">Multi-User Management</h3>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          User roles and permission management will be available in the next release.
          Currently, the admin account is set up via the initial seed.
        </p>
        <div className="mt-6 p-4 bg-slate-50 rounded-xl text-left max-w-sm mx-auto">
          <p className="text-xs font-semibold text-slate-600 mb-1">Current Admin</p>
          <p className="text-sm font-bold text-slate-800">Administrator</p>
          <p className="text-xs text-slate-400">Full access · Role: admin</p>
        </div>
      </div>
    </div>
  );
}
