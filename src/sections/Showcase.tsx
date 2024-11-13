//@ts-nocheck
"use client";

import {showcases} from "../constants";
import Image from "next/image";
import Container from "@/sections/Container";
import {useEffect, useState} from "react";

export default function Showcase() {
    const [activeTab, setActiveTab] = useState(0);
    const [isChanging, setIsChanging] = useState(false);
    const showcaseCompany = showcases.map((showcase, index) => showcase.title);

    useEffect(() => {
        if (isChanging) {
            const timer = setTimeout(() => {
                setIsChanging(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isChanging]);

    const handleTabChange = (tab) => {
        setIsChanging(true);
        setActiveTab(tab);
    };

    return (
        <Container>
            <div className="mt-[180px] pb-[200px]">
                <h4 className="text-[#979BAA] text-[12px] text-center font-bold tracking-20 uppercase ">We love to
                    see you grow</h4>
                <h2 className="text-[#1B1E2B] dark:text-white text-[40px] text-center mt-[10px]">Showcase</h2>
                <p className="text-[#62677F] text-[20px] text-center mt-[42px]">Businesses, from startups to
                    enterprises, power their location intelligence with GebetaMaps.</p>

                <div className="flex flex-col gap-[40px]">
                    <div className="flex justify-center items-center gap-4 mt-[44px]">
                        {
                            showcaseCompany.map((company, index) => (
                                <div
                                    key={index}
                                    className={`cursor-pointer px-6 py-2 rounded-full transition-all duration-300 border-2 ${activeTab === index ? 'border-[#FFA500] bg-[#FFF7E8]' : 'border-transparent bg-[#F8F9FA]'}`}
                                    onClick={() => handleTabChange(index)}
                                >
                                    <h5 className={`text-[${activeTab === index ? '#FFA500' : '#1B1E2B'}] text-[16px] font-semibold transition-colors duration-300`}>
                                        {company}
                                    </h5>
                                </div>
                            ))
                        }
                    </div>

                    <div className="mt-[24px] relative h-[500px]">
                        {
                            showcases.map((showcase, index) => (
                                <div key={index}
                                     className={`absolute top-0 left-0 w-full transition-opacity duration-300 ${activeTab === index ? 'opacity-100 z-10' : 'opacity-0 z-0'} ${isChanging ? 'pointer-events-none' : ''}`}>
                                    <div className="flex justify-center items-center md:flex-row gap-[32px]">
                                        <div
                                            className="w-4/5 bg-[#FFF7E8] dark:bg-zinc-900 flex justify-center items-center px-[50px] md:px-[100px] py-[25px] md:py-[50px] rounded-[16px]">
                                            <Image
                                                src={showcase.showcasePicture}
                                                className="object-contain"
                                                width={300}
                                                height={200}
                                                alt={showcase.title}
                                            />
                                        </div>
                                        {/*<div className="w-full pt-4 md:w-2/5 md:pt-[120px]">*/}
                                        {/*    <Image*/}
                                        {/*        src={showcase.companyLogo}*/}
                                        {/*        alt="zayride logo"*/}
                                        {/*        width={showcase.companyLogoSize.width}*/}
                                        {/*        height={showcase.companyLogoSize.height}*/}
                                        {/*    />*/}
                                        {/*    /!*<p className="text-[#62677F] text-[16px] leading-20 mt-[40px]">{showcase.description}</p>*!/*/}
                                        {/*    /!*<p className="text-[#62677F] text-[16px] leading-20 mt-2">an interview with zayride CEO Habtamu Tadesse</p>*!/*/}

                                        {/*    /!*<div className="mt-[60px] flex gap-[32px] items-center">*!/*/}
                                        {/*    /!*    /!*<button*!/*!/*/}
                                        {/*    /!*    /!*    className="flex gap-[4px] transition-all border border-[#99AFCC] hover:border-[#FFA500] hover:text-[#FFA500] hover:bg-[#FFA500]/20 px-[30px] py-[12px] text-[#2E384E] dark:text-white text-[14px] whitespace-nowrap font-medium">*!/*!/*/}
                                        {/*    /!*    /!*    <Image*!/*!/*/}
                                        {/*    /!*    /!*        src="/assets/play.svg"*!/*!/*/}
                                        {/*    /!*    /!*        width={24}*!/*!/*/}
                                        {/*    /!*    /!*        height={24}*!/*!/*/}
                                        {/*    /!*    /!*        alt="play"*!/*!/*/}
                                        {/*    /!*    /!*    />*!/*!/*/}
                                        {/*    /!*    /!*    Watch video*!/*!/*/}
                                        {/*    /!*    /!*</button>*!/*!/*/}
                                        {/*    /!*    /!*<Link*!/*!/*/}
                                        {/*    /!*    /!*    href="/stories"*!/*!/*/}
                                        {/*    /!*    /!*    className="text-[#1B1E2B] dark:text-white hover:text-[#FFA500] hover:underline text-[14px] font-bold whitespace-nowrap">*!/*!/*/}
                                        {/*    /!*    /!*    See all success stories*!/*!/*/}
                                        {/*    /!*    /!*</Link>*!/*!/*/}
                                        {/*    /!*</div>*!/*/}
                                        {/*</div>*/}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </Container>
    )
}