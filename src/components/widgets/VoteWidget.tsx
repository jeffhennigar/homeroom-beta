import React, { useState } from 'react';
import { Settings, Trash2 } from 'lucide-react';

const VoteWidget = ({ widget, updateData }) => {
    const { question = "Class Poll", options = [{ id: 1, text: "Yes", count: 0 }, { id: 2, text: "No", count: 0 }], fontSize = 16 } = widget.data;
    const [isEditing, setIsEditing] = useState(false);

    const vote = (id) => updateData(widget.id, { options: options.map(o => o.id === id ? { ...o, count: o.count + 1 } : o) });
    const totalVotes = options.reduce((acc, o) => acc + o.count, 0) || 1; // avoid /0

    const updateOption = (id, text) => updateData(widget.id, { options: options.map(o => o.id === id ? { ...o, text } : o) });
    const addOption = () => updateData(widget.id, { options: [...options, { id: Date.now(), text: "", count: 0 }] });
    const removeOption = (id) => updateData(widget.id, { options: options.filter(o => o.id !== id) });
    const resetCounts = () => updateData(widget.id, { options: options.map(o => ({ ...o, count: 0 })) });

    if (isEditing) {
        return (
            <div className="h-full bg-white flex flex-col p-4 overflow-hidden">
                <div className="flex justify-between items-center mb-2"><h3 className="font-bold text-sm">Edit Poll</h3><button onClick={() => setIsEditing(false)} className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded">Done</button></div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Question</label>
                        <input className="w-full border rounded p-1 text-sm font-bold" value={question} onChange={e => updateData(widget.id, { question: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Options</label>
                        {options.map((o, i) => (
                            <div key={o.id} className="flex gap-1 items-center">
                                <input className="flex-1 border rounded p-1 text-sm" value={o.text} onChange={e => updateOption(o.id, e.target.value)} placeholder={`Option ${i + 1}`} />
                                <button onClick={() => removeOption(o.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                            </div>
                        ))}
                        <button onClick={addOption} className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">+ Add Option</button>
                    </div>
                </div>
                <button onClick={resetCounts} className="mt-2 w-full py-2 border border-red-200 text-red-600 rounded text-xs font-bold hover:bg-red-50">Reset Votes</button>
            </div>
        );
    }

    return (
        <div className="h-full bg-white flex flex-col p-4 relative group">
            <button onClick={() => setIsEditing(true)} className="absolute top-2 right-2 p-1 text-gray-300 hover:text-blue-600 rounded hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"><Settings size={14} /></button>
            <h3 className="font-bold text-center mb-4 text-gray-800" style={{ fontSize: fontSize + 'px' }}>{question}</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                {options.map(o => {
                    const pct = Math.round((o.count / totalVotes) * 100);
                    return (
                        <div key={o.id} onClick={() => vote(o.id)} className="cursor-pointer group/opt">
                            <div className="flex justify-between mb-1 font-medium text-gray-600" style={{ fontSize: (fontSize - 2) + 'px' }}><span>{o.text || "Option"}</span><span>{o.count} ({options.every(x => x.count === 0) ? 0 : pct}%)</span></div>
                            <div className="h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                                <div className="absolute top-0 left-0 bottom-0 bg-blue-500 transition-all duration-500 ease-out" style={{ width: options.every(x => x.count === 0) ? '0%' : `${pct}%` }} />
                                <div className="absolute inset-0 hover:bg-black/5 transition-colors" />
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-2 text-center text-[10px] text-gray-400 uppercase tracking-widest">{options.reduce((a, b) => a + b.count, 0)} Total Votes</div>
        </div>
    );
};

export default VoteWidget;
