import React, { useState, useRef, useEffect } from 'react';
import { Layout, Shuffle, Edit3, Briefcase, Trash2, X, RotateCw } from 'lucide-react';

const DESK_COLORS = {
    blue: 'bg-blue-50 border-blue-400',
    red: 'bg-red-50 border-red-400',
    green: 'bg-green-50 border-green-400',
    yellow: 'bg-yellow-50 border-yellow-400'
};

const SeatPickerWidget = ({ widget, updateData, roster, onUpdateRoster, allRosters = [], activeRosterId }) => {
    const { desks = [], isEditing = false, snapToGrid = 0, fontSize = 16 } = widget.data;
    const containerRef = useRef(null);

    const [draggedDesk, setDraggedDesk] = useState(null);
    const [rotatingDesk, setRotatingDesk] = useState(null);
    const [selectedDeskIds, setSelectedDeskIds] = useState([]); // Array for multi-select

    // Selection Box State
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionBox, setSelectionBox] = useState(null); // { x, y, w, h } relative to container

    const dragStartMouse = useRef({ x: 0, y: 0 });
    const initialDeskPositions = useRef({});

    // Determine Effective Roster
    const effectiveRoster = widget.data.rosterId
        ? (allRosters.find(r => r.id === widget.data.rosterId)?.roster || [])
        : roster;

    // Roster Sync
    useEffect(() => {
        const allStudentNames = effectiveRoster.map(s => s.name);
        let currentDesks = Array.isArray(desks) ? [...desks] : [];
        let needsUpdate = false;

        // Ensure students are seated or new desks created
        const seated = currentDesks.map(d => d.student).filter(Boolean);
        const unseated = allStudentNames.filter(name => !seated.includes(name));

        if (unseated.length > 0) {
            needsUpdate = true;
            // Fill empty spots first
            currentDesks = currentDesks.map(d => {
                if (d.type !== "teacher" && !d.student && unseated.length > 0) { return { ...d, student: unseated.shift() }; }
                return d;
            });
            // Create new desks for remaining
            for (var i = 0; i < unseated.length; i++) {
                currentDesks.push({ id: Date.now() + Math.random(), x: 50 + (i % 5) * 110, y: 50 + Math.floor(i / 5) * 80 + 100, student: unseated[i], color: "blue", type: "student", rotation: 0 });
            }
        }
        if (needsUpdate) updateData(widget.id, { desks: currentDesks });
    }, [effectiveRoster, widget.id]);

    const toggleAbsence = (studentName, e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (!studentName) return;

        // If tied to a specific roster, update THAT roster
        if (widget.data.rosterId) {
            // We can't update a specific roster via onUpdateRoster easily if it expects the *current* global roster.
            // But onUpdateRoster in App.tsx just setsRoster and updates allRosters if active matches.
            // We might need a new onUpdateSpecificRoster prop or handle it here via dataService if we were deep in it.
            // For now, let's disable toggling absence for non-active rosters OR just assume we only toggle if it matches global?
            // Actually App.tsx 'handleUpdateRoster' updates 'roster' state and 'allRosters' state.
            // If we are editing a non-active roster, we need a way to save it. 
            // Let's defer absence toggling for non-active rosters for now or assume it only works for active.
            // Wait, if I click "OUT" on a student on Slide 2 (Class B), and Class A is active... what happens?
            // It calls `toggleAbsence`.
            // `onUpdateRoster` logic:
            // const handleUpdateRoster = (newRoster) => { setRoster(newRoster); ... }
            // It sets the GLOBAL roster. This is bad if we are viewing Class B.
            // We should only call onUpdateRoster if effectiveRoster === globalRoster.
            if (widget.data.rosterId && widget.data.rosterId !== activeRosterId) {
                alert("Please switch to this class in Settings to mark attendance.");
                return;
            }
        }

        const updated = effectiveRoster.map(s => s.name === studentName ? { ...s, active: !s.active } : s);
        onUpdateRoster(updated);
    };

    const handleMouseDown = (e, deskId) => {
        if (!isEditing) return;
        e.stopPropagation();

        let newSelection = [...selectedDeskIds];
        if (e.ctrlKey || e.metaKey) {
            if (newSelection.includes(deskId)) newSelection = newSelection.filter(id => id !== deskId);
            else newSelection.push(deskId);
        } else {
            if (!newSelection.includes(deskId)) newSelection = [deskId];
        }

        setSelectedDeskIds(newSelection);
        setDraggedDesk(deskId);

        // Capture initial state for drag
        dragStartMouse.current = { x: e.clientX, y: e.clientY };
        const initialPos = {};
        desks.forEach(d => { initialPos[d.id] = { x: d.x, y: d.y }; });
        initialDeskPositions.current = initialPos;
    };

    const handleBgMouseDown = (e) => {
        if (!isEditing) { setSelectedDeskIds([]); return; }
        if (e.target !== containerRef.current) return;
        setSelectedDeskIds([]);
        const rect = containerRef.current.getBoundingClientRect();
        setIsSelecting(true);
        setSelectionBox({ startX: e.nativeEvent.offsetX, startY: e.nativeEvent.offsetY, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, w: 0, h: 0 });
    };

    const handleRotateMouseDown = (e, deskId) => { if (!isEditing) return; e.stopPropagation(); setRotatingDesk(deskId); };

    const handleGlobalMouseMove = (e) => {
        if (isSelecting && selectionBox) {
            const rect = containerRef.current.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            const x = Math.min(selectionBox.startX, currentX);
            const y = Math.min(selectionBox.startY, currentY);
            const w = Math.abs(currentX - selectionBox.startX);
            const h = Math.abs(currentY - selectionBox.startY);
            setSelectionBox(prev => ({ ...prev, x, y, w, h }));
        }
        else if (draggedDesk && isEditing) {
            e.stopPropagation(); e.preventDefault();
            const totalDx = e.clientX - dragStartMouse.current.x;
            const totalDy = e.clientY - dragStartMouse.current.y;

            // Calculate "Leader" new position (the one we clicked)
            const leaderStart = initialDeskPositions.current[draggedDesk];
            if (!leaderStart) return;

            let rawNewX = leaderStart.x + totalDx;
            let rawNewY = leaderStart.y + totalDy;

            // Snap the leader
            let finalLeaderX = rawNewX;
            let finalLeaderY = rawNewY;

            if (snapToGrid > 0) {
                finalLeaderX = Math.round(rawNewX / snapToGrid) * snapToGrid;
                finalLeaderY = Math.round(rawNewY / snapToGrid) * snapToGrid;
            }

            // Calculate effective delta to apply to all selected items
            const effectiveDx = finalLeaderX - leaderStart.x;
            const effectiveDy = finalLeaderY - leaderStart.y;

            updateData(widget.id, {
                desks: desks.map(d => {
                    if (selectedDeskIds.includes(d.id)) {
                        const start = initialDeskPositions.current[d.id];
                        if (!start) return d;
                        return { ...d, x: start.x + effectiveDx, y: start.y + effectiveDy };
                    }
                    return d;
                })
            });
        }
        else if (rotatingDesk && isEditing) {
            e.preventDefault();
            const desk = desks.find(d => d.id === rotatingDesk);
            const scale = fontSize / 16;
            const deskW = (desk ? (desk.type === 'teacher' ? 154 : 110) : 110) * scale;
            const deskH = (desk ? (desk.type === 'teacher' ? 80 : 60) : 60) * scale;
            if (desk && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const deskCenterX = rect.left + desk.x + deskW / 2;
                const deskCenterY = rect.top + desk.y + deskH / 2;
                const angle = Math.atan2(e.clientY - deskCenterY, e.clientX - deskCenterX) * (180 / Math.PI);
                updateData(widget.id, { desks: desks.map(d => { if (d.id === rotatingDesk) return { ...d, rotation: angle + 45 }; return d; }) });
            }
        }
    };

    const handleGlobalMouseUp = () => {
        if (isSelecting && selectionBox) {
            // Commit selection
            const { x, y, w, h } = selectionBox;
            const scale = fontSize / 16;
            const selected = desks.filter(d => {
                const deskW = (d.type === 'teacher' ? 112 : 80) * scale;
                const deskH = (d.type === 'teacher' ? 56 : 44) * scale;
                // Simple center point collision
                const cx = d.x + (deskW / 2);
                const cy = d.y + (deskH / 2);
                return cx >= x && cx <= x + w && cy >= y && cy <= y + h;
            }).map(d => d.id);
            setSelectedDeskIds(selected);
            setIsSelecting(false);
            setSelectionBox(null);
        }
        setDraggedDesk(null);
        setRotatingDesk(null);
        setIsSelecting(false); // Cleanup just in case
    };

    useEffect(() => {
        if (isEditing) {
            window.addEventListener("mousemove", handleGlobalMouseMove);
            window.addEventListener("mouseup", handleGlobalMouseUp);
            return () => {
                window.removeEventListener("mousemove", handleGlobalMouseMove);
                window.removeEventListener("mouseup", handleGlobalMouseUp);
            };
        }
    }, [isEditing, draggedDesk, rotatingDesk, isSelecting, selectionBox, desks, snapToGrid]);

    const handleColorClick = (color) => {
        if (selectedDeskIds.length > 0) {
            updateData(widget.id, { desks: desks.map(d => selectedDeskIds.includes(d.id) ? { ...d, color } : d) });
        } else {
            const newDesk = { id: Date.now().toString(), x: 50, y: 50, student: null, color, type: 'student', rotation: 0 };
            updateData(widget.id, { desks: [...desks, newDesk] });
        }
    };

    const addTeacher = () => {
        const newDesk = { id: Date.now().toString(), x: 50, y: 50, student: null, color: "gray", type: "teacher", rotation: 0 };
        updateData(widget.id, { desks: [...desks, newDesk] });
    };

    const removeDesk = (id) => updateData(widget.id, { desks: desks.filter(d => d.id !== id) });
    const removeSelected = () => {
        updateData(widget.id, { desks: desks.filter(d => !selectedDeskIds.includes(d.id)) });
        setSelectedDeskIds([]);
    };

    const shuffleSeats = () => {
        const activeStudentNames = roster.filter(s => s.active).map(s => s.name);
        if (activeStudentNames.length === 0) { alert("No active students in roster!"); return; }

        const studentDesks = desks.filter(d => d.type === 'student');
        if (studentDesks.length === 0) return;

        // Create pool of "occupants": all active students + nulls for empty/remaining
        let pool = [...activeStudentNames];
        // If we have more desks than students, fill with nulls
        while (pool.length < studentDesks.length) pool.push(null);

        // Shuffle the pool (students AND empty spots)
        pool = pool.sort(() => Math.random() - 0.5);

        let poolIndex = 0;
        const newDesks = desks.map(d => {
            if (d.type !== 'student') return d;
            if (poolIndex < pool.length) {
                const student = pool[poolIndex++];
                return { ...d, student };
            }
            return { ...d, student: null };
        });

        updateData(widget.id, { desks: newDesks });
    };

    // Assuming a handleDrop function exists or needs to be created for drag-and-drop student assignment
    // This snippet is placed where a handleDrop function might process a student being dropped onto a desk.
    // Note: The original document does not contain a `handleDrop` function, `sourceDesk`, `updatedDesks`, `deskIndex`, or `studentId` variables.
    // This insertion is based on the provided instruction's context, assuming these variables would be defined within such a function.
    const handleDrop = (studentId, targetDeskId, sourceDeskId) => {
        let updatedDesks = [...desks];
        const sourceDesk = sourceDeskId ? updatedDesks.find(d => d.id === sourceDeskId) : null;
        const deskIndex = updatedDesks.findIndex(d => d.id === targetDeskId);

        if (deskIndex === -1) return; // Target desk not found

        // Move student to new desk
        if (sourceDesk) {
            // If moving from another desk, clear source
            updatedDesks = updatedDesks.map(d => d.id === sourceDesk.id ? { ...d, student: null } : d);
        }

        // Check if target desk is occupied (SWAP LOGIC)
        const targetDeskObj = updatedDesks[deskIndex];
        if (targetDeskObj.student) {
            const studentToSwap = targetDeskObj.student;
            // If we came from a desk, put the swapped student there
            if (sourceDesk) {
                updatedDesks = updatedDesks.map(d => d.id === sourceDesk.id ? { ...d, student: studentToSwap } : d);
            } else {
                // If dragging from sidebar, the swapped student goes back to sidebar (effectively removed from desk)
                // No action needed here as they are just overwritten on the desk, effectively "kicked out"
            }
        }

        // Place dragged student on target
        updatedDesks[deskIndex] = { ...updatedDesks[deskIndex], student: studentId };

        updateData(widget.id, { desks: updatedDesks });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
            <div className="h-12 bg-white border-b flex items-center justify-between px-4 z-10 shrink-0">
                <h3 className="font-bold text-slate-700 flex items-center gap-2"><Layout size={18} /> Class Layout</h3>
                <div className="flex gap-2 items-center">
                    {isEditing ? (<>
                        <div className="flex items-center gap-2 mr-2">
                            <button onClick={(e) => { e.stopPropagation(); updateData(widget.id, { snapToGrid: snapToGrid > 0 ? 0 : 10 }); }} className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors mr-2 ${snapToGrid > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                Snap: {snapToGrid > 0 ? 'On' : 'Off'}
                            </button>
                            <div className="w-px h-6 bg-gray-200" />
                            <div className="flex bg-gray-100 rounded-lg p-0.5">
                                {["blue", "red", "green", "yellow"].map(c => (<button key={c} onClick={(e) => { e.stopPropagation(); handleColorClick(c); }} className={`w-6 h-6 rounded border m-0.5 hover:scale-110 transition-transform ${DESK_COLORS[c].split(" ")[0]} ${DESK_COLORS[c].split(" ")[1]}`} />))}
                                <button onClick={(e) => { e.stopPropagation(); addTeacher(); }} className="px-2 h-6 rounded bg-slate-600 text-[10px] m-0.5 text-white font-bold flex items-center gap-1 hover:scale-105 transition-transform"><Briefcase size={10} /> Teacher</button>
                                {selectedDeskIds.length > 0 && <button onClick={removeSelected} className="px-2 h-6 rounded bg-red-100 text-red-600 text-[10px] m-0.5 font-bold flex items-center gap-1 hover:bg-red-200"><Trash2 size={10} /></button>}
                            </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); updateData(widget.id, { isEditing: false }); setSelectedDeskIds([]); }} className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold shadow hover:bg-green-700">Done</button>
                    </>) : (<>
                        <button onClick={shuffleSeats} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-bold shadow hover:bg-indigo-700 flex items-center gap-1"><Shuffle size={12} /> Shuffle</button>
                        <button onClick={() => updateData(widget.id, { isEditing: true })} className="px-3 py-1 bg-white border border-gray-300 text-gray-600 rounded text-xs font-bold hover:bg-gray-50 flex items-center gap-1"><Edit3 size={12} /> Edit</button>
                    </>)}
                </div>
                {isEditing && (
                    <div className="absolute top-12 right-4 z-20">
                        <select
                            value={widget.data.rosterId || ""}
                            onChange={(e) => updateData(widget.id, { rosterId: e.target.value || undefined })}
                            className="bg-white border border-gray-300 text-gray-700 text-xs font-bold py-1 px-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Use Global Class ({allRosters.find(r => r.id === activeRosterId)?.name || 'Default'})</option>
                            {allRosters.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div ref={containerRef} className={`flex-1 relative overflow-hidden ${isEditing ? "bg-slate-100" : "bg-slate-50"}`} style={{ backgroundImage: isEditing ? "radial-gradient(#cbd5e1 1px, transparent 1px)" : "none", backgroundSize: `${Math.max(20, snapToGrid || 20)}px ${Math.max(20, snapToGrid || 20)}px` }} onMouseDown={handleBgMouseDown}>
                    {desks.map(desk => {
                        const isAbsent = desk.student && effectiveRoster.find(s => s.name === desk.student && !s.active);
                        const scale = fontSize / 16;
                        const deskW = (desk.type === 'teacher' ? 154 : 110) * scale;
                        const deskH = (desk.type === 'teacher' ? 80 : 60) * scale;
                        const styleClass = desk.type === "teacher" ? `bg-slate-800 border-slate-600 text-white shadow-lg rounded-md` : `${DESK_COLORS[desk.color || "blue"]} rounded-lg`;
                        const isSelected = selectedDeskIds.includes(desk.id);
                        return (<div key={desk.id} onContextMenu={(e) => toggleAbsence(desk.student, e)} className={`absolute shadow-sm border-2 flex items-center justify-center transition-shadow ${isEditing ? "cursor-move hover:shadow-md" : "cursor-pointer"} ${styleClass} ${isAbsent ? "opacity-60" : ""} ${isSelected ? "ring-2 ring-blue-500 ring-offset-2 z-10" : ""}`} style={{ left: desk.x, top: desk.y, width: deskW, height: deskH, transform: `rotate(${desk.rotation || 0}deg)`, fontSize: (desk.type === 'teacher' ? 14 : fontSize) + 'px' }} onMouseDown={(e) => handleMouseDown(e, desk.id)} >
                            {isAbsent && <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full z-30 shadow-sm">OUT</div>}
                            {isEditing && (<>
                                <button onClick={(e) => { e.stopPropagation(); removeDesk(desk.id); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600 w-5 h-5 flex items-center justify-center z-20"><X size={12} strokeWidth={3} /></button>
                                <div onMouseDown={(e) => handleRotateMouseDown(e, desk.id)} className="absolute -top-3 -left-3 bg-blue-500 text-white rounded-full p-1 shadow-sm hover:bg-blue-600 w-6 h-6 flex items-center justify-center z-20 cursor-grab active:cursor-grabbing"><RotateCw size={14} strokeWidth={2.5} /></div>
                            </>)}
                            {desk.type === "teacher" ? <div className="flex flex-col items-center opacity-80"><Briefcase size={16} className="mb-0.5" /><span className="text-[8px] uppercase font-bold tracking-widest">Teacher</span></div> : (desk.student ? <span className={`font-bold text-center px-0.5 truncate w-full ${isAbsent ? 'text-slate-400 line-through' : 'text-slate-800'}`} style={{ fontSize: 'inherit' }}>{desk.student}</span> : <span className={`italic text-[10px] ${desk.color === "yellow" ? "text-yellow-700/50" : "text-slate-300"}`}>Empty</span>)}
                            {desk.type !== "teacher" && <div className={`absolute -bottom-1 w-8 h-1 rounded-full ${desk.color === "yellow" ? "bg-yellow-200" : "bg-slate-200"}`} />}
                        </div>);
                    })}

                    {/* Selection Box Visual */}
                    {isSelecting && selectionBox && (
                        <div className="absolute border border-blue-500 bg-blue-500/10 pointer-events-none z-50" style={{ left: selectionBox.x, top: selectionBox.y, width: selectionBox.w, height: selectionBox.h }} />
                    )}
                </div>
            </div>
            );
};

            export default SeatPickerWidget;