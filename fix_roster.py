
import os

file_path = r"c:\Users\jeff_\Downloads\HomeROom ANtigravity\single_file_version.html"

new_roster_manager = """    const RosterManager = ({ onClose, onSave, onExport, onImport, roster }) => {
      const [mode, setMode] = useState('list'); // 'list' or 'bulk'
      const [localRoster, setLocalRoster] = useState(roster);
      const [bulkText, setBulkText] = useState(roster.map(s => s.name).join('\\n'));

      const toggleActive = (id) => {
        setLocalRoster(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
      };

      const handleBulkSave = () => {
         const lines = bulkText.split('\\n').map(n => n.trim()).filter(n => n);
         // Try to map to existing to preserve IDs/Status
         const newRoster = lines.map(name => {
             const existing = roster.find(s => s.name === name);
             return existing ? existing : { id: Math.random().toString(36).substr(2, 9), name: name, active: true };
         });
         setLocalRoster(newRoster);
         setMode('list');
      };

      const handleSaveAll = () => {
         onSave(localRoster);
         onClose();
      };

      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><Users size={20} /> Class Roster</h3>
              <div className="flex gap-2">
                 {mode === 'list' && (
                    <button onClick={() => { setBulkText(localRoster.map(s => s.name).join('\\n')); setMode('bulk'); }} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">Bulk Edit</button>
                 )}
                 <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500"><X size={20} /></button>
              </div>
            </div>

            {mode === 'list' ? (
                <>
                <div className="p-4 border-b bg-blue-50/50 flex gap-2">
                    <button onClick={onExport} className="flex-1 py-1.5 bg-white border border-gray-200 text-slate-600 rounded-lg hover:bg-gray-50 font-bold text-xs flex items-center justify-center gap-2 shadow-sm"><Download size={14} /> Export</button>
                    <button onClick={onImport} className="flex-1 py-1.5 bg-white border border-gray-200 text-slate-600 rounded-lg hover:bg-gray-50 font-bold text-xs flex items-center justify-center gap-2 shadow-sm"><Upload size={14} /> Import</button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                   <div className="space-y-1">
                      {localRoster.map(s => (
                         <div key={s.id} onClick={() => toggleActive(s.id)} className={`flex items-center justify-between p-2 rounded cursor-pointer border ${s.active ? 'bg-white border-gray-100 hover:border-blue-300' : 'bg-gray-50 border-transparent opacity-60'}`}>
                             <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${s.active ? 'bg-blue-500 border-blue-500' : 'border-gray-400 bg-white'}`}>
                                   {s.active && <Check size={12} className="text-white" />}
                                </div>
                                <span className={`font-medium ${s.active ? 'text-gray-900' : 'text-gray-500 line-through'}`}>{s.name}</span>
                             </div>
                         </div>
                      ))}
                      {localRoster.length === 0 && <div className="text-center text-gray-400 py-8">No students. Click Bulk Edit to add.</div>}
                   </div>
                </div>
                </>
            ) : (
                <div className="p-4 flex-1 flex flex-col">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2">Edit Names (One per line)</label>
                  <textarea
                    className="flex-1 border-2 border-gray-200 rounded-xl p-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all custom-scrollbar resize-none font-medium text-slate-700"
                    autoFocus
                    value={bulkText}
                    onChange={e => setBulkText(e.target.value)}
                  />
                  <button onClick={handleBulkSave} className="mt-2 bg-blue-100 text-blue-700 font-bold py-2 rounded-lg hover:bg-blue-200">Update List</button>
                </div>
            )}

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSaveAll} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow transition-all active:scale-95 flex items-center gap-2">
                <Save size={18} /> Save Final
              </button>
            </div>
          </div>
        </div>
      );
    };"""

