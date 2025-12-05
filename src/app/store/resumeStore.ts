import { create } from 'zustand';

export interface WorkExperience {
    job_title: string;
    company: string;
    location?: string;
    start_date: string;
    end_date?: string;
    description: string[];
}

export interface Project {
    name?: string;
    url?: string;
    tech_stack?: string[];
    description?: string[];
}

export interface Education {
    degree: string;
    institution: string;
    location?: string;
    graduation_date: string;
}

export interface Certification {
    name: string;
    organization: string;
    date: string;
}

export interface Language {
    language: string;
    proficiency: string;
}

export interface CategorizedSkills {
    programming_languages: string[];
    frameworks_libraries: string[];
    databases: string[];
    cloud_technologies: string[];
    tools_platforms: string[];
}

export interface ResumeData {
    full_name?: string;
    email?: string;
    phone_number?: string;
    location?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    summary?: string;

    uncategorized_skills?: string[];
    categorized_skills?: CategorizedSkills;

    work_experience?: WorkExperience[];
    projects?: Project[];
    education?: Education[];
    certifications?: Certification[];
    publications?: string[];
    achievements?: string[];
    languages?: Language[];
}

interface ResumeState {
    resumeData: ResumeData | null;
    rawResumeText: string;
    setResumeData: (data: ResumeData) => void;
    setRawResumeText: (text: string) => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
    resumeData: null,
    rawResumeText: '',
    setResumeData: (data) => set({ resumeData: data }),
    setRawResumeText: (text) => set({ rawResumeText: text }),
}));