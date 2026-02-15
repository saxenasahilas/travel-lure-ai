"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ConciergeOption } from "./ResultBento";
import ResultBento from "./ResultBento";
import VibeFeed from "./VibeFeed";
import BudgetTree from "./BudgetTree";

export type SecretSource = {
  guideName: string;
  tips: string[];
  isFromGuide: boolean;
};

const TABS = [
  { id: "fixer", label: "The Fixer", subtitle: "Budget & Data" },
  { id: "secret", label: "The Secret", subtitle: "Curated" },
  { id: "vibe", label: "The Vibe", subtitle: "Shorts" },
] as const;

type TabId = (typeof TABS)[number]["id"];

type DiscoveryTabsProps = {
  options: ConciergeOption[];
  secretSource: SecretSource | null;
  locationName: string;
  dark: boolean;
};

export default function DiscoveryTabs({
  options,
  secretSource,
  locationName,
  dark,
}: DiscoveryTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("fixer");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeTab]);

  const cardBg = dark ? "bg-white/5 border-white/10" : "bg-white/90 border-black/10";
  const tabInactive = dark ? "text-white/60 hover:text-white/80" : "text-[#1A1A1A]/60 hover:text-[#1A1A1A]/80";
  const tabActive = "text-[#c2410c] font-medium border-b-2 border-[#c2410c]";

  const distance = typeof options[0]?.distanceKm === 'number' ? options[0].distanceKm : 0;

  return (
    <div className="w-full" ref={contentRef}>
      {/* Badge: Italian guide */}
      {secretSource?.isFromGuide && secretSource.tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 px-4 py-2 rounded-lg border ${dark ? "bg-[#c2410c]/10 border-[#c2410c]/30" : "bg-[#c2410c]/5 border-[#c2410c]/20"} text-center`}
        >
          <p className="text-xs font-sans uppercase tracking-wider text-[#c2410c]">
            Grounded in: &ldquo;L&apos;itinerario nelle pianure&rdquo; (Exclusive Edition)
          </p>
        </motion.div>
      )}

      {/* Tab headers */}
      <div className="flex gap-6 border-b mb-6 font-sans text-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 transition-colors ${activeTab === tab.id ? tabActive : tabInactive}`}
          >
            <span className="block">{tab.label}</span>
            <span className={`text-xs ${activeTab === tab.id ? "text-[#c2410c]/80" : "opacity-70"}`}>
              {tab.subtitle}
            </span>
          </button>
        ))}
      </div>

      {/* Tab panels with smooth height */}
      <motion.div
        layout
        transition={{ duration: 0.25 }}
        className="min-h-[280px]"
      >
        <AnimatePresence mode="wait">
          {activeTab === "fixer" && (
            <motion.div
              key="fixer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ResultBento options={options} dark={dark} budgetTree={<BudgetTree dark={dark} distanceKm={distance} />} />
            </motion.div>
          )}

          {activeTab === "secret" && (
            <motion.div
              key="secret"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`rounded-2xl border ${cardBg} backdrop-blur-sm p-6`}
            >
              {secretSource?.tips?.length ? (
                <ul className="space-y-4">
                  {secretSource.tips.map((tip, i) => (
                    <li
                      key={i}
                      className={`flex gap-3 text-sm font-sans ${dark ? "text-white/90" : "text-[#1A1A1A]/90"}`}
                    >
                      <span className="text-[#c2410c] shrink-0 font-medium">{i + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-sm font-sans ${dark ? "text-white/60" : "text-[#1A1A1A]/60"}`}>
                  No curated tips for this search. Try a specific location or vibe.
                </p>
              )}
            </motion.div>
          )}

          {activeTab === "vibe" && (
            <motion.div
              key="vibe"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
                <VibeFeed locationName={locationName} dark={dark} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}