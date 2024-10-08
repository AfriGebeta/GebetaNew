import Image from 'next/image';
import Link from "next/link";
import Container from "@/app/components/Container";
export default function Navbar() {
    return (
        <Container>
            <nav className="flex justify-between items-center mt-[30px]">
                <div className="flex items-start">
                    <Image src="/assets/logo.svg" width={30} height={30} alt="logo"/>
                    <span className='text-[14px] text-[#2E384E] font-semibold tracking-wider'>GebetaMaps</span>
                </div>

                <div>
                    <ul className="flex gap-[40px] text-[#2E384E] text-[14px] font-medium">
                        <li className="flex items-center gap-[6px]">
                            Products
                            <Image src="/assets/nav-icon.svg" width="7" height="5" alt="nav drop down icon"/>
                        </li>
                        <li className="flex items-center gap-[6px]">
                            Solutions
                            <Image src="/assets/nav-icon.svg" width="7" height="5" alt="nav drop down icon"/>
                        </li>
                        <li className="flex items-center gap-[6px]">
                            Developers
                            <Image src="/assets/nav-icon.svg" width="7" height="5" alt="nav drop down icon"/>
                        </li>
                        <li className="flex items-center gap-[6px]">
                            Company
                            <Image src="/assets/nav-icon.svg" width="7" height="5" alt="nav drop down icon"/>
                        </li>
                        <li>Blog</li>
                        <li>Pricing</li>
                    </ul>
                </div>

                <div className="flex gap-[32px] text-[#2E384E] text-[14px]">
                    <div className="flex items-center gap-[4px]">
                        <Image
                            src="/assets/user.svg"
                            alt="user icon"
                            width={24}
                            height={24}/>
                        <Link
                            className="font-medium"
                            href="/auth/sign-in"
                        >Sign In</Link>
                    </div>
                    <div className="px-[30px] py-[15px] border border-[#D2C09D] text-[14px] rounded-[8px]">
                        <Link
                            className="font-bold"
                            href="/auth/signup"
                        >Get Started</Link>
                    </div>
                </div>
            </nav>
        </Container>
    )
}