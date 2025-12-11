'use client'

import { Upload, Download, MousePointerClick, PenTool } from "lucide-react";

export default function HowItWorks() {
    return (
        <section className="py-24 px-4 w-full bg-stone-50 dark:bg-neutral-900 relative overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <h2 className="font-primary text-4xl md:text-5xl text-dark dark:text-light mb-4">
                        How It Works
                    </h2>
                    <p className="font-secondary text-lg text-stone-500 dark:text-stone-400">
                        Three simple steps to your new career.
                    </p>
                </div>

                <div className="relative flex flex-col gap-24 md:gap-32 max-w-6xl mx-auto px-4">
                    {/* SVG Connector Lines Container */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block text-stone-300 dark:text-stone-700 opacity-60" viewBox="0 0 1000 1200" preserveAspectRatio="none">
                        <defs>
                            <marker id="arrowhead" markerWidth="14" markerHeight="10" refX="12" refY="5" orient="auto">
                                <polygon points="0 0, 14 5, 0 10" fill="currentColor" />
                            </marker>
                        </defs>

                        {/* Arrow 1 to 2 */}
                        <path d="M 200,210 C 300,450 600,150 780,310" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="10 10" markerEnd="url(#arrowhead)" />
                        {[0, 1, 2].map((i) => (
                            <circle key={`p1-${i}`} r="3" fill="currentColor" className="text-primary opacity-80">
                                <animateMotion dur="3s" repeatCount="indefinite" begin={`${i * 1}s`} path="M 200,210 C 300,450 600,150 780,310" />
                            </circle>
                        ))}

                        {/* Arrow 2 to 3 */}
                        <path d="M 780,620 C 780,750 650,550 550,650 C 500,700 350,550 220,680" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="10 10" markerEnd="url(#arrowhead)" />
                        {[0, 1, 2].map((i) => (
                            <circle key={`p2-${i}`} r="3" fill="currentColor" className="text-primary opacity-80">
                                <animateMotion dur="3s" repeatCount="indefinite" begin={`${i * 1}s`} path="M 780,620 C 780,750 650,550 550,650 C 500,700 350,550 220,680" />
                            </circle>
                        ))}

                        {/* Arrow 3 to 4 */}
                        <path d="M 220,940 C 220,1050 450,850 500,950 C 550,1000 650,950 780,1060" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="10 10" markerEnd="url(#arrowhead)" />
                        {[0, 1, 2].map((i) => (
                            <circle key={`p3-${i}`} r="3" fill="currentColor" className="text-primary opacity-80">
                                <animateMotion dur="3s" repeatCount="indefinite" begin={`${i * 1}s`} path="M 220,940 C 220,1050 450,850 500,950 C 550,1000 650,950 780,1060" />
                            </circle>
                        ))}
                    </svg>

                    {/* Step 1: Left */}
                    <div className="flex justify-center md:justify-start w-full relative z-10 md:pl-8">
                        <div className="flex flex-col items-center text-center w-80">
                            <div className="w-32 h-32 bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-6 relative group transform transition hover:-translate-y-2 duration-300">
                                <div className="absolute -top-4 -right-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">1</div>
                                <Upload className="w-14 h-14 text-primary" />
                            </div>
                            <h3 className="font-primary text-3xl text-dark dark:text-light mb-3">Upload Resume</h3>
                            <p className="font-secondary text-stone-500 dark:text-stone-400 text-lg">
                                Upload your PDF or DOCX resume.
                            </p>
                        </div>
                    </div>

                    {/* Step 2: Right */}
                    <div className="flex justify-center md:justify-end w-full relative z-10 md:pr-8">
                        <div className="flex flex-col items-center text-center w-80">
                            <div className="w-32 h-32 bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-6 relative group transform transition hover:-translate-y-2 duration-300">
                                <div className="absolute -top-4 -right-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">2</div>
                                <Download className="w-14 h-14 text-primary" />
                            </div>
                            <h3 className="font-primary text-3xl text-dark dark:text-light mb-3">Install Extension</h3>
                            <p className="font-secondary text-stone-500 dark:text-stone-400 text-lg">
                                Add our Chrome extension.
                            </p>
                        </div>
                    </div>

                    {/* Step 3: Left */}
                    <div className="flex justify-center md:justify-start w-full relative z-10 md:pl-8">
                        <div className="flex flex-col items-center text-center w-80">
                            <div className="w-32 h-32 bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-6 relative group transform transition hover:-translate-y-2 duration-300">
                                <div className="absolute -top-4 -right-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">3</div>
                                <PenTool className="w-14 h-14 text-primary" />
                            </div>
                            <h3 className="font-primary text-3xl text-dark dark:text-light mb-3">Autofill Profile</h3>
                            <p className="font-secondary text-stone-500 dark:text-stone-400 text-lg">
                                Let AI fill your profile.
                            </p>
                        </div>
                    </div>

                    {/* Step 4: Right */}
                    <div className="flex justify-center md:justify-end w-full relative z-10 md:pr-8">
                        <div className="flex flex-col items-center text-center w-80">
                            <div className="w-32 h-32 bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-700 flex items-center justify-center mb-6 relative group transform transition hover:-translate-y-2 duration-300">
                                <div className="absolute -top-4 -right-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">4</div>
                                <MousePointerClick className="w-14 h-14 text-primary" />
                            </div>
                            <h3 className="font-primary text-3xl text-dark dark:text-light mb-3">Apply & Succeed</h3>
                            <p className="font-secondary text-stone-500 dark:text-stone-400 text-lg">
                                Submit and get hired.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
