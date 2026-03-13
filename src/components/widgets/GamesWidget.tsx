import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Type, Grid, RefreshCw, Settings, X, Lightbulb, ChevronRight, Trophy } from 'lucide-react';
import { WORD_BANKS } from '../../constants/wordBanks';
import { VALIDATION_BANKS } from '../../constants/validationBanks';

// --- Premium Animations (Custom Styles) ---
const GameStyles = () => (
    <style>{`
        @keyframes flipDown {
            0% { transform: rotateX(0); }
            50% { transform: rotateX(-90deg); opacity: 0.5; }
            100% { transform: rotateX(0); opacity: 1; }
        }
        @keyframes wiggle {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        @keyframes popIn {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        @keyframes floatIn {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
        }
        .animate-flip { animation: flipDown 0.6s ease-in-out; }
        .animate-wiggle { animation: wiggle 0.2s ease-in-out 2; }
        .animate-pop { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .animate-float { animation: floatIn 0.5s ease-out; }
    `}</style>
);

// --- Game 1: Word Wizard (LexiGuess/Wordle) ---
const WordWizard = ({ widget, updateData }: any) => {
    const [input, setInput] = useState('');
    const [shake, setShake] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [revealing, setRevealing] = useState(false);

    const data = widget.data || {};
    const wordLength = data.wordleSize || 5;
    const guesses = data.wordleGuesses || [];
    const target = data.wordleTarget;
    const status = data.wordleStatus || 'playing';
    const isGameOver = status !== 'playing';

    const resetGame = useCallback(() => {
        const bank = WORD_BANKS[wordLength.toString() as keyof typeof WORD_BANKS] || WORD_BANKS["5"];
        const newTarget = bank[Math.floor(Math.random() * bank.length)];
        updateData({
            wordleTarget: newTarget,
            wordleGuesses: [],
            wordleStatus: 'playing',
            showSettings: false
        });
        setInput('');
        setMessage(null);
    }, [wordLength, updateData]);

    useEffect(() => {
        if (!target) resetGame();
    }, [target, resetGame]);

    const handleSubmit = () => {
        if (!target || input.length !== wordLength || isGameOver || revealing) return;

        const guess = input.toUpperCase();
        
        // Validation against full dictionary for THIS word length
        const bank = VALIDATION_BANKS[wordLength.toString()] || [];
        const exists = bank.includes(guess);

        if (!exists && guess !== target) {
            setShake(true);
            setMessage('NOT IN DICTIONARY');
            setTimeout(() => { setShake(false); setMessage(null); }, 1500);
            return;
        }

        setRevealing(true);
        const newGuesses = [...guesses, guess];
        let newStatus = 'playing';
        if (guess === target) newStatus = 'won';
        else if (newGuesses.length >= 6) newStatus = 'lost';

        // Staggered reveal effect simulation (handled by CSS animations on grid)
        setTimeout(() => {
            updateData({ wordleGuesses: newGuesses, wordleStatus: newStatus });
            setRevealing(false);
            setInput('');
        }, 500);
    };

    const getCharStatus = (char: string, index: number, guess: string) => {
        if (target[index] === char) return 'correct';
        if (target.includes(char)) return 'present';
        return 'absent';
    };

    const statusColors = {
        correct: 'bg-emerald-500 border-emerald-600 text-white',
        present: 'bg-amber-400 border-amber-500 text-white',
        absent: 'bg-slate-400 border-slate-500 text-white opacity-75'
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 gap-6 bg-slate-50/50">
            {/* Wordle Grid */}
            <div className={`grid gap-2 ${shake ? 'animate-wiggle' : ''}`}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex gap-2">
                        {[...Array(wordLength)].map((_, j) => {
                            const guess = guesses[i];
                            const char = guess ? guess[j] : (i === guesses.length ? input[j] : '');
                            const charStatus = guess ? getCharStatus(char, j, guess) : null;
                            const isRevealed = i < guesses.length;

                            return (
                                <div 
                                    key={j}
                                    className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-black rounded-xl border-b-4 transition-all duration-300 shadow-sm
                                        ${isRevealed ? `${statusColors[charStatus as keyof typeof statusColors]} animate-flip` : (char ? 'bg-white border-slate-300 scale-105 shadow-md' : 'bg-white/50 border-slate-100')}
                                    `}
                                    style={{ animationDelay: isRevealed ? `${j * 100}ms` : '0ms' }}
                                >
                                    {char}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Input Overlay */}
            {!isGameOver ? (
                <div className="w-full max-w-sm flex flex-col gap-3 animate-float">
                    <div className="flex gap-2 relative">
                        <input 
                            type="text"
                            maxLength={wordLength}
                            value={input}
                            onChange={(e) => setInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Type word..."
                            disabled={isGameOver || revealing}
                            className="flex-1 bg-white border-2 border-slate-200 focus:border-indigo-500 rounded-2xl px-4 py-3 text-xl font-bold uppercase tracking-widest outline-none shadow-lg transition-all"
                        />
                        <button 
                            onClick={handleSubmit}
                            disabled={input.length !== wordLength || revealing}
                            className={`px-6 py-3 rounded-2xl font-black uppercase tracking-tight text-white transition-all transform active:scale-95 shadow-lg
                                ${input.length === wordLength ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-300 opacity-50'}
                            `}
                        >
                            Enter
                        </button>
                    </div>
                    {message && (
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-full text-center">
                            <span className="bg-slate-800 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-2xl animate-pop uppercase tracking-widest">
                                {message}
                            </span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center flex flex-col items-center gap-4 animate-pop">
                    <div className={`text-2xl font-black tracking-tight ${status === 'won' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {status === 'won' ? 'EXTRAORDINARY! 🎉' : `THE WORD WAS: ${target}`}
                    </div>
                    <button 
                        onClick={resetGame}
                        className="group flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all active:scale-95"
                    >
                        <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                        PLAY AGAIN
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Game 2: Grid Glide (Boggle) ---
const GridGlide = ({ widget, updateData }: any) => {
    const data = widget.data || {};
    const size = data.boggleSize || 4;
    const grid = data.boggleGrid || [];
    const found = data.boggleFound || [];
    
    const [currentPath, setCurrentPath] = useState<number[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [msg, setMsg] = useState<{ text: string, type: 'success' | 'warn' | 'info' } | null>(null);

    const generateGrid = useCallback(() => {
        // Improved letter distribution (Pro logic)
        const distribution = "EEEEEEEEEEEEEEEEEEAAAAAAAAAIIIIIIIIIOOOOOOOOONNNNNNNRRRRRRTTTTTTLLLLSSSSUUUUDDDDGGGHHHBCCMMPPYYFFKWWVXZJQ";
        const newGrid = Array.from({ length: size * size }, () => 
            distribution[Math.floor(Math.random() * distribution.length)]
        );
        updateData({ 
            boggleGrid: newGrid, 
            boggleFound: [],
            showSettings: false 
        });
        setCurrentPath([]);
    }, [size, updateData]);

    useEffect(() => {
        if (!grid || grid.length === 0) generateGrid();
    }, [grid.length, generateGrid]);

    const handleStart = (idx: number) => {
        setIsSelecting(true);
        setCurrentPath([idx]);
    };

    const handleEnter = (idx: number) => {
        if (!isSelecting || currentPath.includes(idx)) return;
        
        const last = currentPath[currentPath.length - 1];
        const lr = Math.floor(last / size), lc = last % size;
        const cr = Math.floor(idx / size), cc = idx % size;

        if (Math.abs(lr - cr) <= 1 && Math.abs(lc - cc) <= 1) {
            setCurrentPath(prev => [...prev, idx]);
        }
    };

    const handleEnd = () => {
        if (!isSelecting) return;
        setIsSelecting(false);
        const word = currentPath.map(i => grid[i]).join('');
        
        if (word.length < 3) {
            setCurrentPath([]);
            return;
        }

        if (found.includes(word)) {
            setMsg({ text: 'ALREADY FOUND', type: 'warn' });
        } else {
            // Validate against the massive dictionary
            const isValid = VALIDATION_BANKS[word.length.toString()]?.includes(word);
            if (isValid) {
                updateData({ boggleFound: [word, ...found] });
                setMsg({ text: 'VALID!', type: 'success' });
            } else {
                setMsg({ text: 'NOT IN BANK', type: 'info' });
            }
        }

        setTimeout(() => { setMsg(null); setCurrentPath([]); }, 800);
    };

    return (
        <div className="h-full flex flex-col bg-slate-50/50 p-4" onPointerUp={handleEnd}>
            <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-amber-500" />
                    <span className="text-[10px] font-black uppercase text-slate-400">FOUND: {found.length}</span>
                </div>
                {msg && (
                    <span className={`text-[10px] font-black uppercase animate-pop ${msg.type === 'success' ? 'text-emerald-600' : (msg.type === 'warn' ? 'text-amber-600' : 'text-slate-400')}`}>
                        {msg.text}
                    </span>
                )}
            </div>

            <div 
                className="grid gap-2 sm:gap-3 mx-auto select-none touch-none"
                style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
            >
                {grid.map((char: string, i: number) => (
                    <div 
                        key={i}
                        onPointerDown={() => handleStart(i)}
                        onPointerEnter={() => handleEnter(i)}
                        className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-2xl font-black rounded-2xl border-b-4 transition-all duration-75 cursor-pointer shadow-md
                            ${currentPath.includes(i) ? 'bg-indigo-600 text-white border-indigo-800 scale-95 shadow-inner' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}
                        `}
                    >
                        {char}
                    </div>
                ))}
            </div>

            {/* Found Scroll List */}
            <div className="mt-6 flex-1 min-h-0 bg-white/40 rounded-3xl p-4 border border-white/60 overflow-y-auto custom-scrollbar shadow-inner">
                <div className="flex flex-wrap gap-2">
                    {found.length === 0 && <span className="text-slate-400 font-bold text-xs italic opacity-50">Swipe to find words...</span>}
                    {found.map((w: string, i: number) => (
                        <div key={i} className="bg-white px-3 py-1.5 rounded-xl border-b-2 border-slate-100 shadow-sm text-xs font-black text-indigo-700 animate-pop">
                            {w}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Game 3: Scramble (Anagrams) ---
const Scramble = ({ widget, updateData }: any) => {
    const data = widget.data || {};
    const wordLength = data.scrambleSize || 5;
    const target = data.scrambleTarget;
    const current = data.scrambleCurrent || [];
    const solved = data.scrambleSolved || false;
    const hinted = data.scrambleHints || [];
    
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [shake, setShake] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    const scramble = useCallback((word: string) => {
        if (!word) return [];
        const arr = word.split('');
        let scrambled = [...arr];
        let attempts = 0;
        while (attempts < 10) {
            for (let i = scrambled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
            }
            if (scrambled.join('') !== word) break;
            attempts++;
        }
        return scrambled;
    }, []);

    const resetGame = useCallback(() => {
        const bank = WORD_BANKS[wordLength.toString() as keyof typeof WORD_BANKS] || WORD_BANKS["5"];
        const next = bank[Math.floor(Math.random() * bank.length)];
        updateData({
            scrambleTarget: next,
            scrambleCurrent: scramble(next),
            scrambleSolved: false,
            scrambleHints: [],
            showSettings: false
        });
        setSelectedIdx(null);
    }, [wordLength, scramble, updateData]);

    useEffect(() => {
        if (!target || current.length === 0) resetGame();
    }, [target, current.length, resetGame]);

    const handleSwap = (idx: number) => {
        if (solved) return;
        if (selectedIdx === null) {
            setSelectedIdx(idx);
            return;
        }
        if (selectedIdx === idx) {
            setSelectedIdx(null);
            return;
        }

        const next = [...current];
        [next[selectedIdx], next[idx]] = [next[idx], next[selectedIdx]];
        updateData({ scrambleCurrent: next, scrambleSolved: false });
        setSelectedIdx(null);
    };

    const handleCheck = () => {
        const word = current.join('');
        const bank = VALIDATION_BANKS[wordLength.toString()] || [];
        if (word === target || bank.includes(word)) {
            updateData({ scrambleSolved: true });
        } else {
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    const handleHint = () => {
        if (solved) return;
        const mismatch = current.findIndex((c, i) => c !== target[i]);
        if (mismatch === -1) return;

        const targetChar = target[mismatch];
        const fromIdx = current.findIndex((c, i) => i > mismatch && c === targetChar);
        if (fromIdx === -1) return;

        const next = [...current];
        [next[mismatch], next[fromIdx]] = [next[fromIdx], next[mismatch]];
        updateData({ 
            scrambleCurrent: next, 
            scrambleHints: [...hinted, mismatch],
            scrambleSolved: next.join('') === target
        });
    };

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 gap-8 bg-slate-50/50">
            <div className={`flex flex-wrap justify-center gap-3 ${shake ? 'animate-wiggle' : ''}`}>
                {current.map((char: string, i: number) => (
                    <button 
                        key={i}
                        onClick={() => handleSwap(i)}
                        className={`w-14 h-14 flex items-center justify-center text-2xl font-black rounded-2xl border-b-4 transition-all duration-300 shadow-xl
                            ${solved ? 'bg-emerald-500 border-emerald-600 text-white scale-110 shadow-emerald-200' : 
                              (hinted.includes(i) && current[i] === target[i] ? 'bg-amber-100 text-amber-600 border-amber-300 scale-105' :
                              (selectedIdx === i ? 'bg-indigo-600 text-white border-indigo-800 -translate-y-2' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'))}
                        `}
                    >
                        {char}
                    </button>
                ))}
            </div>

            {!solved ? (
                <div className="flex gap-4 animate-float">
                    <button 
                        onClick={handleHint}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-2xl font-black border-2 border-amber-300 shadow-lg active:scale-95 transition-all"
                    >
                        <Lightbulb size={20} /> HINT
                    </button>
                    <button 
                        onClick={handleCheck}
                        className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 active:scale-95 transition-all tracking-wider uppercase"
                    >
                        CHECK
                    </button>
                </div>
            ) : (
                <div className="text-center animate-pop flex flex-col items-center gap-4">
                    <div className="text-2xl font-black tracking-widest text-emerald-600">UNSCRAMBLED! 🎉</div>
                    <button 
                        onClick={resetGame}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all active:scale-95"
                    >
                        NEXT WORD
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Main Widget Shell ---
const GamesWidget = ({ widget, updateData }: any) => {
    const activeGame = widget.data?.activeGame || 'wordle';
    const showSettings = widget.data?.showSettings || false;

    const navItems = [
        { id: 'wordle', label: 'Wizard', icon: <Type size={16} /> },
        { id: 'boggle', label: 'Glide', icon: <Grid size={16} /> },
        { id: 'scramble', label: 'Scramble', icon: <RefreshCw size={16} /> }
    ];

    return (
        <div className="h-full bg-white flex flex-col min-h-0 relative no-drag overflow-hidden select-none">
            <GameStyles />

            {/* Premium Header */}
            <div className="h-14 bg-white/40 backdrop-blur-xl border-b flex items-center justify-between px-3 shrink-0 z-30">
                <div className="flex gap-1.5 items-center bg-white/30 p-1 rounded-2xl border border-white/40 shadow-sm">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => updateData({ activeGame: item.id })}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all
                                ${activeGame === item.id ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}
                            `}
                        >
                            {item.icon}
                            <span className="hidden sm:inline">{item.label}</span>
                        </button>
                    ))}
                </div>
                <button 
                    onClick={() => updateData({ showSettings: !showSettings })}
                    className={`p-2 rounded-xl transition-all ${showSettings ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-indigo-600'}`}
                >
                    <Settings size={20} />
                </button>
            </div>

            {/* Game Canvas */}
            <div className="flex-1 min-h-0 relative">
                {activeGame === 'wordle' && <WordWizard widget={widget} updateData={(d) => updateData(d)} />}
                {activeGame === 'boggle' && <GridGlide widget={widget} updateData={(d) => updateData(d)} />}
                {activeGame === 'scramble' && <Scramble widget={widget} updateData={(d) => updateData(d)} />}

                {/* Settings Overlay */}
                {showSettings && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-xl z-50 p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-300">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-slate-800 uppercase tracking-tighter text-xl">Game Settings</h3>
                            <button onClick={() => updateData({ showSettings: false })} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
                        </div>

                        <div className="space-y-6">
                            {/* Size/Length Selector */}
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">
                                    {activeGame === 'boggle' ? 'Board Size' : 'Word Length'}
                                </label>
                                <div className="flex gap-2">
                                    {(activeGame === 'boggle' ? [4, 5] : [3, 4, 5, 6]).map(s => {
                                        const isActive = (activeGame === 'wordle' && (widget.data.wordleSize || 5) === s) ||
                                                       (activeGame === 'boggle' && (widget.data.boggleSize || 4) === s) ||
                                                       (activeGame === 'scramble' && (widget.data.scrambleSize || 5) === s);
                                        return (
                                            <button 
                                                key={s} 
                                                onClick={() => {
                                                    const key = activeGame === 'wordle' ? 'wordleSize' : (activeGame === 'boggle' ? 'boggleSize' : 'scrambleSize');
                                                    updateData({ [key]: s, showSettings: false });
                                                }}
                                                className={`flex-1 py-4 rounded-3xl font-black border-4 transition-all transform active:scale-95
                                                    ${isActive ? 'bg-indigo-600 text-white border-indigo-200' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200'}
                                                `}
                                            >
                                                {s}{activeGame === 'boggle' && 'x' + s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Teacher Override for Wordle */}
                            {activeGame === 'wordle' && (
                                <div className="animate-float">
                                    <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block tracking-widest">Custom Target Word</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text"
                                            placeholder="SECRET WORD..."
                                            className="flex-1 bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-2xl px-4 py-3 font-bold uppercase tracking-widest outline-none"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const val = e.currentTarget.value.toUpperCase().trim();
                                                    if (val.length >= 3 && val.length <= 6) {
                                                        updateData({ 
                                                            wordleTarget: val, 
                                                            wordleSize: val.length,
                                                            wordleGuesses: [], 
                                                            wordleStatus: 'playing', 
                                                            showSettings: false 
                                                        });
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold mt-2 italic px-1">Press Enter to assign to the whole class.</p>
                                </div>
                            )}

                            {/* Reset Button */}
                            <button 
                                onClick={() => {
                                    if (activeGame === 'boggle') {
                                        // Grid Glide uses a specific function we'll trigger via prop update
                                        updateData({ boggleGrid: [], showSettings: false });
                                    } else {
                                        updateData({ 
                                            [activeGame === 'wordle' ? 'wordleTarget' : 'scrambleTarget']: null,
                                            showSettings: false 
                                        });
                                    }
                                }}
                                className="w-full py-4 bg-slate-800 hover:bg-black text-white rounded-3xl font-black flex items-center justify-center gap-2 shadow-xl shadow-slate-200 transition-all active:scale-95 uppercase tracking-widest"
                            >
                                <RefreshCw size={20} /> New Game
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GamesWidget;
