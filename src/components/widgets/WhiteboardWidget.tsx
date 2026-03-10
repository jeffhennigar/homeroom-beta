import React, { useRef, useState, useEffect, useCallback } from 'react';
import { MousePointer2, Edit3, Eraser, Undo2, Redo2, Type, Smile, ImageIcon, Trash2, Download, RotateCcw, RotateCw, Grid as GridIcon, Layout, Square, Circle, Triangle, Shapes, ArrowRight, Hexagon } from 'lucide-react';

const DRAW_EMOJIS = ['⭐', '❤️', '✅', '❌', '👍', '👎', '🎯', '🏆', '🔥', '💡', '📌', '🎨', '📝', '🌟', '✨', '🎉', '💯', '👀', '🤔', '💪', '🌈', '⚡', '🎁', '😊', '🙌'];

const WhiteboardWidget = ({ widget, updateData }) => {
    const { tool = 'pen', color = '#000000', size = 5, lines = [], textItems = [], emojiItems = [], imageItems = [], shapeItems = [], drawOffset = { x: 0, y: 0 }, bgType = 'none' } = widget.data;
    const canvasRef = useRef(null);
    const isDrawing = useRef(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showBgPicker, setShowBgPicker] = useState(false);
    const [showShapePicker, setShowShapePicker] = useState(false);

    const Shape = ({ type, color, scale = 1, rotation = 0 }) => {
        const styles: React.CSSProperties = {
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center',
            color: color,
            fill: 'currentColor'
        };

        if (type === 'square') return <div style={{ ...styles, width: '60px', height: '60px', backgroundColor: color }} />;
        if (type === 'circle') return <div style={{ ...styles, width: '60px', height: '60px', backgroundColor: color, borderRadius: '999px' }} />;
        if (type === 'triangle') return <Triangle size={60} style={styles} />;
        if (type === 'hexagon') return <Hexagon size={60} style={styles} />;
        if (type === 'arrow') return <ArrowRight size={60} style={styles} />;
        if (type === 'semicircle') return <div style={{ ...styles, width: '60px', height: '30px', backgroundColor: color, borderRadius: '60px 60px 0 0' }} />;
        return null;
    };

    const BG_TEMPLATES = [
        { id: 'none', label: 'None', icon: 'None' },
        { id: 'grid', label: 'Grid', style: { backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)', backgroundSize: '30px 30px' } },
        { id: 'dots', label: 'Dots', style: { backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' } },
        { id: 'lines', label: 'Lines', style: { backgroundImage: 'linear-gradient(#f1f5f9 1.5px, transparent 1.5px)', backgroundSize: '100% 30px' } },
        { id: 'dark-grid', label: 'Blueprint', style: { backgroundColor: '#1e293b', backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)', backgroundSize: '30px 30px' } }
    ];

    // History
    const [history, setHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    const addToHistory = () => {
        setHistory(prev => [...prev, widget.data]);
        setRedoStack([]);
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setRedoStack(prev => [...prev, widget.data]);
        setHistory(prev => prev.slice(0, -1));
        updateData(widget.id, previous);
        setSelectedItem(null);
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;
        const next = redoStack[redoStack.length - 1];
        setHistory(prev => [...prev, widget.data]);
        setRedoStack(prev => prev.slice(0, -1));
        updateData(widget.id, next);
        setSelectedItem(null);
    };

    // Drawing Logic
    const lastPointRef = useRef(null);

    const handleCanvasPointerDown = (e) => {
        if (tool !== 'pen' && tool !== 'eraser') return;
        addToHistory();
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        isDrawing.current = true;

        // Use pressure if available, default to 1
        const pressure = (e as React.PointerEvent).pressure || 0.5;
        const currentSize = tool === 'eraser' ? size * 2 : size * (0.5 + pressure);

        // Reset last point for speed calc
        lastPointRef.current = { x, y, time: Date.now(), w: currentSize };

        // Start a new line path
        const newLine = {
            points: [{ x, y, w: currentSize }],
            color: tool === 'eraser' ? '#ffffff' : color,
            size: currentSize,
            tool
        };
        updateData(widget.id, { lines: [...lines, newLine] });

        const target = e.currentTarget as HTMLElement;
        if (target.setPointerCapture) target.setPointerCapture(e.pointerId);

        window.addEventListener('pointermove', movePointerDrawing);
        window.addEventListener('pointerup', stopPointerDrawing);
        window.addEventListener('pointercancel', stopPointerDrawing);
    };

    const movePointerDrawing = (e) => {
        if (!isDrawing.current) return;
        if (tool !== 'pen' && tool !== 'eraser') return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const now = Date.now();

        const pressure = (e as any).pressure || 0.5;
        const currentSize = tool === 'eraser' ? size * 2 : size * (0.5 + pressure);

        lastPointRef.current = { x, y, time: now, w: currentSize };

        // Append point to last line
        const newLines = [...lines];
        if (newLines.length > 0) {
            const lastLine = { ...newLines[newLines.length - 1] };
            lastLine.points = [...lastLine.points, { x, y, w: currentSize }];
            // Update line size to average or keep it per-point? 
            // The renderer currently uses l.size. Let's update points to have individual widths if possible.
            // But the renderer uses ctx.lineWidth = l.size. To support varying width, we'd need a more complex renderer.
            // For now, let's just stick to a fixed size per line but improved event handling.
            newLines[newLines.length - 1] = lastLine;
            updateData(widget.id, { lines: newLines });
        }
    };

    const stopPointerDrawing = () => {
        isDrawing.current = false;
        window.removeEventListener('pointermove', movePointerDrawing);
        window.removeEventListener('pointerup', stopPointerDrawing);
        window.removeEventListener('pointercancel', stopPointerDrawing);
    };

    // Keep lines in a ref so resize observer can access latest without re-subscribing
    const linesRef = useRef(lines);
    useEffect(() => { linesRef.current = lines; }, [lines]);

    // Simple draw function that reads from linesRef
    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || canvas.width === 0) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const dpr = window.devicePixelRatio || 1;
        const currentLines = linesRef.current;
        currentLines.forEach(l => {
            if (l.points && l.points.length > 0) {
                // Use simple native canvas stroke for smooth lines
                ctx.beginPath();
                ctx.strokeStyle = l.color;
                ctx.lineWidth = l.size * dpr;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.moveTo(l.points[0].x * canvas.width, l.points[0].y * canvas.height);
                for (let i = 1; i < l.points.length; i++) {
                    const p = l.points[i];
                    ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
                }
                ctx.stroke();
            }
        });
    }, []);

    // Redraw when lines change
    useEffect(() => { drawCanvas(); }, [lines, drawCanvas]);

    // Resize observer runs once on mount, calls drawCanvas which reads linesRef
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            const dpr = window.devicePixelRatio || 1;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            drawCanvas();
        };

        const observer = new ResizeObserver(() => requestAnimationFrame(resizeCanvas));
        observer.observe(canvas);
        setTimeout(resizeCanvas, 10); // Small delay for layout

        return () => observer.disconnect();
    }, [drawCanvas]);

    // Item Drag Logic
    const dragItemStart = useRef(null);
    const isDraggingItem = useRef(false);
    const draggingId = useRef(null);
    const dragMode = useRef('move'); // move, rotate, scale

    const handleItemPointerDown = (e, type, id, mode = 'move') => {
        e.stopPropagation();
        addToHistory();
        setSelectedItem({ type, id });
        isDraggingItem.current = true;
        draggingId.current = id;
        dragMode.current = mode;

        const target = e.currentTarget as HTMLElement;
        if (target.setPointerCapture) target.setPointerCapture(e.pointerId);

        let item;
        if (type === 'text') item = textItems.find(i => i.id === id);
        if (type === 'emoji') item = emojiItems.find(i => i.id === id);
        if (type === 'image') item = imageItems.find(i => i.id === id);
        if (type === 'shape') item = shapeItems.find(i => i.id === id);

        const rect = e.target.parentElement.getBoundingClientRect();
        dragItemStart.current = {
            startX: item ? item.x : (type === 'drawing' ? drawOffset.x : 0.5),
            startY: item ? item.y : (type === 'drawing' ? drawOffset.y : 0.5),
            initialMx: e.clientX,
            initialMy: e.clientY,
            startScale: item ? (item.scale || 1) : 1,
            startRotation: item ? (item.rotation || 0) : 0,
            rect: rect
        };
    };

    useEffect(() => {
        const handleWindowMove = (e) => {
            if (isDraggingItem.current && selectedItem) {
                e.preventDefault();
                const { type, id } = selectedItem;
                const startData = dragItemStart.current;
                const rect = startData.rect;

                const updateList = (list, key) => {
                    var newList = [];
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].id === id) {
                            var item = list[i];
                            var updates = {};
                            if (dragMode.current === 'move') {
                                const dx = (e.clientX - startData.initialMx) / rect.width;
                                const dy = (e.clientY - startData.initialMy) / rect.height;
                                updates = { x: startData.startX + dx, y: startData.startY + dy };
                            } else if (dragMode.current === 'rotate') {
                                const cx = startData.startX * rect.width + rect.left;
                                const cy = startData.startY * rect.height + rect.top;
                                const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
                                updates = { rotation: angle + 90 };
                            } else if (dragMode.current === 'scale') {
                                const cx = startData.startX * rect.width + rect.left;
                                const cy = startData.startY * rect.height + rect.top;
                                const dist = Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2));
                                const startDist = Math.sqrt(Math.pow(startData.initialMx - cx, 2) + Math.pow(startData.initialMy - cy, 2));
                                const scaleFactor = dist / (startDist || 1);
                                updates = { scale: Math.max(0.2, startData.startScale * scaleFactor) };
                            }
                            newList.push({ ...item, ...updates });
                        } else {
                            newList.push(list[i]);
                        }
                    }
                    var updateObj = {}; updateObj[key] = newList;
                    updateData(widget.id, updateObj);
                };

                if (type === 'drawing') {
                    const dx = e.clientX - startData.initialMx;
                    const dy = e.clientY - startData.initialMy;
                    updateData(widget.id, { drawOffset: { x: startData.startX + dx, y: startData.startY + dy } });
                }
                if (type === 'text') updateList(textItems, 'textItems');
                if (type === 'emoji') updateList(emojiItems, 'emojiItems');
                if (type === 'image') updateList(imageItems, 'imageItems');
                if (type === 'shape') updateList(shapeItems, 'shapeItems');
            }
        };

        const handleWindowUp = () => {
            isDraggingItem.current = false;
            draggingId.current = null;
        };

        window.addEventListener('pointermove', handleWindowMove);
        window.addEventListener('pointerup', handleWindowUp);
        window.addEventListener('pointercancel', handleWindowUp);
        return () => {
            window.removeEventListener('pointermove', handleWindowMove);
            window.removeEventListener('pointerup', handleWindowUp);
            window.removeEventListener('pointercancel', handleWindowUp);
        };
    }, [selectedItem, textItems, emojiItems, imageItems, widget.id]);

    const updateTextContent = (id, text) => {
        addToHistory();
        updateData(widget.id, { textItems: textItems.map(t => t.id === id ? { ...t, text } : t) });
    };

    const addEmoji = (emoji, e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        addToHistory();
        const newItem = { id: Date.now().toString(), x: 0.5, y: 0.5, emoji, scale: 1 };
        updateData(widget.id, { emojiItems: [...emojiItems, newItem] });
        setShowEmojiPicker(false);
    };

    const addShape = (type, e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        addToHistory();
        const newItem = { id: Date.now().toString(), x: 0.5, y: 0.5, type, color, scale: 1, width: 100, height: 100, rotation: 0 };
        updateData(widget.id, { shapeItems: [...shapeItems, newItem] });
        setShowShapePicker(false);
        setSelectedItem({ type: 'shape', id: newItem.id });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            addToHistory();
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    const img = new Image();
                    img.src = ev.target.result as string;
                    img.onload = () => {
                        const aspect = img.width / img.height;
                        const newItem = { id: Date.now().toString(), x: 0.5, y: 0.5, src: ev.target.result as string, scale: 1, width: 200, height: 200 / aspect };
                        updateData(widget.id, { imageItems: [...imageItems, newItem] });
                    };
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const savePNG = () => { var link = document.createElement('a'); link.download = 'whiteboard.png'; link.href = canvasRef.current.toDataURL(); link.click(); };
    const clearAll = () => { addToHistory(); updateData(widget.id, { lines: [], textItems: [], emojiItems: [], imageItems: [], shapeItems: [] }); };
    const deleteSelectedItem = () => {
        if (!selectedItem) return;
        addToHistory();
        const { type, id } = selectedItem;
        if (type === 'text') updateData(widget.id, { textItems: textItems.filter(i => i.id !== id) });
        if (type === 'emoji') updateData(widget.id, { emojiItems: emojiItems.filter(i => i.id !== id) });
        if (type === 'image') updateData(widget.id, { imageItems: imageItems.filter(i => i.id !== id) });
        if (type === 'shape') updateData(widget.id, { shapeItems: shapeItems.filter(i => i.id !== id) });
        setSelectedItem(null);
    };

    const handleColorClick = (c) => {
        if (selectedItem?.type === 'shape') {
            addToHistory();
            updateData(widget.id, {
                shapeItems: shapeItems.map(s => s.id === selectedItem.id ? { ...s, color: c } : s),
                color: c
            });
        } else if (selectedItem?.type === 'text') {
            addToHistory();
            updateData(widget.id, {
                textItems: textItems.map(t => t.id === selectedItem.id ? { ...t, color: c } : t),
                color: c
            });
        } else {
            updateData(widget.id, { color: c });
        }
        setShowColorPicker(false);
    };

    return (
        <div className="h-full bg-white flex flex-col relative group">
            <div className="bg-gray-50 p-2 border-b flex items-center justify-between shrink-0 gap-3">
                <div className="flex gap-2 items-center shrink-0">
                    <div className="relative">
                        <button onClick={() => setShowBgPicker(!showBgPicker)} className={`p-2 rounded-xl transition-all ${bgType !== 'none' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`} title="Background Template">
                            <Layout size={18} />
                        </button>
                    </div>
                    <div className="w-px h-6 bg-gray-200 mx-1" />
                    <div className="relative">
                        <button onClick={() => setShowColorPicker(!showColorPicker)} className={`w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center`} style={{ backgroundColor: color }} />
                    </div>
                    <div className="w-px h-6 bg-gray-200 mx-1" />
                    <button onClick={() => updateData(widget.id, { tool: 'move' })} className={`p-2 rounded-xl transition-all ${tool === 'move' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`} title="Select/Move"><MousePointer2 size={18} /></button>
                    <button onClick={() => updateData(widget.id, { tool: 'pen' })} className={`p-2 rounded-xl transition-all ${tool === 'pen' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`} title="Pen"><Edit3 size={18} /></button>
                    <button onClick={() => updateData(widget.id, { tool: 'eraser' })} className={`p-2 rounded-xl transition-all ${tool === 'eraser' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`} title="Eraser"><Eraser size={18} /></button>
                    <div className="w-px h-6 bg-gray-200 mx-1" />
                    <button onClick={handleUndo} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 disabled:opacity-30" disabled={history.length === 0} title="Undo"><Undo2 size={18} /></button>
                    <button onClick={handleRedo} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 disabled:opacity-30" disabled={redoStack.length === 0} title="Redo"><Redo2 size={18} /></button>

                    <div className="flex flex-col justify-center px-1">
                        <input type="range" min="1" max="50" value={size} onChange={(e) => updateData(widget.id, { size: Number(e.target.value) })} className="w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-600" title={`Size: ${size}`} />
                    </div>
                    <div className="w-px h-6 bg-gray-200 mx-1" />
                    <button onClick={() => updateData(widget.id, { tool: 'text' })} className={`p-2 rounded-xl transition-all ${tool === 'text' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`} title="Text"><Type size={18} /></button>
                    <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); setShowShapePicker(!showShapePicker); }} className={`p-2 rounded-xl transition-all ${showShapePicker ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`} title="Shape">
                            <Shapes size={18} />
                        </button>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }} className={`p-2 rounded-xl transition-all ${showEmojiPicker ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`} title="Sticker"><Smile size={18} /></button>
                    <button onClick={() => fileInputRef.current.click()} className="p-2 rounded-xl transition-all hover:bg-gray-100 text-gray-400" title="Image"><ImageIcon size={18} /></button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
                {selectedItem && (
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1 shadow-sm animate-in fade-in zoom-in-95">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Selected</span>
                        <div className="w-px h-4 bg-gray-200" />
                        <button onClick={deleteSelectedItem} className="p-1 hover:bg-red-50 text-red-500 rounded" title="Delete"><Trash2 size={16} /></button>
                    </div>
                )}
                <div className="flex gap-1 ml-auto">
                    <button onClick={savePNG} className="text-gray-400 hover:text-green-600 p-2" title="Download"><Download size={18} /></button>
                    <button onClick={clearAll} className="text-gray-400 hover:text-red-500 p-2" title="Clear All"><RotateCcw size={18} /></button>
                </div>
            </div>
            <div className={`flex-1 relative overflow-hidden ${tool === 'pen' || tool === 'eraser' ? 'cursor-crosshair' : tool === 'move' ? 'cursor-move' : 'cursor-default'}`}
                style={BG_TEMPLATES.find(t => t.id === bgType)?.style || { backgroundColor: '#ffffff' }}
                onPointerDown={(e) => {
                    if (tool === 'move') {
                        // Click background to select drawing layer
                        if (e.target === e.currentTarget) {
                            handleItemPointerDown(e, 'drawing', 'layer');
                        }
                    }
                }}>
                {/* Layers: Items Bottom, Canvas Top */}
                <div className="absolute inset-0 z-0" style={{ transform: `translate(${drawOffset.x}px, ${drawOffset.y}px)` }}>
                    {imageItems.map(img => (
                        <div key={img.id} onPointerDown={(e) => handleItemPointerDown(e, 'image', img.id)} className={`absolute cursor-move group ${selectedItem?.id === img.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`} style={{ left: `${img.x * 100}%`, top: `${img.y * 100}%`, transform: 'translate(-50%, -50%) rotate(' + (img.rotation || 0) + 'deg)', width: (img.width || 100) * (img.scale || 1), height: (img.height || 100) * (img.scale || 1) }}>
                            <img src={img.src} draggable={false} className="w-full h-full object-contain pointer-events-none" />
                            {selectedItem?.id === img.id && (
                                <>
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-blue-500 rounded-full shadow cursor-grab flex items-center justify-center p-1 z-50" onPointerDown={(e) => handleItemPointerDown(e, 'image', img.id, 'rotate')}><RotateCw size={12} className="text-blue-600" /></div>
                                    <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow cursor-nwse-resize z-50" onPointerDown={(e) => handleItemPointerDown(e, 'image', img.id, 'scale')} />
                                </>
                            )}
                        </div>
                    ))}

                    {textItems.map(t => (
                        <div key={t.id} onPointerDown={(e) => handleItemPointerDown(e, 'text', t.id)} onClick={(e) => { e.stopPropagation(); setSelectedItem({ type: 'text', id: t.id }); }} className={`absolute cursor-move ${selectedItem?.id === t.id ? 'ring-2 ring-blue-500 ring-offset-1 rounded' : ''}`} style={{ left: `${t.x * 100}%`, top: `${t.y * 100}%`, transform: `translate(-50%, -50%) rotate(${t.rotation || 0}deg)` }}>
                            {selectedItem?.id === t.id ? (
                                <>
                                    <div className="relative">
                                        <input value={t.text} onPointerDown={(e) => { e.stopPropagation(); }} onChange={e => updateTextContent(t.id, e.target.value)} className="bg-transparent border-none outline-none font-bold text-center min-w-[50px]" style={{ color: t.color, fontSize: `${16 * (t.scale || 1)}px` }} autoFocus />
                                    </div>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-blue-500 rounded-full shadow cursor-grab flex items-center justify-center p-1 z-50" onPointerDown={(e) => handleItemPointerDown(e, 'text', t.id, 'rotate')}><RotateCw size={12} className="text-blue-600" /></div>
                                    <div className="absolute -bottom-3 -right-6 w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow cursor-nwse-resize z-50" onPointerDown={(e) => handleItemPointerDown(e, 'text', t.id, 'scale')} />
                                </>
                            ) : (
                                <div className="font-bold whitespace-nowrap select-none" style={{ color: t.color, fontSize: `${16 * (t.scale || 1)}px` }}>{t.text}</div>
                            )}
                        </div>
                    ))}

                    {emojiItems.map(emoji => {
                        const emojiSize = 32 * (emoji.scale || 1);
                        const isSelected = selectedItem?.id === emoji.id;
                        return (
                            <div key={emoji.id} className="absolute" style={{ left: `${emoji.x * 100}%`, top: `${emoji.y * 100}%` }}>
                                {/* Selection box - fixed 2px border, positioned based on emoji size */}
                                {isSelected && (
                                    <div className="absolute border-2 border-blue-500 rounded-lg pointer-events-none" style={{ width: emojiSize + 8, height: emojiSize + 8, top: -emojiSize / 2 - 4, left: -emojiSize / 2 - 4 }} />
                                )}
                                {/* Emoji content with rotation and scale */}
                                <div onPointerDown={(ev) => handleItemPointerDown(ev, 'emoji', emoji.id)} onClick={(e) => { e.stopPropagation(); setSelectedItem({ type: 'emoji', id: emoji.id }); }} className="cursor-move select-none" style={{ transform: `translate(-50%, -50%) rotate(${emoji.rotation || 0}deg)`, fontSize: `${emojiSize}px` }}>
                                    <span className="emoji relative inline-block"> {emoji.emoji} </span>
                                </div>
                                {/* Controls positioned with fixed sizes */}
                                {isSelected && (
                                    <>
                                        <div className="absolute w-6 h-6 bg-white border-2 border-blue-500 rounded-full shadow cursor-grab flex items-center justify-center z-50" style={{ top: -emojiSize / 2 - 28, left: '50%', transform: 'translateX(-50%)' }} onPointerDown={(e) => handleItemPointerDown(e, 'emoji', emoji.id, 'rotate')}><RotateCw size={12} className="text-blue-600" /></div>
                                        <div className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow cursor-nwse-resize z-50" style={{ top: emojiSize / 2 - 2, left: emojiSize / 2 - 2 }} onPointerDown={(e) => handleItemPointerDown(e, 'emoji', emoji.id, 'scale')} />
                                    </>
                                )}
                            </div>
                        );
                    })}

                    {shapeItems.map(shape => {
                        const isSelected = selectedItem?.id === shape.id;
                        const scale = shape.scale || 1;
                        const boxSize = 60 * scale;

                        return (
                            <div key={shape.id} onPointerDown={(e) => handleItemPointerDown(e, 'shape', shape.id)} className="absolute cursor-move" style={{ left: `${shape.x * 100}%`, top: `${shape.y * 100}%` }}>
                                {isSelected && (
                                    <div className="absolute border-2 border-blue-500 rounded pointer-events-none"
                                        style={{
                                            width: boxSize + 10,
                                            height: boxSize + 10,
                                            top: -boxSize / 2 - 5,
                                            left: -boxSize / 2 - 5,
                                            transform: `rotate(${shape.rotation || 0}deg)`
                                        }} />
                                )}
                                <div style={{ transform: 'translate(-50%, -50%)' }}>
                                    <Shape type={shape.type} color={shape.color} scale={scale} rotation={shape.rotation || 0} />
                                </div>
                                {isSelected && (
                                    <>
                                        <div className="absolute w-6 h-6 bg-white border border-blue-500 rounded-full shadow cursor-grab flex items-center justify-center p-1 z-50" style={{ top: -boxSize / 2 - 25, left: '50%', transform: 'translateX(-50%)' }} onPointerDown={(e) => handleItemPointerDown(e, 'shape', shape.id, 'rotate')}><RotateCw size={12} className="text-blue-600" /></div>
                                        <div className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow cursor-nwse-resize z-50" style={{ top: boxSize / 2 - 2, left: boxSize / 2 - 2 }} onPointerDown={(e) => handleItemPointerDown(e, 'shape', shape.id, 'scale')} />
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Floating Popups */}
                {showBgPicker && (
                    <div className="absolute top-16 left-4 z-[100] bg-white p-2 rounded-xl shadow-2xl flex flex-col gap-1 border border-gray-100 min-w-[140px] animate-in zoom-in-95 duration-200">
                        {BG_TEMPLATES.map(t => (
                            <button
                                key={t.id}
                                onClick={() => { updateData(widget.id, { bgType: t.id }); setShowBgPicker(false); }}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${bgType === t.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-600'}`}
                            >
                                <div className="w-5 h-5 rounded border border-gray-200 shrink-0" style={t.style} />
                                {t.label}
                            </button>
                        ))}
                    </div>
                )}

                {showColorPicker && (
                    <div className="absolute top-16 left-12 z-[100] bg-white p-2 rounded-xl shadow-2xl flex gap-1 border border-gray-100 animate-in zoom-in-95 duration-200">
                        {['#000000', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#9ca3af', '#ffffff'].map(c => (
                            <button key={c} onClick={() => handleColorClick(c)} className="w-6 h-6 rounded-full border hover:scale-125 transition-transform" style={{ backgroundColor: c, borderColor: c === '#ffffff' ? '#ddd' : 'transparent' }} />
                        ))}
                    </div>
                )}

                {showShapePicker && (
                    <div className="absolute top-16 left-48 z-[100] bg-white p-2 rounded-xl shadow-2xl grid grid-cols-3 gap-2 border border-gray-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        {[
                            { id: 'square', icon: <Square size={20} /> },
                            { id: 'circle', icon: <Circle size={20} /> },
                            { id: 'triangle', icon: <Triangle size={20} /> },
                            { id: 'hexagon', icon: <Hexagon size={20} /> },
                            { id: 'arrow', icon: <ArrowRight size={20} /> },
                            { id: 'semicircle', icon: <div className="w-5 h-2.5 bg-gray-400 rounded-t-full" /> }
                        ].map(s => (
                            <button key={s.id} onClick={(e) => addShape(s.id, e)} className="p-3 hover:bg-gray-50 rounded-lg text-gray-500 flex items-center justify-center transition-colors">
                                {s.icon}
                            </button>
                        ))}
                    </div>
                )}

                {showEmojiPicker && (
                    <div className="absolute top-16 left-56 z-[100] bg-white rounded-xl shadow-2xl border border-gray-200 p-3 w-72 max-h-64 overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="grid grid-cols-6 gap-2"> {DRAW_EMOJIS.map((em, i) => <button key={i} onClick={(e) => addEmoji(em, e)} className="text-2xl p-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center">{em}</button>)} </div>
                    </div>
                )}

                <canvas ref={canvasRef}
                    className={`absolute inset-0 w-full h-full touch-none z-10 ${tool === 'move' ? 'pointer-events-none' : 'pointer-events-auto shadow-inner'}`}
                    onPointerDown={handleCanvasPointerDown}
                    style={{ border: (tool === 'move' && selectedItem?.type === 'drawing') ? '2px dashed #3b82f6' : 'none' }}
                />

                {showEmojiPicker && (
                    <div className="absolute top-16 left-4 z-[100] bg-white rounded-xl shadow-2xl border border-gray-200 p-3 w-72 max-h-56 overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                        <div className="grid grid-cols-6 gap-2"> {DRAW_EMOJIS.map((em, i) => <button key={i} onClick={(e) => addEmoji(em, e)} className="text-2xl p-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center">{em}</button>)} </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WhiteboardWidget;
