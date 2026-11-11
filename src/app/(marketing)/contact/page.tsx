//@ts-nocheck
'use client';

import { useState } from 'react';
import Container from "@/sections/Container";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Button from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Field from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import PhoneInput from "@/components/ui/phone-input";
import Notice from "@/components/ui/notice";


const CONTACT_DETAILS = [
    { label: "Email", value: "info@gebeta.app", href: "mailto:info@gebeta.app" },
    { label: "Office", value: "Maraki Tower, Megenagha, Addis Ababa, Ethiopia" },
    { label: "Developers", value: "Documentation", href: "https://docs.gebeta.app/" },
    { label: "Customers", value: "Open your dashboard", href: "/dashboard" },
];

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '251',
        subject: '',
        message: '',
        company: '' //honeypot
    });
    const [status, setStatus] = useState({
        loading: false,
        error: null,
        success: false
    });

    const handlePhoneChange = (value, country) => {
        const countryCode = country.dialCode;
        if (!value || value.length < countryCode.length) {
           //delete country code, restore it
            setFormData({ ...formData, phone: countryCode });
        } else {
            setFormData({ ...formData, phone: value });
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        // validate after country code
        if (formData.phone.length <= 3) {
            setStatus({ loading: false, error: 'Please enter a valid phone number', success: false });
            return;
        }

        setStatus({ loading: true, error: null, success: false });

        try {
            const submissionData = {
                ...formData,
                phone: `+${formData.phone}`
            };

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            setStatus({ loading: false, error: null, success: true });
            setFormData({ name: '', email: '', phone: '251', subject: '', message: '', company: '' });

            setTimeout(() => {
                setStatus(prev => ({ ...prev, success: false }));
            }, 5000);

        } catch (error) {
            setStatus({ loading: false, error: error.message, success: false });

            setTimeout(() => {
                setStatus(prev => ({ ...prev, error: null }));
            }, 100000);
        }
    };

    const set = (key: keyof typeof formData) => (e) => setFormData({ ...formData, [key]: e.target.value });

    return (
        <Container>
            <div className="grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-8">
                <div className="flex flex-col gap-10 lg:col-span-5">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-[44px] font-medium leading-[1] tracking-[-0.035em] text-foreground md:text-[64px]">
                            Talk to us
                        </h1>
                        <p className="max-w-[40ch] text-[18px] leading-[1.5] text-soft">
                            Questions about pricing, enterprise plans, custom data or a partnership.
                        </p>
                    </div>
                    <dl className="flex flex-col gap-6">
                        {CONTACT_DETAILS.map((item) => (
                            <div key={item.label} className="flex flex-col gap-1">
                                <dt className="text-[15px] text-soft">{item.label}</dt>
                                <dd className="text-[17px] text-foreground">
                                    {item.href ? (
                                        <Link href={item.href} className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
                                            {item.value} <ArrowUpRight aria-hidden className="size-4"/>
                                        </Link>
                                    ) : item.value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <Card className="p-6 md:p-8 lg:col-span-7">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Name" htmlFor="name" required>
                            <Input id="name" autoComplete="name" required minLength={2} value={formData.name}
                                   onChange={set('name')} disabled={status.loading} placeholder="Your name"/>
                        </Field>
                        <Field label="Email" htmlFor="email" required>
                            <Input id="email" type="email" autoComplete="email" required value={formData.email}
                                   onChange={set('email')} disabled={status.loading} placeholder="you@company.com"/>
                        </Field>
                    </div>

                    <Field label="Phone number" htmlFor="phone" required>
                        <PhoneInput
                            id="phone"
                            required
                            country="et"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            disabled={status.loading}
                            placeholder="Your phone number"
                            isValid={(value, country) => value.length > country.dialCode.length}
                        />
                    </Field>

                    <Field label="Subject" htmlFor="subject" required>
                        <Input id="subject" required minLength={2} value={formData.subject} onChange={set('subject')}
                               disabled={status.loading} placeholder="What is this about?"/>
                    </Field>

                    <Field label="Message" htmlFor="message" required>
                        <Textarea id="message" required minLength={10} rows={6} value={formData.message}
                                  onChange={set('message')} disabled={status.loading}
                                  placeholder="Tell us about your project"/>
                    </Field>

                    {/* honeypot, hidden from users */}
                    <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={set('company')}
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden
                    />

                    {status.error && <Notice>{status.error}</Notice>}
                    {status.success && (
                        <Notice tone="success">Message sent. We&apos;ll be in touch soon.</Notice>
                    )}

                    <Button type="submit" size="lg" className="w-full" loading={status.loading}>
                        Send message
                    </Button>
                </form>
                </Card>
            </div>
        </Container>
    );
}
