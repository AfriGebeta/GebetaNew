//@ts-nocheck
"use client";
import React, {useContext, useEffect, useState} from 'react';
import {useMutation} from "@tanstack/react-query";
import {apiClient} from "@/service/apiClient";
import {AuthContext} from "@/providers/AuthProvider";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Tabs, TabsContent, TabsList, TabsTrigger,} from "@/components/ui/tabs";
import {useToast} from "@/hooks/use-toast";

export default function Account() {
    const { currentUser, setCurrentUser, logout } = useContext(AuthContext);
    const {toast} = useToast()

    // State for account info
    const [username, setUsername] = useState(currentUser?.user?.username || '');
    const [email, setEmail] = useState(currentUser?.user?.email || '');
    const [phone, setPhone] = useState(currentUser?.user?.phone || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // State for password reset
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');

    // Mutation for updating user info
    const updateUserMutation = useMutation({
        mutationFn: async () => {
            const response = await apiClient.patch("/user", {
                username,
                email,
                phone
            }, {
                headers: {
                    Authorization: `Bearer ${currentUser?.token}`
                }
            });
            return response.data;
        },
        onSuccess: () => {
            // setSuccess('Profile updated successfully');
            toast({
                description:"Profile updated successfully"
            })
            setCurrentUser({
                ...currentUser,
                user: {
                    ...currentUser.user,
                    username,
                    email,
                    phone
                }
            });
        },
        onError: (error: any) => {
            // setError(error.response?.data?.message || "Update failed. Please try again.");
            toast({
                description:`${error?.response?.data?.message || "Update failed. Please try again."}`,
                variant: 'destructive'
            })
        }
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await updateUserMutation.mutateAsync();
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    // Handlers for password reset
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
            // setError(error.response?.data?.message || "Failed to send OTP");
            toast({
                description:`${error?.response?.data?.message || "Failed to send OTP"}`,
                variant: 'destructive'
            })
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
            // setError(error.response?.data?.message || "Verification failed");
            toast({
                description:`${error?.response?.data?.message || "Verification failed"}`,
                variant: 'destructive'
            })
        }
    });

    const changePasswordMutation = useMutation({
        mutationFn: (data: { email: string; otp: string; newPassword: string }) =>
            apiClient.post("/auth/reset/pass", data),
        onSuccess: () => {
            setStep(1);
            setError('');
            logout();
        },
        onError: (error: any) => {
            // setError(error.response?.data?.message || "Failed to change password");
            toast({
                description:`${error?.response?.data?.message || "Failed to change password"}`,
                variant: 'destructive'
            })
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

    const [timer, setTimer] = useState(120);
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


    const renderAccountInfo = () => (
        <Card>
            <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                    Make changes to your account here. Click save when you're done.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="space-y-1">
                    <Label htmlFor="username">Username</Label>
                    <Input
                        id="username"
                        className="w-full md:w-1/2"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        type="email"
                        className="w-full md:w-1/2"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        type="tel"
                        className="w-full md:w-1/2"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {success && <p className="text-green-500 text-sm text-center">{success}</p>}
            </CardContent>
            <CardFooter>
                <Button className="bg-[#FFA500] hover:bg-[#FFA500]/80" onClick={handleSubmit} disabled={updateUserMutation.isPending}>
                    {updateUserMutation.isPending ? 'Updating...' : 'Save changes'}
                </Button>
            </CardFooter>
        </Card>
    );

    const renderResetPassword = () => (
        <Card>
            <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>
                    Change your password here. After saving, you'll be logged out.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {/*<h2 className="text-sm mt-2 mb-2 font-medium">{step === 1 ? 'Request OTP' : step === 2 ? 'Verify OTP' : 'Change Password'}</h2>*/}
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {step === 1 && (
                    <form className="space-y-6 mt-[40px]" onSubmit={handleContinue}>
                        <div className="space-y-2">
                            <Label htmlFor="reset-email">Email Address</Label>
                            <Input
                                type="email"
                                className="w-full md:w-1/2"
                                id="reset-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="youremail@example.com"
                            />
                        </div>
                        <Button className="bg-[#FFA500] hover:bg-[#FFA500]/80" type="submit" disabled={requestOtpMutation.isPending}>
                            {requestOtpMutation.isPending ? 'Requesting...' : 'Request OTP'}
                        </Button>
                    </form>
                )}
                {step === 2 && (
                    <form className="space-y-6 mt-[40px]" onSubmit={handleVerifyOtp}>
                        <h3 className="text-lg">Enter the OTP sent to {email}</h3>
                        <div className="flex justify-center gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    name={`otp-${index}`}
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(e.target, index)}
                                    className="w-12 h-12 text-center border-2 rounded-lg focus:border-[#FFA500] focus:outline-none dark:bg-gray-700 dark:text-white"
                                />
                            ))}
                        </div>
                        <Button type="submit" disabled={verifyOtpMutation.isPending}>
                            {verifyOtpMutation.isPending ? 'Verifying OTP...' : 'Verify OTP'}
                        </Button>
                        <div className="mt-[8px] flex justify-center">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={!canResend}
                                className={`text-sm text-[#FFA500] ${canResend ? '' : 'opacity-50 cursor-not-allowed'}`}
                            >
                                Resend
                                OTP {timer > 0 && `(${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')})`}
                            </button>
                        </div>
                    </form>
                )}
                {step === 3 && (
                    <form className="space-y-6 mt-[40px]" onSubmit={handleChangePassword}>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                                type="password"
                                id="new-password"
                                className="w-1/2"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="Enter new password"
                            />
                        </div>
                        <Button type="submit" disabled={changePasswordMutation.isPending}>
                            {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="w-full p-6">
            <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="account">Account Info</TabsTrigger>
                    <TabsTrigger value="password">Reset Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    {renderAccountInfo()}
                </TabsContent>
                <TabsContent value="password">
                    {renderResetPassword()}
                </TabsContent>
            </Tabs>
        </div>
    );
}