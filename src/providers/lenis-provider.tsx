"use client";
import {ReactLenis} from "@studio-freight/react-lenis";
import {FC, useRef} from "react";

type LenisScrollProviderProps = {
    children: React.ReactNode;
};
const LenisScrollProvider: FC<LenisScrollProviderProps> = ({children}) => {
    const lenisRef = useRef(null);
    return <ReactLenis ref={lenisRef} root
                       options={{lerp: 0.07, duration: 0.9, smoothWheel: true}}>{children}</ReactLenis>;
};

export default LenisScrollProvider;