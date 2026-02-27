import { create } from 'zustand';

export interface Destination {
    id: string;
    name: string;
    lat: number;
    lng: number;
}

export interface Flight {
    id: string;
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    price: number;
    departureTime: string;
}

export interface Hotel {
    id: string;
    name: string;
    lat: number;
    lng: number;
    pricePerNight: number;
}

interface TripState {
    selected_destinations: Destination[];
    locked_flights: Flight[];
    locked_hotels: Hotel[];
    budget_spent: number;
    mapCenter: { lat: number; lng: number };

    addDestination: (destination: Omit<Destination, 'id'>) => void;
    removeDestination: (id: string) => void;
    lockFlight: (flight: Flight) => void;
    lockHotel: (hotel: Hotel) => void;
    updateBudget: (amount: number) => void;
    setMapCenter: (center: { lat: number; lng: number }) => void;
    resetTrip: () => void;
}

export const useTripStore = create<TripState>((set) => ({
    selected_destinations: [],
    locked_flights: [],
    locked_hotels: [],
    budget_spent: 0,
    mapCenter: { lat: 48.8566, lng: 2.3522 }, // Default: Paris (will update)

    addDestination: (dest) => set((state) => {
        const exists = state.selected_destinations.some((d) => d.name === dest.name);
        if (exists) return state;
        return {
            selected_destinations: [...state.selected_destinations, { ...dest, id: Math.random().toString(36).substr(2, 9) }]
        };
    }),

    removeDestination: (id) => set((state) => ({
        selected_destinations: state.selected_destinations.filter((d) => d.id !== id)
    })),

    lockFlight: (flight) => set((state) => ({
        locked_flights: [...state.locked_flights, flight],
        budget_spent: state.budget_spent + flight.price
    })),

    lockHotel: (hotel) => set((state) => ({
        locked_hotels: [...state.locked_hotels, hotel],
        budget_spent: state.budget_spent + hotel.pricePerNight
    })),

    updateBudget: (amount) => set((state) => ({
        budget_spent: state.budget_spent + amount
    })),

    setMapCenter: (center) => set({ mapCenter: center }),

    resetTrip: () => set({
        selected_destinations: [],
        locked_flights: [],
        locked_hotels: [],
        budget_spent: 0
    })
}));
