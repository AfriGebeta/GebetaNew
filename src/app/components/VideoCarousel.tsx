"use client"
import Image from "next/image";
import { useState } from "react";

export default function VideoCarousel() {
    const videos = [
        "https://www.youtube.com/embed/IYE3lYxlX5w",
        "https://www.youtube.com/embed/pTD69UWcH5Q",
        "https://www.youtube.com/embed/8cheBwH9M8k",
    ];

    const [currentVideoIndex, setCurrentVideoIndex] = useState(1);

    const nextVideo = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    };

    const prevVideo = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex - 1 + videos.length) % videos.length);
    };

    return (
        <div className="flex flex-col gap-8 justify-center items-center w-full mt-[120px] bg-custom pb-[40px]">
            <div className="relative w-full h-[400px] overflow-hidden">
                {videos.map((video, index) => {
                    const offset = index - currentVideoIndex;
                    const translateX = offset * 75; // Adjusted this value
                    const scale = offset === 0 ? 1 : 0.65; // Slightly increased the scale of side videos
                    const zIndex = offset === 0 ? 10 : 0;
                    const opacity = offset === 0 ? 1 : 0.5;

                    return (
                        <div
                            key={index}
                            className={`absolute top-1/2 left-1/2 w-[50%] aspect-video transition-all duration-500 ease-in-out`}
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
            <div className="flex gap-10 mt-4">
                <button
                    onClick={prevVideo}
                    className="focus:outline-none transition-transform hover:scale-[1.2]">
                    <Image src="/assets/prev-icon.svg" alt="prev icon button for carousel" width={12} height={19} />
                </button>
                <button
                    onClick={nextVideo}
                    className="focus:outline-none transition-transform hover:scale-[1.2]">
                    <Image
                        src="/assets/next-icon.svg" alt="next icon button for carousel" width={12} height={19} />
                </button>
            </div>
        </div>
    );
}