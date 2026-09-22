import { SignJWT, jwtVerify } from "jose";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";
import { emailLayout } from "@/lib/career/email-layout";

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
    html: emailLayout({
      preheader: "Your admin login link for the GebetaMaps Certificate Portal.",
      body: `
        <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;">Admin Login</h2>
        <p style="margin:0 0 4px;color:#374151;">Click the button below to access the GebetaMaps Certificate Portal. This link expires in 15 minutes.</p>
      `,
      ctaUrl: link,
      ctaLabel: "Login to Admin Portal",
      footerNote: "If you didn't request this, you can safely ignore this email.",
    }),
  });
}
