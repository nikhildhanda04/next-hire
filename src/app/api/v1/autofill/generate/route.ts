import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getGeminiService } from '@/app/api/services/gemini-service';
import { OpenAIService } from '@/app/api/services/openai-service';
import { buildSmartAutofillPrompt } from '@/app/api/utils/prompt-builders';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

const generateSchema = z.object({
    question: z.string().min(1, 'Question is required').max(1000, 'Question too long'),
    context: z.string().optional().default(''),
});

export async function POST(request: NextRequest) {
    try {
        const reqHeaders = await headers();
        const session = await auth.api.getSession({
            headers: reqHeaders
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const limiter = await rateLimit(session.user.id, { limit: 20, windowMs: 60 * 1000 });
        if (!limiter.success) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((limiter.reset - Date.now()) / 1000)) } }
            );
        }

        const body = await request.json();

        const validation = generateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const { question, context } = validation.data;

        const headerGeminiKey = reqHeaders.get('x-gemini-api-key');
        const headerOpenAIKey = reqHeaders.get('x-openai-api-key');

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                knowledge: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
            }
        });

        if (!user || !user.resumeText) {
            return NextResponse.json({ error: 'Resume not found. Please upload a resume first.' }, { status: 404 });
        }

        if (headerGeminiKey || headerOpenAIKey) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    ...(headerGeminiKey && { geminiApiKey: headerGeminiKey }),
                    ...(headerOpenAIKey && { openaiApiKey: headerOpenAIKey }),
                }
            });
        }

        const activeGeminiKey = headerGeminiKey || user.geminiApiKey;
        const activeOpenAIKey = headerOpenAIKey || user.openaiApiKey;

        let streamResult;

        if (activeOpenAIKey) {
            const openAIService = new OpenAIService(activeOpenAIKey);
            const prompt = buildSmartAutofillPrompt(
                question,
                user.resumeText,
                user.name || 'Candidate',
                context,
                user.knowledge
            );
            streamResult = await openAIService.generateContentStream(prompt);
        } else if (activeGeminiKey) {
            const geminiService = getGeminiService(activeGeminiKey);
            const prompt = buildSmartAutofillPrompt(
                question,
                user.resumeText,
                user.name || 'Candidate',
                context,
                user.knowledge
            );
            streamResult = await geminiService.generateContentStream(prompt);
        } else {
            const defaultGeminiService = getGeminiService();

            const prompt = buildSmartAutofillPrompt(
                question,
                user.resumeText,
                user.name || 'Candidate',
                context,
                user.knowledge
            );
            streamResult = await defaultGeminiService.generateContentStream(prompt);
        }

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of streamResult.stream) {
                        const chunkText = chunk.text();
                        controller.enqueue(encoder.encode(chunkText));
                    }
                    controller.close();
                } catch (e) {
                    console.error('Stream error', e);
                    controller.error(e);
                }
            },
        });

        return new NextResponse(readable, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });

    } catch (error: unknown) {
        console.error('Error generating autofill answer:', error);

        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStatus = (error as { status?: number })?.status;

        // Handle various errors
        if (errorMessage.includes('429') || errorStatus === 429) {
            return NextResponse.json({ error: 'AI Rate Limit Exceeded. Check your API key quota.' }, { status: 429 });
        }
        if (errorMessage.includes('401') || errorMessage.includes('invalid api key')) {
            return NextResponse.json({ error: 'Invalid API Key. Please check your settings.' }, { status: 401 });
        }

        return NextResponse.json(
            { error: 'Internal Server Error: ' + errorMessage },
            { status: 500 }
        );
    }
}
