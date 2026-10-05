export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/career/auth";
import { readConfig, readTemplates } from "@/lib/career/db";
import { initCareerTables } from "@/lib/career/neon";
import ConfigClient from "./ConfigClient";

export default async function ConfigPage() {
  const user = await getSessionUser();
  if (!user) redirect("/career/admin");
  await initCareerTables();
  const [config, templates] = await Promise.all([readConfig(), readTemplates()]);
  return <ConfigClient initialConfig={config} initialTemplates={templates} />;
}
