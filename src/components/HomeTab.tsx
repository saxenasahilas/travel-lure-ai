"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type ConciergeOption } from "@/components/ResultBento";
import ResultBento from "@/components/ResultBento";
import BackgroundManager from "@/components/home/BackgroundManager";
import PlaceSelector from "@/components/home/PlaceSelector";
import DiscoveryView from "@/components/home/DiscoveryView";
import BookingBubbles from "@/components/home/BookingBubbles";
import TravelBucket from "@/components/home/TravelBucket";
import { useTravelBucket } from "@/hooks/useTravelBucket";
import VideoFeed from "@/components/VideoFeed";
import { type TravelVideo, getRandomVideos } from "@/data/videoData";
import Link from "next/link";

import { type Candidate, type CategorizedDestinations, type DestinationDetail } from "@/agents/state";
import { TRAVEL_HUBS } from "@/lib/geo";

type HomeTabProps = {
    options: ConciergeOption[] | null;
    loading: boolean;
    onSubmit: (location: string, vibe: string) => void;
    dark: boolean;
    viaHub: string;
    setViaHub: (hub: string) => void;
};

// Steps: "vibe" -> "suggestions" -> "result" (or "discovery")
type Step = "vibe" | "suggestions" | "result" | "discovery";

export default function HomeTab({ options, loading, onSubmit, dark, viaHub, setViaHub }: HomeTabProps) {
    const [step, setStep] = useState<Step>("vibe");
    const [currentVibe, setCurrentVibe] = useState("");
    const [suggestions, setSuggestions] = useState<Candidate[]>([]); // Restore matchmaker results
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [hubSuggestions, setHubSuggestions] = useState<CategorizedDestinations | null>(null);
    const [selectedHubPlace, setSelectedHubPlace] = useState<string>("");

    // Randomize video feed on mount to keep it fresh
    const [videos, setVideos] = useState<TravelVideo[]>([]);
    useEffect(() => {
        setVideos(getRandomVideos(10));
    }, []);

    // For background manager
    const [activeQuery, setActiveQuery] = useState("Travel aesthetic");

    // Fetch Hub Suggestions when VIA HUB changes
    useEffect(() => {
        if (viaHub && viaHub !== "None") {
            fetch(`/api/suggestions?hub=${encodeURIComponent(viaHub)}`)
                .then(res => res.json())
                .then(data => {
                    setHubSuggestions(data);
                })
                .catch(err => console.error("Failed to fetch hub suggestions", err));
        } else {
            setHubSuggestions(null);
        }
    }, [viaHub]);

    // Hook for bucket
    const bucket = useTravelBucket();

    // Step 1: Handle Vibe
    const handleVibeSelect = async (vibe: string) => {
        setCurrentVibe(vibe);
        setActiveQuery(vibe + " scenery");
        setLoadingSuggestions(true);
        setStep("suggestions"); // Optimistic update

        // Call API purely for matchmaker suggestions first
        try {
            const res = await fetch("/api/lure", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    location: selectedHubPlace || "",
                    vibe: vibe,
                    viaHub: viaHub !== "None" ? viaHub : undefined
                })
            });
            const data = await res.json();
            if (data.options) {
                setSuggestions(data.options);
            }
        } catch (e) {
            console.error("Failed to get suggestions", e);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    // Step 2a: Manual Place Input
    const handleManualPlace = (place: string) => {
        setActiveQuery(place);
        setStep("result");
        onSubmit(place, currentVibe); // Triggers loading in parent
    };

    // Step 2b: Select a suggestion
    const handleSelectSuggestion = (placeName: string, defaultVibe?: string) => {
        setActiveQuery(placeName);
        setStep("result");
        onSubmit(placeName, currentVibe || defaultVibe || "general explore");
    };

    // New: Handle direct search from Hero
    const handleHeroSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const query = formData.get("search") as string;
        if (query.trim()) {
            handleManualPlace(query.trim());
        }
    };

    // Step 2c: Surprise Me (Discovery)
    const handleSurpriseMe = () => {
        if (suggestions.length > 0 && suggestions[0].name) {
            setActiveQuery(suggestions[0].name);
        }
        setStep("discovery");
    };

    const handleBack = () => {
        setStep("vibe");
        setSuggestions([]);
        setActiveQuery("Travel aesthetic");
    };

    return (
        <div className="relative min-h-full flex flex-col">
            {/* Dynamic Background */}
            <BackgroundManager query={activeQuery} dark={dark} />

            {/* Travel Bucket */}
            <TravelBucket dark={dark} bucket={bucket} />

            {/* Content Container */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-4 py-8 md:px-8 overflow-y-auto">

                {/* Header / Nav Area (Restart button only - logo and origin are in AppShell) */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-end items-center z-50 pointer-events-none">
                    {step !== "vibe" && (
                        <button onClick={handleBack} className={`pointer-events-auto text-sm font-semibold transition-colors mt-14 mr-4 py-1.5 px-3 rounded-full backdrop-blur-md border ${dark ? "text-slate-300 hover:text-white bg-black/20 border-white/10" : "text-slate-600 hover:text-slate-900 bg-white/50 border-slate-200"}`}>
                            Restart
                        </button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Hero Section (Prominent Search & Hubs) */}
                    {step === "vibe" && (
                        <motion.div
                            key="hero"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full max-w-4xl mx-auto space-y-16"
                        >
                            {/* Hero Content */}
                            <div className="text-center space-y-6 pt-12">
                                <motion.h1
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`text-6xl md:text-8xl font-black tracking-tighter ${dark ? "text-white" : "text-slate-900"}`}
                                >
                                    Where to <span className="text-blue-500 italic">next?</span>
                                </motion.h1>
                                <p className={`text-xl md:text-2xl font-medium ${dark ? "text-slate-400" : "text-slate-600"} max-w-2xl mx-auto`}>
                                    Escape the ordinary. Explore hidden gems and curated escapes tailored for your vibe.
                                </p>
                            </div>

                            {/* Prominent Search Bar */}
                            <form onSubmit={handleHeroSearch} className="relative max-w-2xl mx-auto group">
                                <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200`}></div>
                                <div className={`relative flex items-center p-2 rounded-2xl border backdrop-blur-2xl transition-all ${dark ? "bg-black/40 border-white/10 shadow-2xl" : "bg-white/60 border-slate-200 shadow-xl"
                                    }`}>
                                    <div className="pl-6 text-2xl">🔍</div>
                                    <input
                                        name="search"
                                        type="text"
                                        placeholder="Type a destination (e.g. 'Rishikesh' or 'Bali')..."
                                        className={`flex-1 bg-transparent border-none outline-none px-4 py-4 text-xl font-medium ${dark ? "text-white placeholder:text-slate-500" : "text-slate-900 placeholder:text-slate-400"
                                            }`}
                                    />
                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                                    >
                                        Explore
                                    </button>
                                </div>
                            </form>

                            {/* Hub Selection Area */}
                            <div className="space-y-8">
                                <div className="flex flex-col items-center gap-4">
                                    <label className={`text-xs font-black uppercase tracking-[0.3em] ${dark ? "text-slate-500" : "text-slate-400"}`}>
                                        Or Quick Escape via
                                    </label>

                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
                                        {TRAVEL_HUBS.map((hub) => (
                                            <motion.div
                                                key={hub.name}
                                                whileHover={{ y: -5, scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setViaHub(hub.name)}
                                                className={`p-1 rounded-2xl cursor-pointer transition-all border-2 group ${viaHub === hub.name ? "border-blue-500 ring-4 ring-blue-500/10" : "border-transparent"
                                                    }`}
                                            >
                                                <div className={`h-28 rounded-xl flex flex-col items-center justify-center gap-2 overflow-hidden relative backdrop-blur-md transition-all ${dark ? "bg-white/5 hover:bg-white/10" : "bg-white/50 hover:bg-white/80"
                                                    }`}>
                                                    <span className={`text-3xl filter transition-transform group-hover:scale-110 duration-300`}>
                                                        {hub.name === "Delhi NCR" ? "🕌" :
                                                            hub.name === "Mumbai" ? "🌊" :
                                                                hub.name === "Pune" ? "🏔️" :
                                                                    hub.name === "BLR" ? "🌳" : "🛕"}
                                                    </span>
                                                    <span className={`font-bold text-xs tracking-wider ${dark ? "text-white" : "text-slate-900"}`}>
                                                        {hub.name}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {hubSuggestions && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="w-full space-y-12 pt-8"
                                    >
                                        {/* Weekend Getaways */}
                                        {hubSuggestions?.categories?.weekend_getaways && hubSuggestions.categories.weekend_getaways.length > 0 && (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between px-2">
                                                    <h3 className={`font-black text-2xl tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
                                                        Quick Escapes <span className="text-blue-500">.</span>
                                                    </h3>
                                                    <span className="text-xs font-bold uppercase tracking-widest opacity-40">Weekend Getaways</span>
                                                </div>
                                                <div className="flex overflow-x-auto pb-6 gap-6 no-scrollbar snap-x">
                                                    {hubSuggestions.categories.weekend_getaways.map((dest, idx) => (
                                                        <DestinationCard key={idx} dest={dest} dark={dark} onSelect={(name) => handleSelectSuggestion(name, "weekend getaway")} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Remote Workations */}
                                        {hubSuggestions?.categories?.remote_workations && hubSuggestions.categories.remote_workations.length > 0 && (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between px-2">
                                                    <h3 className={`font-black text-2xl tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
                                                        Work from Paradise <span className="text-blue-500">.</span>
                                                    </h3>
                                                    <span className="text-xs font-bold uppercase tracking-widest opacity-40">Workations</span>
                                                </div>
                                                <div className="flex overflow-x-auto pb-6 gap-6 no-scrollbar snap-x">
                                                    {hubSuggestions.categories.remote_workations.map((dest, idx) => (
                                                        <DestinationCard key={idx} dest={dest} dark={dark} onSelect={(name) => handleSelectSuggestion(name, "workation")} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Suggestions / Place Selector */}
                    {step === "suggestions" && (
                        <motion.div
                            key="suggestions"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full"
                        >
                            {loadingSuggestions ? (
                                <div className="flex flex-col items-center justify-center w-full h-full p-4">
                                    <div className="relative w-full aspect-[9/16] max-h-[55vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
                                        <VideoFeed videos={videos} className="w-full h-full" />
                                        {/* Optional gradient overlay for better text contrast if we had text on top, but we don't now */}
                                        <div className="absolute inset-0 ring-1 ring-white/10 rounded-3xl pointer-events-none" />
                                    </div>
                                    <div className="mt-8 text-center space-y-2 animate-pulse bg-black/20 backdrop-blur-sm p-4 rounded-2xl inline-block">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent mb-2"></div>
                                        <p className="text-white font-bold text-xl tracking-tight drop-shadow-sm">Curating your vibe...</p>
                                        <p className="text-white/80 text-sm font-medium drop-shadow-sm">Finding the perfect spots for you</p>
                                    </div>
                                </div>
                            ) : (
                                <PlaceSelector
                                    suggestions={suggestions.map(s => ({
                                        name: s.name || "Unknown Place",
                                        zone: s.zone || "Unknown Zone",
                                        funFact: s.funFact || "No fun fact available"
                                    }))}
                                    onSelectPlace={handleSelectSuggestion}
                                    onManualInput={handleManualPlace}
                                    onSurpriseMe={handleSurpriseMe}
                                    dark={dark}
                                    loading={loading}
                                />
                            )}
                        </motion.div>
                    )}

                    {/* Step 3: Result View (Full Plan) */}
                    {step === "result" && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full max-w-5xl mx-auto"
                        >
                            {loading ? (
                                <div className="flex flex-col items-center justify-center w-full h-screen p-4 -mt-20"> {/* -mt-20 to pull it up into the centering context */}
                                    <div className="relative w-full aspect-[9/16] max-h-[60vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
                                        <VideoFeed videos={videos} className="w-full h-full" />
                                        <div className="absolute inset-0 ring-1 ring-white/10 rounded-3xl pointer-events-none" />
                                    </div>
                                    <div className="mt-8 text-center space-y-2 animate-pulse bg-black/20 backdrop-blur-sm p-4 rounded-2xl inline-block">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent mb-2"></div>
                                        <p className="text-white font-bold text-xl tracking-tight drop-shadow-sm">Curating your dream trip...</p>
                                        <p className="text-white/80 text-sm font-medium drop-shadow-sm">Enjoy some travel inspo while we work!</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20">
                                    <ResultBento options={options || []} dark={dark} />
                                    {options && options.length > 0 && (
                                        <div className="mt-8 flex justify-center">
                                            <div className={`p-6 rounded-2xl ${dark ? "bg-slate-800" : "bg-white"} shadow-xl`}>
                                                <h3 className={`text-center font-bold mb-4 ${dark ? "text-white" : "text-slate-900"}`}>Ready to go?</h3>
                                                <BookingBubbles location={options[0].name} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 3b: Discovery View (Surprise Me) */}
                    {step === "discovery" && (
                        <motion.div
                            key="discovery"
                            className="w-full py-10"
                        >
                            <DiscoveryView
                                candidates={suggestions}
                                onBack={() => setStep("suggestions")}
                                dark={dark}
                                bucket={bucket}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function DestinationCard({ dest, dark, onSelect }: { dest: DestinationDetail, dark: boolean, onSelect: (name: string) => void }) {
    const isCrowded = dest.crowd_warning?.toLowerCase().includes("crowded") || false;

    return (
        <Link href={`/planner/${dest.name.toLowerCase().replace(/\s+/g, '-')}`} className="no-underline snap-start">
            <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className={`min-w-[300px] md:min-w-[340px] p-6 rounded-[2.5rem] border transition-all relative overflow-hidden group cursor-pointer backdrop-blur-xl ${dark
                        ? "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                        : "bg-white/40 border-slate-200/50 hover:border-slate-300 hover:bg-white/60 shadow-xl shadow-slate-200/10"
                    }`}
            >
                {/* Vibe Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {dest.vibe_tags.slice(0, 2).map((tag, i) => (
                        <span
                            key={i}
                            className={`text-[9px] uppercase tracking-[0.2em] font-black px-3 py-1 rounded-full ${dark
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/10"
                                    : "bg-blue-50 text-blue-600 border border-blue-100/50"
                                }`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="space-y-1 mb-4">
                    <h4 className={`text-2xl font-black leading-none tracking-tighter ${dark ? "text-white" : "text-slate-900"}`}>
                        {dest.name}
                    </h4>
                    <p className={`text-sm font-medium tracking-tight opacity-50 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                        {dest.transit_corridor}
                    </p>
                </div>

                {/* Insight */}
                <div className="mt-6 pt-6 border-t border-dashed border-black/5 dark:border-white/5">
                    <p className={`text-xs font-semibold leading-relaxed opacity-60 italic ${dark ? "text-slate-300" : "text-slate-600"}`}>
                        &quot;Best for {dest.target_demographic.slice(0, 2).join(" & ")}&quot;
                    </p>

                    {dest.crowd_warning && (
                        <div className={`mt-3 p-2.5 rounded-2xl text-[10px] font-black flex items-center gap-2 tracking-wide uppercase ${isCrowded
                                ? (dark ? "bg-red-500/10 text-red-300" : "bg-red-50 text-red-600")
                                : (dark ? "bg-cyan-500/10 text-cyan-300" : "bg-cyan-50 text-cyan-600")
                            }`}>
                            <span className="text-xs">{isCrowded ? "⚠️" : "✨"}</span>
                            {dest.crowd_warning}
                        </div>
                    )}
                </div>

                {/* Arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${dark ? "bg-blue-600 text-white" : "bg-slate-900 text-white"}`}>
                        <span className="text-lg">→</span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
