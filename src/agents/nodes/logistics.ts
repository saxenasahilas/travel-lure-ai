import { AgentState } from "../state";
import { generateJSON } from "../../lib/llm";

export async function logistics(state: AgentState): Promise<Partial<AgentState>> {
  const { intermediate, context, activeSource } = state;
  const candidates = intermediate.candidates || [];

  if (candidates.length === 0) return {};

  const citationInstruction = activeSource
    ? `Source Material: ${activeSource === "smart_travel" ? "Smart Travel Guide (Priority)" : "Lonely Planet India"}. Quote this source.`
    : "";

  const systemPrompt = `You are a Logistics Expert. For each candidate, provide travel details ("How").
  - ${citationInstruction}
  - Output strict JSON.
  - Schema:
    {
      "logistics": [
        { 
          "placeName": "string (Match candidate name)",
          "distanceKm": "number/string",
          "majorExpenses": { "stay": "string", "food": "string", "travel": "string" },
          "flashcards": { "how": "string (Transport tip)" }
        }
      ]
    }`;

  try {
    const parsed = await generateJSON<any>({
      systemPrompt,
      userPrompt: `Candidates: ${JSON.stringify(candidates.map(c => c.name))}. Context: ${context.tavilyResults || "No context"}`,
      fileUri: state.activeUri
    });

    const logisticsData = parsed.logistics || [];

    // Merge logistics data back into candidates
    const enriched = candidates.map(c => {
      const l = logisticsData.find((d: any) => d.placeName === c.name) || {};
      return {
        ...c,
        distanceKm: l.distanceKm || "—",
        majorExpenses: l.majorExpenses || { stay: "—", food: "—", travel: "—" },
        flashcards: {
          where: c.flashcards?.where || "Explore the area.",
          when: c.flashcards?.when || "Check the season.",
          how: l.flashcards?.how || "Check local transport."
        }
      };
    });

    return { intermediate: { candidates: enriched } };
  } catch (e) {
    console.error("Logistics LLM Error", e);
    return {};
  }
}
