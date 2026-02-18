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
};

export default function AppShell({ activeTab, onTabChange, children, dark, toggleTheme }: AppShellProps) {
    return (
        <div className={`min-h-screen flex flex-col ${dark ? "bg-[#0F172A]" : "bg-white"} transition-colors duration-300`}>
            {/* Dynamic Content Area */}
            <main className="flex-1 pb-24 overflow-y-auto no-scrollbar">
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

            {/* Floating Theme Toggle (Optional/Hidden for now to match screenshot clean look, but can remain accessible) */}
            <button
                onClick={toggleTheme}
                className={`fixed bottom-24 right-4 z-40 bg-black/80 text-white rounded-full p-2 shadow-lg opacity-0 hover:opacity-100 transition-opacity`}
            >
                ?
            </button>

            {/* Bottom Navigation */}
            <BottomNav activeTab={activeTab} onTabChange={onTabChange} dark={dark} />
        </div>
    );
}
