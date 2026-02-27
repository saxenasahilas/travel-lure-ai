import { AgentState } from "../state";
import { generateJSON } from "../../lib/llm";
import { SMART_TRAVEL_CITIES } from "../../data/constants"; // Adjust path as needed
import manifest from "../../data/file_manifest.json";

export async function matchmaker(state: AgentState): Promise<Partial<AgentState>> {
  const { userInput, context } = state;

  // Routing Logic
  const isTier1 = SMART_TRAVEL_CITIES.some(city =>
    userInput.location.toLowerCase().includes(city.toLowerCase())
  );

  const activeSource = isTier1 ? "smart_travel" : "lonely_planet";
  const activeUri = isTier1 ? manifest.smart_travel_uri : manifest.lonely_planet_uri;

  const citationInstruction = `Source Material: ${activeSource === "smart_travel" ? "Smart Travel Guide (Priority)" : "Lonely Planet India"}. Quote this source.`;

  const systemPrompt = `You are a Travel Matchmaker. Find 3 diverse destinations based on the user's vibe.
  - Source the "topProperties", "dailyBudget", and "iconicCafe" recommendations from what users on Reddit (e.g., r/travel, r/solotravel) generally recommend or upvote. Focus on community favorites.
  - ${citationInstruction}
  - Output strict JSON.
  - Schema:
    {
      "candidates": [
        { 
          "name": "string (Place Name)",
          "zone": "string (Region/Zone)",
          "funFact": "string (1 line hook)",
          "topProperties": [{ "name": "string (Hotel Name)", "type": "string (e.g. Luxury, Hostel, Boutique)" }],
          "dailyBudget": "string (approx cost per Reddit users)",
          "iconicCafe": "string (Must visit cafe mentioned on Reddit)",
           "flashcards": { "where": "string (Specific area tip)" }
        }
      ]
    }`;

  try {
    const parsed = await generateJSON<any>({
      systemPrompt,
      userPrompt: `Location: ${userInput.location}. Vibe: ${userInput.vibe}. Hub Context: ${userInput.viaHub || "None"}. Corridor Context: ${context.originContext || "None"}. Search Context: ${context.tavilyResults || "No search context"}`,
      model: "gemini-1.5-flash",
      fileUri: activeUri
    });

    return {
      intermediate: {
        candidates: parsed.candidates || []
      },
      activeUri,
      activeSource
    };
  } catch (e) {
    console.error("Matchmaker LLM Error", e);
    return { intermediate: { candidates: [] } };
  }
}
