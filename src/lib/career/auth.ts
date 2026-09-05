import { SignJWT, jwtVerify } from "jose";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.CAREER_JWT_SECRET ?? "career-secret-fallback-change-me"
);

const SESSION_COOKIE = "career_session";
const MAGIC_COOKIE = "career_magic";

export const ADMIN_USERNAME = process.env.CAREER_ADMIN_USERNAME ?? "admin";
export const ADMIN_PASSWORD = process.env.CAREER_ADMIN_PASSWORD ?? "admin123";
export const ADMIN_EMAIL = process.env.CAREER_ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_EMAIL_USER ?? "";

export async function signMagicToken(username: string): Promise<string> {
  return new SignJWT({ username, type: "magic" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

export async function verifyMagicToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== "magic") return null;
    return payload.username as string;
  } catch {
    return null;
  }
}

export async function signSessionToken(username: string): Promise<string> {
  return new SignJWT({ username, type: "session" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function getSessionUser(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== "session") return null;
    return payload.username as string;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  };
}

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    maxAge: 0,
    path: "/",
  };
}

export async function sendMagicLink(to: string, token: string, baseUrl: string) {
  const link = `${baseUrl}/api/career/auth/verify?token=${encodeURIComponent(token)}`;

  if (process.env.NODE_ENV !== "production") {
    console.log("\n🔗 [Career Admin] Magic login link (dev only):\n" + link + "\n");
  }

  const emailUser = process.env.EMAIL_USERNAME ?? "";
  const emailPass = process.env.EMAIL_PASS ?? "";
  const emailHost = process.env.EMAIL_HOST ?? "smtp.gmail.com";
  const emailPort = parseInt(process.env.EMAIL_PORT ?? "587", 10);

  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465,
    auth: { user: emailUser, pass: emailPass },
  });

  await transporter.sendMail({
    from: `"GebetaMaps Certificates" <${emailUser}>`,
    to,
    subject: "Admin Login — GebetaMaps Certificate Portal",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:8px;border:1px solid #e5e7eb">
        <h2 style="color:#1a1a1a;margin-bottom:8px">GebetaMaps Certificate Portal</h2>
        <p style="color:#6b7280;margin-bottom:24px">Click the button below to log in. This link expires in 15 minutes.</p>
        <a href="${link}" style="display:inline-block;background:#8B6914;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600">Login to Admin Portal</a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}
