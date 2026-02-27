"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface BackgroundManagerProps {
    query: string; // The place name or vibe to search for
    dark: boolean;
}

export default function BackgroundManager({ query, dark }: BackgroundManagerProps) {
    const [currentImage, setCurrentImage] = useState<string | null>(null);

    useEffect(() => {
        if (!query) return;

        const fetchImage = async () => {
            try {
                const res = await fetch("/api/images", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: `${query} aesthetic travel photography wallpaper 4k` }),
                });
                const data = await res.json();
                if (data.images && data.images.length > 0) {
                    // Pick a random one from the top 3 to keep it fresh
                    const randomImg = data.images[Math.floor(Math.random() * Math.min(data.images.length, 3))];
                    if (typeof randomImg === 'string') setCurrentImage(randomImg);
                    else if (randomImg.url) setCurrentImage(randomImg.url);
                }
            } catch (e) {
                console.error("Failed to load background", e);
            }
        };

        // Debounce slightly to avoid rapid switching
        const timeout = setTimeout(fetchImage, 500);
        return () => clearTimeout(timeout);
    }, [query]);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Base Layer */}
            <div className={`absolute inset-0 transition-colors duration-1000 ${dark ? "bg-[#0F172A]" : "bg-gray-50"}`} />

            {/* Image Layer */}
            <AnimatePresence mode="wait">
                {currentImage && (
                    <motion.div
                        key={currentImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }} // Keep it subtle so text is readable
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${currentImage})` }}
                    />
                )}
            </AnimatePresence>

            {/* Gradient Overlay for Readability */}
            <div className={`absolute inset-0 bg-gradient-to-b ${dark ? "from-[#0F172A]/80 via-[#0F172A]/50 to-[#0F172A]" : "from-white/80 via-white/50 to-white"} transition-colors duration-1000`} />
        </div>
    );
}
