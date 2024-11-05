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
        <section className="relative py-20 bg-custom dark:from-gray-900 dark:to-black">
            <Container>
                <div className="text-center mb-12">
                    <h2 className="text-[#1B1E2B] dark:text-white text-[40px] text-center dark:text-white mb-3">
                        Customer Success Stories
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        See how leading businesses transform with Gebeta Maps
                    </p>
                </div>
            </Container>
            <div className="relative pt-[80px] overflow-hidden px-4">
                <div className="flex gap-5 animate-smooth-scroll hover:animation-pause">
                    {[...testimonials, ...testimonials].map((item, index) => (
                        <div
                            key={index}
                            className="w-[320px] flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl p-6
                                shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]
                                hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]
                                transition-all duration-300 border border-gray-100 dark:border-gray-700
                                flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <Image
                                    src={item.company.logo}
                                    alt={`${item.company.name} logo`}
                                    width={80}
                                    height={30}
                                    className="object-contain"
                                    style={{
                                        maxWidth: '100%',
                                        height: 'auto'
                                    }}
                                />
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor"
                                             viewBox="0 0 20 20">
                                            <path
                                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                        </svg>
                                    ))}
                                </div>
                            </div>

                            <blockquote className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-5 flex-grow">
                                "{item.message}"
                            </blockquote>

                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 relative flex-shrink-0">
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
                <div
                    className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-white dark:from-gray-900 pointer-events-none"
                ></div>
                <div
                    className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-white dark:from-gray-900 pointer-events-none"
                ></div>
            </div>
        </section>
    );
}