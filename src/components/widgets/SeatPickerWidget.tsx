import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Layout, Shuffle, Edit3, Briefcase, Trash2, X, RotateCw, Armchair, Plus } from 'lucide-react';

const DESK_COLORS = {
    blue: '#3b82f6',
    red: '#ef4444',
    green: '#22c55e',
    yellow: '#eab308',
    purple: '#a855f7',
    orange: '#f97316',
    gray: '#64748b'
};

const SeatPickerWidget = ({ 
    widget, 
    updateData, 
    roster = [], 
    onUpdateRoster, 
    onSelectRoster, 
    allRosters = [], 
    activeRosterId,
    accentColor = 'indigo'
}) => {
    // 1. Destructure data with deep defaults
    const widgetData = widget.data || {};
    const { 
        desks = [], 
        isEditing = false, 
        snapToGrid = 0, 
        fontSize = 16, 
        assignments = {} 
    } = widgetData;

    // 2. Computed State
    const activeClassId = activeRosterId || 'default';
    const activeRoster = roster || [];
    const currentAssignments = useMemo(() => assignments[activeClassId] || {}, [assignments, activeClassId]);
    
    // Derived: Students who are not in the current assignment list for THIS class
    const unseatedStudents = useMemo(() => {
        const seatedNames = Object.values(currentAssignments).filter(Boolean);
        return activeRoster.filter(s => !seatedNames.includes(s.name));
    }, [activeRoster, currentAssignments]);

    // 3. Local Interaction State
    const [selectedIds, setSelectedIds] = useState([]);
    const [dragContext, setDragContext] = useState(null); // { type: 'desk'|'tray', id, initialPos }
    const [rotatingId, setRotatingId] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionBox, setSelectionBox] = useState(null);

    const containerRef = useRef(null);
    const dragStartMouse = useRef({ x: 0, y: 0 });
    const initialPositions = useRef({});

    // 4. Stable Effects
    useEffect(() => {
        console.log(`[SeatPicker] Render: Class=${activeClassId}, Desks=${desks.length}, Roster=${activeRoster.length}, Editing=${isEditing}`);
        if (activeRoster.length > 0) {
            console.log(`[SeatPicker] First Student:`, activeRoster[0]);
        }
    }, [activeClassId, desks.length, activeRoster.length, isEditing]);

    // Auto-assignment logic (simple version)
    useEffect(() => {
        if (!activeRoster.length || desks.length === 0) return;
        
        const seatedNames = Object.values(currentAssignments).filter(Boolean);
        const unseated = activeRoster
            .filter(s => s.active !== false)
            .map(s => typeof s === 'string' ? s : s.name)
            .filter(name => !seatedNames.includes(name));

        const emptyDesks = desks.filter(d => d.type === 'student' && !currentAssignments[d.id]);

        if (unseated.length > 0 && emptyDesks.length > 0) {
            console.log(`[SeatPicker] Auto-assigning ${unseated.length} students`);
            const newAssignments = { ...currentAssignments };
            let updated = false;
            emptyDesks.forEach(d => {
                if (unseated.length > 0) {
                    newAssignments[d.id] = unseated.shift();
                    updated = true;
                }
            });
            if (updated) {
                updateData({ 
                    assignments: { ...assignments, [activeClassId]: newAssignments } 
                });
            }
        }
    }, [activeRoster, desks, activeClassId, widget.id]);

    // Global Pointer Listeners for layout editing
    useEffect(() => {
        if (!isEditing) return;

        const handleMove = (e) => {
            if (isSelecting && selectionBox) {
                const rect = containerRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                setSelectionBox(prev => ({
                    ...prev,
                    x: Math.min(prev.startX, x),
                    y: Math.min(prev.startY, y),
                    w: Math.abs(x - prev.startX),
                    h: Math.abs(y - prev.startY)
                }));
            } else if (dragContext?.type === 'desk' && selectedIds.length > 0) {
                const dx = e.clientX - dragStartMouse.current.x;
                const dy = e.clientY - dragStartMouse.current.y;
                
                // Snap logic applied to the leader
                let leaderDx = dx;
                let leaderDy = dy;
                if (snapToGrid > 0) {
                    const leader = desks.find(d => d.id === dragContext.id);
                    if (leader) {
                        const initLeader = initialPositions.current[leader.id];
                        const rawX = initLeader.x + dx;
                        const rawY = initLeader.y + dy;
                        const snappedX = Math.round(rawX / snapToGrid) * snapToGrid;
                        const snappedY = Math.round(rawY / snapToGrid) * snapToGrid;
                        leaderDx = snappedX - initLeader.x;
                        leaderDy = snappedY - initLeader.y;
                    }
                }

                const newDesks = desks.map(d => {
                    if (selectedIds.includes(d.id)) {
                        const init = initialPositions.current[d.id];
                        if (init) return { ...d, x: init.x + leaderDx, y: init.y + leaderDy };
                    }
                    return d;
                });
                updateData(widget.id, { desks: newDesks });
            } else if (rotatingId) {
                const desk = desks.find(d => d.id === rotatingId);
                if (desk && containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const scale = fontSize / 16;
                    const deskW = (desk.type === 'teacher' ? 140 : 100) * scale;
                    const deskH = (desk.type === 'teacher' ? 80 : 60) * scale;
                    const centerX = rect.left + desk.x + deskW / 2;
                    const centerY = rect.top + desk.y + deskH / 2;
                    let angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
                    if (snapToGrid > 0) angle = Math.round(angle / 15) * 15;
                    const newDesks = desks.map(d => d.id === rotatingId ? { ...d, rotation: angle + 45 } : d);
                    updateData(widget.id, { desks: newDesks });
                }
            }
        };

        const handleUp = () => {
            if (isSelecting && selectionBox) {
                const rect = selectionBox;
                const scale = fontSize / 16;
                const newlySelected = desks.filter(d => {
                    const dW = (d.type === 'teacher' ? 140 : 100) * scale;
                    const dH = (d.type === 'teacher' ? 80 : 60) * scale;
                    const cx = d.x + dW / 2;
                    const cy = d.y + dH / 2;
                    return cx >= rect.x && cx <= rect.x + rect.w && cy >= rect.y && cy <= rect.y + rect.h;
                }).map(d => d.id);
                setSelectedIds(newlySelected);
            }
            setDragContext(null);
            setRotatingId(null);
            setIsSelecting(false);
            setSelectionBox(null);
        };

        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
        return () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
        };
    }, [isEditing, dragContext, rotatingId, isSelecting, selectionBox, desks, selectedIds, snapToGrid, fontSize]);

    // 5. Handlers
    const handleAddDesk = (type = 'student') => {
        const id = `desk-${Date.now()}`;
        const newDesk = {
            id,
            x: 50,
            y: 50,
            type,
            color: type === 'teacher' ? 'gray' : 'blue',
            rotation: 0
        };
        updateData(widget.id, { desks: [...desks, newDesk] });
        setSelectedIds([id]);
    };

    const handleShuffle = () => {
        const activeNames = activeRoster
            .filter(s => s.active !== false)
            .map(s => typeof s === 'string' ? s : s.name);
        if (activeNames.length === 0) {
            console.warn('[SeatPicker] handleShuffle: activeNames is empty', activeRoster);
            return;
        }

        // If no desks, generate a grid
        if (desks.length === 0) {
            const cols = 6;
            const generated = [
                { id: `teacher-${Date.now()}`, x: 250, y: 20, type: 'teacher', color: 'gray', rotation: 0 },
                ...activeNames.map((name, i) => ({
                    id: `gen-${Date.now()}-${i}`,
                    x: (i % cols) * 125 + 50,
                    y: Math.floor(i / cols) * 90 + 120,
                    type: 'student',
                    color: 'blue',
                    rotation: 0
                }))
            ];
            const newAssignments = { ...assignments, [activeClassId]: {} };
            generated.forEach(d => { if (d.type === 'student') newAssignments[activeClassId][d.id] = activeNames.shift(); });
            updateData(widget.id, { desks: generated, assignments: newAssignments });
            return;
        }

        // Otherwise, shuffle students in existing student desks
        const studentDesks = desks.filter(d => d.type === 'student');
        const shuffledNames = [...activeNames].sort(() => Math.random() - 0.5);
        const newAssignments = { ...assignments, [activeClassId]: {} };
        
        studentDesks.forEach(d => {
            if (shuffledNames.length > 0) {
                newAssignments[activeClassId][d.id] = shuffledNames.shift();
            }
        });
        updateData(widget.id, { assignments: newAssignments });
    };

    const handleDeskPointerDown = (e, deskId) => {
        if (!isEditing) return;
        e.stopPropagation();
        
        let newIds = [...selectedIds];
        if (e.ctrlKey || e.metaKey) {
            newIds = newIds.includes(deskId) ? newIds.filter(id => id !== deskId) : [...newIds, deskId];
        } else if (!newIds.includes(deskId)) {
            newIds = [deskId];
        }
        setSelectedIds(newIds);
        setDragContext({ type: 'desk', id: deskId });
        dragStartMouse.current = { x: e.clientX, y: e.clientY };
        const pos = {};
        desks.forEach(d => pos[d.id] = { x: d.x, y: d.y });
        initialPositions.current = pos;
    };

    const handleBgPointerDown = (e) => {
        if (!isEditing) { setSelectedIds([]); return; }
        if (e.target !== containerRef.current) return;
        
        setSelectedIds([]);
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setIsSelecting(true);
        setSelectionBox({ startX: x, startY: y, x, y, w: 0, h: 0 });
    };

    const handleStudentDragStart = (e, sourceId, name) => {
        if (isEditing) return;
        e.dataTransfer.setData('sourceDeskId', sourceId || '');
        e.dataTransfer.setData('studentName', name);
    };

    const handleStudentDrop = (e, targetDeskId) => {
        if (isEditing) return;
        e.preventDefault();
        const studentName = e.dataTransfer.getData('studentName');
        const sourceDeskId = e.dataTransfer.getData('sourceDeskId');
        
        const newAssignments = { ...assignments, [activeRosterId || 'default']: { ...(assignments[activeRosterId || 'default'] || {}) } };
        
        // 1. If it came from a desk, clear that desk
        if (sourceDeskId) {
            const targetStudent = newAssignments[activeClassId][targetDeskId];
            newAssignments[activeClassId][sourceDeskId] = targetStudent || null;
        } else {
            // Came from tray, check if student was already seated elsewhere
            const prevDesk = Object.keys(newAssignments[activeClassId]).find(k => newAssignments[activeClassId][k] === studentName);
            if (prevDesk) newAssignments[activeClassId][prevDesk] = null;
        }

        // 2. Assign to target
        newAssignments[activeClassId][targetDeskId] = studentName;
        updateData(widget.id, { assignments: newAssignments });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden select-none no-drag">
            {/* Header */}
            <div className="h-12 bg-white border-b flex items-center justify-between px-4 z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <Layout size={18} className="text-slate-400" />
                    {allRosters.length > 1 ? (
                        <select 
                            value={activeClassId} 
                            onChange={(e) => onSelectRoster?.(e.target.value)}
                            className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer hover:bg-slate-100 rounded px-1 -ml-1 transition-colors"
                        >
                            {allRosters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    ) : (
                        <span className="font-bold text-slate-700">Class Layout</span>
                    )}
                </div>

                <div className="flex gap-2">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            {/* Snap Toggle */}
                            <button 
                                onClick={() => updateData(widget.id, { snapToGrid: snapToGrid > 0 ? 0 : 20 })}
                                className={`px-2 py-1 rounded text-[10px] font-black uppercase transition-all ${snapToGrid > 0 ? (accentColor === 'rose' ? 'bg-rose-100 text-rose-700' : accentColor === 'blue' ? 'bg-blue-100 text-blue-700' : accentColor === 'purple' ? 'bg-purple-100 text-purple-700' : accentColor === 'emerald' ? 'bg-emerald-100 text-emerald-700' : accentColor === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700') : 'bg-slate-100 text-slate-400'}`}
                            >
                                Snap {snapToGrid > 0 ? 'On' : 'Off'}
                            </button>
                            
                            {/* Font Size */}
                            <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                                <button onClick={() => updateData(widget.id, { fontSize: Math.max(10, fontSize - 2) })} className="px-2 hover:bg-white rounded transition-colors text-slate-600 font-bold">−</button>
                                <span className="w-8 text-center text-[10px] font-black text-slate-500">{fontSize}</span>
                                <button onClick={() => updateData(widget.id, { fontSize: Math.min(32, fontSize + 2) })} className="px-2 hover:bg-white rounded transition-colors text-slate-600 font-bold">+</button>
                            </div>

                            <div className="w-px h-6 bg-slate-200 mx-1" />

                            {/* Desk Tools */}
                            <div className="flex gap-1 items-center bg-slate-100 rounded-lg p-0.5">
                                {Object.entries(DESK_COLORS).map(([name, color]) => (
                                    name !== 'gray' && (
                                        <button 
                                            key={name}
                                            onClick={() => {
                                                if (selectedIds.length > 0) {
                                                    const newDesks = desks.map(d => selectedIds.includes(d.id) ? { ...d, color: name } : d);
                                                    updateData(widget.id, { desks: newDesks });
                                                } else {
                                                    handleAddDesk(name);
                                                }
                                            }}
                                            className="w-5 h-5 rounded-full border border-white shadow-sm hover:scale-110 transition-transform"
                                            style={{ backgroundColor: color }}
                                        />
                                    )
                                ))}
                                <button onClick={() => handleAddDesk('teacher')} className="px-2 py-1 bg-slate-600 text-white rounded text-[10px] font-bold flex items-center gap-1 hover:bg-slate-700 ml-1">
                                    <Plus size={10} /> Teacher
                                </button>
                            </div>

                            {selectedIds.length > 0 && (
                                <button 
                                    onClick={() => {
                                        updateData(widget.id, { desks: desks.filter(d => !selectedIds.includes(d.id)) });
                                        setSelectedIds([]);
                                    }}
                                    className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}

                            <button onClick={() => updateData(widget.id, { isEditing: false })} className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-emerald-700 ml-2">Done</button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={handleShuffle} className={`px-3 py-1.5 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors ${accentColor === 'rose' ? 'bg-rose-600 hover:bg-rose-700' : accentColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : accentColor === 'purple' ? 'bg-purple-600 hover:bg-purple-700' : accentColor === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : accentColor === 'amber' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                <Shuffle size={14} /> Shuffle
                            </button>
                            <button onClick={() => updateData(widget.id, { isEditing: true })} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-colors">
                                <Edit3 size={14} /> Edit
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-h-0 relative">
                <div 
                    ref={containerRef} 
                    className={`flex-1 relative overflow-hidden ${isEditing ? 'cursor-crosshair' : ''}`}
                    onPointerDown={handleBgPointerDown}
                    style={{ 
                        backgroundImage: isEditing ? 'radial-gradient(#cbd5e1 1px, transparent 1px)' : 'none',
                        backgroundSize: '20px 20px'
                    }}
                >
                    {desks.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                            <Armchair size={64} strokeWidth={1} className="mb-4 opacity-30" />
                            <p className="text-sm font-medium">No seats in this layout yet</p>
                            <button onClick={handleShuffle} className={`mt-4 px-4 py-2 rounded-full text-xs font-bold transition-colors ${accentColor === 'rose' ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : accentColor === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : accentColor === 'purple' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : accentColor === 'emerald' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : accentColor === 'amber' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}>
                                Auto-Generate Grid
                            </button>
                        </div>
                    ) : (desks || []).map(desk => {
                        const student = currentAssignments[desk.id];
                        const isSelected = selectedIds.includes(desk.id);
                        const isAbsent = student && (activeRoster || []).find(s => (s?.name === student || s === student) && !s?.active);
                        const scale = fontSize / 16;
                        const deskW = (desk.type === 'teacher' ? 140 : 100) * scale;
                        const deskH = (desk.type === 'teacher' ? 80 : 60) * scale;
                        const colorHex = DESK_COLORS[desk.color] || DESK_COLORS.blue;

                        return (
                            <div 
                                key={desk.id}
                                onPointerDown={(e) => handleDeskPointerDown(e, desk.id)}
                                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                                onDrop={(e) => handleStudentDrop(e, desk.id)}
                                className={`absolute shadow-sm border-2 flex items-center justify-center transition-shadow ${isEditing ? 'cursor-move' : (student ? 'cursor-grab active:cursor-grabbing' : 'cursor-default')} ${isSelected ? (accentColor === 'rose' ? 'ring-rose-500' : accentColor === 'blue' ? 'ring-blue-500' : accentColor === 'purple' ? 'ring-purple-500' : accentColor === 'emerald' ? 'ring-emerald-500' : accentColor === 'amber' ? 'ring-amber-500' : 'ring-indigo-500') + ' ring-2 ring-offset-2 z-20' : 'z-10'} ${desk.type === 'teacher' ? 'rounded-md' : 'rounded-xl'} ${isAbsent ? 'opacity-50' : ''}`}
                                style={{
                                    left: desk.x,
                                    top: desk.y,
                                    width: deskW,
                                    height: deskH,
                                    transform: `rotate(${desk.rotation || 0}deg)`,
                                    backgroundColor: isSelected ? 'white' : (desk.type === 'teacher' ? colorHex : colorHex + '10'),
                                    borderColor: colorHex,
                                    color: desk.type === 'teacher' ? 'white' : '#1e293b'
                                }}
                                draggable={!isEditing && !!student}
                                onDragStart={(e) => handleStudentDragStart(e, desk.id, student)}
                            >
                                {isEditing && (
                                    <>
                                        {/* Delete Button */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); updateData(widget.id, { desks: desks.filter(d => d.id !== desk.id) }); }}
                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            <X size={12} strokeWidth={3} />
                                        </button>
                                        {/* Rotation Handle */}
                                        <div 
                                            onPointerDown={(e) => { e.stopPropagation(); setRotatingId(desk.id); }}
                                            className={`absolute -top-3 -left-3 w-6 h-6 text-white rounded-full flex items-center justify-center cursor-alias shadow-sm transition-colors ${accentColor === 'rose' ? 'bg-rose-500 hover:bg-rose-600' : accentColor === 'blue' ? 'bg-blue-500 hover:bg-blue-600' : accentColor === 'purple' ? 'bg-purple-500 hover:bg-purple-600' : accentColor === 'emerald' ? 'bg-emerald-500 hover:bg-emerald-600' : accentColor === 'amber' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-500 hover:bg-indigo-600'}`}
                                        >
                                            <RotateCw size={12} strokeWidth={3} />
                                        </div>
                                    </>
                                )}

                                {desk.type === 'teacher' ? (
                                    <div className="flex flex-col items-center opacity-90">
                                        <Briefcase size={20} className="mb-1" />
                                        <span className="text-[9px] font-black uppercase tracking-tighter">Teacher</span>
                                    </div>
                                ) : (
                                    student ? (
                                        <span className={`font-black text-center px-1 truncate w-full ${isAbsent ? 'line-through decoration-red-500' : ''}`} style={{ fontSize: fontSize }}>
                                            {student}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold opacity-20 uppercase">Empty</span>
                                    )
                                )}

                                {/* Absence Indicator */}
                                {!isEditing && isAbsent && (
                                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm">OUT</div>
                                )}
                            </div>
                        );
                    })}

                    {/* Selection Box Visual */}
                    {isSelecting && selectionBox && (
                        <div 
                            className={`absolute border-2 pointer-events-none z-50 rounded-sm ${accentColor === 'rose' ? 'border-rose-500 bg-rose-500/10' : accentColor === 'blue' ? 'border-blue-500 bg-blue-500/10' : accentColor === 'purple' ? 'border-purple-500 bg-purple-500/10' : accentColor === 'emerald' ? 'border-emerald-500 bg-emerald-500/10' : accentColor === 'amber' ? 'border-amber-500 bg-amber-500/10' : 'border-indigo-500 bg-indigo-500/10'}`} 
                            style={{ 
                                left: selectionBox.x, 
                                top: selectionBox.y, 
                                width: selectionBox.w, 
                                height: selectionBox.h 
                            }} 
                        />
                    )}
                </div>

                {/* Tray */}
                {isEditing && unseatedStudents.length > 0 && (
                    <div className="h-20 bg-white border-t flex flex-col shrink-0">
                        <div className="px-4 py-1 flex items-center justify-between border-b">
                            <span className="text-[10px] font-black uppercase text-slate-400">Unassigned Students</span>
                            <span className="text-[10px] font-bold text-slate-400">{unseatedStudents.length} items</span>
                        </div>
                        <div className="flex-1 flex items-center gap-2 px-4 overflow-x-auto custom-scrollbar">
                            {(unseatedStudents || []).map(student => (
                                <div 
                                    key={student?.name || Math.random().toString()}
                                    draggable
                                    onDragStart={(e) => handleStudentDragStart(e, null, student?.name)}
                                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600 cursor-grab active:cursor-grabbing hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all whitespace-nowrap shadow-sm"
                                >
                                    {student?.name || "Unknown"}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </div>
    );
};

export default SeatPickerWidget;