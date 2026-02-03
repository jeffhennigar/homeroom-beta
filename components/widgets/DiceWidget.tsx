import React, { useState } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

const DiceWidget = ({ widget, updateData }) => {
    const { diceCount = 1, isRolling = false, displayResults = [1] } = widget.data;

    const rollDice = () => {
        if (isRolling) return;
        updateData(widget.id, { isRolling: true });

        let rolls = 0;
        const interval = setInterval(() => {
            rolls++;
            const randomResults = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
            updateData(widget.id, { displayResults: randomResults });

            if (rolls > 10) {
                clearInterval(interval);
                updateData(widget.id, { isRolling: false, displayResults: randomResults });
            }
        }, 100);
    };

    const renderFace = (num) => {
        const baseSize = (widget.data.fontSize || 36) * 1.5;
        const size = diceCount === 1 ? baseSize * 2 : baseSize * 1.5;
        switch (num) {
            case 1: return <Dice1 size={size} className="text-indigo-600" />;
            case 2: return <Dice2 size={size} className="text-indigo-600" />;
            case 3: return <Dice3 size={size} className="text-indigo-600" />;
            case 4: return <Dice4 size={size} className="text-indigo-600" />;
            case 5: return <Dice5 size={size} className="text-indigo-600" />;
            case 6: return <Dice6 size={size} className="text-indigo-600" />;
            default: return <Dice1 size={size} />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative p-4 group">
            {/* Settings Overlay - Always visible on hover if not rolling */}
            <div className="absolute top-2 right-2 bg-white/90 p-2 rounded-xl border border-indigo-100 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">Number of Dice</label>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(num => (
                            <button
                                key={num}
                                onClick={() => updateData(widget.id, { diceCount: num })}
                                className={`flex-1 px-3 py-2 rounded-lg font-bold transition-colors ${diceCount === num ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div onClick={rollDice} className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50/50 rounded-xl transition-colors">
                <div className="flex gap-4 items-center justify-center w-full h-full">
                    {displayResults.map((val, idx) => (
                        <div key={idx} className={`relative shadow-xl border-2 border-indigo-100 flex items-center justify-center transform transition-transform bg-white ${isRolling ? 'rotate-180 scale-105' : ''} ${diceCount === 1 ? 'w-32 h-32 rounded-2xl' : 'w-24 h-24 rounded-xl'}`}>
                            {renderFace(val)}
                        </div>
                    ))}
                </div>

                <div className="text-indigo-400 font-bold text-[10px] uppercase mt-4 tracking-widest absolute bottom-4">{isRolling ? "Rolling..." : `Click to Roll`}</div>
            </div>
        </div>
    );
};

export default DiceWidget;