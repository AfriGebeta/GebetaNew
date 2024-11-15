"use client";
import Image from "next/image";
import {useEffect, useState} from "react";

export default function VideoCarousel() {
    const videos = [
        "https://www.youtube.com/embed/IYE3lYxlX5w",
        "https://www.youtube.com/embed/pTD69UWcH5Q",
        "https://www.youtube.com/embed/8cheBwH9M8k",
    ];

    const [currentVideoIndex, setCurrentVideoIndex] = useState(1);
    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setWindowWidth(window.innerWidth);
        }
    }, []);

    const nextVideo = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    };

    const prevVideo = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex - 1 + videos.length) % videos.length);
    };

    return (
        <div className="flex flex-col gap-4 sm:gap-8 justify-center items-center w-full mt-[60px] sm:mt-[120px] bg-custom pb-[20px] sm:pb-[40px] px-4 sm:px-[0px]">
            <div className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] overflow-hidden">
                {videos.map((video, index) => {
                    const offset = index - currentVideoIndex;
                    const translateX = offset * (windowWidth < 640 ? 100 : 75);
                    const scale = offset === 0 ? 1 : windowWidth < 640 ? 0 : 0.65;
                    const zIndex = offset === 0 ? 10 : 0;
                    const opacity = offset === 0 ? 1 : windowWidth < 640 ? 0 : 0.5;

                    return (
                        <div
                            key={index}
                            className={`absolute top-1/2 left-1/2 w-full sm:w-[80%] md:w-[70%] lg:w-[50%] aspect-video transition-all duration-500 ease-in-out`}
                            style={{
                                transform: `translate(-50%, -50%) translateX(${translateX}%) scale(${scale})`,
                                opacity,
                                zIndex,
                                height: '100%',
                            }}
                        >
                            <iframe
                                className="w-full h-full rounded-[8px] border-none"
                                src={video}
                                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ objectFit: 'cover' }}
                            ></iframe>
                        </div>
                    );
                })}
            </div>
            <div className="flex gap-6 sm:gap-10 mt-2 sm:mt-4">
                <button
                    onClick={prevVideo}
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
        </div>
    );
}