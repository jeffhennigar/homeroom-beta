import React from 'react';
import { createPortal } from 'react-dom';
import { Bold, Italic, Underline, Type, Palette, Sun, Minus, Plus, X } from 'lucide-react';

interface FloatingFormattingToolbarProps {
    pos: { top: number; left: number } | null;
    formats: { bold: boolean; italic: boolean; underline: boolean };
    exec: (command: string, value?: string) => void;
    onClose: () => void;
    updateData: (id: string, data: any) => void;
    widgetId: string;
    hasShadow?: boolean;
    fontScale?: number;
    fontFamily?: string;
    showFontColorMenu: boolean;
    setShowFontColorMenu: (show: boolean) => void;
    showFontMenu: boolean;
    setShowFontMenu: (show: boolean) => void;
}

const FONTS = [
    { name: 'Poppins', class: 'font-["Poppins"]' },
    { name: 'Inter', class: 'font-["Inter"]' },
    { name: 'Roboto', class: 'font-["Roboto"]' },
    { name: 'Outfit', class: 'font-["Outfit"]' },
    { name: 'Playfair Display', class: 'font-["Playfair_Display"]' },
    { name: 'Monospace', class: 'font-mono' }
];

const FloatingFormattingToolbar: React.FC<FloatingFormattingToolbarProps> = ({
    pos,
    formats,
    exec,
    onClose,
    updateData,
    widgetId,
    hasShadow,
    fontScale,
    fontFamily,
    showFontColorMenu,
    setShowFontColorMenu,
    showFontMenu,
    setShowFontMenu
}) => {
    if (!pos) return null;

    return createPortal(
        <div
            className="fixed z-[10010] bg-white rounded-xl shadow-2xl border border-slate-200 p-1.5 flex items-center gap-1 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-200"
            style={{
                top: Math.max(10, pos.top - 55),
                left: Math.max(100, Math.min(window.innerWidth - 100, pos.left)),
                pointerEvents: 'auto'
            }}
            onPointerDown={e => e.preventDefault()}
        >
            <button onClick={() => exec('bold')} className={`p-2 rounded-lg transition-colors ${formats.bold ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`}>
                <Bold size={16} />
            </button>
            <button onClick={() => exec('italic')} className={`p-2 rounded-lg transition-colors ${formats.italic ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`}>
                <Italic size={16} />
            </button>
            <button onClick={() => exec('underline')} className={`p-2 rounded-lg transition-colors ${formats.underline ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`}>
                <Underline size={16} />
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Font Color */}
            <div className="relative">
                <button onClick={() => { setShowFontColorMenu(!showFontColorMenu); setShowFontMenu(false); }} className={`p-2 rounded-lg hover:bg-slate-100 text-slate-500 ${showFontColorMenu ? 'bg-slate-100' : ''}`}>
                    <Palette size={16} />
                </button>
                {showFontColorMenu && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 grid grid-cols-5 gap-1 w-40">
                        {['#000000', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#64748B', '#94A3B8'].map(c => (
                            <button key={c} onClick={() => { exec('foreColor', c); setShowFontColorMenu(false); }} className="w-6 h-6 rounded-full border border-slate-200 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                        ))}
                    </div>
                )}
            </div>

            {/* Font Family */}
            <div className="relative">
                <button onClick={() => { setShowFontMenu(!showFontMenu); setShowFontColorMenu(false); }} className={`p-2 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center gap-1 text-xs font-bold ${showFontMenu ? 'bg-slate-100' : ''}`}>
                    <Type size={16} />
                </button>
                {showFontMenu && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-slate-200 p-1 w-40 overflow-hidden">
                        {FONTS.map(f => (
                            <button
                                key={f.name}
                                onClick={() => { updateData(widgetId, { fontFamily: f.name }); setShowFontMenu(false); }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-lg transition-colors ${fontFamily === f.name ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-600'} ${f.class}`}
                            >
                                {f.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <button onClick={() => updateData(widgetId, { hasShadow: !hasShadow })} className={`p-2 rounded-lg transition-colors ${hasShadow ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`} title="Toggle Text Shadow">
                <Sun size={16} />
            </button>

            {fontScale !== undefined && (
                <>
                    <button onClick={() => updateData(widgetId, { fontScale: Math.max(0.1, fontScale - 0.1) })} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-all font-bold">
                        <Minus size={16} />
                    </button>
                    <button onClick={() => updateData(widgetId, { fontScale: Math.min(10, fontScale + 0.1) })} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-all font-bold">
                        <Plus size={16} />
                    </button>
                </>
            )}

            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                <X size={16} />
            </button>
        </div>,
        document.body
    );
};

export default FloatingFormattingToolbar;
