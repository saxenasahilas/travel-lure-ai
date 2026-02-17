import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { tavily } from '@tavily/core';

// --- Updated Types ---

export type ConciergeOption = {
  name: string;
  zone: string;
  funFact: string;
  liveTemp: string;
  distanceKm: string | number;
  topProperties: string;
  iconicCafe: string;
  dailyBudget: string; 
  majorExpenses: {
    stay: string;
    food: string;
    travel: string;
  };
  redditInsight: string; // NEW: Specific field for that raw Reddit quote
};

export type SecretSource = {
  guideName: string;
  tips: string[];
  isFromGuide: boolean;
};

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
    redditInsight: String(o?.redditInsight ?? 'No recent social proof found.'),
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

    const rawSearchData = await getTavilyContext(location || "India", vibe);
    const groq = new Groq({ apiKey: groqKey });

    const systemPrompt = `You are a professional travel fixer. Provide 100% data, 0% fluff. 
    - Use Search Context to find actual currency values (INR) for costs.
    - IGNORE any context containing "CAPTCHA" or "humanity check".
    - For each option, extract ONE specific, raw user quote/insight from the Search Context.
    - Format redditInsight exactly as: "[quote] (Source: r/[SubredditName])".
    - Output exactly 3 options in JSON.
    - Schema:
      { 
        "options": [{ 
          "name", "zone", "funFact", "distanceKm", "topProperties", "iconicCafe", "redditInsight",
          "dailyBudget": "approx INR [total]",
          "majorExpenses": { "stay", "food", "travel" }
        }],
        "secretSource": { "guideName": "L'itinerario nelle pianure", "tips": [], "isFromGuide": true }
      }`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: `Constraint: Only search within "${location}".` },
        { role: 'user', content: `Context: ${rawSearchData}. Vibe: ${vibe}.` },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    let options = (parsed.options || []).slice(0, 3).map(normalizeOption);

    const weatherTarget = location || options[0]?.name;
    const currentTemp = await getLiveTemp(weatherTarget);
    options = options.map((o: any) => ({ ...o, liveTemp: currentTemp }));

    return NextResponse.json({ options, secretSource: parsed.secretSource });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}