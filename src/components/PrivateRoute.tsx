"use client"
import React, {useContext, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import useLocalStorage from "@/hooks/use-local-storage";
import {AuthContext} from "@/providers/AuthProvider"; // Import your custom hook

const ProtectedRoute = ({children}) => {
    const router = useRouter();
    const {currentUser} = useContext(AuthContext)

    useEffect(() => {
        if (!currentUser) {
            // Redirect to the login page if user is not authenticated
            router.push('/auth/signin'); // Adjust the path as necessary
        }
    }, [currentUser, router]);

    if (!currentUser) {
        // Optionally render a loading state while redirecting
        return <div>Loading...</div>;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
