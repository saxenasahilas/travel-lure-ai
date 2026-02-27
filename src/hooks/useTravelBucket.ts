"use client";

import { useState, useEffect } from "react";
import { type Candidate } from "@/agents/state";

export type BucketItem = {
    id: string; // Unique ID (e.g., Place Name or Hotel Name)
    category: "where" | "stay" | "experience";
    title: string;
    subtitle?: string;
    data?: any; // Store full object if needed
};

export function useTravelBucket() {
    const [bucket, setBucket] = useState<BucketItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load from session storage on mount
    useEffect(() => {
        const stored = sessionStorage.getItem("travel_bucket");
        if (stored) {
            try {
                // eslint-disable-next-line
                setBucket(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse bucket", e);
            }
        }
    }, []);

    // Save to session storage on change
    useEffect(() => {
        sessionStorage.setItem("travel_bucket", JSON.stringify(bucket));
    }, [bucket]);

    const addToBucket = (item: BucketItem) => {
        if (bucket.some((i) => i.id === item.id)) return; // No duplicates
        setBucket((prev) => [...prev, item]);
        setIsOpen(true); // Auto-open to show feedback
    };

    const removeFromBucket = (id: string) => {
        setBucket((prev) => prev.filter((i) => i.id !== id));
    };

    const isInBucket = (id: string) => {
        return bucket.some((i) => i.id === id);
    };

    const toggleBucket = () => setIsOpen((prev) => !prev);

    return {
        bucket,
        addToBucket,
        removeFromBucket,
        isInBucket,
        isOpen,
        toggleBucket,
        setIsOpen
    };
}
