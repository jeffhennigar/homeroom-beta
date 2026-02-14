import React, { useState, useEffect } from 'react';
import { saveRoster, getRoster } from '../services/storage';
import { Save, X, RotateCcw } from 'lucide-react';
import { DEFAULT_NAMES } from '../constants';

import { Student } from '../types';

interface RosterManagerProps {
    onClose: () => void;
    onSave?: (roster: Student[]) => void;
}

const RosterManager: React.FC<RosterManagerProps> = ({ onClose, onSave }) => {
    const [input, setInput] = useState('');
    const [students, setStudents] = useState<any[]>([]); // Keep track of existing student objects

    useEffect(() => {
        const current = getRoster() || [];
        setStudents(current);
        setInput(current.map(s => s.name).join('\n'));
    }, []);

    const handleSave = () => {
        const names = input
            .split('\n')
            .map(n => n.trim())
            .filter(n => n.length > 0);

        if (names.length === 0) return;

        // Map names to students, preserving existing IDs/state if name matches
        const newRoster = names.map(name => {
            const existing = students.find(s => s.name === name);
            return existing ? existing : { id: Math.random().toString(36).substr(2, 9), name, active: true };
        });

        saveRoster(newRoster);
        if (onSave) onSave(newRoster);
        onClose();
    };

    const handleReset = () => {
        if (confirm("Reset to demo names? This will overwrite your list.")) {
            setInput(DEFAULT_NAMES.join('\n'));
        }
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">Class Roster</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-end mb-2">
                        <label className="block text-sm font-bold text-gray-700">
                            Edit Names
                        </label>
                        <button onClick={handleReset} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                            <RotateCcw size={12} /> Reset to Defaults
                        </button>
                    </div>

                    <textarea
                        className="w-full flex-1 min-h-[300px] p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all resize-none font-mono text-sm leading-relaxed"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <p className="text-xs text-gray-400 mt-2">
                        Changes here will update the default list for <strong>new</strong> widgets. Existing widgets won't change.
                    </p>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow transition-all flex items-center gap-2"
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RosterManager;
