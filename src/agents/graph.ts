import { AgentState } from "./state";
import { matchmaker } from "./nodes/matchmaker";
import { logistics } from "./nodes/logistics";
import { sentinel } from "./nodes/sentinel";

export async function runGraph(initialState: AgentState): Promise<AgentState> {
    let state = { ...initialState };

    // 1. Matchmaker (Where)
    console.log("AGENTS: Running Matchmaker...");
    const matchResult = await matchmaker(state);
    state = { ...state, ...matchResult, intermediate: { ...state.intermediate, ...matchResult.intermediate } };

    // 2. Logistics (How)
    console.log("AGENTS: Running Logistics...");
    const logResult = await logistics(state);
    state = { ...state, ...logResult, intermediate: { ...state.intermediate, ...logResult.intermediate } };

    // 3. Sentinel (When)
    console.log("AGENTS: Running Sentinel...");
    const senResult = await sentinel(state);
    state = { ...state, ...senResult, intermediate: { ...state.intermediate, ...senResult.intermediate } };

    // Finalize Options
    // Ensure all candidates are fully formed ConciergeOptions
    const finalOptions = (state.intermediate.candidates || []).map((c: any) => ({
        name: c.name || "Unknown",
        zone: c.zone || "—",
        funFact: c.funFact || "—",
        liveTemp: c.liveTemp || "—",
        distanceKm: c.distanceKm || "—",
        topProperties: c.topProperties || "—",
        iconicCafe: c.iconicCafe || "—",
        dailyBudget: c.dailyBudget || "—",
        majorExpenses: c.majorExpenses || { stay: "—", food: "—", travel: "—" },
        flashcards: {
            where: c.flashcards?.where || "Explore the area.",
            when: c.flashcards?.when || "Check the season.",
            how: c.flashcards?.how || "Plan your transport."
        }
    }));

    return { ...state, finalOptions };
}
