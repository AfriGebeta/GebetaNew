//@ts-nocheck
'use client';
import { useEffect, useState } from 'react';
import {SlidingNumber} from "@/components/motion-primitives/sliding-number";

export function Clock() {
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);

            const diffMs = midnight - now;

            const totalSeconds = Math.floor(diffMs / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            setHours(hours);
            setMinutes(minutes);
            setSeconds(seconds);
        };

        calculateTimeRemaining();

        const interval = setInterval(calculateTimeRemaining, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className='flex items-center gap-0.5 font-mono'>
            <SlidingNumber value={hours} padStart={true} />
            <span className='text-zinc-500'>:</span>
            <SlidingNumber value={minutes} padStart={true} />
            <span className='text-zinc-500'>:</span>
            <SlidingNumber value={seconds} padStart={true} />
        </div>
    );
}