"use client";

import { motion } from "framer-motion";

type ExploreTabProps = {
    dark: boolean;
};

export default function ExploreTab({ dark }: ExploreTabProps) {
    const textColor = dark ? "text-white" : "text-[#1E293B]";
    const subTextColor = dark ? "text-slate-400" : "text-[#64748B]";

    // Mock data for masonry layout placeholders
    const pins = [
        { id: 1, title: "Modern Villa", type: "Stay", h: "h-64", color: "bg-slate-200" },
        { id: 2, title: "Cozy Loft", type: "Stay", h: "h-48", color: "bg-orange-100" },
        { id: 3, title: "Mountain View", type: "Spot", h: "h-56", color: "bg-blue-100" },
        { id: 4, title: "Forest Cabin", type: "Stay", h: "h-72", color: "bg-green-100" },
        { id: 5, title: "Desert Tent", type: "Spot", h: "h-48", color: "bg-yellow-100" },
        { id: 6, title: "City Apartment", type: "Stay", h: "h-60", color: "bg-red-100" },
    ];

    return (
        <div className="flex flex-col h-full pt-12 pb-32 px-6">
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

            {/* Masonry-style Grid */}
            <div className="columns-2 gap-4 space-y-4">
                {pins.map((pin, i) => (
                    <motion.div
                        key={pin.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`break-inside-avoid rounded-2xl overflow-hidden ${pin.color} relative group cursor-pointer`}
                    >
                        {/* Placeholder content since we don't have real images yet */}
                        <div className={`w-full ${pin.h} bg-gray-300 animate-pulse`} />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                            <span className="text-white font-medium text-sm">{pin.title}</span>
                            <span className="text-white/80 text-xs">{pin.type}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
