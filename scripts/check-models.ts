
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("GOOGLE_API_KEY not found in environment");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Just to access the client, though listModels is on the class usually? 
        // Actually listModels is not directly exposed on the instance easily in some versions, 
        // but let's check the current SDK docs or just try accessing it if possible.
        // Wait, SDK 0.2.1 might be old? Current is much higher. 
        // Let's actually use the generic fetch request if the method isn't obvious, or check standard method.
        // v0.2.1 is very old. Recent is ~0.17.0+.
        // Wait, package.json says "^0.24.1". That is very recent.
        // In recent SDK: 
        // genAI.getModel is not the way.
        // There isn't a direct listModels helper in the high-level SDK sometimes.
        // Let's try a simple fetch to the API endpoint which is foolproof.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach((m: any) => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }

    } catch (e) {
        console.error("Error listing models:", e);
    }
}

listModels();
