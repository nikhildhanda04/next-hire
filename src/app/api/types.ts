// Type definitions matching the Python Pydantic models

export interface CategorizedSkills {
    programming_languages?: string[];
    frameworks_and_libraries?: string[];
    databases?: string[];
    cloud_technologies?: string[];
    tools_and_platforms?: string[];
}

export interface Certification {
    name?: string | null;
    organization?: string | null;
    date?: string | null;
}

export interface Language {
    language?: string | null;
    proficiency?: string | null;
}

export interface WorkExperience {
    job_title?: string | null;
    company?: string | null;
    location?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    description?: string[] | null;
}

export interface Education {
    degree?: string | null;
    institution?: string | null;
    location?: string | null;
    graduation_date?: string | null;
}

export interface Project {
    name?: string | null;
    description?: string[] | null;
    tech_stack?: string[] | null;
    url?: string | null;
}

export interface ResumeInput {
    resume_text: string;
}

export interface ResumeOutput {
    full_name?: string | null;
    email?: string | null;
    phone_number?: string | null;
    location?: string | null;
    linkedin_url?: string | null;
    github_url?: string | null;
    portfolio_url?: string | null;
    summary?: string | null;
    categorized_skills?: CategorizedSkills | null;
    work_experience?: WorkExperience[];
    education?: Education[];
    projects?: Project[];
    certifications?: Certification[];
    achievements?: string[];
    publications?: string[];
    languages?: Language[];
}

export interface RewriteSuggestion {
    original_bullet: string;
    suggested_improvement: string;
}

export interface KeywordAnalysis {
    matching_keywords: string[];
    missing_keywords: string[];
}

export interface ATSAnalysisInput {
    resume_text: string;
    job_description?: string | null;
    career_level?: string | null;
}

export interface ATSAnalysisOutput {
    match_score: number;
    summary: string;
    strengths: string[];
    areas_for_improvement: string[];
    keyword_analysis: KeywordAnalysis;
    rewrite_suggestions: RewriteSuggestion[];
}

