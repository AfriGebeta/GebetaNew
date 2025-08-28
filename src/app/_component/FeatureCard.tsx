"use client"
import {Features} from "@/constants";
import Link from "next/link";
import Image from "next/image";

interface FeatureCardProps {
    feature: Features
    index: number
}

export default function FeatureCard({feature,index}:FeatureCardProps) {
    return (
        <div className="w-full mt-6 md:mt-20" key={index}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`w-full flex flex-col lg:flex-row gap-10 lg:justify-between ${
                    (index + 1) % 2 === 0 ? "lg:flex-row-reverse" : ""
                } mt-32 z-50`}>
                    <div
                        className="w-full md:w-1/2"
                    >
                        <h5 className="w-fit whitespace-nowrap px-8 py-4 bg-[#FFF7E8] dark:bg-zinc-900 rounded-2xl text-xs text-[#FFA500] font-extrabold tracking-wider uppercase">
                            {feature.subtitle}
                        </h5>
                        <h2 className="w-full whitespace-nowrap text-2xl md:text-4xl text-[#1B1E2B] dark:text-white mt-3">
                            {feature.title}
                        </h2>
                        <p className="w-full md:w-4/5 text-base md:text-xl text-[#62677F] dark:text-white/70 leading-relaxed mt-8">
                            <span className="font-bold">GebetaMaps</span> {feature.description}
                        </p>
                        <div className="flex items-center gap-2 group mt-4">
                            <Link
                                href=""
                                className="text-sm text-[#1B1E2B]/70 hover:text-[#1B1E2B]/30 dark:text-white dark:hover:text-[#FFA500] font-medium"
                            >
                                Read more
                            </Link>
                            <svg
                                className="w-2 h-2 group-hover:translate-x-1 transition-all duration-300"
                                viewBox="0 0 8 8"
                                fill="currentColor"
                            >
                                <path d="M1 4h6M5 1l3 3-3 3"/>
                            </svg>
                        </div>
                    </div>

                    <div
                        className="w-full md:w-1/2"
                    >
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                            <Image
                                className="object-cover"
                                src={feature.image.source}
                                fill
                                alt={feature.image.alt}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}