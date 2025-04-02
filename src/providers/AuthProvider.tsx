// @ts-nocheck
"use client";
import React, {createContext, useEffect, useState} from 'react';
import useLocalStorage from "../hooks/use-local-storage";
import {useRouter} from "next/navigation";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useLocalStorage('currentUser', null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsAuthenticated(JSON.parse(localStorage.getItem('isAuthenticated')))
    }, []);


    const login = (user) => {
        setIsAuthenticated(true);
        setCurrentUser(user); // Set the user data when logging in
        if(typeof window !== 'undefined'){
            localStorage.setItem('isAuthenticated', JSON.stringify(true));
        }
        console.log("login is bein called")
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