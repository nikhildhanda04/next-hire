
'use client';

import { Bookmark, Loader2, Sun, Moon } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useResumeStore } from '@/app/store/resumeStore';

export default function Hero() {
    // State Management
    const [isDark, setIsDark] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const setResumeData = useResumeStore((state) => state.setResumeData);
    const setRawResumeText = useResumeStore((state) => state.setRawResumeText);
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const toggleTheme = () => {
        const html = document.documentElement;
        html.classList.toggle('dark');
        setIsDark(!isDark);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);

        try {
            let extractedText = '';

            if (file.type === 'application/pdf') {
                const pdfjs = await import('pdfjs-dist');
                // Set worker source - use CDN for production builds to avoid module resolution issues
                // Using version 3.11.174 to match package.json
                if (typeof window !== 'undefined') {
                    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
                }

                const data = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument(data).promise;
                const numPages = pdf.numPages;
                let textContentStr = '';
                const allUrls: string[] = [];

                for (let i = 1; i <= numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    // Extract text from items - TextItem has 'str' property, TextMarkedContent does not
                    textContentStr += textContent.items
                        .map((item) => ('str' in item ? item.str : ''))
                        .join(' ');

                    const annotations = await page.getAnnotations();
                    annotations
                        .filter((anno: { subtype: string; url: string | undefined }) => anno.subtype === 'Link' && anno.url)
                        .forEach((anno: { url: string }) => allUrls.push(anno.url));
                }

                extractedText = textContentStr;

                if (allUrls.length > 0) {
                    const uniqueUrls = [...new Set(allUrls)];
                    extractedText += '\n\n--- Extracted Hyperlinks ---\n' + uniqueUrls.join('\n');
                }

            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const mammoth = (await import('mammoth')).default;
                const arrayBuffer = await file.arrayBuffer();

                const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
                const { value: text } = await mammoth.extractRawText({ arrayBuffer });
                extractedText = text;

                if (typeof window !== 'undefined') {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const links = Array.from(doc.querySelectorAll('a'));
                    const extractedUrls = links.map(link => link.href).filter(href => href);

                    if (extractedUrls.length > 0) {
                        extractedText += '\n\n--- Extracted Hyperlinks ---\n' + extractedUrls.join('\n');
                    }
                }

            } else {
                alert('Unsupported file type. Please upload a PDF or DOCX file.');
                setIsLoading(false);
                return;
            }

            setRawResumeText(extractedText);
            await callParseApi(extractedText);

        } catch (error) {
            console.error('Error parsing file:', error);
            alert('There was an error parsing your resume. Please try again.');
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const callParseApi = async (text: string) => {
        try {
            const response = await fetch('/api/v1/resumes/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume_text: text }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'An unknown error occurred.');
            }

            const data = await response.json();
            setResumeData(data);
            router.push('/dashboard');

        } catch (error) {
            console.error('Error calling API:', error);
            alert(`Failed to analyze resume: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    // Typing animation state
    const [typedText, setTypedText] = useState("");
    const fullText = "This field is being filled by Next Hire AI...";

    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            setTypedText((prev) => {
                if (index < fullText.length) {
                    index++;
                    return fullText.slice(0, index);
                }
                return prev;
            });
        }, 50);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative flex flex-col items-center justify-start pt-44 min-h-screen w-full overflow-hidden">
            {/* Background Grid */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    opacity: 0.09,
                    WebkitMaskImage: 'radial-gradient(ellipse at center, black 5%, transparent 100%)',
                    maskImage: 'radial-gradient(ellipse at center, black 5%, transparent 100%)',
                }}
            >
                <div className={`w-full h-full ${isDark ? 'bg-grid-white' : 'bg-grid-black'}`} />
            </div>

            {/* Main Content */}
            <div className="relative flex flex-col items-center gap-6 z-10 w-full max-w-6xl px-4">

                {/* Heading Section */}
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="hidden px-4 py-2 rounded-full items-center md:flex text-center font-secondary text-xs md:text-sm text-dark dark:text-light border border-stone-200 dark:border-stone-700 bg-white/50 dark:bg-black/50 backdrop-blur-sm mb-2">
                        <Bookmark className="inline mr-2 w-3 md:w-4 h-auto" />
                        Find your dream job faster
                    </div>

                    <h1 className="font-primary text-5xl md:text-7xl uppercase text-dark dark:text-light transition-colors duration-200 tracking-tight leading-none">
                        Upload. Match. <span className="text-primary">Succeed.</span>
                    </h1>
                    <p className="font-secondary text-base md:text-xl text-stone-500 dark:text-stone-400 max-w-2xl">
                        Stop copy-pasting. Let our AI analyze your resume and autofill applications with tailored answers.
                    </p>

                    {/* CTA Button */}
                    <div className="mt-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.docx"
                        />
                        <button
                            onClick={handleUploadClick}
                            disabled={isLoading}
                            className="font-secondary text-lg bg-primary text-light px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Analyzing Resume...
                                </>
                            ) : (
                                <>
                                    Upload Resume
                                    <Bookmark className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Dashboard Simulation Visuals */}
                <div className="relative top-10 w-full mt-16 md:mt-24 perspective-distant">

                    {/* Main Dashboard Rectangle */}
                    <div className="w-full max-w-4xl mx-auto h-[400px] md:h-[500px] bg-white dark:bg-neutral-900 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden relative z-0 md:rotate-x-2 transition-transform duration-700">
                        {/* Mockup Header */}
                        <div className="h-10 border-b border-stone-200 dark:border-stone-800 flex items-center px-4 gap-2 bg-stone-50 dark:bg-stone-900/50">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        {/* Mockup Body - Abstract Blocks */}
                        <div className="p-6 flex gap-6 h-full">
                            <div className="w-1/4 h-3/4 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" style={{ animationDuration: '5s' }}></div>
                            <div className="flex-1 flex flex-col gap-4 animate-pulse duration-600">
                                <div className="h-32 bg-stone-100 dark:bg-stone-800 rounded-lg"></div>
                                <div className="h-32 bg-stone-100 dark:bg-stone-800 rounded-lg opacity-60"></div>
                                <div className="h-32 bg-stone-100 dark:bg-stone-800 rounded-lg opacity-40"></div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Extension Box (Left) */}
                    <div className="absolute top-20 left-4 md:-left-4 z-30 md:top-32 w-48 md:w-64 bg-white dark:bg-neutral-800 rounded-lg border border-stone-200 dark:border-stone-700 shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-4 hidden md:block animate-float">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <Bookmark className="w-4 h-4 text-primary" />
                            </div>
                            <div className="text-sm font-semibold text-dark dark:text-light">Next Hire AI</div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-2 w-3/4 bg-stone-100 dark:bg-stone-700 rounded full" />
                            <div className="h-2 w-1/2 bg-stone-100 dark:bg-stone-700 rounded full" />
                            <div className="mt-4 px-3 py-1.5 bg-primary text-white text-xs rounded text-center">Autofill Profile</div>
                        </div>
                    </div>

                    {/* Floating Input Box (Right/Center) */}
                    <div className="absolute top-10 right-4 md:right-20 md:-top-12 w-64 md:w-80 bg-white dark:bg-neutral-800 rounded-lg border border-primary ring-4 ring-primary/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-4 z-10 transition-all duration-300 hover:scale-105">
                        <label className="text-xs font-semibold text-stone-500 uppercase mb-1 block">Why do you want this job?</label>
                        <div className="font-mono text-sm text-dark dark:text-light border-l-2 border-primary pl-2 h-16 overflow-hidden">
                            {typedText}
                            <span className="animate-pulse">|</span>
                        </div>
                    </div>

                    {/* Curved Arrow */}
                    <svg className="absolute w-64 h-32 top-20 left-32 md:w-[580px] z-20 md:h-48 md:top-0 md:left-48 pointer-events-none hidden md:block text-primary" viewBox="0 0 600 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 0,200 C 400,180 300,30 550,10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrowhead)" className="animate-dash" />
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                            </marker>
                        </defs>
                    </svg>

                </div>
            </div>
        </div>
    );
}
