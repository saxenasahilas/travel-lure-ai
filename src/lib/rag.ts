import fs from 'fs';
import path from 'path';
import { generateJSON } from './llm';
import { CategorizedDestinations, CategorizedDestinationsSchema } from '@/agents/state';

/**
 * Extracts raw text from the context Markdown file
 */
async function getRawContextText(): Promise<string> {
    const filePath = path.join(process.cwd(), 'data', 'origin_context.md');
    if (!fs.existsSync(filePath)) {
        console.warn(`RAG: ${filePath} not found.`);
        return "";
    }
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        console.error("Markdown Read Error:", error);
        return "";
    }
}

/**
 * Helper to get a window of text around a hub mention
 */
function getHubWindow(text: string, hub: string, windowSize: number = 25000): string {
    const index = text.toLowerCase().indexOf(hub.toLowerCase());
    console.log(`RAG Debug: Searching for hub "${hub}" in text (length: ${text.length}). Found at: ${index}`);

    if (index === -1) {
        const firstPart = hub.split(' ')[0];
        const firstPartIndex = text.toLowerCase().indexOf(firstPart.toLowerCase());
        console.log(`RAG Debug: Searching for fallback "${firstPart}". Found at: ${firstPartIndex}`);

        if (firstPartIndex === -1) return text.substring(0, windowSize);

        const start = Math.max(0, firstPartIndex - 2000);
        return text.substring(start, start + windowSize);
    }

    const start = Math.max(0, index - 2000);
    return text.substring(start, start + windowSize);
}

/**
 * Uses LLM to extract qualitative corridor context for a hub
 */
export async function getOriginContext(hub: string): Promise<string> {
    const rawText = await getRawContextText();
    if (!rawText) return `Information about travel corridors starting from ${hub}.`;

    const contextWindow = getHubWindow(rawText, hub);

    try {
        const result = await generateJSON<{ context: string }>({
            systemPrompt: `You are a Travel Data Analyst. Analyze the provided Markdown travel context and extract specific qualitative information about the travel corridor, workforce dynamics, and typical tourist behaviors for people starting their journey from "${hub}". 
            If the specific hub is not found, provide general regional context.
            Output JSON: { "context": "string" }`,
            userPrompt: `Hub: ${hub}\n\nContext Window (Markdown): ${contextWindow}`,
            model: "gemini-1.5-flash-latest"
        });
        return result.context;
    } catch (error) {
        console.error("LLM Context Extraction Error:", error);
        return "";
    }
}

/**
 * Uses LLM to extract hierarchical suggested places for a hub
 */
export async function getHubPlaces(hub: string): Promise<CategorizedDestinations | null> {
    console.log(`RAG: Extracting highly-granular places for hub: ${hub} from Markdown`);
    const rawText = await getRawContextText();
    if (!rawText) return null;

    const contextWindow = getHubWindow(rawText, hub, 12000);

    try {
        const result = await generateJSON<CategorizedDestinations>({
            systemPrompt: `You are a JSON extraction engine specializing in high-conversion travel triggers. 
            I will provide you with a Markdown document detailing travel corridors for a specific hub.
            
            Task:
            Extract travel destinations for the hub "${hub}" and classify them into "weekend_getaways" and "remote_workations".
            
            Strict Data Extraction Rules:
            1. Scrape "Qualitative Deep Dive" sections: For each destination, search the subsequent text (especially paragraphs labeled "Qualitative Deep Dive") for hyper-specific triggers like "acoustic live music", "artisan coffee", "stargazing", "meditation", "organic farm-to-table", etc. Append these micro-vibes to the "vibe_tags" array.
            2. Infer "requires_leave_days" (Boolean): 
               - Set to FALSE if the transit is "Overnight Sleeper Bus", "Ro-Ro Ferry", "Direct Flight under 1.5h", or "Drive under 4 hours".
               - Set to TRUE if the transit is a long drive (7+ hours), complex multi-modal transfers, or international.
            3. For "weekend_getaways", look for subsections starting with "Weekend Getaways" near the ${hub} section.
            4. For "remote_workations", look for subsections starting with "Long Remote-Work Destinations" near the ${hub} section.
            
            JSON Schema Requirement:
            You MUST output ONLY valid JSON matching this schema:
               {
                 "hub": "string",
                 "categories": {
                   "weekend_getaways": [{ 
                     "name": "string", 
                     "transit_corridor": "string", 
                     "vibe_tags": ["string"], 
                     "target_demographic": ["string"], 
                     "crowd_warning": "string | null",
                     "requires_leave_days": boolean
                   }],
                   "remote_workations": [{ 
                     "name": "string", 
                     "transit_corridor": "string", 
                     "vibe_tags": ["string"], 
                     "target_demographic": ["string"], 
                     "crowd_warning": "string | null",
                     "requires_leave_days": boolean
                   }]
                 }
               }
            5. Extract metadata like "target_demographic" from the tables following each destination.
            6. Return the hub name in the "hub" field.`,
            userPrompt: `Hub: ${hub}\n\nMarkdown Analysis Window: ${contextWindow}`,
            model: "gemini-1.5-flash-latest"
        });

        console.log(`RAG Debug: Raw Enriched LLM result for ${hub}:`, JSON.stringify(result).substring(0, 1000));

        // Use Zod to validate and parse the result
        const parsed = CategorizedDestinationsSchema.parse(result);
        console.log(`RAG Debug: Successfully parsed ${parsed.categories.weekend_getaways.length} getaways and ${parsed.categories.remote_workations.length} workations with granular triggers.`);
        return parsed;
    } catch (error) {
        console.error("LLM Hierarchical Enriched Places Extraction Error:", error);
        return null;
    }
}
