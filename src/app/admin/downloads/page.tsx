export const dynamic = "force-dynamic";

import { hasSession } from "@/lib/downloads/auth";
import { initDownloadTables, readDownloadStats } from "@/lib/downloads/db";
import DownloadsClient from "./DownloadsClient";
import LoginClient from "./LoginClient";

export default async function DownloadsPage() {
  if (!(await hasSession())) return <LoginClient />;

  await initDownloadTables();
  const stats = await readDownloadStats(30);
  return <DownloadsClient initialStats={stats} />;
}
