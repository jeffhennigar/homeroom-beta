import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Calendar, Settings, Plus, X, Copy } from 'lucide-react';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SCHEDULE_EMOJIS = ['\u{1F4DA}', '\u{1F3A8}', '\u{1F3C3}', '\u{1F3B5}', '\u{1F4BB}', '\u{1F96A}', '\u{1F4DD}', '\u{1F52C}', '\u{1F5E3}', '\u{1F6D1}', '\u{1F68C}', '\u{1F3E0}', '\u{1F4C5}', '\u{2B50}', '\u{1F514}'];

// Baseline width for scaling calculations
const BASELINE_WIDTH = 400;

// Helper to interact with App-level state/storage for schedule template
const getScheduleTemplate = () => {
    try {
        return JSON.parse(localStorage.getItem('homeroom_schedule_template')) || {
            Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: []
        };
    } catch (e) {
        return { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] };
    }
};

const saveScheduleTemplate = (template) => {
    localStorage.setItem('homeroom_schedule_template', JSON.stringify(template));
};

const ScheduleWidget = ({ widget, updateData, onOpenSettings }) => {
    const { fontSize = 14 } = widget.data;
    const [dragIndex, setDragIndex] = useState(null);
    const [emojiPickerIndex, setEmojiPickerIndex] = useState(null);
    const today = DAYS_OF_WEEK[new Date().getDay()];
    const [scheduleData, setScheduleData] = useState(() => { const template = getScheduleTemplate(); return template[today] || []; });

    // Responsive scaling state
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    // ResizeObserver for responsive scaling
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const w = entry.contentRect.width;
                // Scale factor: 1.0 at 400px, shrinks/grows proportionally
                setScale(Math.max(0.55, Math.min(1.4, w / BASELINE_WIDTH)));
            }
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Auto-size textareas when data changes or scale changes
    const autoSizeTextareas = useCallback(() => {
        if (!containerRef.current) return;
        const textareas = containerRef.current.querySelectorAll('textarea[data-autosize]');
        textareas.forEach((ta: HTMLTextAreaElement) => {
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 'px';
        });
    }, []);

    useLayoutEffect(() => {
        // Small delay to let the DOM render before measuring
        const raf = requestAnimationFrame(autoSizeTextareas);
        return () => cancelAnimationFrame(raf);
    }, [scheduleData, scale, autoSizeTextareas]);

    useEffect(() => {
        const refreshFromStorage = () => { const template = getScheduleTemplate(); setScheduleData(template[today] || []); };
        const interval = setInterval(refreshFromStorage, 1000);
        return () => clearInterval(interval);
    }, [today]);

    useEffect(() => {
        const handleClickOutside = () => setEmojiPickerIndex(null);
        if (emojiPickerIndex !== null) { document.addEventListener('click', handleClickOutside); return () => document.removeEventListener('click', handleClickOutside); }
    }, [emojiPickerIndex]);

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const parseTimeToMinutes = (time) => { if (!time) return 0; const [h, m] = time.split(':').map(Number); return h * 60 + m; };

    const isCurrentItem = (item, index) => {
        const itemMinutes = parseTimeToMinutes(item.time);
        const nextItem = scheduleData[index + 1];
        const nextMinutes = nextItem ? parseTimeToMinutes(nextItem.time) : 24 * 60;
        return currentMinutes >= itemMinutes && currentMinutes < nextMinutes;
    };

    const saveScheduleData = (newItems) => { const template = getScheduleTemplate(); template[today] = newItems; saveScheduleTemplate(template); setScheduleData(newItems); };
    const updateItem = (index, field, value) => { const newItems = [...scheduleData]; newItems[index] = { ...newItems[index], [field]: value }; saveScheduleData(newItems); };
    const addItem = () => { const newItem = { id: Date.now().toString(), time: '09:00', emoji: '\u{1F4DA}', title: 'New Activity', description: '' }; const newItems = [...scheduleData, newItem].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)); saveScheduleData(newItems); };
    const removeItem = (index) => { const newItems = scheduleData.filter((_, i) => i !== index); saveScheduleData(newItems); };

    const handleDragStart = (index) => { setDragIndex(index); };
    const handleDragOver = (e) => { e.preventDefault(); };
    const handleDrop = (targetIndex) => { if (dragIndex === null || dragIndex === targetIndex) return; const newItems = [...scheduleData]; const [moved] = newItems.splice(dragIndex, 1); newItems.splice(targetIndex, 0, moved); saveScheduleData(newItems); setDragIndex(null); };
    const selectEmoji = (index, emoji) => { updateItem(index, 'emoji', emoji); setEmojiPickerIndex(null); };

    // Scaled sizes
    const s = (base: number) => Math.round(base * scale);
    const headerH = s(36);
    const itemPadding = s(8);
    const gap = s(4);
    const titleFontSize = Math.max(10, s(Math.max(10, fontSize - 6)));
    const descFontSize = Math.max(9, s(11));
    const timeFontSize = Math.max(9, s(12));
    const emojiSize = Math.max(16, s(22));
    const headerFontSize = Math.max(10, s(13));
    const iconSize = Math.max(12, s(16));
    const borderRadius = s(8);

    return (
        <div ref={containerRef} className="flex flex-col h-full bg-gradient-to-br from-indigo-50 to-purple-50">
            <div
                className="bg-white/80 backdrop-blur border-b flex items-center justify-between shrink-0"
                style={{ height: headerH, paddingLeft: s(10), paddingRight: s(10) }}
            >
                <h3 className="font-bold text-indigo-800 flex items-center" style={{ fontSize: headerFontSize, gap: s(6) }}>
                    <Calendar size={iconSize} /> {today}'s Schedule
                </h3>
                <div className="flex" style={{ gap: s(4) }}>
                    <button onClick={addItem} className="text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors" style={{ padding: s(4) }} title="Add activity"><Plus size={iconSize} /></button>
                    <button onClick={onOpenSettings} className="text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" style={{ padding: s(4) }} title="Schedule settings"><Settings size={iconSize} /></button>
                </div>
            </div>
            <div
                className="flex-1 overflow-y-auto flex flex-col custom-scrollbar"
                style={{ padding: s(6), gap }}
            >
                {scheduleData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center" style={{ padding: s(16) }}>
                        <Calendar size={s(40)} className="text-indigo-200" style={{ marginBottom: s(12) }} />
                        <p className="text-indigo-400 font-medium" style={{ fontSize: s(13), marginBottom: s(8) }}>No schedule items yet</p>
                        <button onClick={addItem} className="bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex items-center" style={{ padding: `${s(6)}px ${s(12)}px`, fontSize: s(11), borderRadius: s(8), gap: s(4) }}><Plus size={s(14)} /> Add Activity</button>
                    </div>
                ) : (
                    scheduleData.map((item, index) => {
                        const isCurrent = isCurrentItem(item, index);
                        const hasDescription = !!(item.description && item.description.trim());
                        return (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(index)}
                                className={`relative group flex items-stretch transition-all cursor-move w-full ${isCurrent ? 'bg-indigo-100 border-indigo-400 ring-2 ring-indigo-300' : 'bg-white border-gray-200 hover:border-indigo-200'}`}
                                style={{
                                    gap: s(6),
                                    padding: itemPadding,
                                    borderRadius,
                                    borderWidth: 1,
                                    borderStyle: 'solid',
                                    zIndex: emojiPickerIndex === index ? 50 : 0,
                                }}
                            >
                                {isCurrent && <div className="absolute bg-indigo-500 rounded-full animate-pulse" style={{ left: -s(4), top: '50%', transform: 'translateY(-50%)', width: s(8), height: s(8) }} />}

                                {/* Time column */}
                                <div className="flex flex-col items-center shrink-0 justify-center" style={{ width: s(64) }}>
                                    <input
                                        type="time"
                                        value={item.time || '09:00'}
                                        onChange={(e) => updateItem(index, 'time', e.target.value)}
                                        className="w-full font-bold text-indigo-600 bg-transparent border-none text-center cursor-pointer hover:bg-indigo-50 rounded"
                                        style={{ fontSize: timeFontSize }}
                                    />
                                </div>

                                {/* Emoji column */}
                                <div className="relative flex items-center shrink-0">
                                    <div
                                        className="cursor-pointer hover:scale-110 transition-transform rounded hover:bg-indigo-100"
                                        style={{ fontSize: emojiSize, padding: s(3), lineHeight: 1 }}
                                        onClick={(e) => { e.stopPropagation(); setEmojiPickerIndex(emojiPickerIndex === index ? null : index); }}
                                    >
                                        {item.emoji || '📚'}
                                    </div>
                                    {emojiPickerIndex === index && (
                                        <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-2 w-48 max-h-40 overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
                                            <div className="grid grid-cols-5 gap-1"> {SCHEDULE_EMOJIS.map((emoji, i) => (<button key={i} onClick={() => selectEmoji(index, emoji)} className={`text-xl p-1.5 rounded-lg hover:bg-indigo-100 transition-colors ${item.emoji === emoji ? 'bg-indigo-200 ring-2 ring-indigo-400' : ''}`}>{emoji}</button>))} </div>
                                        </div>
                                    )}
                                </div>

                                {/* Title + description column */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ gap: s(1) }}>
                                    <input
                                        type="text"
                                        value={item.title || ''}
                                        onChange={(e) => updateItem(index, 'title', e.target.value)}
                                        className="w-full font-bold text-gray-800 bg-transparent border-none outline-none truncate"
                                        style={{ fontSize: titleFontSize }}
                                        placeholder="Activity name"
                                    />
                                    <textarea
                                        data-autosize
                                        value={item.description || ''}
                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') e.stopPropagation(); }}
                                        className="w-full text-gray-500 bg-transparent border-none outline-none resize-none placeholder-gray-300 font-medium overflow-hidden"
                                        style={{ fontSize: descFontSize, lineHeight: 1.4 }}
                                        placeholder="Add details..."
                                        rows={1}
                                        onInput={(e: any) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                    />
                                </div>

                                {/* Remove button */}
                                <button
                                    onClick={() => removeItem(index)}
                                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0"
                                    style={{ padding: s(3) }}
                                >
                                    <X size={Math.max(10, s(14))} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ScheduleWidget;
