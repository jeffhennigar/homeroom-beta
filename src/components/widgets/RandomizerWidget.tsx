import React, { useState, useEffect, useRef } from 'react';
import { Settings, Shuffle, CheckSquare, Square } from 'lucide-react';
import { WidgetProps } from '../../types';

const RandomizerWidget: React.FC<WidgetProps> = ({ widget, updateData, allRosters = [], activeRosterId, onUpdateRoster }) => {
  const { students = [], currentName, isAnimating, fontSize = 16, rosterId } = widget.data;

  // Decide if we are "Synced"
  const isSynced = !!rosterId;
  const effectiveRoster = isSynced
    ? (allRosters.find(r => r.id === rosterId)?.roster || [])
    : students;

  const [showSettings, setShowSettings] = useState(effectiveRoster.length === 0);
  const [input, setInput] = useState("");
  const steps = useRef(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isAnimating) {
      const active = effectiveRoster.filter(s => s.active);
      if (active.length === 0) {
        updateData(widget.id, { isAnimating: false });
        return;
      }

      intervalRef.current = window.setInterval(() => {
        const randomName = active[Math.floor(Math.random() * active.length)].name;
        updateData(widget.id, { currentName: randomName });
        steps.current++;
        if (steps.current >= 20) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          updateData(widget.id, { isAnimating: false });
          steps.current = 0;
        }
      }, 100);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAnimating, widget.id, effectiveRoster, updateData]);

  const addNames = () => {
    const newS = input.split('\n')
      .map(n => n.trim())
      .filter(n => n)
      .map(name => ({ id: Math.random().toString(36), name, active: true }));
    updateData(widget.id, { students: [...students, ...newS] });
    setInput("");
  };

  const toggleStudent = (id: string) => {
    if (isSynced) {
      // Update GLOBAL roster
      if (rosterId && rosterId !== activeRosterId) {
        alert("Please switch to this class in Settings to mark present/absent.");
        return;
      }
      const updated = effectiveRoster.map(s => s.id === id ? { ...s, active: !s.active } : s);
      if (onUpdateRoster) onUpdateRoster(updated);
    } else {
      // Update Local
      const updated = students.map(s => s.id === id ? { ...s, active: !s.active } : s);
      updateData(widget.id, { students: updated });
    }
  };

  const scaledFontSize = (fontSize / 16) * 30; // Base text size is roughly 30px

  if (showSettings) {
    return (
      <div className="flex flex-col h-full bg-white text-sm">
        <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-700">Class List</h3>
          <button onClick={() => setShowSettings(false)} className="text-blue-600 font-medium hover:text-blue-700">Done</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          <div className="mb-2">
            <select
              value={rosterId || ""}
              onChange={(e) => updateData(widget.id, { rosterId: e.target.value || undefined })}
              className="w-full bg-white border border-gray-300 text-gray-700 text-sm py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Manual Entry (No Sync)</option>
              {allRosters.map(r => (
                <option key={r.id} value={r.id}>Sync with: {r.name}</option>
              ))}
            </select>
            {isSynced && <p className="text-[10px] text-gray-400 mt-1 pl-1">Displaying students from {allRosters.find(r => r.id === rosterId)?.name}</p>}
          </div>

          {effectiveRoster.map(s => (
            <div key={s.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer rounded" onClick={() => toggleStudent(s.id)}>
              {s.active ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} className="text-gray-400" />}
              <span className={`text-black ${!s.active && 'text-gray-400 line-through'}`}>{s.name}</span>
            </div>
          ))}
          {effectiveRoster.length === 0 && <div className="text-gray-400 text-center py-4">No students added</div>}
        </div>
        {!isSynced && (
          <div className="p-3 border-t bg-gray-50">
            <textarea
              className="w-full border rounded p-2 mb-2 focus:ring-2 focus:ring-blue-500 outline-none text-black"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste names here (one per line)..."
              rows={3}
            />
            <button onClick={addNames} disabled={!input.trim()} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded font-medium transition-colors">Add Names</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-indigo-50 relative group">
      <button
        onClick={() => setShowSettings(true)}
        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-indigo-600 hover:bg-white/50 rounded-full transition-all opacity-0 group-hover:opacity-100"
      >
        <Settings size={16} />
      </button>

      <div className="flex-1 flex items-center justify-center w-full">
        <h2
          className="font-bold text-center break-words text-indigo-900 leading-tight transition-all duration-200"
          style={{ fontSize: `${scaledFontSize}px` }}
        >
          {currentName || <span className="text-indigo-200">?</span>}
        </h2>
      </div>

      <button
        onClick={() => { steps.current = 0; updateData(widget.id, { isAnimating: true }); }}
        disabled={isAnimating || effectiveRoster.filter(s => s.active).length === 0}
        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-8 py-3 rounded-full flex gap-2 items-center font-bold shadow-lg transition-all active:scale-95"
      >
        <Shuffle size={18} /> Pick Random
      </button>
    </div>
  );
};

export default RandomizerWidget;