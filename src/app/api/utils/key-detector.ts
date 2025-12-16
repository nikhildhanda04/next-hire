
export enum APIKeyType {
    OPENAI = 'OPENAI',
    GEMINI = 'GEMINI',
    UNKNOWN = 'UNKNOWN'
}

export class KeyDetector {
    static detect(key: string): APIKeyType {
        if (!key) return APIKeyType.UNKNOWN;
        
        const trimmedKey = key.trim();
        
        if (trimmedKey.startsWith('sk-')) {
            return APIKeyType.OPENAI;
        }
        
        if (trimmedKey.startsWith('AIza')) {
            return APIKeyType.GEMINI;
        } // Google API keys typically start with AIza
        
        return APIKeyType.UNKNOWN;
    }

    static isOpenAI(key: string): boolean {
        return KeyDetector.detect(key) === APIKeyType.OPENAI;
    }

    static isGemini(key: string): boolean {
        return KeyDetector.detect(key) === APIKeyType.GEMINI;
    }
}
