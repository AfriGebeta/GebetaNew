"use client";
import {useEffect, useState} from "react";
import Link from "next/link";
import {Clock} from "@/app/_component/Clock";

export default function Announcement() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const announcementClosed = localStorage.getItem("announcementClosed");
        if (announcementClosed === "true") {
            setIsVisible(false);
        }
    }, []);

    const closeAnnouncement = () => {
        setIsVisible(false);
        localStorage.setItem("announcementClosed", "true");

        const navbar = document.getElementById("navbar-container");
        if (navbar) {
            navbar.style.top = "0";
        }
    };

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
            <div className="w-full">
                <div
                    className="relative bg-blue-600 bg-[url('/assets/banner.jpg')] bg-1% bg-no-repeat bg-cover p-4 text-center">
                    <div className="absolute inset-0 bg-black/40 md:bg-transparent"></div>

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 px-4">
                            <div className="flex items-center gap-2">
                                <p className="text-sm sm:text-base text-white font-medium">
                                    GebetaMap Tile is now live.
                                </p>
                            </div>
                            <Link
                                className="py-1.5 px-2.5 md:py-2 md:px-3 inline-flex items-center justify-center gap-x-2 text-sm font-medium rounded-full border-2 border-white text-white hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                                href="/blog/gebeta-tile"
                            >
                                Learn more
                                <svg
                                    className="shrink-0 size-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="m9 18 6-6-6-6"/>
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Close button */}
                    <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white hover:bg-white/10 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 z-20"
                        onClick={closeAnnouncement}
                        aria-label="Close announcement"
                    >
                        <svg
                            className="size-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 6L6 18"></path>
                            <path d="M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}