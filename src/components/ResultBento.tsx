import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ConciergeOption = {
  name: string;
  zone: string;
  funFact: string;
  liveTemp: string;
  distanceKm: string | number;
  topProperties: string;
  iconicCafe: string;
  dailyBudget: string;
  majorExpenses: {
    stay: string;
    food: string;
    travel: string;
  };
  flashcards: {
    where: string;
    when: string;
    how: string;
  };
};

type ResultBentoProps = {
  options: ConciergeOption[];
  dark: boolean;
};

export default function ResultBento({ options, dark }: ResultBentoProps) {
  const cardBg = dark ? "bg-[#1E293B] border-slate-700" : "bg-white border-gray-100";
  const textColor = dark ? "text-white" : "text-[#1E293B]";
  const subTextColor = dark ? "text-slate-400" : "text-gray-500";

  // Track expanded state for each card by index
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggleExpand = (i: number) => {
    setExpanded(prev => prev === i ? null : i);
  };

  return (
    <div className="space-y-8">
      {/* 1. Destination Cards List */}
      <div className="space-y-4">
        {options.map((opt, i) => (
          <motion.article
            key={opt.name + i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`overflow-hidden rounded-2xl border shadow-sm transition-all ${cardBg} ${expanded === i ? "ring-2 ring-blue-500/20" : ""}`}
            onClick={() => toggleExpand(i)}
          >
            {/* Main Card Content */}
            <div className="flex items-start gap-4 p-4 cursor-pointer">
              {/* Thumbnail Placeholder */}
              <div className="w-16 h-16 rounded-xl bg-gray-200 shrink-0 overflow-hidden relative">
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100" />
                {/* Chevron indicator */}
                <div className={`absolute bottom-0 right-0 p-1 bg-white/80 rounded-tl-lg transition-transform duration-300 ${expanded === i ? "rotate-180" : ""}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="m6 9 6 6 6-6" /></svg>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className={`font-semibold text-base truncate ${textColor}`}>{opt.name}</h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${dark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                    {opt.zone}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-md ${dark ? "bg-blue-900/30 text-blue-300" : "bg-blue-50 text-blue-600"}`}>
                    {opt.liveTemp}
                  </span>
                  <span className={subTextColor}>
                    Running: ₹{opt.dailyBudget}
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded Details (Just Stats now, Flashcards moved out) */}
            <AnimatePresence>
              {expanded === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className={`px-4 pb-4 pt-0 border-t border-dashed ${dark ? "border-slate-700" : "border-gray-100"}`}>
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                      <div className={`p-2 rounded-lg ${dark ? "bg-slate-800/50" : "bg-gray-50"}`}>
                        <span className="block text-[10px] uppercase text-gray-400 font-bold tracking-wider">Distance</span>
                        <span className={`text-sm font-medium ${textColor}`}>{typeof opt.distanceKm === "number" ? `${opt.distanceKm} km` : opt.distanceKm}</span>
                      </div>
                      <div className={`p-2 rounded-lg ${dark ? "bg-slate-800/50" : "bg-gray-50"}`}>
                        <span className="block text-[10px] uppercase text-gray-400 font-bold tracking-wider">Top Stay</span>
                        <span className={`text-sm font-medium ${textColor} truncate`}>{opt.topProperties}</span>
                      </div>
                      <div className={`p-2 rounded-lg ${dark ? "bg-slate-800/50" : "bg-gray-50"} col-span-2`}>
                        <span className="block text-[10px] uppercase text-gray-400 font-bold tracking-wider">Fun Fact</span>
                        <span className={`text-sm italic ${subTextColor}`}>{opt.funFact}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.article>
        ))}
      </div>

      {/* 2. Global Flashcards Section */}
      <div>
        <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ml-1 ${subTextColor}`}>Travel Hacks & Insights</h4>
        <div className="grid grid-cols-3 gap-3 h-40">
          <GlobalFlashcard
            type="where"
            theme="red"
            icon="📍"
            items={options.map(o => ({ title: o.name, content: o.flashcards.where }))}
            dark={dark}
          />
          <GlobalFlashcard
            type="when"
            theme="blue"
            icon="📅"
            items={options.map(o => ({ title: o.name, content: o.flashcards.when }))}
            dark={dark}
          />
          <GlobalFlashcard
            type="how"
            theme="yellow"
            icon="🛵"
            items={options.map(o => ({ title: o.name, content: o.flashcards.how }))}
            dark={dark}
          />
        </div>
      </div>
    </div>
  );
}

// Helper for Global Flashcard
function GlobalFlashcard({
  type,
  theme,
  icon,
  items,
  dark
}: {
  type: string;
  theme: "red" | "blue" | "yellow";
  icon: string;
  items: { title: string; content: string }[];
  dark: boolean;
}) {
  const [flipped, setFlipped] = useState(false);

  // Theme Styles
  const styles = {
    red: {
      front: "bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-200/50 text-red-600",
      back: "bg-red-50/90 border-red-100",
      text: "text-red-900"
    },
    blue: {
      front: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200/50 text-blue-600",
      back: "bg-blue-50/90 border-blue-100",
      text: "text-blue-900"
    },
    yellow: {
      front: "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-200/50 text-yellow-600",
      back: "bg-yellow-50/90 border-yellow-100",
      text: "text-yellow-900"
    }
  };

  const currentStyle = styles[theme];

  return (
    <div
      className="w-full h-full cursor-pointer perspective-1000 group"
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        className="relative w-full h-full transition-all duration-500 transform-style-3d"
        animate={{ rotateY: flipped ? 180 : 0 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 backface-hidden rounded-2xl p-2 flex flex-col items-center justify-center text-center shadow-sm border backdrop-blur-sm ${currentStyle.front}`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-2xl mb-1">{icon}</span>
          <span className={`font-cursive text-xl font-bold ${currentStyle.text}`}>{type.charAt(0).toUpperCase() + type.slice(1)}?</span>
          <span className="text-[9px] mt-2 uppercase tracking-widest font-bold opacity-60">Tap</span>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 backface-hidden rounded-2xl p-2 shadow-sm border overflow-y-auto no-scrollbar ${currentStyle.back} ${dark ? "!bg-slate-800 !border-slate-700 !text-gray-200" : ""}`}
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
        >
          <div className="space-y-8">
            {items.map((item, idx) => (
              <div key={idx} className="text-left pb-2 last:pb-0">
                <p className={`text-[10px] leading-tight ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  {item.content || "N/A"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
