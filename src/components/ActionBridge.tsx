"use client";

import { motion } from "framer-motion";

type ActionBridgeProps = {
  selectedOptionName: string | null;
  dark: boolean;
};

const LINKS = [
  { label: "IRCTC (Trains)", href: "https://www.irctc.co.in" },
  { label: "Agoda (Stays)", href: "https://www.agoda.com" },
];

export default function ActionBridge({ selectedOptionName, dark }: ActionBridgeProps) {
  const btnClass = dark
    ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
    : "bg-[#1A1A1A] text-white border-[#1A1A1A]/20 hover:bg-[#2d2d2d]";

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="flex flex-wrap justify-center gap-3"
    >
      {LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-sans font-medium border transition-colors ${btnClass}`}
        >
          {link.label}
        </a>
      ))}
      {selectedOptionName && (
        <p className={`w-full text-center text-xs font-sans mt-2 ${dark ? "text-white/50" : "text-[#1A1A1A]/50"}`}>
          For: {selectedOptionName}
        </p>
      )}
    </motion.section>
  );
}
