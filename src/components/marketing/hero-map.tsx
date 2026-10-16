import Image from "next/image";
import heroMap from "../../../public/images/hero-map.webp";

/**
 * The hero's backdrop: a street-level snapshot of Megenagna, Addis Ababa, on Gebeta tiles
 * (scripts/render-hero-map.mjs). Decorative, so hidden from assistive tech.
 */
export default function HeroMap() {
    return (
        <div aria-hidden className="hero-map pointer-events-none absolute inset-0 select-none">
            <Image src={heroMap} alt="" fill priority sizes="100vw" className="hero-map-image object-cover" />
        </div>
    );
}
