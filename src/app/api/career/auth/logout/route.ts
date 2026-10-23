export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/career/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(clearSessionCookie());
  return response;
}
