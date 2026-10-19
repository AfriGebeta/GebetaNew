import {Plans} from "@/sections/Pricing";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Building2, CircleDollarSign, Scale, Shield} from 'lucide-react';
import Container from "@/sections/Container";
import { RevealBlur, RevealBlurItem } from "@/components/marketing/reveal";

export default function PricingPage() {
    const features = [
        {
            icon: CircleDollarSign,
            title: "Pay As You Go",
            description: "Only pay for what you use with our flexible pricing model"
        },
        {
            icon: Scale,
            title: "Scale With Ease",
            description: "Prices automatically decrease as your usage grows"
        },
        {
            icon: Shield,
            title: "No Hidden Fees",
            description: "Transparent pricing with no surprise charges"
        },
        {
            icon: Building2,
            title: "Enterprise Ready",
            description: "Custom solutions for high-volume needs"
        }
    ];

    const faqsList = [
        {
            q: "How does the pricing work?",
            a: "The pricing structure varies depending on the nature of each request. For directional queries, charges are based on the number of requests made, while for matrix, TSS, and ONM requests, the billing is determined by the quantity of GPS coordinates transmitted. For example, a matrix request involving 10 coordinates is considered as 10 individual sending requests. Geocoding utilizes a session-based counter, and there is no charge for approximately 5 seconds if the last and new requests are similar."
        },
        {
            q: "What happens if I don't pay on time?",
            a: "In the event of delayed payment, a grace period of 7 days will be provided after one month from your last payment. Failure to settle within this timeframe will result in a temporary suspension of system access until payment is received."
        },
        {
            q: "How does payment scale for a larger number of requests?",
            a: "The payment scale is inversely proportional to your usage. As the volume of requests increases, the cost per request diminishes. For instance, if you utilize 1,000,000 requests, the rate is 0.20 cents per 1,000 requests. However, for a million requests, the price is halved, amounting to 0.10 cents per 1,000 requests."
        }
    ];

    // Mirrors the accordion below so the same Q&As are eligible for the FAQ rich result.
    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqsList.map((faq) => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
            },
        })),
    };

    return (
        <div className="py-24 md:py-28">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: JSON.stringify(faqJsonLd)}}
            />
            <Container className="flex flex-col gap-12">
                <div className="flex flex-col gap-4">
                    <h1 className="text-[44px] font-medium leading-[1] tracking-[-0.035em] text-foreground md:text-[64px]">Pricing</h1>
                    <p className="max-w-[48ch] text-[18px] leading-[1.5] text-soft">
                        Every plan includes every API. Start free and move up as your traffic grows.
                    </p>
                </div>
                <RevealBlur className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => (
                        <RevealBlurItem key={feature.title} className="flex flex-col gap-2 rounded-lg bg-raised p-5">
                            <dt className="flex items-center gap-2 text-[16px] font-medium text-foreground">
                                <feature.icon aria-hidden className="size-4 text-soft"/>
                                {feature.title}
                            </dt>
                            <dd className="text-[15px] leading-[1.5] text-soft">{feature.description}</dd>
                        </RevealBlurItem>
                    ))}
                </RevealBlur>
            </Container>

            <Plans/>

            <Container className="mt-24 flex max-w-3xl flex-col gap-6">
                <RevealBlur className="flex flex-col gap-6">
                    <RevealBlurItem>
                        <h2 className="text-[28px] font-medium tracking-[-0.02em] text-foreground">Frequently asked questions</h2>
                    </RevealBlurItem>
                    <RevealBlurItem>
                        <Accordion type="single" collapsible className="w-full">
                            {faqsList.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                                    <AccordionContent>{faq.a}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </RevealBlurItem>
                </RevealBlur>
            </Container>
        </div>
    );
}
