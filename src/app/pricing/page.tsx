import Container from "@/app/components/Container";
import Pricing from "@/app/components/Pricing";

export default function Page() {
    return (
        <Container>
            <div className="flex flex-col">
                <Pricing/>
            </div>
        </Container>
    )
}