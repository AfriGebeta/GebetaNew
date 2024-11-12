import Image from 'next/image';
import Container from "@/sections/Container";
import {teamMembers} from "../../../constants";

export default function Company() {
    return (
        <Container>
            <div className="mt-[10px]">
                <h1 className="text-[48px] text-center text-[#1B1E2B] dark:text-white leading-60 mb-[40px]">
                    About Us
                </h1>

                <h3 className="text-3xl font-semibold text-[#1B1E2B] dark:text-white mb-4">Serving Africa and Beyond</h3>
                <p className="text-md text-gray-600 dark:text-gray-400 mb-6">
                    With our headquarters in Addis Ababa, Ethiopia, Gebeta Maps is deeply rooted in the African market.
                    We're proud to be a pan-African player, serving customers in Djibouti and expanding across the continent.
                    As we continue to grow, our focus remains on providing world-class mapping and location services tailored to the unique needs of the African market.
                </p>

                <h3 className="text-3xl font-semibold text-[#1B1E2B] dark:text-white mb-4">Choose Your Path with Gebeta Maps</h3>
                <p className="text-md text-gray-600 dark:text-gray-400 mb-6">
                    Whether you're an individual, a startup, or an enterprise, Gebeta Maps has a plan for you. Our pricing options – Starter, Business, Professional, and Premium – cater to various needs and preferences.
                    Our APIs find applications in navigation, real-time traffic updates, route planning, and location-based advertising, giving you the flexibility to map the world your way.
                </p>

                <h3 className="text-3xl font-semibold text-[#1B1E2B] dark:text-white mb-4">Our Global Footprint</h3>
                <p className="text-md text-gray-600 dark:text-gray-400 mb-6">
                    Mapping Tomorrow, Today. As we continue to expand, Gebeta Maps is in talks with companies in Nigeria, Kenya, and other African countries, further solidifying our commitment to shaping the future of mapping and location services worldwide.
                </p>

                <h3 className="text-3xl font-semibold text-[#1B1E2B] dark:text-white mb-4">Core Values</h3>
                <p className="text-md text-gray-600 dark:text-gray-400 mb-6">
                    Innovation, Reliability, Customer Service – Mapped Together. At Gebeta Maps, we stand by our core values: innovation, reliability, and exceptional customer service.
                    We believe that by offering accurate, reliable, and user-friendly mapping and location services, we can drive positive change in the lives and operations of individuals and businesses globally.
                    Thank you for choosing Gebeta Maps – where every journey is an opportunity to map the world together.
                </p>

                <h2 className="text-3xl font-semibold text-[#1B1E2B] dark:text-white mb-6">Meet Our Team</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {/* Team Members */}
                    {teamMembers.map((member, index) => (
                        <div key={index} className="flex flex-col items-center bg-white dark:bg-zinc-800 rounded-lg shadow-md overflow-hidden py-4">
                            <div className="relative w-32 h-32 mb-4">
                                <Image
                                    src={member.img}
                                    alt={member.name}
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded-full"
                                />
                            </div>
                            <div className="text-center p-4">
                                <h3 className="text-lg font-semibold text-[#1B1E2B] dark:text-white">{member.name}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{member.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
}
