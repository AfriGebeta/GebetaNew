//@ts-nocheck
"use client";
import React, {useContext, useEffect, useState} from 'react';
import Link from "next/link";
import {useMutation} from "@tanstack/react-query";
import {apiClient} from "@/service/apiClient";
import {useRouter} from 'nextjs-toploader/app';
import {AuthContext} from "@/providers/AuthProvider";
import Button from "@/components/ui/button";
import Field from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import OtpInput from "@/components/ui/otp-input";
import { RadioGroup, RadioCard } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Notice from "@/components/ui/notice";
import AuthHeading from "../_components/auth-heading";
import {trackUserAction} from "@/lib/track";

interface RegistrationData {
    firstname?: string;
    lastname?: string;
    email: string;
    username: string;
    password: string;
    companyname?: string;
    phone: string;
    otp: string;
    is_organization?: boolean;
    coupon?: string
}

interface CountryCode {
    code: string;
    dial_code: string;
    name: string;
}

const Register: React.FC = () => {
    const {login, setCurrentUser} = useContext(AuthContext);

    const router = useRouter();
    const [step, setStep] = useState(1);
    const [accountType, setAccountType] = useState<string>("Business");
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [selectedCountryCode, setSelectedCountryCode] = useState("+251");
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState<string>("");
    const [passwordError, setPasswordError] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const validatePassword = (value: string) => {
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
        return '';
    };

    const [registrationData, setRegistrationData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        username: "",
        password: "",
        companyname: "",
        phone: "",
        coupon: ""
    });

    const countryCodes: CountryCode[] = [
        {code: "ET", dial_code: "+251", name: "Ethiopia"},
        {code: "US", dial_code: "+1", name: "United States"},
        {code: "GB", dial_code: "+44", name: "United Kingdom"},
    ];

    const requestOtpMutation = useMutation({
        mutationFn: (email: string) => {
            const fullPhoneNumber = `${selectedCountryCode}${registrationData.phone}`;
            const requestData = {
                contactType: "EMAIL",
                contact: email,
                additional: {
                    requestedOtpFor: "registration",
                    data: {
                        email: email,
                        coupon: registrationData.coupon || "",
                        username: registrationData.username,
                        password: registrationData.password,
                        phone: fullPhoneNumber,
                        otp: "",
                        ...(accountType === "Business"
                            ? {
                                companyname: registrationData.companyname,
                                is_organization: true,
                                firstname: "",
                                lastname: ""
                            }
                            : {
                                firstname: registrationData.firstname,
                                lastname: registrationData.lastname,
                                companyname: "",
                                is_organization: false,
                            }
                        )
                    }
                }
            };
            return apiClient.post("/auth/request/otp", requestData, {
                headers: {"Content-Type": "application/json"}
            });
        },
        onSuccess: () => {
            setStep(2);
            setError("");
        },
        onError: (error: any) => {
            setError(error.response?.data?.error?.message || "Failed to send OTP");
        }
    });

    // Sign-in mutation
    const signInMutation = useMutation({
        mutationFn: async () => {
            const response = await apiClient.post("/auth/login", {
                username: registrationData.username,
                password: registrationData.password
            });
            return response.data;
        },
        onSuccess: (data) => {
            login(data.data);
            setCurrentUser(data.data); 
            trackUserAction.auth.loginSuccessful({
                user_id: data?.data?.id,
                username: data?.data?.username,
            });
            router.push('/dashboard'); // Redirect to dashboard
        },
        onError: (error: any) => {
            setError(error.response?.data?.error?.message || "Sign-in failed. Please try again.");
        },
    });


    const registerMutation = useMutation({
        mutationFn: (data: RegistrationData) =>
            apiClient.post("/auth/register", data, {
                headers: {"Content-Type": "application/json"}
            }),
        onSuccess: async () => {
            try {
                await signInMutation.mutateAsync({
                    username: registrationData.username,
                    password: registrationData.password
                });
                trackUserAction.auth.registrationCompleted({
                    username: registrationData.username,
                    email: registrationData.email,
                    user_type: accountType
                });
            } catch (error) {
                console.error('Sign-in after registration failed:', error);
                setError(error.response?.data?.error?.message || "Sign-in failed after registration.");
            }

            router.push('/dashboard');
            setError("");
        },
        onError: (error: any) => {
            setError(error.response?.data?.error?.message || "Registration failed");
        }
    });

    const handleContinue = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!agreeToTerms) {
            setError("Please agree to the Terms of Service and Privacy Policy");
            return;
        }
        const pwdErr = validatePassword(registrationData.password);
        if (pwdErr) {
            setPasswordError(pwdErr);
            return;
        }
        if (registrationData.password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            return;
        }

        try {
            await requestOtpMutation.mutateAsync(registrationData.email);
        } catch (error) {
            console.error('OTP request error:', error);
        }
    };

    const handleRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError("Please enter a valid OTP");
            return;
        }
        const fullPhoneNumber = `${selectedCountryCode}${registrationData.phone}`;
        const sendData: RegistrationData = {
            email: registrationData.email,
            coupon: registrationData.coupon,
            username: registrationData.username,
            password: registrationData.password,
            phone: fullPhoneNumber,
            otp: otpString,
            ...(accountType === "Business"
                ? {
                    companyname: registrationData.companyname,
                    is_organization: true,
                    firstname: "",
                    lastname: ""
                }
                : {
                    firstname: registrationData.firstname,
                    lastname: registrationData.lastname,
                    companyname: "",
                    is_organization: false,
                }
            )
        };

        try {
            await registerMutation.mutateAsync(sendData);
        } catch (error) {
            console.error('Registration error:', error);
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
                await requestOtpMutation.mutateAsync(registrationData.email);
            } catch (error) {
                console.error('OTP resend error:', error);
            }
        }
    };

    const update = (key: keyof typeof registrationData) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setRegistrationData({...registrationData, [key]: e.target.value});

    const renderAccountTypeFields = () => (
        <>
            {accountType === "Individual" ? (
                <div className="grid grid-cols-2 gap-3">
                    <Field label="First name" htmlFor="firstname" required>
                        <Input id="firstname" autoComplete="given-name" value={registrationData.firstname}
                               onChange={update("firstname")} required placeholder="Abebe"/>
                    </Field>
                    <Field label="Last name" htmlFor="lastname" required>
                        <Input id="lastname" autoComplete="family-name" value={registrationData.lastname}
                               onChange={update("lastname")} required placeholder="Kebede"/>
                    </Field>
                </div>
            ) : (
                <Field label="Organization name" htmlFor="companyname" required>
                    <Input id="companyname" autoComplete="organization" value={registrationData.companyname}
                           onChange={update("companyname")} required placeholder="Your organization's name"/>
                </Field>
            )}

            <Field label="Email address" htmlFor="email" required>
                <Input id="email" type="email" autoComplete="email" value={registrationData.email}
                       onChange={update("email")} required placeholder="you@company.com"/>
            </Field>

            <Field label="Phone number" htmlFor="phone" required>
                <div className="flex gap-2">
                    <Select value={selectedCountryCode} onValueChange={setSelectedCountryCode}>
                        <SelectTrigger aria-label="Country code" className="w-24 shrink-0">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            {countryCodes.map((country) => (
                                <SelectItem key={country.code} value={country.dial_code}>
                                    {country.dial_code}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input id="phone" type="tel" autoComplete="tel-national" value={registrationData.phone}
                           onChange={update("phone")} required placeholder="911 234 567"/>
                </div>
            </Field>

            <Field label="Username" htmlFor="username" required>
                <Input id="username" autoComplete="username" value={registrationData.username}
                       onChange={update("username")} required placeholder="Create a username"/>
            </Field>

            <Field label="Password" htmlFor="password" required error={passwordError}
                   hint="At least 8 characters, one uppercase letter and one number.">
                <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!!passwordError}
                    value={registrationData.password}
                    onChange={(e) => {
                        const value = e.target.value;
                        setRegistrationData({...registrationData, password: value});
                        setPasswordError(validatePassword(value));
                        if (confirmPassword) {
                            setConfirmPasswordError(value !== confirmPassword ? 'Passwords do not match' : '');
                        }
                    }}
                    required
                    placeholder="Create a password"
                />
            </Field>

            <Field label="Confirm password" htmlFor="confirmPassword" required error={confirmPasswordError}>
                <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!!confirmPasswordError}
                    value={confirmPassword}
                    onChange={(e) => {
                        const value = e.target.value;
                        setConfirmPassword(value);
                        setConfirmPasswordError(value !== registrationData.password ? 'Passwords do not match' : '');
                    }}
                    required
                    placeholder="Re-enter your password"
                />
            </Field>

            <Field label="Coupon" htmlFor="coupon" hint="Optional">
                <Input id="coupon" value={registrationData.coupon} onChange={update("coupon")}
                       placeholder="Have a code?" className="max-w-[180px]"/>
            </Field>
        </>
    );

    return (
        <>
            <AuthHeading
                title={step === 1 ? 'Create your account' : 'Verify your email'}
                description={step === 1
                    ? 'Start building with GebetaMaps.'
                    : `We sent a 6-digit code to ${registrationData.email}.`}
            />
            {step === 1 ? (
                <form className="mt-8 flex flex-col gap-5" onSubmit={handleContinue}>
                    <RadioGroup value={accountType} onValueChange={setAccountType} aria-label="Account type">
                        <RadioCard value="Business" title="Business"
                                   description="For your work, school or organization"/>
                        <RadioCard value="Individual" title="Individual" description="For your own projects"/>
                    </RadioGroup>

                    {renderAccountTypeFields()}

                    <div className="flex items-start gap-2">
                        <Checkbox id="terms" checked={agreeToTerms}
                                  onCheckedChange={(checked) => setAgreeToTerms(checked === true)}/>
                        <Label htmlFor="terms" className="leading-[1.4]">
                            I agree to the GebetaMaps{" "}
                            <Link href="/terms" className="text-foreground underline underline-offset-2">Terms of Service</Link>
                            {" "}and{" "}
                            <Link href="/privacy" className="text-foreground underline underline-offset-2">Privacy Policy</Link>
                        </Label>
                    </div>

                    {error && <Notice>{error}</Notice>}

                    <Button type="submit" size="lg" className="w-full" loading={requestOtpMutation.isPending}>
                        Continue
                    </Button>

                    <p className="text-center text-[13px] text-soft">
                        Already have an account?{" "}
                        <Link href="/auth/signin" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link>
                    </p>
                </form>
            ) : (
                <form onSubmit={handleRegistration} className="mt-8 flex flex-col gap-5">
                    <OtpInput value={otp} onChange={setOtp}/>
                    {error && <Notice>{error}</Notice>}
                    <Button type="submit" size="lg" className="w-full" loading={registerMutation.isPending}>
                        Create account
                    </Button>
                    <Button variant="ghost" className="self-center" onClick={handleResendOtp} disabled={!canResend}>
                        Resend code {timer > 0 && `(${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')})`}
                    </Button>
                </form>
            )}
        </>
    );
};

export default Register;