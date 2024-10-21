import Container from "@/app/components/Container";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="mt-[80px] bg-[#ffa500]/70 dark:bg-gray-800 text-[#FFF] text-[14px]">
            <Container>
                <div className="flex justify-between py-[100px]">
                    <div className="flex items-start">
                        <Image src="/assets/logo.svg" width={30} height={30} alt="logo"/>
                        <span className='text-[14px] font-bold tracking-wider'>GebetaMaps</span>
                    </div>

                    <div className="grid grid-cols-4 gap-[70px]">
                        <div>
                            <h6 className="text-[16px] font-bold">Features</h6>
                            <ul className="mt-[30px] space-y-2">
                                <li>Geocoding</li>
                                <li>Direction</li>
                                <li>Routing</li>
                                <li>Route optimization</li>
                                <li>ONM</li>
                            </ul>
                        </div>
                        <div>
                            <h6 className="text-[16px] font-bold">Success Stories</h6>
                            <ul className="mt-[30px] space-y-2">
                                <li>Zayride</li>
                                <li>NID</li>
                                <li>Adika</li>
                            </ul>
                        </div>
                        <div>
                            <h6 className="text-[16px] font-bold">Social Media</h6>
                            <ul className="mt-[30px] space-y-2">
                                <li className="flex items-center gap-[4px]">
                                    <Image
                                        src="/assets/instagram.svg"
                                        alt="Instagram icon"
                                        width={20}
                                        height={20}
                                    />
                                    Instagram
                                </li>
                                <li className="flex items-center gap-[4px]">
                                    <Image
                                        src="/assets/twitter.svg"
                                        alt="Twitter icon"
                                        width={20}
                                        height={20}
                                    />
                                    Twitter
                                </li>
                                <li className="flex items-center gap-[4px]">
                                    <Image
                                        src="/assets/linkedin.svg"
                                        alt="Linkedin icon"
                                        width={20}
                                        height={20}
                                    />Linkedin
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h6 className="text-[16px] font-bold">Contact</h6>
                            <p className="mt-[30px]">
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