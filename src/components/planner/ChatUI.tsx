"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTripStore } from '@/store/tripStore';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const ChatUI: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Welcome to your Collaborative Workspace! I'm your travel agent. Where are we heading today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { addDestination, lockFlight, lockHotel, updateBudget, setMapCenter } = useTripStore();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const [showBookingForm, setShowBookingForm] = useState(false);

    const handleAction = (payload: any) => {
        switch (payload.action) {
            case 'ADD_DESTINATION':
                addDestination(payload.data);
                break;
            case 'ADD_HOTEL':
                lockHotel(payload.data);
                break;
            case 'ADD_FLIGHT':
                lockFlight(payload.data);
                break;
            case 'UPDATE_BUDGET':
                updateBudget(payload.data.amount);
                break;
            case 'MAP_UPDATE':
                setMapCenter({ lat: payload.data.lat, lng: payload.data.lng });
                break;
            case 'REQUEST_BOOKING_FORM':
                setShowBookingForm(true);
                break;
            default:
                console.warn('Unknown action:', payload.action);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/travel-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, history: messages }),
            });

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();

            // The backend returns a dual-payload: { reply: string, commands: Array<{ action, data }> }
            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            }

            if (data.commands && Array.isArray(data.commands)) {
                data.commands.forEach((cmd: any) => handleAction(cmd));
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error processing your request." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] relative">
            {/* Booking Form Modal */}
            <AnimatePresence>
                {showBookingForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#111] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold text-white mb-2">Secure Booking</h2>
                            <p className="text-white/40 text-sm mb-6">Please enter your details to finalize the booking.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">Full Name</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">Passport Number</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="A1234567" />
                                </div>
                                <div className="pt-4">
                                    <button
                                        onClick={() => setShowBookingForm(false)}
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                                    >
                                        Confirm & Pay
                                    </button>
                                    <button
                                        onClick={() => setShowBookingForm(false)}
                                        className="w-full mt-2 bg-transparent text-white/40 hover:text-white text-sm py-2 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-black/40 backdrop-blur-md">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Autonomous Travel Agent
                </h3>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${msg.role === 'user' ? 'bg-white/10 border-white/10' : 'bg-emerald-500/20 border-emerald-500/20'}`}>
                                    {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-emerald-400" />}
                                </div>
                                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white/5 text-white/90 border border-white/10 rounded-tl-none'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none">
                                <Loader2 size={16} className="text-emerald-400 animate-spin" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input */}
            <div className="p-4 bg-black/40 border-t border-white/5">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Search flights, book hotels, or plan your route..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1.5 p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="text-[10px] text-white/20 text-center mt-3 uppercase tracking-widest font-bold">
                    Powered by Amadeus & LangGraph
                </p>
            </div>
        </div>
    );
};
