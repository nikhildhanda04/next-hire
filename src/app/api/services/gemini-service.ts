// Gemini AI Service
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

class GeminiService {
    private genAI: GoogleGenerativeAI;
    private baseModel: GenerativeModel;
    private fallbackModel: GenerativeModel;

    constructor() {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            const errorMessage = 'GOOGLE_API_KEY environment variable is missing! Please ensure GOOGLE_API_KEY is set in your environment variables.';
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
        if (apiKey.length < 20) {
            console.warn('GOOGLE_API_KEY seems too short. Please verify it\'s correct.');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);

        // Primary: gemini-2.5-flash (Standard Flash model from your list)
        // Liter versions often have lower quotas. Standard Flash usually has higher throughput.
        const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        this.baseModel = this.genAI.getGenerativeModel({ model: modelName });

        // Fallback: gemini-2.0-flash-001 (Explicit version, fallback)
        this.fallbackModel = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

        if (process.env.NODE_ENV === 'development') {
            console.log(`Using Gemini model: ${modelName} (Fallback: gemini-2.0-flash-001)`);
        }
    }

    private async generateWithFallback<T>(
        operation: (model: GenerativeModel) => Promise<T>,
        operationName: string
    ): Promise<T> {
        try {
            return await operation(this.baseModel);
        } catch (error: any) {
            // Check for Rate Limit (429) or Overloaded (503)
            if (error.status === 429 || error.status === 503 || error.message?.includes('429')) {
                console.warn(`${operationName} failed with ${error.status}. Switching to fallback model...`);
                try {
                    return await operation(this.fallbackModel);
                } catch (fallbackError) {
                    console.error(`${operationName} fallback also failed.`);
                    throw fallbackError; // Throw the original or new error? Usually new.
                }
            }
            throw error;
        }
    }

    async generateContent(prompt: string, options?: { responseMimeType?: string }): Promise<string> {
        return this.generateWithFallback(async (model) => {
            let result;
            if (options?.responseMimeType === 'application/json') {
                const jsonModel = this.genAI.getGenerativeModel({
                    model: model.model, // Use current model name
                    generationConfig: { responseMimeType: 'application/json' },
                });
                result = await jsonModel.generateContent(prompt);
            } else {
                result = await model.generateContent(prompt);
            }
            const response = await result.response;
            const text = response.text();
            if (!text || text.trim().length === 0) throw new Error('Empty response');
            return text;
        }, 'generateContent');
    }

    async generateContentStream(prompt: string) {
        return this.generateWithFallback(async (model) => {
            return await model.generateContentStream(prompt);
        }, 'generateContentStream');
    }
}

// Singleton instance
let geminiServiceInstance: GeminiService | null = null;
let initializationError: Error | null = null;

export function getGeminiService(): GeminiService {
    if (initializationError) {
        throw initializationError;
    }

    if (!geminiServiceInstance) {
        try {
            geminiServiceInstance = new GeminiService();
        } catch (error) {
            initializationError = error instanceof Error ? error : new Error(String(error));
            throw initializationError;
        }
    }
    return geminiServiceInstance;
}

