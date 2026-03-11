import React, { useState, useEffect } from 'react';
import { Type, Grid, RefreshCw, Settings, X, Lightbulb } from 'lucide-react';
import { WORD_BANKS } from '../../constants/wordBanks';

export const WordWizard = ({ widget, updateData }: any) => {
    const [input, setInput] = useState('');
    const [shake, setShake] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const wordLength = widget.data.wordleSize || 5;
    const guesses = widget.data.wordleGuesses || [];
    const target = widget.data.wordleTarget || 'APPLE';
    const isGameOver = widget.data.wordleStatus === 'won' || guesses.length >= 6;

    const resetGame = () => {
        const words = WORD_BANKS[wordLength as keyof typeof WORD_BANKS] || WORD_BANKS[5];
        const newTarget = words[Math.floor(Math.random() * words.length)];
        updateData(widget.id, {
            wordleTarget: newTarget,
            wordleGuesses: [],
            wordleStatus: 'playing'
        });
        setInput('');
        setMessage(null);
    };

    const handleKey = (key: string) => {
        if (isGameOver) return;
        if (key === 'Enter') {
            if (input.length === wordLength) {
                const uppercaseInput = input.toUpperCase();
                let isValidWord = false;
                for (const len in WORD_BANKS) {
                    if (WORD_BANKS[len as unknown as keyof typeof WORD_BANKS].includes(uppercaseInput)) {
                        isValidWord = true;
                        break;
                    }
                }

                if (!isValidWord) {
                    setShake(true);
                    setMessage('Not in word bank');
                    setTimeout(() => {
                        setShake(false);
                        setMessage(null);
                    }, 1500);
                    return;
                }

                const newGuesses = [...guesses, uppercaseInput];
                let status = 'playing';
                if (uppercaseInput === target) status = 'won';
                else if (newGuesses.length >= 6) status = 'lost';
                updateData(widget.id, { wordleGuesses: newGuesses, wordleStatus: status });
                setInput('');
            } else {
                setShake(true);
                setTimeout(() => setShake(false), 500);
            }
        } else if (key === 'Backspace') {
            setInput(prev => prev.slice(0, -1));
        } else if (/^[a-zA-Z]$/.test(key) && input.length < wordLength) {
            setInput(prev => prev + key.toUpperCase());
        }
    };

    useEffect(() => {
        if (!widget.data.wordleTarget) resetGame();
    }, [widget.data.wordleTarget, wordLength]);

    const getCharClass = (char: string, index: number, guess: string) => {
        if (target[index] === char) return 'bg-green-500 text-white border-green-600 scale-105';
        if (target.includes(char)) return 'bg-yellow-500 text-white border-yellow-600';
        return 'bg-slate-400 text-white border-slate-500 opacity-80';
    };

    return (
        <div className="p-3 h-full flex flex-col items-center justify-center gap-3 bg-slate-100/50 overflow-y-auto custom-scrollbar">
            <div className={`grid gap-1.5 mb-2 relative ${shake ? 'animate-shake' : ''}`}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex gap-1.5">
                        {[...Array(wordLength)].map((_, j) => {
                            const guess = guesses[i];
                            const char = guess ? guess[j] : (i === guesses.length ? input[j] : '');
                            const statusClass = guess ? getCharClass(char, j, guess) : (char ? 'border-slate-400 border-2 scale-105' : 'border-slate-200');
                            return (
                                <div key={j} className={`w-10 h-10 flex items-center justify-center text-lg font-black rounded-lg border-b-2 transition-all duration-500 shadow-sm ${statusClass} ${!guess && !char ? 'bg-white' : ''}`}>
                                    {char}
                                </div>
                            );
                        })}
                    </div>
                ))}
                {message && (
                    <div className="absolute inset-x-0 -bottom-8 flex justify-center z-10 animate-in fade-in zoom-in slide-in-from-top-2">
                        <span className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">{message}</span>
                    </div>
                )}
            </div>

            <div className="w-full max-w-[280px] flex gap-2">
                <input
                    type="text"
                    maxLength={wordLength}
                    value={input}
                    onChange={e => setInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                    onKeyDown={e => e.key === 'Enter' && handleKey('Enter')}
                    className="flex-1 p-2 rounded-xl border-2 border-slate-200 text-center font-black text-xl tracking-widest uppercase focus:border-blue-500 outline-none shadow-sm"
                    placeholder="TYPE GUESS"
                    disabled={isGameOver}
                />
                <button onClick={() => handleKey('Enter')} disabled={isGameOver || input.length !== wordLength} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-md transition-all active:scale-95">Enter</button>
            </div>

            {isGameOver && (
                <div className="text-center animate-in fade-in zoom-in slide-in-from-bottom-4 mt-2">
                    <div className={`text-lg font-black mb-4 ${widget.data.wordleStatus === 'won' ? 'text-green-600' : 'text-red-500'}`}>
                        {widget.data.wordleStatus === 'won' ? 'PERFECT! 🎉' : `Word was: ${target}`}
                    </div>
                    <button onClick={resetGame} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">Play Again</button>
                </div>
            )}

            {widget.data.showSettings && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-slate-800 uppercase tracking-tight">Game Settings</h3>
                        <button onClick={() => updateData(widget.id, { showSettings: false })} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Word Length</label>
                            <div className="flex gap-2">
                                {[3, 4, 5, 6].map(s => (
                                    <button key={s} onClick={() => { updateData(widget.id, { wordleSize: s }); resetGame(); }} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${wordLength === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}>{s}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Custom Word (Teacher)</label>
                            <input
                                type="text"
                                placeholder="Enter word..."
                                className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none uppercase font-bold"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const val = e.currentTarget.value.toUpperCase();
                                        if (val.length >= 3 && val.length <= 6) {
                                            updateData(widget.id, { wordleTarget: val, wordleGuesses: [], wordleStatus: 'playing', wordleSize: val.length, showSettings: false });
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const GridGlide = ({ widget, updateData }: any) => {
    const gridSize = widget.data.boggleSize || 4;
    const grid = widget.data.boggleGrid || [];
    const foundWords = widget.data.boggleFound || [];
    const [selection, setSelection] = useState<number[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [message, setMessage] = useState<{ text: string, color: string } | null>(null);

    const generateGrid = () => {
        const vowels = 'AEIOU';
        const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
        const newGrid: string[] = [];
        for (let i = 0; i < gridSize * gridSize; i++) {
            const isVowel = Math.random() < 0.3;
            const source = isVowel ? vowels : consonants;
            newGrid.push(source[Math.floor(Math.random() * source.length)]);
        }
        updateData(widget.id, { boggleGrid: newGrid, boggleFound: [] });
        setSelection([]);
    };

    useEffect(() => {
        if (!widget.data.boggleGrid) generateGrid();
    }, [gridSize]);

    const handlePointerDown = (idx: number) => {
        setIsSelecting(true);
        setSelection([idx]);
    };

    const handlePointerEnter = (idx: number) => {
        if (!isSelecting || selection.includes(idx)) return;
        const lastIdx = selection[selection.length - 1];
        const lastRow = Math.floor(lastIdx / gridSize);
        const lastCol = lastIdx % gridSize;
        const currRow = Math.floor(idx / gridSize);
        const currCol = idx % gridSize;

        if (Math.abs(lastRow - currRow) <= 1 && Math.abs(lastCol - currCol) <= 1) {
            setSelection([...selection, idx]);
        }
    };

    const handlePointerUp = () => {
        if (!isSelecting) return;
        setIsSelecting(false);
        const word = selection.map(idx => grid[idx]).join('');

        let isValidWord = false;
        for (const len in WORD_BANKS) {
            if (WORD_BANKS[len as unknown as keyof typeof WORD_BANKS].includes(word)) {
                isValidWord = true;
                break;
            }
        }

        if (word.length < 3) {
            setSelection([]);
            return;
        }

        if (isValidWord && !foundWords.includes(word)) {
            updateData(widget.id, { boggleFound: [...foundWords, word] });
            setMessage({ text: 'Valid!', color: 'text-green-500' });
        } else if (foundWords.includes(word)) {
            setMessage({ text: 'Already found', color: 'text-yellow-500' });
        } else {
            setMessage({ text: 'Not in word bank', color: 'text-slate-400' });
        }
        setTimeout(() => { setMessage(null); setSelection([]); }, 1000);
    };

    return (
        <div className="p-4 h-full flex flex-col items-center gap-4 bg-slate-100/50 overflow-y-auto" onPointerUp={handlePointerUp}>
            <div className="flex justify-between w-full max-w-[280px] mb-2">
                <div className="text-[10px] font-black uppercase text-slate-400">Words: {foundWords.length}</div>
                {message && <div className={`text-[10px] font-black uppercase ${message.color} animate-pulse`}>{message.text}</div>}
            </div>

            <div
                className="grid gap-2 select-none touch-none"
                style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
            >
                {grid.map((char: string, i: number) => (
                    <div
                        key={i}
                        onPointerDown={() => handlePointerDown(i)}
                        onPointerEnter={() => handlePointerEnter(i)}
                        className={`w-14 h-14 flex items-center justify-center text-2xl font-black rounded-2xl border-b-4 transition-all duration-100 cursor-pointer shadow-md ${selection.includes(i) ? 'bg-blue-600 text-white border-blue-800 scale-95 shadow-inner' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
                    >
                        {char}
                    </div>
                ))}
            </div>

            <div className="w-full max-w-[320px] bg-white/50 backdrop-blur rounded-xl p-3 flex flex-wrap gap-2 mt-2">
                {foundWords.length === 0 && <div className="text-[10px] italic text-slate-400 w-full text-center py-2">Swipe letters to find words!</div>}
                {foundWords.map((w: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold border border-green-200">
                        {w}
                    </span>
                ))}
            </div>

            {widget.data.showSettings && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-slate-800 uppercase tracking-tight">Game Settings</h3>
                        <button onClick={() => updateData(widget.id, { showSettings: false })} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Grid Size</label>
                            <div className="flex gap-2">
                                {[4, 5].map(s => (
                                    <button key={s} onClick={() => { updateData(widget.id, { boggleSize: s }); generateGrid(); }} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${gridSize === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}>{s}x{s}</button>
                                ))}
                            </div>
                        </div>
                        <button onClick={generateGrid} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all">
                            <RefreshCw size={16} /> New Board
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const ScrambleSwap = ({ widget, updateData }: any) => {
    const wordLength = widget.data.scrambleSize || 5;
    const target = widget.data.scrambleTarget || 'APPLE';
    const current = widget.data.scrambleCurrent || [];
    const isSolved = widget.data.scrambleSolved || false;
    const hintedIndices = widget.data.scrambleHints || [];
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [shake, setShake] = useState(false);

    const scrambleWord = (word: string) => {
        const arr = word.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        if (arr.join('') === word && word.length > 1) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }
        return arr;
    };

    const resetGame = () => {
        const words = WORD_BANKS[wordLength as keyof typeof WORD_BANKS] || WORD_BANKS[5];
        const newTarget = words[Math.floor(Math.random() * words.length)];
        updateData(widget.id, {
            scrambleTarget: newTarget,
            scrambleCurrent: scrambleWord(newTarget),
            scrambleSolved: false,
            scrambleHints: []
        });
        setSelectedIndex(null);
        setShake(false);
    };

    const giveHint = () => {
        if (isSolved) return;
        const incorrectIndices = [];
        for (let i = 0; i < target.length; i++) {
            if (current[i] !== target[i]) {
                incorrectIndices.push(i);
            }
        }
        if (incorrectIndices.length === 0) return;

        const targetIndex = incorrectIndices[Math.floor(Math.random() * incorrectIndices.length)];
        const targetChar = target[targetIndex];

        let currentIndex = -1;
        for (let i = 0; i < current.length; i++) {
            if (i !== targetIndex && current[i] === targetChar && current[i] !== target[i]) {
                currentIndex = i;
                break;
            }
        }

        if (currentIndex !== -1) {
            const next = [...current];
            [next[targetIndex], next[currentIndex]] = [next[currentIndex], next[targetIndex]];
            updateData(widget.id, {
                scrambleCurrent: next,
                scrambleSolved: next.join('') === target,
                scrambleHints: [...hintedIndices, targetIndex]
            });
            setSelectedIndex(null);
        }
    };

    useEffect(() => {
        if (!widget.data.scrambleTarget || !widget.data.scrambleCurrent || widget.data.scrambleCurrent.length === 0) {
            resetGame();
        }
    }, [wordLength, widget.data.scrambleTarget]);

    const swap = (i: number, j: number) => {
        const next = [...current];
        [next[i], next[j]] = [next[j], next[i]];
        updateData(widget.id, { scrambleCurrent: next, scrambleSolved: false });
        setSelectedIndex(null);
    };

    const checkWord = () => {
        const word = current.join('');
        const bank = WORD_BANKS[wordLength as keyof typeof WORD_BANKS] || [];
        if (word === target || bank.includes(word)) {
            updateData(widget.id, { scrambleSolved: true });
        } else {
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    return (
        <div className="p-4 h-full flex flex-col items-center justify-center gap-6 bg-slate-100/50 relative overflow-y-auto custom-scrollbar">
            <div className={`flex gap-2 flex-wrap justify-center ${shake ? 'animate-shake' : ''}`}>
                {current.map((char: string, i: number) => (
                    <button
                        key={i}
                        onClick={() => {
                            if (isSolved) return;
                            if (selectedIndex === null) setSelectedIndex(i);
                            else if (selectedIndex === i) setSelectedIndex(null);
                            else swap(selectedIndex, i);
                        }}
                        className={`w-12 h-12 flex items-center justify-center text-xl font-black rounded-xl border-b-4 transition-all duration-300 shadow-lg ${isSolved ? 'bg-green-500 text-white border-green-600 scale-110' : (hintedIndices.includes(i) && current[i] === target[i] ? 'bg-amber-100 text-amber-700 border-amber-300' : (selectedIndex === i ? 'bg-blue-600 text-white border-blue-800 -translate-y-2' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'))}`}
                    >
                        {char}
                    </button>
                ))}
            </div>

            {!isSolved ? (
                <div className="flex gap-4">
                    <button onClick={giveHint} className="px-5 py-3 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-xl font-bold border-2 border-amber-200 transition-all active:scale-95 flex items-center gap-2" title="Reveal one letter">
                        <Lightbulb size={20} /> Hint
                    </button>
                    <button onClick={checkWord} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 uppercase tracking-wider">Check Word</button>
                </div>
            ) : (
                <div className="text-center animate-in fade-in zoom-in slide-in-from-bottom-4">
                    <div className="text-green-600 text-lg font-black mb-4 uppercase tracking-[0.2em]">Unscrambled! 🏆</div>
                    <button onClick={resetGame} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">Next Word</button>
                </div>
            )}

            {widget.data.showSettings && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-slate-800 uppercase tracking-tight">Game Settings</h3>
                        <button onClick={() => updateData(widget.id, { showSettings: false })} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Word Length</label>
                            <div className="flex gap-2">
                                {[3, 4, 5, 6].map(s => (
                                    <button key={s} onClick={() => { updateData(widget.id, { scrambleSize: s }); resetGame(); }} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${wordLength === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}>{s}</button>
                                ))}
                            </div>
                        </div>
                        <button onClick={resetGame} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all">
                            <RefreshCw size={16} /> New Word
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const GamesWidget = ({ widget, updateData }: any) => {
    const { activeGame = 'wordle' } = widget.data;

    return (
        <div className="h-full bg-white flex flex-col min-h-0 relative no-drag overflow-hidden">
            <div className="bg-slate-50 p-2 border-b flex items-center justify-between shrink-0 z-20">
                <div className="flex gap-1 items-center bg-slate-200/50 p-1 rounded-xl">
                    <button
                        onClick={() => updateData(widget.id, { activeGame: 'wordle' })}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeGame === 'wordle' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Type size={14} /> Word Wizard
                    </button>
                    <button
                        onClick={() => updateData(widget.id, { activeGame: 'boggle' })}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeGame === 'boggle' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Grid size={14} /> Grid Glide
                    </button>
                    <button
                        onClick={() => updateData(widget.id, { activeGame: 'scramble' })}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeGame === 'scramble' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <RefreshCw size={14} /> Scramble
                    </button>
                </div>
                <button
                    onClick={() => updateData(widget.id, { showSettings: !widget.data.showSettings })}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                >
                    <Settings size={18} />
                </button>
            </div>

            <div className="flex-1 min-h-0 relative">
                {activeGame === 'wordle' && <WordWizard widget={widget} updateData={updateData} />}
                {activeGame === 'boggle' && <GridGlide widget={widget} updateData={updateData} />}
                {activeGame === 'scramble' && <ScrambleSwap widget={widget} updateData={updateData} />}
            </div>
        </div>
    );
};

export default GamesWidget;
