'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ email: '', name: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    return (
        <footer className="relative w-full pt-32 mt-0">

    
            <div className="flex flex-col bg-primary w-full overflow-hidden pt-32 pb-10" >
                <div className="flex flex-col md:flex-row px-8 md:px-44 items-start justify-between gap-12 md:gap-0">
                    <div className="flex flex-col w-full md:w-auto">
                        <div className="font-secondary font-medium text-left text-4xl text-light mb-6">
                            Contact Us
                        </div>
                        <form className="w-full" onSubmit={handleSubmit}>
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <input
                                    type="email"
                                    placeholder="Your Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="w-full md:w-64 px-4 py-3 text-dark dark:text-light bg-white/[0.9] dark:bg-neutral-800/[0.9] rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full md:w-64 px-4 py-3 text-dark dark:text-light bg-white/[0.9] dark:bg-neutral-800/[0.9] rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>
                            <div className="mt-4">
                                <textarea
                                    placeholder="Your Message"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                    className="w-full max-w-md px-4 py-3 text-dark dark:text-light bg-white/[0.9] dark:bg-neutral-800/[0.9] rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    rows={4}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="bg-amber-900/80 hover:bg-amber-900 font-secondary font-medium text-light px-8 py-3 rounded-full mt-5 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? 'Sending...' : 'Send Message'}
                            </button>
                            {status === 'success' && (
                                <p className="mt-2 text-green-400 text-sm">Message sent successfully!</p>
                            )}
                            {status === 'error' && (
                                <p className="mt-2 text-red-400 text-sm">Failed to send message. Please try again.</p>
                            )}
                        </form>
                    </div>

                    <div className="hidden md:flex flex-col">
                        <div className="font-secondary font-medium text-left text-4xl text-light">
                            Navigation
                        </div>
                        <ul className="text-light text-xl mt-8 space-y-2">
                            <li className="hover:underline transition-all duration-300 ease-in cursor-pointer"><Link href="/">Home</Link></li>
                            <li className="hover:underline transition-all duration-300 ease-in cursor-pointer">About</li>
                            <li className="hover:underline transition-all duration-300 ease-in cursor-pointer">FAQ</li>
                            <li className="hover:underline transition-all duration-300 ease-in cursor-pointer"><Link href="/privacy">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="font-secondary text-center text-light/80 font-medium text-lg mt-20 border-t border-white/10 pt-8 mx-8">
                    Next Hire | © 2025 All rights reserved.
                </div>

                <div className="font-primary text-[15vw] leading-none -mb-[4vw] text-light/10 hover: text-center select-none mt-10">
                    NEXT HIRE
                </div>
            </div>
        </footer>
    )
}