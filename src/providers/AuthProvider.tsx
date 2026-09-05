// @ts-nocheck
"use client";
import React, {createContext, useCallback, useEffect, useRef, useState} from 'react';
import useLocalStorage from "../hooks/use-local-storage";
import {usePathname, useRouter} from "next/navigation";
import {User} from "@/types/user";
import {
    SESSION_EXPIRED_EVENT,
    clearAuthStorage,
    getStoredToken,
    isTokenExpired,
} from "@/lib/session";
import {queryClient} from "@/providers/QueryProvider";


interface AuthContextType {
    isAuthenticated: boolean;
    currentUser: {token:string, user: User};
    setCurrentUser: (user: User) => void;
    login: (user: User) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    currentUser: null,
});

export const AuthProvider = ({children}) => {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useLocalStorage('currentUser', null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const pathname = usePathname()

    const UN_PROTECTED_ROUTES = [
        "/",
        "/auth/signin",
        "/auth/register",
        "/auth/reset-password",
    ]

    const clearSession = useCallback(() => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        clearAuthStorage();
        queryClient.clear();
    }, [setCurrentUser]);

    const expiringRef = useRef(false);

    const forceLogout = useCallback(() => {
        if (expiringRef.current) return;
        expiringRef.current = true;
        clearSession();
        router.replace("/auth/signin?session=expired");
        setTimeout(() => {
            expiringRef.current = false;
        }, 1000);
    }, [clearSession, router]);

    useEffect(() => {
        setIsAuthenticated(JSON.parse(localStorage.getItem('isAuthenticated') as string))
    }, []);

    useEffect(() => {
        if (isAuthenticated && UN_PROTECTED_ROUTES.includes(pathname)) {
            router.push('/dashboard');
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const checkExpiry = () => {
            const token = getStoredToken();
            const authFlag = localStorage.getItem('isAuthenticated');
            if ((token || authFlag) && isTokenExpired(token)) {
                forceLogout();
            }
        };

        const onStorage = (event: StorageEvent) => {
            if (event.key === 'currentUser' && event.newValue === null) {
                clearSession();
            } else {
                checkExpiry();
            }
        };

        checkExpiry();

        const interval = setInterval(checkExpiry, 30_000);
        window.addEventListener('focus', checkExpiry);
        window.addEventListener('storage', onStorage);
        window.addEventListener(SESSION_EXPIRED_EVENT, forceLogout);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', checkExpiry);
            window.removeEventListener('storage', onStorage);
            window.removeEventListener(SESSION_EXPIRED_EVENT, forceLogout);
        };
    }, [forceLogout, clearSession]);

    const login = (user) => {
        expiringRef.current = false;
        setIsAuthenticated(true);
        setCurrentUser(user); // Set the user data when logging in
        if (typeof window !== 'undefined') {
            localStorage.setItem('isAuthenticated', JSON.stringify(true));
        }
    };

    const logout = useCallback(() => {
        clearSession();
        router.push("/");
    }, [clearSession, router]);

    return (
        <AuthContext.Provider value={{isAuthenticated, currentUser, setCurrentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};