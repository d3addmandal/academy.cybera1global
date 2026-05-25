import { getAuthFromCookies } from "@/lib/auth";
import { trainersDb } from "@/lib/db";
import { isAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/FormField";
import TrainerManagement from "./TrainerManagement";

export default async function TrainersPage({
  params,
}: {
  params: Promise<{ company: string; adminSlug: string }>;
}) {
  const { company, adminSlug } = await params;
  const auth = await getAuthFromCookies();
  if (!auth || !isAdmin(auth.role)) {
    redirect(`/webapplication/${company}/${adminSlug}/dashboard`);
  }

  const trainers = trainersDb.getAll(company);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trainers"
        subtitle="Add, edit, and manage trainer profiles. Published trainers appear on the homepage and /trainers page."
      />
      <TrainerManagement company={company} initialTrainers={trainers} />
    </div>
  );
}
