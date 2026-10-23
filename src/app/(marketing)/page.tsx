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

async function fetchPricingData() {
    try {
        const [plansRes, fxRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/credit-bundle?page=1&limit=10`, {
                next: { revalidate: 3600 },
            }),
            fetch("https://api.exchangerate-api.com/v4/latest/USD", {
                next: { revalidate: 3600 },
            }),
        ]);
        const plans = plansRes.ok ? (await plansRes.json()).data : null;
        const fx = fxRes.ok ? await fxRes.json() : null;
        return {
            plans,
            exchangeRate: fx?.rates?.ETB ? Math.ceil(fx.rates.ETB) : 140,
        };
    } catch {
        return { plans: null, exchangeRate: 140 };
    }
}

export default async function Home() {
    const { plans, exchangeRate } = await fetchPricingData();
    return (
        <main>
            <Header/>
            <Partners/>
            <Bento/>
            <Performance/>
            <Showcase/>
            <Testimonial/>
            {/* <VideoCarousel/> */}
            <Pricing initialData={plans} initialExchangeRate={exchangeRate} />
            <CallToAction/>
        </main>
    );
}
