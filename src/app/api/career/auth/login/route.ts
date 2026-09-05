export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  ADMIN_EMAIL,
  signMagicToken,
  sendMagicLink,
} from "@/lib/career/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signMagicToken(username);
    const baseUrl = req.nextUrl.origin;

    await sendMagicLink(ADMIN_EMAIL, token, baseUrl);

    return NextResponse.json({ success: true, message: "Check your email for the login link." });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[career/auth/login]", msg);
    return NextResponse.json(
      { error: process.env.NODE_ENV !== "production" ? msg : "Failed to send login link" },
      { status: 500 }
    );
  }
}
