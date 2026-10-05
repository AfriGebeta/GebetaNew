export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { hasSession } from "@/lib/downloads/auth";
import { initDownloadTables, readDownloadStats } from "@/lib/downloads/db";

export async function GET(req: NextRequest) {
  if (!(await hasSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const days = parseInt(req.nextUrl.searchParams.get("days") ?? "30", 10);
  await initDownloadTables();
  return NextResponse.json(await readDownloadStats(Number.isFinite(days) ? days : 30));
}
