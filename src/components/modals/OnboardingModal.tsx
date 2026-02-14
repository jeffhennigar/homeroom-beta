import React, { useState } from 'react';
import { Save } from 'lucide-react';

const OnboardingModal = ({ onComplete, onSaveRoster }) => {
    const [text, setText] = useState("Student 1\nStudent 2\nStudent 3\nStudent 4\nStudent 5");

    const handleSave = () => {
        const names = text.split('\n').map(n => n.trim()).filter(n => n);
        if (names.length > 0) {
            const roster = names.map(n => ({ id: Math.random().toString(36).substr(2, 9), name: n, active: true }));
            onSaveRoster(roster);
        }
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <h2 className="text-2xl font-bold mb-2">Welcome to HomeRoom! 🍎</h2>
                    <p className="opacity-90 text-sm">Let's set up your class roster. You can change this anytime.</p>
                </div>
                <div className="p-6">
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700">Student Names (one per line)</label>
                        <textarea
                            value={text}
                            onChange={e => setText(e.target.value)}
                            className="w-full h-48 border-2 border-gray-200 rounded-xl p-4 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all custom-scrollbar resize-none font-medium text-slate-700"
                            placeholder="Paste names here..."
                        />
                    </div>
                </div>
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Save size={18} /> Save & Get Started
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
