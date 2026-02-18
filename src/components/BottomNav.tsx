"use client";

import { motion } from "framer-motion";
import { JSX } from "react";

export type Tab = "home" | "explore" | "search" | "profile";

type BottomNavProps = {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    dark: boolean;
};

export default function BottomNav({ activeTab, onTabChange, dark }: BottomNavProps) {
    const bg = dark ? "bg-[#1A1A1A] border-white/10" : "bg-white border-gray-100";
    const activeColor = "text-[#3B82F6]"; // Blue color from screenshot
    const inactiveColor = dark ? "text-white/40" : "text-gray-400";

    const navItems: { id: Tab; label: string; icon: JSX.Element }[] = [
        {
            id: "home",
            label: "Home",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            ),
        },
        {
            id: "explore",
            label: "Explore",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
            ),
        },
        {
            id: "search",
            label: "Search",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            ),
        },
        {
            id: "profile",
            label: "Profile",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            ),
        },
    ];

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-50 border-t pb-safe pt-2 px-6 ${bg} backdrop-blur-lg bg-opacity-90`}>
            <div className="flex justify-between items-center max-w-md mx-auto">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className="flex flex-col items-center gap-1 p-2 min-w-[60px]"
                    >
                        <div className={`${activeTab === item.id ? activeColor : inactiveColor} transition-colors duration-200`}>
                            {item.icon}
                        </div>
                        <span className={`text-[10px] font-sans font-medium ${activeTab === item.id ? activeColor : inactiveColor}`}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
