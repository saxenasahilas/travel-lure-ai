"use client";

import { useState, ReactNode } from "react";
import BottomNav, { Tab } from "./BottomNav";
import { motion, AnimatePresence } from "framer-motion";

type AppShellProps = {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    children: ReactNode;
    dark: boolean;
    toggleTheme: () => void;
    originName?: string;
};

export default function AppShell({
    activeTab,
    onTabChange,
    children,
    dark,
    toggleTheme,
    originName = "Origin"
}: AppShellProps) {
    return (
        <div className={`min-h-screen flex flex-col ${dark ? "bg-[#0F172A]" : "bg-white"} transition-colors duration-300 relative`}>

            {/* Global Sticky Header */}
            <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 pointer-events-none">
                <div className="pointer-events-auto">
                    <span className={`font-extrabold tracking-tighter text-2xl ${dark ? "text-white" : "text-slate-900"} drop-shadow-sm`}>
                        TravelLure
                    </span>
                </div>

                <div className="flex items-center space-x-3 pointer-events-auto">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-full backdrop-blur-md border ${dark ? "bg-white/10 border-white/10 text-yellow-400" : "bg-black/5 border-slate-200 text-slate-700"} transition-all hover:scale-110`}
                    >
                        {dark ? "☀️" : "🌙"}
                    </button>

                    {/* Origin & User Icon */}
                    <div className={`flex items-center space-x-2 pl-3 pr-1.5 py-1.5 rounded-full backdrop-blur-md border ${dark ? "bg-black/30 border-white/10 text-white" : "bg-white/60 border-slate-200 text-slate-900"} shadow-sm`}>
                        <div className="flex flex-col items-end min-w-[60px]">
                            <span className="text-[10px] uppercase tracking-widest opacity-60 font-black leading-none mb-0.5">Origin</span>
                            <span className="text-sm font-bold truncate max-w-[120px]">{originName}</span>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dark ? "bg-white/20" : "bg-slate-200"} shadow-inner`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 opacity-80">
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
            </header>

            {/* Dynamic Content Area */}
            <main className="flex-1 pb-24 overflow-y-auto no-scrollbar relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Bottom Navigation */}
            <BottomNav activeTab={activeTab} onTabChange={onTabChange} dark={dark} />
        </div>
    );
}
