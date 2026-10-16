import type { Metadata } from "next";
import Header from "@/sections/Header";
import Partners from "@/sections/Partners";
import Bento from "@/sections/Bento";
import Performance from "@/sections/Performance";
import VideoCarousel from "@/sections/VideoCarousel";
import Pricing from "@/sections/Pricing";
import Testimonial from "@/sections/Testimonal";
import Showcase from "@/sections/Showcase";
import CallToAction from "@/sections/CallToAction";

export const metadata: Metadata = {
    alternates: { canonical: "/" },
};

export default function Home() {
    return (
        <main>
            <Header/>
            <Partners/>
            <Bento/>
            <Performance/>
            <Showcase/>
            <Testimonial/>
            {/* <VideoCarousel/> */}
            <Pricing/>
            <CallToAction/>
        </main>
    );
}
