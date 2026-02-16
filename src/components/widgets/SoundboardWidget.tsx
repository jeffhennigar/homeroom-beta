import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Volume2,
    VolumeX,
    Pause,
    Play,
    Square,
    RefreshCw,
    Youtube,
    Music,
    ExternalLink,
    Settings,
    X,
    Maximize2
} from 'lucide-react';

interface Sound {
    id: string;
    file: string;
    label: string;
    emoji: string;
    cat: 'bg' | 'sfx';
}

interface Player {
    buffer: AudioBuffer | null;
    source: AudioBufferSourceNode | null;
    gainNode: GainNode | null;
    looping: boolean;
    isPlaying: boolean;
    offset: number;
    startTime: number;
    loading: boolean;
    fallback: boolean;
    audioElement: HTMLAudioElement | null;
    volume: number;
}

const SOUNDS: Sound[] = [
    { id: 'light-piano', file: '/sounds/Light Piano.mp3', label: 'Light Piano', emoji: '🎹', cat: 'bg' },
    { id: 'light-rain', file: '/sounds/Light Rain.mp3', label: 'Light Rain', emoji: '🌧️', cat: 'bg' },
    { id: 'ocean-waves', file: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg', label: 'Ocean Waves', emoji: '🌊', cat: 'bg' },
    { id: 'rain-storm', file: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg', label: 'Rain Storm', emoji: '⛈️', cat: 'bg' },
    { id: 'spa1', file: '/sounds/Spa1.mp3', label: 'Spa Vibes 1', emoji: '🧖', cat: 'bg' },
    { id: 'spa2', file: '/sounds/Spa2.mp3', label: 'Spa Vibes 2', emoji: '💆', cat: 'bg' },
    { id: 'laugh1', file: '/sounds/Single Child Laughing.wav', label: 'Kid Laugh', emoji: '😂', cat: 'sfx' },
    { id: 'laugh2', file: '/sounds/Single Child Laughing 2.mp3', label: 'Kid Laugh 2', emoji: '🤣', cat: 'sfx' },
    { id: 'applause', file: '/sounds/Applause.wav', label: 'Applause', emoji: '👏', cat: 'sfx' },
    { id: 'yeah', file: '/sounds/Yeah!.wav', label: 'Yeah!', emoji: '🙌', cat: 'sfx' },
];

const SoundboardWidget = ({ widget, updateData }: { widget: any, updateData: (data: any) => void }) => {
    const [players, setPlayers] = useState<Record<string, Player>>(() => {
        const initial: Record<string, Player> = {};
        SOUNDS.forEach(s => {
            initial[s.id] = {
                buffer: null,
                source: null,
                gainNode: null,
                looping: s.cat === 'bg',
                isPlaying: false,
                offset: 0,
                startTime: 0,
                loading: false,
                fallback: false,
                audioElement: null,
                volume: 0.8
            };
        });
        return initial;
    });

    const [masterVolume, setMasterVolume] = useState(0.8);
    const [embedUrl, setEmbedUrl] = useState(widget.data?.embedUrl || "");
    const [showEmbed, setShowEmbed] = useState(!!widget.data?.embedUrl);
    const [isEmbedMinimized, setIsEmbedMinimized] = useState(widget.data?.isEmbedMinimized || false);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafIdRef = useRef<number | null>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            // Stop visualizer loop
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            // Cleanup audio tailored for this use case: stop all on unmount
            stopAll();
            if (audioCtxRef.current) audioCtxRef.current.close();
        };
    }, []);

    // Initialize Audio Context (Lazy interaction)
    const initAudio = useCallback(async () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContext();
            audioCtxRef.current = ctx;

            const masterGain = ctx.createGain();
            masterGain.gain.value = masterVolume;
            masterGain.connect(ctx.destination);
            masterGainRef.current = masterGain;

            const analyser = ctx.createAnalyser();
            analyser.fftSize = 128; // Smaller FFT for snappier bars
            analyser.smoothingTimeConstant = 0.5;
            analyserRef.current = analyser;

            masterGain.connect(analyser);

            startVisualization();
        }

        if (audioCtxRef.current?.state === 'suspended') {
            await audioCtxRef.current.resume();
        }
    }, [masterVolume]);

    const startVisualization = () => {
        if (!canvasRef.current || !analyserRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const analyser = analyserRef.current;
        const dataArr = new Uint8Array(analyser.frequencyBinCount);

        const draw = () => {
            rafIdRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArr);

            const canvas = canvasRef.current;
            if (!canvas) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const isAnyPlaying = Object.values(players).some((p: Player) => p.isPlaying);
            const barCount = 32; // Fewer bars for cleaner look
            const barW = (canvas.width / barCount) * 0.8;
            const gap = (canvas.width / barCount) * 0.2;

            for (let i = 0; i < barCount; i++) {
                let val = dataArr[i] / 255;
                if (!isAnyPlaying) val = Math.max(0.05, val * 0.1); // Keep a tiny hum visible

                const barH = Math.max(2, val * canvas.height);
                const x = i * (barW + gap);
                const y = canvas.height - barH;

                ctx.fillStyle = isAnyPlaying ? `hsl(${220 + (i / barCount) * 60}, 90%, 60%)` : '#cbd5e1';
                ctx.fillRect(x, y, barW, barH);
            }
        };
        draw();
    };

    const fetchAndDecode = async (id: string, url: string) => {
        setPlayers(prev => ({ ...prev, [id]: { ...prev[id], loading: true } }));

        try {
            // Updated fetch with CORS mode
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
            const arrayBuffer = await response.arrayBuffer();

            if (!audioCtxRef.current) throw new Error("No AudioContext");
            const buffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);

            if (mountedRef.current) {
                setPlayers(prev => ({
                    ...prev,
                    [id]: { ...prev[id], buffer, loading: false, fallback: false }
                }));
                // Auto-play after load
                playSound(id, buffer);
            }
        } catch (err) {
            console.warn(`AudioBuffer failed for ${id} (${url}), falling back to HTMLAudio:`, err);
            if (mountedRef.current) {
                const audio = new Audio(url);
                audio.crossOrigin = "anonymous"; // Important for CORS
                audio.volume = masterVolume;

                setPlayers(prev => ({
                    ...prev,
                    [id]: { ...prev[id], audioElement: audio, fallback: true, loading: false }
                }));
                // Auto-play fallback
                audio.play().catch(e => console.error("Fallback play failed", e));
                setPlayers(prev => ({ ...prev, [id]: { ...prev[id], isPlaying: true } }));

                audio.onended = () => {
                    if (players[id].looping) {
                        audio.currentTime = 0;
                        audio.play();
                    } else {
                        setPlayers(prev => ({ ...prev, [id]: { ...prev[id], isPlaying: false } }));
                    }
                };
            }
        }
    };

    const playSound = async (id: string, buffer: AudioBuffer) => {
        if (!audioCtxRef.current || !masterGainRef.current) return;

        // Stop existing source if any
        if (players[id].source) {
            try { players[id].source.stop(); } catch (e) { }
        }

        const source = audioCtxRef.current.createBufferSource();
        source.buffer = buffer;
        source.loop = players[id].looping;

        const gainNode = audioCtxRef.current.createGain();
        gainNode.gain.value = players[id].volume;

        source.connect(gainNode);
        gainNode.connect(masterGainRef.current);

        source.start(0);

        setPlayers(prev => ({
            ...prev,
            [id]: { ...prev[id], source, gainNode, isPlaying: true }
        }));

        source.onended = () => {
            if (!players[id].looping) {
                setPlayers(prev => ({ ...prev, [id]: { ...prev[id], isPlaying: false } }));
            }
        };
    };

    const togglePlay = async (id: string) => {
        await initAudio();
        const p = players[id];
        const s = SOUNDS.find(x => x.id === id);
        if (!s) return;

        if (p.isPlaying) {
            // Stop
            if (p.fallback && p.audioElement) {
                p.audioElement.pause();
                p.audioElement.currentTime = 0;
            } else if (p.source) {
                try { p.source.stop(); } catch (e) { }
            }
            setPlayers(prev => ({ ...prev, [id]: { ...prev[id], isPlaying: false } }));
        } else {
            // Play
            if (!p.buffer && !p.fallback) {
                if (!p.loading) fetchAndDecode(id, s.file);
            } else if (p.fallback && p.audioElement) {
                p.audioElement.volume = masterVolume;
                p.audioElement.loop = p.looping;
                p.audioElement.play().catch(e => console.error(e));
                setPlayers(prev => ({ ...prev, [id]: { ...prev[id], isPlaying: true } }));
            } else if (p.buffer) {
                playSound(id, p.buffer);
            }
        }
    };

    const stopAll = () => {
        Object.keys(players).forEach(id => {
            const p = players[id];
            if (p.isPlaying) {
                if (p.fallback && p.audioElement) {
                    p.audioElement.pause();
                    p.audioElement.currentTime = 0;
                } else if (p.source) {
                    try { p.source.stop(); } catch (e) { }
                }
            }
        });
        setPlayers(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(k => next[k].isPlaying = false);
            return next;
        });
    };

    const toggleLoop = (id: string) => {
        setPlayers(prev => {
            const next = { ...prev };
            const wasLooping = next[id].looping;
            next[id].looping = !wasLooping;

            // Update active source
            if (next[id].source) next[id].source.loop = !wasLooping;
            if (next[id].audioElement) next[id].audioElement.loop = !wasLooping;

            return next;
        });
    };

    const updateMasterVolume = (val: number) => {
        setMasterVolume(val);
        if (masterGainRef.current) masterGainRef.current.gain.value = val;
        // Update fallbacks
        Object.values(players).forEach(p => {
            if (p.audioElement) p.audioElement.volume = val;
        });
    };

    // --- RENDER ---
    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
            {/* Visualizer Header */}
            <div className="h-24 bg-slate-900 relative shrink-0">
                <canvas ref={canvasRef} width={600} height={100} className="w-full h-full opacity-60" />
                <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white"><Music size={16} /></div>
                        <span className="text-white font-bold text-sm">Soundboard</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                        <Volume2 size={16} className="text-slate-400" />
                        <input
                            type="range" min="0" max="1" step="0.05"
                            value={masterVolume}
                            onChange={(e) => updateMasterVolume(parseFloat(e.target.value))}
                            className="w-20 accent-indigo-500 h-1.5"
                        />
                        <button onClick={stopAll} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-md transition-colors" title="Stop All">
                            <Square size={16} fill="currentColor" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sound Grid - Compact 4-col */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-4 gap-3">
                    {SOUNDS.map(sound => {
                        const p = players[sound.id];
                        const isActive = p.isPlaying;
                        const isLooping = p.looping;

                        return (
                            <div key={sound.id} className={`relative group flex flex-col items-center justify-between p-2 rounded-xl border transition-all ${isActive ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                {/* Play Button (Main Interaction) */}
                                <button
                                    onClick={() => togglePlay(sound.id)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-1 transition-transform active:scale-95 ${isActive ? 'bg-indigo-500 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-700 group-hover:bg-white border border-transparent group-hover:border-slate-200'}`}
                                >
                                    {p.loading ? <RefreshCw size={20} className="animate-spin text-indigo-500" /> : (isActive ? sound.emoji : sound.emoji)}
                                </button>

                                {/* Controls Row (Loop) */}
                                <div className="flex items-center gap-1">
                                    {sound.cat === 'bg' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleLoop(sound.id); }}
                                            className={`p-1 rounded-md text-[10px] uppercase font-bold tracking-wider transition-colors ${isLooping ? 'bg-indigo-100 text-indigo-600' : 'text-slate-300 hover:text-slate-500'}`}
                                            title="Toggle Loop"
                                        >
                                            {isLooping ? 'Loop' : '1-Shot'}
                                        </button>
                                    )}
                                </div>

                                {/* Status Indicator */}
                                {isActive && <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Embed Section (Compact) */}
            <div className="border-t bg-white px-4 py-2 shrink-0">
                {!showEmbed ? (
                    <button onClick={() => setShowEmbed(true)} className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg dashed border-2 border-slate-200 border-dashed">
                        <Youtube size={14} /> Add YouTube / Spotify
                    </button>
                ) : (
                    <div className="flex flex-col gap-2">
                        {isEmbedMinimized ? (
                            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                                <span className="text-xs font-bold text-slate-600 truncate flex-1 min-w-0">{embedUrl || "No Media"}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => setIsEmbedMinimized(false)} className="p-1 hover:bg-slate-200 rounded"><Maximize2 size={14} /></button>
                                    <button onClick={() => { setShowEmbed(false); setEmbedUrl(""); updateData({ embedUrl: "" }); }} className="p-1 hover:bg-red-100 text-red-500 rounded"><X size={14} /></button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Paste YouTube or Spotify URL"
                                        className="flex-1 text-xs border rounded px-2 py-1 outline-none focus:border-indigo-500"
                                        value={embedUrl}
                                        onChange={(e) => { setEmbedUrl(e.target.value); updateData({ embedUrl: e.target.value }); }}
                                    />
                                    <button onClick={() => setIsEmbedMinimized(true)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><Settings size={14} /></button>
                                    <button onClick={() => { setShowEmbed(false); setEmbedUrl(""); updateData({ embedUrl: "" }); }} className="p-1 hover:bg-red-50 text-red-500 rounded"><X size={14} /></button>
                                </div>
                                {embedUrl && (
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                        <iframe
                                            width="100%" height="100%"
                                            src={embedUrl.includes('spotify') ? embedUrl.replace('/track/', '/embed/track/') : embedUrl.replace('watch?v=', 'embed/')}
                                            frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SoundboardWidget;
