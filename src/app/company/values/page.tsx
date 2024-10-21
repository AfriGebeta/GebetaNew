import Link from "next/link";
import Container from "@/app/components/Container";

export default function Values() {
    return (
        <Container>
            <div className="min-h-screen flex flex-col items-center">
                <h2 className="text-[#1B1E2B] dark:text-white text-[40px] text-center leading-50 mt-[40px]"><span
                    className="text-[#FFA500]">GebetaMaps</span> values</h2>
                <p className="w-3/4 text-[#62677F] text-[20px] text-center leading-25 mt-[32px]">Delivering high quality
                    services to our customers is our focus. Our core values drive how we work and how we build our team
                    through who we hire, reward, and promote.</p>
                <div className="flex justify-center items-center gap-[32px] mt-[44px]">
                    <Link
                        href="/auth/sign-up"
                        className="transition-all bg-[#FFA500] hover:bg-[#FFA500]/80 px-[30px] py-[15px] rounded-[8px] text-white text-[14px] font-bold">Sign
                        up
                        for free</Link>
                    <Link
                        href="https://www.docs.gebetamaps.app/geocoding"
                        className="px-[30px] py-[15px] transition-all border border-[#D2C09D] hover:border-[#FFA500] hover:text-[#FFA500] hover:bg-[#FFA500]/20 rounded-[8px] font-medium text-[#2E384E]"
                    >Documentation</Link>
                </div>
            </div>
        </Container>
    )
}