import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';

interface CalendarWidgetProps {
    widget: any;
    updateData: (id: string, data: any) => void;
    textColor?: string;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ widget, updateData, textColor = 'text-slate-800' }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [viewMode, setViewMode] = useState<'calendar' | 'today'>(widget.data?.viewMode || 'calendar');

    const isGlassy = widget.data?.isGlassy;
    const isDark = (isGlassy === 'glass' || isGlassy === 'clear') && textColor === 'text-white';

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const changeMonth = (delta: number) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
    };

    const goToToday = () => {
        const today = new Date();
        setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
        setSelectedDate(today);
    };

    const isCurrentToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
            viewDate.getMonth() === today.getMonth() &&
            viewDate.getFullYear() === today.getFullYear();
    };

    const isDateSelected = (day: number) => {
        return selectedDate &&
            day === selectedDate.getDate() &&
            viewDate.getMonth() === selectedDate.getMonth() &&
            viewDate.getFullYear() === selectedDate.getFullYear();
    };

    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className={`flex flex-col h-full relative p-5 group transition-all duration-700 ease-in-out`}>
            {/* Header */}
            <div className={`flex justify-between items-center ${viewMode === 'calendar' ? 'mb-6' : 'mb-2'} shrink-0`}>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => changeMonth(-1)}
                        onPointerDown={(e) => e.stopPropagation()}
                        className={`p-1.5 rounded-xl transition-all active:scale-95 ${isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                    >
                        <ChevronLeft size={22} strokeWidth={2.5} />
                    </button>
                    <div className={`font-black text-[1.2rem] mx-2 tracking-tight whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </div>
                    <button
                        onClick={() => changeMonth(1)}
                        onPointerDown={(e) => e.stopPropagation()}
                        className={`p-1.5 rounded-xl transition-all active:scale-95 ${isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                    >
                        <ChevronRight size={22} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={goToToday}
                        onPointerDown={(e) => e.stopPropagation()}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[0.7rem] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5
                            ${isDark 
                                ? 'bg-white/10 text-white hover:bg-white/20' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        <RotateCcw size={12} strokeWidth={3} />
                        Today
                    </button>
                </div>
            </div>

            {viewMode === 'calendar' ? (
                /* Grid View */
                <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-700">
                    {/* Weekdays */}
                    <div className="grid grid-cols-7 mb-3 shrink-0">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} className={`text-center text-[0.7rem] font-black uppercase tracking-[0.15em] ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-1.5 flex-1 content-start">
                        {blanks.map(i => <div key={`blank-${i}`} />)}
                        {days.map(d => {
                            const selected = isDateSelected(d);
                            const today = isCurrentToday(d);
                            return (
                                <button
                                    key={d}
                                    onClick={() => setSelectedDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), d))}
                                    onPointerDown={(e) => e.stopPropagation()}
                                    className={`
                                        aspect-square flex items-center justify-center rounded-full text-[0.95rem] font-bold transition-all relative
                                        ${selected
                                            ? (isDark ? 'bg-white text-slate-900 shadow-xl scale-110 z-10' : 'bg-slate-900 text-white shadow-xl scale-110 z-10')
                                            : today
                                                ? (isDark ? 'bg-white/20 text-white ring-2 ring-white/50' : 'bg-white text-slate-900 ring-2 ring-slate-100 shadow-sm')
                                                : isDark
                                                    ? 'text-white/80 hover:bg-white/10'
                                                    : 'text-slate-600 hover:bg-slate-100'
                                        }
                                    `}
                                >
                                    {d}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* Today View (Big Date) */
                <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative animate-in fade-in zoom-in duration-700">
                    <div className={`text-[7rem] font-black leading-none tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {new Date().getDate()}
                    </div>
                    <div className={`text-[1.5rem] font-black uppercase tracking-[0.2em] mt-2 ${isDark ? 'text-white/50' : 'text-slate-400'}`}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>
                    <div className={`mt-4 font-black px-5 py-1.5 rounded-full text-[0.65rem] uppercase tracking-[0.3em] ${isDark ? 'bg-white/10 text-white/60' : 'bg-slate-100 text-slate-400'}`}>
                        {monthNames[new Date().getMonth()]} {new Date().getFullYear()}
                    </div>
                </div>
            )}

            {/* View Mode Toggle */}
            <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                <button
                    onClick={() => {
                        const nextMode = viewMode === 'calendar' ? 'today' : 'calendar';
                        setViewMode(nextMode);
                        updateData(widget.id, { viewMode: nextMode });
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className={`p-2 rounded-xl transition-all shadow-lg border active:scale-95 ${isDark ? 'bg-white/20 border-white/20 text-white hover:bg-white/30' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-900'}`}
                    title={viewMode === 'calendar' ? "Switch to Today View" : "Switch to Calendar"}
                >
                    <CalendarIcon size={18} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};

export default CalendarWidget;
