import { Annotation, MessagesAnnotation, StateGraph, START, END } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { tools } from "./tools";
import { HumanMessage, SystemMessage, ToolMessage, AIMessage } from "@langchain/core/messages";

// 1. Define Agent State
export const AgentState = Annotation.Root({
    ...MessagesAnnotation.spec,
    budget: Annotation<number>(),
    dates: Annotation<string>(),
    corridorContext: Annotation<string>(), // Local RAG context
    bookingPhase: Annotation<"planning" | "searching" | "booking" | "completed">(),
    commands: Annotation<any[]>({
        reducer: (x, y) => y, // Overwrite with current turn's commands
        default: () => [],
    }),
});

const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.1-8b-instant",
    temperature: 0,
}).bindTools(tools);

const SYSTEM_PROMPT = `You are a deterministic travel orchestration agent. 
You must NEVER hallucinate or estimate prices, flight availability, or cancellation policies. 
You may ONLY output data explicitly returned by your tools.

The system automatically extracts commands (ADD_DESTINATION, MAP_UPDATE, etc.) from your tool calls. 
You should NOT write these commands in your conversational reply to the user.
Instead, speak naturally to the user about what you've found and ask follow-up questions.

STRICT LOGIC GATES:
1. Planning: Use geocode_location whenever a city is mentioned.
2. Corridor Check: ALWAYS call query_local_context before searching for flights for a specific route.
3. Flight Search: Only call search_flights if the query_local_context indicates it's a flight corridor or doesn't mention a bus/car preference.
4. Hallucination Guard: If search_flights returns API_NO_ROUTES_FOUND, tell the user exactly that: "No direct flights found for this route". Suggest driving, buses, or trains instead. NEVER invent an airline.

IMPORTANT: Every time you geocode a location, the map will pan to those coordinates.

EXAMPLES:
User: "Plan a trip to Coorg from Bangalore."
Assistant: [Calls geocode_location("Bangalore"), Calls geocode_location("Coorg"), Calls query_local_context(origin="Bangalore", destination="Coorg")]
Tool Result (Context): "5-6 hour drive. No airports in Coorg."
Assistant: "I've mapped out the route from Bangalore to Coorg. Since it's a 5-6 hour drive and there's no airport in Coorg, I recommend driving or taking a bus. Would you like me to find a hotel instead?"

User: "Find flights from Bareilly to Rishikesh."
Assistant: [Calls query_local_context(origin="Bareilly", destination="Rishikesh")]
Tool Result (Context): "4-5 hour drive. No direct flights."
Assistant: "I checked the route, and it's actually just a 4-5 hour drive or bus journey. I couldn't find any direct flights. Shall we look for accommodations in Rishikesh?"

You speak to the user politely but stay focused on the orchestration task.`;

// 2. Define Nodes
async function callModel(state: typeof AgentState.State) {
    const messages = [new SystemMessage(SYSTEM_PROMPT), ...state.messages];
    const response = await model.invoke(messages);

    let phase = state.bookingPhase;
    const content = typeof response.content === 'string' ? response.content : "";
    if (content.toLowerCase().includes("book") || content.toLowerCase().includes("confirm payment")) {
        phase = "booking";
    }

    return { messages: [response], bookingPhase: phase };
}

async function bookingNode(state: typeof AgentState.State) {
    // This node is where the graph pauses for HITL
    // We return a command that the frontend will recognize as a request for booking form
    return {
        commands: [{ action: 'REQUEST_BOOKING_FORM', data: { type: 'payment' } }]
    };
}

async function processToolResults(state: typeof AgentState.State) {
    const commands: any[] = [];

    // Find the last human message index
    let lastHumanIndex = -1;
    for (let i = state.messages.length - 1; i >= 0; i--) {
        if (state.messages[i] instanceof HumanMessage || (state.messages[i] as any)._getType?.() === 'human') {
            lastHumanIndex = i;
            break;
        }
    }

    // Process all tool messages after that
    for (let i = lastHumanIndex + 1; i < state.messages.length; i++) {
        const msg = state.messages[i];
        if (msg instanceof ToolMessage || (msg as any)._getType?.() === 'tool') {
            try {
                const content = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
                const toolName = (msg as any).name || (msg as any).tool_name;

                if (toolName === 'geocode_location' && content.lat !== 0) {
                    commands.push({ action: 'ADD_DESTINATION', data: content });
                    commands.push({ action: 'MAP_UPDATE', data: { lat: content.lat, lng: content.lng } });
                } else if (toolName === 'search_flights') {
                    if (Array.isArray(content) && content.length > 0) {
                        commands.push({ action: 'ADD_FLIGHT', data: content[0] });
                    }
                } else if (toolName === 'search_hotels') {
                    if (Array.isArray(content) && content.length > 0) {
                        commands.push({ action: 'ADD_HOTEL', data: content[0] });
                    }
                } else if (toolName === 'query_local_context') {
                    // Context is used by the model in the next turn
                }
            } catch (e) {
                // Not JSON (e.g., API_NO_ROUTES_FOUND) or already parsed
                if (msg.content === "API_NO_ROUTES_FOUND") {
                    console.log("Amadeus: No routes found for this leg.");
                }
            }
        }
    }

    return { commands };
}

// 3. Define the Graph
const workflow = new StateGraph(AgentState)
    .addNode("agent", callModel)
    .addNode("tools", new ToolNode(tools))
    .addNode("process", processToolResults)
    .addNode("booking", bookingNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", (state) => {
        if (state.bookingPhase === "booking") {
            return "booking";
        }
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage && "tool_calls" in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls.length > 0) {
            return "tools";
        }
        return END;
    })
    .addEdge("tools", "process")
    .addEdge("process", "agent")
    .addEdge("booking", END);

export const agent = workflow.compile();
