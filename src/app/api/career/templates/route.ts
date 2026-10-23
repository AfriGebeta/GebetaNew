export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { readTemplates, createTemplate } from "@/lib/career/db";
import { getSessionUser } from "@/lib/career/auth";
import { initCareerTables } from "@/lib/career/neon";

export async function GET() {
  await initCareerTables();
  return NextResponse.json(await readTemplates());
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { label, subject, body, sortOrder } = await req.json();
  if (!label) return NextResponse.json({ error: "label is required" }, { status: 400 });

  await initCareerTables();
  const tpl = await createTemplate({ label, subject: subject ?? "", body: body ?? "", sortOrder: sortOrder ?? 0 });
  return NextResponse.json(tpl, { status: 201 });
}
