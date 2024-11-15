//@ts-nocheck
export default function Loading() {

    return (
        <div
            className="w-full fixed min-h-screen inset-0 z-50 flex flex-col items-center justify-center bg-background dark:bg-[#05050a]"
        >
            <div className="w-48 h-48 relative">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src="/assets/loader.webm" type="video/webm" />
                </video>
            </div>
            <h3 className="mt-4 text-[18px] md:text-[24px] uppercase text-foreground animate-pulse">
                Let us find your way
            </h3>
        </div>
    )
}