import { redirect } from "next/navigation";
import { getAuthFromCookies } from "@/lib/auth";
import { settingsDb } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import { seedCompany } from "@/lib/seed";

interface Props {
  children: React.ReactNode;
  params: Promise<{ company: string; adminSlug: string }>;
}

export default async function DashboardLayout({ children, params }: Props) {
  const { company, adminSlug } = await params;

  // Validate admin slug pattern
  const expectedSlug = `admin-edu-${company}`;
  if (adminSlug !== expectedSlug) {
    redirect(`/webapplication/${company}/admin-edu-${company}/login`);
  }

  // Check auth
  const auth = await getAuthFromCookies();
  if (!auth || auth.companySlug !== company) {
    redirect(`/webapplication/${company}/${adminSlug}/login`);
  }

  // Auto-seed if needed
  const settings = settingsDb.get(company) ?? { companyName: company + " Academy", companySlug: company, updatedAt: "" };

  return (
    <AdminShell
      company={company}
      adminSlug={adminSlug}
      companyName={settings.companyName}
      userName={auth.email.split("@")[0]}
      userEmail={auth.email}
      role={auth.role}
    >
      {children}
    </AdminShell>
  );
}
