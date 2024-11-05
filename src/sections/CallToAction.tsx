import Container from "@/sections/Container";
import Link from "next/link";
import Image from "next/image";

export default function CallToAction() {
    return (
        <div className="relative mt-[180px]">
            <Container>
                <h2 className="text-[#1B1E2B] dark:text-white text-[40px] text-center">Ready to get started ?</h2>
                <p className="mt-[42px] text-[#62677F] text-[20px] text-center">Create an account or talk to one of
                    our experts.</p>

                <div className="flex justify-center items-center gap-[32px] mt-[60px]">
                    <Link
                        href="/auth/sign-up"
                        className="transition-all bg-[#FFA500] hover:bg-[#FFA500]/80 px-[30px] py-[15px] rounded-[8px] text-white text-[14px] font-bold whitespace-nowrap">Sign
                        up
                        for free</Link>
                    <Link
                        href="/auth/sign-in"
                        className="px-[30px] py-[15px] transition-all border border-[#D2C09D] hover:border-[#FFA500] hover:text-[#FFA500] hover:bg-[#FFA500]/20 rounded-[8px] font-medium text-[#2E384E] dark:text-white whitespace-nowrap"
                    >Contact sales</Link>
                </div>

                <Image
                    className="hidden lg:block lg:absolute lg:top-[32%] lg:right-[24%]"
                    src="/assets/pointing-arrow.svg"
                    alt="an arrow pointing to call to action buttons"
                    width={128}
                    height={113}
                />
            </Container>

        </div>
    )
}