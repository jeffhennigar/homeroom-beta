import React, { useEffect, useState } from 'react';
import { ClockStyle } from '../types';

interface ClockDisplayProps {
    style: ClockStyle;
    textColor: string;
    onSettingsClick: () => void;
}

const ClockDisplay: React.FC<ClockDisplayProps> = ({ style, textColor, onSettingsClick }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const displayHours = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const timeString = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const dateString = time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const getRotation = (val: number, max: number) => (val / max) * 360;

    const renderAnalog = () => (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative w-48 h-48 rounded-full border-4 border-white/50 bg-white/10 backdrop-blur-md shadow-lg flex items-center justify-center">
                {/* Markers */}
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="absolute w-1 h-3 bg-white/60" style={{
                        transform: `rotate(${i * 30}deg) translateY(-85px)`,
                        transformOrigin: '50% 100%'
                    }} />
                ))}

                {/* Dynamic Hands (Centered properly) */}
                {/* Hour Hand */}
                <div className="absolute top-1/2 left-1/2 -mt-[56px] -ml-[3px] w-1.5 h-14 bg-white rounded-full origin-bottom"
                    style={{ transform: `rotate(${getRotation(hours % 12 + minutes / 60, 12)}deg) translateY(28px)` }} />

                {/* Minute Hand */}
                <div className="absolute top-1/2 left-1/2 -mt-[80px] -ml-[2px] w-1 h-20 bg-white/80 rounded-full origin-bottom"
                    style={{ transform: `rotate(${getRotation(minutes, 60)}deg) translateY(40px)` }} />

                {/* Second Hand */}
                <div className="absolute top-1/2 left-1/2 -mt-[80px] -ml-[1px] w-0.5 h-20 bg-red-400 rounded-full origin-bottom"
                    style={{ transform: `rotate(${getRotation(seconds, 60)}deg) translateY(40px)` }} />

                {/* Center Dot */}
                <div className="absolute top-1/2 left-1/2 -mt-1.5 -ml-1.5 w-3 h-3 bg-white rounded-full z-10 shadow-sm" />
            </div>

            {/* Date below analog clock */}
            <div className={`text-lg font-medium opacity-90 whitespace-nowrap ${textColor} drop-shadow-md text-center`}>
                {dateString}
            </div>
        </div>
    );

    const renderBigHour = () => (
        <div className="flex flex-col items-center leading-none">
            <div className={`text-[10rem] font-black tracking-tighter ${textColor} opacity-90 drop-shadow-lg`} style={{ lineHeight: '0.8' }}>
                {displayHours}
            </div>
            <div className={`text-[6rem] font-bold tracking-tight ${textColor} opacity-80 drop-shadow-md`}>
                {minutes.toString().padStart(2, '0')}
            </div>
            <div className={`text-xl font-medium mt-2 opacity-90 ${textColor} drop-shadow-md`}>
                {dateString}
            </div>
        </div>
    );

    const renderModern = () => (
        <div className="flex flex-col items-center gap-2">
            <div className={`text-8xl font-thin tracking-widest ${textColor} drop-shadow-sm`}>
                {timeString}
            </div>
            <div className={`text-xl font-light tracking-wide uppercase opacity-80 ${textColor}`}>
                {dateString}
            </div>
        </div>
    );

    const renderRetro = () => (
        <div className="flex flex-col items-center gap-1 font-mono">
            <div className={`text-7xl font-bold tracking-wider ${textColor}`} style={{ textShadow: '0 0 10px currentColor, 0 0 20px currentColor' }}>
                {displayHours}:{minutes.toString().padStart(2, '0')}
                <span className="text-4xl ml-2 opacity-80">{ampm}</span>
            </div>
            <div className={`text-xl font-bold mt-2 opacity-80 ${textColor}`} style={{ textShadow: '0 0 5px currentColor' }}>
                {dateString.toUpperCase()}
            </div>
        </div>
    );

    const renderStandard = () => (
        <>
            <div className="flex items-center gap-1.5 mb-1 opacity-80">
                <div className={`px-1.5 py-0.5 rounded text-[10px] font-black tracking-tighter shadow-md ${textColor === 'text-white' ? 'bg-white text-slate-900' : 'bg-slate-800 text-white'}`}>
                    HR
                </div>
                <div className="text-xs font-bold uppercase tracking-widest">HomeRoom</div>
            </div>
            <div className={`text-8xl font-bold tracking-tight ${textColor === 'text-white' ? 'drop-shadow-lg' : 'drop-shadow-sm'}`}>
                {timeString}
            </div>
            <div className={`text-3xl font-medium mt-2 opacity-90 ${textColor === 'text-white' ? 'drop-shadow-md' : ''}`}>
                {dateString}
            </div>
        </>
    );

    return (
        <div onClick={onSettingsClick} className="cursor-pointer hover:opacity-80 transition-opacity flex flex-col items-start gap-1">
            {style === 'analog' && renderAnalog()}
            {style === 'bighour' && renderBigHour()}
            {style === 'modern' && renderModern()}
            {style === 'retro' && renderRetro()}
            {style === 'standard' && renderStandard()}
        </div>
    );
};

export default ClockDisplay;
