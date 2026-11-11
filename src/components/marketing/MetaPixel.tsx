import Script from "next/script";
import { META_PIXEL_NOSCRIPT_SRC, META_PIXEL_SCRIPT } from "@/lib/meta-pixel";

export default function MetaPixel() {
    return (
        <>
            <Script id="meta-pixel" strategy="afterInteractive">
                {META_PIXEL_SCRIPT}
            </Script>
            <noscript>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img height="1" width="1" style={{ display: "none" }} src={META_PIXEL_NOSCRIPT_SRC} alt="" />
            </noscript>
        </>
    );
}
