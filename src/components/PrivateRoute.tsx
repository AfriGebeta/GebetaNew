//@ts-nocheck
"use client"
import React, {useContext, useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {AuthContext} from "@/providers/AuthProvider";
import Spinner from "@/components/Spinner";
import {isTokenExpired} from "@/lib/session";

const ProtectedRoute = ({children}) => {
    const router = useRouter();
    const {currentUser} = useContext(AuthContext);
    const [isClient, setIsClient] = useState(false);

    const hasValidSession = !!currentUser && !isTokenExpired(currentUser?.token);

    useEffect(() => {
        setIsClient(true);
        if (!hasValidSession) {
            router.push('/auth/signin');
        }
    }, [hasValidSession, router]);

    if (!isClient) {
        return null;
    }

    if (!hasValidSession) {
        return <Spinner/>
    }

    return <>{children}</>;
};

export default ProtectedRoute;