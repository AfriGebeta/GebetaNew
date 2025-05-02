import Highlight from "@/sections/Highlight";
import Features from "@/sections/Features";
import Header from "@/sections/Header";
import Pricing from "@/sections/Pricing";
import Testimonial from "@/sections/Testimonal";
import Partners from "@/sections/Partners";
import Showcase from "@/sections/Showcase";
import CallToAction from "@/sections/CallToAction";
import VideoCarousel from "@/sections/VideoCarousel";

export default function Home() {

    return (
        <main>
            <Header/>
            <VideoCarousel/>
            <Partners/>
            <div className="h-[1px] bg-[#FFF5E2] dark:hidden mt-[50px] md:mt-[76px]"></div>
            <Highlight/>
            <Features/>
            <Pricing/>
            <Testimonial/>
            <Showcase/>
            <CallToAction/>
        </main>
    );
}
