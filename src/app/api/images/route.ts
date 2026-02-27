import { tavily } from "@tavily/core";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { query } = await request.json();
        if (!query) return NextResponse.json({ error: "Query required" }, { status: 400 });

        const tv = tavily({ apiKey: process.env.TAVILY_API_KEY });
        const response = await tv.search(query, {
            include_images: true,
            include_answer: false,
            max_results: 3,
            topic: "general",
        });

        const images = response.images || [];
        return NextResponse.json({ images });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
    }
}
