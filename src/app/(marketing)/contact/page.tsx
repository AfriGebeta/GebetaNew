//@ts-nocheck
'use client';

import {useState} from 'react';
import Container from "@/sections/Container";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState({
        loading: false,
        error: null,
        success: false
    });

    const handleSubmit = async (e:any) => {
        e.preventDefault();
        setStatus({ loading: true, error: null, success: false });

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            setStatus({ loading: false, error: null, success: true });
            setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form

            // Clear success message after 5 seconds
            setTimeout(() => {
                setStatus(prev => ({ ...prev, success: false }));
            }, 5000);

        } catch (error) {
            setStatus({ loading: false, error: error.message, success: false });

            // Clear error message after 5 seconds
            setTimeout(() => {
                setStatus(prev => ({ ...prev, error: null }));
            }, 5000);
        }
    };

    return (
        <Container>
            <div className="mt-[80px] max-w-2xl mx-auto px-4">
                <h1 className="text-[48px] text-center text-[#1B1E2B] dark:text-white leading-60 mb-[40px]">
                    Contact Us
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-[#1B1E2B] dark:text-white mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            required
                            minLength={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B1E2B] dark:bg-gray-800 dark:border-gray-700 dark:text-white transition duration-200"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            disabled={status.loading}
                            placeholder="Your name"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[#1B1E2B] dark:text-white mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B1E2B] dark:bg-gray-800 dark:border-gray-700 dark:text-white transition duration-200"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={status.loading}
                            placeholder="your.email@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-[#1B1E2B] dark:text-white mb-2">
                            Subject
                        </label>
                        <input
                            type="text"
                            id="subject"
                            required
                            minLength={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B1E2B] dark:bg-gray-800 dark:border-gray-700 dark:text-white transition duration-200"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            disabled={status.loading}
                            placeholder="What is this about?"
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-[#1B1E2B] dark:text-white mb-2">
                            Message
                        </label>
                        <textarea
                            id="message"
                            required
                            minLength={10}
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1B1E2B] dark:bg-gray-800 dark:border-gray-700 dark:text-white transition duration-200"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            disabled={status.loading}
                            placeholder="Your message here..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status.loading}
                        className="w-full bg-[#FFA500] text-white py-3 px-4 rounded-md hover:bg-opacity-90 transition-all disabled:opacity-50">
                        {status.loading ? 'Sending...' : 'Send Message'}
                    </button>

                    {status.error && (
                        <p className="text-red-500 text-sm text-center">{status.error}</p>
                    )}
                    {status.success && (
                        <p className="text-green-500 text-sm text-center">Message sent successfully!</p>
                    )}
                </form>
            </div>
        </Container>
    );
}