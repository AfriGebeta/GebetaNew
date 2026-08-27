import { NextRequest, NextResponse } from "next/server";
import { readConfig, writeConfig } from "@/lib/career/db";
import { getSessionUser } from "@/lib/career/auth";
import { initCareerTables } from "@/lib/career/neon";

export async function GET() {
  await initCareerTables();
  return NextResponse.json(await readConfig());
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await initCareerTables();
  return NextResponse.json(await writeConfig(body));
}
