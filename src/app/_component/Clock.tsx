//@ts-nocheck

'use client';
import { useEffect, useState } from 'react';
import { SlidingNumber } from '@/components/motion-primitives/sliding-number';

export function Clock() {
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const calculateTimeRemaining = () => {
            // Get current time in Addis Ababa (UTC+3)
            const now = new Date();
            const target = new Date();

            // Set target to tomorrow at 12:00 PM (noon) in Addis Ababa
            target.setDate(target.getDate() + 1);
            target.setHours(12, 0, 0, 0);

            const diffMs = target - now;

            if (diffMs <= 0) {
                setIsComplete(true);
                setHours(0);
                setMinutes(0);
                setSeconds(0);
                return;
            }

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

        if (isComplete) {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isComplete]);

    return (
        <div className='flex flex-col items-center gap-2'>
            <div className='flex items-center gap-0.5 font-mono'>
                <SlidingNumber value={hours} padStart={true} />
                <span className='text-zinc-500'>:</span>
                <SlidingNumber value={minutes} padStart={true} />
                <span className='text-zinc-500'>:</span>
                <SlidingNumber value={seconds} padStart={true} />
            </div>
        </div>
    );
}