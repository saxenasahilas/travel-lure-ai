import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Mock tool for searching flights via Amadeus API
 */
export const search_flights = tool(
    async ({ origin, destination, date }) => {
        try {
            console.log(`Searching flights from ${origin} to ${destination} on ${date}...`);

            // Amadeus Sandbox Simulator: Only major hubs supported
            const supportedHubs = ["DEL", "BOM", "BLR", "LHR", "CDG", "JFK", "SFO", "DXB", "SIN"];
            const isOriginSupported = supportedHubs.some(hub => origin.toUpperCase().includes(hub));
            const isDestSupported = supportedHubs.some(hub => destination.toUpperCase().includes(hub));

            if (!isOriginSupported || !isDestSupported) {
                console.warn(`Amadeus Sandbox: No direct routes supported for ${origin} -> ${destination}`);
                return "API_NO_ROUTES_FOUND";
            }

            // Mocking Amadeus API response for supported hubs
            return JSON.stringify([
                {
                    id: "f1",
                    airline: "IndiGo",
                    flightNumber: "6E-2104",
                    origin,
                    destination,
                    price: 3500,
                    currency: "INR",
                    departureTime: "08:30 AM"
                },
                {
                    id: "f2",
                    airline: "Air India",
                    flightNumber: "AI-102",
                    origin,
                    destination,
                    price: 4200,
                    currency: "INR",
                    departureTime: "11:15 AM"
                }
            ]);
        } catch (error) {
            console.error("Amadeus Search Error:", error);
            return "API_NO_ROUTES_FOUND";
        }
    },
    {
        name: "search_flights",
        description: "Search for available flights between two cities.",
        schema: z.object({
            origin: z.string().describe("The IATA code or city name of origin"),
            destination: z.string().describe("The IATA code or city name of destination"),
            date: z.string().describe("The departure date in YYYY-MM-DD format"),
        }),
    }
);

/**
 * Tool to geocode natural language locations into coordinates
 */
export const geocode_location = tool(
    async ({ location }) => {
        console.log(`Geocoding location: ${location}...`);
        const keys = [process.env.GOOGLE_API_KEY, process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY].filter(Boolean);

        if (keys.length === 0) {
            console.error("No Google API Keys found in environment");
        }

        for (const apiKey of keys) {
            try {
                const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.status === "OK" && data.results.length > 0) {
                    const { lat, lng } = data.results[0].geometry.location;
                    const formattedName = data.results[0].formatted_address;
                    console.log(`Success with key ${apiKey?.substring(0, 5)}...: ${formattedName} at ${lat}, ${lng}`);
                    return JSON.stringify({ name: formattedName, lat, lng });
                } else {
                    console.warn(`Geocoding failed for ${location} with key ${apiKey?.substring(0, 5)}...: ${data.status}`);
                }
            } catch (error) {
                console.error("Geocoding fetch error:", error);
            }
        }

        // Expanded Fallback Mocks if all API attempts fail
        const fallbacks: Record<string, { lat: number; lng: number }> = {
            "Bangalore": { lat: 12.9716, lng: 77.5946 },
            "Bengaluru": { lat: 12.9716, lng: 77.5946 },
            "Coimbatore": { lat: 11.0168, lng: 76.9558 },
            "Ooty": { lat: 11.4102, lng: 76.6950 },
            "Udhagamandalam": { lat: 11.4102, lng: 76.6950 },
            "Paris": { lat: 48.8566, lng: 2.3522 },
            "Rome": { lat: 41.9028, lng: 12.4964 },
            "London": { lat: 51.5074, lng: -0.1278 },
        };

        const normalized = location.split(',')[0].trim();
        const coord = fallbacks[normalized] || { lat: 0, lng: 0 };
        return JSON.stringify({ name: location, ...coord, error: "API Failure/Fallback used" });
    },
    {
        name: "geocode_location",
        description: "Convert a city or place name into latitude and longitude coordinates using Google Maps.",
        schema: z.object({
            location: z.string().describe("The name of the city or place to geocode"),
        }),
    }
);

/**
 * Mock tool for searching hotels
 */
export const search_hotels = tool(
    async ({ location, checkIn, checkOut }) => {
        console.log(`Searching hotels in ${location} from ${checkIn} to ${checkOut}...`);
        return JSON.stringify([
            {
                id: "h1",
                name: "Grand Palace Hotel",
                lat: 0, // In real app, you'd geocode this
                lng: 0,
                pricePerNight: 180,
                rating: 4.5
            },
            {
                id: "h2",
                name: "Budget Stay Inn",
                lat: 0,
                lng: 0,
                pricePerNight: 85,
                rating: 3.8
            }
        ]);
    },
    {
        name: "search_hotels",
        description: "Search for hotels in a specific location.",
        schema: z.object({
            location: z.string().describe("The city or area to search for hotels"),
            checkIn: z.string().describe("Check-in date in YYYY-MM-DD format"),
            checkOut: z.string().describe("Check-out date in YYYY-MM-DD format"),
        }),
    }
);

/**
 * Tool to query local RAG context for travel corridors
 */
export const query_local_context = tool(
    async ({ origin, destination }) => {
        console.log(`Querying local context for corridor: ${origin} to ${destination}...`);

        // Simulating RAG check from data/origin_context.md
        const corridors: Record<string, string> = {
            "Bareilly-Rishikesh": "This is a 4-5 hour drive or an overnight sleeper bus corridor. No direct flights exist. Travelers typically use private cars or buses.",
            "Delhi-Manali": "8-10 hour drive or overnight bus. Flights available to Kullu (BHU) but often cancelled due to weather.",
            "Bangalore-Coorg": "5-6 hour drive. No airports in Coorg. Mysore is the nearest railhead.",
        };

        const key = `${origin.trim()}-${destination.trim()}`;
        const reverseKey = `${destination.trim()}-${origin.trim()}`;

        return corridors[key] || corridors[reverseKey] || "No specific local corridor found. Suggest standard transit options.";
    },
    {
        name: "query_local_context",
        description: "Check local transport context/RAG for a specific route (e.g., if it's a bus corridor vs flight corridor).",
        schema: z.object({
            origin: z.string().describe("The starting city"),
            destination: z.string().describe("The destination city"),
        }),
    }
);

export const tools = [search_flights, geocode_location, search_hotels, query_local_context];
export const toolNames = tools.map(t => t.name);
