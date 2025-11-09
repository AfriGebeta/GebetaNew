//@ts-nocheck
import Container from "@/sections/Container";
import Link from "next/link";
import {Icons} from "@/components/icons";
import {ExternalLink} from "lucide-react";

export default function Footer() {
    const Icon = Icons.gebeta

    return (
        <footer
            className="w-full mt-[80px] bg-[#FFF7E8] dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-900 text-zinc-700 dark:text-white text-[14px] relative h-[800px] md:h-[560px]"
            style={{clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)"}}
        >
            <div className="fixed bottom-0 w-full">
                <Container className="flex flex-col justify-between">
                    <div className="flex flex-col md:flex-row justify-between gap-y-[32px] py-[64px]">
                        <div>
                            <p className="mt-[24px] text-[12px] font-medium">© {new Date().getFullYear()} GebetaMaps,
                                Inc. All rights
                                reserved.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-[32px]">
                            <div>
                                <h6 className="text-[16px] font-bold">Products</h6>
                                <ul className="mt-[16px] space-y-2">
                                    <li>
                                        <Link href="https://docs.gebeta.app/docs/geocoding/geocoding"
                                              className="hover:underline">Geocoding</Link>
                                    </li>
                                    <li><Link href="https://docs.gebeta.app/docs/direction"
                                              className="hover:underline">Direction</Link></li>
                                    <li><Link href="https://docs.gebeta.app/docs/matrix"
                                              className="hover:underline">Matrix</Link></li>
                                    <li><Link href="https://docs.gebeta.app/docs/route-optimization"
                                              className="hover:underline">Route
                                        optimization</Link></li>
                                    <li><Link href="https://docs.gebeta.app/docs/onm"
                                              className="hover:underline">ONM</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h6 className="text-[16px] font-bold">Resources</h6>
                                <ul className="mt-[16px] space-y-2">
                                    <li><Link href="https://gebeta.app/blog"
                                              className="hover:underline">Blog</Link></li>
                                    <li><Link href="https://docs.gebeta.app/"
                                              className="hover:underline">Documentation</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h6 className="text-[16px] font-bold">Legal</h6>
                                <ul className="mt-[16px] space-y-2">
                                    <li><Link href="/terms"
                                              className="hover:underline">Terms of Service</Link></li>
                                    <li><Link href="/privacy"
                                              className="hover:underline">Privacy Policy</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h6 className="text-[16px] font-bold">Social Media</h6>
                                <ul className="mt-[16px] space-y-2">
                                    <li>
                                        <Link href="https://www.instagram.com/gebetamaps"
                                              className="flex items-center gap-3 hover:underline">
                                            Instagram
                                            <ExternalLink className="text-[#ffa500] w-5 h-5"/>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="https://twitter.com/GebetaMaps"
                                              className="flex items-center gap-3 hover:underline">
                                            Twitter
                                            <ExternalLink className="text-[#ffa500] w-5 h-5"/>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="https://et.linkedin.com/company/gebetamaps"
                                              className="flex items-center gap-3 hover:underline">
                                            Linkedin
                                            <ExternalLink className="text-[#ffa500] w-5 h-5"/>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h6 className="text-[16px] font-bold">Contact</h6>
                                <p className="mt-[16px]">
                                    Bloom Tower<br/>
                                    Addis Ababa,<br/>
                                    Ethiopia<br/><br/>
                                    info@gebeta.app</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex gap-[16px] items-center justify-center">
                        <Icon className="hidden md:block md:w-[120px] md:h-[120px]"/>
                        <h3 className="text-[40px] md:text-[120px] lg:text-[160pxs] spacing tracking-wide">GebetaMaps</h3>
                    </div>
                </Container>
            </div>
        </footer>
    )
}