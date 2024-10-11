"use client"
import Container from "@/app/components/Container";
import Link from "next/link";
import VideoCarousel from "@/app/components/VideoCarousel";
import Image from "next/image";
import Highlight from "@/app/components/Highlight";
import Partners from "@/app/components/Partners";
import Features from "@/app/components/Features";
import Header from "@/app/components/Header";

export default function Home() {
    return (
        <main className="">
            <Header/>
            {/*<VideoCarousel/>*/}
            <Partners/>
            <div className="h-[1px] bg-[#FFF5E2] mt-[96px]"></div>
            <Highlight/>
            <Features/>

        </main>
    );
}
