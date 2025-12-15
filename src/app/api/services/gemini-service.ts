
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

class GeminiService {
    private genAI: GoogleGenerativeAI;
    private baseModel: GenerativeModel;

    constructor(apiKey?: string) {
        const key = apiKey || process.env.GOOGLE_API_KEY;
        if (!key) {
            const errorMessage = 'GOOGLE_API_KEY environment variable is missing and no key provided!';
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        this.genAI = new GoogleGenerativeAI(key);

        const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
        this.baseModel = this.genAI.getGenerativeModel({ model: modelName });

        if (process.env.NODE_ENV === 'development') {
            console.log(`Using Gemini model: ${modelName}`);
        }
    }

    private async generateWithRetry<T>(
        operation: (model: GenerativeModel) => Promise<T>,
        operationName: string
    ): Promise<T> {
        try {
            return await operation(this.baseModel);
        } catch (error: any) {
            if (error.status === 429 || error.status === 503) {
                console.warn(`${operationName} failed with ${error.status}. Retrying...`);
               
                return await operation(this.baseModel);
            }
            throw error;
        }
    }

    async generateContent(prompt: string, options?: { responseMimeType?: string }): Promise<string> {
        return this.generateWithRetry(async (model) => {
            let result;
            if (options?.responseMimeType === 'application/json') {
                const jsonModel = this.genAI.getGenerativeModel({
                    model: model.model,
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
        return this.generateWithRetry(async (model) => {
            return await model.generateContentStream(prompt);
        }, 'generateContentStream');
    }
}

let geminiServiceInstance: GeminiService | null = null;
let initializationError: Error | null = null;

export function getGeminiService(apiKey?: string): GeminiService {
 
    if (apiKey) {
        return new GeminiService(apiKey);
    }

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