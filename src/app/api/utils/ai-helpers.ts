// AI helper functions for resume parsing and ATS analysis

import { getGeminiService } from '../services/gemini-service';
import { extractJsonFromResponse } from './json-parser';
import {
    buildResumeParsePrompt,
    buildImprovableBulletsPrompt,
    buildRefineBulletPrompt,
    buildATSAnalysisPrompt,
    getCareerLevelPersona,
} from './prompt-builders';
import { ResumeOutput, ATSAnalysisOutput, RewriteSuggestion } from '../types';

// Parse resume with AI
export async function parseResumeWithAI(resumeText: string): Promise<ResumeOutput> {
    const geminiService = getGeminiService();
    const prompt = buildResumeParsePrompt(resumeText);

    try {
        const responseText = await geminiService.generateContent(prompt, {
            responseMimeType: 'application/json',
        });

        // Try to parse as JSON directly first (in case responseMimeType worked)
        try {
            const directParse = JSON.parse(responseText);
            return directParse as ResumeOutput;
        } catch {
            // If direct parse fails, use the extractor
            return extractJsonFromResponse(responseText) as ResumeOutput;
        }
    } catch (error) {
        console.error('Error processing resume with AI model:', error);
        if (error instanceof Error) {
            console.error('Full error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
            });
        }
        throw new Error(`Error processing resume with AI model: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// Stage 1: Identify improvable bullets
async function identifyImprovableBullets(resumeText: string, context: string): Promise<string[]> {
    const geminiService = getGeminiService();
    const prompt = buildImprovableBulletsPrompt(resumeText, context);

    try {
        const responseText = await geminiService.generateContent(prompt, {
            responseMimeType: 'application/json',
        });
        const bullets = JSON.parse(responseText);
        return Array.isArray(bullets) ? bullets : [];
    } catch (error) {
        console.error('Error identifying improvable bullets:', error);
        return [];
    }
}

// Stage 2: Refine a single bullet point
async function refineBulletPoint(bullet: string, context: string): Promise<string> {
    const geminiService = getGeminiService();
    const prompt = buildRefineBulletPrompt(bullet, context);

    try {
        const responseText = await geminiService.generateContent(prompt);
        return responseText.trim();
    } catch (error) {
        console.error('Error refining bullet point:', error);
        return bullet;
    }
}

// Analyze ATS with AI
export async function analyzeATSWithAI(
    resumeText: string,
    jobDescription?: string | null,
    careerLevel?: string | null
): Promise<ATSAnalysisOutput> {
    if (!jobDescription && !careerLevel) {
        throw new Error('Either job_description or career_level must be provided.');
    }

    const geminiService = getGeminiService();

    let persona = '';
    let evaluationPhilosophy = '';
    let analysisContext = '';

    if (jobDescription) {
        persona = 'You are an expert, highly critical and discerning Senior Technical Recruiter and Career Strategist AI.';
        analysisContext = `Job Description:\n---\n${jobDescription}\n---`;
        evaluationPhilosophy = 'Score the resume based on direct alignment with the specific job description.';
    } else if (careerLevel) {
        analysisContext = `Target Career Level: ${careerLevel}`;
        const levelPersona = getCareerLevelPersona(careerLevel);
        persona = levelPersona.persona;
        evaluationPhilosophy = levelPersona.evaluationPhilosophy;
    }

    const mainPrompt = buildATSAnalysisPrompt(resumeText, persona, evaluationPhilosophy, analysisContext);

    try {
        const responseText = await geminiService.generateContent(mainPrompt, {
            responseMimeType: 'application/json',
        });
        const analysisData = extractJsonFromResponse(responseText) as unknown as ATSAnalysisOutput;

        // Run the two-stage pipeline with randomization
        const bulletPool = await identifyImprovableBullets(resumeText, analysisContext);

        // Determine how many bullets to select (up to 3)
        const numToSelect = Math.min(bulletPool.length, 3);

        // Randomly select bullets from the pool
        const selectedBullets: string[] = [];
        const shuffled = [...bulletPool].sort(() => 0.5 - Math.random());
        selectedBullets.push(...shuffled.slice(0, numToSelect));

        // Stage 2: Refine each randomly selected bullet
        const rewriteSuggestions: RewriteSuggestion[] = [];
        for (const bullet of selectedBullets) {
            if (bullet) {
                const improvedBullet = await refineBulletPoint(bullet, analysisContext);
                rewriteSuggestions.push({
                    original_bullet: bullet,
                    suggested_improvement: improvedBullet,
                });
            }
        }

        analysisData.rewrite_suggestions = rewriteSuggestions;
        return analysisData;
    } catch (error) {
        console.error('Error performing ATS analysis with AI model:', error);
        throw new Error('Error performing ATS analysis with AI model.');
    }
}
