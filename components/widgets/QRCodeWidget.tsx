import React, { useState, useEffect } from 'react';
import { QrCode, Monitor, ListChecks, Type, Play, Square, Users } from 'lucide-react';
import { WidgetProps } from '../../types';

const QRCodeWidget: React.FC<WidgetProps> = ({ widget, updateData, updateSize }) => {
    const { url = '', mode = 'multiple', isLive = false } = widget.data; // mode: 'multiple' | 'long'
    const [question, setQuestion] = useState("");

    const SETUP_SIZE = { width: 310, height: 360 };
    const LIVE_SIZE = { width: 900, height: 500 };

    const toggleLiveSession = () => {
        const newLiveState = !isLive;
        updateData(widget.id, { isLive: newLiveState });

        if (updateSize) {
            updateSize(widget.id, newLiveState ? LIVE_SIZE : SETUP_SIZE);
        }
    };

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
                    </div>
                </div>

                {/* Live Content - Split View */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: QR Code */}
                    <div className="w-1/3 p-6 flex flex-col items-center justify-center border-r bg-slate-50/50">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 w-full aspect-square relative mb-4">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`}
                                alt="Scan QR"
                                className="w-full h-full object-contain mix-blend-multiply"
                            />
                        </div>
                        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-center max-w-full">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Join at</div>
                            <div className="text-sm font-mono font-bold text-slate-700 truncate select-all">
                                {url.replace(/^https?:\/\//, '')}
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
                        <div className="flex-1 flex flex-col border-t pt-4">
                            <div className="flex items-center justify-between text-slate-500 mb-2">
                                <span className="font-bold flex items-center gap-2 text-sm"><Users size={16} /> Responses (0)</span>
                                <button className="text-xs text-blue-600 hover:underline font-medium">Hide Answers</button>
                            </div>
                            <div className="flex-1 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm italic">
                                Waiting for submissions...
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
                <input
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-blue-500 focus:outline-none font-mono text-slate-600 shadow-sm"
                    placeholder="Paste URL here..."
                    value={url}
                    onChange={(e) => updateData(widget.id, { url: e.target.value })}
                />

                <textarea
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-blue-500 focus:outline-none resize-none h-16 shadow-sm"
                    placeholder="Type your question here..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
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
                {url ? (
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`}
                        alt="Scan QR"
                        className="w-full h-full object-contain p-8 mix-blend-multiply opacity-50 blur-[2px] group-hover:blur-0 group-hover:opacity-100 transition-all duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                        <Monitor size={32} className="text-slate-300" />
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/0 transition-colors">
                    <button
                        onClick={toggleLiveSession}
                        disabled={!url}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-full font-bold shadow-lg transform group-hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Play size={18} fill="currentColor" /> Start Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRCodeWidget;
