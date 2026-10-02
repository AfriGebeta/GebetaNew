//@ts-nocheck

import {useEffect} from 'react';
import {useRouter} from 'nextjs-toploader/app';
import {clearAuthStorage, getStoredToken, isTokenExpired} from '@/lib/session';

export const useAuth = () => {
    const router = useRouter();

    useEffect(() => {
        const isAuthenticated = JSON.parse(localStorage.getItem('isAuthenticated') as string);

        if (!isAuthenticated) {
            router.push('/auth/signin');
            return;
        }

        if (isTokenExpired(getStoredToken())) {
            clearAuthStorage();
            router.push('/auth/signin?session=expired');
        }
    }, [router]);
};