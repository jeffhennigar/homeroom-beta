import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bold, Italic, Underline, Type, List, RotateCcw, Palette, Trash2, Check, GripVertical, Settings, Pipette, Sun, Minus, Plus, X } from 'lucide-react';
import FloatingFormattingToolbar from './FloatingFormattingToolbar';

const TextWidget = ({ widget, updateData }) => {
    const { items = [], content = "", mode = 'text', fontSize = 12, color = 'yellow', fontFamily = 'Poppins' } = widget.data;
    const [newItemText, setNewItemText] = useState("");
    const editorRef = useRef(null);
    const [formats, setFormats] = useState({ bold: false, italic: false, underline: false });
    const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
    const [showColorMenu, setShowColorMenu] = useState(false);
    const [showFontColorMenu, setShowFontColorMenu] = useState(false);
    const [showFontMenu, setShowFontMenu] = useState(false);
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const [focusId, setFocusId] = useState(null);

    const COLORS = {
        yellow: { bg: 'bg-amber-100', header: 'bg-amber-200', text: 'text-amber-900', border: 'border-amber-300' },
        blue: { bg: 'bg-sky-100', header: 'bg-sky-200', text: 'text-sky-900', border: 'border-sky-300' },
        green: { bg: 'bg-emerald-100', header: 'bg-emerald-200', text: 'text-emerald-900', border: 'border-emerald-300' },
        pink: { bg: 'bg-rose-100', header: 'bg-rose-200', text: 'text-rose-900', border: 'border-rose-300' },
        slate: { bg: 'bg-slate-200', header: 'bg-slate-300', text: 'text-slate-900', border: 'border-slate-400' }
    };
    const theme = COLORS[color] || COLORS.yellow;

    const updateFormats = useCallback(() => {
        setFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline')
        });

        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && !selection.isCollapsed && editorRef.current?.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setToolbarPos({ top: rect.top, left: rect.left + rect.width / 2 });
        } else {
            setToolbarPos(null);
        }
    }, []);

    const exec = (command, value = undefined) => {
        editorRef.current?.focus();
        document.execCommand(command, false, value);
        updateFormats();
        if (editorRef.current) updateData(widget.id, { content: editorRef.current.innerHTML });
    };

    useEffect(() => {
        if (mode === 'text' && editorRef.current && document.activeElement !== editorRef.current) {
            if (editorRef.current.innerHTML !== (content || '')) {
                editorRef.current.innerHTML = content || '';
            }
        }
    }, [content, mode]);

    const addItem = () => {
        if (!newItemText.trim()) return;
        const newItem = { id: Date.now().toString(), text: newItemText.trim(), completed: false };
        updateData(widget.id, { items: [...items, newItem] });
        setNewItemText("");
    };

    const addItemAtIndex = (index) => {
        const newItem = { id: Date.now().toString(), text: "", completed: false };
        const newItems = [...items];
        newItems.splice(index + 1, 0, newItem);
        updateData(widget.id, { items: newItems });
        setFocusId(newItem.id);
    };

    const toggleItem = (id) => updateData(widget.id, { items: items.map(i => i.id === id ? { ...i, completed: !i.completed } : i).sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1)) });
    const deleteItem = (id) => updateData(widget.id, { items: items.filter(i => i.id !== id) });
    const updateItemText = (id, text) => updateData(widget.id, { items: items.map(i => i.id === id ? { ...i, text } : i) });

    const toggleMode = () => {
        if (mode === 'text') {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content || "";
            const rawText = tempDiv.innerText || "";
            // Split by newline, trim, and remove empty lines
            const validLines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            // Create items
            // Create items
            const newItems = validLines.map((text, i) => ({ id: Date.now() + i + '', text, completed: false }));
            // Ensure at least one item
            if (newItems.length === 0) newItems.push({ id: Date.now().toString(), text: '', completed: false });
            // CRITICAL FIX: Clear listTitle when converting from text to list to avoid duplication
            updateData(widget.id, { mode: 'list', items: newItems, content: "", listTitle: "" });
        } else {
            // When going list -> text, prepend the title as a bold line if it exists
            const { listTitle = "" } = widget.data;
            let newContent = items.map(i => `<div>${i.text}</div>`).join('');
            if (listTitle) {
                newContent = `<div><strong>${listTitle}</strong></div>` + newContent;
            }
            updateData(widget.id, { mode: 'text', content: newContent, items: [], listTitle: "" });
        }
    };

    const handleDragStart = (e, index) => { setDraggedItemIndex(index); };
    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === index) return;
        const newItems = [...items];
        const item = newItems[draggedItemIndex];
        newItems.splice(draggedItemIndex, 1);
        newItems.splice(index, 0, item);
        setDraggedItemIndex(index);
        updateData(widget.id, { items: newItems });
    };
    const handleDragEnd = () => { setDraggedItemIndex(null); };

    return (
        <div className={`h-full flex flex-col relative group ${theme.bg}`} style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)', fontFamily: 'Poppins, sans-serif' }} onClick={() => setShowColorMenu(false)}>
            <div className={`h-10 flex items-center px-4 shrink-0 relative z-20 justify-between ${theme.header} border-b ${theme.border} bg-opacity-50`}>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setShowColorMenu(!showColorMenu); }} className={`w-4 h-4 rounded-full border border-black/10 shadow-sm ${theme.bg.replace('50', '400').replace('100', '400')}`} />
                    {showColorMenu && (
                        <div className="absolute top-8 left-2 bg-white p-2 rounded-xl shadow-xl flex gap-1 z-50 border border-gray-100">
                            {Object.keys(COLORS).map(c => (
                                <button key={c} onClick={(e) => { e.stopPropagation(); updateData(widget.id, { color: c }); setShowColorMenu(false); }} className={`w-6 h-6 rounded-full border hover:scale-110 transition-transform ${COLORS[c].bg.replace('50', '500').replace('100', '500')}`} />
                            ))}
                        </div>
                    )}
                    <span className={`font-bold text-xs uppercase tracking-widest flex items-center gap-2 ${theme.text} opacity-50`}>Note</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={toggleMode} className="p-1 hover:bg-black/5 rounded text-black/50 hover:text-black">
                        {mode === 'text' ? <List size={14} /> : <Type size={14} />}
                    </button>
                </div>
            </div>
            <div className="flex-1 relative overflow-hidden flex flex-col">
                {mode === 'text' ? (
                    <>
                        <div
                            ref={editorRef}
                            className="w-full h-full p-4 outline-none overflow-auto custom-scrollbar leading-relaxed text-lg"
                            contentEditable
                            suppressContentEditableWarning
                            onInput={(e) => updateData(widget.id, { content: e.currentTarget.innerHTML })}
                            onKeyUp={updateFormats}
                            onMouseUp={updateFormats}
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                setToolbarPos(null);
                            }}
                            style={{
                                fontSize: fontSize + 'px',
                                fontFamily: `${fontFamily}, sans-serif`,
                                textShadow: widget.data.hasShadow ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none'
                            }}
                        />
                        <FloatingFormattingToolbar
                            pos={toolbarPos}
                            formats={formats}
                            exec={exec}
                            onClose={() => setToolbarPos(null)}
                            updateData={updateData}
                            widgetId={widget.id}
                            hasShadow={widget.data.hasShadow}
                            fontFamily={fontFamily}
                            showFontColorMenu={showFontColorMenu}
                            setShowFontColorMenu={setShowFontColorMenu}
                            showFontMenu={showFontMenu}
                            setShowFontMenu={setShowFontMenu}
                        />
                    </>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 pl-4 z-10">
                            <div className="space-y-1">
                                <input
                                    className="w-full bg-transparent border-none outline-none font-bold text-slate-700 mb-2 placeholder-slate-400/50 cursor-text relative z-10"
                                    style={{ fontSize: (fontSize * 1.1) + 'px' }}
                                    value={widget.data.listTitle || ""}
                                    placeholder="Add a title..."
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onChange={(e) => updateData(widget.id, { listTitle: e.target.value })}
                                />
                                {items.map((item, idx) => (
                                    <div key={item.id} draggable onDragStart={(e) => handleDragStart(e, idx)} onDragOver={(e) => handleDragOver(e, idx)} onDragEnd={handleDragEnd} className={`group/item flex items-start gap-2 p-1 rounded hover:bg-black/5 transition-colors ${item.completed ? 'opacity-50' : ''} ${draggedItemIndex === idx ? 'opacity-30' : ''}`}>
                                        <div className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500"><GripVertical size={12} /></div>
                                        <button onClick={() => toggleItem(item.id)} className={`mt-1 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-400 bg-white'}`}>
                                            {item.completed && <Check size={10} className="text-white" />}
                                        </button>
                                        <input
                                            value={item.text}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onChange={(e) => updateItemText(item.id, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addItemAtIndex(idx);
                                                }
                                            }}
                                            className={`flex-1 bg-transparent border-none outline-none text-sm font-medium break-words leading-snug pt-0.5 ${item.completed ? 'line-through text-gray-500' : 'text-slate-800'}`}
                                            style={{ fontSize: fontSize + 'px' }}
                                            autoFocus={item.id === focusId}
                                        />
                                        <div className="opacity-0 group-hover/item:opacity-100 flex gap-1">
                                            <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-500"><X size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Footer removed - item added via Enter or auto-init */}
                    </>
                )}
            </div>
        </div>
    );
};

export default TextWidget;