"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, ChevronDown } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface DateSelectorProps {
    onDateChange: (data: any) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ onDateChange }) => {
    const [isFlexible, setIsFlexible] = useState(false);
    const [range, setRange] = useState<DateRange | undefined>();
    const [numDays, setNumDays] = useState("3");
    const [month, setMonth] = useState("April");

    const handleApply = () => {
        if (isFlexible) {
            onDateChange({ type: "flexible", numDays, month });
        } else {
            onDateChange({ type: "exact", range });
        }
    };

    return (
        <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">When are you going?</h3>
                <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setIsFlexible(false)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!isFlexible ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
                            }`}
                    >
                        Exact Dates
                    </button>
                    <button
                        onClick={() => setIsFlexible(true)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${isFlexible ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
                            }`}
                    >
                        Flexible
                    </button>
                </div>
            </div>

            {!isFlexible ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-black/30 p-4 rounded-xl border border-white/10 cursor-pointer hover:border-white/30 transition-all">
                        <CalendarIcon className="text-white/70 w-5 h-5" />
                        <div className="flex flex-col">
                            <span className="text-white/40 text-xs uppercase tracking-wider font-bold">Duration</span>
                            <span className="text-white font-medium">
                                {range?.from ? (
                                    range.to ? (
                                        `${format(range.from, "LLL dd")} - ${format(range.to, "LLL dd")}`
                                    ) : (
                                        format(range.from, "LLL dd")
                                    )
                                ) : (
                                    "Select dates"
                                )}
                            </span>
                        </div>
                    </div>
                    <div className="bg-black/20 rounded-xl p-2 border border-white/5 flex justify-center text-white">
                        <DayPicker
                            mode="range"
                            selected={range}
                            onSelect={setRange}
                            className="text-white"
                            modifiersClassNames={{
                                selected: "bg-white text-black font-bold",
                                range_start: "rounded-l-full",
                                range_end: "rounded-r-full",
                                range_middle: "bg-white/20"
                            }}
                        />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-white/40 text-xs uppercase tracking-wider font-bold ml-1">Length</label>
                        <div className="relative group">
                            <select
                                value={numDays}
                                onChange={(e) => setNumDays(e.target.value)}
                                className="w-full bg-black/40 text-white p-4 rounded-xl border border-white/10 appearance-none focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                            >
                                <option value="2">Weekend (2 days)</option>
                                <option value="3">Long Weekend (3 days)</option>
                                <option value="4">Break (4 days)</option>
                                <option value="7">Week (7 days)</option>
                                <option value="14">Fortnight (14 days)</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-white transition-colors pointer-events-none w-5 h-5" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-white/40 text-xs uppercase tracking-wider font-bold ml-1">Month</label>
                        <div className="relative group">
                            <select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full bg-black/40 text-white p-4 rounded-xl border border-white/10 appearance-none focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                            >
                                {["March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February"].map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-white transition-colors pointer-events-none w-5 h-5" />
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={handleApply}
                className="w-full mt-6 bg-white text-black py-4 rounded-xl font-bold tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
                Set Journey Dates
            </button>
        </div>
    );
};
