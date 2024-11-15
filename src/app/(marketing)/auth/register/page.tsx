//@ts-nocheck
"use client";
import React, {useContext, useState, useEffect} from 'react';
import Link from "next/link";
import {useMutation} from "@tanstack/react-query";
import {apiClient} from "@/service/apiClient";
import {useRouter} from 'next/navigation';
import {AuthContext} from "@/providers/AuthProvider";
import {BarLoader} from "react-spinners";

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

    const [registrationData, setRegistrationData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        username: "",
        password: "",
        companyname: "",
        phone: ""
    });

    const countryCodes: CountryCode[] = [
        {code: "ET", dial_code: "+251", name: "Ethiopia"},
        {code: "US", dial_code: "+1", name: "United States"},
        {code: "GB", dial_code: "+44", name: "United Kingdom"},
    ];

    const requestOtpMutation = useMutation({
        mutationFn: (email: string) =>
            apiClient.post("/auth/request/otp", {
                contact: email,
                contactType: "EMAIL"
            }, {
                headers: {"Content-Type": "application/json"}
            }),
        onSuccess: () => {
            setStep(2);
            setError("");
        },
        onError: (error: any) => {
            setError(error.response?.data?.message || "Failed to send OTP");
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
            console.log('Sign-in successful:', data.data);
            login(); // Update authentication state
            setCurrentUser(data.data); // Store user data in local storage
            router.push('/dashboard'); // Redirect to dashboard
        },
        onError: (error: any) => {
            setError(error.response?.data?.message || "Sign-in failed. Please try again.");
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
            } catch (error) {
                console.error('Sign-in after registration failed:', error);
                setError(error.response?.data?.message || "Sign-in failed after registration.");
            }

            router.push('/dashboard');
            setError("");
        },
        onError: (error: any) => {
            setError(error.response?.data?.message || "Registration failed");
        }
    });

    const handleContinue = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!agreeToTerms) {
            setError("Please agree to the Terms of Service and Privacy Policy");
            return;
        }

        try {
            await requestOtpMutation.mutateAsync(registrationData.email);
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
            setTimer(360); // Reset timer
            setCanResend(false);
            try {
                await requestOtpMutation.mutateAsync(registrationData.email);
            } catch (error) {
                console.error('OTP resend error:', error);
            }
        }
    };

    const renderAccountTypeFields = () => {
        const commonFields = (
            <>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={registrationData.email}
                        onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
                        required
                        placeholder="john@workmail.com"
                        className="mt-1 block w-full px-3 py-2 border border-[#D1D5DB] rounded-md shadow-sm
                           focus:outline-none focus:ring focus:ring-[#FFA500]
                           focus:border-[#FFA500] dark:bg-gray-700 dark:border-gray-600
                           dark:text-gray-300 transition duration-200 ease-in-out"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Number
                    </label>
                    <div className="flex gap-2">
                        <select
                            value={selectedCountryCode}
                            onChange={(e) => setSelectedCountryCode(e.target.value)}
                            className="mt-1 w-24 px-3 py-2 border border-[#D1D5DB] rounded-md shadow-sm
                               focus:outline-none focus:ring focus:ring-[#FFA500]
                               focus:border-[#FFA500] dark:bg-gray-700 dark:border-gray-600
                               dark:text-gray-300 transition duration-200 ease-in-out"
                        >
                            {countryCodes.map((country) => (
                                <option key={country.code} value={country.dial_code}>
                                    {country.dial_code}
                                </option>
                            ))}
                        </select>
                        <input
                            type="tel"
                            id="phone"
                            value={registrationData.phone}
                            onChange={(e) => setRegistrationData({...registrationData, phone: e.target.value})}
                            required
                            placeholder="Phone number"
                            className="mt-1 block w-full px-3 py-2 border border-[#D1D5DB] rounded-md shadow-sm
                               focus:outline-none focus:ring focus:ring-[#FFA500]
                               focus:border-[#FFA500] dark:bg-gray-700 dark:border-gray-600
                               dark:text-gray-300 transition duration-200 ease-in-out"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={registrationData.username}
                        onChange={(e) => setRegistrationData({...registrationData, username: e.target.value})}
                        required
                        placeholder="Create a username"
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
                        value={registrationData.password}
                        onChange={(e) => setRegistrationData({...registrationData, password: e.target.value})}
                        required
                        placeholder="Create a password"
                        className="mt-1 block w-full px-3 py-2 border border-[#D1D5DB] rounded-md shadow-sm
                           focus:outline-none focus:ring focus:ring-[#FFA500]
                           focus:border-[#FFA500] dark:bg-gray-700 dark:border-gray-600
                           dark:text-gray-300 transition duration-200 ease-in-out"
                    />
                </div>
            </>
        );

        if (accountType === "Individual") {
            return (
                <>
                    <div>
                        <label htmlFor="firstname"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            First Name
                        </label>
                        <input
                            type="text"
                            id="firstname"
                            value={registrationData.firstname}
                            onChange={(e) => setRegistrationData({...registrationData, firstname: e.target.value})}
                            required
                            placeholder="eg. John"
                            className="mt-1 block w-full px-3 py-2 border border-[#D1D5DB] rounded-md shadow-sm
                               focus:outline-none focus:ring focus:ring-[#FFA500]
                               focus:border-[#FFA500] dark:bg-gray-700 dark:border-gray-600
                               dark:text-gray-300 transition duration-200 ease-in-out"
                        />
                    </div>
                    <div>
                        <label htmlFor="lastname"
                               className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="lastname"
                            value={registrationData.lastname}
                            onChange={(e) => setRegistrationData({...registrationData, lastname: e.target.value})}
                            required
                            placeholder="eg. Smith"
                            className="mt-1 block w-full px-3 py-2 border border-[#D1D5DB] rounded-md shadow-sm
                               focus:outline-none focus:ring focus:ring-[#FFA500]
                               focus:border-[#FFA500] dark:bg-gray-700 dark:border-gray-600
                               dark:text-gray-300 transition duration-200 ease-in-out"
                        />
                    </div>
                    {commonFields}
                </>
            );
        }

        return (
            <>
                <div>
                    <label htmlFor="companyname" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Organization Name
                    </label>
                    <input
                        type="text"
                        id="companyname"
                        value={registrationData.companyname}
                        onChange={(e) => setRegistrationData({...registrationData, companyname: e.target.value})}
                        required
                        placeholder="Provide your organization's name"
                        className="mt-1 block w-full px-3 py-2 border border-[#D1D5DB] rounded-md shadow-sm
                           focus:outline-none focus:ring focus:ring-[#FFA500]
                           focus:border-[#FFA500] dark:bg-gray-700 dark:border-gray-600
                           dark:text-gray-300 transition duration-200 ease-in-out"
                    />
                </div>
                {commonFields}
            </>
        );
    };

    const renderOtpStep = () => {
        return (
            <div className="space-y-6">
                <p className="text-center text-gray-600 dark:text-gray-300 mt-[20px]">
                    We've sent a verification code to {registrationData.email}
                </p>
                <form onSubmit={handleRegistration} className="space-y-6">
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
                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}
                    <button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="w-full h-[40px] flex justify-center items-center px-4 bg-[#FFA500] text-white rounded-md
                             hover:opacity-75 disabled:opacity-50"
                    >
                        {registerMutation.isPending ? <BarLoader color="white"/> : 'Create Account'}
                    </button>
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={!canResend}
                            className={`text-sm text-[#FFA500] ${canResend ? '' : 'opacity-50 cursor-not-allowed'}`}
                        >
                            Resend OTP {timer > 0 && `(${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')})`}
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <>
            <h2 className="text-[#1B1E2B] dark:text-white text-[40px] text-center leading-50 mt-[10px]">
                {step === 1 ? 'Register' : 'Verify Account'}
            </h2>
            {error && step === 1 && (
                <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
            {step === 1 ? (
                <form className="space-y-6 mt-[40px]" onSubmit={handleContinue}>
                    <div className="flex flex-col">
                        <div className="space-x-[8px]">
                            <input
                                type="radio"
                                name="account_type"
                                value="Business"
                                onChange={() => setAccountType("Business")}
                                defaultChecked
                            />
                            <label className="text-[14px]">Business - for your work, school or organization</label>
                        </div>
                        <div className="space-x-[8px]">
                            <input
                                type="radio"
                                name="account_type"
                                value="Individual"
                                onChange={() => setAccountType("Individual")}
                            />
                            <label className="text-[14px]">Individual - for your own projects</label>
                        </div>
                    </div>

                    {renderAccountTypeFields()}

                    <div className="flex gap-[8px]">
                        <input
                            type="checkbox"
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                        />
                        <label className="text-[12px]">
                            I agree to the GebetaMaps <Link href="/terms" className="text-[#FFA500]">Terms of
                            Service</Link> and{" "}
                            <Link href="/privacy" className="text-[#FFA500]">Privacy Policy</Link>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={requestOtpMutation.isPending}
                        className="w-full h-[40px] flex justify-center items-center px-4 bg-[#FFA500] text-white rounded-md hover:opacity-75 disabled:opacity-50"
                    >
                        {requestOtpMutation.isPending ? <BarLoader color="white"/> : 'Continue'}
                    </button>

                    <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                        Already have an account?{" "}
                        <Link href="/auth/signin" className="text-[#FFA500] hover:text-[#FF8C00]">
                            Sign In
                        </Link>
                    </p>
                </form>
            ) : (
                renderOtpStep()
            )}
        </>
    );
};

export default Register;