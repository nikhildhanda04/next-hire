
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    try {
        // For listing models, we don't need a specific model instance
        // But the SDK exposes listModels via the client? 
        // Actually SDK doesn't have a direct 'listModels' on the main class in all versions, 
        // typically we use the API directly or a specific manager.
        // Let's try to just use a known stable model to test connectivity first, 
        // or use the model manager if available in this SDK version.

        // In @google/generative-ai, verified way to list models isn't always straightforward in simple scripts 
        // without reading docs for specific version. 
        // Instead, let's try a few standard ones.

        const modelsToTest = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-002",
            "gemini-1.5-pro",
            "gemini-pro"
        ];

        console.log("Testing models...");

        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log(`✅ Success: ${modelName}`);
            } catch (e) {
                console.log(`❌ Failed: ${modelName} - ${e.message.split('\n')[0]}`);
            }
        }

    } catch (error) {
        console.error("Fatal error:", error);
    }
}

listModels();
