const fs = require('fs');
const path = require('path');

const filePath = "c:/Users/jeff_/Downloads/HomeROom ANtigravity/index.html";
let content = fs.readFileSync(filePath, 'utf8');

// CLEAN SEAT PICKER WIDGET
const newSeatPicker = `    const SeatPickerWidget = ({ widget, updateData, roster, onUpdateRoster }) => {
      const { desks = [], isEditing = false, fontSize = 16 } = widget.data;
      const containerRef = useRef(null);
      const [draggedDesk, setDraggedDesk] = useState(null);
      const [rotatingDesk, setRotatingDesk] = useState(null);
      const dragStart = useRef({ x: 0, y: 0 });

      // Sync with Global Roster
      useEffect(() => {
        const activeStudents = roster.filter(s => s.active).map(s => s.name);
        let currentDesks = Array.isArray(desks) ? [...desks] : [];
        let needsUpdate = false;

        // 1. Mark inactive students
        currentDesks = currentDesks.map(d => {
          if (d.type === 'teacher') return d;
          if (d.student && !activeStudents.includes(d.student)) {
            needsUpdate = true;
            return { ...d, student: null };
          }
          return d;
        });

        // 2. Seat unseated active students
        const seated = currentDesks.map(d => d.student).filter(Boolean);
        const unseated = activeStudents.filter(name => !seated.includes(name));

        if (unseated.length > 0) {
          needsUpdate = true;
          currentDesks = currentDesks.map(d => {
            if (d.type !== 'teacher' && !d.student && unseated.length > 0) {
              return { ...d, student: unseated.shift() };
            }
            return d;
          });
          unseated.forEach((s, i) => {
            currentDesks.push({
              id: Date.now() + Math.random(),
              x: 50 + (i % 5) * 110,
              y: 50 + Math.floor(i / 5) * 80 + 100,
              student: s,
              color: 'blue',
              type: 'student',
              rotation: 0
            });
          });
        }

        if (needsUpdate) updateData(widget.id, { desks: currentDesks });
      }, [roster, widget.id]);

      const toggleAbsence = (studentName, e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (!studentName || !onUpdateRoster) return;
        const updated = roster.map(s => s.name === studentName ? { ...s, active: !s.active } : s);
        onUpdateRoster(updated);
      };

      const handleMouseDown = (e, deskId) => {
        if (!isEditing) return;
        e.stopPropagation();
        setDraggedDesk(deskId);
        dragStart.current = { x: e.clientX, y: e.clientY };
      };

      const handleRotateMouseDown = (e, deskId) => {
        if (!isEditing) return;
        e.stopPropagation();
        setRotatingDesk(deskId);
      };

      const handleGlobalMouseMove = (e) => {
        if (draggedDesk && isEditing) {
          e.stopPropagation();
          e.preventDefault();
          const dx = e.clientX - dragStart.current.x;
          const dy = e.clientY - dragStart.current.y;
          dragStart.current = { x: e.clientX, y: e.clientY };
          updateData(widget.id, {
            desks: desks.map(d => d.id === draggedDesk ? { ...d, x: d.x + dx, y: d.y + dy } : d)
          });
        } else if (rotatingDesk && isEditing) {
          e.preventDefault();
          const desk = desks.find(d => d.id === rotatingDesk);
          if (desk && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const deskCenterX = rect.left + desk.x + (desk.type === 'teacher' ? 80 : 56);
            const deskCenterY = rect.top + desk.y + (desk.type === 'teacher' ? 40 : 32);
            const angle = Math.atan2(e.clientY - deskCenterY, e.clientX - deskCenterX) * (180 / Math.PI);
            updateData(widget.id, {
              desks: desks.map(d => d.id === rotatingDesk ? { ...d, rotation: angle + 45 } : d)
            });
          }
        }
      };

      const handleGlobalMouseUp = () => {
        setDraggedDesk(null);
        setRotatingDesk(null);
      };

      useEffect(() => {
        if (isEditing) {
          window.addEventListener('mousemove', handleGlobalMouseMove);
          window.addEventListener('mouseup', handleGlobalMouseUp);
          return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
          };
        }
      }, [isEditing, draggedDesk, rotatingDesk, desks]);

      const addDesk = (color = 'blue', type = 'student') => {
        const newDesk = { id: Date.now().toString(), x: 50, y: 50, student: null, color, type, rotation: 0 };
        updateData(widget.id, { desks: [...desks, newDesk] });
      };

      const removeDesk = (id) => updateData(widget.id, { desks: desks.filter(d => d.id !== id) });

      const shuffleSeats = () => {
        const activeStudentNames = roster.filter(s => s.active).map(s => s.name);
        if (activeStudentNames.length === 0) { alert("No active students!"); return; }
        const shuffled = [...activeStudentNames].sort(() => Math.random() - 0.5);
        let studentIdx = 0;
        const newDesks = desks.map((desk) => {
          if (desk.type === 'teacher') return desk;
          const student = shuffled[studentIdx] || null;
          studentIdx++;
          return { ...desk, student };
        });
        updateData(widget.id, { desks: newDesks });
      };

      return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
          <div className="h-12 bg-white border-b flex items-center justify-between px-4 z-10 shrink-0">
            <h3 className="font-bold text-slate-700 flex items-center gap-2"><Layout size={18} /> Class Layout</h3>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <div className="flex bg-gray-100 rounded-lg p-0.5 mr-2">
                    {['blue', 'red', 'green', 'yellow'].map(c => (
                      <button key={c} onClick={() => addDesk(c)} className={\`w-6 h-6 rounded border m-0.5 hover:scale-110 transition-transform \${DESK_COLORS[c]}\`} />
                    ))}
                    <button onClick={() => addDesk('gray', 'teacher')} className="px-2 h-6 rounded bg-slate-600 text-[10px] m-0.5 text-white font-bold flex items-center gap-1 hover:scale-105 transition-transform"><Briefcase size={10} /> Teacher</button>
                  </div>
                  <button onClick={() => updateData(widget.id, { isEditing: false })} className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold shadow hover:bg-green-700">Done</button>
                </>
              ) : (
                <>
                  <button onClick={shuffleSeats} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-bold shadow hover:bg-indigo-700 flex items-center gap-1"><Shuffle size={12} /> Shuffle</button>
                  <button onClick={() => updateData(widget.id, { isEditing: true })} className="px-3 py-1 bg-white border border-gray-300 text-gray-600 rounded text-xs font-bold hover:bg-gray-50 flex items-center gap-1"><Edit3 size={12} /> Edit</button>
                </>
              )}
            </div>
          </div>
          <div ref={containerRef} className={\`flex-1 relative overflow-hidden \${isEditing ? 'bg-slate-100' : 'bg-slate-50'}\`} style={{ backgroundImage: isEditing ? 'radial-gradient(#cbd5e1 1px, transparent 1px)' : 'none', backgroundSize: '20px 20px' }}>
            {desks.map(desk => {
              const styleClass = desk.type === 'teacher' ? 'bg-slate-800 border-slate-600 text-white shadow-lg w-40 h-20 rounded-md' : \`\${DESK_COLORS[desk.color || 'blue']} w-28 h-16 rounded-lg\`;
              return (
                <div key={desk.id} onContextMenu={(e) => toggleAbsence(desk.student, e)} className={\`absolute shadow-sm border-2 flex items-center justify-center transition-shadow \${isEditing ? 'cursor-move hover:shadow-md' : ''} \${styleClass} \${desk.student && roster.find(s => s.name === desk.student && !s.active) ? 'opacity-50' : ''}\`} style={{ left: desk.x, top: desk.y, transform: \`rotate(\${desk.rotation || 0}deg)\` }} onMouseDown={(e) => handleMouseDown(e, desk.id)}>
                  {desk.student && roster.find(s => s.name === desk.student && !s.active) && <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full z-30 shadow-sm">OUT</div>}
                  {isEditing && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); removeDesk(desk.id); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600 w-5 h-5 flex items-center justify-center z-20"><X size={12} strokeWidth={3} /></button>
                      <div onMouseDown={(e) => handleRotateMouseDown(e, desk.id)} className="absolute -top-3 -left-3 bg-blue-500 text-white rounded-full p-1 shadow-sm hover:bg-blue-600 w-6 h-6 flex items-center justify-center z-20 cursor-grab active:cursor-grabbing"><RotateCw size={14} strokeWidth={2.5} /></div>
                    </>
                  )}
                  {desk.type === 'teacher' ? <div className="flex flex-col items-center opacity-80"><Briefcase size={20} className="mb-1" /><span className="text-[10px] uppercase font-bold tracking-widest">Teacher</span></div> : (desk.student ? <span className="font-bold text-slate-800 text-center px-1 truncate w-full" style={{ fontSize: (fontSize || 14) + 'px' }}>{desk.student}</span> : <span className={\`italic text-xs \${desk.color === 'yellow' ? 'text-yellow-700/50' : 'text-slate-300'}\`}>Empty</span>)}
                  {desk.type !== 'teacher' && <div className={\`absolute -bottom-1 w-12 h-1 rounded-full \${desk.color === 'yellow' ? 'bg-yellow-200' : 'bg-slate-200'}\`} />}
                </div>
              );
            })}
          </div>
        </div>
      );
    };`;

// Replace logic
// Find start of SeatPicker
const startIdx = content.indexOf("const SeatPickerWidget =");
// Find start of NoiseMeter (which follows it)
const endIdx = content.indexOf("const NoiseMeterWidget =", startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const before = content.substring(0, startIdx);
    const after = content.substring(endIdx);
    content = before + newSeatPicker + "\n\n" + after;
    console.log("Replaced SeatPickerWidget");
} else {
    console.error("Could not find SeatPickerWidget block");
}

fs.writeFileSync(filePath, content, 'utf8');
