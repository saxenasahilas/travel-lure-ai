"use client";

import { motion } from "framer-motion";
import { type Candidate } from "@/agents/state";
import { type BucketItem } from "@/hooks/useTravelBucket";
import BookingBubbles from "./BookingBubbles";

interface DiscoveryViewProps {
    candidates: Candidate[];
    onBack: () => void;
    dark: boolean;
}

export interface BucketContextType {
    bucket: BucketItem[];
    addToBucket: (item: BucketItem) => void;
    removeFromBucket: (id: string) => void;
    isInBucket: (id: string) => boolean;
    isOpen: boolean;
    toggleBucket: () => void;
    setIsOpen: (isOpen: boolean) => void;
}

interface DiscoveryViewProps {
    candidates: Candidate[];
    onBack: () => void;
    dark: boolean;
    bucket?: BucketContextType;
}

export default function DiscoveryView({ candidates, onBack, dark, bucket }: DiscoveryViewProps) {
    // Use the first candidate as the primary "Surprise" feature
    const place = candidates[0];

    if (!place || !place.name) return null;

    const isSaved = bucket?.isInBucket(place.name);

    const handleToggleBucket = () => {
        if (!bucket || !place.name) return;
        if (isSaved) {
            bucket.removeFromBucket(place.name);
        } else {
            bucket.addToBucket({
                id: place.name,
                category: "where",
                title: place.name,
                subtitle: place.zone || "Unknown location",
                data: place
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-6xl mx-auto rounded-[3rem] overflow-hidden shadow-2xl border ${dark ? "bg-slate-900/40 border-white/10" : "bg-white/40 border-slate-200/50"
                } backdrop-blur-3xl`}
        >
            <div className="flex flex-col md:flex-row h-[80vh] md:h-[650px]">
                {/* Left: Content */}
                <div className="flex-1 p-8 md:p-16 flex flex-col justify-center overflow-y-auto">
                    <button onClick={onBack} className="self-start text-xs font-black uppercase tracking-widest mb-10 flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors">
                        ← Back to Search
                    </button>

                    <div className="flex justify-between items-start mb-4">
                        <span className="text-blue-500 font-black tracking-[0.3em] uppercase text-[10px] px-3 py-1 bg-blue-500/10 rounded-full">
                            {place.zone} • {place.distanceKm} km away
                        </span>
                        {bucket && (
                            <button
                                onClick={handleToggleBucket}
                                className={`p-3 rounded-2xl transition-all shadow-lg ${isSaved ? "bg-pink-500 text-white scale-110" : "bg-white/10 dark:bg-black/20 text-gray-400 hover:text-pink-500 hover:scale-110"
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tighter leading-none">{place.name}</h1>
                    <p className="text-xl opacity-60 mb-10 font-medium leading-relaxed max-w-lg">
                        &quot;{place.funFact}&quot;
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="space-y-1">
                            <strong className="block text-[10px] uppercase tracking-widest opacity-40">Current Vibe</strong>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black">{place.liveTemp}</span>
                                <span className="text-sm opacity-50 font-medium whitespace-nowrap">Best in {place.flashcards?.when}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <strong className="block text-[10px] uppercase tracking-widest opacity-40">The Secret</strong>
                            <p className="text-sm font-bold leading-snug opacity-80">{place.flashcards?.where}</p>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-dashed border-gray-300 dark:border-gray-700 pt-6">
                        <h4 className="text-xs font-bold uppercase opacity-50 mb-3">Plan your trip</h4>
                        <BookingBubbles location={place.name + ", " + place.zone} />
                    </div>
                </div>

                {/* Right: Cinematic Visual */}
                <div className="w-full md:w-[45%] bg-slate-100 dark:bg-slate-800 relative overflow-hidden group">
                    <motion.div
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                        className="absolute inset-0"
                    >
                        <img
                            src={`https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80&q=travel,${encodeURIComponent(place.name || "scenery")}`}
                            alt={place.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </motion.div>

                    {/* Visual Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Badge on Image */}
                    <div className="absolute bottom-8 left-8 right-8 p-6 backdrop-blur-md bg-black/20 rounded-2xl border border-white/10">
                        <p className="text-white text-sm font-bold uppercase tracking-[0.2em] mb-1">Premium Insight</p>
                        <p className="text-white/80 text-xs leading-relaxed italic">&quot;A must-visit for travelers seeking authentic local culture and breathtaking views.&quot;</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
