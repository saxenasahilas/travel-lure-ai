import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { tavily } from '@tavily/core' // Ensure you've installed: npm install @tavily/core

// --- Updated Types ---

export type ConciergeOption = {
  name: string;
  zone: string;
  funFact: string;
  liveTemp: string;
  distanceKm: string | number;
  topProperties: string;
  iconicCafe: string;
  // New specific fields
  dailyBudget: string; 
  majorExpenses: {
    stay: string;
    food: string;
    travel: string;
  };
};

export type SecretSource = {
  guideName: string;
  tips: string[];
  isFromGuide: boolean;
};

// --- Helpers ---

/**
 * Uses Tavily to fetch raw Reddit sentiment and seasonal weather data.
 */
async function getTavilyContext(place: string, vibe: string) {
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
  // We search specifically for Reddit sentiment and seasonal weather patterns
  const query = `reddit travel reviews for ${place} ${vibe} and seasonal weather breakdown`;
  const response = await tvly.search(query, {
    searchDepth: "advanced",
    includeAnswer: true,
    maxResults: 5,
  });
  debugger
  return response.answer || response.results.map((r: any) => r.content).join('\n');
}

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

function normalizeOption(o: any): ConciergeOption {
  const dist = o?.distanceKm ?? o?.distance;
  return {
    name: String(o?.name ?? '—'),
    zone: String(o?.zone ?? '—'),
    funFact: String(o?.funFact ?? '—'),
    liveTemp: '—',
    distanceKm: typeof dist === 'number' ? dist : String(dist ?? '—'),
    topProperties: String(o?.topProperties ?? '—'),
    iconicCafe: String(o?.iconicCafe ?? '—'),
    dailyBudget: String(o?.dailyBudget ?? '—'),
    majorExpenses: {
      stay: String(o?.majorExpenses?.stay ?? '—'),
      food: String(o?.majorExpenses?.food ?? '—'),
      travel: String(o?.majorExpenses?.travel ?? '—'),
    },
  };
}

// --- Main Route Handler ---

export async function POST(req: NextRequest) {
  try {
    const groqKey = process.env.GROQ_API_KEY;
    const { location, vibe, latitude, longitude } = await req.json();

    if (!vibe) return NextResponse.json({ error: "Vibe required" }, { status: 400 });

    // 1. FETCH TAVILY CONTEXT (Items 6 & 7 on your list)
    // This gives the AI "raw" data from Reddit before it answers.
    const rawSearchData = await getTavilyContext(location || "India", vibe);

    const groq = new Groq({ apiKey: groqKey });

    // 2. UPDATED SYSTEM PROMPT
    // Change this line in your code:
    const systemPrompt = `You are a professional travel fixer. Provide 100% data, 0% fluff. 
    - Use the Search Context to find actual currency values (INR) for costs.
    - Do NOT return Reddit subscriber counts. Instead, extract real user "trip reports" from the context.
    - Output the response in JSON format with 4 options.
    - Schema Requirement:
      { 
        "options": [{ 
          "name", "zone", "funFact", "distanceKm", "topProperties", "iconicCafe",
          "dailyBudget": "Estimated total per day in INR",
          "majorExpenses": {
            "stay": "Avg cost of hostel/dorm",
            "food": "Avg cost for 3 meals at dhabas/cafes",
            "travel": "Cost of scooty rental or local rickshaws"
          }
        }],
        "secretSource": { "guideName": "L'itinerario nelle pianure", "tips": ["2-3 specific money-saving hacks from the search context"], "isFromGuide": true }
      }`;


    // 3. AI GENERATION WITH LIVE CONTEXT
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Context: ${rawSearchData}. Vibe: ${vibe}. Location: ${location || 'Anywhere India'}` },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    let options = (parsed.options || []).slice(0, 3).map(normalizeOption);

    // 4. WEATHER ENRICHMENT
    const weatherTarget = location || options[0]?.name;
    const currentTemp = await getLiveTemp(weatherTarget);
    options = options.map((o: any) => ({ ...o, liveTemp: currentTemp }));

    return NextResponse.json({ options, secretSource: parsed.secretSource });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}