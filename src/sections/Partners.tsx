//@ts-nocheck
import Container from "@/sections/Container";

export default function Partners() {
    return (
        <Container>
            <div className="flex flex-col justify-center items-center mt-[98px]">
                <p className="text-[12px] text-[#979BAA] tracking-20 leading-15 font-bold uppercase text-center">1000+ Clients and Partners</p>
                <div className="w-full flex gap-[32px] md:justify-between flex-wrap items-center mt-[40px]">
                    <div className="fade-x h-[160px] w-full overflow-hidden opacity-100 dark:opacity-1 dark:grayscale">
                        <div
                            className="animate-scroll-x h-full w-full bg-[length:auto_80px] md:bg-[length:auto_140px]"
                            style={{
                                backgroundRepeat: "repeat-x",
                                backgroundImage: "url(/assets/partner.png)",
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        </Container>
    )
}