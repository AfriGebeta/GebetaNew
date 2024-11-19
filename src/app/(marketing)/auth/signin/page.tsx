//@ts-nocheck
"use client";
import React, {useContext, useState} from 'react';
import Link from "next/link";
import {useRouter} from 'next/navigation';
import {useMutation} from "@tanstack/react-query";
import {apiClient} from "@/service/apiClient";
import {AuthContext} from "@/providers/AuthProvider";
import {BarLoader} from "react-spinners";

const SignIn: React.FC = () => {
    const {login, setCurrentUser} = useContext(AuthContext);

    // const [_, setCurrentUser] = useLocalStorage({
    //     key: 'currentUser',
    //     defaultValue: null,
    // });

    // const [__, setAuthToken] = useLocalStorage({
    //     key: 'authToken',
    //     defaultValue: null,
    // });

    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const signInMutation = useMutation({
        mutationFn: async () => {
            const response = await apiClient.post("/auth/login", {
                username,
                password
            });
            return response.data; // Assuming the response contains user data
        },
        onSuccess: (data) => {
            console.log('Sign-in successful:', data.data);
            login(); // Update authentication state
            setCurrentUser(data.data); // Store user data in local storage
            // setAuthToken(data.data.token); // Store auth token in local storage
            router.push('/dashboard'); // Redirect to dashboard
        },
        onError: (error: any) => {
            const errorCode = error.response?.data?.error?.code;

            switch (errorCode) {
                case 'HE00009':
                    setError('Invalid username or password. Please check your credentials and try again.');
                    break;
                case 'HE00003':
                    setError('Account not found. Please check your username or create a new account.');
                    break;
                default:
                    setError('An error occurred while signing in. Please try again later.');
            }
        },

    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        try {
            await signInMutation.mutateAsync();
        } catch (error) {
            console.error('Sign-in error:', error);
        }
    };

    return (
        <>
            <h2 className="text-[#1B1E2B] dark:text-white text-[40px] text-center leading-50">
                Sign in
            </h2>
            <form className="space-y-6 mt-[40px]" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Enter your username"
                        className="mt-1 block w-full px-3 py-2 border border-[#D1D5DB] rounded-md shadow-sm
                                   focus:outline-none focus:ring focus:ring-[#FFA500]
                                   focus:border-[#FFA500] dark:bg-gray-700 dark:border-gray-600
                                   dark:text-gray-300 transition duration-200 ease-in-out"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        className="mt-1 block w-full px-3 py-2 border border-[#D1D5DB] rounded-md shadow-sm
                                   focus:outline-none focus:ring focus:ring-[#FFA500]
                                   focus:border-[#FFA500] dark:bg-gray-700 dark:border-gray-600
                                   dark:text-gray-300 transition duration-200 ease-in-out"
                    />
                </div>
                {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <button type="submit"
                        className="w-full h-[40px] flex justify-center items-center px-4 bg-[#FFA500] text-white rounded-md hover:opacity-75">
                    {signInMutation.isPending ? <BarLoader color="white"/> : "Sign In"}
                </button>
                <p className="text-[12px] text-gray-600 dark:text-gray-300">
                    Don't have an account? <Link href="/auth/register"
                                                 className="text-[#FFA500] hover:opacity-75"> Sign up for
                    GebetaMaps</Link>
                </p>
                <Link href="/auth/reset-password" className="text-[12px] text-[#FFA500] mt-[12px]">Forgot
                    your password?</Link>
            </form>
        </>
    );
};

export default SignIn;