"use client";

import { motion } from "framer-motion";

export type ConciergeOption = {
  name: string;
  zone: string;
  funFact: string;
  liveTemp: string;
  distanceKm: string | number;
  topHostel: string;
  iconicCafe: string;
};

type ResultBentoProps = {
  options: ConciergeOption[];
  dark: boolean;
};

export default function ResultBento({ options, dark }: ResultBentoProps) {
  const cardBg = dark ? "bg-white/5 border-white/10" : "bg-white/90 border-black/10";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {options.map((opt, i) => (
        <motion.article
          key={opt.name + i}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          className={`rounded-2xl border ${cardBg} backdrop-blur-sm overflow-hidden`}
        >
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`text-lg font-serif font-semibold ${dark ? "text-white" : "text-[#1A1A1A]"}`}>
                {opt.name}
              </h3>
              <span className="shrink-0 text-xs font-sans font-medium px-2 py-1 rounded-md bg-[#c2410c]/15 text-[#c2410c]">
                {opt.zone}
              </span>
            </div>

            <div className={`grid gap-2 text-sm font-sans ${dark ? "text-white/80" : "text-[#1A1A1A]/80"}`}>
              <div className="flex items-center gap-2">
                <span className="text-[#c2410c] font-medium">Temp</span>
                <span>{opt.liveTemp}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#c2410c] font-medium">Distance</span>
                <span>{typeof opt.distanceKm === "number" ? `${opt.distanceKm} km` : opt.distanceKm}</span>
              </div>
              <div>
                <span className="text-[#c2410c] font-medium block mb-0.5">Hostel</span>
                <span>{opt.topHostel}</span>
              </div>
              <div>
                <span className="text-[#c2410c] font-medium block mb-0.5">Cafe</span>
                <span>{opt.iconicCafe}</span>
              </div>
            </div>

            <p className={`text-xs font-sans border-t pt-3 ${dark ? "border-white/10 text-white/60" : "border-black/10 text-[#1A1A1A]/60"}`}>
              <span className={`font-medium ${dark ? "text-[#c2410c]" : "text-[#c2410c]"}`}>Fun fact: </span>
              {opt.funFact}
            </p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
