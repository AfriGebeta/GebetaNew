import Highlight from "@/sections/Highlight";
import Features from "@/sections/Features";
import Header from "@/sections/Header";
import Pricing from "@/sections/Pricing";
import Testimonial from "@/sections/Testimonal";
import Partners from "@/sections/Partners";
import Showcase from "@/sections/Showcase";
import CallToAction from "@/sections/CallToAction";

export default function Home() {

    return (
        <main>
            <Header/>
            {/*<VideoCarousel/>*/}
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
