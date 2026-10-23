import Image from "next/image";
import heroMap from "../../../public/images/hero-map.webp";

export default function HeroMap() {
    return (
        <div aria-hidden className="hero-map pointer-events-none absolute inset-0 select-none">
            <Image src={heroMap} alt="" fill priority sizes="100vw" className="hero-map-image object-cover" />
        </div>
    );
}
