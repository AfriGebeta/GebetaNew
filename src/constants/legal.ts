/** Legal pages: navigation between them, and the privacy policy's text. Terms come from the API as markdown. */

export const LEGAL_PAGES = [
    { href: "/privacy", label: "Privacy policy" },
    { href: "/terms", label: "Terms of service" },
] as const;

/** Where the terms markdown is served; the environment can point it at another gateway. */
export const TERMS_URL = `${process.env.NEXT_PUBLIC_GATEWAY_URL ?? "https://mapapi.gebeta.app"}/terms`;

export const TERMS = {
    title: "Terms of service",
    description: "The terms governing use of the GebetaMaps website, APIs and developer services.",
};

type LegalSection = { title: string; body: string; list?: string[] };

export const PRIVACY = {
    title: "Privacy policy",
    description: "How GebetaMaps collects, uses and protects your data across our website and location APIs.",
    sections: [
        {
            title: "Introduction",
            body: "At Gebeta Software Private Limited Company, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose your personal information when you use our services, including the Gebeta Map API.",
        },
        {
            title: "Information We Collect",
            body: "We collect various types of information in connection with the services we provide:",
            list: [
                "Personal Information: Includes your name, email address, phone number, and other information you provide when registering or using our services.",
                "Usage Information: Data about how you interact with our services, such as IP address, device information, and browsing activity.",
                "Cookies and Tracking Technologies: We use cookies to enhance your experience on our site. You can manage cookie preferences in your browser settings.",
            ],
        },
        {
            title: "How We Use Your Information",
            body: "We may use your personal information to:",
            list: [
                "Provide, operate, and maintain our services.",
                "Improve, personalize, and expand our services.",
                "Understand and analyze how you use our services.",
                "Communicate with you to provide updates, offers, and promotional content.",
                "Comply with legal obligations and resolve any disputes.",
            ],
        },
        {
            title: "Sharing of Information",
            body: "We do not share your personal information with third parties except in the following circumstances:",
            list: [
                "With your consent.",
                "To comply with legal requirements, such as a court order or subpoena.",
                "To protect the rights, property, or safety of Gebeta Software or others.",
                "In connection with a merger, acquisition, or sale of all or a portion of our assets.",
            ],
        },
        {
            title: "Data Security",
            body: "We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, or misuse. However, no method of data transmission or storage is completely secure, and we cannot guarantee the absolute security of your information.",
        },
        {
            title: "Retention of Information",
            body: "We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.",
        },
        {
            title: "Your Rights",
            body: "You have the right to access, correct, or delete your personal information. You can also object to certain processing activities or request that we restrict the processing of your personal data. To exercise your rights, please contact us at the provided contact information.",
        },
        {
            title: "Children's Privacy",
            body: "Our services are not intended for use by children under the age of 13. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child under 13, we will take steps to delete that information as soon as possible.",
        },
        {
            title: "Changes to This Privacy Policy",
            body: 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top of the Privacy Policy. You are advised to review this Privacy Policy periodically for any changes.',
        },
        {
            title: "Contact Us",
            body: "If you have any questions about this Privacy Policy, please contact us using the contact information provided on our website.",
        },
    ] satisfies LegalSection[],
};
