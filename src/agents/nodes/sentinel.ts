import { AgentState } from "../state";
import { generateJSON } from "../../lib/llm";
import { Groq } from "groq-sdk"; // Keep unused import if strictly needed, or remove. Removing to be clean.

async function getLiveTemp(placeName: string): Promise<string> {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey || !placeName) return '—';
    try {
        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(placeName)},India&limit=1&appid=${apiKey}`);
        const [geo] = await geoRes.json();
        if (!geo) return '—';
        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${geo.lat}&lon=${geo.lon}&units=metric&appid=${apiKey}`);
        const weather = await weatherRes.json();
        return weather?.main?.temp != null ? `${Math.round(weather.main.temp)}°C` : '—';
    } catch { return '+'; }
}

export async function sentinel(state: AgentState): Promise<Partial<AgentState>> {
    const { intermediate, context, activeSource } = state;
    const candidates = intermediate.candidates || [];

    if (candidates.length === 0) return {};

    const citationInstruction = activeSource
        ? `Source Material: ${activeSource === "smart_travel" ? "Smart Travel Guide (Priority)" : "Lonely Planet India"}. Quote this source.`
        : "";

    // 1. Get Safety/Timing Advice via LLM
    const systemPrompt = `You are a Sentinel (Safety/Weather Expert). For each candidate, provide timing/safety advice ("When").
  - ${citationInstruction}
  - Output strict JSON.
  - Schema:
    {
      "sentinel": [
        { 
          "placeName": "string",
          "flashcards": { "when": "string (Best time + Safety tip)" }
        }
      ]
    }`;

    try {
        const parsed = await generateJSON<any>({
            systemPrompt,
            userPrompt: `Candidates: ${JSON.stringify(candidates.map(c => c.name))}. Context: ${context.tavilyResults || "No context"}`,
            fileUri: state.activeUri
        });

        const sentinelData = parsed.sentinel || [];

        // 2. Get Live Weather & Merge
        const enriched = await Promise.all(candidates.map(async (c) => {
            const s = sentinelData.find((d: any) => d.placeName === c.name) || {};
            const liveTemp = await getLiveTemp(c.name!);

            return {
                ...c,
                liveTemp,
                flashcards: {
                    ...c.flashcards,
                    when: s.flashcards?.when || "Check seasonal info."
                }
            };
        }));

        return { intermediate: { candidates: enriched } };
    } catch (e) {
        console.error("Sentinel LLM Error", e);
        return {};
    }
}
