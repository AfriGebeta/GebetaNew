import Pricing from "@/sections/Pricing";
import Container from "@/sections/Container";
import PricingSlider from "@/components/PricingSlider";

export default function PricingPage(){
    return (
        <Container>
            <Pricing />
            <PricingSlider />
        </Container>
    )
}