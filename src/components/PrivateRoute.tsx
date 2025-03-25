'use client';

import {useRouter} from 'nextjs-toploader/app';
import {ReactNode, useContext, useEffect, useState} from 'react';
import {AuthContext} from '@/providers/AuthProvider';

interface ProtectedRouteProps {
    children: ReactNode;
    fallbackUrl?: string;
}

const ProtectedRoute = ({
                            children,
                            fallbackUrl = '/auth/signin'
                        }: ProtectedRouteProps) => {
    const router = useRouter();
    const {currentUser, loading} = useContext(AuthContext);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !loading && !currentUser) {
            router.replace(fallbackUrl);
        }
    }, [currentUser, loading, mounted, router, fallbackUrl]);

    // Don't render anything during SSR or before mounting
    if (!mounted) {
        return null;
    }

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"/>
            </div>
        );
    }

    // If authenticated, render children
    if (currentUser) {
        return <>{children}</>;
    }

    // Return null while redirecting
    return null;
};

export default ProtectedRoute;