
import OpenAI from 'openai';

export class OpenAIService {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({
            apiKey: apiKey,
        });
    }

    private async createStreamWithFallback(prompt: string) {
        const models = ['gpt-5.2', 'gpt-4o-mini', 'gpt-3.5-turbo'];

        for (const model of models) {
            try {
                return await this.openai.chat.completions.create({
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    stream: true,
                });
            } catch (error: unknown) {
                const isLast = model === models[models.length - 1];
                const err = error as { status?: number; code?: string };
                if (isLast || (err.status !== 404 && err.code !== 'model_not_found')) {
                    throw error;
                }
                console.warn(`OpenAI model ${model} failed, trying next fallback...`);
            }
        }
        throw new Error('All OpenAI models failed');
    }

    async generateContentStream(prompt: string) {
        const stream = await this.createStreamWithFallback(prompt);


        return {
            stream: (async function* () {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        yield {
                            text: () => content
                        };
                    }
                }
            })()
        };
    }
}
