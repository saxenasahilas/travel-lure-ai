"use client";

import { useState, useEffect } from "react";
import VideoFeed from "./VideoFeed";
import { type TravelVideo, getRandomVideos } from "@/data/videoData";

type ExploreTabProps = {
    dark: boolean;
};

export default function ExploreTab({ dark }: ExploreTabProps) {
    const textColor = dark ? "text-white" : "text-[#1E293B]";

    // Randomize video feed on mount
    const [videos, setVideos] = useState<TravelVideo[]>([]);
    useEffect(() => {
        // eslint-disable-next-line
        setVideos(getRandomVideos(10));
    }, []);

    return (
        <div className="flex flex-col h-full pt-24 pb-32 px-6">
            <div className="mb-6">
                <h1 className={`text-2xl font-bold mb-4 ${textColor}`}>Explore</h1>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {["Stays", "Food", "Spots"].map((filter, i) => (
                        <button
                            key={filter}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${i === 0 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Video Feed */}
            <div className="absolute top-[120px] bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden border-t border-white/20 bg-black">
                <VideoFeed videos={videos} className="w-full h-full pb-20" />
            </div>
        </div>
    );
}
