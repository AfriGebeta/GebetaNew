// @ts-nocheck
"use client";
import React, {createContext, useEffect, useState} from 'react';
import useLocalStorage from "../hooks/use-local-storage";
import {usePathname, useRouter} from "next/navigation";
import {User} from "@/types/user";


interface AuthContextType {
    isAuthenticated: boolean;
    currentUser: User;
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

    useEffect(() => {
        setIsAuthenticated(JSON.parse(localStorage.getItem('isAuthenticated') as string))
    }, []);

    useEffect(() => {
        if(isAuthenticated && UN_PROTECTED_ROUTES.includes(pathname)) {
            router.push('/dashboard');
        }
    }, [isAuthenticated]);


    const login = (user) => {
        setIsAuthenticated(true);
        setCurrentUser(user); // Set the user data when logging in
        if(typeof window !== 'undefined'){
            localStorage.setItem('isAuthenticated', JSON.stringify(true));
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        if(typeof window !== 'undefined'){
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('currentUser');
        }
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{isAuthenticated, currentUser, setCurrentUser, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};