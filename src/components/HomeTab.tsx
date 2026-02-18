"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type ConciergeOption } from "@/components/ResultBento";
import ResultBento from "@/components/ResultBento";

type HomeTabProps = {
    options: ConciergeOption[] | null;
    loading: boolean;
    onSubmit: (location: string, vibe: string) => void;
    dark: boolean;
};

export default function HomeTab({ options, loading, onSubmit, dark }: HomeTabProps) {
    const [inputValue, setInputValue] = useState("");
    const [showVibeSelector, setShowVibeSelector] = useState(false);
    const [selectedVibe, setSelectedVibe] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const bgColor = dark ? "bg-[#0F172A]" : "bg-white";
    const textColor = dark ? "text-white" : "text-[#1E293B]";
    const subTextColor = dark ? "text-slate-400" : "text-[#64748B]";
    const inputBg = dark ? "bg-[#1E293B]" : "bg-white";
    const borderColor = dark ? "border-slate-700" : "border-gray-200";

    const handleSend = () => {
        if (!inputValue.trim()) return;
        if (!selectedVibe) {
            setShowVibeSelector(true);
            return;
        }
        onSubmit(inputValue, selectedVibe);
        setInputValue("");
        setSelectedVibe("");
        setShowVibeSelector(false);
    };

    const handleVibeSelect = (vibe: string) => {
        setSelectedVibe(vibe);
        onSubmit(inputValue, vibe);
        // Keep input for now or clear it? Cleared in handleSend but this bypasses it.
        // Actually let's just trigger submit
        setInputValue("");
        setShowVibeSelector(false);
    };

    const vibes = ["Chill", "Adventure", "Romantic", "Party", "Cultural", "Luxury"];

    return (
        <div className="flex flex-col h-full relative">
            {/* Header */}
            <header className={`pt-12 pb-4 px-6 sticky top-0 z-30 ${bgColor} bg-opacity-95 backdrop-blur-sm border-b ${borderColor}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                        </span>
                        <h1 className={`text-xl font-bold ${textColor}`}>AI Travel Planner</h1>
                    </div>
                </div>
                <p className={`text-sm ${subTextColor}`}>Let's plan your perfect journey together</p>

                <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar pb-2">
                    {["Destinations", "Plan Trip", "Group Travel"].map((tab, i) => (
                        <button
                            key={tab}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${i === 0 ? "bg-blue-100 text-blue-600" : i === 1 ? "bg-purple-100 text-purple-600" : "bg-green-100 text-green-600"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto px-4 pt-6 pb-32" ref={scrollRef}>
                <div className="space-y-6">
                    {/* Assistant Greeting */}
                    <div className={`p-4 rounded-2xl rounded-tl-none ${dark ? "bg-[#1E293B]" : "bg-gray-100"} max-w-[85%]`}>
                        <p className={`text-sm ${textColor}`}>
                            Hi! I'm your AI travel assistant. Where would you like to go?
                        </p>
                    </div>

                    {/* Results Stream */}
                    <AnimatePresence>
                        {/* Loading State */}
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`p-4 rounded-2xl rounded-tr-none ml-auto ${dark ? "bg-blue-900/30" : "bg-blue-50"} max-w-[85%]`}
                            >
                                <div className="flex gap-2">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                                </div>
                            </motion.div>
                        )}

                        {/* Results */}
                        {options && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className={`font-semibold ${subTextColor} text-sm uppercase tracking-wider`}>Top Recommendations</h3>
                                </div>
                                <ResultBento options={options} dark={dark} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Helper to scroll to bottom */}
                    <div className="h-4" />
                </div>
            </div>

            {/* Input Area (Fixed Bottom) */}
            <div className={`fixed bottom-[80px] left-0 right-0 p-4 ${bgColor} border-t ${borderColor}`}>
                <div className={`relative max-w-md mx-auto`}>
                    <AnimatePresence>
                        {showVibeSelector && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className={`absolute bottom-full mb-4 left-0 right-0 p-4 rounded-2xl shadow-xl border ${dark ? "bg-[#1E293B] border-slate-700" : "bg-white border-gray-100"}`}
                            >
                                <p className={`text-xs font-semibold mb-3 ${subTextColor} uppercase`}>Select a Vibe</p>
                                <div className="flex flex-wrap gap-2">
                                    {vibes.map(v => (
                                        <button
                                            key={v}
                                            onClick={() => handleVibeSelect(v)}
                                            className={`px-3 py-1.5 rounded-full text-sm border ${dark ? "border-slate-600 hover:bg-slate-700" : "border-gray-200 hover:bg-gray-50"} transition-colors ${textColor}`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={`flex items-center gap-2 p-2 rounded-full border shadow-sm ${inputBg} ${borderColor}`}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Where do you want to go?"
                            className={`flex-1 px-4 py-2 bg-transparent outline-none text-sm ${textColor} placeholder:text-gray-400`}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                            className={`p-2 rounded-full transition-colors ${inputValue.trim() ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-400"}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
