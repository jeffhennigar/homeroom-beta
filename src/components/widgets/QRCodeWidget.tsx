import React, { useState, useEffect } from 'react';
import { QrCode, Monitor, ListChecks, Type, Play, Square, Users } from 'lucide-react';
import { WidgetProps } from '../../types';
import { supabase } from '../../services/supabaseClient';

const QRCodeWidget: React.FC<WidgetProps> = ({ widget, updateData, updateSize }) => {
    const {
        url = '',
        mode = 'multiple',
        isLive = false,
        sessionId = '',
        results = []
    } = widget.data; // mode: 'multiple' | 'long'

    const [question, setQuestion] = useState("");
    const [showResults, setShowResults] = useState(true);

    const SETUP_SIZE = { width: 310, height: 360 };
    const LIVE_SIZE = { width: 900, height: 500 };

    // Initialize Session ID if needed
    useEffect(() => {
        if (!sessionId) {
            updateData(widget.id, { sessionId: Math.random().toString(36).substring(7) });
        }
    }, [widget.id, sessionId]);

    // Realtime Subscription
    useEffect(() => {
        if (!isActive() || !sessionId) return;

        // Dynamic import to avoid circular dependencies or use global? 
        // Better to use the imported supabase client.
        // Assuming supabase is available via props or import. 
        // We need to import it at the top.
        const channel = supabase.channel(`exit_ticket:${sessionId}`);

        channel.on(
            'broadcast',
            { event: 'answer' },
            (payload) => {
                const newResult = payload.payload;
                // Avoid duplicates if needed, or just append
                updateData(widget.id, {
                    results: [...(widget.data.results || []), newResult]
                });
            }
        ).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isLive, sessionId, widget.id]);

    const isActive = () => isLive;

    const toggleLiveSession = () => {
        const newLiveState = !isLive;
        // If starting, maybe clear results? Or keep them? Legacy kept them unless manually cleared.
        // Legacy 'toggleSession' cleared results if starting NEW.
        // "Starting new... isActive: true, results: [], sessionId: new..."

        const updates: any = { isLive: newLiveState };
        if (newLiveState) {
            // Optional: Reset session on start? Users might want to resume. 
            // Let's keep existing behavior: Resume if session exists, or user can clear.
            // But legacy code did: `updateData(..., { isActive: true, results: [], sessionId: ... })` if !isActive.
            // Let's follow legacy behavior to ensure fresh start.
            updates.results = [];
            updates.sessionId = Math.random().toString(36).substring(7);
        }

        updateData(widget.id, updates);

        if (updateSize) {
            updateSize(widget.id, newLiveState ? LIVE_SIZE : SETUP_SIZE);
        }
    };

    const joinUrl = `${window.location.protocol}//${window.location.host}/?mode=student&session=${sessionId}`;

    if (isLive) {
        return (
            <div className="h-full flex flex-col bg-white">
                {/* Live Header */}
                <div className="flex items-center justify-between p-4 border-b bg-slate-50 shrink-0">
                    <div className="flex items-center gap-3">
                        <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <QrCode size={20} className="text-slate-500" />
                            Exit Ticket
                        </h2>
                        <div className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-green-200 animate-pulse uppercase tracking-wider">LIVE</div>
                        <div className="text-xs text-slate-400 font-mono hidden sm:block">ID: {sessionId}</div>
                    </div>
                </div>

                {/* Live Content - Split View */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: QR Code */}
                    <div className="w-1/3 p-6 flex flex-col items-center justify-center border-r bg-slate-50/50">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 w-full aspect-square relative mb-4">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(joinUrl)}`}
                                alt="Scan QR"
                                className="w-full h-full object-contain mix-blend-multiply"
                            />
                        </div>
                        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-center max-w-full">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Join at</div>
                            <div className="text-sm font-mono font-bold text-slate-700 truncate select-all">
                                {joinUrl.replace(/^https?:\/\//, '')}
                            </div>
                        </div>
                    </div>

                    {/* Right: Question & Status */}
                    <div className="flex-1 flex flex-col p-8 relative">
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question</label>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${mode === 'multiple' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                                    {mode === 'multiple' ? 'Multiple Choice' : 'Long Answer'}
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-slate-800 leading-tight bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                {question || <span className="text-slate-300 italic">Type your question here to display...</span>}
                            </div>
                        </div>

                        {/* Responses Placeholder */}
                        <div className="flex-1 flex flex-col border-t pt-4 min-h-0">
                            <div className="flex items-center justify-between text-slate-500 mb-2">
                                <span className="font-bold flex items-center gap-2 text-sm"><Users size={16} /> Responses ({results?.length || 0})</span>
                                <button onClick={() => setShowResults(!showResults)} className="text-xs text-blue-600 hover:underline font-medium">
                                    {showResults ? 'Hide Answers' : 'Show Answers'}
                                </button>
                            </div>
                            <div className="flex-1 bg-slate-50 rounded-xl border border-dashed border-slate-200 overflow-y-auto p-2 custom-scrollbar relative">
                                {(!results || results.length === 0) ? (
                                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm italic">
                                        Waiting for submissions...
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {results.map((r: any, i: number) => (
                                            <div key={i} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-xs text-indigo-900">{r.name}</span>
                                                    <span className="text-[9px] text-slate-400">{new Date(r.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                                <div className={`text-sm text-slate-700 ${!showResults ? 'blur-sm select-none' : ''}`}>
                                                    {r.answer}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-3 border-t bg-slate-50 shrink-0 flex justify-center">
                    <button
                        onClick={toggleLiveSession}
                        className="w-full max-w-md bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2 rounded-lg font-bold transition-colors text-sm flex items-center justify-center gap-2"
                    >
                        End Session
                    </button>
                </div>
            </div>
        );
    }

    // SETUP MODE (Existing + Start Button)
    return (
        <div className="h-full flex flex-col p-4 bg-white">
            {/* Input inputs */}
            <div className="space-y-3 mb-3">
                <textarea
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-blue-500 focus:outline-none resize-none h-24 shadow-sm"
                    placeholder="Type your question here (e.g. What did you learn today?)"
                    value={question}
                    onChange={(e) => {
                        setQuestion(e.target.value);
                        // Sync question to data optionally? 
                        // Legacy didn't sync question to 'data', just local state until broadcast?
                        // We can keep it local for now or add to data if we want persistence.
                    }}
                />
            </div>

            {/* Options */}
            <div className="flex bg-slate-100 p-1 rounded-lg mb-3 shrink-0">
                <button
                    onClick={() => updateData(widget.id, { mode: 'multiple' })}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-bold transition-all ${mode === 'multiple' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <ListChecks size={14} /> MC
                </button>
                <button
                    onClick={() => updateData(widget.id, { mode: 'long' })}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-bold transition-all ${mode === 'long' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Type size={14} /> Text
                </button>
            </div>

            {/* Start Button Overlay on QR Preview */}
            <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 group">
                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                    <div className="text-center p-4">
                        <QrCode size={32} className="text-slate-300 mx-auto mb-2" />
                        <div className="text-xs text-slate-400">Ready to start?</div>
                    </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/5 transition-colors">
                    <button
                        onClick={toggleLiveSession}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold shadow-lg transform group-hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Play size={18} fill="currentColor" /> Start Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRCodeWidget;
