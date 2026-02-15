"use client";

import { motion } from "framer-motion";

type SearchHubProps = {
  whereTo: string;
  onWhereToChange: (v: string) => void;
  vibe: string;
  onVibeChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  compact: boolean;
  dark: boolean;
};

export default function SearchHub({
  whereTo,
  onWhereToChange,
  vibe,
  onVibeChange,
  onSubmit,
  loading,
  compact,
  dark,
}: SearchHubProps) {
  const bg = dark ? "bg-[#1A1A1A]" : "bg-[#FAF9F6]";
  const cardBg = dark ? "bg-white/5 border-white/10" : "bg-white/80 border-black/10";
  const inputBg = dark ? "bg-white/10 border-white/20 text-white placeholder-white/50" : "bg-white border-gray-200 text-[#1A1A1A] placeholder-gray-400";
  const label = dark ? "text-white/80" : "text-[#1A1A1A]/80";

  if (compact) {
    return (
      <motion.section layout className={`${bg} transition-colors duration-300 py-4 border-b ${dark ? "border-white/10" : "border-black/10"}`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className={`rounded-xl ${cardBg} border backdrop-blur-sm p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end`}>
            <div className="flex-1 min-w-0">
              <label className={`sr-only text-xs uppercase ${label} font-sans`}>Where to?</label>
              <input
                type="text"
                placeholder="Where to?"
                value={whereTo}
                onChange={(e) => onWhereToChange(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg font-sans text-sm ${inputBg} border focus:outline-none focus:ring-2 focus:ring-[#c2410c]/50`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className={`sr-only text-xs uppercase ${label} font-sans`}>Vibe</label>
              <input
                type="text"
                placeholder="What vibe?"
                value={vibe}
                onChange={(e) => onVibeChange(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg font-sans text-sm ${inputBg} border focus:outline-none focus:ring-2 focus:ring-[#c2410c]/50`}
              />
            </div>
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading || !vibe.trim()}
              className="px-4 py-2.5 rounded-lg font-sans text-sm font-medium bg-[#c2410c] text-white hover:bg-[#9a3412] disabled:opacity-50 shrink-0"
            >
              {loading ? "…" : "Search"}
            </button>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      layout
      className={`${bg} transition-colors duration-300 min-h-[100vh] flex flex-col justify-center py-16`}
    >
      <div className="max-w-2xl mx-auto w-full px-6">
        <motion.h1
          layout
          className={`text-3xl md:text-4xl font-serif font-medium text-center mb-2 ${dark ? "text-white" : "text-[#1A1A1A]"}`}
        >
          The 1% Club
        </motion.h1>
        <p className={`text-center text-sm ${dark ? "text-white/60" : "text-[#1A1A1A]/60"} font-sans mb-10`}>
          Discover what others miss.
        </p>

        <div className={`rounded-2xl ${cardBg} border backdrop-blur-sm p-6 md:p-8 space-y-6`}>
          <div>
            <label className={`block text-xs uppercase tracking-widest ${label} font-sans mb-2`}>
              Where to?
            </label>
            <input
              type="text"
              placeholder="e.g. Rishikesh, or leave blank for National Discovery"
              value={whereTo}
              onChange={(e) => onWhereToChange(e.target.value)}
              className={`w-full px-4 py-3.5 rounded-xl font-sans text-lg ${inputBg} border focus:outline-none focus:ring-2 focus:ring-[#c2410c]/50`}
            />
          </div>
          <div>
            <label className={`block text-xs uppercase tracking-widest ${label} font-sans mb-2`}>
              What vibe are you looking for?
            </label>
            <input
              type="text"
              placeholder="e.g. Spiritual, Roadtrip, Heritage"
              value={vibe}
              onChange={(e) => onVibeChange(e.target.value)}
              className={`w-full px-4 py-3.5 rounded-xl font-sans text-lg ${inputBg} border focus:outline-none focus:ring-2 focus:ring-[#c2410c]/50`}
            />
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={loading || !vibe.trim()}
            className={`w-full py-4 rounded-xl font-semibold font-sans transition-colors bg-[#c2410c] text-white hover:bg-[#9a3412] disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Planning…" : "Plan My Escape"}
          </button>
        </div>
      </div>
    </motion.section>
  );
}
