import Container from "@/sections/Container";

export default function Partners() {
    return (
        <Container className="flex flex-col gap-6 pb-16 pt-20 md:pb-20 md:pt-24">
            <p className="text-[15px] text-soft">Trusted by more than 1,000 businesses and public institutions</p>
            <div className="fade-x h-[80px] w-full overflow-hidden grayscale md:h-[120px] dark:invert">
                <div
                    className="animate-scroll-x h-full w-full bg-[length:auto_64px] bg-repeat-x md:bg-[length:auto_100px]"
                    style={{ backgroundImage: "url(/assets/partner.png)" }}
                />
            </div>
        </Container>
    );
}
