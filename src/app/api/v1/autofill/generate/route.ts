import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getGeminiService } from '@/app/api/services/gemini-service';
import { OpenAIService } from '@/app/api/services/openai-service';
import { buildSmartAutofillPrompt } from '@/app/api/utils/prompt-builders';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { KeyDetector } from '@/app/api/utils/key-detector';

const generateSchema = z.object({
    question: z.string().min(1, 'Question is required').max(1000, 'Question too long'),
    context: z.string().optional().default(''),
});


interface StreamChunk {
    text: () => string;
}

export async function POST(request: NextRequest) {
    let selectedService: 'OPENAI' | 'GEMINI' | 'DEFAULT' = 'DEFAULT';
    let apiKeyToUse: string | null = null;
    let streamResult: { stream: AsyncIterable<StreamChunk> } | undefined;
    try {
        const reqHeaders = await headers();
        const session = await auth.api.getSession({
            headers: reqHeaders
        });

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user first to check for stored API keys
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

        /* BYOK LOGIC RESTORED */
        const headerGeminiKey = reqHeaders.get('x-gemini-api-key');
        const headerOpenAIKey = reqHeaders.get('x-openai-api-key');

        console.log('DEBUG: Received Headers - Gemini:', headerGeminiKey ? 'Yes' : 'No', 'OpenAI:', headerOpenAIKey ? 'Yes' : 'No');

        const hasCustomKey = headerGeminiKey || headerOpenAIKey || user.geminiApiKey || user.openaiApiKey;
        

        // Only rate limit if using the free tier (no custom key)
        if (!hasCustomKey) {
            console.log('DEBUG: No custom key found. Applying rate limit.');
            const limiter = await rateLimit(session.user.id, { limit: 20, windowMs: 60 * 1000 });
            if (!limiter.success) {
                return NextResponse.json(
                    { error: 'Too many requests. Please try again later.' },
                    { status: 429, headers: { 'Retry-After': String(Math.ceil((limiter.reset - Date.now()) / 1000)) } }
                );
            }
        }

        const body = await request.json();

        const validation = generateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const { question, context } = validation.data;
        
        // Smart Key Detection & Precedence Logic
        // 1. Headers take absolute precedence over stored keys (Extension effectively sends only one active key)
        // 2. Validate key format using KeyDetector to prevent using invalid keys
        
        /* BYOK LOGIC RESTORED */
        if (headerOpenAIKey && KeyDetector.isOpenAI(headerOpenAIKey)) {
             selectedService = 'OPENAI';
             apiKeyToUse = headerOpenAIKey;
        } else if (headerGeminiKey && KeyDetector.isGemini(headerGeminiKey)) {
             selectedService = 'GEMINI';
             apiKeyToUse = headerGeminiKey;
        } else {
            // Fallback to stored keys if no headers provided (or headers were invalid)
            // Check stored OpenAI key
            if (user.openaiApiKey && KeyDetector.isOpenAI(user.openaiApiKey)) {
                selectedService = 'OPENAI';
                apiKeyToUse = user.openaiApiKey;
            } 
            // Check stored Gemini key (secondary fallback if OpenAI not found/valid)
            else if (user.geminiApiKey && KeyDetector.isGemini(user.geminiApiKey)) {
                selectedService = 'GEMINI';
                apiKeyToUse = user.geminiApiKey;
            }
        }
        
        console.log(`DEBUG: Selected Service: ${selectedService}, Key Present: ${!!apiKeyToUse}`);

        // Update DB with the valid provided key if it came from headers
        if (selectedService === 'OPENAI' && headerOpenAIKey) {
             await prisma.user.update({ where: { id: session.user.id }, data: { openaiApiKey: headerOpenAIKey } });
        } else if (selectedService === 'GEMINI' && headerGeminiKey) {
             await prisma.user.update({ where: { id: session.user.id }, data: { geminiApiKey: headerGeminiKey } });
        }
        

        if (selectedService === 'OPENAI' && apiKeyToUse) {
            try {
                const openAIService = new OpenAIService(apiKeyToUse);
                const prompt = buildSmartAutofillPrompt(
                    question,
                    user.resumeText,
                    user.name || 'Candidate',
                    context,
                    user.knowledge
                );
                streamResult = await openAIService.generateContentStream(prompt);
            } catch (error: unknown) {
                console.warn('DEBUG: OpenAI Service failed.', error);
                
                // Don't fallback if it's a key/quota issue or explicit client error, user should know their key failed
                const err = error as { status?: number; statusCode?: number };
                const status = err.status || err.statusCode;
                if (status === 401 || status === 403 || status === 404) {
                    throw error;
                }

                console.warn('DEBUG: Falling back to Default Gemini.');
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
        } else if (selectedService === 'GEMINI' && apiKeyToUse) {
            try {
                const geminiService = getGeminiService(apiKeyToUse); 
                const prompt = buildSmartAutofillPrompt(
                    question,
                    user.resumeText,
                    user.name || 'Candidate',
                    context,
                    user.knowledge
                );
                streamResult = await geminiService.generateContentStream(prompt);
            } catch (error: unknown) {
                console.warn('DEBUG: Custom Gemini Service failed.', error);

                // Don't fallback if it's a key/quota issue or explicit client error, user should know their key failed
                const err = error as { status?: number; statusCode?: number };
                const status = err.status || err.statusCode;
                if (status === 401 || status === 403 || status === 404) {
                    throw error;
                }

                console.warn('DEBUG: Falling back to Default Gemini.');
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
        } else {
        
            // Default / Free Tier (Gemini)
            console.log('DEBUG: Using Default Gemini Service (Free Tier)');
            const defaultGeminiService = getGeminiService();

            const prompt = buildSmartAutofillPrompt(
                question,
                user.resumeText,
                user.name || 'Candidate',
                context,
                user.knowledge
            );
            
            try {
                 console.log("DEBUG: Attempting Gemini Generation...");
                 streamResult = await defaultGeminiService.generateContentStream(prompt);
            } catch (geminiError) {
                console.error("DEBUG: Gemini Service Failed completely. Checking for OpenAI Fallback...", geminiError);
                
                // Fallback to OpenAI if key exists
                const openAIKey = process.env.OPENAI_API_KEY;
                if (openAIKey) {
                    console.log("DEBUG: Switching to OpenAI Service (Last Resort)");
                    try {
                        const openAIService = new OpenAIService(openAIKey);
                        streamResult = await openAIService.generateContentStream(prompt);
                    } catch (openaiError) {
                         console.error("DEBUG: OpenAI also failed. EXHAUSTED.", openaiError);
                         // Final Exhaustion Error
                         throw new Error("i am broke my ai keys limits are reached add your own key to keep using the ai");
                    }
                } else {
                    console.warn("DEBUG: No OpenAI Key configured for fallback.");
                    // Final Exhaustion Error (No OpenAI key to try)
                     throw new Error("i am broke my ai keys limits are reached add your own key to keep using the ai");
                }
            }
        } 

        if (!streamResult) {
             throw new Error("Failed to initialize AI stream.");
        }

        const activeStreamResult = streamResult;

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of activeStreamResult.stream) {
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
        if (error instanceof Error) {
            console.error('Error Stack:', error.stack);
        }


        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStatus = (error as { status?: number })?.status;

        // Custom Exhaustion Message
        if (errorMessage.includes("i am broke my ai keys limits are reached")) {
              return NextResponse.json({ error: errorMessage }, { status: 429 });
        }

        // Handle various errors
        if (errorMessage.includes('429') || errorStatus === 429) {
            // const keyType = apiKeyToUse ? 'Custom' : 'Free Tier';
            return NextResponse.json({ error: `AI Rate Limit Exceeded (Free Tier Key). check quota.` }, { status: 429 });
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

