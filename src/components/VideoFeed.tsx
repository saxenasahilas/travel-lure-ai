"use client";

import { useRef, useEffect, useState } from "react";
import { type TravelVideo } from "@/data/videoData";

type VideoFeedProps = {
    videos: TravelVideo[];
    className?: string;
};

export default function VideoFeed({ videos, className = "" }: VideoFeedProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Track visible video
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Find the index of the intersecting element
                        const index = Number(entry.target.getAttribute("data-index"));
                        setActiveIndex(index);
                    }
                });
            },
            {
                root: container,
                threshold: 0.6, // 60% visibility required to be "active"
            }
        );

        const children = container.querySelectorAll("[data-index]");
        children.forEach((child) => observer.observe(child));

        return () => observer.disconnect();
    }, [videos]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const container = containerRef.current;
            if (!container) return;

            if (e.key === "ArrowUp") {
                e.preventDefault();
                const newIndex = Math.max(0, activeIndex - 1);
                container.scrollTo({
                    top: newIndex * container.clientHeight,
                    behavior: "smooth",
                });
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                const newIndex = Math.min(videos.length - 1, activeIndex + 1);
                container.scrollTo({
                    top: newIndex * container.clientHeight,
                    behavior: "smooth",
                });
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeIndex, videos.length]);

    return (
        <div
            ref={containerRef}
            className={`w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black ${className}`}
        >
            {videos.map((video, index) => {
                const isActive = index === activeIndex;
                return (
                    <div
                        key={video.id + index}
                        data-index={index}
                        className="w-full h-full snap-center flex-shrink-0 relative bg-black flex items-center justify-center overflow-hidden"
                    >
                        {/* Wrapper to enforce 9:16 ratio if needed, or just fill container. 
                            For strict 9:16 crop on a wider container, we need to mask it. 
                            But usually 'object-cover' on iframe works or we scale the iframe. 
                            YouTube shorts embedded via /embed/ID are naturally vertical. 
                            If not, we can zoom them. */}
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Render iframe only if active or near active to save resources? 
                                Or render all but only autoplay active. */}
                            <iframe
                                src={`${video.url}?autoplay=${isActive ? 1 : 0}&mute=0&controls=0&rel=0&loop=1&playlist=${video.url.split('/').pop()}`}
                                title={video.title}
                                className="w-full h-full absolute inset-0 object-cover"
                                style={{
                                    pointerEvents: "auto", // Allow interaction if needed, or 'none' for strict feel
                                    // Make it taller to crop side bars if 16:9 player
                                    transform: "scale(1.05)"
                                }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-10 p-6 flex flex-col justify-end">
                            <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md">{video.title}</h3>
                            <p className="text-yellow-400 text-sm font-medium drop-shadow-md">{video.creator}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
