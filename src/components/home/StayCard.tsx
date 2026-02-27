"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface StayCardProps {
    name: string;
    type: string;
    location: string;
    dark: boolean;
    onAddToBucket: () => void;
    isInBucket: boolean;
}

export default function StayCard({ name, type, location, dark, onAddToBucket, isInBucket }: StayCardProps) {
    const [enriched, setEnriched] = useState<{ image?: string; rating?: number; url?: string } | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch enrichment on hover or mount? Let's do on mount for the "Discovery" view to look good, 
    // but maybe limit concurrency if there are many. For now, on mount.
    useEffect(() => {
        let mounted = true;
        const fetchEnrichment = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/enrich", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ hotelName: name, location })
                });
                const data = await res.json();
                if (mounted && data && !data.error) {
                    setEnriched(data);
                }
            } catch (e) {
                console.error("Enrichment failed", e);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        // Slight delay to avoid hammering API if user quickly scrolls away? 
        // Or just fetch immediately for premium feel.
        fetchEnrichment();

        return () => { mounted = false; };
    }, [name, location]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative group overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-all
        ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-100"}
      `}
        >
            {/* Image Area */}
            <div className="h-40 bg-gray-200 relative overflow-hidden">
                {loading && (
                    <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-slate-700" />
                )}
                {!loading && enriched?.image ? (
                    <img src={enriched.image} alt={name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center ${dark ? "bg-slate-700 text-slate-500" : "bg-gray-100 text-gray-400"}`}>
                        <span className="text-xs">Hotel Preview</span>
                    </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
                    {type}
                </div>

                {/* Bucket Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onAddToBucket(); }}
                    className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md shadow-sm transition-transform hover:scale-110 active:scale-95
             ${isInBucket ? "bg-pink-500 text-white" : "bg-white/80 text-gray-400 hover:text-pink-500"}
           `}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isInBucket ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                </button>
            </div>

            {/* Info Area */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-bold text-sm line-clamp-1 ${dark ? "text-white" : "text-slate-900"}`}>{name}</h4>
                    {enriched?.rating && (
                        <span className="flex items-center gap-1 text-xs font-medium text-yellow-500">
                            ★ {enriched.rating}
                        </span>
                    )}
                </div>

                <div className="flex justify-between items-center mt-3">
                    <a
                        href={enriched?.url || `https://www.google.com/search?q=${encodeURIComponent(name + " " + location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs font-medium hover:underline ${dark ? "text-blue-400" : "text-blue-600"}`}
                    >
                        View Details &rarr;
                    </a>
                </div>
            </div>
        </motion.div>
    );
}
