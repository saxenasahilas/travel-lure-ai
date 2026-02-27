import { NextRequest, NextResponse } from 'next/server';
import { tavily } from '@tavily/core';
import { AgentState } from '@/agents/state';
import { runGraph } from '@/agents/graph';
import { getOriginContext } from '@/lib/rag';

// --- Helpers ---

/**
 * Cleans the raw search results by removing common Reddit bot-check messages.
 */
function cleanSearchContent(text: string): string {
  // Removes "Prove your humanity", "CAPTCHA", "reReddit", and other automated noise
  const noisePatterns = [
    /Prove your humanity/gi,
    /Complete the challenge below/gi,
    /let us know you’re a real person/gi,
    /reReddit: Top posts/gi,
    /Reddit Rules Privacy Policy/gi,
    /Reddit, Inc\. © \d{4}/gi
  ];

  let cleaned = text;
  noisePatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  return cleaned.trim();
}

async function getTavilyContext(place: string, vibe: string) {
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
  // Focus query on "trip reports" to avoid landing pages that trigger bot-walls
  const query = `detailed trip report reddit for ${place} ${vibe} travel 2025 2026`;

  const response = await tvly.search(query, {
    searchDepth: "advanced",
    includeAnswer: true,
    maxResults: 5,
  });

  // Clean the results before sending to LLM
  const rawContext = response.results
    .map((r: any) => `Source: ${r.url} | Content: ${cleanSearchContent(r.content)}`)
    .join('\n\n');

  return rawContext;
}

// --- Main Route Handler ---

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vibe: rawVibe, latitude: bodyLat, longitude: bodyLng, viaHub } = body;
    let { location: bodyLocation } = body;

    // --- Inherent Location Detection ---
    const geoCity = req.headers.get('x-vercel-ip-city');
    const geoLat = req.headers.get('x-vercel-ip-latitude');
    const geoLng = req.headers.get('x-vercel-ip-longitude');

    const location = bodyLocation || geoCity || "India";
    const latitude = bodyLat || (geoLat ? parseFloat(geoLat) : undefined);
    const longitude = bodyLng || (geoLng ? parseFloat(geoLng) : undefined);

    console.log(`SERVER: Location detected as ${location} (${latitude}, ${longitude})`);

    const vibe = rawVibe?.trim() || "general explore";

    // 1. Get Context (Search + Federated RAG)
    console.log("SERVER: Fetching Context...");
    const [rawSearchData, originContext] = await Promise.all([
      getTavilyContext(location, vibe),
      viaHub && viaHub !== "None" ? getOriginContext(viaHub) : Promise.resolve("")
    ]);

    // 2. Initialize State
    const initialState: AgentState = {
      userInput: { location, vibe, latitude, longitude, viaHub },
      context: {
        tavilyResults: rawSearchData,
        originContext: originContext || undefined
      },
      intermediate: { candidates: [] },
      finalOptions: [],
      secretSource: null
    };

    // 3. Run Agent Graph
    console.log("SERVER: Starting Agent Graph...");
    const finalState = await runGraph(initialState);
    console.log("SERVER: Agent Graph Completed.");

    return NextResponse.json({
      options: finalState.finalOptions,
      detectedLocation: { name: location, latitude, longitude },
      secretSource: { guideName: "AI Agent Swarm", tips: [], isFromGuide: true } // Placeholder for secret source
    });

  } catch (error: any) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}