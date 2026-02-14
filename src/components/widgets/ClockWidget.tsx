import React, { useEffect, useState } from 'react';
import { ClockStyle, WidgetProps } from '../../types';

interface ClockWidgetProps extends WidgetProps {
    extraProps?: {
        clockStyle?: ClockStyle;
        showDate?: boolean;
        isGlassy?: 'clear' | 'glass' | 'solid';
        textColor?: string;
    };
}

const FlipUnit: React.FC<{ value: string | number; label: string }> = ({ value, label }) => {
    const [current, setCurrent] = useState(value);
    const [next, setNext] = useState(value);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (value !== next) {
            setNext(value);
            setIsAnimating(true);
            const timer = setTimeout(() => {
                setCurrent(value);
                setIsAnimating(false);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [value, next]);

    const renderHalf = (val: string | number, part: 'top' | 'bottom') => (
        <div className={`absolute inset-x-0 ${part === 'top' ? 'top-0 h-1/2 rounded-t-xl' : 'bottom-0 h-1/2 rounded-b-xl'} overflow-hidden bg-[#222]`}>
            <div className={`absolute inset-0 ${part === 'top' ? 'bg-gradient-to-b from-[#333] to-[#222]' : 'bg-gradient-to-b from-[#222] to-[#111]'}`} />
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <span className={`font-mono font-bold text-white tracking-tighter tabular-nums leading-none`}
                    style={{ fontSize: '12rem', transform: part === 'top' ? 'translateY(50%)' : 'translateY(-50%)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{val}</span>
            </div>
            {part === 'top' && <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />}
            {part === 'bottom' && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />}
            <div className={`absolute inset-0 border-[0.5px] border-white/10 ${part === 'top' ? 'rounded-t-xl border-b-0' : 'rounded-b-xl border-t-0'}`} />
        </div>
    );

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative w-40 h-56 bg-[#111] rounded-xl shadow-2xl perspective-1000 group">
                <div className="absolute inset-0 flex flex-col rounded-xl overflow-hidden">
                    <div className="relative h-1/2 w-full">{renderHalf(next, 'top')}</div>
                    <div className="relative h-1/2 w-full">{renderHalf(next, 'bottom')}</div>
                </div>
                {!isAnimating && (
                    <div className="absolute inset-0 flex flex-col rounded-xl overflow-hidden z-10">
                        <div className="relative h-1/2 w-full">{renderHalf(current, 'top')}</div>
                        <div className="relative h-1/2 w-full">{renderHalf(current, 'bottom')}</div>
                    </div>
                )}
                {isAnimating && (
                    <div className="absolute inset-x-0 top-0 h-1/2 z-20 origin-bottom flip-animate" style={{ transformStyle: 'preserve-3d' }}>
                        {renderHalf(current, 'top')}
                        <div className="absolute inset-0 bg-black/50 animate-in fade-in duration-300 transform-gpu" />
                    </div>
                )}
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-black z-30 shadow-sm" />
                <div className="absolute inset-0 rounded-xl ring-1 ring-white/5 pointer-events-none z-40" />
            </div>
            <span className="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase">{label}</span>
        </div>
    );
};

const ClockWidget: React.FC<ClockWidgetProps> = ({ widget, updateData, extraProps }) => {
    const { clockStyle: globalClockStyle, isGlassy, showDate: globalShowDate, textColor } = extraProps || {};
    const { style: widgetStyle, showDate: widgetShowDate } = widget.data || {};

    // Style and Date visibility can come from widget data or global settings
    const clockStyle = widgetStyle || globalClockStyle || 'standard';
    const showDate = widgetShowDate !== undefined ? widgetShowDate : (globalShowDate || false);

    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const displayHours = hours % 12 || 12;
    const timeString = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const dateString = time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const renderAnalog = () => (
        <div className="flex flex-col items-center justify-center gap-[2cqmin] w-full h-full">
            <div className={`relative rounded-full border-[0.5cqmin] backdrop-blur-md shadow-lg flex items-center justify-center ${isGlassy === 'clear' ? 'bg-transparent border-transparent shadow-none' : (textColor === 'text-white' ? 'border-white/50 bg-white/10' : 'border-slate-800/20 bg-white/60')}`}
                style={{ width: 'min(60cqw, 60cqh)', height: 'min(60cqw, 60cqh)' }}>
                {[...Array(12)].map((_, i) => (
                    <div key={i} className={`absolute w-[1cqmin] h-[3cqmin] ${textColor === 'text-white' ? 'bg-white/60' : 'bg-slate-800/60'}`} style={{ transform: `rotate(${i * 30}deg) translateY(-25cqmin)` }} />
                ))}
                <div className={`absolute w-[1.5cqmin] h-[15cqmin] rounded-full origin-bottom left-1/2 bottom-1/2 -ml-[0.75cqmin] ${textColor === 'text-white' ? 'bg-white' : 'bg-slate-800'}`} style={{ transform: `rotate(${hours % 12 * 30 + minutes / 2}deg)` }} />
                <div className={`absolute w-[1cqmin] h-[20cqmin] rounded-full origin-bottom left-1/2 bottom-1/2 -ml-[0.5cqmin] ${textColor === 'text-white' ? 'bg-white/80' : 'bg-slate-800/80'}`} style={{ transform: `rotate(${minutes * 6}deg)` }} />
                <div className="absolute w-[0.5cqmin] h-[22cqmin] bg-red-400 rounded-full origin-bottom left-1/2 bottom-1/2 -ml-[0.25cqmin]" style={{ transform: `rotate(${seconds * 6}deg)` }} />
                <div className={`absolute w-[3cqmin] h-[3cqmin] rounded-full z-10 shadow-sm ${textColor === 'text-white' ? 'bg-white' : 'bg-slate-800'}`} />
            </div>
            {showDate && <div className={`font-medium opacity-90 whitespace-nowrap ${textColor} drop-shadow-md text-center`} style={{ fontSize: 'min(5cqw, 10cqh)' }}>{dateString}</div>}
        </div>
    );

    const renderBigHour = () => (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="flex items-center justify-center gap-[2cqw]">
                <div className={`font-black tracking-tighter ${textColor} opacity-90 drop-shadow-lg leading-none`} style={{ fontSize: 'min(35cqw, 70cqh)' }}>{displayHours}</div>
                <div className="flex flex-col items-start justify-center gap-0">
                    <div className={`font-bold tracking-tight ${textColor} opacity-80 drop-shadow-md leading-none`} style={{ fontSize: 'min(15cqw, 30cqh)' }}>{minutes.toString().padStart(2, '0')}</div>
                    <div className={`font-medium opacity-70 ${textColor} drop-shadow-md leading-none`} style={{ fontSize: 'min(8cqw, 16cqh)' }}>{seconds.toString().padStart(2, '0')}</div>
                </div>
            </div>
            {showDate && <div className={`font-medium uppercase tracking-widest opacity-80 mt-[1cqh] ${textColor}`} style={{ fontSize: 'min(4cqw, 8cqh)' }}>{dateString}</div>}
        </div>
    );

    const renderModern = () => (
        <div className="flex flex-col items-center gap-0 w-full h-full justify-center">
            <div className={`font-thin tracking-widest ${textColor} drop-shadow-sm`} style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'min(20cqw, 45cqh)' }}>{timeString.split(' ')[0]}</div>
            {showDate && <div className={`font-light tracking-wide uppercase opacity-80 ${textColor}`} style={{ fontSize: 'min(4cqw, 10cqh)' }}>{dateString}</div>}
        </div>
    );

    const renderStandard = () => (
        <div className="flex flex-col items-start gap-0 w-full h-full justify-center px-[5cqw]">
            <div className={`font-bold tracking-tight ${textColor} drop-shadow-md`} style={{ fontVariantNumeric: 'tabular-nums', lineHeight: 0.9, fontSize: 'min(22cqw, 55cqh)' }}>{timeString}</div>
            {showDate && <div className={`font-medium tracking-wide uppercase opacity-90 mt-[2cqh] ${textColor}`} style={{ fontSize: 'min(5cqw, 12cqh)' }}>{dateString}</div>}
        </div>
    );

    const renderRetro = () => {
        const glowColor = 'rgba(56, 255, 56, 0.6)';
        const digitColor = 'text-[#38ff38]';
        const isTransparent = isGlassy === 'clear';
        return (
            <div className={`flex flex-col items-center justify-center p-4 relative overflow-hidden group/clock w-full h-full transition-all ${isTransparent ? 'bg-transparent border-0' : (isGlassy === 'glass' ? 'bg-black/40 backdrop-blur-md rounded-2xl' : 'bg-[#0a0a0a] shadow-[inset_0_0_20px_rgba(0,0,0,1)] border-[6px] border-[#1a1a1a] rounded-2xl')}`}
                style={{ containerType: 'size' }}>
                {!isTransparent && <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-sm z-20" />}
                <div className={`absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,6px_100%] pointer-events-none ${isTransparent ? 'opacity-40' : 'opacity-20'}`} />
                <div className={`relative z-10 flex items-center justify-center gap-2 font-['VT323'] leading-none ${digitColor}`}
                    style={{ textShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor}`, fontSize: 'min(28cqw, 55cqh)' }}>
                    <div className="tracking-widest tabular-nums whitespace-nowrap">{timeString}</div>
                </div>
            </div>
        );
    };

    const renderModernAnalog = () => {
        const markerColor = textColor === 'text-white' ? 'bg-white/40' : 'bg-slate-400/20';
        const accentColor = textColor === 'text-white' ? '#ffffff' : '#1e293b';

        return (
            <div className="flex flex-col items-center justify-center w-full h-full p-[2cqw] gap-[5cqh]">
                <div className={`relative flex items-center justify-center transition-all duration-500 ${isGlassy === 'clear' ? (textColor === 'text-white' ? 'bg-white/10 border border-white/20' : 'bg-slate-800/5 border border-slate-800/10') : (textColor === 'text-white' ? 'bg-white/20 backdrop-blur-xl border border-white/20 shadow-2xl' : 'bg-white/95 border-slate-100 shadow-[0_15px_35px_rgba(0,0,0,0.1)]')}`}
                    style={{
                        width: 'min(75cqw, 75cqh)',
                        height: 'min(75cqw, 75cqh)',
                        borderRadius: '24%'
                    }}>

                    {[...Array(60)].map((_, i) => {
                        const isHour = i % 5 === 0;
                        const isQuarter = i % 15 === 0;
                        return (
                            <div key={i}
                                className={`absolute left-1/2 top-1/2 ${isHour ? markerColor.replace('20', '80') : markerColor}`}
                                style={{
                                    width: isQuarter ? '1.2cqmin' : (isHour ? '0.8cqmin' : '0.4cqmin'),
                                    height: isQuarter ? '4.5cqmin' : (isHour ? '3.5cqmin' : '1.5cqmin'),
                                    borderRadius: '1px',
                                    transform: `translate(-50%, -50%) rotate(${i * 6}deg) translateY(-32cqmin)`
                                }}
                            />
                        );
                    })}

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute w-[2.2cqmin] h-[18cqmin] rounded-t-full origin-bottom"
                            style={{
                                transform: `translate(0, -18cqmin) rotate(${hours * 30 + minutes / 2}deg)`,
                                backgroundColor: accentColor,
                                top: '50%', left: '50%',
                                marginLeft: '-1.1cqmin'
                            }} />

                        <div className="absolute w-[1.4cqmin] h-[26cqmin] rounded-t-full origin-bottom opacity-70"
                            style={{
                                transform: `translate(0, -26cqmin) rotate(${minutes * 6}deg)`,
                                backgroundColor: accentColor,
                                top: '50%', left: '50%',
                                marginLeft: '-0.7cqmin'
                            }} />

                        <div className="absolute w-[0.6cqmin] h-[30cqmin] bg-red-500/90 rounded-t-full origin-bottom"
                            style={{
                                transform: `translate(0, -30cqmin) rotate(${seconds * 6}deg)`,
                                top: '50%', left: '50%',
                                marginLeft: '-0.3cqmin'
                            }} />

                        <div className="absolute w-[2.8cqmin] h-[2.8cqmin] bg-white border-[0.7cqmin] border-red-500 rounded-full z-20 shadow-sm" />
                    </div>
                </div>

                {showDate && (
                    <div className={`text-center font-bold uppercase tracking-[0.4em] ${textColor} pointer-events-none transition-opacity`}
                        style={{ fontSize: 'min(3cqw, 6cqh)', opacity: 0.4 }}>{dateString}</div>
                )}
            </div>
        );
    };

    return (
        <div className={`w-full h-full flex items-center justify-center relative group select-none cursor-default`}>
            <div className="w-full h-full flex flex-col items-center justify-center transition-all" style={{ containerType: 'size' }}>
                {clockStyle === 'analog' && renderAnalog()}
                {clockStyle === 'modern-analog' && renderModernAnalog()}
                {clockStyle === 'bighour' && renderBigHour()}
                {clockStyle === 'modern' && renderModern()}
                {clockStyle === 'retro' && renderRetro()}
                {(clockStyle === 'standard' || !clockStyle) && renderStandard()}
            </div>
        </div>
    );
};

export default ClockWidget;
