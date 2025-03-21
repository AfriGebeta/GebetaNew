import Link from "next/link";
import Container from "@/sections/Container";

export default function Header() {
    return (
        <Container>
            <div className="w-full flex flex-col items-center mt-[40px]">
                <h1 className="max-w-xl text-[40px] md:text-[48px] text-[#1B1E2B] dark:text-white text-center leading-60">Location Solutions,
                    Simplified.</h1>
                <p className="max-w-md text-[20px] text-[#62677F] leading-25 mt-[25px] text-center">Advanced
                    location
                    technology for businesses, developers, and logistics providers</p>
                <div className="flex justify-center items-center gap-[32px] mt-[44px]">
                    <Link
                        href="/auth/register"
                        className="transition-all bg-[#FFA500] hover:bg-[#FFA500]/80 border border-[#FFA500] px-[30px] py-[15px] rounded-[8px] text-white text-[14px] font-bold whitespace-nowrap">Sign
                        up
                        for free</Link>
                    <Link
                        href="/contact"
                        className="px-[30px] py-[15px] transition-all border border-[#D2C09D] hover:border-[#FFA500] hover:text-[#FFA500] hover:bg-[#FFA500]/20 rounded-[8px] font-medium text-[#2E384E] dark:text-white whitespace-nowrap"
                    >Contact sales</Link>
                </div>
            </div>
        </Container>
    )
}