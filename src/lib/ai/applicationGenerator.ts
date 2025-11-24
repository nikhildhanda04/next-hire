import { getGeminiService } from '@/app/api/services/gemini-service';

export async function generateApplicationResponse(
    resumeText: string,
    jobDescription: string,
    promptType: 'cover_letter' | 'custom_question' = 'cover_letter',
    customPrompt?: string
): Promise<string> {
    const geminiService = getGeminiService();

    let prompt = '';

    if (promptType === 'cover_letter') {
        prompt = `
        You are an expert career coach and professional writer.
        
        Here is my resume:
        ${resumeText}
        
        Here is the job description:
        ${jobDescription}
        
        Please write a compelling, professional, and personalized cover letter for this position.
        Highlight my relevant skills and experiences that match the job requirements.
        Keep it concise (under 300 words) and enthusiastic.
        Do not include placeholders like "[Your Name]" or "[Date]" if you can infer them or just leave them out for me to fill.
        Focus on the content.
        `;
    } else {
        prompt = `
        You are an expert career coach.
        
        Here is my resume:
        ${resumeText}
        
        Here is the job description:
        ${jobDescription}
        
        Please answer the following question or prompt specifically for this job application:
        "${customPrompt}"
        
        Keep the answer relevant, concise, and professional.
        `;
    }

    try {
        const text = await geminiService.generateContent(prompt);
        return text;
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw error; // Re-throw to let the caller handle it or see the real error
    }
}
