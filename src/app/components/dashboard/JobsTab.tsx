'use client';

import { useState } from 'react';
import { useJobStore } from '@/app/store/jobStore';
import JobTable from './JobTable';
import { RefreshCw, Play } from 'lucide-react';
import { ResumeData } from '@/app/store/resumeStore';

interface JobsTabProps {
    resumeData: ResumeData | null;
    rawResumeText: string | null;
}

export default function JobsTab({ resumeData, rawResumeText }: JobsTabProps) {
    const { jobs, isLoading, error, addJobs, setLoading, setError } = useJobStore();
    const [applying, setApplying] = useState(false);
    const [applyStatus, setApplyStatus] = useState<string | null>(null);

    const handleFetchJobs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/jobs/fetch');
            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }
            const data = await response.json();
            addJobs(data.jobs);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch jobs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAutoApply = async (selectedJobIds: string[]) => {
        if (!resumeData || !rawResumeText) {
            setError('Resume data is missing. Please upload a resume first.');
            return;
        }

        setApplying(true);
        setApplyStatus('Starting application process...');

        const selectedJobs = jobs.filter(job => selectedJobIds.includes(job.id));

        for (const job of selectedJobs) {
            setApplyStatus(`Applying to ${job.title} at ${job.company}...`);
            try {
                const response = await fetch('/api/jobs/apply', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        job,
                        resumeData,
                        rawResumeText
                    })
                });

                const result = await response.json();
                if (result.status === 'success' || result.coverLetter) {
                    console.log(`Application prepared for ${job.company}`);
                    // Ideally we'd show the cover letter to the user or save it
                }
            } catch (err) {
                console.error(`Failed to apply to ${job.company}`, err);
            }
        }

        setApplyStatus('Finished processing applications.');
        setApplying(false);
        setTimeout(() => setApplyStatus(null), 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Internship Opportunities</h2>
                    <p className="text-stone-500 dark:text-stone-400">Fetch and apply to the latest internships from YC and Wellfound.</p>
                </div>
                <button
                    onClick={handleFetchJobs}
                    disabled={isLoading || applying}
                    className="flex items-center px-4 py-2 bg-stone-800 text-white rounded-md hover:bg-stone-700 transition-colors disabled:opacity-70"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Fetching...' : 'Fetch Jobs'}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                    {error}
                </div>
            )}

            {applyStatus && (
                <div className="p-4 bg-blue-50 text-blue-700 rounded-md border border-blue-200 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                    {applyStatus}
                </div>
            )}

            {jobs.length > 0 ? (
                <JobTable jobs={jobs} onApply={handleAutoApply} />
            ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">No jobs found. Click "Fetch Jobs" to get started.</p>
                </div>
            )}
        </div>
    );
}
