//@ts-nocheck
import Container from "@/sections/Container";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full mt-[80px] bg-[#574B35] dark:bg-[#05050a] text-[#FFF] text-[14px]">
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
                                <Link href="https://gebeta-docs.vercel.app/docs/geocoding/geocoding">Geocoding</Link>
                                <Link href="https://gebeta-docs.vercel.app/docs/direction">Direction</Link>
                                <Link href="https://gebeta-docs.vercel.app/docs/matrix">Matrix</Link>
                                <Link href="https://gebeta-docs.vercel.app/docs/route-optimization">Route optimization</Link>
                                <Link href="https://gebeta-docs.vercel.app/docs/onm">ONM</Link>
                            </ul>
                        </div>
                        <div>
                            <h6 className="text-[16px] font-bold">Resources</h6>
                            <ul className="mt-[16px] space-y-2">
                                <Link href="https://gebeta-docs.vercel.app">Documentation</Link>
                            </ul>
                        </div>
                        <div>
                            <h6 className="text-[16px] font-bold">Legal</h6>
                            <ul className="mt-[16px] space-y-2">
                                <Link href="/terms">Terms of Service</Link>
                                <Link href="/privacy">Privacy Policy</Link>
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
                                Bloom Tour<br/>
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