import VideoCarousel from "@/app/components/VideoCarousel";
import Highlight from "@/app/components/Highlight";
import Features from "@/app/components/Features";
import Header from "@/app/components/Header";
import Pricing from "@/app/components/Pricing";
import Testimonial from "@/app/components/Testimonal";
import Partners from "@/app/components/Partners";
import Showcase from "@/app/components/Showcase";
import CallToAction from "@/app/components/CallToAction";

export default function Home() {

    return (
        <main>
            <Header/>
            <VideoCarousel/>
            <Partners/>
            <Highlight/>
            <div className="h-[1px] bg-[#FFF5E2] mt-[96px]"></div>
            <Features/>
            <Pricing/>
            <Testimonial/>
            <Showcase/>
            <CallToAction/>
        </main>
    );
}
