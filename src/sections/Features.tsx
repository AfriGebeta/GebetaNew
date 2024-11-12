import Container from "@/sections/Container";
import Image from "next/image";
import {features} from "../constants";
import Link from "next/link";

export default function Features() {
    return (
        <div className="overflow-hidden mb-[180px]">
            {
                features.map((feature, index) => (
                    <div className="w-full mt-[80px]" key={index}>
                        <Container>
                            <div
                                className={`w-full flex flex-col lg:flex-row gap-[40px] lg:justify-between ${(index + 1) % 2 === 0 ? "lg:flex-row-reverse" : ""} mt-[130px] z-50`}>
                                <div className="w-1/2">
                                    <h5
                                        className="w-fit px-[30px] py-[15px] bg-[#FFF7E8] dark:bg-zinc-900 rounded-[16px] text-[12px] text-[#FFA500] font-extrabold tracking-20 uppercase">
                                        {feature.subtitle}</h5>
                                    <h2 className="text-[40px] text-[#1B1E2B] dark:text-white mt-[12px]">{feature.title}</h2>
                                    <p className="w-full md:w-4/5 text-[20px] text-[#62677F] dark:text-white/70 leading-25 mt-[32px]"><span
                                        className="font-bold">GebetaMaps</span> {feature.description}</p>
                                    <div className="flex items-center gap-[8px] group mt-[16px]">
                                        <Link
                                            href="/public"
                                            className="text-[14px] text-[#1B1E2B]/70 hover:text-[#1B1E2B]/30 dark:text-white dark:hover:text-[#FFA500] font-medium">
                                            Read more</Link>
                                        <Image
                                            className="group-hover:translate-x-1 transition-all duration-400"
                                            src="/assets/right-arrow.svg"
                                            width={8}
                                            height={8}
                                            alt="right arrow icon"/>
                                    </div>
                                </div>
                                <Image
                                    className="z-50"
                                    src={feature.image.source}
                                    alt={feature.image.alt}
                                    width={feature.image.width}
                                    height={feature.image.height}/>
                            </div>
                        </Container>

                        {/*    Flavour elements*/}
                        {/*<div*/}
                        {/*    className={`hidden md:absolute ${(index + 1) % 2 === 0 ? "left-0 -top-[15%]" : "left-[70%] -top-[15%]"} w-[400px] h-[400px] bg-[#FFF6E4] dark:bg-zinc-900 rounded-[48px] z-0`}></div>*/}
                        {/*<div*/}
                        {/*    className={`hidden md:absolute ${(index + 1) % 2 === 0 ? "left-[40%] top-[75%]" : "left-[45%] top-[75%]"} w-[200px] h-[200px] bg-[#FFF6E4] dark:bg-zinc-900 rounded-[48px] z-0`}></div>*/}

                    </div>
                ))
            }
        </div>
    )
}