import React, { useState, useEffect, useRef } from 'react';
import { Clock, Play, RotateCw, Edit3 } from 'lucide-react';

const CountdownWidget = ({ widget, updateData, updateSize }) => {
    const data = widget.data || {};
    const eventName = data.eventName || '';
    const targetDate = data.targetDate || '';
    const isRunning = data.isRunning || false;

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Live countdown tick
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
        // Morph to wide bar
        if (updateSize) {
            updateSize(widget.id, { width: 700, height: 110 });
        }
    };

    const handleEdit = () => {
        updateData(widget.id, { isRunning: false });
        // Revert to compact form
        if (updateSize) {
            updateSize(widget.id, { width: 280, height: 280 });
        }
    };

    const handleReset = () => {
        updateData(widget.id, { eventName: '', targetDate: '', isRunning: false });
        if (updateSize) {
            updateSize(widget.id, { width: 280, height: 280 });
        }
    };

    const isExpired = isRunning && targetDate && timeLeft.total <= 0;

    // ── Running / Bar view ──
    if (isRunning) {
        return (
            <div
                ref={containerRef}
                className="flex items-center h-full w-full"
                style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)',
                    padding: '0 24px',
                    overflow: 'hidden',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                {/* Event name */}
                <div className="shrink-0" style={{ marginRight: 20, maxWidth: '25%' }}>
                    <div style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.6)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        lineHeight: 1,
                        marginBottom: 4,
                    }}>
                        Countdown
                    </div>
                    <div style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: 'white',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.2,
                    }}>
                        {eventName || 'Event'}
                    </div>
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 50, background: 'rgba(255,255,255,0.2)', marginRight: 24, flexShrink: 0 }} />

                {/* Countdown digits */}
                <div className="flex items-center flex-1 justify-center" style={{ gap: 6 }}>
                    {isExpired ? (
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#fbbf24', textAlign: 'center' }}>
                            🎉 Time's Up!
                        </div>
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

                {/* Controls */}
                <div className="flex shrink-0" style={{ gap: 8, marginLeft: 16 }}>
                    <button
                        onClick={handleEdit}
                        className="hover:brightness-110 active:scale-95"
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: 8,
                            padding: '6px 12px',
                            color: 'white',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'all 0.15s',
                        }}
                    >
                        <Edit3 size={13} /> Edit
                    </button>
                    <button
                        onClick={handleReset}
                        className="hover:brightness-110 active:scale-95"
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 8,
                            padding: '6px 8px',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                        title="Reset"
                    >
                        <RotateCw size={13} />
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
            style={{
                background: 'linear-gradient(135deg, #eef2ff 0%, #e8e0ff 100%)',
                padding: 20,
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
        >
            {/* Icon */}
            <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
            }}>
                <Clock size={28} color="white" />
            </div>

            <h3 style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#312e81',
                marginBottom: 16,
                letterSpacing: '-0.01em',
            }}>
                Event Countdown
            </h3>

            {/* Event Name */}
            <input
                type="text"
                value={eventName}
                onChange={(e) => updateData(widget.id, { eventName: e.target.value })}
                placeholder="Event name..."
                style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '2px solid #e0e7ff',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1e293b',
                    outline: 'none',
                    background: 'white',
                    marginBottom: 10,
                    textAlign: 'center',
                    transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                onBlur={(e) => (e.target.style.borderColor = '#e0e7ff')}
            />

            {/* Date/Time Picker */}
            <input
                type="datetime-local"
                value={targetDate}
                onChange={(e) => updateData(widget.id, { targetDate: e.target.value })}
                style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '2px solid #e0e7ff',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#475569',
                    outline: 'none',
                    background: 'white',
                    marginBottom: 16,
                    textAlign: 'center',
                    transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                onBlur={(e) => (e.target.style.borderColor = '#e0e7ff')}
            />

            {/* Start Button */}
            <button
                onClick={handleStart}
                disabled={!eventName.trim() || !targetDate}
                className="active:scale-95"
                style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: 12,
                    border: 'none',
                    background: (!eventName.trim() || !targetDate)
                        ? '#cbd5e1'
                        : 'linear-gradient(135deg, #6366f1, #7c3aed)',
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: (!eventName.trim() || !targetDate) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                    boxShadow: (!eventName.trim() || !targetDate)
                        ? 'none'
                        : '0 6px 20px rgba(99, 102, 241, 0.35)',
                }}
            >
                <Play size={16} /> Start Countdown
            </button>
        </div>
    );
};

// ── Sub-components for the running bar ──

const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
    <div style={{ textAlign: 'center', minWidth: 54 }}>
        <div style={{
            fontSize: 32,
            fontWeight: 900,
            color: 'white',
            lineHeight: 1,
            fontFamily: "'Inter', system-ui, monospace",
            letterSpacing: '-0.03em',
            textShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}>
            {String(value).padStart(2, '0')}
        </div>
        <div style={{
            fontSize: 9,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.12em',
            marginTop: 4,
        }}>
            {label}
        </div>
    </div>
);

const Separator = () => (
    <div style={{
        fontSize: 24,
        fontWeight: 800,
        color: 'rgba(255,255,255,0.3)',
        lineHeight: 1,
        paddingBottom: 10,
        userSelect: 'none',
    }}>
        :
    </div>
);

export default CountdownWidget;
