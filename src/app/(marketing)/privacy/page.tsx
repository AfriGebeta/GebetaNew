import Container from "@/sections/Container";

export default function PrivacyPolicy() {
    return (
        <Container>
            <div>
                <h1 className="text-[48px] text-center text-[#1B1E2B] dark:text-white leading-60 mb-[40px]">
                    Privacy Policy
                </h1>

                <section className="mb-10">
                    <h2 className="text-3xl font-semibold text-[#1B1E2B] dark:text-white mb-4">Introduction</h2>
                    <p className="text-md text-gray-600 dark:text-gray-400 mb-6">
                        At Gebeta Software Private Limited Company, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose your personal information when you use our services, including the Gebeta Map API.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-3xl font-semibold text-[#1B1E2B] dark:text-white mb-4">Information We Collect</h2>
                    <p className="text-md text-gray-600 dark:text-gray-400 mb-6">
                        We collect various types of information in connection with the services we provide:
                    </p>
                    <ul className="list-disc list-inside text-md text-gray-600 dark:text-gray-400 mb-6">
                        <li>Personal Information: Includes your name, email address, phone number, and other information you provide when registering or using our services.</li>
                        <li>Usage Information: Data about how you interact with our services, such as IP address, device information, and browsing activity.</li>
                        <li>Cookies and Tracking Technologies: We use cookies to enhance your experience on our site. You can manage cookie preferences in your browser settings.</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-3xl font-semibold text-[#1B1E2B] dark:text-white mb-4">How We Use Your Information</h2>
                    <p className="text-md text-gray-600 dark:text-gray-400 mb-6">
                        We may use your personal information to:
                    </p>
                    <ul className="list-disc list-inside text-md text-gray-600 dark:text-gray-400 mb-6">
                        <li>Provide, operate, and maintain our services.</li>
                        <li>Improve, personalize, and expand our services.</li>
                        <li>Understand and analyze how you use our services.</li>
                        <li>Communicate with you to provide updates, offers, and promotional content.</li>
                        <li>Comply with legal obligations and resolve any disputes.</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-3xl font-semibold text-[#1B1E2B] dark:text-white mb-4">Sharing of Information</h2>
                    <p className="text-md text-gray-600 dark:text-gray-400 mb-6">
                        We do not share your personal information with third parties except in the following circumstances:
                    </p>
                    <ul className="list-disc list-inside text-md text-gray-600 dark:text-gray-400 mb-6">
                        <li>With your consent.</li>
                        <li>To comply with legal requirements, such as a court order or subpoena.</li>
                        <li>To protect the rights, property, or safety of Gebeta Software or others.</li>
                        <li>In connection with a merger, acquisition, or sale of all or a portion of our assets.</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-3xl font-semibold text-[#1B1E2B] dark:text-white mb-4">Data Security</h2>
                    <p className="text-md text-gray-600 dark:text-gray-400 mb-6">
                        We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, or misuse. However, no method of data transmission or storage is completely secure, and we cannot guarantee the absolute security of your information.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-3xl font-semibold text-[#1B1E2B] dark:text-white mb-4">Retention of Information</h2>
                    <p className="text-md text-gray-600 dark:text-gray-400 mb-6">
                        We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-3xl font-semibold text-[#1B1E2B] dark:text-white mb-4">Your Rights</h2>
                    <p className="text-md text-gray-600 dark:text-gray-400 mb-6">
                        You have the right to access, correct, or delete your personal information. You can also object to certain processing activities or request that we restrict the processing of your personal data. To exercise your rights, please contact us at the provided contact information.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-3xl font-semibold text-[#1B1E2B] dark:text-white mb-4">Children's Privacy</h2>
                    <p className="text-md text-gray-600 dark:text-gray-400 mb-6">
                        Our services are not intended for use by children under the age of 13. We do not knowingly collect personal information from children. If we become aware that we have collected personal information from a child under 13, we will take steps to delete that information as soon as possible.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-3xl font-semibold text-[#1B1E2B] dark:text-white mb-4">Changes to This Privacy Policy</h2>
                    <p className="text-md text-gray-600 dark:text-gray-400 mb-6">
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top of the Privacy Policy. You are advised to review this Privacy Policy periodically for any changes.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-3xl font-semibold text-[#1B1E2B] dark:text-white mb-4">Contact Us</h2>
                    <p className="text-md text-gray-600 dark:text-gray-400 mb-6">
                        If you have any questions about this Privacy Policy, please contact us using the contact information provided on our website.
                    </p>
                </section>
            </div>
        </Container>
    );
}
