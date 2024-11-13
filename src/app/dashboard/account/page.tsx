//@ts-nocheck
"use client";
import React, {useContext, useState} from 'react';
import {useMutation} from "@tanstack/react-query";
import {apiClient} from "@/service/apiClient";
import {AuthContext} from "@/providers/AuthProvider";

export default function Account() {
    const { currentUser, setCurrentUser } = useContext(AuthContext);
    const [username, setUsername] = useState(currentUser?.username || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [phone, setPhone] = useState(currentUser?.phone || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const updateUserMutation = useMutation({
        mutationFn: async () => {
            const response = await apiClient.patch("/user",
                {
                    username,
                    email,
                    phone
                },
                {
                    headers: {
                        Authorization: `Bearer ${currentUser?.token}`
                    }
                }
            );
            return response.data;
        },
        onSuccess: (data) => {
            setSuccess('Profile updated successfully');
            setCurrentUser({
                ...currentUser,
                user:{
                    ...currentUser.user,
                    username,
                    email,
                    phone
                }
            });

        },
        onError: (error: any) => {
            setError(error.response?.data?.message || "Update failed. Please try again.");
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

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-[#1B1E2B] dark:text-white text-[32px] leading-50 mb-8">
                Account Settings
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-[#D1D5DB] rounded-md shadow-sm
                                 focus:outline-none focus:ring focus:ring-[#FFA500]
                                 focus:border-[#FFA500] dark:bg-gray-700 dark:border-gray-600
                                 dark:text-gray-300 transition duration-200 ease-in-out"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                    <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-[#D1D5DB] rounded-md shadow-sm
                                 focus:outline-none focus:ring focus:ring-[#FFA500]
                                 focus:border-[#FFA500] dark:bg-gray-700 dark:border-gray-600
                                 dark:text-gray-300 transition duration-200 ease-in-out"
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                {success && (
                    <p className="text-green-500 text-sm text-center">{success}</p>
                )}

                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-[#FFA500] text-white rounded-md hover:opacity-75
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={updateUserMutation.isPending}
                >
                    {updateUserMutation.isPending ? 'Updating...' : 'Update Profile'}
                </button>
            </form>
        </div>
    );
}