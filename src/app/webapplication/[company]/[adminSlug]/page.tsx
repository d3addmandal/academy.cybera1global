import { redirect } from "next/navigation";
import { getAuthFromCookies } from "@/lib/auth";

interface Props { params: Promise<{ company: string; adminSlug: string }> }

export default async function AdminRoot({ params }: Props) {
  const { company, adminSlug } = await params;
  const auth = await getAuthFromCookies();
  if (auth && auth.companySlug === company) {
    redirect(`/webapplication/${company}/${adminSlug}/dashboard`);
  }
  redirect(`/webapplication/${company}/${adminSlug}/login`);
}
