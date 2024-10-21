import Container from "@/app/components/Container";
import {testimonial} from "@/app/constants";
import Image from "next/image";

export default function Testimonial() {
    return (
        <div className="mt-[140px] h-[600px] bg-custom">
            <Container>
                <h2 className="text-center pt-[88px] text-[#1B1E2B] dark:text-white text-[40px] leading-50">What people say</h2>
                <p className="text-center mt-[42px] text-[#62677F] text-[20px] leading-25">Our customers are our top priority.
                    lets hear
                    what they have to say.</p>
            </Container>
            <div className="relative mt-[44px] w-full overflow-hidden pb-[120px]">
                <div className="flex gap-[32px] animate-scroll">
                    {testimonial.map((item, index) => (
                        <div
                            className={`mt-[44px] absolute ${(index + 1) % 2 === 0 ? "top-[80px]" : ""} w-[256px] p-[32px] bg-white dark:bg-[#0a0a0a] rounded-[16px] flex-shrink-0 relative isolate`}
                            key={index}>
                            <div
                                className="absolute inset-0 -z-10 rounded-[16px] shadow-[0_8px_16px_rgba(255,165,0,0.15)]"></div>

                            <Image src="/assets/zayride.svg" width={60} height={60} alt="adika logo"/>
                            <Image
                                className="rounded-full mt-[30px]"
                                src="/assets/habtamu.png"
                                width={60}
                                height={60}
                                alt="adika logo"/>
                            <h6 className="mt-[15px] text-[#62677F] text-[14px] leading-17">“Best product ever! Very easy to use. I
                                strongly recommend gebetamaps to everyone invloved in running a location based
                                business!</h6>
                            <div className="mt-[42px] flex gap-[8px] items-center">
                                <div className="bg-[#E3E3E8] w-[24px] h-[0.5px]"></div>
                                <h6 className="text-[#AAADBA] text-[10px]">Habtamu, CEO of Zayride</h6>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}