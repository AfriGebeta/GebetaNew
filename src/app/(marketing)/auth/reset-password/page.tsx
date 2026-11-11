//@ts-nocheck

"use client";
import React, {useEffect, useState} from 'react';
import Link from "next/link";
import {useMutation} from "@tanstack/react-query";
import {apiClient} from "@/service/apiClient";
import {useRouter} from 'nextjs-toploader/app';
import Button from "@/components/ui/button";
import Field from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import OtpInput from "@/components/ui/otp-input";
import Notice from "@/components/ui/notice";
import AuthHeading from "../_components/auth-heading";
import {getErrorMessage} from "@/lib/errors";

const ResetPassword: React.FC = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');

    const requestOtpMutation = useMutation({
        mutationFn: (email: string) =>
            apiClient.post("/auth/request/otp", {
                contactType: "EMAIL",
                contact: email,
                additional: {
                    requestedOtpFor: "reset_password"
                }
            }),
        onSuccess: () => {
            setStep(2);
            setError('');
        },
        onError: (error: any) => {
            setError(getErrorMessage(error, "Failed to send OTP"));
        }
    });

    const verifyOtpMutation = useMutation({
        mutationFn: (otp: string) =>
            apiClient.get(`/auth/otp/${otp}`, { params: { email } }),
        onSuccess: () => {
            setStep(3);
            setError('');
        },
        onError: (error: any) => {
            setError(getErrorMessage(error, "Verification failed"));
        }
    });

    const changePasswordMutation = useMutation({
        mutationFn: (data: { email: string; otp: string; newPassword: string }) =>
            apiClient.post("/auth/reset/pass", data),
        onSuccess: () => {
            router.push('/auth/signin');
            setError('');
        },
        onError: (error: any) => {
            setError(getErrorMessage(error, "Failed to change password"));
        }
    });

    const handleContinue = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await requestOtpMutation.mutateAsync(email);
        } catch (error) {
            console.error('OTP request error:', error);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError("Please enter a valid OTP");
            return;
        }

        try {
            await verifyOtpMutation.mutateAsync(otpString);
        } catch (error) {
            console.error('OTP verification error:', error);
        }
    };

    const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        try {
            await changePasswordMutation.mutateAsync({ email, otp: otpString, newPassword });
        } catch (error) {
            console.error('Change password error:', error);
        }
    };

    const [timer, setTimer] = useState(120); // 2 minutes timer in seconds
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleResendOtp = async () => {
        if (canResend) {
            setTimer(120); // Reset timer
            setCanResend(false);
            try {
                await requestOtpMutation.mutateAsync(email);
            } catch (error) {
                console.error('OTP resend error:', error);
            }
        }
    };

    const titles = {1: 'Reset password', 2: 'Verify code', 3: 'Choose a new password'};
    const descriptions = {
        1: "Enter your account email and we'll send you a 6-digit code.",
        2: `Enter the code sent to ${email}.`,
        3: 'Use at least 6 characters.',
    };

    return (
        <>
            <AuthHeading title={titles[step]} description={descriptions[step]}/>

            {step === 1 && (
                <form className="mt-8 flex flex-col gap-5" onSubmit={handleContinue}>
                    <Field label="Email address" htmlFor="email" required>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@company.com"
                        />
                    </Field>
                    {error && <Notice>{error}</Notice>}
                    <Button type="submit" size="lg" className="w-full" loading={requestOtpMutation.isPending}>
                        Continue
                    </Button>
                </form>
            )}

            {step === 2 && (
                <form className="mt-8 flex flex-col gap-5" onSubmit={handleVerifyOtp}>
                    <OtpInput value={otp} onChange={setOtp}/>
                    {error && <Notice>{error}</Notice>}
                    <Button type="submit" size="lg" className="w-full" loading={verifyOtpMutation.isPending}>
                        Verify code
                    </Button>
                    <Button variant="ghost" className="self-center" onClick={handleResendOtp} disabled={!canResend}>
                        Resend code {timer > 0 && `(${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')})`}
                    </Button>
                </form>
            )}

            {step === 3 && (
                <form className="mt-8 flex flex-col gap-5" onSubmit={handleChangePassword}>
                    <Field label="New password" htmlFor="newPassword" required>
                        <Input
                            id="newPassword"
                            type="password"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="Enter new password"
                        />
                    </Field>
                    {error && <Notice>{error}</Notice>}
                    <Button type="submit" size="lg" className="w-full" loading={changePasswordMutation.isPending}>
                        Change password
                    </Button>
                </form>
            )}

            <p className="mt-6 text-center text-[13px] text-soft">
                Remembered your password?{" "}
                <Link href="/auth/signin" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link>
            </p>
        </>
    );
};

export default ResetPassword;