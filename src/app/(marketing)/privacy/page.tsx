import type { Metadata } from "next";
import LegalPage from "@/components/marketing/legal-page";
import { MDXComponents } from "@/app/(marketing)/blog/_components/MDXComponent";
import { PRIVACY } from "@/constants/legal";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: PRIVACY.description,
    alternates: { canonical: "/privacy" },
};

const { h2: H2, p: P, ul: Ul, li: Li } = MDXComponents;

export default function PrivacyPolicy() {
    return (
        <LegalPage current="/privacy" title={PRIVACY.title} description={PRIVACY.description}>
            <div className="[&>section:first-child>h2]:mt-0">
                {PRIVACY.sections.map((section) => (
                    <section key={section.title}>
                        <H2>{section.title}</H2>
                        <P>{section.body}</P>
                        {section.list && (
                            <Ul>
                                {section.list.map((item) => (
                                    <Li key={item}>{item}</Li>
                                ))}
                            </Ul>
                        )}
                    </section>
                ))}
            </div>
        </LegalPage>
    );
}
