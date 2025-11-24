'use client';

import { useState } from 'react';
import { Job } from '@/app/store/jobStore';
import { ExternalLink, CheckSquare, Square, ChevronLeft, ChevronRight } from 'lucide-react';

interface JobTableProps {
    jobs: Job[];
    onApply: (selectedJobIds: string[]) => void;
}

const ITEMS_PER_PAGE = 10;

export default function JobTable({ jobs, onApply }: JobTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());

    const totalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentJobs = jobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedJobs);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedJobs(newSelected);
    };

    const toggleAll = () => {
        if (selectedJobs.size === currentJobs.length) {
            setSelectedJobs(new Set());
        } else {
            const newSelected = new Set(selectedJobs);
            currentJobs.forEach(job => newSelected.add(job.id));
            setSelectedJobs(newSelected);
        }
    };

    const handleApply = () => {
        onApply(Array.from(selectedJobs));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-200">
                    Found {jobs.length} Jobs
                </h2>
                <button
                    onClick={handleApply}
                    disabled={selectedJobs.size === 0}
                    className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
                >
                    Auto Apply ({selectedJobs.size})
                </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                                <button onClick={toggleAll} className="text-gray-400 hover:text-gray-600">
                                    {currentJobs.length > 0 && selectedJobs.size === currentJobs.length ? (
                                        <CheckSquare className="w-5 h-5 text-primary" />
                                    ) : (
                                        <Square className="w-5 h-5" />
                                    )}
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Role
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Company
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Source
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {currentJobs.map((job) => (
                            <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button onClick={() => toggleSelection(job.id)} className="text-gray-400 hover:text-gray-600">
                                        {selectedJobs.has(job.id) ? (
                                            <CheckSquare className="w-5 h-5 text-primary" />
                                        ) : (
                                            <Square className="w-5 h-5" />
                                        )}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{job.title}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{job.location}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">{job.company}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.source === 'YC' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {job.source}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.status === 'new' ? 'bg-green-100 text-green-800' :
                                            job.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <a href={job.applyLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark inline-flex items-center">
                                        View <ExternalLink className="w-4 h-4 ml-1" />
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-4">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
