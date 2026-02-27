import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";

// Define a common interface for our JSON-based agents
type LLMResponse<T> = T;

interface LLMRequest {
    systemPrompt: string;
    userPrompt: string;
    schema?: any; // Optional JSON schema for validation/structure
    model?: string;
    temperature?: number;
    fileUri?: string;
    fileMimeType?: string;
}

export async function generateJSON<T>(request: LLMRequest): Promise<T> {
    const { systemPrompt, userPrompt, model, temperature = 0.7, fileUri, fileMimeType } = request;

    console.log("LLM Debug: Checking Configuration...");
    console.log(" - Google Key Present:", !!process.env.GOOGLE_API_KEY);
    console.log(" - Groq Key Present:", !!process.env.GROQ_API_KEY);
    console.log(" - OpenRouter Key Present:", !!process.env.OPENROUTER_API_KEY);

    // PRIORITY 1: Respect the requested model if it's explicitly Gemini (Direct)
    if (model?.includes("gemini") && process.env.GOOGLE_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
            // Use the stable model name
            const targetModel = "gemini-1.5-flash-latest";
            const geminiModel = genAI.getGenerativeModel({
                model: targetModel,
                generationConfig: { responseMimeType: "application/json" }
            });


            const prompt = `${systemPrompt}\n\nUser Request: ${userPrompt}`;

            let content: any = [prompt];
            if (fileUri) {
                content = [
                    {
                        fileData: {
                            fileUri: fileUri,
                            mimeType: fileMimeType || (fileUri.endsWith('.md') ? 'text/markdown' : 'application/pdf')
                        }
                    },
                    { text: prompt }
                ];
            }

            const result = await geminiModel.generateContent(content);
            const text = result.response.text();
            return JSON.parse(text) as T;
        } catch (error) {
            console.error("Gemini Direct Error:", error);
        }
    }

    // PRIORITY 2: Groq (Secondary - Fast & Reliable for small context)
    if (process.env.GROQ_API_KEY && userPrompt.length < 50000) {
        try {
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const response = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                model: "llama-3.3-70b-versatile",
                temperature,
                response_format: { type: "json_object" }
            });
            return JSON.parse(response.choices[0]?.message?.content || "{}") as T;
        } catch (error) {
            console.error("Groq Error:", error);
        }
    }

    // PRIORITY 3: OpenRouter (Robust fallback for large context)
    if (process.env.OPENROUTER_API_KEY) {
        try {
            const modelsToTry = [
                "google/gemini-flash-1.5",
                "openai/gpt-4o-mini",
                "meta-llama/llama-3.1-70b-instruct"
            ];

            for (const orModel of modelsToTry) {
                console.log(`LLM: Trying OpenRouter model: ${orModel}...`);
                const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://travellure.ai", // Required by some models
                        "X-Title": "TravelLure AI"
                    },
                    body: JSON.stringify({
                        model: orModel,
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: userPrompt }
                        ],
                        response_format: { type: "json_object" },
                        max_tokens: 1000
                    })
                });

                const data = await res.json();
                if (res.ok) {
                    console.log(`LLM: OpenRouter SUCCESS with ${orModel}`);
                    return JSON.parse(data.choices[0]?.message?.content || "{}") as T;
                }
                console.warn(`OpenRouter API error (${orModel}):`, JSON.stringify(data));
            }
        } catch (error) {
            console.error("OpenRouter Block Error:", error);
        }
    }

    // PRIORITY 4: Gemini Fallback (Direct)
    if (process.env.GOOGLE_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
            // Try 1.5 first, then legacy 1.0 pro
            const fbModels = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-pro"];

            for (const fbModel of fbModels) {
                try {
                    const geminiModel = genAI.getGenerativeModel({
                        model: fbModel,
                        generationConfig: { responseMimeType: fbModel.includes("1.5") ? "application/json" : undefined }
                    });
                    const prompt = `${systemPrompt}\n\nUser Request: ${userPrompt}`;
                    const result = await geminiModel.generateContent(prompt);
                    const text = result.response.text();
                    return JSON.parse(text) as T;
                } catch (e) {
                    console.warn(`Gemini FB Error (${fbModel}):`, e);
                }
            }
        } catch (error) {
            console.error("Gemini Fallback Block Error:", error);
        }
    }

    throw new Error("No available LLM provider configured (Gemini, Groq, or OpenRouter).");
}
