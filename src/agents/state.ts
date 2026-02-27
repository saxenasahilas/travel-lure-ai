import { ConciergeOption } from "@/components/ResultBento";

export interface Candidate {
    name?: string;
    zone?: string;
    funFact?: string;
    liveTemp?: string;
    distanceKm?: string | number;
    topProperties?: { name: string; type: string }[];
    iconicCafe?: string;
    dailyBudget?: string;
    majorExpenses?: {
        stay?: string;
        food?: string;
        travel?: string;
    };
    flashcards?: {
        where?: string;
        when?: string;
        how?: string;
    };
}

export interface AgentState {
    userInput: {
        location: string;
        vibe: string;
        latitude?: number;
        longitude?: number;
        viaHub?: string;
        companion_type?: "solo" | "couple" | "friends" | "family";
        transit_tolerance?: "low" | "medium" | "high";
    };
    context: {
        tavilyResults?: string;
        weather?: string;
        originContext?: string;
    };
    intermediate: {
        candidates?: Candidate[];
    };
    finalOptions: ConciergeOption[];
    secretSource?: any;
    // RAG Context
    activeUri?: string;
    activeSource?: "smart_travel" | "lonely_planet" | "tavily" | "origin_context";
}

import { z } from "zod";

export const DestinationDetailSchema = z.object({
    name: z.string().describe("e.g., 'Astroport Sariska, Rajasthan'"),
    transit_corridor: z.string().describe("e.g., '4-5 hour drive'"),
    vibe_tags: z.array(z.string()).describe("e.g., ['intellectual retreat', 'stargazing', 'offbeat']"),
    target_demographic: z.array(z.string()).describe("e.g., ['Niche travelers', 'astronomy enthusiasts']"),
    crowd_warning: z.string().nullable().describe("e.g., 'Winter is peak, remains uncrowded'"),
    requires_leave_days: z.boolean().describe("true if transit requires utilizing corporate leave days"),
});

export const CategorizedDestinationsSchema = z.object({
    hub: z.string().describe("e.g., 'Delhi NCR'"),
    categories: z.object({
        weekend_getaways: z.array(DestinationDetailSchema),
        remote_workations: z.array(DestinationDetailSchema),
    }),
});

export type DestinationDetail = z.infer<typeof DestinationDetailSchema>;
export type CategorizedDestinations = z.infer<typeof CategorizedDestinationsSchema>;
