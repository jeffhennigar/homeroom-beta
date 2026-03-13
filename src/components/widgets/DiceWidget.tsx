import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';

const DiceWidget = ({ widget, updateData, accentColor = 'indigo' }) => {
    const { sides = 6, diceCount = 1, results = [1], isRolling = false, fontSize = 16 } = widget.data;
    const [showSettings, setShowSettings] = useState(false);

    // Ensure results match diceCount
    const displayResults = (results && results.length === diceCount) ? results : Array(diceCount).fill(1).map((_, i) => (results[i] || 1));

    const roll = () => {
        if (isRolling) return;
        updateData(widget.id, { isRolling: true });
        
        let count = 0;
        const animate = () => {
            const temp = Array.from({ length: diceCount }, () => Math.floor(Math.random() * sides) + 1);
            updateData(widget.id, { results: temp });
            count++;
            if (count < 12) { 
                setTimeout(animate, 60 + (count * 10)); 
            } else { 
                updateData(widget.id, { isRolling: false }); 
            }
        };
        animate();
    };

    const renderDot = (active) => (
        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${active ? (accentColor === 'rose' ? 'bg-rose-600' : accentColor === 'blue' ? 'bg-blue-600' : accentColor === 'purple' ? 'bg-purple-600' : accentColor === 'emerald' ? 'bg-emerald-600' : accentColor === 'amber' ? 'bg-amber-600' : 'bg-indigo-600') + ' scale-100' : 'bg-transparent scale-0'}`} />
    );

    const renderFace = (num) => {
        if (sides !== 6) {
            return (
                <span className={`font-black drop-shadow-sm select-none ${accentColor === 'rose' ? 'text-rose-800' : accentColor === 'blue' ? 'text-blue-800' : accentColor === 'purple' ? 'text-purple-800' : accentColor === 'emerald' ? 'text-emerald-800' : accentColor === 'amber' ? 'text-amber-800' : 'text-indigo-800'}`} style={{ fontSize: (fontSize * (diceCount === 1 ? 5 : 3.5)) + 'px' }}>
                    {num}
                </span>
            );
        }

        // D6 Dot Layout
        const positions = {
            1: [4],
            2: [0, 8],
            3: [0, 4, 8],
            4: [0, 2, 6, 8],
            5: [0, 2, 4, 6, 8],
            6: [0, 2, 3, 5, 6, 8]
        };
        const activeDots = positions[num] || [];
        return (
            <div className="grid grid-cols-3 gap-1.5 p-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="w-4 h-4 flex items-center justify-center">
                        {renderDot(activeDots.includes(i))}
                    </div>
                ))}
            </div>
        );
    };

    if (showSettings) {
        return (
            <div className="h-full bg-white/90 backdrop-blur-md flex flex-col p-5 animate-in fade-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                        <div className={`w-2 h-6 rounded-full ${accentColor === 'rose' ? 'bg-rose-500' : accentColor === 'blue' ? 'bg-blue-500' : accentColor === 'purple' ? 'bg-purple-500' : accentColor === 'emerald' ? 'bg-emerald-500' : accentColor === 'amber' ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                        Dice Settings
                    </h3>
                    <button 
                        onClick={() => setShowSettings(false)} 
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 block">Dice Count</label>
                        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                            {[1, 2, 3].map(num => (
                                <button
                                    key={num}
                                    onClick={() => updateData(widget.id, { diceCount: num })}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${diceCount === num ? `bg-white ${accentColor === 'rose' ? 'text-rose-600' : accentColor === 'blue' ? 'text-blue-600' : accentColor === 'purple' ? 'text-purple-600' : accentColor === 'emerald' ? 'text-emerald-600' : accentColor === 'amber' ? 'text-amber-600' : 'text-indigo-600'} shadow-sm` : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Sides per Die</label>
                            <span className={`text-sm font-black ${accentColor === 'rose' ? 'text-rose-600' : accentColor === 'blue' ? 'text-blue-600' : accentColor === 'purple' ? 'text-purple-600' : accentColor === 'emerald' ? 'text-emerald-600' : accentColor === 'amber' ? 'text-amber-600' : 'text-indigo-600'}`}>{sides}</span>
                        </div>
                        <input 
                            type="range" 
                            min="2" max="20" 
                            value={sides} 
                            onChange={e => updateData(widget.id, { sides: Number(e.target.value) })} 
                            className={`w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer ${accentColor === 'rose' ? 'accent-rose-600' : accentColor === 'blue' ? 'accent-blue-600' : accentColor === 'purple' ? 'accent-purple-600' : accentColor === 'emerald' ? 'accent-emerald-600' : accentColor === 'amber' ? 'accent-amber-600' : 'accent-indigo-600'}`} 
                        />
                        <div className="flex justify-between mt-1 px-1">
                            <span className="text-[9px] font-bold text-slate-300">2</span>
                            <span className="text-[9px] font-bold text-slate-300">20</span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto">
                    <button 
                        onClick={() => setShowSettings(false)}
                        className={`w-full py-3 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 ${accentColor === 'rose' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : accentColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : accentColor === 'purple' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : accentColor === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : accentColor === 'amber' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        );
    }

  return (
    <div 
        className="h-full bg-gradient-to-br from-slate-50 to-white flex flex-col items-center justify-center relative p-4 select-none cursor-pointer group hover:from-slate-100 transition-colors" 
        onClick={roll}
    >
        <button 
            onClick={(e) => { e.stopPropagation(); setShowSettings(true); }} 
            className={`absolute top-3 right-3 p-2.5 text-slate-300 rounded-xl hover:bg-white hover:shadow-sm opacity-0 group-hover:opacity-100 transition-all z-20 ${accentColor === 'rose' ? 'hover:text-rose-600' : accentColor === 'blue' ? 'hover:text-blue-600' : accentColor === 'purple' ? 'hover:text-purple-600' : accentColor === 'emerald' ? 'hover:text-emerald-600' : accentColor === 'amber' ? 'hover:text-amber-600' : 'hover:text-indigo-600'}`}
        >
            <Settings size={18} />
        </button>

        <div className="flex gap-6 items-center justify-center w-full h-full">
            {displayResults.map((val, idx) => (
                <div 
                    key={idx} 
                    className={`relative shadow-2xl border-b-4 border-slate-100 flex items-center justify-center transform transition-all duration-300 bg-white 
                        ${isRolling ? 'rotate-12 scale-110 blur-[0.5px]' : 'rotate-0 scale-100'} 
                        ${diceCount === 1 ? 'w-40 h-40 rounded-[2.5rem]' : (diceCount === 2 ? 'w-28 h-28 rounded-[2rem]' : 'w-24 h-24 rounded-[1.5rem]')}`}
                >
                    <div className={`transition-opacity duration-200 ${isRolling ? 'opacity-40' : 'opacity-100'}`}>
                        {renderFace(val)}
                    </div>
                    
                    {/* Shading/3D Effect */}
                    <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_2px_10px_rgba(255,255,255,0.8),inset_0_-2px_10px_rgba(0,0,0,0.05)] pointer-events-none" />
                </div>
            ))}
        </div>

        <div className="absolute bottom-6 flex flex-col items-center gap-1.5 transition-all duration-300 opacity-60 group-hover:opacity-100">
            <div className={`h-1 w-8 rounded-full overflow-hidden ${accentColor === 'rose' ? 'bg-rose-500/20' : accentColor === 'blue' ? 'bg-blue-500/20' : accentColor === 'purple' ? 'bg-purple-500/20' : accentColor === 'emerald' ? 'bg-emerald-500/20' : accentColor === 'amber' ? 'bg-amber-500/20' : 'bg-indigo-500/20'}`}>
                <div className={`h-full transition-all duration-300 ${accentColor === 'rose' ? 'bg-rose-500' : accentColor === 'blue' ? 'bg-blue-500' : accentColor === 'purple' ? 'bg-purple-500' : accentColor === 'emerald' ? 'bg-emerald-500' : accentColor === 'amber' ? 'bg-amber-500' : 'bg-indigo-500'} ${isRolling ? 'w-full' : 'w-0'}`} />
            </div>
            <span className={`font-black text-[9px] uppercase tracking-[0.2em] ${accentColor === 'rose' ? 'text-rose-900' : accentColor === 'blue' ? 'text-blue-900' : accentColor === 'purple' ? 'text-purple-900' : accentColor === 'emerald' ? 'text-emerald-900' : accentColor === 'amber' ? 'text-amber-900' : 'text-indigo-900'}`}>
                {isRolling ? "Rolling Results..." : `Click Anywhere to Roll`}
            </span>
        </div>
    </div>
  );
};

export default DiceWidget;