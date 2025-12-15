
export function extractJsonFromResponse(responseText: string): Record<string, unknown> {

    const jsonBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
        try {
            return JSON.parse(jsonBlockMatch[1]) as Record<string, unknown>;
        } catch {
           
        }
    }

    const startIndex = responseText.indexOf('{');
    const endIndex = responseText.lastIndexOf('}') + 1;
    if (startIndex !== -1 && endIndex !== 0) {
        const jsonStr = responseText.substring(startIndex, endIndex);
        try {
            return JSON.parse(jsonStr) as Record<string, unknown>;
        } catch {
            throw new Error('No valid JSON object found in the AI response.');
        }
    }

    throw new Error('No valid JSON object found in the AI response.');
}

