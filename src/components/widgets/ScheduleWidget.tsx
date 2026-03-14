import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Calendar, Settings, Plus, X, Copy, Trash2 } from 'lucide-react';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SCHEDULE_EMOJIS = [
    '\u{1F4DA}', '\u{1F3A8}', '\u{1F3C3}', '\u{1F3B5}', '\u{1F4BB}', '\u{1F96A}', '\u{1F4DD}', '\u{1F52C}', '\u{1F5E3}', '\u{1F6D1}', '\u{1F68C}', '\u{1F3E0}', '\u{1F4C5}', '\u{2B50}', '\u{1F514}',
    '\u{1F3A4}', '\u{1F3C0}', '\u{1F3CF}', '\u{1F3D0}', '\u{1F3D1}', '\u{1F3D2}', '\u{1F3D3}', '\u{1F3E6}', '\u{1F3EB}', '\u{1F3F3}', '\u{1F3F4}', '\u{1F3F8}', '\u{1F3F9}', '\u{1F3FA}', '\u{1F42C}',
    '\u{1F44D}', '\u{1F44E}', '\u{1F4A1}', '\u{1F4AF}', '\u{1F4CC}', '\u{1F4D6}', '\u{1F4D8}', '\u{1F4E2}', '\u{1F50D}', '\u{1F511}', '\u{1F512}', '\u{1F513}', '\u{1F550}', '\u{1F551}', '\u{1F552}',
    '\u{1F553}', '\u{1F554}', '\u{1F555}', '\u{1F556}', '\u{23F0}', '\u{23F3}', '\u{26BD}', '\u{26F3}', '\u{2705}', '\u{274C}', '\u{1F600}', '\u{1F60E}', '\u{1F914}', '\u{1F929}', '\u{1F389}'
];

// Baseline width for scaling calculations
const BASELINE_WIDTH = 400;

interface ScheduleWidgetProps {
    widget: any;
    updateData: (data: any) => void;
    onOpenSettings: () => void;
    scheduleTemplate: any;
    setScheduleTemplate: React.Dispatch<React.SetStateAction<any>>;
    scheduleOverrides: any;
    setScheduleOverrides: React.Dispatch<React.SetStateAction<any>>;
    scheduleSettings: any;
    setScheduleSettings: React.Dispatch<React.SetStateAction<any>>;
}

