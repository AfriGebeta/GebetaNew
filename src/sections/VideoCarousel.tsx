"use client";
import Image from "next/image";
import {CSSProperties, useState} from "react";
import Container from "@/sections/Container";

const videos = [
    {id: "IYE3lYxlX5w", title: "Introduction: Gebeta Maps Mini Series 2024"},
    {id: "pTD69UWcH5Q", title: "Introducing Gebeta Maps"},
    {id: "8cheBwH9M8k", title: "Gebeta Maps"},
];

export default function VideoCarousel() {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(1);
    // YouTube players are only mounted once the user asks to play, so the page
    // doesn't pay for three iframes (~1MB of JS each) on first load.
    const [playingId, setPlayingId] = useState<string | null>(null);

    const goTo = (index: number) => {
        setPlayingId(null);
        setCurrentVideoIndex(index);
    };

    const nextVideo = () => goTo((currentVideoIndex + 1) % videos.length);
    const prevVideo = () => goTo((currentVideoIndex - 1 + videos.length) % videos.length);

    return (
        <div
            className="flex flex-col gap-4 sm:gap-8 justify-center items-center w-full mt-[60px] sm:mt-[120px] bg-custom pb-[20px] sm:pb-[40px] px-4 sm:px-[0px]">
            <Container className="max-w-8xl">
                <div className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] overflow-hidden">
                    {videos.map((video, index) => {
                        const offset = index - currentVideoIndex;
                        const isActive = offset === 0;
                        // Mobile vs desktop values are resolved in CSS so server and client render the same markup.
                        const style = {
                            "--offset": offset,
                            "--scale-sm": isActive ? 1 : 0,
                            "--scale": isActive ? 1 : 0.65,
                            "--opacity-sm": isActive ? 1 : 0,
                            "--opacity": isActive ? 1 : 0.5,
                            zIndex: isActive ? 10 : 0,
                            height: "100%",
                        } as CSSProperties;

                        return (
                            <div
                                key={video.id}
                                className="absolute top-1/2 left-1/2 w-full sm:w-[80%] md:w-[70%] lg:w-[40%] aspect-video transition-all duration-500 ease-in-out
                                    [transform:translate(-50%,-50%)_translateX(calc(var(--offset)*100%))_scale(var(--scale-sm))] opacity-[var(--opacity-sm)]
                                    sm:[transform:translate(-50%,-50%)_translateX(calc(var(--offset)*75%))_scale(var(--scale))] sm:opacity-[var(--opacity)]"
                                style={style}
                            >
                                {playingId === video.id ? (
                                    <iframe
                                        className="w-full h-full rounded-[16px] border-none"
                                        src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                                        title={video.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <button
                                        type="button"
                                        aria-label={`Play video: ${video.title}`}
                                        onClick={() => (isActive ? setPlayingId(video.id) : goTo(index))}
                                        className="group relative block w-full h-full overflow-hidden rounded-[16px] bg-black"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                                            alt={video.title}
                                            loading={isActive ? "eager" : "lazy"}
                                            decoding="async"
                                            className="w-full h-full object-cover"
                                        />
                                        <span
                                            className="absolute inset-0 m-auto flex h-12 w-[68px] items-center justify-center rounded-xl bg-[#FF0000] transition-transform group-hover:scale-110">
                                            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" aria-hidden="true">
                                                <path d="M8 5v14l11-7z"/>
                                            </svg>
                                        </span>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-center gap-6 sm:gap-10 mt-2 sm:mt-4">
                    <button
                        onClick={prevVideo}
                        aria-label="Previous video"
                        className="focus:outline-none transition-transform hover:scale-[1.2] p-2"
                    >
                        <Image
                            src="/assets/prev-icon.svg"
                            alt="prev icon button for carousel"
                            width={8}
                            height={15}
                            className="w-[8px] h-[15px] sm:w-[12px] sm:h-[19px]"
                        />
                    </button>
                    <button
                        onClick={nextVideo}
                        aria-label="Next video"
                        className="focus:outline-none transition-transform hover:scale-[1.2] p-2"
                    >
                        <Image
                            src="/assets/next-icon.svg"
                            alt="next icon button for carousel"
                            width={8}
                            height={15}
                            className="w-[8px] h-[15px] sm:w-[12px] sm:h-[19px]"
                        />
                    </button>
                </div>
            </Container>
        </div>
    );
}
