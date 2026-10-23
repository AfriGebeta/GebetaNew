export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { checkPassword, clearCookie, sessionCookie, signSession } from "@/lib/downloads/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));

  if (!process.env.DOWNLOAD_STATS_PASSWORD) {
    return NextResponse.json({ error: "DOWNLOAD_STATS_PASSWORD is not set" }, { status: 500 });
  }
  if (!checkPassword(password ?? "")) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie(await signSession()));
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(clearCookie());
  return res;
}
