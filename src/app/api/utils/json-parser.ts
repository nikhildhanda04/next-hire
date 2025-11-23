// JSON parsing utilities

export function extractJsonFromResponse(responseText: string): Record<string, unknown> {
    // Try to find JSON in markdown code blocks (using [\s\S] instead of 's' flag for compatibility)
    const jsonBlockMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
        try {
            return JSON.parse(jsonBlockMatch[1]) as Record<string, unknown>;
        } catch {
            // Continue to other methods
        }
    }

    // Try to find JSON object directly
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

