import React, { useState } from 'react';
import { saveRoster } from '../services/storage';
import { Save } from 'lucide-react';
import { Student } from '../types';

interface OnboardingModalProps {
    onComplete: () => void;
    onSave?: (roster: Student[]) => void;
    onLogin?: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, onSave, onLogin }) => {
    const [input, setInput] = useState('');
    const [storagePreference, setStoragePreference] = useState<'local' | 'cloud'>('local');

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

                <div className="p-6 flex-1 flex flex-col space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Student Names (One per line)
                        </label>
                        <textarea
                            className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all resize-none text-lg"
                            placeholder={"Alice\nBob\nCharlie\n..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-slate-700">Data Storage Preference</span>
                            <div className="flex bg-slate-200 p-1 rounded-lg gap-1 relative w-32">
                                <div
                                    className="absolute bg-white shadow-sm rounded-md transition-all duration-300 ease-out z-0"
                                    style={{
                                        width: 'calc(50% - 4px)',
                                        height: 'calc(100% - 8px)',
                                        top: '4px',
                                        left: storagePreference === 'local' ? '4px' : 'calc(50%)'
                                    }}
                                />
                                <button
                                    onClick={() => setStoragePreference('local')}
                                    className={`text-[10px] font-bold px-2 py-1 rounded transition-all relative z-10 w-full ${storagePreference === 'local' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                                >Local</button>
                                <button
                                    onClick={() => setStoragePreference('cloud')}
                                    className={`text-[10px] font-bold px-2 py-1 rounded transition-all relative z-10 w-full ${storagePreference === 'cloud' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                                >Cloud</button>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed italic">
                            {storagePreference === 'cloud'
                                ? "Cloud storage automatically syncs your data across all devices. Requires a free account."
                                : "Local storage keeps your data strictly on this browser. No account needed."}
                            <br />
                            <span className="font-semibold text-blue-600">This can be changed anytime in the Account tab.</span>
                        </p>
                    </div>

                    {onLogin && (
                        <div className="text-center">
                            <button
                                onClick={onLogin}
                                className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center justify-center gap-1 mx-auto"
                            >
                                Already have an account? Sign In to Sync
                            </button>
                        </div>
                    )}
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
