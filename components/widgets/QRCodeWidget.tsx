import React, { useState } from 'react';
import { QrCode, Monitor, ListChecks, Type } from 'lucide-react';
import { WidgetProps } from '../../types';

const QRCodeWidget: React.FC<WidgetProps> = ({ widget, updateData }) => {
    const { url = '', mode = 'multiple' } = widget.data; // mode: 'multiple' | 'long'

    const getShortUrl = (fullUrl: string) => {
        try {
            const urlObj = new URL(fullUrl.startsWith('http') ? fullUrl : `https://${fullUrl}`);
            return urlObj.hostname + (urlObj.pathname.length > 1 ? '/...' : '');
        } catch {
            return fullUrl;
        }
    };

    return (
        <div className="h-full flex flex-col p-4 bg-white">
            {/* Input Area */}
            <input
                className="w-full border border-slate-200 rounded-lg p-2 mb-3 text-sm focus:border-blue-500 focus:outline-none transition-colors font-mono text-slate-600 shadow-sm"
                placeholder="Paste URL here..."
                value={url}
                onChange={(e) => updateData(widget.id, { url: e.target.value })}
            />

            {/* Teacher Options Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg mb-3 shrink-0">
                <button
                    onClick={() => updateData(widget.id, { mode: 'multiple' })}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-bold transition-all ${mode === 'multiple' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Multiple Choice"
                >
                    <ListChecks size={14} /> MC
                </button>
                <button
                    onClick={() => updateData(widget.id, { mode: 'long' })}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-bold transition-all ${mode === 'long' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Longer Explanation"
                >
                    <Type size={14} /> Text
                </button>
            </div>

            {/* QR Display Area */}
            <div className={`flex-1 flex flex-col items-center justify-center rounded-xl overflow-hidden relative border ${url ? 'bg-white border-slate-100' : 'bg-slate-50 border-dashed border-slate-200'}`}>
                {url ? (
                    <>
                        {/* Student Instruction Pill */}
                        <div className={`absolute top-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm z-10 ${mode === 'multiple' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {mode === 'multiple' ? 'Multiple Choice' : 'Long Answer'}
                        </div>

                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`}
                            alt="Scan QR"
                            className="w-full h-full object-contain p-6 mix-blend-multiply"
                        />

                        {/* Shortlink Display */}
                        <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur py-2 px-3 border-t border-slate-50 text-center">
                            <div className="text-[10px] font-mono text-slate-500 truncate select-all cursor-text font-medium" title={url}>
                                {url}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center text-slate-400 gap-2">
                        <Monitor size={32} className="opacity-20" />
                        <span className="text-xs font-medium italic">Paste a link to generate</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRCodeWidget;
