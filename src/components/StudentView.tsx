import React, { useState, useEffect } from 'react';
import { Share2, Check } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const StudentView = () => {
    const [name, setName] = useState('');
    const [answer, setAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !answer.trim()) return;
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
                    payload: { name, answer, timestamp: Date.now() }
                });
                setSubmitted(true);
                channel.unsubscribe();
            }
        });
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

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-200"
                    >
                        Submit Answer
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentView;
