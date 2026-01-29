import React, { useState } from 'react';
import { saveRoster } from '../services/storage';
import { Save } from 'lucide-react';
import { Student } from '../types';

interface OnboardingModalProps {
    onComplete: () => void;
    onSave?: (roster: Student[]) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, onSave }) => {
    const [input, setInput] = useState('');

    const handleSave = () => {
        const names = input
            .split('\n')
            .map(n => n.trim())
            .filter(n => n.length > 0);

        if (names.length === 0) return;

        const newRoster: Student[] = names.map(name => ({
            id: Math.random().toString(36).substr(2, 9),
            name,
            active: true
        }));

        saveRoster(newRoster);
        if (onSave) onSave(newRoster);
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 bg-blue-600 text-white">
                    <h2 className="text-2xl font-bold mb-2">Welcome to HomeRoom! 🍎</h2>
                    <p className="text-blue-100">
                        Let's get set up. Paste your class list below to create your permanent roster.
                    </p>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Student Names (One per line)
                    </label>
                    <textarea
                        className="w-full flex-1 min-h-[200px] p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all resize-none text-lg"
                        placeholder={"Alice\nBob\nCharlie\n..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={!input.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Save size={20} />
                        Save & Get Started
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
