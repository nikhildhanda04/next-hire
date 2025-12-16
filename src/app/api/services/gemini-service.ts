import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const FALLBACK_MODELS = [
    'gemini-2.0-flash-lite', // Primary (Fast & Cheap)
    'gemini-2.0-flash',      // Fallback 1 (Robust)
    'gemini-2.5-flash'       // Fallback 2 (Newer/Experimental)
];

class GeminiService {
    private static keyPool: string[] = [];
    private static isInitialized = false;

    private customKey?: string;

    constructor(apiKey?: string) {
        if (apiKey) {
            this.customKey = apiKey;
        } else if (!GeminiService.isInitialized) {
            GeminiService.initializeKeys();
        }
    }

    private static initializeKeys() {
        const keysEnv = process.env.GOOGLE_API_KEYS || '';
        const legacyKey = process.env.GOOGLE_API_KEY;

        const keys = [
            ...keysEnv.split(',').map(k => k.trim()).filter(k => k.length > 0),
            legacyKey
        ].filter(k => !!k);

        GeminiService.keyPool = [...new Set(keys as string[])];
        GeminiService.isInitialized = true;

        if (GeminiService.keyPool.length === 0) {
            console.error('No Gemini API keys found in GOOGLE_API_KEYS or GOOGLE_API_KEY!');
        } else {
             console.log(`Gemini Service Initialized with ${GeminiService.keyPool.length} keys.`);
        }
    }

    private async executeWithFallback<T>(
        operation: (model: GenerativeModel) => Promise<T>,
        operationName: string
    ): Promise<T> {
        const pool = this.customKey ? [this.customKey] : GeminiService.keyPool;

        if (pool.length === 0) {
            throw new Error('No API keys available for Gemini Service.');
        }

        let lastError: unknown = null;

        // Model Loop
        for (const modelName of FALLBACK_MODELS) {
            // Key Loop
            for (const apiKey of pool) {
                try {
                    const genAI = new GoogleGenerativeAI(apiKey);
                    const model = genAI.getGenerativeModel({ model: modelName });

                    if (process.env.NODE_ENV === 'development') {
                        // Log (masked) key usage
                        console.log(`[${operationName}] Trying Model: ${modelName} | Key: ...${apiKey.slice(-5)}`);
                    }

                    return await operation(model);

                } catch (error: unknown) {
                    const err = error as { status?: number; statusCode?: number; message?: string };
                    const status = err.status || err.statusCode;
                    
                     // Retry on Rate Limit (429), Service Unavailable (503), or Not Found (404 - Invalid Model)
                    if (status === 429 || status === 503 || status === 404 || (err.message && (err.message.includes('429') || err.message.includes('404')))) {
                        console.warn(`[${operationName}] Failed (Status ${status}) with Model: ${modelName} on Key: ...${apiKey.slice(-5)}. Retrying...`);
                        lastError = error;
                        continue; // Try next key/model
                    }

                    // For other errors (400, 401, etc.), throw immediately unless it's strictly a model overload
                     throw error;
                }
            }
        }

        if (pool.length === 0) {
             throw new Error('No API keys available for Gemini Service.');
        }

        // We throw the last error or a generic one
        if (lastError) throw lastError;
        throw new Error('All Gemini models and keys exhausted/rate-limited.');
    }

    async generateContent(prompt: string, options?: { responseMimeType?: string }): Promise<string> {
        return this.executeWithFallback(async (model) => {
            // Ignoring options.responseMimeType for simplicity as noted in previous comments
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            if (!text || text.trim().length === 0) throw new Error('Empty response');
            return text;
        }, 'generateContent');
    }

    async generateContentStream(prompt: string) {
        return this.executeWithFallback(async (model) => {
            return await model.generateContentStream(prompt);
        }, 'generateContentStream');
    }
}

export function getGeminiService(apiKey?: string): GeminiService {
    if (apiKey) {
        return new GeminiService(apiKey);
    }
    return new GeminiService();
}