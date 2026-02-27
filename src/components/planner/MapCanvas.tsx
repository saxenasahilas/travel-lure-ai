"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTripStore } from "@/store/tripStore";

interface MapCanvasProps {
    center: { lat: number; lng: number };
    zoom?: number;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({ center, zoom = 12 }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const { selected_destinations, locked_hotels, mapCenter } = useTripStore();
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current) return;

        mapboxgl.accessToken = token || 'pk.eyJ1Ijoic2FoaWxzYXhlbmEiLCJhIjoiY203b2Q5eXpjMGVxejJscG1ocWFyeGlnOCJ9.PLACEHOLDER'; // Fallback or placeholder

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/dark-v11", // Premium dark style
            center: [mapCenter.lng || center.lng, mapCenter.lat || center.lat],
            zoom: zoom,
            attributionControl: false,
        });

        map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
        mapRef.current = map;

        return () => {
            map.remove();
        };
    }, []);

    // Handle Center Changes
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.easeTo({
                center: [mapCenter.lng, mapCenter.lat],
                duration: 1000
            });
        }
    }, [mapCenter]);

    // Update Markers and Bounds
    useEffect(() => {
        if (!mapRef.current) return;

        // Clear old markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        const bounds = new mapboxgl.LngLatBounds();
        let hasPoints = false;

        // Add Destination Markers
        selected_destinations.forEach(dest => {
            const el = document.createElement('div');
            el.className = 'w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg ring-4 ring-blue-500/20';

            const tooltip = new mapboxgl.Popup({ offset: 25 })
                .setHTML(`<div class="p-1 font-bold text-xs">${dest.name}</div>`);

            const marker = new mapboxgl.Marker(el)
                .setLngLat([dest.lng, dest.lat])
                .setPopup(tooltip)
                .addTo(mapRef.current!);

            markersRef.current.push(marker);
            bounds.extend([dest.lng, dest.lat]);
            hasPoints = true;
        });

        // Add Hotel Markers
        locked_hotels.forEach(hotel => {
            const el = document.createElement('div');
            el.className = 'w-6 h-6 bg-rose-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-[10px] ring-4 ring-rose-500/20';
            el.innerHTML = '🏨';

            const tooltip = new mapboxgl.Popup({ offset: 25 })
                .setHTML(`<div class="p-1 font-bold text-xs">${hotel.name}</div>`);

            const marker = new mapboxgl.Marker(el)
                .setLngLat([hotel.lng, hotel.lat])
                .setPopup(tooltip)
                .addTo(mapRef.current!);

            markersRef.current.push(marker);
            bounds.extend([hotel.lng, hotel.lat]);
            hasPoints = true;
        });

        if (hasPoints && mapRef.current) {
            mapRef.current.fitBounds(bounds, { padding: 80, duration: 1500 });
        }
    }, [selected_destinations, locked_hotels]);

    if (!token) {
        return (
            <div className="w-full h-full bg-slate-900/40 flex items-center justify-center p-8 text-center backdrop-blur-xl border-r border-white/5">
                <div className="space-y-6">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20 shadow-2xl animate-pulse">
                        <span className="text-4xl">🗺️</span>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-white text-xl font-black tracking-tight">Mapbox Required</h3>
                        <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                            For a premium experience, we use Mapbox. Please add your <code className="bg-white/5 px-2 py-1 rounded text-blue-400">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> to enable high-fidelity maps.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Overlay for glass feel */}
            <div className="absolute inset-0 pointer-events-none border-r border-white/5 shadow-inner" />
        </div>
    );
};
