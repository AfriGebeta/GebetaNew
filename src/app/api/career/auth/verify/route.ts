export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyMagicToken, signSessionToken, sessionCookieOptions, getBaseUrl } from "@/lib/career/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/career/admin?error=missing_token", getBaseUrl(req)));
  }

  const username = await verifyMagicToken(token);
  if (!username) {
    return NextResponse.redirect(new URL("/career/admin?error=invalid_token", getBaseUrl(req)));
  }

  const sessionToken = await signSessionToken(username);
  const response = NextResponse.redirect(new URL("/career/admin/dashboard", getBaseUrl(req)));
  response.cookies.set(sessionCookieOptions(sessionToken));
  return response;
}
