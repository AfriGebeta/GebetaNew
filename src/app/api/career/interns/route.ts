export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { readInterns, createIntern } from "@/lib/career/db";
import { generateUniqueSlug } from "@/lib/career/slugify";
import { getSessionUser } from "@/lib/career/auth";
import { initCareerTables } from "@/lib/career/neon";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await initCareerTables();
  return NextResponse.json(await readInterns());
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, role, presentedOn } = body;

  if (!name || !role) {
    return NextResponse.json({ error: "name and role are required" }, { status: 400 });
  }

  await initCareerTables();

  const formattedDate = presentedOn
    ? new Date(presentedOn)
        .toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
        .toUpperCase()
    : new Date()
        .toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
        .toUpperCase();

  const slug = await generateUniqueSlug(name);
  const intern = await createIntern({ name, slug, role, presentedOn: formattedDate });

  return NextResponse.json(intern, { status: 201 });
}
