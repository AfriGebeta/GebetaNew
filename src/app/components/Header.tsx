import Link from "next/link";
import Container from "@/app/components/Container";

export default function Header() {
    return (
        <Container>
            <div className="flex flex-col items-center mt-[80px]">
                <h1 className="max-w-xl text-[48px] text-[#1B1E2B] text-center leading-60">Location Solutions,
                    Simplified.</h1>
                <p className="max-w-md text-[20px] text-[#62677F] leading-25 mt-[25px] text-center">Advanced
                    location
                    technology for businesses, developers, and logistics providers</p>
                <div className="flex justify-center items-center gap-[32px] mt-[44px]">
                    <Link
                        href="/auth/sign-up"
                        className="bg-[#FFA500] px-[30px] py-[15px] rounded-[8px] text-white text-[14px] font-bold">Sign
                        up
                        for free</Link>
                    <Link
                        href="/auth/sign-in"
                        className="px-[30px] py-[15px] border border-[#D2C09D] rounded-[8px] font-medium text-[#2E384E]"
                    >Contact sales</Link>
                </div>
            </div>
        </Container>
    )
}