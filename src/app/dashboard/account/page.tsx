//@ts-nocheck
"use client";
import React, {useContext, useEffect, useState} from 'react';
import {useMutation} from "@tanstack/react-query";
import {apiClient} from "@/service/apiClient";
import {updateUser} from "@/service/apis";
import {AuthContext} from "@/providers/AuthProvider";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label } from "@/components/ui/label";
import Field from "@/components/ui/field";
import OtpInput from "@/components/ui/otp-input";
import {Page, PageIntro} from "@/components/dashboard/page";
import {Tabs, TabsContent, TabsList, TabsTrigger,} from "@/components/ui/tabs";
import {useToast} from "@/hooks/use-toast";
import {Switch } from "@/components/ui/switch";
import {getErrorMessage} from "@/lib/errors";

export default function Account() {
    const { currentUser, setCurrentUser, logout } = useContext(AuthContext);
    const {toast} = useToast()

    // State for account info
    // `is_organization` decides which name field(s) this account can edit: a
    // company account has a single "Company Name" (backed by the same DB
    // column GoServer calls `company_name`), an individual account has a
    // "First Name" (same column) + "Last Name" pair instead. Defaults to true
    // (the DB's own default for isOrganization) so an already-logged-in
    // session's stale cached user - from before this field existed - falls
    // back to the single-field company view rather than rendering nothing.
    const isOrganization = currentUser?.user?.is_organization ?? true;
    const [username, setUsername] = useState(currentUser?.user?.username || '');
    const [email] = useState(currentUser?.user?.email || '');
    const [phone, setPhone] = useState(currentUser?.user?.phone || '');
    const [companyOrFirstName, setCompanyOrFirstName] = useState(currentUser?.user?.company_name || '');
    const [lastName, setLastName] = useState(currentUser?.user?.lastname || '');
    const [allowAbuseDetection, setAllowAbuseDetection] = useState(currentUser?.user?.allow_alert || false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // State for password reset
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');

    // Mutation for updating user info
    const updateUserMutation = useMutation({
        mutationFn: async () => {
            return await updateUser(currentUser?.token, {
                username,
                phone,
                allow_abuse_detection: allowAbuseDetection,
                companyname: companyOrFirstName,
                lastname: isOrganization ? undefined : lastName
            });
        },
        onSuccess: (response) => {
            if (response.success) {
                toast({
                    description: "Profile updated successfully"
                })
                setCurrentUser({
                    ...currentUser,
                    user: {
                        ...currentUser.user,
                        username,
                        phone,
                        allow_alert: allowAbuseDetection,
                        company_name: companyOrFirstName,
                        ...(isOrganization ? {} : { lastname: lastName })
                    }
                });
            } else {
                toast({
                    description: response.message || "Update failed",
                    variant: 'destructive'
                })
            }
        },
        onError: (error: any) => {
            toast({
                description: getErrorMessage(error, "Update failed. Please try again."),
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
                description: getErrorMessage(error, "Failed to send OTP"),
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
                description: getErrorMessage(error, "Verification failed"),
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
                description: getErrorMessage(error, "Failed to change password"),
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
            <CardHeader className="border-b border-line-strong">
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                    Make changes to your account here. Click save when you're done.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex max-w-[520px] flex-col gap-5 pt-5">
                <Field label="Username" htmlFor="username">
                    <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Field>
                {isOrganization ? (
                    <Field label="Company Name" htmlFor="company-name">
                        <Input
                            id="company-name"
                            value={companyOrFirstName}
                            onChange={(e) => setCompanyOrFirstName(e.target.value)}
                        />
                    </Field>
                ) : (
                    <div className="flex flex-col gap-5 sm:flex-row sm:gap-3">
                        <Field label="First Name" htmlFor="first-name" className="flex-1">
                            <Input
                                id="first-name"
                                value={companyOrFirstName}
                                onChange={(e) => setCompanyOrFirstName(e.target.value)}
                            />
                        </Field>
                        <Field label="Last Name" htmlFor="last-name" className="flex-1">
                            <Input
                                id="last-name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </Field>
                    </div>
                )}
                <Field label="Email" htmlFor="email" hint="Email can't be changed here, contact support to update it.">
                    <Input
                        type="email"
                        id="email"
                        value={email}
                        disabled
                        readOnly
                    />
                </Field>
                <Field label="Phone Number" htmlFor="phone">
                    <Input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </Field>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-line-strong p-3">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="abuse-detection" className="text-foreground">Abuse Detection & Notifications</Label>
                        <span className="caption-style leading-[1.4] text-subtle">
                            Receive notifications when suspicious activity is detected
                        </span>
                    </div>
                    <Switch
                        id="abuse-detection"
                        checked={allowAbuseDetection}
                        onCheckedChange={setAllowAbuseDetection}
                    />
                </div>
                {error && <p className="caption-style text-danger">{error}</p>}
                {success && <p className="caption-style text-success">{success}</p>}
            </CardContent>
            <CardFooter className="justify-end">
                <Button variant="primary" onClick={handleSubmit} disabled={updateUserMutation.isPending}>
                    {updateUserMutation.isPending ? 'Updating...' : 'Save changes'}
                </Button>
            </CardFooter>
        </Card>
    );

    const renderResetPassword = () => (
        <Card>
            <CardHeader className="border-b border-line-strong">
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>
                    Change your password here. After saving, you'll be logged out.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex max-w-[520px] flex-col gap-5 pt-5">
                {error && <p className="caption-style text-danger">{error}</p>}
                {step === 1 && (
                    <form className="flex flex-col items-start gap-5" onSubmit={handleContinue}>
                        <Field label="Email Address" htmlFor="reset-email" className="w-full" hint="We'll send a one-time code to this address.">
                            <Input
                                type="email"
                                id="reset-email"
                                value={email}
                                readOnly
                                required
                            />
                        </Field>
                        <Button variant="primary" type="submit" disabled={requestOtpMutation.isPending}>
                            {requestOtpMutation.isPending ? 'Requesting...' : 'Request OTP'}
                        </Button>
                    </form>
                )}
                {step === 2 && (
                    <form className="flex flex-col items-start gap-5" onSubmit={handleVerifyOtp}>
                        <p className="p-style text-soft">Enter the code sent to <span className="text-foreground">{email}</span></p>
                        <OtpInput value={otp} onChange={setOtp} className="justify-start"/>
                        <div className="flex items-center gap-3">
                            <Button variant="primary" type="submit" disabled={verifyOtpMutation.isPending}>
                                {verifyOtpMutation.isPending ? 'Verifying OTP...' : 'Verify OTP'}
                            </Button>
                            <Button variant="ghost" onClick={handleResendOtp} disabled={!canResend}>
                                Resend OTP {timer > 0 && `(${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')})`}
                            </Button>
                        </div>
                    </form>
                )}
                {step === 3 && (
                    <form className="flex flex-col items-start gap-5" onSubmit={handleChangePassword}>
                        <Field label="New Password" htmlFor="new-password" className="w-full" hint="At least 6 characters.">
                            <Input
                                type="password"
                                id="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="Enter new password"
                            />
                        </Field>
                        <Button variant="primary" type="submit" disabled={changePasswordMutation.isPending}>
                            {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );

    return (
        <Page>
            <PageIntro title="Account" description="Manage your profile, notifications, and password." />
            <Tabs defaultValue="account" className="gap-6">
                <TabsList>
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
        </Page>
    );
}
