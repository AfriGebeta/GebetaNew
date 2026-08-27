export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/career/auth";
import { readInterns } from "@/lib/career/db";
import { initCareerTables } from "@/lib/career/neon";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/career/admin");
  await initCareerTables();
  const interns = await readInterns();
  return <DashboardClient initialInterns={interns} />;
}
