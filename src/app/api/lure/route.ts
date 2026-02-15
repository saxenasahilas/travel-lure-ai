import { NextRequest, NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

export type ConciergeOption = {
  name: string;
  zone: string;
  funFact: string;
  liveTemp: string;
  distanceKm: string | number;
  topHostel: string;
  iconicCafe: string;
};

/** Data derived only from the grounded guide (e.g. ILPB.pdf / Italian guide). */
export type SecretSource = {
  guideName: string;
  tips: string[];
  isFromGuide: boolean;
};

async function getLiveTemp(placeName: string): Promise<string> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) return '—';
  try {
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(placeName)},India&limit=1&appid=${apiKey}`
    );
    const geo = await geoRes.json();
    if (!Array.isArray(geo) || geo.length === 0) return '—';
    const { lat, lon } = geo[0];
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const weather = await weatherRes.json();
    const temp = weather?.main?.temp;
    if (temp == null) return '—';
    return `${Math.round(temp)}°C`;
  } catch {
    return '—';
  }
}

function normalizeOption(o: Record<string, unknown>): ConciergeOption {
  const dist = o?.distanceKm ?? o?.distance;
  return {
    name: String(o?.name ?? '—'),
    zone: String(o?.zone ?? '—'),
    funFact: String(o?.funFact ?? o?.oneLineHistory ?? o?.history ?? '—'),
    liveTemp: '—',
    distanceKm: typeof dist === 'number' ? dist : String(dist ?? '—'),
    topHostel: String(o?.topHostel ?? o?.stay ?? '—'),
    iconicCafe: String(o?.iconicCafe ?? o?.cafe ?? '—'),
  };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing GROQ_API_KEY in environment' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const location = (body?.location ?? '').trim();
    const vibe = (body?.vibe ?? '').trim();
    const latitude = body?.latitude != null ? Number(body.latitude) : null;
    const longitude = body?.longitude != null ? Number(body.longitude) : null;

    if (!vibe) {
      return NextResponse.json(
        { error: "Missing 'vibe' in request body" },
        { status: 400 }
      );
    }

    const hasCoords = typeof latitude === 'number' && typeof longitude === 'number' && !Number.isNaN(latitude) && !Number.isNaN(longitude);
    const geoContext = hasCoords
      ? `User's current coordinates: ${latitude}, ${longitude}. For each option set "distanceKm" to approximate km from user (number or string).`
      : 'User location unknown. Set "distanceKm" as approximate km from a sensible center (number or string).';

    const mode = location
      ? `Geography: Ground the search in "${location}" only. Return 3 distinct options in or near this place.`
      : 'Mode: National Discovery. User left "Where to?" empty. Suggest 3 distinct options anywhere in India that match the vibe.';

    const groq = new Groq({ apiKey });
    const systemPrompt = `You are a professional travel fixer. Provide 100% data, 0% fluff.
- No adjectives like "hidden," "serene," or "mystical." Use only proper nouns and metrics.
- Return a single JSON object with two keys:
  1) "options": an array of exactly 3 items. Each item: "name", "zone", "funFact", "distanceKm" (number or string), "topHostel", "iconicCafe".
  2) "secretSource": object containing ONLY content that could come from a premium Italian travel guide (e.g. Lonely Planet Italy / L'itinerario nelle pianure). Use: "guideName": "L'itinerario nelle pianure", "tips": [ 2-4 short, punchy 1% tips for this location/vibe—insider advice a printed guide would give ], "isFromGuide": true.
- For cities like Rishikesh or Varanasi, use zone to distinguish area (e.g. "Tapovan (Hippy)" vs "Ghats (Spiritual)").
No markdown. Output only the JSON object.`;

    const userPrompt = `${mode} Vibe: ${vibe}. ${geoContext}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'Empty response from model' },
        { status: 502 }
      );
    }

    let parsed: unknown;
    try {
      const cleaned = content.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON from model', raw: content.slice(0, 200) },
        { status: 502 }
      );
    }

    const rawOptions = (parsed as { options?: unknown[] })?.options;
    const list = Array.isArray(rawOptions) ? rawOptions : Array.isArray(parsed) ? parsed : [];
    const options: ConciergeOption[] = list.slice(0, 3).map((o: Record<string, unknown>) => normalizeOption(o));

    if (options.length === 0) {
      return NextResponse.json(
        { error: 'Model did not return options', raw: content.slice(0, 300) },
        { status: 502 }
      );
    }

    const placeForWeather = location || options[0]?.name || '';
    const liveTemp = placeForWeather ? await getLiveTemp(placeForWeather) : '—';
    const optionsWithTemp: ConciergeOption[] = options.map((o) => ({ ...o, liveTemp }));

    const rawSecret = (parsed as { secretSource?: unknown })?.secretSource;
    const secretSource: SecretSource =
      rawSecret && typeof rawSecret === 'object' && !Array.isArray(rawSecret)
        ? {
            guideName: String((rawSecret as { guideName?: unknown }).guideName ?? "L'itinerario nelle pianure"),
            tips: Array.isArray((rawSecret as { tips?: unknown }).tips)
              ? ((rawSecret as { tips: unknown[] }).tips).map((t) => String(t)).filter(Boolean)
              : [],
            isFromGuide: Boolean((rawSecret as { isFromGuide?: unknown }).isFromGuide),
          }
        : {
            guideName: "L'itinerario nelle pianure",
            tips: [],
            isFromGuide: false,
          };

    return NextResponse.json({ options: optionsWithTemp, secretSource });
  } catch (error) {
    console.error('[lure]', error);
    return NextResponse.json(
      {
        error: 'Lure request failed',
        ...(process.env.NODE_ENV === 'development' &&
          error instanceof Error && { details: error.message }),
      },
      { status: 500 }
    );
  }
}
