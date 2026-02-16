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
    Trash2
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
    { id: 'ocean-waves', file: '/sounds/Ocean Waves.wav', label: 'Ocean Waves', emoji: '🌊', cat: 'bg' },
    { id: 'rain-storm', file: '/sounds/Rain Storm.mp3', label: 'Rain Storm', emoji: '⛈️', cat: 'bg' },
    { id: 'spa1', file: '/sounds/Spa1.mp3', label: 'Spa Vibes 1', emoji: '🧖', cat: 'bg' },
    { id: 'spa2', file: '/sounds/Spa2.mp3', label: 'Spa Vibes 2', emoji: '💆', cat: 'bg' },
    { id: 'laugh1', file: '/sounds/Single Child Laughing.wav', label: 'Kid Laugh', emoji: '😂', cat: 'sfx' },
    { id: 'laugh2', file: '/sounds/Single Child Laughing 2.mp3', label: 'Kid Laugh 2', emoji: '🤣', cat: 'sfx' },
    { id: 'applause', file: '/sounds/Applause.wav', label: 'Applause', emoji: '👏', cat: 'sfx' },
    { id: 'yeah', file: '/sounds/Yeah!.wav', label: 'Yeah!', emoji: '🙌', cat: 'sfx' },
];

const SoundboardWidget = ({ widget, updateData }) => {
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
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        };
    }, []);

    // Initialize Audio Context
    const initAudio = useCallback(async () => {
        if (audioCtxRef.current) {
            if (audioCtxRef.current.state === 'suspended') {
                await audioCtxRef.current.resume();
            }
            return;
        }

        try {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            const ctx = new AudioContextClass();
            audioCtxRef.current = ctx;

            const masterGain = ctx.createGain();
            masterGain.gain.value = masterVolume;
            masterGainRef.current = masterGain;

            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            analyserRef.current = analyser;

            masterGain.connect(analyser);
            analyser.connect(ctx.destination);

            startVisualization();
        } catch (e) {
            console.error("Failed to init audio context", e);
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
            const barCount = 64;
            const barW = (canvas.width / barCount) * 0.8;
            const gap = (canvas.width / barCount) * 0.2;

            for (let i = 0; i < barCount; i++) {
                let val = dataArr[i] / 255;

                // Dim if nothing playing
                if (!isAnyPlaying) val *= 0.1;

                const barH = val * canvas.height * 0.9;
                const x = i * (barW + gap);
                const y = canvas.height - barH;

                ctx.fillStyle = `hsl(${260 + (i / barCount) * 60}, 75%, ${50 + val * 20}%)`;
                ctx.fillRect(x, y, barW, barH);

                // Reflection
                ctx.fillStyle = `hsla(${260 + (i / barCount) * 60}, 75%, 50%, 0.1)`;
                ctx.fillRect(x, canvas.height - (barH * 0.2), barW, barH * 0.2);
            }
        };

        draw();
    };

    useEffect(() => {
        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            // We don't necessarily want to close the audio context on widget close if multiple might exist,
            // but usually there's only one.
        };
    }, []);

    const fetchAndDecode = async (id: string, url: string) => {
        if (!audioCtxRef.current) return;

        setPlayers(prev => ({ ...prev, [id]: { ...prev[id], loading: true } }));

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Fetch failed");
            const arrayBuffer = await response.arrayBuffer();
            const buffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);

            if (mountedRef.current) {
                setPlayers(prev => ({
                    ...prev,
                    [id]: {
                        ...prev[id],
                        buffer,
                        loading: false,
                        fallback: false
                    }
                }));
            }
        } catch (err) {
            if (mountedRef.current) {
                console.warn(`AudioBuffer failed for ${id}, using fallback:`, err);
                const audio = new Audio(url);
                audio.preload = 'auto';

                setPlayers(prev => ({
                    ...prev,
                    [id]: {
                        ...prev[id],
                        audioElement: audio,
                        fallback: true,
                        loading: false
                    }
                }));
            }
        }
    };

    const togglePlay = async (id: string) => {
        await initAudio();
        const p = players[id];
        const s = SOUNDS.find(x => x.id === id);
        if (!s) return;

        if (!p.buffer && !p.fallback && !p.loading) {
            await fetchAndDecode(id, s.file);
        }

        const updatedPlayers = { ...players };
        const player = updatedPlayers[id];

        if (player.isPlaying) {
            pauseSound(id, player);
        } else {
            playSound(id, player);
        }

        setPlayers(updatedPlayers);
    };

    const playSound = (id: string, p: Player) => {
        if (!audioCtxRef.current || !masterGainRef.current) return;

        if (p.fallback && p.audioElement) {
            p.audioElement.volume = p.volume * masterVolume;
            p.audioElement.loop = p.looping;
            p.audioElement.play().catch(console.error);

            p.audioElement.onended = () => {
                if (!p.looping) {
                    setPlayers(prev => ({ ...prev, [id]: { ...prev[id], isPlaying: false } }));
                }
            };
        } else if (p.buffer) {
            if (p.source) p.source.stop();

            const source = audioCtxRef.current.createBufferSource();
            source.buffer = p.buffer;
            source.loop = p.looping;

            if (!p.gainNode) {
                const gain = audioCtxRef.current.createGain();
                gain.gain.value = p.volume;
                gain.connect(masterGainRef.current);
                p.gainNode = gain;
            }

            source.connect(p.gainNode);
            source.start(0, p.offset % p.buffer.duration);

            p.source = source;
            p.startTime = audioCtxRef.current.currentTime;

            source.onended = () => {
                setPlayers(prev => {
                    // Check if this source is still the current one and if looping is disabled in the *current* state
                    if (prev[id].source === source && !prev[id].looping) {
                        return { ...prev, [id]: { ...prev[id], isPlaying: false, offset: 0, source: null } };
                    }
                    return prev;
                });
            };
        }
        p.isPlaying = true;
    };

    const pauseSound = (id: string, p: Player) => {
        if (p.fallback && p.audioElement) {
            p.audioElement.pause();
        } else {
            if (p.source) {
                p.source.stop();
                if (audioCtxRef.current) {
                    p.offset += (audioCtxRef.current.currentTime - p.startTime);
                }
                p.source = null;
            }
        }
        p.isPlaying = false;
    };

    const stopAll = () => {
        const updated = { ...players };
        Object.keys(updated).forEach(id => {
            if (updated[id].isPlaying) {
                pauseSound(id, updated[id]);
            }
            updated[id].offset = 0;
        });
        setPlayers(updated);
    };

    const updateVol = (id: string, val: number) => {
        setPlayers(prev => {
            const p = { ...prev[id], volume: val };
            if (p.gainNode) p.gainNode.gain.value = val;
            if (p.fallback && p.audioElement) {
                p.audioElement.volume = val * masterVolume;
            }
            return { ...prev, [id]: p };
        });
    };

    const toggleLoop = (id: string) => {
        setPlayers(prev => {
            const p = { ...prev[id], looping: !prev[id].looping };
            if (p.source) p.source.loop = p.looping;
            if (p.fallback && p.audioElement) p.audioElement.loop = p.looping;
            return { ...prev, [id]: p };
        });
    };

    const convertUrlToEmbed = (url: string) => {
        if (!url) return null;
        url = url.trim();
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let v = '', l = '';
            if (url.includes('v=')) v = url.split('v=')[1].split('&')[0];
            else if (url.includes('youtu.be/')) v = url.split('youtu.be/')[1].split('?')[0];
            if (url.includes('list=')) l = url.split('list=')[1].split('&')[0];
            const host = "www.yout-ube.com";
            if (l && (!v || url.includes('/playlist'))) return `https://${host}/embed/videoseries?list=${l}&rel=0&showinfo=1`;
            return `https://${host}/embed/${v}?rel=0&showinfo=1${l ? '&list=' + l : ''}`;
        }
        if (url.includes('spotify.com')) return url.replace('spotify.com/', 'spotify.com/embed/');
        return null;
    };

    const handleEmbedLoad = () => {
        const src = convertUrlToEmbed(embedUrl);
        if (src) {
            setShowEmbed(true);
            updateData(widget.id, { embedUrl });
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-xl text-white overflow-hidden rounded-xl border border-white/10 custom-scrollbar">
            {/* Visualizer Header */}
            <div className="relative h-24 bg-black/20 overflow-hidden shrink-0">
                <canvas
                    ref={canvasRef}
                    width={widget.width || window.innerWidth}
                    height={96}
                    className="w-full h-full"
                />
                <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                    <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-widest text-white/50">Frequency</span>
                        <span className="font-bold text-lg">Soundboard</span>
                    </div>
                    <div className="flex items-center gap-4 pointer-events-auto bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl">
                        <Volume2 size={16} className="text-white/50" />
                        <input
                            type="range"
                            min="0" max="1" step="0.01"
                            value={masterVolume}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setMasterVolume(val);
                                if (masterGainRef.current) masterGainRef.current.gain.value = val;
                            }}
                            className="w-24 accent-indigo-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                        />
                        <button
                            onClick={stopAll}
                            className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors shadow-lg"
                            title="Stop All"
                        >
                            <Square size={14} fill="currentColor" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {/* Ambience Section */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Ambience</h3>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {SOUNDS.filter(s => s.cat === 'bg').map(s => (
                            <SoundCard
                                key={s.id}
                                sound={s}
                                player={players[s.id]}
                                onToggle={() => togglePlay(s.id)}
                                onVolChange={(v) => updateVol(s.id, v)}
                                onLoopToggle={() => toggleLoop(s.id)}
                            />
                        ))}
                    </div>
                </section>

                {/* SFX Section */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">Sound Effects</h3>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {SOUNDS.filter(s => s.cat === 'sfx').map(s => (
                            <SoundCard
                                key={s.id}
                                sound={s}
                                player={players[s.id]}
                                onToggle={() => togglePlay(s.id)}
                                onVolChange={(v) => updateVol(s.id, v)}
                                onLoopToggle={() => toggleLoop(s.id)}
                            />
                        ))}
                    </div>
                </section>

                {/* External Media Section */}
                <section className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                            <Youtube size={14} /> External Media
                        </h3>
                        {showEmbed && (
                            <button
                                onClick={() => setIsEmbedMinimized(!isEmbedMinimized)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                            >
                                {isEmbedMinimized ? <Maximize2 size={14} /> : <X size={14} />}
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="YouTube or Spotify link..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                            value={embedUrl}
                            onChange={(e) => setEmbedUrl(e.target.value)}
                        />
                        <button
                            onClick={handleEmbedLoad}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg"
                        >
                            Load
                        </button>
                    </div>

                    {showEmbed && !isEmbedMinimized && (
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl">
                            <iframe
                                src={convertUrlToEmbed(embedUrl) || ""}
                                className="absolute inset-0 w-full h-full"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                            />
                        </div>
                    )}

                    {!showEmbed && (
                        <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-white/20 text-xs italic">
                            Paste a link to embed media
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

interface SoundCardProps {
    sound: Sound;
    player: Player;
    onToggle: () => void;
    onVolChange: (v: number) => void;
    onLoopToggle: () => void;
}

const SoundCard: React.FC<SoundCardProps> = ({ sound, player, onToggle, onVolChange, onLoopToggle }) => {
    return (
        <div className={`
      relative group p-3 rounded-2xl border transition-all duration-300
      ${player.isPlaying
                ? (sound.cat === 'bg' ? 'bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-orange-500/10 border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.2)]')
                : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.08]'}
    `}>
            {player.loading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                    <RefreshCw size={18} className="animate-spin text-white/40" />
                </div>
            )}

            <div className="flex flex-col items-center gap-2">
                <div className={`
          text-3xl transition-transform duration-300 
          ${player.isPlaying ? 'scale-110' : 'group-hover:scale-105'}
        `}>
                    {sound.emoji}
                </div>
                <span className="text-[10px] font-bold text-center truncate w-full opacity-70 mb-1">{sound.label}</span>

                <div className="flex items-center gap-1.5 w-full">
                    <button
                        onClick={onToggle}
                        className={`
              flex-1 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95 border
              ${player.isPlaying
                                ? 'bg-white text-black border-white'
                                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}
            `}
                    >
                        {player.isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <button
                        onClick={onLoopToggle}
                        className={`
              w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95 border
              ${player.looping
                                ? (sound.cat === 'bg' ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-orange-500 text-white border-orange-400')
                                : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}
            `}
                        title="Loop"
                    >
                        <RefreshCw size={12} className={player.looping ? 'opacity-100' : 'opacity-30'} />
                    </button>
                </div>

                <div className="flex items-center gap-2 w-full mt-1.5 px-1">
                    <Volume2 size={10} className="opacity-30 shrink-0" />
                    <input
                        type="range"
                        min="0" max="1" step="0.01"
                        value={player.volume}
                        onChange={(e) => onVolChange(parseFloat(e.target.value))}
                        className={`
              flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer
              ${sound.cat === 'bg' ? 'accent-indigo-400' : 'accent-orange-400'}
            `}
                    />
                </div>
            </div>
        </div>
    );
};

export default SoundboardWidget;
