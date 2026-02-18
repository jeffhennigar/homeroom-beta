import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarWidgetProps {
    widget: any;
    updateData: (id: string, data: any) => void;
    textColor?: string;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ widget, updateData, textColor = 'text-slate-800' }) => {
    const [viewDate, setViewDate] = useState(new Date());
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

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
            viewDate.getMonth() === today.getMonth() &&
            viewDate.getFullYear() === today.getFullYear();
    };

    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const [viewMode, setViewMode] = useState<'calendar' | 'big'>('calendar');

    return (
        <div className={`flex flex-col h-full relative p-4 group ${(isGlassy === 'glass' || isGlassy === 'clear') ? 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20' : 'bg-white rounded-2xl shadow-sm text-slate-800'}`}>
            {/* Header */}
            <div className={`flex justify-between items-center ${viewMode === 'calendar' ? 'mb-2' : 'mb-0'} shrink-0`}>
                <div className="flex items-center">
                    <button
                        onClick={() => changeMonth(-1)}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className={`font-bold text-[1.1em] mx-1 whitespace-nowrap ${isDark ? 'text-white drop-shadow-sm' : 'text-slate-800'}`}>
                        {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </div>
                    <button
                        onClick={() => changeMonth(1)}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {viewMode === 'calendar' ? (
                /* Grid */
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 mb-1 shrink-0">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} className={`text-center text-[0.7em] font-bold uppercase ${isDark ? 'text-white/60' : 'text-slate-400'}`}>{d}</div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 flex-1 content-start overflow-hidden">
                        {blanks.map(i => <div key={`blank-${i}`} />)}
                        {days.map(d => (
                            <div
                                key={d}
                                className={`
                        aspect-square flex items-center justify-center rounded-full text-[0.9em] font-medium transition-all
                        ${isToday(d)
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                        : isDark ? 'text-white/90 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-50'
                                    }
                    `}
                            >
                                {d}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Big Date View */
                <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative">
                    <div className={`text-[5em] font-black leading-none tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {new Date().getDate()}
                    </div>
                    <div className={`text-[1.2em] font-bold uppercase tracking-widest ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>
                    <div className={`absolute top-2 right-2 text-xs font-bold ${isDark ? 'text-white/30' : 'text-slate-300'}`}>TODAY</div>
                </div>
            )}

            {/* Big Date Toggle / Overlay */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={() => setViewMode(viewMode === 'calendar' ? 'big' : 'calendar')}
                    className="p-1.5 bg-gray-100 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors border border-gray-200 shadow-sm"
                    title={viewMode === 'calendar' ? "Switch to Today View" : "Switch to Calendar"}
                >
                    <CalendarIcon size={14} />
                </button>
            </div>
        </div>
    );
};

export default CalendarWidget;
