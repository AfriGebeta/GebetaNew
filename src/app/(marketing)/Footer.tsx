//@ts-nocheck
import Container from "@/sections/Container";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full mt-[80px] bg-gray-50 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-900 text-zinc-700 dark:text-white text-[14px]">
            <Container>
                <div className="flex flex-col md:flex-row justify-between gap-y-[32px] py-[64px]">
                    <div>
                        <div className="flex gap-[4px] items-center">
                            <Image
                                src="/assets/logo.svg"
                                width={40}
                                height={40}
                                alt="Gebeta Maps logo"
                            />
                            <h3 className="text-lg font-bold">GebetaMaps</h3>
                        </div>
                        <p className="mt-[24px] text-[12px] text-[#a0a0a0]">© 2024 GebetaMaps, Inc. All rights
                            reserved.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-[32px]">
                        <div>
                            <h6 className="text-[16px] font-bold">Products</h6>
                            <ul className="mt-[16px] space-y-2">
                                <li>
                                    <Link href="https://docs.gebeta.app/docs/geocoding/geocoding">Geocoding</Link>
                                </li>
                                <li><Link href="https://docs.gebeta.app/docs/direction">Direction</Link></li>
                                <li><Link href="https://docs.gebeta.app/docs/matrix">Matrix</Link></li>
                                <li><Link href="https://docs.gebeta.app/docs/route-optimization">Route optimization</Link></li>
                                <li><Link href="https://docs.gebeta.app/docs/onm">ONM</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h6 className="text-[16px] font-bold">Resources</h6>
                            <ul className="mt-[16px] space-y-2">
                                <Link href="https://gebeta.app/blog">Blog</Link>
                                <Link href="https://docs.gebeta.app/">Documentation</Link>
                            </ul>
                        </div>
                        <div>
                            <h6 className="text-[16px] font-bold">Legal</h6>
                            <ul className="mt-[16px] space-y-2">
                                <li><Link href="/terms">Terms of Service</Link></li>
                                <li><Link href="/privacy">Privacy Policy</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h6 className="text-[16px] font-bold">Social Media</h6>
                            <ul className="mt-[16px] space-y-2">
                                <li>
                                    <Link href="https://www.instagram.com/gebetamaps"
                                          className="flex items-center gap-[4px]">
                                        <Image
                                            src="/assets/instagram.svg"
                                            alt="Instagram icon"
                                            width={20}
                                            height={20}
                                        />
                                        Instagram
                                    </Link>
                                </li>
                                <li>
                                    <Link href="https://twitter.com/GebetaMaps" className="flex items-center gap-[4px]">
                                        <Image
                                            src="/assets/twitter.svg"
                                            alt="Twitter icon"
                                            width={20}
                                            height={20}
                                        />
                                        Twitter
                                    </Link>
                                </li>
                                <li>
                                    <Link href="https://et.linkedin.com/company/gebetamaps"
                                          className="flex items-center gap-[4px]">
                                        <Image
                                            src="/assets/linkedin.svg"
                                            alt="Linkedin icon"
                                            width={20}
                                            height={20}
                                        />
                                        Linkedin
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
            </Container>
        </footer>
    )
}