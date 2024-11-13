//@ts-nocheck
"use client"
import React, {useContext, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {AuthContext} from "@/providers/AuthProvider";

const ProtectedRoute = ({children}) => {
    const router = useRouter();
    const { currentUser } = useContext(AuthContext);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (!currentUser) {
            router.push('/auth/signin');
        }
    }, [currentUser, router]);

    // Return null during server-side rendering and initial client render
    if (!isClient) {
        return null;
    }

    // Show loading state only on client-side when not authenticated
    if (!currentUser) {
        return <div>Loading...</div>;
    }

    return <>{children}</>;
};

export default ProtectedRoute;