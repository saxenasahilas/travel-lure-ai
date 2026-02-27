"use client";

import { motion } from "framer-motion";
import { type Candidate } from "@/agents/state"; // We might need to export Candidate type if not already
import { useState } from "react";

// Assuming Candidate interface structure based on previous files
// To avoid strict type deps in this rapid prototype, I'll define a local shape or import it properly if accessible.
// Let's rely on loose typing for props to keep it flexible for now, or define explicitly.

type SuggestionCard = {
    name: string;
    zone: string;
    funFact: string;
};

interface PlaceSelectorProps {
    suggestions: SuggestionCard[];
    onSelectPlace: (place: string) => void;
    onManualInput: (place: string) => void;
    onSurpriseMe: () => void;
    dark: boolean;
    loading: boolean;
}

export default function PlaceSelector({ suggestions, onSelectPlace, onManualInput, onSurpriseMe, dark, loading }: PlaceSelectorProps) {
    const [manualPlace, setManualPlace] = useState("");

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualPlace.trim()) onManualInput(manualPlace.trim());
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-4 py-8">
                <h2 className={`text-5xl font-black tracking-tighter ${dark ? "text-white" : "text-slate-900"}`}>
                    Perfect matches <span className="text-blue-500">.</span>
                </h2>
                <p className={`text-xl font-medium opacity-60 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                    Curated destinations based on your travel DNA.
                </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {suggestions.map((place, i) => (
                    <motion.div
                        key={place.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        onClick={() => onSelectPlace(place.name)}
                        className={`cursor-pointer group relative overflow-hidden rounded-[2.5rem] p-8 h-72 flex flex-col justify-end
              ${dark ? "bg-white/5 hover:bg-white/10" : "bg-white/40 hover:bg-white/60"}
              shadow-2xl backdrop-blur-3xl border ${dark ? "border-white/10" : "border-slate-200/50"}
              transition-all duration-500`}
                    >
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                        <div className="relative z-10 space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 block">
                                {place.zone}
                            </span>
                            <h3 className={`text-3xl font-black tracking-tighter leading-none mb-1 ${dark ? "text-white" : "text-slate-900"}`}>
                                {place.name}
                            </h3>
                            <p className={`text-xs font-semibold leading-relaxed opacity-60 line-clamp-3 italic ${dark ? "text-slate-300" : "text-slate-600"}`}>
                                &quot;{place.funFact}&quot;
                            </p>
                        </div>

                        {/* Hover CTA icon */}
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dark ? "bg-blue-600" : "bg-slate-900"} text-white shadow-xl`}>
                                <span className="text-lg">→</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 justify-center pt-12">
                {/* Manual Input */}
                <form onSubmit={handleManualSubmit} className="relative w-full max-w-sm group">
                    <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200`}></div>
                    <div className={`relative flex items-center bg-white/10 dark:bg-black/20 backdrop-blur-xl border ${dark ? "border-white/10" : "border-slate-200"} rounded-xl`}>
                        <input
                            type="text"
                            value={manualPlace}
                            onChange={(e) => setManualPlace(e.target.value)}
                            placeholder="Type a specific destination..."
                            className={`w-full px-5 py-4 bg-transparent outline-none text-sm font-bold ${dark ? "text-white placeholder:text-slate-600" : "text-slate-900 placeholder:text-slate-400"
                                }`}
                        />
                        <button
                            type="submit"
                            className="mr-3 p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 shadow-md hover:bg-blue-500 transition-colors"
                            disabled={!manualPlace.trim()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </button>
                    </div>
                </form>

                <div className={`h-1 w-8 rounded-full ${dark ? "bg-white/5" : "bg-slate-200"}`} />

                {/* Surprise Me Button */}
                <button
                    onClick={onSurpriseMe}
                    className={`px-8 py-4 rounded-xl text-sm font-black flex items-center gap-3 transition-all shadow-xl
            bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white hover:shadow-blue-500/20 hover:scale-105 active:scale-95`}
                >
                    <span className="text-xl">✨</span>
                    Surprise Me (Smart Travel)
                </button>
            </div>
        </div>
    );
}
