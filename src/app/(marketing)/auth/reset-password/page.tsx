// pages/auth/reset-password.tsx

"use client";
import React, {useState} from 'react';
import Link from "next/link";
import {useMutation} from "@tanstack/react-query";
import {apiClient} from "@/service/apiClient";
import {useRouter} from 'next/navigation';
import {BarLoader} from "react-spinners";

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
                contact: email,
                contactType: "EMAIL"
            }),
        onSuccess: () => {
            setStep(2);
            setError('');
        },
        onError: (error: any) => {
            setError(error.response?.data?.message || "Failed to send OTP");
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
            setError(error.response?.data?.message || "Verification failed");
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
            setError(error.response?.data?.message || "Failed to change password");
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

    const handleOtpChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.value && index < 5) {
            const nextInput = document.querySelector(`input[name=otp-${index + 1}]`) as HTMLInputElement;
            if (nextInput) nextInput.focus();
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

    return (
        <>
            <h2 className="text-[#1B1E2B] dark:text-white text-[40px] text-center leading-50 mt-[10px]">
                {step === 1 ? 'Reset Password' : step === 2 ? 'Verify OTP' : 'Change Password'}
            </h2>
            {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {step === 1 && (
                <form className="space-y-6 mt-[40px]" onSubmit={handleContinue}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="youremail@example.com"
                            className="mt-1 block w-full px-3 py-2 border border-[#D1D5DB] rounded-md shadow-sm
                                       focus:outline-none focus:ring focus:ring-[#FFA500]
                                       focus:border-[#FFA500] dark:bg-gray-700 dark:border-gray-600
                                       dark:text-gray-300 transition duration-200 ease-in-out"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={requestOtpMutation.isPending}
                        className="w-full py-2 px-4 bg-[#FFA500] text-white rounded-md hover:opacity-75 disabled:opacity-50"
                    >
                        {requestOtpMutation.isPending ? <BarLoader /> : 'Continue'}
                    </button>
                </form>
            )}

            {step === 2 && (
                <form className="space-y-6 mt-[40px]" onSubmit={handleVerifyOtp}>
                    <h3 className="text-lg text-center">Enter the OTP sent to {email}</h3>
                    <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                name={`otp-${index}`}
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(e.target, index)}
                                className="w-12 h-12 text-center border-2 rounded-lg focus:border-[#FFA500]
                                           focus:outline-none dark:bg-gray-700 dark:text-white"
                            />
                        ))}
                    </div>
                    <button
                        type="submit"
                        disabled={verifyOtpMutation.isPending}
                        className="w-full py-2 px-4 bg-[#FFA500] text-white rounded-md hover:opacity-75 disabled:opacity-50"
                    >
                        {verifyOtpMutation.isPending ? 'Verifying OTP...' : 'Verify OTP'}
                    </button>
                </form>
            )}

            {step === 3 && (
                <form className="space-y-6 mt-[40px]" onSubmit={handleChangePassword}>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="Enter new password"
                            className="mt-1 block w-full px-3 py-2 border border-[#D1D5DB] rounded-md shadow-sm
                                       focus:outline-none focus:ring focus:ring-[#FFA500]
                                       focus:border-[#FFA500] dark:bg-gray-700 dark:border-gray-600
                                       dark:text-gray-300 transition duration-200 ease-in-out"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        className="w-full py-2 px-4 bg-[#FFA500] text-white rounded-md hover:opacity-75 disabled:opacity-50"
                    >
                        {changePasswordMutation.isPending ? <BarLoader /> : 'Change Password'}
                    </button>
                </form>
            )}

            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
                Remembered your password?{" "}
                <Link href="/auth/signin" className="text-[#FFA500] hover:text-[#FF8C00]">
                    Sign In
                </Link>
            </p>
        </>
    );
};

export default ResetPassword;