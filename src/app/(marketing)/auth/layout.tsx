//@ts-nocheck
"use client";
import React from 'react';
import Container from "@/sections/Container";

export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <Container>
            <div className="flex flex-col items-center mt-[120px]">
                <div className="rounded-lg px-8 py-6 mt-12 w-full max-w-md">
                    {children}
                </div>
            </div>
        </Container>
    );
}