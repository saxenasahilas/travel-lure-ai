"use client";

import React from 'react';
import { useTripStore } from '@/store/tripStore';
import { MapPin, Plane, Hotel, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingItinerary: React.FC = () => {
    const { selected_destinations, locked_flights, locked_hotels, budget_spent } = useTripStore();

    if (selected_destinations.length === 0 && locked_flights.length === 0 && locked_hotels.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-6 shadow-2xl w-80 max-h-[80vh] overflow-y-auto"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg tracking-tight">Live Trip Receipt</h2>
                <div className="bg-emerald-500/20 px-2 py-1 rounded text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                    Syncing
                </div>
            </div>

            <div className="space-y-6">
                {/* Destinations */}
                {selected_destinations.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">
                            <MapPin size={12} />
                            <span>Destinations</span>
                        </div>
                        <div className="space-y-2">
                            <AnimatePresence>
                                {selected_destinations.map((dest) => (
                                    <motion.div
                                        key={dest.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white/5 border border-white/5 rounded-lg p-3 text-white text-sm"
                                    >
                                        {dest.name}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Flights */}
                {locked_flights.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">
                            <Plane size={12} />
                            <span>Flights</span>
                        </div>
                        <div className="space-y-2">
                            {locked_flights.map((flight) => (
                                <div key={flight.id} className="bg-white/5 border border-white/5 rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-white text-sm font-medium">{flight.airline} {flight.flightNumber}</span>
                                        <span className="text-emerald-400 text-xs font-mono">${flight.price}</span>
                                    </div>
                                    <div className="text-white/40 text-[10px]">{flight.origin} → {flight.destination}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Hotels */}
                {locked_hotels.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest mb-3">
                            <Hotel size={12} />
                            <span>Hotels</span>
                        </div>
                        <div className="space-y-2">
                            {locked_hotels.map((hotel) => (
                                <div key={hotel.id} className="bg-white/5 border border-white/5 rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-white text-sm font-medium">{hotel.name}</span>
                                        <span className="text-emerald-400 text-xs font-mono">${hotel.pricePerNight}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Total */}
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                        <DollarSign size={12} />
                        <span>Budget Spent</span>
                    </div>
                    <motion.div
                        key={budget_spent}
                        initial={{ scale: 1.1, color: '#34d399' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        className="text-xl font-mono font-bold"
                    >
                        ${budget_spent.toLocaleString()}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
