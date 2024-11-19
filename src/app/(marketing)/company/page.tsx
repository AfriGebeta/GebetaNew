import Container from "@/sections/Container";
import {Globe2, HeartHandshake, Lightbulb, Navigation, Shield} from 'lucide-react';

export default function Company() {
    const coreValues = [
        {
            title: "Innovation",
            description: "Constantly pushing boundaries in mapping technology",
            icon: Lightbulb
        },
        {
            title: "Reliability",
            description: "Delivering consistent and accurate mapping solutions",
            icon: Shield
        },
        {
            title: "Customer Service",
            description: "Dedicated support for your mapping needs",
            icon: HeartHandshake
        }
    ];

    return (
        <div className="bg-gradient-to-b from-white to-[#FFF7E8] dark:from-[#05050a] dark:to-[#05050a]">
            <Container>
                <div className="md:pb-[32px]">
                    <div className="text-center mb-[80px]">
                        {/*<div className="flex items-center justify-center gap-3 mb-4">*/}
                        {/*    <Building2 className="w-8 h-8 text-[#FFA500]" />*/}
                        {/*</div>*/}
                        <h2 className="text-[40px] text-[#1B1E2B] dark:text-white leading-[1.2] mb-[20px]">
                            About <span className="text-[#FFA500]">Gebeta Maps</span>
                        </h2>
                        <p className="max-w-[800px] mx-auto text-gray-600 dark:text-gray-400 text-lg">
                            Mapping Africa's future through innovative location solutions
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[40px] mb-[80px]">
                        <div className="bg-white dark:bg-[#111116] p-[30px] rounded-[20px] shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <Navigation className="w-6 h-6 text-[#FFA500]" />
                                <h3 className="text-2xl font-semibold text-[#1B1E2B] dark:text-white border-b-2 border-[#FFA500] pb-2">
                                    Serving Africa and Beyond
                                </h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                With our headquarters in Addis Ababa, Ethiopia, Gebeta Maps is deeply rooted in the African market.
                                We're proud to be a pan-African player, serving customers in Djibouti and expanding across the continent.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-[#111116] p-[30px] rounded-[20px] shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-3 mb-4">
                                <Globe2 className="w-6 h-6 text-[#FFA500]" />
                                <h3 className="text-2xl font-semibold text-[#1B1E2B] dark:text-white border-b-2 border-[#FFA500] pb-2">
                                    Choose Your Path
                                </h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                Whether you're an individual, a startup, or an enterprise, Gebeta Maps has a plan for you.
                                Our APIs power navigation, real-time traffic updates, route planning, and location-based advertising.
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#FFA500]/10 dark:bg-[#FFA500]/5 p-[40px] rounded-[20px] mb-[80px]">
                        <h3 className="text-2xl font-semibold text-[#1B1E2B] dark:text-white mb-4 text-center">
                            Our Global Footprint
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-center max-w-[900px] mx-auto leading-relaxed">
                            Mapping Tomorrow, Today. As we continue to expand, Gebeta Maps is in talks with companies in Nigeria, Kenya,
                            and other African countries, further solidifying our commitment to shaping the future of mapping and location services worldwide.
                        </p>
                    </div>

                    <div className="mb-[20px]">
                        <h3 className="text-2xl font-semibold text-[#1B1E2B] dark:text-white mb-8 text-center">
                            Our Core Values
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-[30px]">
                            {coreValues.map((value, index) => (
                                <div key={index} className="bg-white dark:bg-[#111116] p-[30px] rounded-[20px] shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1">
                                    <div className="w-[60px] h-[60px] bg-[#FFA500]/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                                        {<value.icon className="w-6 h-6 text-[#FFA500]" />}
                                    </div>
                                    <h4 className="text-xl font-semibold text-[#1B1E2B] dark:text-white mb-2 text-center">
                                        {value.title}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-center">
                                        {value.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}