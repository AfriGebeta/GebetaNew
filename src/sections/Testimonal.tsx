"use client";
import Container from "@/sections/Container";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Image from "next/image";

const testimonials = [
    {
        company: {
            logo: "/assets/zayride.svg",
            name: "Zayride",
            width: 60, height: 60
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
            width: 40, height: 60
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
            width: 40, height: 60
        },
        author: {
            name: "Biruk Fekade",
            role: "CTO at Adika",
            image: "/assets/biruk.png"
        },
        message: "Gebeta Maps has consistently proven to be an invaluable asset for Adika. The seamless integration of their API into our systems has significantly enhanced our location-based services. The accuracy and up-to-date information provided by Gebeta Maps have played a crucial role in improving the overall user experience for our customers.",
    }
];

const responsive = {
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 1,
        slidesToSlide: 1
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 1,
        slidesToSlide: 1
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1,
        slidesToSlide: 1
    }
};

const CustomLeftArrow = ({ onClick }: { onClick?: () => void }) => {
    return (
        <button
            onClick={onClick}
            className="absolute left-[400px] top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-[#0A0A0F] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFA500] border border-gray-100 dark:border-[#15151f]"
            aria-label="Previous testimonial"
        >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </button>
    );
};

const CustomRightArrow = ({ onClick }: { onClick?: () => void }) => {
    return (
        <button
            onClick={onClick}
            className="absolute right-[400px] top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-[#0A0A0F] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFA500] border border-gray-100 dark:border-[#15151f]"
            aria-label="Next testimonial"
        >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </button>
    );
};

const CustomDot = ({ onClick, active }: { onClick?: () => void; active?: boolean }) => {
    return (
        <button
            onClick={onClick}
            className={`w-3 h-3 rounded-full mx-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                active
                    ? 'bg-[#ffa500] dark:bg-blue-400'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
        />
    );
};

export default function Testimonial() {
    return (
        <section className="relative py-12 md:py-20 bg-custom dark:bg-[#05050a] mt-[80px] md:mt-[104px]">
            <Container>
                <div className="text-center">
                    <h2 className="text-[#1B1E2B] dark:text-white text-3xl md:text-[40px]">
                        Customer Success Stories
                    </h2>
                    <p className="text-[#62677F] text-base md:text-lg max-w-[60ch] mx-auto mt-[42px]">
                        See how leading businesses transform with Gebeta Maps.
                    </p>
                </div>
            </Container>

            <div className="relative pt-10 md:pt-[46px] px-4">
                <Carousel
                    responsive={responsive}
                    infinite={true}
                    autoPlay={true}
                    autoPlaySpeed={4000}
                    keyBoardControl={true}
                    customTransition="transform 500ms ease-in-out"
                    transitionDuration={500}
                    containerClass="carousel-container"
                    removeArrowOnDeviceType={["mobile"]}
                    deviceType="desktop"
                    dotListClass="flex justify-center mt-8 space-x-2"
                    itemClass="carousel-item-padding-40-px"
                    customLeftArrow={<CustomLeftArrow />}
                    customRightArrow={<CustomRightArrow />}
                    showDots={true}
                    customDot={<CustomDot />}
                    pauseOnHover={true}
                    swipeable={true}
                    draggable={true}
                    focusOnSelect={false}
                    centerMode={false}
                    shouldResetAutoplay={true}
                    rewind={false}
                    rewindWithAnimation={false}
                    rtl={false}
                    ssr={true}
                >
                    {testimonials.map((item, index) => (
                        <div key={index} className="px-4 md:px-8">
                            <div className="max-w-4xl mx-auto bg-white dark:bg-[#0A0A0F] rounded-xl p-6 md:p-8 md:py-4 mb-6 transition-all duration-300 border border-gray-100/50 dark:border-[#15151f]">

                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-[80px] h-[30px] rounded-lg flex items-center justify-center">
                                        <Image src={item.company.logo} alt={item.company.name} width={item.company.width} height={item.company.height}/>
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

                                <blockquote className="text-gray-700 dark:text-gray-200 text-sm md:text-base leading-relaxed mb-6">
                                    "{item.message}"
                                </blockquote>

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                            <Image src={item.author.image} alt={item.author.name} width={40} height={40} className="object-contain"/>
                                        </span>
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
                        </div>
                    ))}
                </Carousel>
            </div>
        </section>
    );
}