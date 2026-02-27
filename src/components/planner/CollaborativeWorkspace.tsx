"use client";

import React from 'react';
import { MapCanvas } from './MapCanvas';
import { ChatUI } from './ChatUI';
import { FloatingItinerary } from './FloatingItinerary';

export const CollaborativeWorkspace: React.FC = () => {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-black">
            {/* Left 60%: Map Area */}
            <div className="relative w-3/5 h-full border-r border-white/10">
                <MapCanvas />

                {/* Overlays */}
                <div className="absolute top-6 left-6 z-10">
                    <FloatingItinerary />
                </div>
            </div>

            {/* Right 40%: Chat UI */}
            <div className="w-2/5 h-full flex flex-col">
                <ChatUI />
            </div>
        </div>
    );
};
