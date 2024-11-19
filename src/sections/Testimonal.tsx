//@ts-nocheck
import Container from "@/sections/Container";
import Image from "next/image";

const testimonials = [
    {
        company: {
            logo: "/assets/zayride.svg",
            name: "Zayride",
            width: 102, height: 60
        },
        author: {
            name: "Habtamu Tadesse",
            role: "Founder and CEO",
            image: "/assets/habtamu.png"
        },
        message: "I highly recommend Gebeta Maps as an essential mapping service for ZayRide. Their accurate and up-to-date maps have greatly improved navigation for our taxi drivers, ensuring efficient and reliable transportation services for our passengers.",
    },
    {
        company: {
            logo: "/assets/nid.svg",
            name: "National ID",
            width: 187, height: 60
        },
        author: {
            name: "Abenezer Feleke",
            role: "NID, Head of Communications",
            image: "/assets/niduser.jpeg"
        },
        message: "Our experience with Gebeta Maps was very satisfactory and would like to express our utmost appreciation with their mapping services. Their expertise has made a tangible impact on our website by enhancing its functionality and user-friendliness, particularly in terms of helping citizens locate our Registration centers with ease. We are pleased to recommend their services to others seeking reliable and effective mapping solutions.",
    },
    {
        company: {
            logo: "/assets/adika.svg",
            name: "Adika",
            width: 60, height: 60
        },
        author: {
            name: "Biruk Fekade",
            role: "CTO at Adika",
            image: "/assets/biruk.png"
        },
        message: "Gebeta Maps has consistently proven to be an invaluable asset for Adika. The seamless integration of their API into our systems has significantly enhanced our location-based services. The accuracy and up-to-date information provided by Gebeta Maps have played a crucial role in improving the overall user experience for our customers.",
    }
];

export default function Testimonial() {
    return (
        <section className="relative py-12 md:py-20 bg-custom dark:bg-[#05050a] mt-[80px] md:mt-[104px]">
            <Container>
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-[#1B1E2B] dark:text-white text-3xl md:text-[40px]">
                        Customer Success Stories
                    </h2>
                    <p className="text-[#62677F] text-base md:text-lg max-w-[60ch] mx-auto mt-[42px]">
                        See how leading businesses transform with Gebeta Maps.
                    </p>
                </div>
            </Container>

            <div className="relative pt-10 md:pt-[80px] overflow-hidden px-4">
                <div className="flex gap-5 animate-smooth-scroll hover:pause">
                    {[...testimonials, ...testimonials].map((item, index) => (
                        <div
                            key={index}
                            className="w-[280px] md:w-[320px] flex-shrink-0 bg-white dark:bg-[#0A0A0F]
                                rounded-xl p-5 md:p-6 backdrop-blur-sm
                                shadow-lg hover:shadow-xl
                                dark:shadow-[#000000]/20 dark:hover:shadow-[#000000]/30
                                transition-all duration-300
                                border border-gray-100/50 dark:border-[#15151f]
                                flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div className="relative w-[80px] h-[30px]">
                                    <Image
                                        src={item.company.logo}
                                        alt={`${item.company.name} logo`}
                                        fill
                                        className="object-contain dark:filter dark:brightness-200"
                                    />
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className="w-4 h-4 text-yellow-400 dark:text-yellow-300"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                        </svg>
                                    ))}
                                </div>
                            </div>

                            <blockquote className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed mb-5 flex-grow">
                                "{item.message}"
                            </blockquote>

                            <div className="flex items-center gap-3 mt-auto">
                                <div className="w-12 h-12 relative flex-shrink-0 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-[#15151f]">
                                    <Image
                                        src={item.author.image}
                                        alt={item.author.name}
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                        {item.author.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {item.author.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Gradient Overlays */}
                <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-custom dark:from-[#05050a] to-transparent pointer-events-none"></div>
                <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-custom dark:from-[#05050a] to-transparent pointer-events-none"></div>
            </div>
        </section>
    );
}