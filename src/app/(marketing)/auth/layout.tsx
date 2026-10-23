import React from "react";
import Container from "@/sections/Container";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <Container>
            <div className="flex flex-col items-center py-24">
                <div className="w-full max-w-sm">{children}</div>
            </div>
        </Container>
    );
}
