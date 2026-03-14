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
    Maximize2,
    Repeat
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

const SoundCard = ({ sound, player, onToggle }: { sound: Sound, player: Player, onToggle: () => void }) => {
    const isActive = player.isPlaying;

    return (
        <div className={`relative group flex flex-col items-center justify-between p-2 rounded-xl border transition-all ${isActive ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
            {/* Play Button */}
            <button
                onClick={onToggle}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-1 transition-transform active:scale-95 ${isActive ? 'bg-indigo-500 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-700 group-hover:bg-white border border-transparent group-hover:border-slate-200'}`}
            >
                {player.loading ? <RefreshCw size={20} className="animate-spin text-indigo-500" /> : sound.emoji}
            </button>

            <span className="text-[10px] font-bold text-center truncate w-full text-slate-500 group-hover:text-slate-700 transition-colors">{sound.label}</span>
        </div>
    );
};

const SoundboardWidget = ({ widget, updateData }: { widget: any, updateData: (data: any) => void }) => {
    const [players, setPlayers] = useState<Record<string, Player>>(() => {
        const initial: Record<string, Player> = {};
        SOUNDS.forEach(s => {
            initial[s.id] = {
                buffer: null,
                source: null,
                gainNode: null,
                looping: false, // Default to false, controlled by global toggle for new plays
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
    const [isGlobalLoop, setIsGlobalLoop] = useState(false);
    const [recentStreams, setRecentStreams] = useState<string[]>(widget.data?.recentStreams || []);
    const [embedUrl, setEmbedUrl] = useState(widget.data?.embedUrl || "");
    const [showEmbed, setShowEmbed] = useState(!!widget.data?.embedUrl);
    const [isEmbedMinimized, setIsEmbedMinimized] = useState(widget.data?.isEmbedMinimized || false);

    const updateEmbed = (url: string) => {
        setEmbedUrl(url);
        if (url.trim()) {
            setRecentStreams(prev => {
                const filtered = prev.filter(x => x !== url);
                const next = [url, ...filtered].slice(0, 6);
                updateData({ ...widget.data, embedUrl: url, recentStreams: next });
                return next;
            });
        } else {
            updateData({ ...widget.data, embedUrl: "" });
        }
    };

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
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            stopAll();
            if (audioCtxRef.current) audioCtxRef.current.close();
        };
    }, []);

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
            analyser.fftSize = 128;
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
            const barCount = 32;
            const barW = (canvas.width / barCount) * 0.8;
            const gap = (canvas.width / barCount) * 0.2;

            for (let i = 0; i < barCount; i++) {
                let val = dataArr[i] / 255;
                if (!isAnyPlaying) val = Math.max(0.05, val * 0.1);

                const barH = Math.max(2, val * canvas.height);
                const x = i * (barW + gap);
                const y = canvas.height - barH;

                // Visualization Color - using theme colors or generic
                ctx.fillStyle = isAnyPlaying ? `hsl(${220 + (i / barCount) * 60}, 90%, 60%)` : '#cbd5e1';
                ctx.fillRect(x, y, barW, barH);
            }
        };
        draw();
    };

    const fetchAndDecode = async (id: string, url: string) => {
        setPlayers(prev => ({ ...prev, [id]: { ...prev[id], loading: true } }));

        try {
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
                playSound(id, buffer);
            }
        } catch (err) {
            console.warn(`AudioBuffer failed for ${id} (${url}), falling back to HTMLAudio:`, err);
            if (mountedRef.current) {
                const audio = new Audio(url);
                audio.crossOrigin = "anonymous";
                audio.volume = masterVolume;

                setPlayers(prev => ({
                    ...prev,
                    [id]: { ...prev[id], audioElement: audio, fallback: true, loading: false }
                }));

                audio.play().catch(e => console.error("Fallback play failed", e));
                setPlayers(prev => ({ ...prev, [id]: { ...prev[id], isPlaying: true, looping: isGlobalLoop } })); // Set initial loop state

                audio.onended = () => {
                    if (!audio.loop) {
                        setPlayers(prev => ({ ...prev, [id]: { ...prev[id], isPlaying: false } }));
                    }
                };
            }
        }
    };

    const playSound = async (id: string, buffer: AudioBuffer) => {
        if (!audioCtxRef.current || !masterGainRef.current) return;

        if (players[id].source) {
            try { players[id].source.stop(); } catch (e) { }
        }

        const source = audioCtxRef.current.createBufferSource();
        source.buffer = buffer;
        source.loop = isGlobalLoop; // Use global setting

        const gainNode = audioCtxRef.current.createGain();
        gainNode.gain.value = players[id].volume;

        source.connect(gainNode);
        gainNode.connect(masterGainRef.current);

        source.start(0);

        setPlayers(prev => ({
            ...prev,
            [id]: { ...prev[id], source, gainNode, isPlaying: true, looping: isGlobalLoop }
        }));

        source.onended = () => {
            if (!source.loop) {
                setPlayers(prev => {
                    // Only update if this source is still the active one
                    if (prev[id].source === source) return { ...prev, [id]: { ...prev[id], isPlaying: false } };
                    return prev;
                });
            }
        };
    };

    const togglePlay = async (id: string) => {
        await initAudio();
        const p = players[id];
        const s = SOUNDS.find(x => x.id === id);
        if (!s) return;

        if (p.isPlaying) {
            if (p.fallback && p.audioElement) {
                p.audioElement.pause();
                p.audioElement.currentTime = 0;
            } else if (p.source) {
                try { p.source.stop(); } catch (e) { }
            }
            setPlayers(prev => ({ ...prev, [id]: { ...prev[id], isPlaying: false } }));
        } else {
            if (!p.buffer && !p.fallback) {
                if (!p.loading) fetchAndDecode(id, s.file);
            } else if (p.fallback && p.audioElement) {
                p.audioElement.volume = masterVolume;
                p.audioElement.loop = isGlobalLoop;
                p.audioElement.play().catch(e => console.error(e));
                setPlayers(prev => ({ ...prev, [id]: { ...prev[id], isPlaying: true, looping: isGlobalLoop } }));
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

    const toggleGlobalLoop = () => {
        const nextLoop = !isGlobalLoop;
        setIsGlobalLoop(nextLoop);
        setPlayers(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(id => {
                const p = next[id];
                if (p.isPlaying) {
                    p.looping = nextLoop;
                    if (p.source) p.source.loop = nextLoop;
                    if (p.audioElement) p.audioElement.loop = nextLoop;
                }
            });
            return next;
        });
    };

    const updateMasterVolume = (val: number) => {
        setMasterVolume(val);
        if (masterGainRef.current) masterGainRef.current.gain.value = val;
        Object.values(players).forEach((p: Player) => {
            if (p.audioElement) p.audioElement.volume = val;
        });
    };

    // --- Helper for YouTube Embeds ---
    const getEmbedUrl = (url: string) => {
        if (!url) return "";
        if (url.includes('spotify')) {
            return url.replace('/track/', '/embed/track/');
        }
        // Handle YouTube variants
        let videoId = "";
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('watch?v=')) {
            videoId = url.split('watch?v=')[1]?.split('&')[0];
        } else if (url.includes('/embed/')) {
            videoId = url.split('/embed/')[1]?.split('?')[0];
        }

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return url;
    };

    return (
        <div className="flex flex-col h-full bg-white relative overflow-hidden rounded-xl border border-slate-200 custom-scrollbar shadow-sm">
            {/* Visualizer Header */}
            <div className="h-24 bg-slate-50 relative shrink-0 border-b border-slate-100">
                <canvas ref={canvasRef} width={600} height={100} className="w-full h-full opacity-30" />
                <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-md"><Music size={16} /></div>
                        <span className="text-slate-700 font-bold text-sm">Soundboard</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
                        <button
                            onClick={toggleGlobalLoop}
                            className={`p-1.5 rounded-md transition-all ${isGlobalLoop ? 'bg-indigo-100 text-indigo-600 shadow-inner' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                            title="Loop All"
                        >
                            <Repeat size={16} />
                        </button>
                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        <Volume2 size={16} className="text-slate-400" />
                        <input
                            type="range" min="0" max="1" step="0.05"
                            value={masterVolume}
                            onChange={(e) => updateMasterVolume(parseFloat(e.target.value))}
                            className="w-20 accent-indigo-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        <button onClick={stopAll} className="p-1.5 hover:bg-red-50 text-red-500 rounded-md transition-colors" title="Stop All">
                            <Square size={16} fill="currentColor" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sound Grid - Compact 4-col */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50">
                <div className="grid grid-cols-4 gap-3">
                    {SOUNDS?.map(sound => (
                        <div key={sound.id}>
                            <SoundCard
                                sound={sound}
                                player={players[sound.id]}
                                onToggle={() => togglePlay(sound.id)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Embed Section (Compact) */}
            <div className="border-t border-slate-200 bg-white px-4 py-2 shrink-0">
                {!showEmbed ? (
                    <button onClick={() => setShowEmbed(true)} className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg dashed border-2 border-slate-200 border-dashed transition-colors">
                        <Youtube size={14} /> Add YouTube / Spotify
                    </button>
                ) : (
                    <div className="flex flex-col gap-2">
                        {isEmbedMinimized ? (
                            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                                <span className="text-xs font-bold text-slate-600 truncate flex-1 min-w-0">{embedUrl || "No Media"}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => setIsEmbedMinimized(false)} className="p-1 hover:bg-slate-200 rounded text-slate-500"><Maximize2 size={14} /></button>
                                    <button onClick={() => { setShowEmbed(false); setEmbedUrl(""); updateData({ embedUrl: "" }); }} className="p-1 hover:bg-red-50 text-red-500 rounded"><X size={14} /></button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Paste YouTube or Spotify URL"
                                        className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-indigo-500 text-slate-700"
                                        value={embedUrl}
                                        onChange={(e) => updateEmbed(e.target.value)}
                                    />
                                    <button onClick={() => setIsEmbedMinimized(true)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><Settings size={14} /></button>
                                    <button onClick={() => { setShowEmbed(false); setEmbedUrl(""); updateData({ ...widget.data, embedUrl: "" }); }} className="p-1 hover:bg-red-50 text-red-500 rounded"><X size={14} /></button>
                                </div>

                                {/* Recently Played Bar */}
                                {recentStreams.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-1 border-t border-slate-100 pt-2">
                                        {recentStreams?.map((url, i) => {
                                            const isSpotify = url.includes('spotify');
                                            const id = url.split(/[?v=/]/).filter(Boolean).pop()?.slice(0, 8);
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => setEmbedUrl(url)}
                                                    className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-all group max-w-[120px]"
                                                    title={url}
                                                >
                                                    {isSpotify ? (
                                                        <Music size={12} className="text-emerald-500" />
                                                    ) : (
                                                        <Youtube size={12} className="text-red-500" />
                                                    )}
                                                    <span className="text-[10px] font-bold text-slate-500 truncate group-hover:text-indigo-600">
                                                        {isSpotify ? 'Spotify' : 'YouTube'} • {id}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {embedUrl && (
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                        <iframe
                                            width="100%" height="100%"
                                            src={getEmbedUrl(embedUrl)}
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
