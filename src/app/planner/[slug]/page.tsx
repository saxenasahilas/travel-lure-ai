"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapCanvas } from "@/components/planner/MapCanvas";
import { DateSelector } from "@/components/planner/DateSelector";
import { ChevronLeft, Loader2, Compass, Sparkles, MapPin } from "lucide-react";
import Link from "next/link";

// Mock coordinate lookup for common destinations
const DESTINATION_COORDS: Record<string, { lat: number; lng: number }> = {
    "manali": { lat: 32.2432, lng: 77.1892 },
    "rishikesh": { lat: 30.0869, lng: 78.2676 },
    "goa": { lat: 15.2993, lng: 74.1240 },
    "alibaug": { lat: 18.6416, lng: 72.8722 },
    "lonavala": { lat: 18.7546, lng: 73.4062 },
    "udaipur": { lat: 24.5854, lng: 73.7125 },
    "bir-billing": { lat: 32.0531, lng: 76.7115 },
    "gokarna": { lat: 14.5479, lng: 74.3188 },
};

export default function PlannerPage() {
    const params = useParams();
    const slug = typeof params?.slug === "string" ? params.slug.toLowerCase() : "unknown";
    const [loading, setLoading] = useState(false);
    const [itinerary, setItinerary] = useState<any>(null);
    const [dates, setDates] = useState<any>(null);

    const destinationName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
    const coords = DESTINATION_COORDS[slug] || { lat: 20.5937, lng: 78.9629 }; // Default to India center

    const handlePlanTrip = async (dateData: any) => {
        setDates(dateData);
        setLoading(true);

        // Simulate orchestration delay
        setTimeout(() => {
            setLoading(false);
            setItinerary({ success: true }); // Placeholder for actual LangGraph response
        }, 4000);
    };

    return (
        <main className="h-screen w-full flex bg-[#0a0a0a] overflow-hidden">
            {/* Left Half: Map */}
            <div className="w-1/2 h-full relative border-r border-white/5">
                <MapCanvas center={coords} zoom={13} />

                {/* Map Overlays */}
                <div className="absolute top-6 left-6 z-10">
                    <Link href="/">
                        <button className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-full text-white/80 hover:text-white transition-all hover:scale-110">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    </Link>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 w-auto px-6 py-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-white font-medium tracking-tight text-sm uppercase">Exploring {destinationName}</span>
                </div>
            </div>

            {/* Right Half: Planner Panel */}
            <div className="w-1/2 h-full overflow-y-auto scrollbar-hide bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a] relative">
                <div className="max-w-xl mx-auto px-8 py-12 pt-20">

                    {/* Header */}
                    <div className="mb-12">
                        <div className="flex items-center gap-2 text-white/40 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs uppercase tracking-[0.2em] font-bold">Trip Planner</span>
                        </div>
                        <h1 className="text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40 inline-block">
                            {destinationName}
                        </h1>
                    </div>

                    <AnimatePresence mode="wait">
                        {!loading && !itinerary ? (
                            <motion.div
                                key="config"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8"
                            >
                                <DateSelector onDateChange={handlePlanTrip} />

                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                                            <Sparkles className="text-white w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-semibold">AI Assistant Ready</h4>
                                            <p className="text-white/40 text-sm">Once dates are set, we&apos;ll query Reddit sentiment and our regional guides for your custom route.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-[60vh] flex flex-col items-center justify-center text-center space-y-8"
                            >
                                <div className="relative">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                                        className="w-32 h-32 rounded-full border-t-2 border-r-2 border-white/20"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Compass className="w-12 h-12 text-white animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-white tracking-tight">Mapping your Logistics...</h3>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-white/40 text-sm flex items-center justify-center gap-2">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Cross-referencing Local Guides
                                        </p>
                                        <p className="text-white/40 text-sm flex items-center justify-center gap-2 opacity-0 animate-[fadeIn_1s_ease-in_forwards_2s]">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Fetching Live Reddit Sentiment
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="itinerary"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center">
                                    <Sparkles className="text-green-500 w-8 h-8 mx-auto mb-2" />
                                    <h3 className="text-white font-bold text-xl tracking-tight">Your Route is Mapped!</h3>
                                    <p className="text-white/60 text-sm">Backend ready to serve the itinerary component.</p>
                                </div>
                                <button
                                    onClick={() => setItinerary(null)}
                                    className="text-white/40 hover:text-white text-sm flex items-center gap-2 mx-auto pt-4 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Reset and try new dates
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}
