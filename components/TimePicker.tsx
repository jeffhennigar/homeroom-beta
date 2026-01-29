import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { X, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

interface TimePickerProps {
    time: string;
    onChange: (time: string) => void;
    onClose: () => void;
    triggerRef?: React.RefObject<HTMLElement>;
}

const TimePicker: React.FC<TimePickerProps> = ({ time, onChange, onClose, triggerRef }) => {
    const [hours, setHours] = useState(9);
    const [minutes, setMinutes] = useState(0);
    const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        const [h, m] = time.split(':');
        const hNum = parseInt(h);
        setHours(hNum % 12 || 12);
        setMinutes(parseInt(m));
        setAmpm(hNum >= 12 ? 'PM' : 'AM');
    }, [time]);

    // Calculate position based on trigger element
    useLayoutEffect(() => {
        if (triggerRef?.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Position to the right of the trigger, but keep on screen
            let top = rect.top;
            let left = rect.right + 10;

            // Check if it goes off screen right
            if (left + 250 > window.innerWidth) {
                left = rect.left - 260; // Flip to left
            }
            // Check bottom
            if (top + 300 > window.innerHeight) {
                top = window.innerHeight - 310;
            }

            setPosition({ top, left });
        } else {
            // Fallback center if no trigger
            setPosition({
                top: window.innerHeight / 2 - 150,
                left: window.innerWidth / 2 - 125
            });
        }
    }, [triggerRef]);

    const handleSave = () => {
        let h = hours;
        if (ampm === 'PM' && h !== 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        const timeStr = `${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        onChange(timeStr);
        onClose();
    };

    if (!position) return null;

    if (!position) return null;

    // Use Portal to render outside the overflow:hidden container
    return createPortal(
        <>
            <div className="fixed inset-0 z-[10000] bg-transparent" onClick={onClose} />
            <div
                className="fixed z-[10001] bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-64 animate-in zoom-in-95 duration-200"
                style={{ top: position.top, left: position.left }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700">Set Time</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                </div>

                <div className="flex gap-2 justify-center mb-6">
                    <div className="flex flex-col items-center">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Hour</label>
                        <div className="h-32 overflow-y-auto custom-scrollbar w-16 bg-gray-50 rounded-lg text-center snap-y snap-mandatory">
                            {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(h => (
                                <button
                                    key={h}
                                    onClick={() => setHours(h)}
                                    className={`w-full py-2 snap-center font-bold ${hours === h ? 'text-blue-600 bg-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Minute</label>
                        <div className="h-32 overflow-y-auto custom-scrollbar w-16 bg-gray-50 rounded-lg text-center snap-y snap-mandatory">
                            {Array.from({ length: 12 }, (_, i) => i * 5).map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMinutes(m)}
                                    className={`w-full py-2 snap-center font-bold ${minutes === m ? 'text-blue-600 bg-blue-100' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {m.toString().padStart(2, '0')}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2">
                        <button onClick={() => setAmpm('AM')} className={`px-2 py-1 rounded-lg text-xs font-bold ${ampm === 'AM' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>AM</button>
                        <button onClick={() => setAmpm('PM')} className={`px-2 py-1 rounded-lg text-xs font-bold ${ampm === 'PM' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>PM</button>
                    </div>
                </div>

                <button onClick={handleSave} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center gap-2">
                    <Check size={16} /> Done
                </button>
            </div>
        </>,
        document.body
    );
};

export default TimePicker;
