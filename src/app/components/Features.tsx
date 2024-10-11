import Container from "@/app/components/Container";
import Image from "next/image";
import {features} from "@/app/constants";
import Link from "next/link";

export default function Features() {
    return (
        <div className="overflow-hidden">
            {
                features.map((feature, index) => (
                    <div className={`relative ${(index === 0 ) ?"mt-[100px]" : "mt-[300px]"}`} key={index}>
                        <Container>
                            <div
                                className={`flex ${(index + 1) % 2 === 0 ? "flex-row-reverse" : ""} justify-between mt-[130px] z-50`}>
                                <div>
                                    <h5
                                        className="w-fit px-[30px] py-[15px] bg-[#FFF7E8] rounded-[16px] text-[12px] text-[#FFA500] font-extrabold tracking-20 uppercase">
                                        {feature.subtitle}</h5>
                                    <h2 className="text-[40px] text-[#1B1E2B] mt-[12px]">{feature.title}</h2>
                                    <p className="max-w-xl text-[20px] text-[#62677F] leading-25 mt-[32px]"><span
                                        className="font-bold">GebetaMaps</span> {feature.description}</p>
                                    <div className="w-fit flex items-center gap-[8px] group mt-[16px]">
                                        <Link
                                            href="/"
                                            className="text-[14px] text-[#1B1E2B] font-medium">
                                            Read more</Link>
                                        <Image
                                            className="group-hover:translate-x-1 transition-all duration-400"
                                            src="/assets/right-arrow.svg"
                                            width={16}
                                            height={16}
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
                        <div
                            className={`absolute ${(index + 1) % 2 === 0 ? "left-0 -top-[15%]" : "left-[70%] -top-[15%]"} w-[400px] h-[400px] bg-[#FFF6E4] rounded-[48px] z-0`}></div>
                        <div
                            className={`absolute ${(index + 1) % 2 === 0 ? "left-[40%] top-[75%]" : "left-[45%] top-[75%]"} w-[200px] h-[200px] bg-[#FFF6E4] rounded-[48px] z-0`}></div>

                    </div>
                ))
            }
        </div>
    )
}