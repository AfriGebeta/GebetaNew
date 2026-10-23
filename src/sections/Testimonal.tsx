"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { DURATION, EASE, IN_VIEW, blurFadeRise, stagger, staggerBlur } from "@/lib/motion";

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
            image: "/assets/habtamu.webp"
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
            image: "/assets/biruk.webp"
        },
        message: "Gebeta Maps has consistently proven to be an invaluable asset for Adika. The seamless integration of their API into our systems has significantly enhanced our location-based services. The accuracy and up-to-date information provided by Gebeta Maps have played a crucial role in improving the overall user experience for our customers.",
    }
];

export default function Testimonial() {
    const [active, setActive] = useState(0);
    const item = testimonials[active];
    const [opening, ...rest] = item.message.split(/(?<=\.)\s+/);

    return (
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-28 lg:px-8">
            <motion.div
                variants={staggerBlur()}
                initial="hidden"
                whileInView="show"
                viewport={IN_VIEW}
                className="grid gap-10 lg:grid-cols-12"
            >
                <motion.div variants={blurFadeRise} className="flex flex-col gap-6 lg:col-span-4">
                    <h2 className="text-[36px] font-medium leading-[1.05] tracking-[-0.03em] text-foreground md:text-[48px]">
                        In their words
                    </h2>
                    <div role="tablist" aria-label="Customers" className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
                        {testimonials.map((t, i) => (
                            <button
                                key={t.company.name}
                                role="tab"
                                type="button"
                                aria-selected={i === active}
                                onClick={() => setActive(i)}
                                className={cn(
                                    "flex cursor-pointer items-center gap-3 rounded-full py-2 pl-2 pr-4 text-[15px] outline-none transition-colors duration-150 ease-power3-out focus-visible:ring-2 focus-visible:ring-ring/60",
                                    i === active ? "bg-card text-foreground shadow-btn" : "text-soft hover:bg-hover hover:text-foreground",
                                )}
                            >
                                <span className="flex size-8 items-center justify-center rounded-full bg-raised">
                                    <Image src={t.company.logo} alt="" width={20} height={20} className="h-5 w-auto" />
                                </span>
                                {t.company.name}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <motion.div variants={blurFadeRise} className="lg:col-span-7 lg:col-start-6">
                    <AnimatePresence mode="wait">
                        <motion.figure
                            key={active}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: DURATION.base, ease: EASE.out }}
                            className="flex max-w-[38ch] flex-col gap-5 md:max-w-[44ch]"
                        >
                            <blockquote className="flex flex-col gap-5">
                                <p className="text-[24px] font-medium leading-[1.3] tracking-[-0.01em] text-foreground md:text-[30px]">
                                    {opening}
                                </p>
                                {rest.length > 0 && (
                                    <p className="text-[17px] leading-[1.55] text-foreground md:text-[18px]">{rest.join(" ")}</p>
                                )}
                            </blockquote>
                            <figcaption className="mt-5 flex items-center gap-3">
                                <Image src={item.author.image} alt="" width={44} height={44} className="size-11 rounded-full object-cover" />
                                <span className="flex flex-col gap-1">
                                    <span className="text-[16px] font-medium leading-none text-foreground">{item.author.name}</span>
                                    <span className="text-[15px] leading-none text-soft">{item.author.role}</span>
                                </span>
                            </figcaption>
                        </motion.figure>
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </section>
    );
}
