'use client';

import { motion } from 'framer-motion';

const TRANSIT_RATE_PER_KM = 6;
const STAY_COST = 1200;
const TOTAL_BUDGET = 5000;

type BudgetTreeProps = {
    dark: boolean;
    distanceKm: number;
};

export default function BudgetTree({ dark, distanceKm }: BudgetTreeProps) {
    const cardBg = dark ? 'bg-white/5 border-white/10' : 'bg-white/90 border-black/10';

    const transitCost = Math.round(distanceKm * TRANSIT_RATE_PER_KM);
    const liquidLeft = TOTAL_BUDGET - transitCost - STAY_COST;

    const budgetNodes = [
        { id: 'origin', label: 'Origin', value: 'Bareilly' },
        { id: 'transit', label: 'Transit (Rail/Bus)', value: `₹${transitCost}` },
        { id: 'stay', label: 'Stay (Livelihood)', value: `₹${STAY_COST}` },
        { id: 'liquid', label: 'Liquid Left', value: `₹${liquidLeft}` },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className={`rounded-2xl border ${cardBg} backdrop-blur-sm p-6`}
        >
            <h3 className={`text-lg font-serif font-semibold mb-4 ${dark ? 'text-white' : 'text-[#1A1A1A]'}`}>
                Budget Tree
            </h3>
            <ul className="space-y-3">
                {budgetNodes.map((node, i) => (
                    <li
                        key={node.id}
                        className={`flex justify-between items-center text-sm font-sans ${
                            dark ? 'text-white/90' : 'text-[#1A1A1A]/90'
                        }`}
                    >
                        <span>{node.label}</span>
                        <span
                            className={`font-medium ${
                                i === budgetNodes.length - 1 ? (dark ? 'text-green-400' : 'text-green-600') : ''
                            }`}
                        >
                            {node.value}
                        </span>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}
