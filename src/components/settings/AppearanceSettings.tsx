import React, { useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, Clock as ClockIcon, Moon, Sun, Check, Palette } from 'lucide-react';
import { CLOCK_STYLES, THEME_COLORS } from '../../constants';

const AppearanceSettings = ({ 
    backgrounds, 
    currentBackground, 
    onSelectBackground, 
    onUploadBackground, 
    onDeleteBackground, 
    showGrid, 
    setShowGrid, 
    clockStyle, 
    setClockStyle, 
    textColor, 
    setTextColor,
    // Pro Props
    showClockDate,
    setShowClockDate,
    is24Hour,
    setIs24Hour,
    isGlassy,
    setIsGlassy,
    accentColor,
    setAccentColor
}) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                onUploadBackground(ev.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8">
            {/* Widget Aesthetic & Color */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 ${accentColor === 'rose' ? 'bg-rose-100 text-rose-600' : accentColor === 'blue' ? 'bg-blue-100 text-blue-600' : accentColor === 'purple' ? 'bg-purple-100 text-purple-600' : accentColor === 'emerald' ? 'bg-emerald-100 text-emerald-600' : accentColor === 'amber' ? 'bg-amber-100 text-amber-600' : accentColor === 'slate' ? 'bg-slate-200 text-slate-700' : 'bg-indigo-100 text-indigo-600'} rounded-lg`}><Palette size={18} /></div>
                    <div className="font-bold text-sm text-slate-800">Global Accent Color</div>
                </div>
                <div className="flex flex-wrap gap-3">
                    {Object.entries(THEME_COLORS).map(([id, colors]: [string, any]) => (
                        <button
                            key={id}
                            onClick={() => setAccentColor(id)}
                            className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${accentColor === id ? 'border-slate-800 ring-2 ring-slate-200' : 'border-white shadow-sm'}`}
                            style={{ backgroundColor: colors[600] }}
                            title={id.charAt(0).toUpperCase() + id.slice(1)}
                        >
                            {accentColor === id && <Check size={18} className="text-white" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Layout Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`flex items-center justify-between ${accentColor === 'rose' ? 'bg-rose-50/50 border-rose-100/50' : accentColor === 'blue' ? 'bg-blue-50/50 border-blue-100/50' : accentColor === 'purple' ? 'bg-purple-50/50 border-purple-100/50' : accentColor === 'emerald' ? 'bg-emerald-50/50 border-emerald-100/50' : accentColor === 'amber' ? 'bg-amber-50/50 border-amber-100/50' : 'bg-indigo-50/50 border-indigo-100/50'} p-4 rounded-xl border`}>
                    <label className="font-bold text-slate-700 flex items-center gap-2">
                        <div className="w-4 h-4 rounded border border-indigo-300 bg-white grid grid-cols-2 gap-0.5 p-0.5">
                            <div className="bg-indigo-400 rounded-sm" />
                            <div className="bg-indigo-400 rounded-sm" />
                            <div className="bg-indigo-400 rounded-sm" />
                            <div className="bg-indigo-400 rounded-sm" />
                        </div>
                        Snap to Grid
                    </label>
                    <div onClick={() => setShowGrid(!showGrid)} className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${showGrid ? (accentColor === 'rose' ? 'bg-rose-600' : accentColor === 'blue' ? 'bg-blue-600' : accentColor === 'purple' ? 'bg-purple-600' : accentColor === 'emerald' ? 'bg-emerald-600' : accentColor === 'amber' ? 'bg-amber-600' : accentColor === 'slate' ? 'bg-slate-600' : 'bg-indigo-600') : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${showGrid ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                </div>

                <div className={`flex items-center justify-between ${accentColor === 'rose' ? 'bg-rose-50/50 border-rose-100/50' : accentColor === 'blue' ? 'bg-blue-50/50 border-blue-100/50' : accentColor === 'purple' ? 'bg-purple-50/50 border-purple-100/50' : accentColor === 'emerald' ? 'bg-emerald-50/50 border-emerald-100/50' : accentColor === 'amber' ? 'bg-amber-50/50 border-amber-100/50' : 'bg-indigo-50/50 border-indigo-100/50'} p-4 rounded-xl border`}>
                    <label className="font-bold text-slate-700 flex items-center gap-2">
                        {textColor === 'text-white' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-slate-600" />}
                        Theme Mode
                    </label>
                    <div className="flex gap-1 bg-white/50 p-1 rounded-lg border border-indigo-100 shadow-sm">
                        <button
                            onClick={() => setTextColor('text-slate-800')}
                            className={`p-1.5 rounded-md transition-all ${textColor !== 'text-white' ? 'bg-white shadow text-orange-500' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Dark Text Mode"
                        >
                            <Moon size={14} />
                        </button>
                        <button
                            onClick={() => setTextColor('text-white')}
                            className={`p-1.5 rounded-md transition-all ${textColor === 'text-white' ? 'bg-slate-700 shadow text-yellow-300' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Light Text Mode"
                        >
                            <Sun size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Clock Advanced Settings */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><ClockIcon size={18} /> Clock Customization</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowClockDate(!showClockDate)}>
                            <span className="text-xs font-bold text-slate-600">Show Date</span>
                            <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${showClockDate ? (accentColor === 'rose' ? 'bg-rose-600' : accentColor === 'blue' ? 'bg-blue-600' : accentColor === 'purple' ? 'bg-purple-600' : accentColor === 'emerald' ? 'bg-emerald-600' : accentColor === 'amber' ? 'bg-amber-600' : accentColor === 'slate' ? 'bg-slate-600' : 'bg-indigo-600') : 'bg-gray-300'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${showClockDate ? 'translate-x-4' : ''}`} />
                            </div>
                        </div>
                        <div className="w-px h-6 bg-slate-200" />
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIs24Hour(!is24Hour)}>
                            <span className="text-xs font-bold text-slate-600">24h Mode</span>
                            <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${is24Hour ? (accentColor === 'rose' ? 'bg-rose-600' : accentColor === 'blue' ? 'bg-blue-600' : accentColor === 'purple' ? 'bg-purple-600' : accentColor === 'emerald' ? 'bg-emerald-600' : accentColor === 'amber' ? 'bg-amber-600' : accentColor === 'slate' ? 'bg-slate-600' : 'bg-indigo-600') : 'bg-gray-300'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${is24Hour ? 'translate-x-4' : ''}`} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex bg-white/80 backdrop-blur rounded-xl p-1 gap-1 border border-slate-200 w-full max-w-xs mx-auto">
                    <button onClick={() => setIsGlassy('solid')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${isGlassy === 'solid' ? (accentColor === 'rose' ? 'bg-rose-600' : accentColor === 'blue' ? 'bg-blue-600' : accentColor === 'purple' ? 'bg-purple-600' : accentColor === 'emerald' ? 'bg-emerald-600' : accentColor === 'amber' ? 'bg-amber-600' : accentColor === 'slate' ? 'bg-slate-600' : 'bg-indigo-600') + ' text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>Solid</button>
                    <button onClick={() => setIsGlassy('glass')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${isGlassy === 'glass' ? (accentColor === 'rose' ? 'bg-rose-600' : accentColor === 'blue' ? 'bg-blue-600' : accentColor === 'purple' ? 'bg-purple-600' : accentColor === 'emerald' ? 'bg-emerald-600' : accentColor === 'amber' ? 'bg-amber-600' : accentColor === 'slate' ? 'bg-slate-600' : 'bg-indigo-600') + ' text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>Glassy</button>
                    <button onClick={() => setIsGlassy('clear')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${isGlassy === 'clear' ? (accentColor === 'rose' ? 'bg-rose-600' : accentColor === 'blue' ? 'bg-blue-600' : accentColor === 'purple' ? 'bg-purple-600' : accentColor === 'emerald' ? 'bg-emerald-600' : accentColor === 'amber' ? 'bg-amber-600' : accentColor === 'slate' ? 'bg-slate-600' : 'bg-indigo-600') + ' text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>Minimal</button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                    {CLOCK_STYLES.map(style => (
                        <div
                            key={style.id}
                            onClick={() => setClockStyle(style.id)}
                            className={`
                                cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all hover:bg-white
                                ${clockStyle === style.id ? (accentColor === 'rose' ? 'border-rose-600 text-rose-700 ring-rose-100' : accentColor === 'blue' ? 'border-blue-600 text-blue-700 ring-blue-100' : accentColor === 'purple' ? 'border-purple-600 text-purple-700 ring-purple-100' : accentColor === 'emerald' ? 'border-emerald-600 text-emerald-700 ring-emerald-100' : accentColor === 'amber' ? 'border-amber-600 text-amber-700 ring-amber-100' : accentColor === 'slate' ? 'border-slate-600 text-slate-700 ring-slate-100' : 'border-indigo-600 text-indigo-700 ring-indigo-100') + ' bg-white ring-2' : 'border-slate-200 bg-white/50 text-slate-600 hover:border-slate-300'}
                            `}
                        >
                            <div className={`text-xl font-bold opacity-80 whitespace-pre-line text-center ${isGlassy === 'clear' ? 'font-light' : ''} ${accentColor === 'rose' ? 'text-rose-700' : accentColor === 'blue' ? 'text-blue-700' : accentColor === 'purple' ? 'text-purple-700' : accentColor === 'emerald' ? 'text-emerald-700' : accentColor === 'amber' ? 'text-amber-700' : accentColor === 'slate' ? 'text-slate-700' : 'text-indigo-700'}`}>{style.preview}</div>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{style.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background Selector */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><ImageIcon size={18} /> Environment Background</h3>
                    <button onClick={() => fileInputRef.current.click()} className={`text-xs font-bold ${accentColor === 'rose' ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' : accentColor === 'blue' ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' : accentColor === 'purple' ? 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100' : accentColor === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : accentColor === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'} px-3 py-2 rounded-lg border flex items-center gap-2 transition-colors`}>
                        <UploadCloud size={14} /> Custom Image
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {backgrounds.map(bg => (
                        <div
                            key={bg.id}
                            onClick={() => onSelectBackground(bg)}
                            className={`relative group aspect-video rounded-2xl overflow-hidden cursor-pointer border-2 transition-all shadow-sm hover:shadow-md ${currentBackground.id === bg.id ? (accentColor === 'rose' ? 'border-rose-600 ring-rose-50' : accentColor === 'blue' ? 'border-blue-600 ring-blue-50' : accentColor === 'purple' ? 'border-purple-600 ring-purple-50' : accentColor === 'emerald' ? 'border-emerald-600 ring-emerald-50' : accentColor === 'amber' ? 'border-amber-600 ring-amber-50' : accentColor === 'slate' ? 'border-slate-600 ring-slate-50' : 'border-indigo-600 ring-indigo-50') + ' ring-4' : 'border-transparent hover:border-slate-200'}`}
                        >
                            <div className={`w-full h-full ${bg.type === 'image' ? 'bg-cover bg-center' : bg.preview}`} style={bg.type === 'image' ? { backgroundImage: `url(${bg.src})` } : {}} />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            {currentBackground.id === bg.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                                    <div className="bg-white rounded-full p-2 shadow-xl animate-in zoom-in duration-300">
                                        <div className={`w-4 h-4 ${accentColor === 'rose' ? 'bg-rose-600' : accentColor === 'blue' ? 'bg-blue-600' : accentColor === 'purple' ? 'bg-purple-600' : accentColor === 'emerald' ? 'bg-emerald-600' : accentColor === 'amber' ? 'bg-amber-600' : accentColor === 'slate' ? 'bg-slate-600' : 'bg-indigo-600'} rounded-full`} />
                                    </div>
                                </div>
                            )}
                            {bg.type === 'custom' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Delete this background?')) {
                                            onDeleteBackground(bg.id);
                                        }
                                    }}
                                    className="absolute top-2 right-2 bg-white/90 text-red-500 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 shadow-lg border border-red-100"
                                    title="Delete Custom Background"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6">
                                <span className="text-white text-[11px] font-bold tracking-wide uppercase shadow-sm">{bg.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AppearanceSettings;
