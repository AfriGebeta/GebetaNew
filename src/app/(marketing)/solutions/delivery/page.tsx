import Link from "next/link";

export default function Delivery() {
    return (
        <div className="min-h-screen">
            <h2 className="text-[#1B1E2B] dark:text-white text-[40px] text-center leading-50 mt-[40px]">Delivery</h2>
            <p className="text-[#62677F] text-[20px] text-center leading-25 mt-[32px]">GebetaMaps simplifies every phase of running a delivery business</p>
            <div className="flex justify-center items-center gap-[32px] mt-[44px]">
                <Link
                    href="/auth/sign-up"
                    className="transition-all bg-[#FFA500] hover:bg-[#FFA500]/80 px-[30px] py-[15px] rounded-[8px] text-white text-[14px] font-bold">Contact sales</Link>
                <Link
                    href="https://www.docs.gebetamaps.app/geocoding"
                    className="px-[30px] py-[15px] transition-all border border-[#D2C09D] hover:border-[#FFA500] hover:text-[#FFA500] hover:bg-[#FFA500]/20 rounded-[8px] font-medium text-[#2E384E] dark:text-white"
                >Get Started</Link>
            </div>
        </div>
    )
}