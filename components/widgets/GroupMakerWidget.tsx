import React, { useState, useRef, useEffect } from 'react';
import { Users, Shuffle } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  active: boolean;
}

interface GroupMakerWidgetProps {
  widget: any;
  updateData: (id: string, data: any) => void;
  roster: Student[];
  allRosters?: any[];
  activeRosterId?: string;
}

const GroupMakerWidget: React.FC<GroupMakerWidgetProps> = ({ widget, updateData, roster, allRosters = [], activeRosterId }) => {
  const { groups = [], fontSize = 16, groupCount = 4, rosterId } = widget.data;
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(4);
  const dragItem = useRef<string | null>(null);
  const dragSourceGroup = useRef<number | null>(null);

  // Determine Effective Roster
  const effectiveRoster = rosterId
    ? (allRosters.find(r => r.id === rosterId)?.roster || [])
    : roster;

  const activeStudents = effectiveRoster.filter(s => s.active);
  const count = activeStudents.length;
  const scaledFS = (fontSize / 16) * 14;

  // Responsive column calculation & Height Auto-Resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        // Adjusted: wider minimum column width to prevent squishing
        const newCols = Math.max(1, Math.min(8, Math.floor(width / 150)));
        setColumns(newCols);
      }
    });
    observer.observe(containerRef.current);

    // Height Check Logic
    const checkHeight = () => {
      if (!containerRef.current || !widget.updateLayout) return;
      const currentRows = Math.ceil(Math.max(groups.length, groupCount) / columns);
      const maxInGroup = groups.reduce((max, g) => Math.max(max, g.length), 0);

      // Updated Height Calc: More generous (32px per student instead of 28, + more padding)
      const rowHeight = 70 + (maxInGroup * 32);
      const estimatedHeight = 140 + (currentRows * rowHeight) + ((currentRows - 1) * 20);

      // Cap max height to stay on screen
      const maxHeight = window.innerHeight - 150;
      const finalHeight = Math.min(estimatedHeight, maxHeight);

      // Increased threshold to 20px to prevent minor jitter
      if (Math.abs(finalHeight - widget.size.height) > 20) {
        requestAnimationFrame(() => { // Avoid ResizeObserver loop limit
          widget.updateLayout(widget.id, widget.position, { width: widget.size.width, height: finalHeight });
        });
      }
    };
    checkHeight(); // Run once on init/update

    return () => observer.disconnect();
  }, [groups, groupCount, columns, widget.size.height, widget.size.width, widget.id, widget.updateLayout]);

  const createGroups = (countNeeded: number) => {
    const shuffled = [...activeStudents].sort(() => Math.random() - 0.5);
    const newG: Student[][] = Array.from({ length: countNeeded }, () => []);
    shuffled.forEach((s, i) => newG[i % countNeeded].push(s));
    updateData(widget.id, { groups: newG, groupCount: countNeeded });
  };

  const handleDragStart = (e: React.DragEvent, studentId: string, groupIndex: number) => {
    dragItem.current = studentId;
    dragSourceGroup.current = groupIndex;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetGroupIndex: number, targetInfo?: { studentId?: string }) => {
    e.preventDefault();
    e.stopPropagation();
    const studentId = dragItem.current;
    const sourceIndex = dragSourceGroup.current;

    if (studentId === null || sourceIndex === null) return;

    // Don't drop on self
    if (sourceIndex === targetGroupIndex && studentId === targetInfo?.studentId) return;

    // Deep copy groups to avoid mutation issues
    const newGroups = groups.map((g: Student[]) => [...g]);

    // Find item indices
    const sourceGroup = newGroups[sourceIndex];
    const sourceStudentIndex = sourceGroup.findIndex((s: Student) => s.id === studentId);
    if (sourceStudentIndex === -1) return;

    // Get the student object
    const [student] = sourceGroup.splice(sourceStudentIndex, 1);

    // Determine Insertion Index
    let insertIndex = newGroups[targetGroupIndex].length; // Default append

    if (targetInfo?.studentId) {
      // We are dropping onto a specific student
      let targetStudentIndex = newGroups[targetGroupIndex].findIndex((s: Student) => s.id === targetInfo.studentId);

      if (targetStudentIndex !== -1) {
        // If moving within same group downwards, insert AFTER the target (effectively swapping position)
        if (sourceIndex === targetGroupIndex && sourceStudentIndex < targetStudentIndex) {
          insertIndex = targetStudentIndex + 1;
        } else {
          insertIndex = targetStudentIndex;
        }
      }
    }

    newGroups[targetGroupIndex].splice(insertIndex, 0, student);

    updateData(widget.id, { groups: newGroups });

    dragItem.current = null;
    dragSourceGroup.current = null;
  };

  // Calculate grid template based on dynamic columns
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: '0.5rem'
  };

  // Setup View (If no groups generated yet)
  if (groups.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white relative p-6 items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
          <Users size={32} />
        </div>
        <h3 className="font-bold text-lg text-slate-800 mb-2">Group Maker</h3>
        <p className="text-slate-500 text-xs max-w-[200px] mb-6">Instantly split {count} students into random groups.</p>

        <div className="w-full max-w-[240px] bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Groups</span>
            <span className="text-sm font-black text-slate-700">{groupCount}</span>
          </div>
          <div className="mb-2">
            <select
              value={rosterId || ""}
              onChange={(e) => updateData(widget.id, { rosterId: e.target.value || undefined })}
              className="w-full bg-white border border-gray-300 text-gray-700 text-xs py-1 px-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Global ({allRosters.find(r => r.id === activeRosterId)?.name || 'Default'})</option>
              {allRosters.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <input
            type="range" min="2" max="12" value={groupCount}
            onChange={e => updateData(widget.id, { groupCount: Number(e.target.value) })}
            className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-[10px] text-slate-400 mt-2 text-right">
            ~{Math.ceil(count / groupCount)} students per group
          </div>
        </div>

        <button
          onClick={() => createGroups(groupCount)}
          disabled={count === 0}
          className="w-full max-w-[240px] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Shuffle size={18} /> Generate Groups
        </button>
      </div>
    );
  }

  // Generated View
  return (
    <div className="flex flex-col h-full bg-slate-50 relative p-4">
      <div className="flex flex-col gap-2 flex-1 min-h-0">
        <div className="flex justify-between items-center mb-1 shrink-0">
          <div className="bg-white border border-gray-200 px-2 py-0.5 rounded-md shadow-sm">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Present: </span>
            <span className="text-xs font-bold text-blue-600">{count}</span>
            {rosterId && <span className="ml-1 text-[8px] text-gray-400">({allRosters.find(r => r.id === rosterId)?.name})</span>}
          </div>
          <button onClick={() => updateData(widget.id, { groups: [] })} className="text-[10px] font-bold text-slate-400 hover:text-red-500 underline transition-colors">
            Reset
          </button>
        </div>

        <div ref={containerRef} className="overflow-y-auto content-start custom-scrollbar flex-1" style={gridStyle}>
          {groups.map((g: Student[], i: number) => (
            <div
              key={i}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, i)}
              className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 min-h-[80px] flex flex-col transition-colors hover:bg-blue-50/30 group"
            >
              <div className="flex justify-between items-center mb-1">
                <div className="font-bold text-[10px] uppercase text-gray-400 tracking-wider">Group {i + 1}</div>
                <div className="text-[9px] font-bold text-gray-300 bg-gray-50 px-1 rounded">{g.length}</div>
              </div>
              <div className="flex-1 space-y-1 min-h-[1.5rem]">
                {g.map(s => (
                  <div
                    key={s.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, s.id, i)}
                    onDrop={(e) => handleDrop(e, i, { studentId: s.id })}
                    onDragOver={handleDragOver}
                    className="px-1.5 py-1 bg-gray-50 hover:bg-blue-100 rounded flex items-center text-gray-700 font-medium cursor-grab active:cursor-grabbing border border-transparent hover:border-blue-200 transition-colors"
                    style={{ fontSize: scaledFS + 'px', overflow: 'hidden' }}
                  >
                    <span className="truncate w-full">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm mt-auto shrink-0">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-600">Groups: {groupCount}</span>
            <span className="text-[10px] text-slate-400">~{Math.ceil(count / groupCount)} students/group</span>
          </div>
          <input
            type="range" min="2" max="20" value={groupCount}
            onChange={e => {
              const c = Number(e.target.value);
              updateData(widget.id, { groupCount: c });
              createGroups(c);
            }}
            className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer mb-2"
          />
          <button onClick={() => createGroups(groupCount)} className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1">
            <Shuffle size={14} /> Shuffle Groups
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupMakerWidget;