export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getSessionUser } from "@/lib/career/auth";
import { readInterns } from "@/lib/career/db";
import { emailLayout } from "@/lib/career/email-layout";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subject, message } = await req.json();
  if (!subject || !message) {
    return NextResponse.json({ error: "subject and message are required" }, { status: 400 });
  }

  const interns = await readInterns();
  const recipients = interns.filter((i) => i.email);
  if (recipients.length === 0) {
    return NextResponse.json({ error: "No interns with email addresses found" }, { status: 400 });
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

  function resolve(text: string, intern: { name: string; role: string; slug: string; presentedOn: string }) {
    const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://gebetamaps.com";
    return text
      .replaceAll("{{name}}", intern.name)
      .replaceAll("{{role}}", intern.role)
      .replaceAll("{{certUrl}}", `${baseUrl}/career/${intern.slug}`)
      .replaceAll("{{date}}", intern.presentedOn);
  }

  const errors: string[] = [];
  for (const intern of recipients) {
    const resolvedSubject = resolve(subject, intern);
    const resolvedMessage = resolve(message, intern);
    try {
      const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://gebetamaps.com";
      const certUrl = `${baseUrl}/career/${intern.slug}`;
      await transporter.sendMail({
        from: `"GebetaMaps" <${emailUser}>`,
        to: intern.email,
        subject: resolvedSubject,
        html: emailLayout({
          body: `<div style="color:#374151;line-height:1.7;">${resolvedMessage}</div>`,
          ctaUrl: certUrl,
          ctaLabel: "View Your Certificate",
        }),
      });
    } catch {
      errors.push(intern.email);
    }
  }

  return NextResponse.json({
    success: true,
    sent: recipients.length - errors.length,
    failed: errors.length,
    total: recipients.length,
  });
}
