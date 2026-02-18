"use client";

import { useState, useCallback, useEffect } from "react";
import AppShell from "@/components/AppShell";
import HomeTab from "@/components/HomeTab";
import ExploreTab from "@/components/ExploreTab";
import { type Tab } from "@/components/BottomNav";
import { type ConciergeOption } from "@/components/ResultBento";

export default function Home() {
  // State
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ConciergeOption[] | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Geolocation
  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => { },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  // API Call
  // Note: We are no longer using 'whereTo' from state here because HomeTab manages the input.
  // We pass this callback to HomeTab.
  const submit = useCallback(async (location: string, vibe: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/lure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: location.trim() || undefined,
          vibe: vibe.trim(),
          latitude: userLocation?.lat,
          longitude: userLocation?.lng,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Handle error gracefully (maybe toast or alert in HomeTab)
        console.error(data?.error);
        setOptions(null);
        return;
      }
      const list = data?.options ?? [];
      setOptions(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setOptions(null);
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  const toggleTheme = () => setDark(prev => !prev);

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      dark={dark}
      toggleTheme={toggleTheme}
    >
      {activeTab === "home" && (
        <HomeTab
          options={options}
          loading={loading}
          onSubmit={submit}
          dark={dark}
        />
      )}
      {activeTab === "explore" && (
        <ExploreTab dark={dark} />
      )}
      {activeTab === "search" && (
        <div className="flex items-center justify-center h-full text-gray-400">Search Coming Soon</div>
      )}
      {activeTab === "profile" && (
        <div className="flex items-center justify-center h-full text-gray-400">Profile Coming Soon</div>
      )}
    </AppShell>
  );
}
