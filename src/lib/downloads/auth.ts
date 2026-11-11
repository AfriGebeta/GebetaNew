import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "download_stats_session";

function secret() {
  return new TextEncoder().encode(
    process.env.DOWNLOAD_STATS_SECRET ?? process.env.DOWNLOAD_STATS_PASSWORD ?? "change-me"
  );
}

export function checkPassword(password: string) {
  const expected = process.env.DOWNLOAD_STATS_PASSWORD;
  if (!expected) return false;
  return password === expected;
}

export async function signSession(): Promise<string> {
  return new SignJWT({ scope: "download-stats" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret());
}

export async function hasSession(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.scope === "download-stats";
  } catch {
    return false;
  }
}

export function sessionCookie(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  };
}

export function clearCookie() {
  return { name: SESSION_COOKIE, value: "", httpOnly: true, maxAge: 0, path: "/" };
}
