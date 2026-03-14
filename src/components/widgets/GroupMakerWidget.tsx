import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Users, Shuffle, Settings2, Trash2, RotateCw, Type, X, ChevronRight, ChevronLeft } from 'lucide-react';

const FONT_SIZES = {
    S: 12,
    M: 16,
    L: 20
};

const GroupMakerWidget = ({ 
    widget, 
    updateData, 
    updateSize,
    roster = [], 
    allRosters = [], 
    activeRosterId,
    accentColor = 'indigo'
}) => {
    // 1. Destructure data with deep defaults
    const widgetData = widget.data || {};
    const { 
        groups = [], 
        groupCount = 4, 
        rosterId = activeRosterId || 'default',
        fontSizeKey = 'M'
    } = widgetData;

    const fontSize = FONT_SIZES[fontSizeKey] || 16;

    // 2. Computed State
    const activeRoster = useMemo(() => {
        if (rosterId === 'default' || !rosterId) return roster;
        const found = allRosters.find(r => r.id === rosterId);
        return found ? found.roster : roster;
    }, [rosterId, roster, allRosters]);

    const activeStudents = useMemo(() => activeRoster.filter(s => s.active !== false), [activeRoster]);
    const studentCount = activeStudents.length;

    // 3. Local State
    const [draggedStudent, setDraggedStudent] = useState(null); // { student, fromGroupIdx }
    const [dragOverIdx, setDragOverIdx] = useState(null);
    const containerRef = useRef(null);

    // 4. Effects
    useEffect(() => {
        console.log(`[GroupMaker] Render: Mode=${groups.length > 0 ? 'Generated' : 'Setup'}, Roster=${activeStudents.length}, Groups=${groups.length}`);
    }, [groups.length, activeStudents.length]);

    // Auto-Resize Height logic (Parity with Pro behavior)
    useEffect(() => {
        if (groups.length === 0 || !containerRef.current) return;
        
        const updateHeight = () => {
            const mainArea = containerRef.current;
            if (!mainArea) return;
            
            const maxGroupSize = groups.reduce((max, g) => Math.max(max, g.length), 0);
            const headerHeight = 48; // Widget Header
            const subheaderHeight = 40; // Present: X indicator
            const footerHeight = 100; // Shuffle controls
            const groupHeaderHeight = 32;
            const studentItemHeight = fontSize + 12; // Adjusted for padding
            
            const contentHeight = headerHeight + subheaderHeight + groupHeaderHeight + (maxGroupSize * studentItemHeight) + footerHeight + 40;
            const finalHeight = Math.min(Math.max(400, contentHeight), 800);

            if (updateSize && widget.size && Math.abs(widget.size.height - finalHeight) > 30) {
                updateSize({ height: finalHeight });
            }
        };

        const timeout = setTimeout(updateHeight, 100);
        return () => clearTimeout(timeout);
    }, [groups, fontSize, widget.size?.width]);

    // 5. Handlers
    const handleGenerate = (count = groupCount) => {
        if (activeStudents.length === 0) return;
        
        const shuffled = [...activeStudents].sort(() => Math.random() - 0.5);
        const newGroups = Array.from({ length: count }, () => []);
        
        shuffled.forEach((student, i) => {
            newGroups[i % count].push(student);
        });
        
        updateData({ groups: newGroups, groupCount: count });
    };

    const handleReset = () => {
        updateData({ groups: [] });
    };

    const handleDragStart = (e, student, groupIdx) => {
        console.log(`[GroupMaker] Drag Start: student=${student.name}, groupIdx=${groupIdx}`);
        setDraggedStudent({ student, fromGroupIdx: groupIdx });
        e.dataTransfer.effectAllowed = 'move';
        // Some browsers require setData to initiate drag
        e.dataTransfer.setData('text/plain', student.id);
    };

    const handleDragOver = (e, idx) => {
        e.preventDefault();
        if (dragOverIdx !== idx) {
            console.log(`[GroupMaker] Drag Over: groupIdx=${idx}`);
            setDragOverIdx(idx);
        }
    };

    const handleDrop = (e, toGroupIdx) => {
        e.preventDefault();
        console.log(`[GroupMaker] Drop: onto index ${toGroupIdx}, draggedStudent=`, draggedStudent);
        setDragOverIdx(null);
        if (!draggedStudent) return;

        const { student, fromGroupIdx } = draggedStudent;
        if (fromGroupIdx === toGroupIdx) return;

        const newGroups = groups.map(g => [...g]);
        // Remove from source
        newGroups[fromGroupIdx] = newGroups[fromGroupIdx].filter(s => s.id !== student.id);
        // Add to target
        newGroups[toGroupIdx].push(student);

        updateData({ groups: newGroups });
        setDraggedStudent(null);
    };

    // 6. Sub-components for cleaner render
    const SetupView = () => (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
            <div className={`w-20 h-20 ${accentColor === 'rose' ? 'bg-rose-50 text-rose-500 border-rose-100' : accentColor === 'blue' ? 'bg-blue-50 text-blue-500 border-blue-100' : accentColor === 'purple' ? 'bg-purple-50 text-purple-500 border-purple-100' : accentColor === 'emerald' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : accentColor === 'amber' ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-indigo-50 text-indigo-500 border-indigo-100'} rounded-3xl flex items-center justify-center mb-6 shadow-sm border`}>
                <Users size={40} strokeWidth={1.5} />
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 mb-2">Group Maker</h2>
            <p className="text-slate-400 text-sm font-medium max-w-[280px] mb-8 leading-relaxed">
                Divide your class into randomized groups instantly.
            </p>

            <div className="w-full max-w-[320px] space-y-6">
                {/* Roster Selection */}
                <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Class</label>
                    <div className="relative group">
                        <select 
                            value={rosterId}
                            onChange={(e) => updateData({ rosterId: e.target.value })}
                            className={`w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 text-sm font-bold text-slate-700 appearance-none focus:outline-none transition-all cursor-pointer ${accentColor === 'rose' ? 'focus:border-rose-400' : accentColor === 'blue' ? 'focus:border-blue-400' : accentColor === 'purple' ? 'focus:border-purple-400' : accentColor === 'emerald' ? 'focus:border-emerald-400' : accentColor === 'amber' ? 'focus:border-amber-400' : 'focus:border-indigo-400'}`}
                        >
                            <option value="default">Active Class ({roster.length})</option>
                            {allRosters.map(r => (
                                <option key={r.id} value={r.id}>{r.name} ({r.roster.length})</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronDown size={18} />
                        </div>
                    </div>
                </div>

                {/* Group Slider */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Number of Groups</label>
                        <span className={`text-2xl font-black leading-none ${accentColor === 'rose' ? 'text-rose-600' : accentColor === 'blue' ? 'text-blue-600' : accentColor === 'purple' ? 'text-purple-600' : accentColor === 'emerald' ? 'text-emerald-600' : accentColor === 'amber' ? 'text-amber-600' : 'text-indigo-600'}`}>{groupCount}</span>
                    </div>
                    <div className="relative h-2 bg-slate-100 rounded-full group">
                        <input 
                            type="range"
                            min="2"
                            max="12"
                            value={groupCount}
                            onChange={(e) => updateData({ groupCount: parseInt(e.target.value) })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div 
                            className={`absolute top-0 left-0 h-full rounded-full transition-all ${accentColor === 'rose' ? 'bg-rose-500' : accentColor === 'blue' ? 'bg-blue-500' : accentColor === 'purple' ? 'bg-purple-500' : accentColor === 'emerald' ? 'bg-emerald-500' : accentColor === 'amber' ? 'bg-amber-500' : 'bg-indigo-500'}`}
                            style={{ width: `${((groupCount - 2) / (12 - 2)) * 100}%` }}
                        />
                        <div 
                            className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 rounded-full shadow-md z-0 transition-all pointer-events-none ${accentColor === 'rose' ? 'border-rose-500' : accentColor === 'blue' ? 'border-blue-500' : accentColor === 'purple' ? 'border-purple-500' : accentColor === 'emerald' ? 'border-emerald-500' : accentColor === 'amber' ? 'border-amber-500' : 'border-indigo-500'}`}
                            style={{ left: `calc(${((groupCount - 2) / (12 - 2)) * 100}% - 10px)` }}
                        />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 text-center">
                        ~ {Math.ceil(studentCount / groupCount)} students per group
                    </p>
                </div>

                <button 
                    onClick={() => handleGenerate()}
                    disabled={studentCount === 0}
                    className={`w-full h-14 disabled:bg-slate-200 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${accentColor === 'rose' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100' : accentColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : accentColor === 'purple' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-100' : accentColor === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : accentColor === 'amber' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
                >
                    <Shuffle size={18} strokeWidth={3} />
                    Generate Groups
                </button>
            </div>
        </div>
    );

    const GeneratedView = () => (
        <div className="flex-1 flex flex-col bg-slate-50 h-full min-h-0 relative">
            {/* Sub-header */}
            <div className="h-10 px-4 flex items-center justify-between border-b bg-white/50 backdrop-blur-sm sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${accentColor === 'rose' ? 'bg-rose-100 text-rose-700' : accentColor === 'blue' ? 'bg-blue-100 text-blue-700' : accentColor === 'purple' ? 'bg-purple-100 text-purple-700' : accentColor === 'emerald' ? 'bg-emerald-100 text-emerald-700' : accentColor === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        Present: {studentCount}
                    </div>
                    <div className="flex bg-slate-100 rounded-lg p-0.5">
                        {['S', 'M', 'L'].map(key => (
                            <button 
                                key={key}
                                onClick={() => updateData({ fontSizeKey: key })}
                                className={`w-7 h-6 rounded-md text-[10px] font-black transition-all ${fontSizeKey === key ? 'bg-white shadow-sm ' + (accentColor === 'rose' ? 'text-rose-600' : accentColor === 'blue' ? 'text-blue-600' : accentColor === 'purple' ? 'text-purple-600' : accentColor === 'emerald' ? 'text-emerald-600' : accentColor === 'amber' ? 'text-amber-600' : 'text-indigo-600') : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {key}
                            </button>
                        ))}
                    </div>
                </div>
                <button 
                    onClick={handleReset}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                >
                    Reset
                </button>
            </div>

            {/* Groups Grid */}
            <div ref={containerRef} className="flex-1 overflow-x-auto overflow-y-auto p-4 flex gap-4 content-start min-h-0 custom-scrollbar group-container">
                {(groups || []).map((group, idx) => (
                    <div 
                        key={idx} 
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnter={(e) => handleDragOver(e, idx)}
                        onDragLeave={() => setDragOverIdx(null)}
                        onDrop={(e) => handleDrop(e, idx)}
                        className={`flex-none w-48 bg-white rounded-2xl border ${dragOverIdx === idx ? (accentColor === 'rose' ? 'border-rose-500 ring-rose-500/10' : accentColor === 'blue' ? 'border-blue-500 ring-blue-500/10' : accentColor === 'purple' ? 'border-purple-500 ring-purple-500/10' : accentColor === 'emerald' ? 'border-emerald-500 ring-emerald-500/10' : accentColor === 'amber' ? 'border-amber-500 ring-amber-500/10' : 'border-indigo-500 ring-indigo-500/10') + ' ring-4 scale-[1.02]' : 'border-slate-200/60'} shadow-sm flex flex-col min-h-0 h-fit max-h-full transition-all duration-200`}
                    >
                        <div className="p-3 border-b flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Group {idx + 1}</span>
                            <span className="text-[10px] font-bold text-slate-300 bg-white px-1.5 py-0.5 rounded-full border border-slate-100">{(group || []).length}</span>
                        </div>
                        <div className="p-2 space-y-1 overflow-y-auto min-h-[40px]">
                            {(group || []).map(student => (
                                <div 
                                    key={student?.id || Math.random().toString()}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, student, idx)}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className={`px-3 py-2 bg-slate-50 hover:bg-white border border-transparent rounded-xl text-slate-600 font-bold transition-all cursor-grab active:cursor-grabbing hover:shadow-sm whitespace-nowrap overflow-hidden text-ellipsis select-text ${accentColor === 'rose' ? 'hover:border-rose-100' : accentColor === 'blue' ? 'hover:border-blue-100' : accentColor === 'purple' ? 'hover:border-purple-100' : accentColor === 'emerald' ? 'hover:border-emerald-100' : accentColor === 'amber' ? 'hover:border-amber-100' : 'hover:border-indigo-100'}`}
                                    style={{ fontSize: fontSize }}
                                >
                                    {student?.name || "Unknown"}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Controls */}
            <div className="p-4 bg-white border-t space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-end px-1">
                    <span className="text-[10px] font-black uppercase text-slate-400">Total Groups</span>
                    <span className="text-xl font-black text-slate-800">{groupCount}</span>
                </div>
                <div className="relative h-2 bg-slate-100 rounded-full">
                    <input 
                        type="range" min="2" max="20" value={groupCount}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            updateData({ groupCount: val });
                            handleGenerate(val);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div 
                        className={`absolute top-0 left-0 h-full rounded-full transition-all ${accentColor === 'rose' ? 'bg-rose-500' : accentColor === 'blue' ? 'bg-blue-500' : accentColor === 'purple' ? 'bg-purple-500' : accentColor === 'emerald' ? 'bg-emerald-500' : accentColor === 'amber' ? 'bg-amber-500' : 'bg-indigo-500'}`}
                        style={{ width: `${((groupCount - 2) / (20 - 2)) * 100}%` }}
                    />
                </div>
                <button 
                    onClick={() => handleGenerate()}
                    className={`w-full h-12 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${accentColor === 'rose' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100' : accentColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : accentColor === 'purple' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-100' : accentColor === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : accentColor === 'amber' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
                >
                    <Shuffle size={14} strokeWidth={3} /> Shuffle Groups
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden no-drag">
            {/* Global Widget Header */}
            <div className="h-12 bg-white border-b flex items-center justify-between px-4 z-30 shrink-0">
                <div className={`flex items-center gap-2 ${accentColor === 'rose' ? 'text-rose-600' : accentColor === 'blue' ? 'text-blue-600' : accentColor === 'purple' ? 'text-purple-600' : accentColor === 'emerald' ? 'text-emerald-600' : accentColor === 'amber' ? 'text-amber-600' : 'text-indigo-600'}`}>
                    <Users size={20} strokeWidth={2.5} />
                    <span className="font-black text-slate-800 uppercase tracking-tighter text-sm">Group Maker</span>
                </div>
                <button 
                    onClick={() => updateData({ groups: [] })}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                    title="Reset / Reconfigure"
                >
                    <RotateCw size={18} />
                </button>
            </div>

            {groups.length === 0 ? <SetupView /> : <GeneratedView />}

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                
                .group-container {
                    scrollbar-gutter: stable;
                }

                /* Custom range input styling */
                input[type='range']::-webkit-slider-thumb {
                    pointer-events: all;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: white;
                    border: 2px solid ${accentColor === 'rose' ? '#e11d48' : accentColor === 'blue' ? '#2563eb' : accentColor === 'purple' ? '#9333ea' : accentColor === 'emerald' ? '#059669' : accentColor === 'amber' ? '#d97706' : '#4f46e5'};
                    cursor: pointer;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                    appearance: none;
                }
            `}} />
        </div>
    );
};

const ChevronDown = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

export default GroupMakerWidget;