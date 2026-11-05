export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/career/auth";
import { readInterns, readTemplates } from "@/lib/career/db";
import { initCareerTables } from "@/lib/career/neon";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/career/admin");
  await initCareerTables();
  const [interns, templates] = await Promise.all([readInterns(), readTemplates()]);
  return <DashboardClient initialInterns={interns} initialTemplates={templates} />;
}
