import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/button";
import HeroMap from "@/components/marketing/hero-map";
import { HERO } from "@/constants/landing";

export default function Header() {
    return (
        <section className="relative isolate flex min-h-[min(860px,92svh)] items-center overflow-hidden">
            <HeroMap />

            <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 pb-24 pt-16 text-center sm:px-6">
                <h1 className="text-balance text-[44px] font-medium leading-[1] tracking-[-0.035em] text-foreground md:text-[clamp(56px,5.6vw,80px)]">
                    {HERO.title}
                </h1>
                <p className="max-w-[40ch] text-[18px] leading-[1.5] text-soft">
                    {HERO.description}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button href={HERO.primary.href} size="xl" className="auth-signed-out">
                        {HERO.primary.label} <ArrowRight aria-hidden />
                    </Button>
                    <Button href={HERO.signedIn.href} size="xl" className="auth-signed-in">
                        {HERO.signedIn.label} <ArrowRight aria-hidden />
                    </Button>
                    <Button href={HERO.secondary.href} variant="secondary" size="xl">
                        {HERO.secondary.label}
                    </Button>
                </div>
            </div>
        </section>
    );
}
