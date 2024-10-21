"use client";

import {showcases} from "@/app/constants";
import Image from "next/image";
import Link from "next/link";
import Container from "@/app/components/Container";
import {useState, useEffect} from "react";

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
            <div className="mt-[360px]">
                <h4 className="text-[#979BAA] text-[12px] text-center font-bold tracking-20 uppercase ">We love to
                    see you grow</h4>
                <h2 className="text-[#1B1E2B] text-[40px] text-center mt-[10px]">Success stories</h2>
                <p className="text-[#62677F] text-[20px] text-center mt-[42px]">Businesses, from startups to
                    enterprises, power their location intelligence with GebetaMaps.</p>

                <div className="flex flex-col gap-[40px]">
                    <div className="flex justify-center items-center gap-[40px] mt-[44px]">
                        {
                            showcaseCompany.map((company, index) => (
                                <div
                                    className={`cursor-pointer px-[30px] py-[15px] rounded-[48px] transition-all duration-300 ${activeTab === index ? 'bg-[#FFF7E8]' : 'bg-[#F8F9FA]'}`}
                                    onClick={() => handleTabChange(index)}
                                    key={index}
                                >
                                    <h5 className={`text-[${activeTab === index ? '#FFA500' : '#1B1E2B'}] text-[16px] font-extrabold transition-colors duration-300`}>
                                        {company}</h5>
                                </div>
                            ))
                        }
                    </div>

                    <div className="mt-[24px] relative h-[500px]">
                        {
                            showcases.map((showcase, index) => (
                                <div key={index}
                                     className={`absolute top-0 left-0 w-full transition-opacity duration-300 ${activeTab === index ? 'opacity-100 z-10' : 'opacity-0 z-0'} ${isChanging ? 'pointer-events-none' : ''}`}>
                                    <div className="flex flex-col md:flex-row gap-[44px]">
                                        <div className="bg-[#FFF7E8] dark:bg-zinc-900 flex justify-center items-center px-[100px] py-[50px] rounded-[16px]">
                                            <Image
                                                src={showcase.showcasePicture}
                                                className="object-contain"
                                                width={300}
                                                height={200}
                                                alt={showcase.title}
                                            />
                                        </div>
                                        <div className="w-full pt-4 md:w-2/5 md:pt-[120px]">
                                            <Image
                                                src={showcase.companyLogo}
                                                alt="zayride logo"
                                                width={showcase.companyLogoSize.width}
                                                height={showcase.companyLogoSize.height}
                                            />
                                            <p className="text-[#62677F] text-[16px] leading-20 mt-[40px]">{showcase.description}</p>
                                            <p className="text-[#62677F] text-[16px] leading-20 mt-2">an interview with zayride CEO Habtamu Tadesse</p>

                                            <div className="mt-[60px] flex gap-[32px] items-center">
                                                <button
                                                    className="flex gap-[4px] border border-[#99AFCC] px-[30px] py-[12px] text-[#2E384E] text-[14px] whitespace-nowrap font-medium">
                                                    <Image
                                                        src="/assets/play.svg"
                                                        width={24}
                                                        height={24}
                                                        alt="play"
                                                    />
                                                    Watch video
                                                </button>
                                                <Link
                                                    href="/stories"
                                                    className="text-[#1B1E2B] text-[14px] font-bold whitespace-nowrap">
                                                    See all success stories
                                                </Link>
                                            </div>
                                        </div>
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