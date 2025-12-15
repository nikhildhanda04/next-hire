'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResumeStore } from '@/app/store/resumeStore';
import { Upload, FileText, CheckCircle, RefreshCw, BookOpen, Briefcase, Settings, BarChart, User } from 'lucide-react';
import { ResumeData } from '@/app/store/resumeStore';

import ResumeDetailsTab from '@/app/components/dashboard/ResumeDetailsTab';
import AtsCheckerTab from '@/app/components/dashboard/AtsCheckerTab';
import JobsTab from '@/app/components/dashboard/JobsTab';
import ProfileTab from '@/app/components/dashboard/ProfileTab';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    const router = useRouter();
    const resumeData = useResumeStore((state) => state.resumeData);
    const rawResumeText = useResumeStore((state) => state.rawResumeText);
    const setResumeData = useResumeStore((state) => state.setResumeData);
    const setRawResumeText = useResumeStore((state) => state.setRawResumeText);

    const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'ats' | 'jobs'>('profile');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/user/profile');
                if (response.ok) {
                    const userData = await response.json();



                    const reconstructedData: ResumeData = {
                        full_name: userData.name,
                        email: userData.email,
                        phone_number: userData.phone,
                        location: userData.location,
                        linkedin_url: userData.linkedin,
                        github_url: userData.github,
                        portfolio_url: userData.portfolio,

                        uncategorized_skills: userData.skills || [],
                        work_experience: userData.experience || [],
                        education: userData.education || [],
                        summary: userData.resumeText ? userData.resumeText.substring(0, 500) : '',
                    };

                    if (userData.resumeText) {
                        setRawResumeText(userData.resumeText);
                    }

                    setResumeData(reconstructedData);

                    if (userData.resumeText) {
                        setActiveTab('resume');
                    } else {
                        setActiveTab('profile');
                    }
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (!resumeData) {
            fetchProfile();
        } else {
            setIsLoading(false);
        }
    }, [resumeData, setResumeData, setRawResumeText]);

    const hasResume = !!rawResumeText || (resumeData?.summary && resumeData.summary.length > 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-light dark:bg-dark">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading...</p>
                </div>
            </div>
        );
    }

    if (!resumeData) {
       
        return <div className="p-8 text-center">Failed to load profile. Please try refreshing.</div>;
    }

    return (
        <div className="bg-light dark:bg-dark min-h-screen font-secondary">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

                    <div className="mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`${activeTab === 'profile'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-stone-500 hover:text-dark dark:hover:text-light hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors flex items-center`}
                            >
                                <User className="mr-2 h-5 w-5" />
                                Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('resume')}
                                className={`${activeTab === 'resume'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-stone-500 hover:text-dark dark:hover:text-light hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors flex items-center`}
                            >
                                <BookOpen className="mr-2 h-5 w-5" />
                                Resume Details
                            </button>
                            <button
                                onClick={() => setActiveTab('ats')}
                                className={`${activeTab === 'ats'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-stone-500 hover:text-dark dark:hover:text-light hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors flex items-center`}
                            >
                                <BarChart className="mr-2 h-5 w-5" />
                                ATS Checker
                            </button>
                            <button
                                onClick={() => setActiveTab('jobs')}
                                className={`${activeTab === 'jobs'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-stone-500 hover:text-dark dark:hover:text-light hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors flex items-center`}
                            >
                                <BarChart className="mr-2 h-5 w-5" />
                                Jobs
                            </button>
                        </nav>
                    </div>

                </div>

                <div>
                    {activeTab === 'profile' && (
                        <ProfileTab resumeData={resumeData} />
                    )}

                    {activeTab === 'resume' && (
                        hasResume ? (
                            <ResumeDetailsTab resumeData={resumeData} />
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                                <h3 className="text-xl font-semibold mb-3">No Resume Found</h3>
                                <p className="text-stone-500 mb-6">Upload your resume to see extracted details and get AI insights.</p>
                                <Button onClick={() => router.push('/')}>
                                    Upload Resume
                                </Button>
                            </div>
                        )
                    )}



                    {activeTab === 'ats' && (
                        hasResume ? (
                            <AtsCheckerTab rawResumeText={rawResumeText} />
                        ) : (
                            <div className="text-center py-20">
                                <p>Please upload a resume first to use the ATS Checker.</p>
                            </div>
                        )

                    )}



                    {activeTab === 'jobs' && (
                        <JobsTab resumeData={resumeData} rawResumeText={rawResumeText} />
                    )}
                </div>
            </div>
        </div>
    );
}