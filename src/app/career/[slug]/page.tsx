export const dynamic = "force-dynamic";

import { cache } from "react";
import { notFound } from "next/navigation";
import { getInternBySlug, readConfig } from "@/lib/career/db";
import { initCareerTables } from "@/lib/career/neon";
import CertificateView from "./CertificateView";

// Shared by generateMetadata and the page so the intern is fetched once per request.
const getIntern = cache(async (slug: string) => {
  await initCareerTables();
  return getInternBySlug(slug);
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const intern = await getIntern(slug);
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
  const [intern, config] = await Promise.all([getIntern(slug), readConfig()]);
  if (!intern) notFound();
  return <CertificateView intern={intern} config={config} />;
}
