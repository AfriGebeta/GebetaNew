//@ts-nocheck

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';

export const useAuth = () => {
    const router = useRouter();

    useEffect(() => {
        const isAuthenticated = JSON.parse(localStorage.getItem('isAuthenticated'));
        if (!isAuthenticated) {
            router.push('/auth/signin');
        }
    }, [router]);
};