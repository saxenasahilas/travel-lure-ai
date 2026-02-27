/**
 * Geographic Matcher Utility
 * Uses the Haversine formula to calculate distances between coordinates.
 */

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Hub extends Coordinates {
    name: string;
}

export const TRAVEL_HUBS: Hub[] = [
    { name: "Delhi NCR", lat: 28.6139, lng: 77.2090 },
    { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
    { name: "Pune", lat: 18.5204, lng: 73.8567 },
    { name: "BLR", lat: 12.9716, lng: 77.5946 },
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
];

/**
 * Calculates the shortest distance between two points on a sphere.
 * Formula: d = 2r arcsin(sqrt(sin^2(Δφ/2) + cosφ1 cosφ2 sin^2(Δλ/2)))
 */
export function haversineDistance(c1: Coordinates, c2: Coordinates): number {
    const r = 6371; // Earth's radius in kilometers
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(c2.lat - c1.lat);
    const dLng = toRad(c2.lng - c1.lng);
    const lat1 = toRad(c1.lat);
    const lat2 = toRad(c2.lat);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.asin(Math.sqrt(a));
    return r * c;
}

/**
 * Finds the closest hub for a given set of coordinates.
 */
export function findClosestHub(coords: Coordinates): Hub {
    let closest = TRAVEL_HUBS[0];
    let minDistance = haversineDistance(coords, closest);

    for (let i = 1; i < TRAVEL_HUBS.length; i++) {
        const d = haversineDistance(coords, TRAVEL_HUBS[i]);
        if (d < minDistance) {
            minDistance = d;
            closest = TRAVEL_HUBS[i];
        }
    }

    return closest;
}
