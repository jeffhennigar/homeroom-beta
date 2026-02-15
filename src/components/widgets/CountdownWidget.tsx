import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, RotateCw, Settings } from 'lucide-react';

const COUNTDOWN_THEMES: Record<string, { bar: string; setup: string; icon: string; title: string; border: string; focus: string; btn: string; shadow: string; swatch: string }> = {
    purple: { bar: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)', setup: 'linear-gradient(135deg, #eef2ff 0%, #e8e0ff 100%)', icon: 'linear-gradient(135deg, #6366f1, #7c3aed)', title: '#312e81', border: '#e0e7ff', focus: '#6366f1', btn: 'linear-gradient(135deg, #6366f1, #7c3aed)', shadow: 'rgba(99, 102, 241, 0.35)', swatch: '#7c3aed' },
    blue: { bar: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #2563eb 100%)', setup: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', icon: 'linear-gradient(135deg, #2563eb, #3b82f6)', title: '#1e3a5f', border: '#bfdbfe', focus: '#3b82f6', btn: 'linear-gradient(135deg, #2563eb, #3b82f6)', shadow: 'rgba(59, 130, 246, 0.35)', swatch: '#3b82f6' },
    teal: { bar: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #0f766e 100%)', setup: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)', icon: 'linear-gradient(135deg, #0d9488, #14b8a6)', title: '#134e4a', border: '#99f6e4', focus: '#14b8a6', btn: 'linear-gradient(135deg, #0d9488, #14b8a6)', shadow: 'rgba(20, 184, 166, 0.35)', swatch: '#14b8a6' },
    green: { bar: 'linear-gradient(135deg, #15803d 0%, #22c55e 50%, #16a34a 100%)', setup: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', icon: 'linear-gradient(135deg, #16a34a, #22c55e)', title: '#14532d', border: '#bbf7d0', focus: '#22c55e', btn: 'linear-gradient(135deg, #16a34a, #22c55e)', shadow: 'rgba(34, 197, 94, 0.35)', swatch: '#22c55e' },
    orange: { bar: 'linear-gradient(135deg, #c2410c 0%, #f97316 50%, #ea580c 100%)', setup: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', icon: 'linear-gradient(135deg, #ea580c, #f97316)', title: '#7c2d12', border: '#fed7aa', focus: '#f97316', btn: 'linear-gradient(135deg, #ea580c, #f97316)', shadow: 'rgba(249, 115, 22, 0.35)', swatch: '#f97316' },
    red: { bar: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 50%, #dc2626 100%)', setup: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', icon: 'linear-gradient(135deg, #dc2626, #ef4444)', title: '#7f1d1d', border: '#fecaca', focus: '#ef4444', btn: 'linear-gradient(135deg, #dc2626, #ef4444)', shadow: 'rgba(239, 68, 68, 0.35)', swatch: '#ef4444' },
    pink: { bar: 'linear-gradient(135deg, #be185d 0%, #ec4899 50%, #db2777 100%)', setup: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', icon: 'linear-gradient(135deg, #db2777, #ec4899)', title: '#831843', border: '#fbcfe8', focus: '#ec4899', btn: 'linear-gradient(135deg, #db2777, #ec4899)', shadow: 'rgba(236, 72, 153, 0.35)', swatch: '#ec4899' },
    slate: { bar: 'linear-gradient(135deg, #1e293b 0%, #475569 50%, #334155 100%)', setup: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', icon: 'linear-gradient(135deg, #334155, #475569)', title: '#0f172a', border: '#cbd5e1', focus: '#475569', btn: 'linear-gradient(135deg, #334155, #475569)', shadow: 'rgba(71, 85, 105, 0.35)', swatch: '#475569' },
};

const CountdownWidget = ({ widget, updateData, updateSize }) => {
    const data = widget.data || {};
    const eventName = data.eventName || '';
    const targetDate = data.targetDate || '';
    const isRunning = data.isRunning || false;
    const scrollText = data.scrollText || false;
    const colorTheme = data.colorTheme || 'purple';
    const theme = COUNTDOWN_THEMES[colorTheme] || COUNTDOWN_THEMES.purple;

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isRunning || !targetDate) return;
        const tick = () => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const diff = target - now;
            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
                return;
            }
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
                total: diff
            });
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [isRunning, targetDate]);

    const handleStart = () => {
        if (!eventName.trim() || !targetDate) return;
        updateData(widget.id, { isRunning: true });
        if (updateSize) updateSize(widget.id, { width: 780, height: 120 });
    };

    const handleEdit = () => {
        updateData(widget.id, { isRunning: false });
        if (updateSize) updateSize(widget.id, { width: 290, height: 360 });
    };

    const handleReset = () => {
        updateData(widget.id, { eventName: '', targetDate: '', isRunning: false });
        if (updateSize) updateSize(widget.id, { width: 290, height: 360 });
    };

    const isExpired = isRunning && targetDate && timeLeft.total <= 0;

    // ── Running / Bar view ──
    if (isRunning) {
        const barContent = (
            <>
                <div className="shrink-0" style={{ marginRight: 20, maxWidth: scrollText ? 'none' : '25%', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1, marginBottom: 4 }}>Countdown</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>{eventName || 'Event'}</div>
                </div>
                <div style={{ width: 1, height: 50, background: 'rgba(255,255,255,0.2)', marginRight: 24, marginLeft: scrollText ? 24 : 0, flexShrink: 0 }} />
                <div className="flex items-center justify-center" style={{ gap: 6, flexShrink: 0 }}>
                    {isExpired ? (
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#fbbf24', textAlign: 'center' }}>🎉 Time's Up!</div>
                    ) : (
                        <>
                            <CountdownUnit value={timeLeft.days} label="DAYS" />
                            <Separator />
                            <CountdownUnit value={timeLeft.hours} label="HRS" />
                            <Separator />
                            <CountdownUnit value={timeLeft.minutes} label="MIN" />
                            <Separator />
                            <CountdownUnit value={timeLeft.seconds} label="SEC" />
                        </>
                    )}
                </div>
                {scrollText && <div style={{ width: 80, flexShrink: 0 }} />}
            </>
        );

        return (
            <div ref={containerRef} className="h-full w-full" style={{ background: theme.bar, overflow: 'hidden', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative' }}>
                {scrollText && <style>{`@keyframes countdownScroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>}
                <div className="flex items-center h-full" style={scrollText ? { animation: 'countdownScroll 15s linear infinite', whiteSpace: 'nowrap', display: 'inline-flex', paddingLeft: 24, paddingRight: 24, overflow: 'hidden' } : { padding: '0 24px', overflow: 'hidden' }}>
                    {barContent}
                </div>
                {/* Settings cog — click goes directly to edit */}
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <button
                        onClick={handleEdit}
                        className="hover:brightness-110 active:scale-95"
                        style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s', opacity: 0,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                    >
                        <Settings size={16} />
                    </button>
                </div>
            </div>
        );
    }

    // ── Setup / Compact view ──
    return (
        <div
            ref={containerRef}
            className="flex flex-col h-full items-center justify-center"
            style={{ background: theme.setup, padding: 20, transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
            <div style={{ width: 56, height: 56, borderRadius: 16, background: theme.icon, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: `0 8px 24px ${theme.shadow}` }}>
                <Clock size={28} color="white" />
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 800, color: theme.title, marginBottom: 12, letterSpacing: '-0.01em' }}>Event Countdown</h3>

            {/* Color Theme Picker */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                {Object.entries(COUNTDOWN_THEMES).map(([key, t]) => (
                    <button
                        key={key}
                        onClick={() => updateData(widget.id, { colorTheme: key })}
                        title={key.charAt(0).toUpperCase() + key.slice(1)}
                        style={{
                            width: 22, height: 22, borderRadius: '50%', background: t.swatch,
                            border: colorTheme === key ? '3px solid white' : '2px solid transparent',
                            boxShadow: colorTheme === key ? `0 0 0 2px ${t.swatch}, 0 2px 8px ${t.shadow}` : '0 1px 3px rgba(0,0,0,0.15)',
                            cursor: 'pointer', transition: 'all 0.2s',
                            transform: colorTheme === key ? 'scale(1.15)' : 'scale(1)',
                        }}
                    />
                ))}
            </div>

            <input type="text" value={eventName} onChange={(e) => updateData(widget.id, { eventName: e.target.value })} placeholder="Event name..." style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `2px solid ${theme.border}`, fontSize: 14, fontWeight: 600, color: '#1e293b', outline: 'none', background: 'white', marginBottom: 10, textAlign: 'center', transition: 'border-color 0.2s' }} onFocus={(e) => (e.target.style.borderColor = theme.focus)} onBlur={(e) => (e.target.style.borderColor = theme.border)} />

            <input type="datetime-local" value={targetDate} onChange={(e) => updateData(widget.id, { targetDate: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `2px solid ${theme.border}`, fontSize: 13, fontWeight: 600, color: '#475569', outline: 'none', background: 'white', marginBottom: 14, textAlign: 'center', transition: 'border-color 0.2s' }} onFocus={(e) => (e.target.style.borderColor = theme.focus)} onBlur={(e) => (e.target.style.borderColor = theme.border)} />

            {/* Scroll Text Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer', userSelect: 'none' }}>
                <div onClick={() => updateData(widget.id, { scrollText: !scrollText })} style={{ width: 36, height: 20, borderRadius: 10, background: scrollText ? theme.swatch : '#cbd5e1', position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: scrollText ? 18 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: theme.title, opacity: 0.7 }}>Scroll text</span>
            </label>

            <button onClick={handleStart} disabled={!eventName.trim() || !targetDate} className="active:scale-95" style={{ width: '100%', padding: '12px 20px', borderRadius: 12, border: 'none', background: (!eventName.trim() || !targetDate) ? '#cbd5e1' : theme.btn, color: 'white', fontSize: 14, fontWeight: 800, cursor: (!eventName.trim() || !targetDate) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', boxShadow: (!eventName.trim() || !targetDate) ? 'none' : `0 6px 20px ${theme.shadow}` }}>
                <Play size={16} /> Start Countdown
            </button>

            {(eventName || targetDate) && (
                <button onClick={handleReset} className="active:scale-95" style={{ width: '100%', padding: '8px 16px', borderRadius: 10, border: 'none', background: 'transparent', color: theme.title, fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: 0.5, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}>
                    <RotateCw size={12} /> Reset
                </button>
            )}
        </div>
    );
};

const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
    <div style={{ textAlign: 'center', minWidth: 54 }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: 'white', lineHeight: 1, fontFamily: "'Inter', system-ui, monospace", letterSpacing: '-0.03em', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>{String(value).padStart(2, '0')}</div>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', marginTop: 4 }}>{label}</div>
    </div>
);

const Separator = () => (
    <div style={{ fontSize: 24, fontWeight: 800, color: 'rgba(255,255,255,0.3)', lineHeight: 1, paddingBottom: 10, userSelect: 'none' }}>:</div>
);

export default CountdownWidget;
