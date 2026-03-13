import React, { useState, useEffect } from 'react';
import { Lightbulb, Settings, Zap, RefreshCw, Copy, ExternalLink, Lock } from 'lucide-react';

interface SparkWidgetProps {
    widget: any;
    updateData: (data: any) => void;
    extraProps: any;
}

const SparkWidget: React.FC<SparkWidgetProps> = ({ widget, updateData, extraProps }) => {
    const {
        sparkGrade,
        setSparkGrade,
        geminiApiKey,
        setGeminiApiKey
    } = extraProps;

    const {
        topic = '',
        type = 'HOOK',
        result = '',
        isLoading = false,
        error = null,
        showConfig = false
    } = widget.data;

    const [tempKey, setTempKey] = useState(geminiApiKey || '');

    useEffect(() => {
        setTempKey(geminiApiKey || '');
    }, [geminiApiKey]);

    const getApiKey = () => {
        return geminiApiKey || (window as any).GEMINI_API_KEY || (window as any).GOOGLE_API_KEY;
    };

    const saveKey = () => {
        setGeminiApiKey(tempKey);
        updateData({ showConfig: false, error: null });
    };

    const generateContent = async () => {
        const apiKey = getApiKey();
        if (!apiKey) {
            updateData({ showConfig: true });
            return;
        }

        updateData({ isLoading: true, error: null, result: '' });

        const baseRule = "Be creative and give a DIFFERENT answer every time, even if asked the same topic again. Give a super short, simple response in point form (1-3 bullet points max). Each point must be a full sentence. Literally just the spark of the idea. No intro, no closing, no fluff.";
        const prompts: Record<string, string> = {
            HOOK: `Lesson hook about "${topic}" for ${sparkGrade} students. ${baseRule}`,
            FACT: `Fun fact about "${topic}" for ${sparkGrade} students. ${baseRule}`,
            JOKE: `Tell a school-appropriate joke about "${topic}" for ${sparkGrade} students. Use a setup and punchline format (e.g. "Q: ... A: ..."). Just the joke, nothing else. Be creative and give a DIFFERENT joke every time.`,
            DISCUSSION: `Discussion question about "${topic}" for ${sparkGrade} students. Give exactly ONE thought-provoking sentence. No bullet points. No intro.`,
            TRIVIA: `Trivia question about "${topic}" with answer for ${sparkGrade} students. ${baseRule}`
        };

        const prompt = prompts[type] || prompts.HOOK;

        const MODELS = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro'
        ];
        const VERSIONS = ['v1beta', 'v1'];

        let lastError = null;
        let data = null;

        const tryEndpoint = async (mId: string, ver: string) => {
            try {
                const fetchUrl = `https://generativelanguage.googleapis.com/${ver}/models/${mId}:generateContent?key=${apiKey}`;
                const res = await fetch(fetchUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 1.0 } })
                });

                const d = await res.json();

                if (res.status === 429 || (d.error && d.error.message?.toLowerCase().includes('quota'))) {
                    return { success: false, stop: true, error: "Google's AI is currently at its free limit. Please wait a minute." };
                }
                if (res.status === 400 && d.error?.message?.toLowerCase().includes('api key')) {
                    return { success: false, stop: true, error: "Invalid API Key. Please check settings." };
                }

                const errMsg = d.error?.message?.toLowerCase() || '';
                if (res.status === 404 || res.status === 400 || errMsg.includes('not found') || errMsg.includes('not supported') || errMsg.includes('not available')) {
                    return { success: false, skip: true };
                }

                if (d.error) return { success: false, error: d.error.message };

                return { success: true, data: d };
            } catch (err: any) {
                return { success: false, error: err.message };
            }
        };

        for (const modelId of MODELS) {
            for (const version of VERSIONS) {
                const result = await tryEndpoint(modelId, version);
                if (result.success) {
                    data = result.data;
                    break;
                }
                if (result.stop) {
                    lastError = result.error;
                    break;
                }
                if (!result.skip) lastError = `[${modelId}] ${result.error}`;
            }
            if (data) break;
        }

        if (lastError || !data || data.error) {
            updateData({ isLoading: false, error: lastError || 'All models failed.' });
        } else {
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated.";
            updateData({ isLoading: false, result: text });
        }
    };

    const apiKey = getApiKey();

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden relative">
            <div className="p-3 border-b flex items-center justify-between bg-yellow-50">
                <div className="flex items-center gap-2 font-bold text-yellow-800">
                    <Lightbulb size={16} className="text-yellow-600 fill-yellow-400" />
                    AI Spark
                </div>
                <button
                    onClick={() => updateData({ showConfig: !showConfig })}
                    className={`p-1.5 rounded-lg transition-colors ${showConfig ? 'bg-yellow-200 text-yellow-900' : 'hover:bg-yellow-100 text-yellow-600'}`}
                >
                    <Settings size={14} />
                </button>
            </div>

            <div className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto custom-scrollbar">
                {showConfig || !apiKey ? (
                    <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl">
                            <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                                To use AI features, you need a free Gemini API key from Google.
                            </p>
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-blue-600 font-bold hover:underline mt-1 inline-flex items-center gap-1"
                            >
                                Get a Free Key <ExternalLink size={10} />
                            </a>
                        </div>
                        <div className="bg-green-50 border border-green-100 p-2 rounded-lg flex items-start gap-2">
                            <Lock size={12} className="text-green-600 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-green-700 leading-relaxed font-medium">
                                Your API key is stored <strong>only on this device</strong>. It is <strong>never</strong> sent to HomeRoom cloud storage.
                            </p>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Your API Key</label>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    className="flex-1 p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
                                    placeholder="Paste key here..."
                                    value={tempKey}
                                    onChange={(e) => setTempKey(e.target.value)}
                                />
                                <button
                                    onClick={saveKey}
                                    className="px-4 py-2 bg-yellow-400 text-yellow-900 font-bold rounded-lg hover:bg-yellow-500 transition-all text-sm"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                        {apiKey && (
                            <button
                                onClick={() => updateData({ showConfig: false })}
                                className="text-xs text-slate-400 font-bold hover:text-slate-600 underline"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                ) : !result ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Topic</label>
                                <input
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-yellow-400 outline-none"
                                    placeholder="e.g. Photosynthesis..."
                                    value={topic}
                                    onChange={(e) => updateData({ topic: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && generateContent()}
                                />
                            </div>
                            <div className="w-1/3 min-w-[100px]">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Grade</label>
                                <select
                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                                    value={sparkGrade}
                                    onChange={(e) => setSparkGrade(e.target.value)}
                                >
                                    <option value="Pre-K">Pre-K</option>
                                    <option value="Kindergarten">Kindergarten</option>
                                    <option value="1st Grade">1st</option>
                                    <option value="2nd Grade">2nd</option>
                                    <option value="3rd Grade">3rd</option>
                                    <option value="4th Grade">4th</option>
                                    <option value="5th Grade">5th</option>
                                    <option value="Middle School">Middle Sch.</option>
                                    <option value="High School">High Sch.</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Type</label>
                            <div className="flex flex-wrap gap-2">
                                {['HOOK', 'FACT', 'JOKE', 'DISCUSSION', 'TRIVIA'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => updateData({ type: t })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${type === t ? 'bg-yellow-100 text-yellow-800 border-yellow-200 border' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && <div className="text-xs text-red-500 bg-red-50 p-2 rounded-lg border border-red-100 whitespace-pre-wrap">{error}</div>}

                        <button
                            onClick={generateContent}
                            disabled={!topic || isLoading}
                            className="mt-2 w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-xl transition-all shadow-lg shadow-yellow-100 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                            {isLoading ? 'Generating...' : 'Spark It!'}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-medium text-lg leading-relaxed overflow-y-auto shadow-inner relative group">
                            {result}
                            <button
                                onClick={() => navigator.clipboard.writeText(result)}
                                className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur rounded-lg text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                title="Copy"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => updateData({ result: '' })}
                                className="flex-1 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors text-xs"
                            >
                                Back
                            </button>
                            <button
                                onClick={generateContent}
                                className="flex-1 py-2 bg-yellow-100 text-yellow-700 font-bold rounded-lg hover:bg-yellow-200 transition-colors text-xs flex items-center justify-center gap-1"
                            >
                                <RefreshCw size={14} /> Remix
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SparkWidget;
