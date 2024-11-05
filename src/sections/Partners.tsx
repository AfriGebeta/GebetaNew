import Image from "next/image";
import Container from "@/sections/Container";

export default function Partners() {
    return (
        <Container>
            <div className="flex flex-col justify-center items-center mt-[98px]">
                <p className="text-[12px] text-[#979BAA] tracking-20 leading-15 font-bold uppercase text-center">Location
                    solutions
                    powering 15+ innovative businesses</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-[32px] md:gap-[80px] items-center mt-[40px]">
                    <Image src="/assets/zayride.svg" alt="zayride logo" width={102} height={60}/>
                    <Image src="/assets/postoffice.svg" alt="Ethiopian post office logo" width={187} height={60}/>
                    <Image src="/assets/nid.svg" alt="National ID logo" width={58} height={59}/>
                    <Image src="/assets/adika.svg" alt="Adika logo" width={60} height={60}/>
                    <Image src="/assets/tewos.svg" alt="Alen home solutions logo" width={150} height={60}/>
                </div>
            </div>
        </Container>
    )
}