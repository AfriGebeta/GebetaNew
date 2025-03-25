//@ts-nocheck

import {useEffect} from 'react';
import {useRouter} from 'nextjs-toploader/app';

export const useAuth = () => {
    const router = useRouter();

    useEffect(() => {
        const isAuthenticated = JSON.parse(localStorage.getItem('isAuthenticated'));
        if (!isAuthenticated) {
            router.push('/auth/signin');
        }
    }, [router]);
};