"use client";

import { useState, useCallback, useEffect } from "react";
import AppShell from "@/components/AppShell";
import HomeTab from "@/components/HomeTab";
import ExploreTab from "@/components/ExploreTab";
import { type Tab } from "@/components/BottomNav";
import { type ConciergeOption } from "@/components/ResultBento";
import { findClosestHub } from "@/lib/geo";
import { TRAVEL_HUBS } from "@/lib/geo";

export default function Home() {
  // State
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [dark, setDark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ConciergeOption[] | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [originName, setOriginName] = useState<string>("Detecting origin...");
  const [viaHub, setViaHub] = useState<string>("None");

  // Geolocation & Reverse Geocoding
  useEffect(() => {
    if (!navigator?.geolocation) {
      setOriginName("India"); // Default fallback if no geolocation support
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        // Auto-match to closest hub
        const closest = findClosestHub({ lat: latitude, lng: longitude });
        setViaHub(closest.name);

        // Reverse geocode via Nominatim (OpenStreetMap)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`, {
            headers: { "User-Agent": "TravelLureAI/1.0" }
          });
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state_district || data.address?.state || "Unknown";
          setOriginName(city);
        } catch (e) {
          console.error("Geocoding failed", e);
          setOriginName(prev => prev === "Detecting origin..." ? "India" : prev);
        }
      },
      () => {
        setOriginName("India");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  }, []);


  // API Call
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
          viaHub: viaHub !== "None" ? viaHub : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data?.error);
        setOptions(null);
        return;
      }

      if (data.detectedLocation?.name) {
        setOriginName(data.detectedLocation.name);
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
      originName={originName}
    >
      {activeTab === "home" && (
        <HomeTab
          options={options}
          loading={loading}
          onSubmit={submit}
          dark={dark}
          viaHub={viaHub}
          setViaHub={setViaHub}
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
