import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Plus, Minus, RotateCcw, X, Trophy, Sparkles } from 'lucide-react';
import { WidgetProps } from '../../types';

// --- Marble Physics Helpers ---
// We'll use a deterministic randomized position for marbles based on their index
// to simulate them "falling" and stacking in a way that feels organic.
const getMarblePosition = (index: number, jarWidth: number, jarHeight: number, totalMarbles: number) => {
    // Basic stacking: rows and columns with some jitter
    const cols = 6;
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    // Base position
    const margin = 25;
    const rowHeight = 22;
    const colWidth = (jarWidth - margin * 2) / (cols - 1);
    
    // Add some "settling" jitter based on index
    const jitterX = (Math.sin(index * 1337) * 8);
    const jitterY = (Math.cos(index * 7331) * 4);
    
    const x = margin + col * colWidth + jitterX;
    const y = jarHeight - margin - (row * rowHeight) + jitterY;
    
    return { x, y };
};

const MarbleJarWidget: React.FC<WidgetProps> = ({ widget, updateData }) => {
    const data = widget.data || {};
    const count = data.count || 0;
    const goal = data.goal || 50;
    const jarStyle = data.jarStyle || 'classic'; // 'classic', 'square', 'tall'
    const showSettings = data.showSettings || false;
    const rewardMessage = data.rewardMessage || 'AMAZING JOB! 🎉';

    const [isCelebrating, setIsCelebrating] = useState(false);

    // Marble colors (Teacher-friendly, vibrant)
    const marbleColors = [
        'from-blue-400 to-blue-600',
        'from-emerald-400 to-emerald-600',
        'from-amber-400 to-amber-600',
        'from-rose-400 to-rose-600',
        'from-purple-400 to-purple-600',
        'from-indigo-400 to-indigo-600',
        'from-sky-400 to-sky-600',
        'from-orange-400 to-orange-600',
    ];

    const marbles = useMemo(() => {
        return Array.from({ length: Math.min(count, 150) }).map((_, i) => ({
            id: i,
            color: marbleColors[i % marbleColors.length],
            pos: getMarblePosition(i, 300, 450, count)
        }));
    }, [count]);

    useEffect(() => {
        if (count >= goal && count > 0 && !isCelebrating) {
            setIsCelebrating(true);
            setTimeout(() => setIsCelebrating(false), 5000);
        }
    }, [count, goal]);

    const addMarble = () => {
        if (count < 150) {
            updateData(widget.id, { count: count + 1 });
        }
    };

    const removeMarble = () => {
        if (count > 0) {
            updateData(widget.id, { count: count - 1 });
        }
    };

    const resetJar = () => {
        if (confirm('Clear all marbles from the jar?')) {
            updateData(widget.id, { count: 0 });
        }
    };

    if (showSettings) {
        return (
            <div className="h-full flex flex-col p-6 bg-white rounded-3xl border border-slate-200 shadow-2xl relative select-none">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter text-xl">Jar Settings</h3>
                    <button onClick={() => updateData(widget.id, { showSettings: false })} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
                </div>

                <div className="space-y-8 flex-1">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Reward Goal ({goal})</label>
                        <input 
                            type="range" 
                            min="5" 
                            max="100" 
                            step="5"
                            value={goal} 
                            onChange={e => updateData(widget.id, { goal: Number(e.target.value) })} 
                            className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer" 
                        />
                        <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-400">
                            <span>5</span>
                            <span>25</span>
                            <span>50</span>
                            <span>75</span>
                            <span>100</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Victory Message</label>
                        <input 
                            type="text"
                            value={rewardMessage}
                            onChange={(e) => updateData(widget.id, { rewardMessage: e.target.value.toUpperCase() })}
                            placeholder="REWARD REACHED! 🎉"
                            className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-2xl px-4 py-3 font-bold uppercase tracking-widest outline-none text-slate-700"
                        />
                    </div>

                    <button 
                        onClick={resetJar}
                        className="w-full py-4 bg-slate-800 hover:bg-black text-white rounded-3xl font-black flex items-center justify-center gap-2 shadow-xl shadow-slate-200 transition-all active:scale-95 uppercase tracking-widest mt-auto"
                    >
                        <RotateCcw size={20} /> Empty Jar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center bg-slate-50/30 p-4 relative select-none no-drag overflow-hidden">
            <style>{`
                @keyframes marbleDrop {
                    0% { transform: translateY(-300px) scale(1.2); opacity: 0; }
                    60% { transform: translateY(0) scale(0.9); opacity: 1; }
                    80% { transform: translateY(-10px); }
                    100% { transform: translateY(0); }
                }
                .marble-pop { animation: marbleDrop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .celebrate-ping { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
            `}</style>

            {/* Premium Header Controls */}
            <div className="absolute top-4 inset-x-4 flex justify-between items-center z-20">
                <div className="flex bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm p-1">
                    <div className="px-3 py-1 text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Trophy size={14} className={count >= goal ? 'text-amber-500' : 'text-slate-300'} />
                        {count} <span className="opacity-30">/</span> {goal}
                    </div>
                </div>
                <button 
                    onClick={() => updateData(widget.id, { showSettings: true })}
                    className="p-2.5 bg-white/80 backdrop-blur-md text-slate-400 hover:text-indigo-600 rounded-2xl border border-white/50 shadow-sm transition-all"
                >
                    <Settings size={20} />
                </button>
            </div>

            {/* The Jar Canvas */}
            <div className="relative flex-1 w-full flex items-center justify-center mt-12 mb-20">
                <svg viewBox="0 0 300 500" className="w-full h-full max-h-[450px] drop-shadow-2xl overflow-visible">
                    {/* Jar Shape (Back Half) */}
                    <path 
                        d="M50 100 Q50 80 70 80 H230 Q250 80 250 100 V430 Q250 480 200 480 H100 Q50 480 50 430 Z" 
                        fill="white" 
                        fillOpacity="0.1"
                        stroke="white"
                        strokeWidth="4"
                        strokeOpacity="0.3"
                    />
                    
                    {/* Marbles Layer */}
                    <g className="marbles-container">
                        {marbles.map((m) => (
                            <g key={m.id} className="marble-pop" style={{ animationDelay: '0ms' }}>
                                <circle 
                                    cx={m.pos.x} 
                                    cy={m.pos.y} 
                                    r="14" 
                                    className={`bg-gradient-to-br ${m.color}`}
                                    fill="currentColor"
                                    style={{ color: 'transparent' }}
                                />
                                {/* Glossy Overlay */}
                                <linearGradient id={`grad-${m.id}`} x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                                    <stop offset="50%" stopColor="white" stopOpacity="0" />
                                    <stop offset="100%" stopColor="black" stopOpacity="0.2" />
                                </linearGradient>
                                <circle 
                                    cx={m.pos.x} 
                                    cy={m.pos.y} 
                                    r="14" 
                                    fill={`url(#grad-${m.id})`}
                                    className={`bg-gradient-to-br ${m.color}`}
                                />
                                {/* Highlight Reflection */}
                                <circle 
                                    cx={m.pos.x - 5} 
                                    cy={m.pos.y - 5} 
                                    r="4" 
                                    fill="white" 
                                    fillOpacity="0.4"
                                />
                            </g>
                        ))}
                    </g>

                    {/* Jar Shape (Front Glass Rim/Gloss) */}
                    <path 
                        d="M50 100 Q50 80 70 80 H230 Q250 80 250 100 V430 Q250 480 200 480 H100 Q50 480 50 430 Z" 
                        fill="none" 
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="2"
                    />
                    
                    {/* Glass Shine */}
                    <path 
                        d="M70 110 Q70 100 80 100 H120" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="4" 
                        strokeLinecap="round" 
                        strokeOpacity="0.2"
                    />
                    <path 
                        d="M230 460 Q240 460 240 430 V150" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="8" 
                        strokeLinecap="round" 
                        strokeOpacity="0.1"
                    />
                </svg>

                {/* Celebration Overlay */}
                {isCelebrating && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center z-30 animate-in fade-in zoom-in duration-500 pointer-events-none">
                        <div className="relative inline-block">
                            <div className="bg-indigo-600 text-white font-black text-2xl px-8 py-4 rounded-3xl shadow-[0_0_50px_rgba(79,70,229,0.5)] border-4 border-indigo-200 uppercase tracking-tighter">
                                {rewardMessage}
                            </div>
                            <div className="absolute -top-6 -right-6 text-amber-500 animate-bounce">
                                <Sparkles size={48} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Action Controls (Floating at bottom) */}
            <div className="absolute bottom-6 flex items-center gap-6 z-20">
                <button 
                    onClick={removeMarble}
                    className="w-14 h-14 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-2xl flex items-center justify-center border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 transition-all shadow-lg"
                >
                    <Minus size={28} />
                </button>
                <div className="w-20 h-20 rounded-full bg-indigo-600 p-1 shadow-[0_15px_35px_-10px_rgba(79,70,229,0.5)] active:translate-y-1 transition-all group">
                    <button 
                        onClick={addMarble}
                        className="w-full h-full bg-indigo-500 hover:bg-indigo-400 rounded-full flex items-center justify-center text-white border-b-4 border-indigo-700 active:border-b-0 transition-all"
                    >
                        <Plus size={40} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
                <button 
                    onClick={() => updateData(widget.id, { count: Math.min(count + 5, goal > count ? goal : 150) })}
                    className="w-14 h-14 bg-white hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-2xl flex items-center justify-center border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 transition-all shadow-lg group"
                    title="+5 Marbles"
                >
                    <div className="relative">
                       <Plus size={16} className="absolute -top-3 -right-3" strokeWidth={3} />
                       <span className="font-black text-lg">5</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default MarbleJarWidget;
