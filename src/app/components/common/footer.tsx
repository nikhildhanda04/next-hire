// frontend\src\app\components\common\footer.tsx
'use client';

export default function Footer() {
    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="relative w-full pt-32 mt-0">
            {/* Combined CTA Card - Floating Overlap */}
    

            {/* Footer Content */}
            <div className="flex flex-col bg-primary w-full overflow-hidden pt-32 pb-10" >
                <div className="flex flex-col md:flex-row px-8 md:px-44 items-start justify-between gap-12 md:gap-0">
                    <div className="flex flex-col w-full md:w-auto">
                        <div className="font-secondary font-medium text-left text-4xl text-light mb-6">
                            Contact Us
                        </div>
                        <form className="w-full">
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <input
                                    type="email"
                                    placeholder="Your Email"
                                    className="w-full md:w-64 px-4 py-3 text-dark dark:text-light bg-white/[0.9] dark:bg-neutral-800/[0.9] rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    className="w-full md:w-64 px-4 py-3 text-dark dark:text-light bg-white/[0.9] dark:bg-neutral-800/[0.9] rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>
                            <div className="mt-4">
                                <textarea
                                    placeholder="Your Message"
                                    className="w-full max-w-md px-4 py-3 text-dark dark:text-light bg-white/[0.9] dark:bg-neutral-800/[0.9] rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    rows={4}
                                />
                            </div>
                            <button className="bg-amber-900/80 hover:bg-amber-900 font-secondary font-medium text-light px-8 py-3 rounded-full mt-5 transition-colors duration-300">
                                Send Message
                            </button>
                        </form>
                    </div>

                    <div className="hidden md:flex flex-col">
                        <div className="font-secondary font-medium text-left text-4xl text-light">
                            Navigation
                        </div>
                        <ul className="text-light text-xl mt-8 space-y-2">
                            <li className="hover:underline transition-all duration-300 ease-in cursor-pointer">Home</li>
                            <li className="hover:underline transition-all duration-300 ease-in cursor-pointer">About</li>
                            <li className="hover:underline transition-all duration-300 ease-in cursor-pointer">FAQ</li>
                        </ul>
                    </div>
                </div>

                <div className="font-secondary text-center text-light/80 font-medium text-lg mt-20 border-t border-white/10 pt-8 mx-8">
                    Next Hire | © 2025 All rights reserved.
                </div>

                <div className="font-primary text-[15vw] leading-none -mb-[4vw] text-light/10 text-center select-none mt-10">
                    NEXT HIRE
                </div>
            </div>
        </footer>
    )
}