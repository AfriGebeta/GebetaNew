import Image from "next/image";
import Container from "@/app/components/Container";

export default function Highlight() {
    return (
        <Container>
            <div className="mt-[104px] flex flex-col items-center">
                <h4 className="text-[#979BAA] text-[12px] tracking-20 leading-15 font-bold uppercase text-center">This
                    is GebetaMaps</h4>
                <h2 className="text-[#1B1E2B] dark:text-white text-[40px] text-center leading-50 mt-[10px]">All in One Location
                    Solution</h2>
                <p className="max-w-[544px] text-[20px] text-[#62677F] text-center leading-25 mt-[32px]">We are your
                    one-stop solution for geocoding, routing, and location intelligence with our powerful API for
                    developers.</p>
                <div className="flex items-center gap-[40px] mt-[48px]">
                    <div className="flex items-center gap-[16px]">
                        <div
                            className="w-[72px] h-[72px] flex justify-center items-center bg-[#FFF7E8] dark:bg-zinc-900 rounded-[16px]">
                            <Image src="/assets/speed.svg" alt="speed icon" width={42} height={20}/>
                        </div>
                        <h5 className="text-[#373D48] text-[16px] font-bold">High-performance</h5>
                    </div>
                    <div className="flex items-center gap-[16px]">
                        <div
                            className="w-[72px] h-[72px] flex justify-center items-center bg-[#FFF7E8] dark:bg-zinc-900 rounded-[16px]">
                            <Image src="/assets/user-male.svg" alt="user expressing love icon" width={30}
                                   height={35}/>
                        </div>
                        <h5 className="text-[#373D48] text-[16px] font-bold">Easy to implement</h5>
                    </div>
                    <div className="flex items-center gap-[16px]">
                        <div
                            className="w-[72px] h-[72px] flex justify-center items-center bg-[#FFF7E8] dark:bg-zinc-900 rounded-[16px]">
                            <Image src="/assets/toolbox.svg" alt="toolbox icon" width={49} height={30}/>
                        </div>
                        <h5 className="text-[#373D48] text-[16px] font-extrabold">Feature-rich API</h5>
                    </div>
                </div>
            </div>
        </Container>
    )
}