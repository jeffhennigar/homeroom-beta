import React, { useEffect, useRef } from 'react';
import { Settings, Mic, X } from 'lucide-react';

import { WidgetProps } from '../../types';

const TrafficLightWidget: React.FC<WidgetProps> = ({ widget, updateData }) => {
    const { activeLight, isListening = false, sensitivity = 50, threshold = 80, showSettings = false } = widget.data;
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const rafId = useRef(null);

    // Cleanup audio on unmount or when listening stops
    useEffect(() => {
        if (isListening) startAudio();
        else stopAudio();
        return () => stopAudio();
    }, [isListening]);

    // Re-run analysis if sensitivity/threshold changes while listening
    useEffect(() => {
        if (isListening && !rafId.current) analyze();
    }, [sensitivity, threshold]);

    const activeLightRef = useRef(activeLight);

    useEffect(() => {
        activeLightRef.current = activeLight;
    }, [activeLight]);

    const startAudio = async () => {
        if (audioContextRef.current) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const analyser = audioCtx.createAnalyser();
            analyserRef.current = analyser;
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);

            if (audioCtx.state === 'suspended') {
                await audioCtx.resume();
            }

            analyze();
        } catch (e) {
            console.error(e);
            alert('Mic Error: ' + e.message);
            updateData(widget.id, { isListening: false });
        }
    };

    const stopAudio = () => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        rafId.current = null;
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    };

    const analyze = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        let sum = 0;
        const data = dataArrayRef.current;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length;

        // Sensitivity (1-100) -> Multiplier (0.5 - 3.0)
        const multiplier = 0.5 + (sensitivity / 50);
        const volume = Math.min(avg * multiplier, 255);

        // Threshold (1-100) -> Cutoff (0-255)
        const limit = (threshold / 100) * 255;

        // Determine Light
        let newLight = 'green';
        if (volume > limit) {
            newLight = 'red';
        } else if (volume > limit * 0.7) {
            newLight = 'yellow';
        }

        if (newLight !== activeLightRef.current) {
            activeLightRef.current = newLight; // Prevent double trigger
            updateData(widget.id, { activeLight: newLight });
        }

        rafId.current = requestAnimationFrame(analyze);
    };

    if (showSettings) {
        return (
            <div className="h-full flex flex-col p-4 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden relative">
                <div className="flex justify-between items-center mb-4 text-gray-700">
                    <h3 className="font-bold text-sm uppercase tracking-wider">Settings</h3>
                    <button onClick={() => updateData(widget.id, { showSettings: false })} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
                </div>
                <div className="space-y-4 flex-1">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Sensitivity ({sensitivity}%)</label>
                        <input type="range" min="1" max="100" value={sensitivity} onChange={e => updateData(widget.id, { sensitivity: Number(e.target.value) })} className="w-full accent-blue-500 h-1 bg-gray-200 rounded-lg appearance-none" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Max Volume ({threshold}%)</label>
                        <input type="range" min="1" max="100" value={threshold} onChange={e => updateData(widget.id, { threshold: Number(e.target.value) })} className="w-full accent-red-500 h-1 bg-gray-200 rounded-lg appearance-none" />
                    </div>
                    <div className="text-[10px] text-gray-500 italic mt-2">
                        Higher sensitivity = detects quieter sounds.<br />
                        Lower Max Volume = Red light triggers sooner.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center justify-center gap-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-xl relative group">
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={() => updateData(widget.id, { showSettings: true })}
                    className="p-1.5 bg-gray-100 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                    title="Settings"
                >
                    <Settings size={14} />
                </button>
                <button
                    onClick={() => updateData(widget.id, { isListening: !isListening })}
                    className={`p-1.5 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                    title={isListening ? "Stop Auto-Listen" : "Start Auto-Listen"}
                >
                    {isListening ? <Mic size={14} /> : <Mic size={14} className="opacity-50" />}
                </button>
            </div>

            {['red', 'yellow', 'green'].map(color => (
                <div
                    key={color}
                    onClick={() => !isListening && updateData(widget.id, { activeLight: activeLight === color ? null : color })}
                    style={{ width: (widget.data.fontSize || 36) * 4, height: (widget.data.fontSize || 36) * 4 }}
                    className={`rounded-full transition-all duration-200 
            ${activeLight === color ? (
                            color === 'red' ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.8)] scale-105' :
                                color === 'yellow' ? 'bg-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.8)] scale-105' :
                                    'bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.8)] scale-105'
                        ) : 'bg-gray-100 scale-100'}
            ${!isListening ? 'cursor-pointer hover:opacity-80' : ''}
          `}
                />
            ))}
        </div>
    );
};

export default TrafficLightWidget;
