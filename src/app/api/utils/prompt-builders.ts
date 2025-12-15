
import { resumeOutputSchema, atsAnalysisSchema } from './schemas';

export function buildResumeParsePrompt(resumeText: string): string {
    return `
    You are an expert, highly meticulous resume parser. Your task is to extract information into a structured JSON object
    that strictly adheres to the provided schema. Do not add any extra explanations or text outside the JSON object.
    **Detailed Extraction Instructions:**
    1.  **Contact Info:** Extract all personal details (Name, Email, Phone, Location).
    2.  **Profile Links:** Extract LinkedIn, GitHub, and Portfolio URLs. Look for them in the text AND the "--- Extracted Hyperlinks ---" section. prioritize full URLs.
    3.  **Categorized Skills:** Analyze and group all skills into the correct categories.
    4.  **Certifications & Languages:** Extract any certifications and languages listed.
    5.  **Project URLs:** Use the "--- Extracted Hyperlinks ---" section to find the correct URL for each project.
    JSON Schema:
    ${JSON.stringify(resumeOutputSchema, null, 2)}
    Resume Text:
    ---
    ${resumeText}
    ---
    `;
}

export function buildImprovableBulletsPrompt(resumeText: string, context: string): string {
    return `
    You are a Senior Technical Recruiter. Your task is to identify up to 5-7 bullet points from the 'Work Experience' or 'Projects'
    sections of the provided resume that have the most potential for improvement to better match the analysis context.
    Return ONLY a JSON list of strings, where each string is the exact, verbatim text of an improvable bullet point.

    Example Response:
    ["Developed a new feature.", "Worked on a team project using React.", "Responsible for bug fixes."]

    Resume Text:
    ---
    ${resumeText}
    ---

    Analysis Context:
    ---
    ${context}
    ---
    `;
}

export function buildRefineBulletPrompt(bullet: string, context: string): string {
    return `
    You are an expert resume writer. Your task is to rewrite the following single bullet point to be more impactful and better aligned with the provided analysis context.
    Focus on quantifying achievements and using action verbs. Do not add any information that is not present in the original bullet.
    Return ONLY the rewritten bullet point as a single string.

    Original Bullet Point: "${bullet}"

    Analysis Context: "${context}"
    `;
}

export function buildATSAnalysisPrompt(
    resumeText: string,
    persona: string,
    evaluationPhilosophy: string,
    analysisContext: string
): string {
    return `
    **Persona:** ${persona}
    **Task:**
    ${evaluationPhilosophy}
    After your evaluation, provide a detailed analysis in a single JSON object.
    **Rules:** The score must be specific (e.g., 87, not 85). The \`rewrite_suggestions\` field in the schema should be an EMPTY LIST for now. You will not generate suggestions in this step.
    **JSON Schema:**
    ${JSON.stringify(atsAnalysisSchema, null, 2)}
    **Resume Text:**
    ---
    ${resumeText}
    ---
    **Analysis Context:**
    ${analysisContext}
    `;
}

export function getCareerLevelPersona(careerLevel: string): { persona: string; evaluationPhilosophy: string } {
    const personas = {
        'Entry Level': {
            persona: 'You are a University Recruiter looking for potential.',
            evaluationPhilosophy: 'Construct a mental model of an Ideal Entry-Level Candidate (skills, projects, internships) and score the resume against it.',
        },
        'Mid Level': {
            persona: 'You are a Technical Recruiter hiring for mid-level engineers (2-5 years experience). You are looking for proven ability.',
            evaluationPhilosophy: 'Construct a mental model of an Ideal Mid-Level Candidate (2-5 years experience, quantifiable impact) and score against it.',
        },
        'Senior Level': {
            persona: 'You are an Executive Recruiter hiring for senior roles (5+ years). You are looking for strategic impact.',
            evaluationPhilosophy: 'Construct a mental model of an Ideal Senior-Level Candidate (leadership, mentorship, business impact) and score against it.',
        },
    };

    return personas[careerLevel as keyof typeof personas] || personas['Mid Level'];
}


export function buildSmartAutofillPrompt(
    question: string,
    resumeText: string,
    userName: string,
    pageContext?: string,
    userKnowledge?: { key: string; value: string }[]
): string {
    const knowledgeContext = userKnowledge && userKnowledge.length > 0
        ? `
    Your Past Answers (User Memory):
    The following are answers you have given to similar questions in the past. Use them as **inspiration only**. 
    **CRITICAL INSTRUCTION**: Do NOT copy these answers verbatim if they contain specific company names or contexts that do not match the current job. 
    ADAPT the core message of your past answer to fit the CURRENT Job/Company Context below.
    ${userKnowledge.map(k => `- Question: "${k.key}"\n  Answer: "${k.value}"`).join('\n\n')}
    `
        : '';

    return `
    You are ${userName}. You are filling out a job application.
    
    Current Job/Company Context:
    "${pageContext || 'No specific context provided. Assume a general tech company.'}"

    Your Resume:
    "${resumeText}"

    ${knowledgeContext}

    Question: "${question}"

    Task: Write a professional, concise, and tailored answer to the question based on your resume, your past answers (User Memory), and the CURRENT job context.
    
    **Rules:**
    1. If you use a past answer, **REWRITE IT** to match the *Current Job/Company Context*. 
    2. **NEVER** mention a different company name from your past answers. If the memory says "I love Google" but the current job is "Microsoft", you must write "I love Microsoft" (or the equivalent reason).
    3. If the question asks for a specific preference (e.g. Visa sponsorship, location) and you have a past answer for it, prioritize that preference but ensure the phrasing is fresh.
    4. Keep it short and crisp. Start directly with the answer.
    5. If the question asks for a "message", "note", or "cover letter" for the employer, write a professional, 2-3 sentence introduction expressing enthusiasm for the role and company. Do NOT output random keywords.
    `;
}
