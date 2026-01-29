import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw, Clock } from 'lucide-react';

const TimerWidget = ({ widget, updateData }) => {
  const { durationMinutes = 2, timeLeft = 120, isRunning = false, fontSize = 16, mode = 'visual', color = 'blue', isMuted = false } = widget.data;
  const [customTime, setCustomTime] = useState("");
  const [showColorMenu, setShowColorMenu] = useState(false);
  const intervalRef = useRef(null);
  const isDraggingRef = useRef(false);
  const timerRef = useRef(null);

  // Colors
  const COLORS = {
    blue: { stroke: '#3b82f6', handle: '#2563eb', bg: 'bg-blue-500' },
    red: { stroke: '#ef4444', handle: '#dc2626', bg: 'bg-red-500' },
    green: { stroke: '#22c55e', handle: '#16a34a', bg: 'bg-green-500' },
    orange: { stroke: '#f97316', handle: '#ea580c', bg: 'bg-orange-500' },
    purple: { stroke: '#a855f7', handle: '#9333ea', bg: 'bg-purple-500' }
  };
  const theme = COLORS[color] || COLORS.blue;

  const playWindchime = () => {
    if (isMuted) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') ctx.resume();

      const frequencies = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00, 2349.32]; // C6 Pentatonic + high F

      frequencies.forEach((freq, i) => {
        const delay = Math.random() * 0.3 + (i * 0.1);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

        // Envelope
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + delay + 0.05); // Attack
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 2.5); // Long decay

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 2.5);
      });
    } catch (e) { console.error("Audio error", e); }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        updateData(widget.id, { timeLeft: Math.max(0, timeLeft - 1) });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      updateData(widget.id, { isRunning: false });
      playWindchime();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft, widget.id, updateData]);

  const calculateTimeFromMouseEvent = (e) => {
    if (!timerRef.current) return;
    const rect = timerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = e.clientX - cx;
    const y = e.clientY - cy;

    let angleRad = Math.atan2(y, x);
    let angle = angleRad + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;

    const totalMins = (angle / (2 * Math.PI)) * 60;
    const newSeconds = Math.max(0, Math.min(3600, Math.round(totalMins) * 60));

    return newSeconds;
  };

  const handleMouseDown = (e) => {
    if (isRunning) return;
    e.stopPropagation();
    e.preventDefault();
    isDraggingRef.current = true;

    const newTime = calculateTimeFromMouseEvent(e);
    if (newTime !== undefined) updateData(widget.id, { timeLeft: newTime });

    const handleGlobalMove = (ev) => {
      if (!isDraggingRef.current) return;
      ev.preventDefault();
      const t = calculateTimeFromMouseEvent(ev);
      if (t !== undefined) updateData(widget.id, { timeLeft: t });
    };

    const handleGlobalUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
    };

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalUp);
  };

  const toggleTimer = () => updateData(widget.id, { isRunning: !isRunning });
  const resetTimer = () => updateData(widget.id, { isRunning: false, timeLeft: 120 });
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const progress = timeLeft / 3600;

  const angle = progress * 2 * Math.PI;
  // Handle Position
  const handleR = 38; // Slightly inside outer edge (45)
  const handleX = 50 + handleR * Math.cos(angle);
  const handleY = 50 + handleR * Math.sin(angle);

  return (
    <div className="flex flex-col items-center justify-between h-full p-2 relative bg-white select-none group">
      <div className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        {mode === 'visual' && (
          <>
            <button
              onClick={() => setShowColorMenu(!showColorMenu)}
              className={`w-6 h-6 rounded-full ${COLORS[color].bg} ring-2 ring-white shadow-sm hover:scale-110 transition-transform`}
              title="Change Color"
            />
            {showColorMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex flex-col gap-2 z-50 animate-in fade-in slide-in-from-top-2">
                {Object.keys(COLORS).map(c => (
                  <button
                    key={c}
                    onClick={() => { updateData(widget.id, { color: c }); setShowColorMenu(false); }}
                    className={`w-5 h-5 rounded-full ${COLORS[c].bg} ${color === c ? 'ring-2 ring-slate-400' : ''} hover:scale-110 transition-transform`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <button onClick={() => updateData(widget.id, { mode: mode === 'digital' ? 'visual' : 'digital' })} className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-blue-600 rounded-full hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity z-20" title="Switch Mode"><Clock size={16} /></button>

      <div className="flex-1 w-full flex items-center justify-center p-2 min-h-0">
        {mode === 'visual' ? (
          <div className="relative w-full h-full max-h-[90%] aspect-square flex items-center justify-center">
            <svg ref={timerRef} className="transform -rotate-90 w-full h-full overflow-visible" viewBox="0 0 100 100" onMouseDown={handleMouseDown} style={{ cursor: isRunning ? 'default' : 'grab' }}>
              {/* Ticks */}
              {Array.from({ length: 60 }).map((_, i) => {
                const isMajor = i % 5 === 0;
                const tickAngle = (i / 60) * 2 * Math.PI;
                // Inner and outer radius for the tick lines
                // Track is at r=45. Let's put ticks inside or on it.
                // Let's go slightly inside: r=38 to r=44
                const rInner = isMajor ? 36 : 40;
                const rOuter = 44;
                const x1 = 50 + rInner * Math.cos(tickAngle);
                const y1 = 50 + rInner * Math.sin(tickAngle);
                const x2 = 50 + rOuter * Math.cos(tickAngle);
                const y2 = 50 + rOuter * Math.sin(tickAngle);

                return (
                  <line
                    key={i}
                    x1={x1} y1={y1}
                    x2={x2} y2={y2}
                    stroke={isMajor ? "#cbd5e1" : "#e2e8f0"}
                    strokeWidth={isMajor ? 1.5 : 1}
                    className="pointer-events-none"
                  />
                );
              })}

              {/* Track */}
              <circle cx="50" cy="50" r="45" stroke="#f3f4f6" strokeWidth="10" fill="white" className="opacity-10" />

              {/* colored slice - r=22.5, width=45 covers 0-45 radius (full pie) */}
              {timeLeft > 0 && (
                <circle cx="50" cy="50" r="22.5" stroke={theme.stroke} strokeWidth="45" fill="none"
                  strokeDasharray={`${2 * Math.PI * 22.5} ${2 * Math.PI * 22.5}`}
                  strokeDashoffset={2 * Math.PI * 22.5 * (1 - progress)}
                  className="transition-all duration-75 ease-linear pointer-events-none"
                />
              )}

              {/* Border */}
              <circle cx="50" cy="50" r="45" stroke="#e5e7eb" strokeWidth="1" fill="none" pointerEvents="none" />

              {/* Handle */}
              {!isRunning && (
                <g transform={`translate(${handleX}, ${handleY})`}>
                  <circle r="5" fill="white" stroke={theme.handle} strokeWidth="2" className="shadow-sm cursor-grab active:cursor-grabbing" />
                </g>
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="font-bold text-slate-700 bg-white/80 px-2 rounded-lg backdrop-blur-sm shadow-sm" style={{ fontSize: (fontSize * 1.5) + 'px' }}>{formatTime(timeLeft)}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className={`font-black text-slate-800 tracking-widest mb-4 font-sans`} style={{ fontSize: (fontSize * 4) + 'px' }}>{formatTime(timeLeft)}</div>
            {!isRunning && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2 items-center mt-2">
                  <input
                    type="text"
                    placeholder="00:00"
                    className="w-20 text-center border rounded p-1 text-sm font-bold text-gray-600"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const parts = customTime.split(':').map(Number);
                        let seconds = 0;
                        if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
                        else if (parts.length === 1 && !isNaN(parts[0])) seconds = parts[0] * 60;
                        if (seconds > 0) {
                          updateData(widget.id, { timeLeft: seconds });
                          setCustomTime("");
                        }
                      }
                    }}
                  />
                  <button onClick={() => {
                    const parts = customTime.split(':').map(Number);
                    let seconds = 0;
                    if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
                    else if (parts.length === 1 && !isNaN(parts[0])) seconds = parts[0] * 60;
                    if (seconds > 0) {
                      updateData(widget.id, { timeLeft: seconds });
                      setCustomTime("");
                    }
                  }} className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded text-xs font-bold">Set</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-4 items-center z-10 py-2">
        <button onClick={() => updateData(widget.id, { isMuted: !isMuted })} className={`p-2 rounded-full transition-colors ${isMuted ? 'text-red-400 bg-red-50' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`} title={isMuted ? "Unmute" : "Mute"}>
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button onClick={toggleTimer} className={`p-4 rounded-full text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center ${isRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}`}>
          {isRunning ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
        <button onClick={resetTimer} className="p-3 hover:bg-slate-100 rounded-full text-slate-500 transition-colors" title="Reset"><RotateCcw size={20} /></button>
      </div>
    </div>
  );
};

export default TimerWidget;