const ScheduleWidget: React.FC<ScheduleWidgetProps> = ({
    widget,
    onOpenSettings,
    scheduleTemplate,
    setScheduleTemplate,
    scheduleOverrides,
    setScheduleOverrides,
    scheduleSettings,
    setScheduleSettings,
    accentColor = 'indigo'
}) => {
    const { fontSize = 14 } = widget.data;
    const [dragIndex, setDragIndex] = useState(null);
    const [emojiPickerIndex, setEmojiPickerIndex] = useState(null);
    const today = DAYS_OF_WEEK[new Date().getDay()];
    
    // Calculate Cycle Day for Rotating Mode
    const getCycleDay = () => {
        if (!scheduleSettings || scheduleSettings.scheduleMode !== 'rotating') return null;
        const { realignDate, realignDay, daysInCycle } = scheduleSettings;
        if (!realignDate) return null;

        const start = new Date(realignDate);
        start.setHours(0, 0, 0, 0);
        const current = new Date();
        current.setHours(0, 0, 0, 0);

        const diffTime = current.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Only count weekdays (Mon-Fri) if that's the school policy, 
        // but typically rotating cycles in school count school days.
        // For simplicity, we'll follow the exact logic from the production site 
        // which usually counts calendar days since realignment.
        // If the user wants only weekdays, we can refine this later.
        
        const cycleIndex = (diffDays + (realignDay - 1)) % daysInCycle;
        const normalizedIndex = cycleIndex < 0 ? (cycleIndex + daysInCycle) : cycleIndex;
        return `Day ${normalizedIndex + 1}`;
    };

    const currentScheduleDay = scheduleSettings?.scheduleMode === 'rotating' ? getCycleDay() : today;
    const scheduleData = scheduleTemplate[currentScheduleDay] || [];

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

    // External state handles updates, no need for refresh timer

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

    const saveScheduleData = (newItems: any) => {
        setScheduleTemplate((prev: any) => ({ ...prev, [currentScheduleDay]: newItems }));
    };
    const updateItem = (index, field, value) => { const newItems = [...scheduleData]; newItems[index] = { ...newItems[index], [field]: value }; saveScheduleData(newItems); };
    const addItem = () => { const newItem = { id: Date.now().toString(), time: '09:00', emoji: '\u{1F4DA}', title: 'New Activity', description: '' }; const newItems = [...scheduleData, newItem].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)); saveScheduleData(newItems); };
    const removeItem = (index) => { const newItems = scheduleData.filter((_, i) => i !== index); saveScheduleData(newItems); };
    const duplicateItem = (index) => {
        const itemToDuplicate = scheduleData[index];
        const newItem = { ...itemToDuplicate, id: Date.now().toString() };
        const newItems = [...scheduleData];
        newItems.splice(index + 1, 0, newItem);
        saveScheduleData(newItems);
    };

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

    const isGlassy = widget.data?.isGlassy || 'solid';
    const bgClass = isGlassy === 'clear' 
        ? 'bg-transparent' 
        : isGlassy === 'glass'
        ? 'bg-white/10 backdrop-blur-md'
        : `bg-gradient-to-br ${accentColor === 'rose' ? 'from-rose-50 to-pink-50' : accentColor === 'blue' ? 'from-blue-50 to-cyan-50' : accentColor === 'purple' ? 'from-purple-50 to-fuchsia-50' : accentColor === 'emerald' ? 'from-emerald-50 to-teal-50' : accentColor === 'amber' ? 'from-amber-50 to-yellow-50' : 'from-indigo-50 to-purple-50'}`;

    const headerBgClass = isGlassy === 'clear'
        ? 'bg-transparent border-white/20'
        : 'bg-white/80 backdrop-blur border-b';

    const headerTextClass = isGlassy === 'clear'
        ? 'text-white'
        : `${accentColor === 'rose' ? 'text-rose-800' : accentColor === 'blue' ? 'text-blue-800' : accentColor === 'purple' ? 'text-purple-800' : accentColor === 'emerald' ? 'text-emerald-800' : accentColor === 'amber' ? 'text-amber-800' : 'text-indigo-800'}`;

    return (
        <div ref={containerRef} className={`flex flex-col h-full ${bgClass}`}>
            <div
                className={`${headerBgClass} flex items-center justify-between shrink-0`}
                style={{ height: headerH, paddingLeft: s(10), paddingRight: s(10) }}
            >
                <h3 className={`font-bold flex items-center ${headerTextClass}`} style={{ fontSize: headerFontSize, gap: s(6) }}>
                    <Calendar size={iconSize} /> {currentScheduleDay}'s Schedule
                </h3>
                <div className="flex" style={{ gap: s(4) }}>
                    <button onClick={addItem} className={`${isGlassy === 'clear' ? 'text-white/80 hover:bg-white/10' : accentColor === 'rose' ? 'text-rose-600 hover:bg-rose-100' : accentColor === 'blue' ? 'text-blue-600 hover:bg-blue-100' : accentColor === 'purple' ? 'text-purple-600 hover:bg-purple-100' : accentColor === 'emerald' ? 'text-emerald-600 hover:bg-emerald-100' : accentColor === 'amber' ? 'text-amber-600 hover:bg-amber-100' : 'text-indigo-600 hover:bg-indigo-100'} rounded-lg transition-colors`} style={{ padding: s(4) }} title="Add activity"><Plus size={iconSize} /></button>
                    <button onClick={onOpenSettings} className={`${isGlassy === 'clear' ? 'text-white/60 hover:bg-white/10' : 'text-gray-400 hover:bg-gray-100'} rounded-lg transition-colors`} style={{ padding: s(4) }} title="Schedule settings"><Settings size={iconSize} /></button>
                </div>
            </div>
            <div
                className="flex-1 overflow-y-auto flex flex-col custom-scrollbar"
                style={{ padding: s(6), gap }}
            >
                {scheduleData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center" style={{ padding: s(16) }}>
                        <Calendar size={s(40)} className={`${accentColor === 'rose' ? 'text-rose-200' : accentColor === 'blue' ? 'text-blue-200' : accentColor === 'purple' ? 'text-purple-200' : accentColor === 'emerald' ? 'text-emerald-200' : accentColor === 'amber' ? 'text-amber-200' : 'text-indigo-200'}`} style={{ marginBottom: s(12) }} />
                        <p className={`font-medium ${accentColor === 'rose' ? 'text-rose-400' : accentColor === 'blue' ? 'text-blue-400' : accentColor === 'purple' ? 'text-purple-400' : accentColor === 'emerald' ? 'text-emerald-400' : accentColor === 'amber' ? 'text-amber-400' : 'text-indigo-400'}`} style={{ fontSize: s(13), marginBottom: s(8) }}>No schedule items yet</p>
                        <button onClick={addItem} className={`text-white font-bold flex items-center transition-all ${accentColor === 'rose' ? 'bg-rose-600 hover:bg-rose-700' : accentColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : accentColor === 'purple' ? 'bg-purple-600 hover:bg-purple-700' : accentColor === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' : accentColor === 'amber' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}`} style={{ padding: `${s(6)}px ${s(12)}px`, fontSize: s(11), borderRadius: s(8), gap: s(4) }}><Plus size={s(14)} /> Add Activity</button>
                    </div>
                ) : (
                    scheduleData?.map((item, index) => {
                        const isCurrent = isCurrentItem(item, index);
                        const hasDescription = !!(item.description && item.description.trim());
                        return (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(index)}
                                className={`relative group flex items-stretch transition-all cursor-move w-full ${isCurrent ? (accentColor === 'rose' ? 'bg-rose-100 border-rose-400 ring-rose-300' : accentColor === 'blue' ? 'bg-blue-100 border-blue-400 ring-blue-300' : accentColor === 'purple' ? 'bg-purple-100 border-purple-400 ring-purple-300' : accentColor === 'emerald' ? 'bg-emerald-100 border-emerald-400 ring-emerald-300' : accentColor === 'amber' ? 'bg-amber-100 border-amber-400 ring-amber-300' : 'bg-indigo-100 border-indigo-400 ring-indigo-300') + ' ring-2' : (accentColor === 'rose' ? 'bg-white border-gray-200 hover:border-rose-200' : accentColor === 'blue' ? 'bg-white border-gray-200 hover:border-blue-200' : accentColor === 'purple' ? 'bg-white border-gray-200 hover:border-purple-200' : accentColor === 'emerald' ? 'bg-white border-gray-200 hover:border-emerald-200' : accentColor === 'amber' ? 'bg-white border-gray-200 hover:border-amber-200' : 'bg-white border-gray-200 hover:border-indigo-200')}`}
                                style={{
                                    gap: s(6),
                                    padding: itemPadding,
                                    borderRadius,
                                    borderWidth: 1,
                                    borderStyle: 'solid',
                                    zIndex: emojiPickerIndex === index ? 50 : 0,
                                }}
                            >
                                {isCurrent && <div className={`absolute rounded-full animate-pulse ${accentColor === 'rose' ? 'bg-rose-500' : accentColor === 'blue' ? 'bg-blue-500' : accentColor === 'purple' ? 'bg-purple-500' : accentColor === 'emerald' ? 'bg-emerald-500' : accentColor === 'amber' ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ left: -s(4), top: '50%', transform: 'translateY(-50%)', width: s(8), height: s(8) }} />}

                                {/* Time column */}
                                <div className="flex flex-col items-center shrink-0 justify-center" style={{ width: s(64) }}>
                                    <input
                                        type="time"
                                        value={item.time || '09:00'}
                                        onChange={(e) => updateItem(index, 'time', e.target.value)}
                                        className={`w-full font-bold bg-transparent border-none text-center cursor-pointer rounded ${accentColor === 'rose' ? 'text-rose-600 hover:bg-rose-50' : accentColor === 'blue' ? 'text-blue-600 hover:bg-blue-50' : accentColor === 'purple' ? 'text-purple-600 hover:bg-purple-50' : accentColor === 'emerald' ? 'text-emerald-600 hover:bg-emerald-50' : accentColor === 'amber' ? 'text-amber-600 hover:bg-amber-50' : 'text-indigo-600 hover:bg-indigo-50'}`}
                                        style={{ fontSize: timeFontSize }}
                                    />
                                </div>

                                {/* Emoji column */}
                                <div className="relative flex items-center shrink-0">
                                    <div
                                        className={`cursor-pointer hover:scale-110 transition-transform rounded ${accentColor === 'rose' ? 'hover:bg-rose-100' : accentColor === 'blue' ? 'hover:bg-blue-100' : accentColor === 'purple' ? 'hover:bg-purple-100' : accentColor === 'emerald' ? 'hover:bg-emerald-100' : accentColor === 'amber' ? 'hover:bg-amber-100' : 'hover:bg-indigo-100'}`}
                                        style={{ fontSize: emojiSize, padding: s(3), lineHeight: 1 }}
                                        onClick={(e) => { e.stopPropagation(); setEmojiPickerIndex(emojiPickerIndex === index ? null : index); }}
                                    >
                                        {item.emoji || '📚'}
                                    </div>
                                    {emojiPickerIndex === index && (
                                        <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-2 w-48 max-h-40 overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
                                            <div className="grid grid-cols-5 gap-1"> {SCHEDULE_EMOJIS.map((emoji, i) => (<button key={i} onClick={() => selectEmoji(index, emoji)} className={`text-xl p-1.5 rounded-lg transition-colors ${item.emoji === emoji ? (accentColor === 'rose' ? 'bg-rose-200 ring-rose-400' : accentColor === 'blue' ? 'bg-blue-200 ring-blue-400' : accentColor === 'purple' ? 'bg-purple-200 ring-purple-400' : accentColor === 'emerald' ? 'bg-emerald-200 ring-emerald-400' : accentColor === 'amber' ? 'bg-amber-200 ring-amber-400' : 'bg-indigo-200 ring-indigo-400') + ' ring-2' : (accentColor === 'rose' ? 'hover:bg-rose-100' : accentColor === 'blue' ? 'hover:bg-blue-100' : accentColor === 'purple' ? 'hover:bg-purple-100' : accentColor === 'emerald' ? 'hover:bg-emerald-100' : accentColor === 'amber' ? 'hover:bg-amber-100' : 'hover:bg-indigo-100')}`}>{emoji}</button>))} </div>
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
                                    {scheduleSettings?.showDescriptions !== false && (
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
                                    )}
                                </div>

                                {/* Duplicate and Remove buttons */}
                                <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0">
                                    <button
                                        onClick={() => duplicateItem(index)}
                                        className={`transition-colors ${accentColor === 'rose' ? 'text-gray-400 hover:text-rose-600' : accentColor === 'blue' ? 'text-gray-400 hover:text-blue-600' : accentColor === 'purple' ? 'text-gray-400 hover:text-purple-600' : accentColor === 'emerald' ? 'text-gray-400 hover:text-emerald-600' : accentColor === 'amber' ? 'text-gray-400 hover:text-amber-600' : 'text-gray-400 hover:text-indigo-600'}`}
                                        style={{ padding: s(3) }}
                                        title="Duplicate"
                                    >
                                        <Copy size={Math.max(10, s(14))} />
                                    </button>
                                    <button
                                        onClick={() => removeItem(index)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        style={{ padding: s(3) }}
                                        title="Delete"
                                    >
                                        <Trash2 size={Math.max(10, s(14))} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ScheduleWidget;
