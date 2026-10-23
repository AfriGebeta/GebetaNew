import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import LegalPage from "@/components/marketing/legal-page";
import { MDXComponents } from "@/app/(marketing)/blog/_components/MDXComponent";
import { TERMS, TERMS_URL } from "@/constants/legal";

interface TermsResponse {
    content: string;
    contentType: string;
    locale: string;
}

export const metadata: Metadata = {
    title: "Terms of Service",
    description: TERMS.description,
    alternates: { canonical: "/terms" },
};

export const revalidate = 3600;

/** The markdown opens with its own "# Terms…" title and a bold "Last updated" line; the page header shows both. */
function splitHeader(markdown: string) {
    const updated = markdown.match(/^\*\*Last updated:\s*(.+?)\*\*\s*$/m)?.[1];
    const body = markdown
        .replace(/^\s*#\s[^\n]*\n/, "")
        .replace(/^\*\*Last updated:[^\n]*\n/m, "")
        .trimStart();
    return { updated, body };
}

export default async function Terms() {
    const res = await fetch(TERMS_URL, { next: { revalidate } });
    if (!res.ok) throw new Error("Failed to fetch terms");
    const data: TermsResponse = await res.json();
    const { updated, body } = splitHeader(data.content);

    return (
        <LegalPage current="/terms" title={TERMS.title} description={TERMS.description} updated={updated}>
            <div className="[&>h2:first-child]:mt-0">
                <MDXRemote source={body} components={MDXComponents} />
            </div>
        </LegalPage>
    );
}
