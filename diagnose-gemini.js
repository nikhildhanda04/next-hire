
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function diagnose() {
    const key = process.env.GOOGLE_API_KEY;
    if (!key) {
        console.error("❌ GOOGLE_API_KEY is missing from .env");
        return;
    }

    console.log(`🔑 Using API Key starting with: ${key.substring(0, 8)}...`);
    console.log(`ℹ️  Key length: ${key.length}`);

    const genAI = new GoogleGenerativeAI(key);

    // Test Models
    const modelsToTest = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro",
        "gemini-pro",
        "models/gemini-1.5-flash"
    ];

    console.log("\n📡 Testing Model Connectivity...");

    for (const modelName of modelsToTest) {
        process.stdout.write(`Testing ${modelName.padEnd(25)} ... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test");
            const response = await result.response;
            console.log(`✅ OK (Response: ${response.text().substring(0, 10)}...)`);
        } catch (error) {
            let msg = error.message;
            if (msg.includes('404')) msg = '404 Not Found';
            if (msg.includes('429')) msg = '429 Quota Exceeded';
            console.log(`❌ FAILED: ${msg}`);
        }
    }
}

diagnose();
