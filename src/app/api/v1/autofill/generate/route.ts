import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getGeminiService } from '@/app/api/services/gemini-service';
import { buildSmartAutofillPrompt } from '@/app/api/utils/prompt-builders';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

const generateSchema = z.object({
    question: z.string().min(1, 'Question is required').max(1000, 'Question too long'),
    context: z.string().optional().default(''),
});

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate Limiting: 10 requests per minute per user
        const limiter = rateLimit(session.user.id, { limit: 10, windowMs: 60 * 1000 });
        if (!limiter.success) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((limiter.reset - Date.now()) / 1000)) } }
            );
        }

        const body = await request.json();

        // Input Validation
        const validation = generateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const { question, context } = validation.data;

        // Fetch latest user data (resume + knowledge)
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                resumeText: true,
                name: true,
                knowledge: {
                    orderBy: { createdAt: 'desc' },
                    take: 20 // Take the last 20 answers to avoid token limit, or maybe filter?
                    // Ideally we'd do vector search here, but for now exact/recent memory is a good start.
                }
            }
        });

        if (!user || !user.resumeText) {
            return NextResponse.json({ error: 'Resume not found. Please upload a resume first.' }, { status: 404 });
        }

        const geminiService = getGeminiService();
        const prompt = buildSmartAutofillPrompt(
            question,
            user.resumeText,
            user.name || 'Candidate',
            context,
            user.knowledge
        );

        const streamResult = await geminiService.generateContentStream(prompt);

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

        // Handle Google API Rate Limiting (429)
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStatus = (error as { status?: number })?.status;

        if (
            errorMessage.includes('429') ||
            errorStatus === 429 ||
            JSON.stringify(error).includes('Too Many Requests')
        ) {
            return NextResponse.json(
                { error: 'Daily AI usage limit reached (Free Tier). Please try again tomorrow or upgrade your plan.' },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
