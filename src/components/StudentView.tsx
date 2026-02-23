import React, { useState, useEffect } from 'react';
import { Share2, Check } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const StudentView = () => {
    const [name, setName] = useState(() => localStorage.getItem('homeroom_student_name') || '');
    const [answer, setAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [config, setConfig] = useState({ type: 'text', question: '', options: [], isActive: false });

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session');

    useEffect(() => {
        if (!supabase || !sessionId) return;
        const channel = supabase.channel(`exit_ticket:${sessionId}`);

        channel.on('broadcast', { event: 'config' }, (payload) => {
            setConfig(payload.payload);
        }).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    const triggerSubmit = async (selectedAnswer: string) => {
        if (!name.trim()) {
            setError("Please enter your name first!");
            return;
        }

        localStorage.setItem('homeroom_student_name', name.trim());

        if (!supabase) {
            setError("Connection error. Please refresh.");
            return;
        }

        const channel = supabase.channel(`exit_ticket:${sessionId}`);
        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({
                    type: 'broadcast',
                    event: 'answer',
                    payload: { name: name.trim(), answer: selectedAnswer, timestamp: Date.now() }
                });
                setSubmitted(true);
                channel.unsubscribe();
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!answer.trim()) {
            setError("Please provide an answer.");
            return;
        }
        await triggerSubmit(answer.trim());
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Sent!</h2>
                    <p className="text-slate-500">Your answer has been submitted to the teacher.</p>
                    <button onClick={() => setSubmitted(false)} className="mt-6 text-indigo-600 font-bold text-sm hover:underline">Submit another?</button>
                </div>
            </div>
        );
    }

    if (!config.isActive && config.question === '') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
                <div className="max-w-xs">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Share2 size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Waiting for teacher...</h2>
                    <p className="text-slate-500 text-sm">The session hasn't started yet, or the teacher is setting things up.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
                <h1 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Share2 className="text-indigo-600" /> Exit Ticket
                </h1>

                {config.question && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
                        <p className="text-indigo-900 font-bold">{config.question}</p>
                    </div>
                )}

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            placeholder="Student Name"
                            required
                        />
                    </div>

                    {config.type === 'mc' ? (
                        <div className="grid grid-cols-1 gap-2">
                            <label className="block text-sm font-medium text-slate-700">Choose an Answer</label>
                            {config.options?.map((opt: string, i: number) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        setAnswer(opt);
                                        if (name.trim()) triggerSubmit(opt);
                                        else setError("Please enter your name first!");
                                    }}
                                    className={`w-full p-4 text-left border-2 rounded-xl transition-all font-bold flex items-center gap-3 ${answer === opt ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'}`}
                                >
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs space-x-0 ${answer === opt ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        {String.fromCharCode(65 + i)}
                                    </span>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Your Answer</label>
                                <textarea
                                    value={answer}
                                    onChange={e => setAnswer(e.target.value)}
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[120px]"
                                    placeholder="Type your answer here..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-200 mt-2"
                            >
                                Submit Answer
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentView;
