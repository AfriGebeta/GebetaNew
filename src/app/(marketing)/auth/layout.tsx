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
            <div className="flex flex-col items-center mt-[40px] mt-[40px]">
                <div className="shadow rounded-lg px-8 py-6 w-full max-w-md">
                    {children}
                </div>
            </div>
        </Container>
    );
}