"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTravelBucket, BucketItem } from "@/hooks/useTravelBucket";

interface TravelBucketProps {
    dark: boolean;
    bucket: ReturnType<typeof useTravelBucket>; // Pass hook result to share state
}

export default function TravelBucket({ dark, bucket }: TravelBucketProps) {
    const { bucket: items, isOpen, toggleBucket, removeFromBucket } = bucket;

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={toggleBucket}
                className={`fixed top-24 right-4 z-40 p-3 rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95
          ${dark ? "bg-slate-800 text-white" : "bg-white text-slate-900"}
        `}
            >
                <div className="relative">
                    <span className="text-xl">🧳</span>
                    {items.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {items.length}
                        </span>
                    )}
                </div>
            </button>

            {/* Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleBucket}
                            className="fixed inset-0 bg-black z-40"
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className={`fixed top-0 right-0 bottom-0 w-80 z-50 shadow-2xl overflow-y-auto
                ${dark ? "bg-slate-900 border-l border-slate-700" : "bg-white border-l border-gray-100"}
              `}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className={`text-xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>Your Travel Bucket</h2>
                                    <button onClick={toggleBucket} className="text-gray-400 hover:text-gray-600">✕</button>
                                </div>

                                {items.length === 0 ? (
                                    <div className="text-center py-10 opacity-50">
                                        <p className="text-4xl mb-2">🤷‍♂️</p>
                                        <p className="text-sm">Your bucket is empty.</p>
                                        <p className="text-xs mt-1">Add stays or places to save them!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Group by category */}
                                        {["stay", "experience", "where"].map((cat) => {
                                            const catItems = items.filter(i => i.category === cat);
                                            if (catItems.length === 0) return null;
                                            return (
                                                <div key={cat}>
                                                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-50 mb-3">{cat === "where" ? "Destinations" : cat === "stay" ? "Stays" : "Experiences"}</h3>
                                                    <div className="space-y-3">
                                                        {catItems.map(item => (
                                                            <div key={item.id} className={`p-3 rounded-lg border flex gap-3 relative group ${dark ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-100"}`}>
                                                                {/* Delete Button */}
                                                                <button
                                                                    onClick={() => removeFromBucket(item.id)}
                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                                </button>

                                                                <div className={`w-10 h-10 rounded-md shrink-0 flex items-center justify-center text-lg ${dark ? "bg-slate-700" : "bg-white"}`}>
                                                                    {cat === "stay" ? "🏨" : cat === "where" ? "📍" : "✨"}
                                                                </div>
                                                                <div>
                                                                    <h4 className={`text-sm font-semibold line-clamp-1 ${dark ? "text-white" : "text-slate-900"}`}>{item.title}</h4>
                                                                    <p className="text-xs opacity-60 line-clamp-1">{item.subtitle}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
