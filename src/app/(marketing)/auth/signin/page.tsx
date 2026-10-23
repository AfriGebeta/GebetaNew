//@ts-nocheck
"use client";
import React, { useContext, useEffect, useState } from 'react';
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from 'nextjs-toploader/app';
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/service/apiClient";
import { AuthContext } from "@/providers/AuthProvider";
import Button from "@/components/ui/button";
import Field from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Notice from "@/components/ui/notice";
import AuthHeading from "../_components/auth-heading";

const SignIn: React.FC = () => {
    const { login, setCurrentUser } = useContext(AuthContext);
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    //read from location
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('session') === 'expired') {
            setError('Your session has expired. Please sign in again.');
        }
    }, []);

    const signInMutation = useMutation({
        mutationFn: async () => {
            const response = await apiClient.post("/auth/login", {
                username,
                password
            });
            return response.data; 
        },
        onSuccess: (data) => {
            login(data.data); 
            setCurrentUser(data.data); 
            // setAuthToken(data.data.token); // Store auth token in local storage
            router.push('/dashboard'); 
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
            <AuthHeading title="Sign in" description="Welcome back to GebetaMaps."/>
            <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
                <Field label="Username" htmlFor="username" required>
                    <Input
                        id="username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Enter your username"
                    />
                </Field>
                <Field
                    label="Password"
                    htmlFor="password"
                    required
                    trailing={<Link href="/auth/reset-password" className="caption-style text-soft hover:text-foreground">Forgot password?</Link>}
                >
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-subtle hover:text-foreground"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </Field>
                {error && <Notice>{error}</Notice>}
                <Button type="submit" size="lg" className="w-full" loading={signInMutation.isPending}>
                    Sign in
                </Button>
                <p className="text-center text-[13px] text-soft">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/register" className="font-medium text-foreground underline-offset-4 hover:underline">Sign up for GebetaMaps</Link>
                </p>
            </form>
        </>
    );
};

export default SignIn;