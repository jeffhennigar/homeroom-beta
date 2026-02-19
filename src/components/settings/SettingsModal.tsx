import React, { useState } from 'react';
import { User, Users, ImageIcon, Calendar, Download, Info, Mail, X, Upload, Save, Check, RefreshCw, Trash2, Plus, PenSquare, Copy, Edit3, Cloud, Terminal, Shield, Lock, Bell, Clock } from 'lucide-react';
import AppearanceSettings from './AppearanceSettings';
import TimePicker from '../TimePicker';
import { SCHEDULE_EMOJIS } from '../../constants';

import { dataService } from '../../services/dataService';
import { supabase } from '../../services/supabaseClient';

const SettingsModal = ({ isOpen, onClose, user, onSignOut, onSignIn, isSyncing, roster, setRoster, backgrounds, currentBackground, setBackground, onUploadBackground, onDeleteBackground, showGrid, setShowGrid, allRosters, setAllRosters, activeRosterId, setActiveRosterId, activeScheduleDays, saveScheduleTemplate, clockStyle, setClockStyle, lastSyncError, cloudSyncEnabled, setCloudSyncEnabled, widgets, setWidgets, textColor, setTextColor }) => {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState('roster');
    const [importText, setImportText] = useState("");
    const [feedback, setFeedback] = useState("");
    const [editingRosterId, setEditingRosterId] = useState(null);
    const [newRosterName, setNewRosterName] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [rosterToDelete, setRosterToDelete] = useState<string | null>(null);

    // Schedule State (Local)
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [settingsEmojiPickerIndex, setSettingsEmojiPickerIndex] = useState(null);
    const [settingsTimePickerIndex, setSettingsTimePickerIndex] = useState(null);
    const [showCopyMenu, setShowCopyMenu] = useState(false);
    const [copyStatus, setCopyStatus] = useState('');
    const [copyTargetDays, setCopyTargetDays] = useState([]);

    const copyScheduleDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].filter(d => d !== selectedDay);
    const [timePickerTrigger, setTimePickerTrigger] = useState(null);

    // Debug
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [testResult, setTestResult] = useState<string | null>(null);

    const tabs = [
        { id: 'roster', label: 'Roster', icon: <Users size={16} /> },
        { id: 'appearance', label: 'Appearance', icon: <ImageIcon size={16} /> },
        { id: 'schedule', label: 'Schedule', icon: <Calendar size={16} /> },
        { id: 'data', label: 'Account', icon: <User size={16} /> },
        { id: 'debug', label: 'Debug', icon: <Terminal size={16} /> },
        { id: 'about', label: 'About', icon: <Info size={16} /> },
        { id: 'feedback', label: 'Feedback', icon: <Mail size={16} /> }
    ];

    // Roster Management
    const createNewRoster = () => {
        const newId = Date.now().toString();
        const newRoster = { id: newId, name: "New Class", roster: [] }; // Default empty
        setAllRosters([...allRosters, newRoster]);
        setActiveRosterId(newId);
        setRoster([]); // Clear current
    };

    const deleteRoster = (id: string) => {
        if (allRosters.length === 1) return alert("Cannot delete the only roster.");
        const newRosters = allRosters.filter(r => r.id !== id);

        if (activeRosterId === id) {
            const nextRoster = newRosters[0];
            setActiveRosterId(nextRoster.id);
            setRoster(nextRoster.roster || []);
            try {
                localStorage.setItem('homeroom_active_roster_id', nextRoster.id);
            } catch (e) { console.error('Failed to save active roster ID:', e); }
        }

        setAllRosters(newRosters);

        // Immediate persistence for critical deletion
        try {
            localStorage.setItem('homeroom_all_rosters', JSON.stringify(newRosters));
        } catch (err) {
            console.error('Critical Save Error (Deletion):', err);
        }

        setShowDeleteConfirm(false);
        setRosterToDelete(null);
    };

    const renameRoster = (id, newName) => {
        setAllRosters(allRosters.map(r => r.id === id ? { ...r, name: newName } : r));
        setEditingRosterId(null);
    };

    const updateCurrentRosterData = (text) => {
        const names = text.split('\n').filter(n => n.trim());
        const newRosterObj = names.map(n => ({ id: Math.random().toString(36).substr(2, 9), name: n.trim(), active: true }));
        setRoster(newRosterObj);
        // Also update in allRosters immediately
        setAllRosters(allRosters.map(r => r.id === activeRosterId ? { ...r, roster: newRosterObj } : r));
    };

    // Schedule Management
    const handleBatchCopy = () => {
        if (copyTargetDays.length === 0) return;
        const sourceItems = activeScheduleDays[selectedDay] || [];
        const newTemplate = { ...activeScheduleDays };
        copyTargetDays.forEach(day => {
            newTemplate[day] = JSON.parse(JSON.stringify(sourceItems));
        });
        saveScheduleTemplate(newTemplate);
        setCopyStatus(`Copied to ${copyTargetDays.length} days!`);
        setTimeout(() => setCopyStatus(''), 2000);
        setShowCopyMenu(false);
        setCopyTargetDays([]);
    };

    const toggleCopyDay = (day) => {
        setCopyTargetDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };

    const addScheduleItem = (day) => {
        const newItem = { id: Date.now().toString(), time: '09:00', emoji: '📚', title: 'New Activity', description: '' };
        const updated = { ...activeScheduleDays, [day]: [...(activeScheduleDays[day] || []), newItem] };
        saveScheduleTemplate(updated);
    };

    const updateScheduleItem = (day, index, field, value) => {
        const items = [...(activeScheduleDays[day] || [])];
        items[index] = { ...items[index], [field]: value };
        saveScheduleTemplate({ ...activeScheduleDays, [day]: items });
    };

    const removeScheduleItem = (day, index) => {
        const items = activeScheduleDays[day].filter((_, i) => i !== index);
        saveScheduleTemplate({ ...activeScheduleDays, [day]: items });
    };

    // Import/Export
    const handleImport = () => {
        try {
            const data = JSON.parse(importText);
            if (data.roster) setRoster(data.roster);
            if (data.background) setBackground(data.background);
            if (data.background) setBackground(data.background);
            if (data.scheduleTemplate) saveScheduleTemplate(data.scheduleTemplate);
            if (data.widgets && setWidgets) setWidgets(data.widgets);
            // Basic validation would go here
            alert("Data imported successfully!");
        } catch (e) {
            alert("Invalid JSON");
        }
    };

    const handleExport = () => {
        const data = {
            roster,
            background: currentBackground,
            scheduleTemplate: activeScheduleDays,
            widgets,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'homeroompro_backup.json';
        a.click();
    };

    const runConnectionTest = async () => {
        if (!user) { setTestStatus('error'); setTestResult("Not logged in."); return; }
        setTestStatus('testing');
        setTestResult(null);
        try {
            const res = await dataService.testConnection(user.id);
            if (res.success) {
                setTestStatus('success');
                setTestResult("Read/Write test passed successfully.");
            } else {
                setTestStatus('error');
                setTestResult(res.error || "Unknown error during test.");
            }
        } catch (e: any) {
            setTestStatus('error');
            setTestResult(e.message || "Exception during test.");
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'roster':
                return (
                    <div className="space-y-6">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-indigo-900">Class Management</h3>
                                <p className="text-xs text-indigo-600 mt-1">Select which class feeds your student tools (Randomizer, Group Maker, etc.)</p>
                            </div>
                            <button onClick={createNewRoster} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center gap-1"><Plus size={14} /> New Class</button>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {allRosters.map(r => (
                                <div key={r.id} onClick={() => { setActiveRosterId(r.id); setRoster(r.roster || []); }} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer min-w-[120px] justify-between group ${activeRosterId === r.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                                    {editingRosterId === r.id ? (
                                        <input autoFocus className="bg-white text-black text-xs px-1 py-0.5 rounded w-20 outline-none" value={newRosterName} onChange={e => setNewRosterName(e.target.value)} onKeyDown={e => e.key === 'Enter' && renameRoster(r.id, newRosterName)} onBlur={() => renameRoster(r.id, newRosterName)} />
                                    ) : (
                                        <span className="font-bold text-xs truncate">{r.name}</span>
                                    )}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); setEditingRosterId(r.id); setNewRosterName(r.name); }} className="hover:text-indigo-200"><PenSquare size={12} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); setRosterToDelete(r.id); setShowDeleteConfirm(true); }} className="hover:text-red-300"><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-bold text-slate-700">Current Class Students ({roster.length})</label>
                                <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
                                    <button
                                        onClick={() => setActiveTab('roster-list')}
                                        className={`px-2 py-1 text-xs font-bold rounded ${activeTab === 'roster-list' || activeTab === 'roster' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
                                    >
                                        List
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('roster-bulk')}
                                        className={`px-2 py-1 text-xs font-bold rounded ${activeTab === 'roster-bulk' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
                                    >
                                        Bulk Add
                                    </button>
                                </div>
                            </div>

                            {(activeTab === 'roster-list' || activeTab === 'roster') ? (
                                <div className="border border-slate-200 rounded-xl bg-slate-50 max-h-48 overflow-y-auto custom-scrollbar">
                                    {roster.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-sm">No students yet. Click Bulk Add to add your class.</div>
                                    ) : (
                                        roster.map((student, idx) => (
                                            <div key={student.id} className="flex items-center justify-between px-3 py-2 hover:bg-white border-b border-slate-100 last:border-b-0 group">
                                                <span className="text-sm text-gray-700">{student.name}</span>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`Remove "${student.name}" from this roster?`)) {
                                                            const newRoster = roster.filter((_, i) => i !== idx);
                                                            setRoster(newRoster);
                                                            setAllRosters(allRosters.map(r => r.id === activeRosterId ? { ...r, roster: newRoster } : r));
                                                        }
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                                    title="Remove student"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <textarea
                                    className="w-full h-48 p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono resize-none bg-slate-50"
                                    placeholder="Paste student names here (one per line)..."
                                    defaultValue={roster.map(s => s.name).join('\n')}
                                    onBlur={(e) => updateCurrentRosterData(e.target.value)}
                                />
                            )}
                            <p className="text-xs text-slate-400">
                                {(activeTab === 'roster-list' || activeTab === 'roster')
                                    ? 'Hover over a student to remove them.'
                                    : 'Updates roster automatically on blur.'}
                            </p>
                        </div>
                    </div>
                );
            case 'appearance':
                return (
                    <AppearanceSettings
                        backgrounds={backgrounds}
                        currentBackground={currentBackground}
                        onSelectBackground={setBackground}
                        onUploadBackground={onUploadBackground}
                        onDeleteBackground={onDeleteBackground}
                        showGrid={showGrid}
                        setShowGrid={setShowGrid}
                        clockStyle={clockStyle}
                        setClockStyle={setClockStyle}
                        textColor={textColor}
                        setTextColor={setTextColor}
                    />
                );
            case 'schedule':
                return (
                    <div className="p-4">
                        <p className="text-gray-600 text-sm mb-4">Set up your weekly schedule template. Each day's activities will load automatically when you open the Schedule widget.</p>

                        {/* Day Selector */}
                        <div className="flex gap-2 mb-4 items-start">
                            <div className="flex-1 flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDay(day)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${selectedDay === day ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {day.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                            <div className="relative shrink-0 pt-0.5">
                                <button onClick={() => setShowCopyMenu(!showCopyMenu)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center gap-1"><Copy size={12} /> Copy...</button>
                                {showCopyMenu && (
                                    <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-48 overflow-hidden flex flex-col">
                                        <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase bg-gray-50 border-b">Copy {selectedDay} to:</div>
                                        <div className="max-h-48 overflow-y-auto custom-scrollbar p-1">
                                            {copyScheduleDays.map(d => (
                                                <label key={d} className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs hover:bg-blue-50 text-gray-700 font-medium rounded cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={copyTargetDays.includes(d)}
                                                        onChange={() => toggleCopyDay(d)}
                                                        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    {d}
                                                </label>
                                            ))}
                                        </div>
                                        <div className="p-2 border-t bg-gray-50">
                                            <button
                                                onClick={handleBatchCopy}
                                                disabled={copyTargetDays.length === 0}
                                                className="w-full bg-blue-600 text-white rounded py-1 text-xs font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Copy ({copyTargetDays.length})
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {copyStatus && <span className="text-xs text-green-600 font-bold block mb-2 animate-pulse">{copyStatus}</span>}

                        {/* Activities for selected day */}
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {(activeScheduleDays[selectedDay] || []).map((item, index) => (
                                <div key={item.id} className="relative flex gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex flex-col items-center shrink-0 w-20 relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTimePickerTrigger(e.currentTarget);
                                                setSettingsTimePickerIndex(settingsTimePickerIndex === index ? null : index);
                                            }}
                                            className="w-full text-xs font-bold text-indigo-600 bg-white border border-indigo-100 px-1 py-1 rounded hover:bg-indigo-50"
                                        >
                                            {(() => {
                                                const [h, m] = (item.time || '09:00').split(':');
                                                const hours = parseInt(h);
                                                const ampm = hours >= 12 ? 'PM' : 'AM';
                                                const displayH = hours % 12 || 12;
                                                return `${displayH}:${m} ${ampm}`;
                                            })()}
                                        </button>
                                        {settingsTimePickerIndex === index && (
                                            <TimePicker
                                                triggerRef={{ current: timePickerTrigger }}
                                                time={item.time || '09:00'}
                                                onChange={(t) => updateScheduleItem(selectedDay, index, 'time', t)}
                                                onClose={() => { setSettingsTimePickerIndex(null); setTimePickerTrigger(null); }}
                                            />
                                        )}
                                    </div>
                                    <div className="relative">
                                        <div
                                            className="text-lg cursor-pointer hover:scale-110 transition-transform p-1 rounded hover:bg-gray-200 emoji"
                                            onClick={() => setSettingsEmojiPickerIndex(settingsEmojiPickerIndex === index ? null : index)}
                                        >
                                            {item.emoji || '📚'}
                                        </div>
                                        {settingsEmojiPickerIndex === index && (
                                            <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-2 w-48 max-h-40 overflow-y-auto custom-scrollbar">
                                                <div className="grid grid-cols-5 gap-1">
                                                    {SCHEDULE_EMOJIS.map((emoji, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => { updateScheduleItem(selectedDay, index, 'emoji', emoji); setSettingsEmojiPickerIndex(null); }}
                                                            className={`text-xl p-1.5 rounded-lg hover:bg-indigo-100 transition-colors emoji ${item.emoji === emoji ? 'bg-indigo-200 ring-2 ring-indigo-400' : ''}`}
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <input
                                            type="text"
                                            value={item.title || ''}
                                            onChange={(e) => updateScheduleItem(selectedDay, index, 'title', e.target.value)}
                                            className="w-full text-sm font-bold bg-transparent border-none outline-none"
                                            placeholder="Activity name"
                                        />
                                        <input
                                            type="text"
                                            value={item.description || ''}
                                            onChange={(e) => updateScheduleItem(selectedDay, index, 'description', e.target.value)}
                                            className="w-full text-xs text-gray-500 bg-transparent border-none outline-none"
                                            placeholder="Description (optional)"
                                        />
                                    </div>
                                    <button onClick={() => removeScheduleItem(selectedDay, index)} className="p-1 text-red-400 hover:text-red-600 self-center"><X size={14} /></button>
                                </div>
                            ))}
                            {(activeScheduleDays[selectedDay] || []).length === 0 && (
                                <div className="text-center py-4 text-gray-400 text-sm">No activities for {selectedDay}</div>
                            )}
                        </div>

                        <div className="flex gap-2 mt-3">
                            <button onClick={() => addScheduleItem(selectedDay)} className="flex-1 py-2 bg-indigo-100 text-indigo-700 font-bold text-sm rounded-lg hover:bg-indigo-200 flex items-center justify-center gap-1">
                                <Plus size={16} /> Add Activity
                            </button>
                        </div>
                    </div>
                );
            case 'data':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Account Details Card */}
                        {user ? (
                            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="shrink-0">
                                        <div className="w-14 h-14 rounded-full bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                            <User size={28} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Signed in as</div>
                                        <h3 className="text-xl font-bold text-slate-800 truncate">{user.email}</h3>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (!user?.email) return;
                                            try {
                                                const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                                                    redirectTo: window.location.origin,
                                                });
                                                if (error) throw error;
                                                alert('Password reset email sent! Please check your inbox.');
                                            } catch (e: any) {
                                                alert('Error: ' + e.message);
                                            }
                                        }}
                                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95"
                                    >
                                        <Lock size={14} /> Change Password
                                    </button>
                                </div>

                                <div className="h-px bg-slate-200/50 w-full mb-6" />

                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700">Cloud Sync Active</span>
                                        <span className="text-xs text-slate-500">Your data is being backed up to the cloud</span>
                                    </div>
                                    <div
                                        className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 ${(!user) ? 'bg-gray-200 cursor-not-allowed' : (cloudSyncEnabled ? 'bg-[#5c56d6]' : 'bg-slate-300')}`}
                                        onClick={() => user && setCloudSyncEnabled(!cloudSyncEnabled)}
                                        title={user ? (cloudSyncEnabled ? "Cloud sync is ON" : "Cloud sync is OFF") : "Sign in to enable cloud sync"}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${cloudSyncEnabled && user ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#f5f7ff] border border-[#e0e7ff] rounded-[2rem] p-8 shadow-sm flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#5c56d6] shadow-sm mb-4 border border-indigo-100">
                                    <Cloud size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-[#2d3261] mb-2 tracking-tight">Cloud Sync Available</h3>
                                <p className="text-[#5b638f] leading-relaxed text-[15px] max-w-sm mb-6">
                                    Sign in to securely sync your classroom data across all your devices. Never lose your rosters again.
                                </p>
                                <button
                                    onClick={onSignIn}
                                    className="px-8 py-4 bg-[#5c56d6] text-white font-bold text-lg rounded-2xl hover:bg-[#4a44b8] transition-all flex items-center gap-3 shadow-xl shadow-indigo-200/50 active:scale-95"
                                >
                                    <Cloud size={24} /> Sign In to Sync
                                </button>
                            </div>
                        )}

                        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 flex items-center gap-4">
                            <div className="bg-white p-2 rounded-xl shadow-sm text-indigo-500">
                                <Shield size={24} />
                            </div>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                Your privacy and data security are our top priorities. Feel free to store all your data strictly locally on this device, or use our cloud storage to sync across all your classrooms.
                            </p>
                        </div>

                        {/* Export/Import Section */}
                        <div className="pt-2">
                            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1 mb-4">Manual Backup</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={handleExport}
                                    className="flex flex-col items-center gap-3 p-6 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50 rounded-3xl transition-all group"
                                >
                                    <div className="p-3 bg-green-500 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform"><Download size={24} /></div>
                                    <div className="text-center">
                                        <div className="font-bold text-slate-800">Export File</div>
                                        <div className="text-[10px] font-black uppercase text-slate-400 leading-tight">Save Download</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => {
                                        const val = prompt("Paste your backup JSON here:");
                                        if (val) {
                                            try {
                                                const data = JSON.parse(val);
                                                if (data.roster) setRoster(data.roster);
                                                if (data.background) setBackground(data.background);
                                                if (data.background) setBackground(data.background);
                                                if (data.scheduleTemplate) saveScheduleTemplate(data.scheduleTemplate);
                                                if (data.widgets && setWidgets) setWidgets(data.widgets);
                                                alert("Data imported successfully!");
                                            } catch (e) {
                                                alert("Invalid JSON data.");
                                            }
                                        }
                                    }}
                                    className="flex flex-col items-center gap-3 p-6 bg-slate-800 hover:bg-slate-900 rounded-3xl transition-all group shadow-lg shadow-slate-200"
                                >
                                    <div className="p-3 bg-white/10 rounded-xl text-white group-hover:bg-white/20 transition-colors"><Upload size={24} /></div>
                                    <div className="text-center">
                                        <div className="font-bold text-white">Import File</div>
                                        <div className="text-[10px] font-black uppercase text-slate-400 leading-tight">Restore Data</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase justify-center mt-4">
                            <Shield size={14} className="text-indigo-400" />
                            Data privacy is our priority
                        </div>
                    </div>
                );
            case 'debug':
                return (
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-xl p-6 text-slate-300 font-mono text-xs overflow-hidden">
                            <h3 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
                                <Terminal size={16} /> System Status
                            </h3>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between">
                                    <span>User:</span>
                                    <span className="text-white">{user ? user.email : 'Not logged in'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sync Status:</span>
                                    <span className={isSyncing ? 'text-yellow-400' : 'text-green-400'}>{isSyncing ? 'Syncing...' : 'Idle'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Last Sync Error:</span>
                                    <span className={lastSyncError ? 'text-red-400 font-bold' : 'text-green-500'}>{lastSyncError || 'None'}</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-700 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-white">Connectivity Test</span>
                                    <button
                                        onClick={runConnectionTest}
                                        disabled={testStatus === 'testing' || !user}
                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs"
                                    >
                                        {testStatus === 'testing' ? 'Testing...' : 'Run Test'}
                                    </button>
                                </div>
                                <p className="text-slate-500 mb-2">
                                    Attemps to read and write a small timestamp to your profile in the database to verify permissions.
                                </p>
                                {testResult && (
                                    <div className={`p-3 rounded border ${testStatus === 'success' ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'}`}>
                                        {testResult}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'about':
                return (
                    <div className="text-center space-y-6 py-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl mx-auto shadow-xl flex items-center justify-center text-white font-black text-4xl mb-4 transform -rotate-3">H</div>
                        <h2 className="text-2xl font-black text-slate-800">HomeRoom</h2>
                        <p className="text-slate-500 max-w-md mx-auto">
                            The ultimate classroom dashboard for modern teachers. A tool by <span className="font-bold text-teal-600">EduLoop</span>.
                        </p>
                        <div className="flex justify-center gap-4 text-sm font-medium text-slate-400">
                            <span>Version 2.1.0</span>
                            <span>•</span>
                            <span>MIT License</span>
                        </div>
                    </div>
                );
            case 'feedback':
                return (
                    <div className="space-y-4">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <h3 className="font-bold text-indigo-900">Send Feedback</h3>
                            <p className="text-sm text-indigo-700">Found a bug? Have a request? Let us know!</p>
                        </div>
                        <textarea
                            className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            placeholder="Tell us what you think..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                        <button onClick={() => { alert("Thank you for your feedback!"); setFeedback(""); }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-colors">
                            Send Feedback
                        </button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl h-[600px] rounded-3xl shadow-2xl flex overflow-hidden ring-1 ring-black/5">
                {/* Sidebar */}
                <div className="w-64 bg-slate-50 border-r border-slate-100 flex flex-col p-4 shrink-0">
                    <div className="px-4 py-2 mb-6">
                        <h2 className="font-black text-2xl text-slate-800 tracking-tight">Settings</h2>
                    </div>
                    <div className="flex-1 space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${activeTab === tab.id
                                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-100'
                                    : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="p-4 text-xs text-center text-slate-300 font-medium">
                        HomeRoom 2026 by EduLoop
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    <div className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <h2 className="font-bold text-lg text-slate-800">{tabs.find(t => t.id === activeTab)?.label}</h2>
                            {user && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">
                                    <span className="text-xs font-bold truncate max-w-[150px]">{user.email}</span>
                                    <button
                                        onClick={() => {
                                            if (window.confirm("Sign out of HomeRoom?")) {
                                                onSignOut();
                                                onClose();
                                            }
                                        }}
                                        className="text-[10px] uppercase font-black hover:underline"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="max-w-2xl mx-auto">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Roster Confirmation Modal */}
            {showDeleteConfirm && rosterToDelete && (
                <div className="absolute inset-0 bg-black/50 z-[200] flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm mx-4 animate-in zoom-in-95 duration-200">
                        <div className="text-center mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Trash2 size={24} className="text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Delete Roster?</h3>
                            <p className="text-gray-500 text-sm mt-1">
                                This will permanently delete "{allRosters.find(r => r.id === rosterToDelete)?.name}" and all its students.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteConfirm(false); setRosterToDelete(null); }}
                                className="flex-1 px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteRoster(rosterToDelete)}
                                className="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsModal;
