"use client";
import {Clock} from "@/app/_component/Clock";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Announcement() {
    const [isVisible, setIsVisible] = useState(true);

    // Optional: Save the closed state in localStorage to remember user preference
    useEffect(() => {
        const announcementClosed = localStorage.getItem("announcementClosed");
        if (announcementClosed === "true") {
            setIsVisible(false);
        }
    }, []);

    const closeAnnouncement = () => {
        setIsVisible(false);
        // Optional: Save the closed state in localStorage
        localStorage.setItem("announcementClosed", "true");

        // Adjust the navbar position after closing
        const navbar = document.getElementById("navbar-container");
        if (navbar) {
            navbar.style.top = "0";
        }
    };

    // If announcement is closed, adjust navbar position
    useEffect(() => {
        const navbar = document.getElementById("navbar-container");
        if (navbar) {
            navbar.style.top = isVisible ? "68px" : "0";
        }
    }, [isVisible]);

    if (!isVisible) {
        return null;
    }

    return (
        <div id="announcement" className="fixed top-0 left-0 right-0 z-[1001] w-full">
            <div className="max-w-[85rem] mx-auto">
                <div
                    className="bg-blue-600 bg-[url('/assets/banner.jpg')] bg-no-repeat bg-cover bg-1% p-4 text-center relative">
                    <div className="flex flex-wrap justify-center items-center gap-2">
                        <Clock />
                        <p className="inline-block text-white">
                            GebetaMap Tile will be live coming soon.
                        </p>
                        <Link className="py-1.5 px-2.5 md:py-2 md:px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-full border-2 border-white text-white hover:border-white/70 hover:text-white/70 focus:outline-hidden focus:border-white/70 focus:text-white/70 disabled:opacity-50 disabled:pointer-events-none"
                              href="/blog">
                            Learn more
                            <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                 strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6"/>
                            </svg>
                        </Link>
                    </div>
                    {/* Close button */}
                    <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white/70 focus:outline-none"
                        onClick={closeAnnouncement}
                        aria-label="Close announcement"
                    >
                        <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18"></path>
                            <path d="M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}