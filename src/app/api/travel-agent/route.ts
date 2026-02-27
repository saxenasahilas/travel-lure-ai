import { NextRequest, NextResponse } from 'next/server';
import { agent } from '@/agents/collaborativeAgent';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

export async function POST(req: NextRequest) {
    try {
        const { message, history } = await req.json();
        console.log("API: Processing message:", message);

        // Convert history to LangChain messages
        const pastMessages = history.map((msg: any) =>
            msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
        );

        // Run the agent
        console.log("API: Invoking agent...");
        const result = await agent.invoke({
            messages: [...pastMessages, new HumanMessage(message)],
        });
        console.log("API: Agent execution finished.");

        // Get the last AI message
        const lastMessage = result.messages[result.messages.length - 1];

        // Commands were accumulated in the state
        const commands = result.commands || [];

        return NextResponse.json({
            reply: lastMessage.content,
            commands: commands,
            phase: result.bookingPhase
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
