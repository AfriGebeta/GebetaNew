export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/career/auth";
import { readConfig } from "@/lib/career/db";
import { initCareerTables } from "@/lib/career/neon";
import ConfigClient from "./ConfigClient";

export default async function ConfigPage() {
  const user = await getSessionUser();
  if (!user) redirect("/career/admin");
  await initCareerTables();
  const config = await readConfig();
  return <ConfigClient initialConfig={config} />;
}
