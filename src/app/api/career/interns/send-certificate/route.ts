export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getSessionUser } from "@/lib/career/auth";
import { getInternBySlug } from "@/lib/career/db";
import { emailLayout, htmlToText } from "@/lib/career/email-layout";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { internId, slug, message } = await req.json();
  if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });

  const intern = await getInternBySlug(slug);
  if (!intern) return NextResponse.json({ error: "Intern not found" }, { status: 404 });
  if (!intern.email) return NextResponse.json({ error: "Intern has no email address" }, { status: 400 });

  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://gebetamaps.com";
  const certUrl = `${baseUrl}/career/${intern.slug}`;

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

  const hasMessage = message && message !== "<p></p>";
  const body = `
    <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;">Congratulations, ${intern.name}!</h2>
    <p style="margin:0 0 20px;color:#374151;">We're proud to present you with your GebetaMaps certificate for your work as <strong>${intern.role}</strong>.</p>
    ${hasMessage ? `<div style="margin:0 0 4px;color:#374151;line-height:1.7;">${message}</div>` : ""}
  `;

  const html = emailLayout({
    preheader: `Your certificate for ${intern.role} at GebetaMaps is ready.`,
    body,
    ctaUrl: certUrl,
    ctaLabel: "View Your Certificate",
    footerNote: `You can also copy this link: <a href="${certUrl}" style="color:#1A1A2E;">${certUrl}</a>`,
  });

  await transporter.sendMail({
    from: `"GebetaMaps" <${emailUser}>`,
    to: intern.email,
    subject: `Your GebetaMaps Certificate — ${intern.name}`,
    html,
    text: htmlToText(html),
  });

  return NextResponse.json({ success: true });
}
