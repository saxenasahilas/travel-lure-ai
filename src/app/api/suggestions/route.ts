import { NextRequest, NextResponse } from 'next/server';
import { getHubPlaces } from '@/lib/rag';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const hub = searchParams.get('hub');

    if (!hub || hub === "None") {
        return NextResponse.json({ hub: "", categories: { weekend_getaways: [], remote_workations: [] } });
    }

    try {
        const data = await getHubPlaces(hub);
        return NextResponse.json(data || { hub, categories: { weekend_getaways: [], remote_workations: [] } });
    } catch (error) {
        console.error("Suggestions API Error:", error);
        return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
    }
}
