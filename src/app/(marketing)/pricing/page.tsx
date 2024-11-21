import type {Metadata} from "next";
import {Plans} from "@/sections/Pricing";
import Container from "@/sections/Container";
import PricingSlider from "@/components/PricingSlider";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Building2, CircleDollarSign, Scale, Shield} from 'lucide-react';

export const metadata:Metadata = {
    title:"GebetaMaps Pricing"
}

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

    return (
        <div className=" dark:from-[#05050a] dark:to-[#05050a]">
            <Container>
                <div className="md:pb-[60px]">
                    <div className="text-center mb-[80px]">
                        <h2 className="text-[48px] text-[#1B1E2B] dark:text-white leading-[1.2] mb-[20px]">Pricing</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-[600px] mx-auto text-lg mb-[40px]">
                            Choose the perfect plan for your mapping needs
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-[60px]">
                            {features.map((feature, index) => (
                                <div key={index} className="bg-white dark:bg-[#111116] p-6 rounded-xl shadow-lg">
                                    <div className="w-12 h-12 bg-[#FFA500]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                                        <feature.icon className="w-6 h-6 text-[#FFA500]" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-[#1B1E2B] dark:text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Plans />

                    <div className="bg-white dark:bg-[#111116] rounded-2xl shadow-lg p-8 mb-[60px]">
                        <h3 className="text-2xl font-semibold text-[#1B1E2B] dark:text-white mb-6 text-center">
                            Calculate Your Usage Cost
                        </h3>
                        <PricingSlider />
                    </div>

                    <div className="max-w-[800px] mx-auto">
                        <h3 className="text-2xl font-semibold text-[#1B1E2B] dark:text-white mb-6 text-center">
                            Frequently Asked Questions
                        </h3>
                        <Accordion type="single" collapsible className="w-full">
                            {faqsList.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger className="text-[#1B1E2B] dark:text-white transition-all">
                                        {faq.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-gray-600 dark:text-gray-400">
                                        {faq.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </Container>
        </div>
    );
}