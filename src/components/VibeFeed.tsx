'use client';

import { motion } from 'framer-motion';

const SHORTS_PLACEHOLDERS = [
    { id: 'jNQXAC9IVRw', creator: 'Ronnie & Barty' },
    { id: 'kxLb4o3bJ2M', creator: 'Curly Tales' },
    { id: '2Vv-BfVoqGg', creator: 'Aakanksha Monga' },
    { id: 'ayushdinkar', creator: 'Ayush Dinkar' },
];

type VibeFeedProps = {
    locationName: string;
    dark: boolean;
};

export default function VibeFeed({ locationName, dark }: VibeFeedProps) {
    return (
        <motion.div
            key="vibe"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
        >
            <p className={`text-sm font-sans mb-4 ${dark ? 'text-white/70' : 'text-[#1A1A1A]/70'}`}>
                Shorts for {locationName || 'your spot'}
            </p>
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth">
                {SHORTS_PLACEHOLDERS.map((short, i) => (
                    <div
                        key={short.id + i}
                        className="shrink-0 w-[220px] snap-center rounded-xl overflow-hidden border bg-black/5"
                    >
                        <iframe
                            src={`https://www.youtube.com/embed/${short.id}`}
                            title={`Shorts by ${short.creator}`}
                            className="w-full aspect-[9/16] max-h-[360px]"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
