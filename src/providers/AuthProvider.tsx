// context/AuthContext.js
"use client";
import React, {createContext, useState} from 'react';
import useLocalStorage from "../hooks/use-local-storage";
import {useRouter} from "next/navigation";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useLocalStorage('currentUser', null);

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return JSON.parse(localStorage.getItem('isAuthenticated')) || false;
    });

    const login = (user) => {
        setIsAuthenticated(true);
        setCurrentUser(user); // Set the user data when logging in
        localStorage.setItem('isAuthenticated', JSON.stringify(true));
    };

    const logout = () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('currentUser');
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{isAuthenticated, currentUser, setCurrentUser, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};