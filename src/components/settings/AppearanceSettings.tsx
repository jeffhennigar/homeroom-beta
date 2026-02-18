import React, { useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, Clock as ClockIcon, Moon, Sun } from 'lucide-react';
import { CLOCK_STYLES } from '../../constants';

const AppearanceSettings = ({ backgrounds, currentBackground, onSelectBackground, onUploadBackground, onDeleteBackground, showGrid, setShowGrid, clockStyle, setClockStyle, textColor, setTextColor }) => {
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
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <label className="font-bold text-slate-700 flex items-center gap-2">
                        <div className="w-4 h-4 rounded border border-indigo-300 bg-white grid grid-cols-2 gap-0.5 p-0.5">
                            <div className="bg-indigo-400 rounded-sm" />
                            <div className="bg-indigo-400 rounded-sm" />
                            <div className="bg-indigo-400 rounded-sm" />
                            <div className="bg-indigo-400 rounded-sm" />
                        </div>
                        Show Alignment Grid
                    </label>
                    <div onClick={() => setShowGrid(!showGrid)} className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${showGrid ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${showGrid ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                </div>

                <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <label className="font-bold text-slate-700 flex items-center gap-2">
                        {textColor === 'text-white' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-slate-600" />}
                        Display Theme
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

            <div className="space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><ClockIcon size={18} /> Clock Style</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {CLOCK_STYLES.map(style => (
                        <div
                            key={style.id}
                            onClick={() => setClockStyle(style.id)}
                            className={`
                                cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all hover:bg-slate-50
                                ${clockStyle === style.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200 ring-offset-1' : 'border-slate-200 text-slate-600 hover:border-indigo-300'}
                            `}
                        >
                            <div className="text-xl font-bold opacity-80 whitespace-pre-line text-center">{style.preview}</div>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{style.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><ImageIcon size={18} /> Background</h3>
                    <button onClick={() => fileInputRef.current.click()} className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 border border-indigo-200 flex items-center gap-2 transition-colors">
                        <UploadCloud size={14} /> Upload Custom
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {backgrounds.map(bg => (
                        <div
                            key={bg.id}
                            onClick={() => onSelectBackground(bg)}
                            className={`relative group aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all shadow-sm hover:shadow-md ${currentBackground.id === bg.id ? 'border-indigo-600 ring-2 ring-indigo-200 ring-offset-2' : 'border-transparent hover:border-indigo-300'}`}
                        >
                            <div className={`w-full h-full ${bg.type === 'image' ? 'bg-cover bg-center' : bg.preview}`} style={bg.type === 'image' ? { backgroundImage: `url(${bg.src})` } : {}} />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            {currentBackground.id === bg.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                                    <div className="bg-white rounded-full p-1.5 shadow-lg"><div className="w-3 h-3 bg-indigo-600 rounded-full" /></div>
                                </div>
                            )}
                            {bg.type === 'custom' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Delete this background?')) {
                                            onDeleteBackground(bg.id);
                                            // Handle deselection if needed in parent
                                        }
                                    }}
                                    className="absolute top-1 right-1 bg-white/90 text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                    title="Delete Custom Background"
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                <span className="text-white text-[10px] font-bold tracking-wide uppercase">{bg.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AppearanceSettings;
