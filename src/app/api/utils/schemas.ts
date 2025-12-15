
export const resumeOutputSchema = {
    type: 'object',
    properties: {
        full_name: { type: 'string' },
        email: { type: 'string' },
        phone_number: { type: 'string' },
        location: { type: 'string' },
        linkedin_url: { type: 'string' },
        github_url: { type: 'string' },
        portfolio_url: { type: 'string' },
        summary: { type: 'string' },
        categorized_skills: {
            type: 'object',
            properties: {
                programming_languages: { type: 'array', items: { type: 'string' } },
                frameworks_and_libraries: { type: 'array', items: { type: 'string' } },
                databases: { type: 'array', items: { type: 'string' } },
                cloud_technologies: { type: 'array', items: { type: 'string' } },
                tools_and_platforms: { type: 'array', items: { type: 'string' } },
            },
        },
        work_experience: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    job_title: { type: 'string' },
                    company: { type: 'string' },
                    location: { type: 'string' },
                    start_date: { type: 'string' },
                    end_date: { type: 'string' },
                    description: { type: 'array', items: { type: 'string' } },
                },
            },
        },
        education: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    degree: { type: 'string' },
                    institution: { type: 'string' },
                    location: { type: 'string' },
                    graduation_date: { type: 'string' },
                },
            },
        },
        projects: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    description: { type: 'array', items: { type: 'string' } },
                    tech_stack: { type: 'array', items: { type: 'string' } },
                    url: { type: 'string' },
                },
            },
        },
        certifications: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    organization: { type: 'string' },
                    date: { type: 'string' },
                },
            },
        },
        achievements: { type: 'array', items: { type: 'string' } },
        publications: { type: 'array', items: { type: 'string' } },
        languages: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    language: { type: 'string' },
                    proficiency: { type: 'string' },
                },
            },
        },
    },
};

export const atsAnalysisSchema = {
    type: 'object',
    properties: {
        match_score: { type: 'number' },
        summary: { type: 'string' },
        strengths: { type: 'array', items: { type: 'string' } },
        areas_for_improvement: { type: 'array', items: { type: 'string' } },
        keyword_analysis: {
            type: 'object',
            properties: {
                matching_keywords: { type: 'array', items: { type: 'string' } },
                missing_keywords: { type: 'array', items: { type: 'string' } },
            },
        },
        rewrite_suggestions: { type: 'array', items: { type: 'object' } },
    },
};

