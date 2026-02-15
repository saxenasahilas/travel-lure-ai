"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchHub from "@/components/SearchHub";
import { type ConciergeOption } from "@/components/ResultBento";
import ResultTabs, { type SecretSource } from "@/components/ResultTabs";
import ActionBridge from "@/components/ActionBridge";

export default function Home() {
  const [whereTo, setWhereTo] = useState("");
  const [vibe, setVibe] = useState("");
  const [dark, setDark] = useState(false);
  const [options, setOptions] = useState<ConciergeOption[] | null>(null);
  const [secretSource, setSecretSource] = useState<SecretSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  const hasSearched = options !== null;
  const compact = hasSearched;

  useEffect(() => {
    if (!navigator?.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  const submit = useCallback(async () => {
    const vibeTrim = vibe.trim();
    if (!vibeTrim) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/lure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: whereTo.trim() || undefined,
          vibe: vibeTrim,
          latitude: userLocation?.lat,
          longitude: userLocation?.lng,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Request failed");
        setOptions(null);
        setSecretSource(null);
        return;
      }
      const list = data?.options ?? [];
      setOptions(Array.isArray(list) ? list : []);
      setSecretSource(data?.secretSource ?? null);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch {
      setError("Something went wrong");
      setOptions(null);
      setSecretSource(null);
    } finally {
      setLoading(false);
    }
  }, [whereTo, vibe, userLocation]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${dark ? "bg-[#1A1A1A]" : "bg-[#FAF9F6]"}`}
    >
      {/* Theme toggle */}
      <button
        type="button"
        onClick={() => setDark((d) => !d)}
        className={`fixed top-4 right-4 z-10 w-10 h-10 rounded-full border font-sans text-sm transition-colors ${
          dark ? "bg-white/10 border-white/20 text-white" : "bg-black/5 border-black/10 text-[#1A1A1A]"
        }`}
        aria-label="Toggle dark mode"
      >
        {dark ? "☀" : "◇"}
      </button>

      <div className="snap-y snap-mandatory overflow-y-auto min-h-screen">
        <section
          className={`snap-start flex flex-col ${compact ? "" : "min-h-screen snap-always"}`}
        >
          <SearchHub
            whereTo={whereTo}
            onWhereToChange={setWhereTo}
            vibe={vibe}
            onVibeChange={setVibe}
            onSubmit={submit}
            loading={loading}
            compact={compact}
            dark={dark}
          />
        </section>

        <AnimatePresence>
          {options && options.length > 0 && (
            <motion.section
              ref={resultsRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="snap-start snap-always min-h-screen py-16 px-6"
            >
              <div className="max-w-5xl mx-auto">
                <h2
                  className={`text-2xl font-serif font-medium text-center mb-8 ${
                    dark ? "text-white" : "text-[#1A1A1A]"
                  }`}
                >
                  Your 3 options
                </h2>
                <ResultTabs
                  options={options}
                  secretSource={secretSource}
                  locationName={options[0]?.name ?? ""}
                  dark={dark}
                />
                <div className="mt-12">
                  <ActionBridge
                    selectedOptionName={options[0]?.name ?? null}
                    dark={dark}
                  />
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 text-sm font-sans px-4 py-2 rounded-lg ${
            dark ? "bg-red-900/80 text-white" : "bg-red-100 text-red-800"
          }`}
        >
          {error}
        </p>
      )}
    </div>
  );
}
