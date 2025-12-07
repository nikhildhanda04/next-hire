// Gemini AI Service
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

class GeminiService {
    private genAI: GoogleGenerativeAI;
    private baseModel: GenerativeModel;

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

        // Use gemini-2.0-flash model (can be overridden with GEMINI_MODEL env var)
        const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        this.baseModel = this.genAI.getGenerativeModel({ model: modelName });

        // Only log in development to avoid cluttering production logs
        if (process.env.NODE_ENV === 'development') {
            console.log(`Using Gemini model: ${modelName}`);
        }
    }

    async generateContent(prompt: string, options?: { responseMimeType?: string }): Promise<string> {
        try {
            let result;

            // Try with responseMimeType if specified
            if (options?.responseMimeType === 'application/json') {
                try {
                    // Attempt to use responseMimeType in generationConfig
                    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
                    const jsonModel = this.genAI.getGenerativeModel({
                        model: modelName,
                        generationConfig: {
                            responseMimeType: 'application/json',
                        },
                    });
                    result = await jsonModel.generateContent(prompt);
                } catch (configError) {
                    // If responseMimeType fails, fall back to regular generation
                    console.warn('responseMimeType not supported, using regular generation:', configError);
                    result = await this.baseModel.generateContent(prompt);
                }
            } else {
                // Regular text response
                result = await this.baseModel.generateContent(prompt);
            }

            const response = await result.response;
            const text = response.text();

            if (!text || text.trim().length === 0) {
                throw new Error('Empty response from Gemini API');
            }

            return text;
        } catch (error) {
            console.error('Gemini API Error:', error);
            // Log more details about the error
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            throw error;
        }
    }

    async generateContentStream(prompt: string) {
        try {
            return await this.baseModel.generateContentStream(prompt);
        } catch (error) {
            console.error('Gemini Stream API Error:', error);
            throw error;
        }
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

