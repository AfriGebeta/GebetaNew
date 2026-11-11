"use client";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import Button from "@/components/ui/button";
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
        <section className="flex w-full flex-col items-center gap-4 pb-24 pt-8 sm:gap-8 md:pb-28">
            <Container className="flex flex-col gap-10">
                <h2 className="text-[36px] font-medium leading-[1.05] tracking-[-0.03em] text-foreground md:text-[48px]">
                    See it in motion
                </h2>
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
                                        className="w-full h-full rounded-xl border-none"
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
                                        className="group relative block w-full h-full overflow-hidden rounded-xl bg-black"
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
                                            className="absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full bg-ink text-ink-foreground transition-transform duration-150 ease-power3-out group-hover:scale-110">
                                            <Play aria-hidden className="size-6 fill-current"/>
                                        </span>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-center gap-2">
                    <Button variant="secondary" size="icon" onClick={prevVideo} aria-label="Previous video">
                        <ChevronLeft aria-hidden/>
                    </Button>
                    <Button variant="secondary" size="icon" onClick={nextVideo} aria-label="Next video">
                        <ChevronRight aria-hidden/>
                    </Button>
                </div>
            </Container>
        </section>
    );
}
