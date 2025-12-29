import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getGeminiService } from '@/app/api/services/gemini-service';
import { OpenAIService } from '@/app/api/services/openai-service';
import { buildBatchAutofillPrompt } from '@/app/api/utils/prompt-builders';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { KeyDetector } from '@/app/api/utils/key-detector';

const batchSchema = z.object({
    questions: z.array(z.object({
        id: z.string(),
        question: z.string()
    })).min(1),
    context: z.string().optional().default(''),
});

export async function POST(request: NextRequest) {
    let selectedService: 'OPENAI' | 'GEMINI' | 'DEFAULT' = 'DEFAULT';
    let apiKeyToUse: string | null = null;

    try {
        const reqHeaders = await headers();
        const session = await auth.api.getSession({
            headers: reqHeaders
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                knowledge: true
            }
        });

        if (!user || !user.resumeText) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        const headerGeminiKey = reqHeaders.get('x-gemini-api-key');
        const headerOpenAIKey = reqHeaders.get('x-openai-api-key');

        const hasCustomKey = headerGeminiKey || headerOpenAIKey || user.geminiApiKey || user.openaiApiKey;
        
        // Rate limit free tier
        if (!hasCustomKey) {
            const limiter = await rateLimit(session.user.id, { limit: 10, windowMs: 60 * 1000 });
            if (!limiter.success) {
                return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
            }
        }

        const body = await request.json();
        const validation = batchSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const { questions, context } = validation.data;

        // Key Precedence
        if (headerOpenAIKey && KeyDetector.isOpenAI(headerOpenAIKey)) {
            selectedService = 'OPENAI';
            apiKeyToUse = headerOpenAIKey;
        } else if (headerGeminiKey && KeyDetector.isGemini(headerGeminiKey)) {
            selectedService = 'GEMINI';
            apiKeyToUse = headerGeminiKey;
        } else if (user.openaiApiKey && KeyDetector.isOpenAI(user.openaiApiKey)) {
            selectedService = 'OPENAI';
            apiKeyToUse = user.openaiApiKey;
        } else if (user.geminiApiKey && KeyDetector.isGemini(user.geminiApiKey)) {
            selectedService = 'GEMINI';
            apiKeyToUse = user.geminiApiKey;
        }

        const prompt = buildBatchAutofillPrompt(
            questions,
            user.resumeText,
            user.name || 'Candidate',
            context,
            user.knowledge
        );

        let resultText = '';

        if (selectedService === 'OPENAI' && apiKeyToUse) {
            const openAIService = new OpenAIService(apiKeyToUse);
            resultText = await openAIService.generateContent(prompt);
        } else if (selectedService === 'GEMINI' && apiKeyToUse) {
            const geminiService = getGeminiService(apiKeyToUse);
            resultText = await geminiService.generateContent(prompt);
        } else {
            const defaultGeminiService = getGeminiService();
            try {
                resultText = await defaultGeminiService.generateContent(prompt);
            } catch (e) {
                // Fallback to internal OpenAI if configured
                const internalOpenAIKey = process.env.OPENAI_API_KEY;
                if (internalOpenAIKey) {
                    const openAIService = new OpenAIService(internalOpenAIKey);
                    resultText = await openAIService.generateContent(prompt);
                } else {
                    throw e;
                }
            }
        }

        // Clean JSON from potential markdown wrappers
        const jsonContent = resultText.replace(/```json\n?|\n?```/g, '').trim();
        const answers = JSON.parse(jsonContent);

        return NextResponse.json({ success: true, answers });

    } catch (error: unknown) {
        console.error('Batch generation error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes('limit') || errorMessage.includes('quota') || errorMessage.includes('broke')) {
            return NextResponse.json({ 
                error: "i am broke my ai keys limits are reached add your own key to keep using the ai" 
            }, { status: 429 });
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
