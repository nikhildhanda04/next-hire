// frontend\src\app\components\dashboard\AtsCheckerTab.tsx
'use client';

import { useState } from 'react';
import {  FileText, CheckCircle, XCircle, ThumbsUp, Lightbulb, Wand2 } from 'lucide-react';
import ErrorMessage from '../common/ErrorMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import CareerLevelButtons from './CareerLevelButtons';
import JobDescriptionInput from './JobDescriptionInput';

// --- Type Definitions ---
// These now match the new, more advanced backend models

interface KeywordAnalysis {
    matching_keywords: string[];
    missing_keywords: string[];
}

interface RewriteSuggestion {
    original_bullet: string;
    suggested_improvement: string;
}

interface ATSAnalysisResult {
    match_score: number;
    summary: string;
    strengths: string[];
    areas_for_improvement: string[];
    keyword_analysis: KeywordAnalysis;
    rewrite_suggestions: RewriteSuggestion[];
};

// Define the props that this component will accept
interface AtsCheckerTabProps {
    rawResumeText: string | null;
}

const AtsCheckerTab: React.FC<AtsCheckerTabProps> = ({ rawResumeText }) => {
    // State for the ATS feature UI and data
    const [atsInputType, setAtsInputType] = useState<'level' | 'description'>('level');
    const [jobDescription, setJobDescription] = useState('');
    const [atsResult, setAtsResult] = useState<ATSAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Function to handle the API call to the backend for analysis
    const handleAnalysisRequest = async (payload: { job_description?: string; career_level?: string }) => {
        setIsAnalyzing(true);
        setAtsResult(null);

        if (!rawResumeText) {
            setError('Missing resume text. Please upload a resume first.');
            setIsAnalyzing(false);
            return;
        }

        setError(null);

        try {
            const response = await fetch('/api/v1/resumes/analyze-ats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resume_text: rawResumeText,
                    ...payload,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to get ATS analysis.');
            }

            const result = await response.json();
            setAtsResult(result);
            setError(null);
        } catch (error) {
            console.error('Error during ATS analysis:', error);
            setError(error instanceof Error ? error.message : 'Analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-dark dark:text-light mb-4 flex items-center">
                <FileText className="mr-3 text-primary" /> AI Resume Optimizer
            </h2>

            {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

            <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg p-1 mb-6 w-fit bg-gray-50 dark:bg-gray-900">
                <button
                    onClick={() => setAtsInputType('level')}
                    className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                        atsInputType === 'level'
                            ? 'bg-primary text-white shadow'
                            : 'text-stone-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                    By Career Level
                </button>
                <button
                    onClick={() => setAtsInputType('description')}
                    className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                        atsInputType === 'description'
                            ? 'bg-primary text-white shadow'
                            : 'text-stone-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                    By Job Description
                </button>
            </div>

            {atsInputType === 'level' && (
                <div>
                    <p className="text-stone-500 mb-4">Select a career level for a general analysis.</p>
                    <CareerLevelButtons
                        onSelect={(level) => handleAnalysisRequest({ career_level: level })}
                        isAnalyzing={isAnalyzing}
                    />
                </div>
            )}

            {atsInputType === 'description' && (
                <div>
                    <p className="text-stone-500 mb-4">Paste a job description for a specific analysis.</p>
                    <JobDescriptionInput
                        value={jobDescription}
                        onChange={setJobDescription}
                        onAnalyze={() => handleAnalysisRequest({ job_description: jobDescription })}
                        isAnalyzing={isAnalyzing}
                    />
                </div>
            )}

            {isAnalyzing && (
                <LoadingSpinner message="Our AI is analyzing your resume... this may take a moment." />
            )}
            
            {/* --- ENHANCED ATS RESULTS DISPLAY --- */}
            {atsResult && (
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-2xl font-bold text-dark dark:text-light mb-6 text-center">Your Detailed ATS Report</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl mb-6">
                        <div className="md:col-span-1 flex justify-center">
                            <div className="relative h-40 w-40">
                                <svg className="transform -rotate-90" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="54" fill="none" strokeWidth="12" className="stroke-gray-200 dark:stroke-gray-700" />
                                    <circle
                                        cx="60" cy="60" r="54" fill="none" strokeWidth="12"
                                        className="stroke-primary"
                                        strokeDasharray={2 * Math.PI * 54}
                                        strokeDashoffset={2 * Math.PI * 54 * (1 - atsResult.match_score / 100)}
                                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-4xl font-bold text-primary">{atsResult.match_score}<span className="text-2xl">%</span></span>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2 text-left">
                             <h4 className="text-lg font-semibold text-dark dark:text-light mb-2">AI Recruiter Summary</h4>
                             <p className="text-stone-500 dark:text-stone-400 leading-relaxed">{atsResult.summary}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center"><ThumbsUp className="mr-2"/>Key Strengths</h4>
                            <ul className="list-disc list-inside space-y-2 text-green-700 dark:text-green-400">
                                {atsResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                            <h4 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center"><Lightbulb className="mr-2"/>Areas for Improvement</h4>
                            <ul className="list-disc list-inside space-y-2 text-amber-700 dark:text-amber-400">
                                {atsResult.areas_for_improvement.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                        </div>
                    </div>

                    {/* --- AI-Powered Optimization Suggestions --- */}
                    {atsResult.rewrite_suggestions && atsResult.rewrite_suggestions.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-xl font-semibold text-dark dark:text-light mb-4 flex items-center"><Wand2 className="mr-2 text-primary"/>AI-Powered Optimization Suggestions</h4>
                            <div className="space-y-4">
                                {atsResult.rewrite_suggestions.map((suggestion, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                                        <div>
                                            <h5 className="font-semibold text-red-600 dark:text-red-400 mb-2">Original Bullet Point:</h5>
                                            <p className="text-sm text-stone-500 italic">&quot;{suggestion.original_bullet}&quot;</p>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-green-600 dark:text-green-400 mb-2">Suggested Improvement:</h5>
                                            <p className="text-sm text-dark dark:text-light">{suggestion.suggested_improvement}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="text-xl font-semibold text-dark dark:text-light mb-4">Keyword Analysis</h4>
                        <div className="mb-4">
                            <h5 className="text-md font-medium text-stone-600 dark:text-stone-300 mb-2 flex items-center"><CheckCircle className="mr-2 text-green-500"/>Matching Keywords</h5>
                            <div className="flex flex-wrap gap-2">
                                {atsResult.keyword_analysis.matching_keywords.map((kw, i) => <span key={i} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium px-2.5 py-0.5 rounded-full">{kw}</span>)}
                            </div>
                        </div>
                        <div>
                            <h5 className="text-md font-medium text-stone-600 dark:text-stone-300 mb-2 flex items-center"><XCircle className="mr-2 text-red-500"/>Missing Keywords</h5>
                            <div className="flex flex-wrap gap-2">
                                {atsResult.keyword_analysis.missing_keywords.map((kw, i) => <span key={i} className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm font-medium px-2.5 py-0.5 rounded-full">{kw}</span>)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AtsCheckerTab;

