export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getInternBySlug, readConfig } from "@/lib/career/db";
import { initCareerTables } from "@/lib/career/neon";
import CertificateView from "./CertificateView";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await initCareerTables();
  const intern = await getInternBySlug(slug);
  if (!intern) return { title: "Certificate Not Found" };
  return {
    title: `${intern.name} — Certificate of Achievement`,
    description: `Verified internship certificate for ${intern.name} at GebetaMaps`,
  };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await initCareerTables();
  const [intern, config] = await Promise.all([getInternBySlug(slug), readConfig()]);
  if (!intern) notFound();
  return <CertificateView intern={intern} config={config} />;
}