new_app_code = """    const App = () => {
      // ... existing state ...
      const [slides, setSlides] = useState(() => {
        try { return JSON.parse(localStorage.getItem(WIDGETS_STORAGE_KEY)) || [[]]; } catch (e) { return [[]]; }
      });
      const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
      const [selectedId, setSelectedId] = useState(null);
      const [maxZIndex, setMaxZIndex] = useState(10);
      const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
      const [isDockMinimized, setIsDockMinimized] = useState(false);
      const [isDockEditing, setIsDockEditing] = useState(false);
      const [dockOrder, setDockOrder] = useState(getDockOrder());

      const [roster, setRoster] = useState(getRoster());
      const [showOnboarding, setShowOnboarding] = useState(false);
      const [showRosterManager, setShowRosterManager] = useState(false);

      // New Background State
      const [background, setBackground] = useState(getBackground());
      const [showBgPicker, setShowBgPicker] = useState(false);

      // --- PERSISTENCE & DATA ---
      useEffect(() => {
        const t = setTimeout(() => {
            localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(slides));
            saveRoster(roster);
        }, 1000);
        return () => clearTimeout(t);
      }, [slides, roster]);

      const fileInputRef = useRef(null);
      const downloadData = () => {
         const data = { roster, dock: getDockOrder(), widgets: slides, background, timestamp: Date.now() };
         const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a'); a.href = url; a.download = `homeroom-${new Date().toISOString().slice(0,10)}.json`;
         document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      };
      
      const uploadData = (e) => {
         const file = e.target.files[0];
         if(!file) return;
         const reader = new FileReader();
         reader.onload = (ev) => {
            try {
               const d = JSON.parse(ev.target.result);
               if(d.roster) {
                   const r = d.roster.map(i => typeof i === 'string' ? { id: Math.random().toString(36), name: i, active: true } : i);
                   setRoster(r);
                   saveRoster(r);
               }
               if(d.dock) { setDockOrder(d.dock); saveDockOrder(d.dock); }
               if(d.background) { setBackground(d.background); saveBackground(d.background); }
               if(d.widgets) setSlides(d.widgets);
               alert("Import successful!");
            } catch(err) { alert("Import failed."); }
         };
         reader.readAsText(file);
      };

      const widgets = slides[currentSlideIndex];
      const setWidgets = useCallback((updater) => { setSlides(prev => { const newS = [...prev]; newS[currentSlideIndex] = updater(newS[currentSlideIndex]); return newS; }); }, [currentSlideIndex]);
      const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      useEffect(() => { const timer = setInterval(() => { setCurrentTime(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })); }, 1000 * 60); return () => clearInterval(timer); }, []);
      useEffect(() => { if (!hasRoster()) setShowOnboarding(true); }, []);

      const handleBgSelect = (newBg) => {
        setBackground(newBg);
        saveBackground(newBg);
      };

      // ... (addWidget, removeWidget, updateWidgetLayout, updateWidgetData, bringToFront, nextSlide, prevSlide, saveDock, handleDockDrop)
      const addWidget = (type) => { 
          if (isDockEditing) return; 
          const id = Date.now().toString(); 
          const size = WIDGET_SIZES[type]; 
          const position = { x: (window.innerWidth / 2) - (size.width / 2) + (Math.random() * 40 - 20), y: (window.innerHeight / 2) - (size.height / 2) + (Math.random() * 40 - 20) }; 
          let data = { fontSize: 16 }; 
          if (type === 'TIMER') data = { ...data, timeLeft: 120, isRunning: false }; 
          // Removed initial students for random/group/seat - they now use Global Roster
          if (type === 'SEAT_PICKER') {
              const desks = roster.slice(0, 8).map((s, i) => ({ id: `desk-${i}`, x: 50 + (i % 4) * 120, y: 50 + Math.floor(i / 4) * 100, student: s.name, color: 'blue', type: 'student', rotation: 0 }));
              data = { ...data, desks, isEditing: false };
          }
          if (type === 'TEXT') data = { ...data, content: '' }; 
          if (type === 'WEBCAM') data = { ...data, isMirrored: true, isActive: true }; 
          if (type === 'DICE') data = { ...data, sides: 6, diceCount: 1, results: [1], isRolling: false }; 
          if (type === 'TRAFFIC') data = { ...data, activeLight: null }; 
          if (type === 'QR') data = { ...data, url: '' }; 
          
          const newWidget = { id, type, position, size, zIndex: maxZIndex + 1, data }; 
          setWidgets(prev => [...prev, newWidget]); 
          setMaxZIndex(prev => prev + 1); 
          setSelectedId(id); 
      };

      const removeWidget = (id) => { setWidgets(prev => prev.filter(w => w.id !== id)); if (selectedId === id) setSelectedId(null); };
      const updateWidgetLayout = useCallback((id, newPos, newSize) => { setWidgets(prev => prev.map(w => w.id === id ? { ...w, position: newPos, size: newSize } : w)); }, [setWidgets]);
      const updateWidgetData = useCallback((id, updates) => { setWidgets(prev => prev.map(w => w.id === id ? { ...w, data: { ...w.data, ...updates } } : w)); }, [setWidgets]);
      const bringToFront = (id) => { setSelectedId(id); setMaxZIndex(prev => prev + 1); setWidgets(prev => prev.map(w => w.id === id ? { ...w, zIndex: maxZIndex + 1 } : w)); };
      const nextSlide = () => { if (currentSlideIndex === slides.length - 1) { setSlides(prev => [...prev, []]); } setCurrentSlideIndex(prev => prev + 1); setSelectedId(null); };
      const prevSlide = () => { if (currentSlideIndex > 0) { setCurrentSlideIndex(prev => prev - 1); setSelectedId(null); } };
      const saveDock = (newOrder) => { setDockOrder(newOrder); saveDockOrder(newOrder); };
      const handleDockDrop = (e, targetIndex) => { if (!isDockEditing) return; const sourceIndex = parseInt(e.dataTransfer.getData('text/plain')); if (isNaN(sourceIndex)) return; const newOrder = [...dockOrder]; const [moved] = newOrder.splice(sourceIndex, 1); newOrder.splice(targetIndex, 0, moved); saveDock(newOrder); };
      
      const renderWidgetContent = (widget) => { 
          const props = { widget, updateData: updateWidgetData, roster }; // Pass Global Roster
          switch (widget.type) { 
              case 'TIMER': return <TimerWidget {...props} />; 
              case 'RANDOMIZER': return <RandomizerWidget {...props} />; 
              case 'GROUP_MAKER': return <GroupMakerWidget {...props} />; 
              case 'SEAT_PICKER': return <SeatPickerWidget {...props} />; 
              case 'TEXT': return <TextWidget {...props} />; 
              case 'WEBCAM': return <WebcamWidget {...props} />; 
              case 'DICE': return <DiceWidget {...props} />; 
              case 'TRAFFIC': return <TrafficLightWidget {...props} />; 
              case 'QR': return <QRCodeWidget {...props} />; 
              default: return null; 
          } 
      };

      return (
        <div className="w-screen h-screen overflow-hidden relative" style={{
          backgroundColor: '#dbeafe', // fallback
          backgroundImage: background && background.id !== 'default' ? `url(${background.src})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          {/* Modals */}
          {showOnboarding && <OnboardingModal onComplete={() => setShowOnboarding(false)} />}
          {showRosterManager && <RosterManager 
              roster={roster}
              onClose={() => setShowRosterManager(false)} 
              onSave={(newRoster) => setRoster(newRoster)}
              onExport={downloadData}
              onImport={() => fileInputRef.current.click()}
          />}
          {showBgPicker && <BackgroundPicker currentBg={background} onSelect={handleBgSelect} onClose={() => setShowBgPicker(false)} />}
          {/* Default Geometric Background Layer */}
          {(!background || background.id === 'default') && (
            <div className="absolute inset-0 pointer-events-none z-0">
              <svg className="w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gradOrange" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{ stopColor: "#fb923c", stopOpacity: 1 }} /><stop offset="100%" style={{ stopColor: "#ea580c", stopOpacity: 1 }} /></linearGradient><linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 1 }} /><stop offset="100%" style={{ stopColor: "#60a5fa", stopOpacity: 1 }} /></linearGradient></defs><rect width="100%" height="100%" fill="#dbeafe" /><path d="M1920 0V900C1400 900 1000 400 500 0H1920Z" fill="url(#gradOrange)" opacity="0.9" /><path d="M1920 0V700C1600 700 1300 300 900 0H1920Z" fill="#fed7aa" opacity="0.5" /><path d="M0 1080V300C500 300 900 800 1600 1080H0Z" fill="url(#gradBlue)" opacity="0.9" /><path d="M0 1080V500C300 500 700 900 1200 1080H0Z" fill="#93c5fd" opacity="0.5" /></svg>
            </div>
          )}

          {/* Dark Overlay for better contrast on images (slightly darker to ensure white text pops) */}
          {background && background.id !== 'default' && <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />}

          {/* Top Info Bar */}
          <div className={`absolute top-10 left-12 z-0 pointer-events-none select-none transition-colors duration-300 ${background.textColor || 'text-slate-800'}`}>
            <div className="flex items-center gap-1.5 mb-1 opacity-80"><div className={`px-1.5 py-0.5 rounded text-[10px] font-black tracking-tighter shadow-md ${background.textColor === 'text-white' ? 'bg-white text-slate-900' : 'bg-slate-800 text-white'}`}>HR</div><div className="text-xs font-bold uppercase tracking-widest">HomeRoom</div></div>
            <div className={`text-8xl font-bold tracking-tight ${background.textColor === 'text-white' ? 'drop-shadow-lg' : 'drop-shadow-sm'}`}>{currentTime}</div>
            <div className={`text-3xl font-medium mt-2 opacity-90 ${background.textColor === 'text-white' ? 'drop-shadow-md' : ''}`}>{currentDate}</div>
          </div>

          {/* Top Right Controls */}
          <div className="absolute top-8 right-8 z-50 flex gap-2">
            <button onClick={downloadData} className="p-3 bg-white/80 backdrop-blur-md hover:bg-white text-slate-600 rounded-full shadow-lg border border-white/50 transition-all active:scale-95 group" title="Export Data">
              <Download size={24} className="group-hover:text-green-600" />
            </button>
            <button onClick={() => fileInputRef.current.click()} className="p-3 bg-white/80 backdrop-blur-md hover:bg-white text-slate-600 rounded-full shadow-lg border border-white/50 transition-all active:scale-95 group" title="Import Data">
              <Upload size={24} className="group-hover:text-blue-600" />
              <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={uploadData} />
            </button>
            <div className="w-px h-8 bg-black/10 mx-1 self-center" />
            <button onClick={() => setShowBgPicker(true)} className="p-3 bg-white/80 backdrop-blur-md hover:bg-white text-slate-600 rounded-full shadow-lg border border-white/50 transition-all active:scale-95 group" title="Appearance">
              <ImageIcon size={24} className="group-hover:text-purple-600" />
            </button>
          </div>

          {/* Widgets Area */}
          <div className="absolute inset-0 z-10">{widgets.map(w => (<DraggableResizable key={w.id} id={w.id} position={w.position} size={w.size} zIndex={w.zIndex} isSelected={selectedId === w.id} onSelect={bringToFront} onUpdate={updateWidgetLayout} onRemove={removeWidget} onFontSizeChange={(d) => updateWidgetData(w.id, { fontSize: Math.max(8, (w.data.fontSize || 16) + d) })}>{renderWidgetContent(w)}</DraggableResizable>))}</div>

          {/* Slide Controls */}
          <div className="absolute bottom-6 right-8 z-50 flex items-center pointer-events-none"><div className="pointer-events-auto flex items-center gap-0.5 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-1 border border-white/60 ring-1 ring-black/5"><button onClick={prevSlide} disabled={currentSlideIndex === 0} className="p-1.5 hover:bg-blue-50 rounded-xl text-gray-500 hover:text-blue-600 transition-all duration-200 disabled:opacity-20 group active:scale-95"><ChevronLeft size={20} /></button><div className="px-2 flex items-center justify-center min-w-[35px]"><span className="text-[10px] font-bold text-blue-600 leading-none">{currentSlideIndex + 1} / {slides.length}</span></div><button onClick={nextSlide} className="p-1.5 hover:bg-blue-50 rounded-xl text-gray-500 hover:text-blue-600 transition-all duration-200 group active:scale-95 flex items-center justify-center">{currentSlideIndex === slides.length - 1 ? <Plus size={20} /> : <ChevronRight size={20} />}</button></div></div>

          {/* Dock */}
          <div className="absolute bottom-6 left-0 right-0 z-50 flex flex-col items-center justify-end pointer-events-none">
            <div className={`max-w-4xl mx-4 mb-1 transition-all duration-300 ease-in-out origin-bottom ${isDockMinimized ? 'translate-y-20 opacity-0 scale-95 pointer-events-none' : 'translate-y-0 opacity-100 scale-100 pointer-events-auto'}`}>
              <div className={`flex justify-between items-center bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-2 border border-white/60 overflow-x-auto ring-1 ring-black/5 ${isDockEditing ? 'ring-2 ring-blue-400 bg-blue-50/90' : ''}`}>
                {dockOrder.map((toolKey, index) => (
                  <ToolBtn key={toolKey} icon={DOCK_LABELS[toolKey].icon} label={DOCK_LABELS[toolKey].label} onClick={() => addWidget(toolKey)} isEditing={isDockEditing} index={index} moveTool={handleDockDrop} />
                ))}
                <div className="w-px h-10 bg-gray-300 mx-2"></div>
                <ToolBtn icon={<Settings />} label="Roster" onClick={() => setShowRosterManager(true)} />
                <button onClick={() => setIsDockEditing(!isDockEditing)} className={`ml-2 p-2 rounded-xl transition-all ${isDockEditing ? 'bg-blue-200 text-blue-700' : 'hover:bg-gray-100 text-gray-400'}`} title={isDockEditing ? "Done rearranging" : "Rearrange buttons"}> {isDockEditing ? <Unlock size={16} /> : <Lock size={16} />} </button>
              </div>
            </div>
            <div className="pointer-events-auto transition-all duration-300 z-50"><button onClick={() => setIsDockMinimized(!isDockMinimized)} className="bg-white/90 backdrop-blur-md hover:bg-white text-slate-500 hover:text-blue-600 p-1.5 rounded-full shadow-lg border border-white/50 transition-all active:scale-95">{isDockMinimized ? <ChevronUp size={22} /> : <ChevronDown size={22} />}</button></div>
          </div>
        </div>
      );
    };"""

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace RosterManager
start_marker = "const RosterManager = ({ onClose, onSave, onExport, onImport }) => {"
end_marker = "    };" # This is tricky, it's generic.

# We will use regex or string split logic
# RosterManager starts at 1029 and ends at 1072 in standard file.
# But using strings is better.

# Find start index
start_idx = content.find("const RosterManager = ({ onClose, onSave, onExport, onImport }) => {")
# Find end index (next component start is "const App")
next_comp_idx = content.find("const App =", start_idx)

if start_idx != -1 and next_comp_idx != -1:
    # Need to verify where RosterManager ends. Use rfind '};' before next_comp_idx
    end_idx = content.rfind("};", start_idx, next_comp_idx) + 2
    
    # Replace RosterManager
    content = content[:start_idx] + new_roster_manager + "\\n\\n" + content[next_comp_idx:]
else:
    print("Could not find RosterManager boundaries")

# Now replace App
# App starts at "const App =" and ends before "const ToolBtn =" or "const root ="
app_start_idx = content.find("const App = () => {")
toolbtn_idx = content.find("const ToolBtn =", app_start_idx)

if app_start_idx != -1 and toolbtn_idx != -1:
    content = content[:app_start_idx] + new_app_code + "\\n\\n" + content[toolbtn_idx:]
else:
    print("Could not find App boundaries")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("File updated successfully.")
