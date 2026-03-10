import React, { useRef, useState, useEffect } from 'react';
import {
  Layout, MousePointer2, Pencil, Eraser, Type, Smile, Shapes,
  Undo2, Redo2, Trash2, Download, RotateCcw, Triangle, Hexagon,
  ArrowRight, RotateCw
} from 'lucide-react';

const DRAWING_EMOJIS = ['⭐', '❤️', '✅', '❌', '👍', '👎', '🎯', '🏆', '🔥', '💡', '📌', '🎨', '📄', '🌟', '✨', '🎉', '💯', '👀', '🤔', '💪', '🌈', '⚡', '🎁', '😊', '🙌', '🎵', '🌸', '🍎', '🚀', '💎'];

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

const DrawingWidget = ({ widget, updateData }) => {
  const {
    color = '#000000',
    brushSize = 8,
    tool = 'pen',
    textItems = [],
    emojiItems = [],
    imageItems = [],
    shapeItems = [],
    drawOffset = { x: 0, y: 0 },
    bgType = 'none',
    canvasData
  } = widget.data;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<any>(null);
  const lastTime = useRef<number | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showShapePicker, setShowShapePicker] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const resizeTimeout = useRef<any>(null);

  const BG_TEMPLATES = [
    { id: 'none', label: 'None', icon: 'None' },
    { id: 'grid', label: 'Grid', style: { backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)', backgroundSize: '30px 30px' } },
    { id: 'dots', label: 'Dots', style: { backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' } },
    { id: 'lines', label: 'Lines', style: { backgroundImage: 'linear-gradient(#f1f5f9 1.5px, transparent 1.5px)', backgroundSize: '100% 30px' } },
    { id: 'dark-grid', label: 'Blueprint', style: { backgroundColor: '#1e293b', backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)', backgroundSize: '30px 30px' } }
  ];

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageData = canvas.toDataURL();
    setHistory(prev => [...prev.slice(0, historyIndex + 1), imageData]);
    setHistoryIndex(prev => prev + 1);
    updateData(widget.id, { canvasData: imageData });
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    if (bgType === 'none' || !BG_TEMPLATES.find(t => t.id === bgType)?.style?.backgroundColor) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);
    }

    if (canvasData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, img.width / dpr, img.height / dpr);
        if (history.length === 0) {
            setHistory([canvasData]);
            setHistoryIndex(0);
        }
      };
      img.src = canvasData;
    } else if (history.length === 0) {
      saveToHistory();
    }

    ctxRef.current = ctx;
  }, [bgType]);

  const lastDimensions = useRef({ width: 0, height: 0 });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleResize = () => {
      clearTimeout(resizeTimeout.current);
      resizeTimeout.current = setTimeout(() => {
        const parent = canvas.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        if (Math.abs(rect.width - lastDimensions.current.width) < 5 &&
          Math.abs(rect.height - lastDimensions.current.height) < 5) {
          return;
        }
        lastDimensions.current = { width: rect.width, height: rect.height };
        const imageData = canvas.toDataURL();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        const img = new Image();
        img.onload = () => {
          if (!ctxRef.current) return;
          ctxRef.current.scale(dpr, dpr);
          ctxRef.current.fillStyle = '#ffffff';
          ctxRef.current.fillRect(0, 0, rect.width, rect.height);
          ctxRef.current.drawImage(img, 0, 0, img.width / dpr, img.height / dpr);
        };
        img.src = imageData;
      }, 50);
    };
    const observer = new ResizeObserver(handleResize);
    observer.observe(canvas.parentElement!);
    return () => { observer.disconnect(); clearTimeout(resizeTimeout.current); };
  }, []);

  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    const img = new Image();
    img.onload = () => {
      const parent = canvasRef.current?.parentElement;
      if (!parent || !ctxRef.current) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      ctxRef.current.fillStyle = '#ffffff';
      ctxRef.current.fillRect(0, 0, rect.width, rect.height);
      ctxRef.current.drawImage(img, 0, 0, img.width / dpr, img.height / dpr);
    };
    img.src = history[newIndex];
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    const img = new Image();
    img.onload = () => {
      const parent = canvasRef.current?.parentElement;
      if (!parent || !ctxRef.current) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      ctxRef.current.fillStyle = '#ffffff';
      ctxRef.current.fillRect(0, 0, rect.width, rect.height);
      ctxRef.current.drawImage(img, 0, 0, img.width / dpr, img.height / dpr);
    };
    img.src = history[newIndex];
  };

  const getPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, time: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0)) - rect.top;
    return { x, y, time: performance.now() };
  };

  const points = useRef<any[]>([]);
  const smoothedVelocity = useRef(0);
  const currentWidth = useRef<number | null>(null);

  const startDrawing = (e: any) => {
    if (tool !== 'pen' && tool !== 'eraser') return;
    // e.preventDefault(); // Might trigger warning in Chrome for passive listeners
    isDrawing.current = true;
    const pos = getPos(e);
    lastPoint.current = pos;
    lastTime.current = pos.time;
    points.current = [pos];
    smoothedVelocity.current = 0;
    currentWidth.current = brushSize;

    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x + 0.1, pos.y + 0.1);
    ctx.stroke();

    window.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDrawing);
    window.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', stopDrawing);
  };

  const draw = (e: any) => {
    if (!isDrawing.current || !lastPoint.current) return;
    if (e.type === 'touchmove') e.preventDefault();
    const pos = getPos(e);
    const ctx = ctxRef.current;
    if (!ctx) return;

    const dx = pos.x - lastPoint.current.x;
    const dy = pos.y - lastPoint.current.y;
    const dt = Math.max(pos.time - lastTime.current!, 1);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const velocity = distance / dt;

    smoothedVelocity.current = smoothedVelocity.current * 0.6 + velocity * 0.4;
    const speedFactor = tool === 'eraser' ? 3 : Math.max(0.5, Math.min(1.8, 1.6 - smoothedVelocity.current * 0.1));
    const targetWidth = brushSize * speedFactor;

    const prevWidth = currentWidth.current || brushSize;
    currentWidth.current = prevWidth * 0.7 + targetWidth * 0.3;

    ctx.fillStyle = tool === 'eraser' ? '#ffffff' : color;
    const steps = Math.max(1, Math.ceil(distance / 2));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = lastPoint.current.x + dx * t;
      const y = lastPoint.current.y + dy * t;
      const w = prevWidth + (currentWidth.current - prevWidth) * t;

      ctx.beginPath();
      ctx.arc(x, y, w / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPoint.current = pos;
    lastTime.current = pos.time;
  };

  const stopDrawing = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      ctxRef.current?.closePath();
      saveToHistory();
    }
    window.removeEventListener('mousemove', draw);
    window.removeEventListener('mouseup', stopDrawing);
    window.removeEventListener('touchmove', draw);
    window.removeEventListener('touchend', stopDrawing);
  };

  const handleCanvasClick = (e: any) => {
    if (tool === 'text') {
      const pos = getPos(e);
      const newText = { id: Date.now().toString(), x: pos.x, y: pos.y, text: 'Text', scale: 1, rotation: 0, color };
      updateData(widget.id, { textItems: [...textItems, newText], tool: 'select' });
      setSelectedItem({ type: 'text', id: newText.id });
    }
  };

  const addEmoji = (emoji: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newEmoji = { id: Date.now().toString(), x: canvas.width / (2 * (window.devicePixelRatio || 1)), y: canvas.height / (2 * (window.devicePixelRatio || 1)), emoji, scale: 1, rotation: 0 };
    updateData(widget.id, { emojiItems: [...emojiItems, newEmoji], tool: 'select' });
    setShowEmojiPicker(false);
    setSelectedItem({ type: 'emoji', id: newEmoji.id });
  };

  const updateTextContent = (id: string, text: string) => {
    updateData(widget.id, { textItems: textItems.map((t: any) => t.id === id ? { ...t, text } : t) });
  };

  const deleteSelected = () => {
    if (!selectedItem) return;
    if (selectedItem.type === 'text') {
      updateData(widget.id, { textItems: textItems.filter((t: any) => t.id !== selectedItem.id) });
    } else if (selectedItem.type === 'emoji') {
      updateData(widget.id, { emojiItems: emojiItems.filter((e: any) => e.id !== selectedItem.id) });
    } else if (selectedItem.type === 'image') {
      updateData(widget.id, { imageItems: imageItems.filter((img: any) => img.id !== selectedItem.id) });
    } else if (selectedItem.type === 'shape') {
      updateData(widget.id, { shapeItems: shapeItems.filter((s: any) => s.id !== selectedItem.id) });
    }
    setSelectedItem(null);
  };

  const addShape = (shapeType: string) => {
    const newShape = { id: Date.now().toString(), x: 150, y: 150, shapeType, color, scale: 1, rotation: 0 };
    updateData(widget.id, { shapeItems: [...shapeItems, newShape], tool: 'select' });
    setShowShapePicker(false);
    setSelectedItem({ type: 'shape', id: newShape.id });
  };

  const clearCanvas = () => {
    if (!window.confirm('Clear the entire canvas?')) return;
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateData(widget.id, { textItems: [], emojiItems: [], shapeItems: [], imageItems: [] });
    setSelectedItem(null);
    saveToHistory();
  };

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleItemMouseDown = (e: any, type: string, id: string, mode = 'move') => {
    if (tool !== 'select' && type !== 'drawing') return;
    e.stopPropagation();
    e.preventDefault();
    setSelectedItem({ type, id });

    let item: any;
    if (type === 'text') item = textItems.find((i: any) => i.id === id);
    else if (type === 'emoji') item = emojiItems.find((i: any) => i.id === id);
    else if (type === 'image') item = imageItems.find((i: any) => i.id === id);
    else if (type === 'shape') item = shapeItems.find((i: any) => i.id === id);
    else if (type === 'drawing') item = { x: drawOffset.x, y: drawOffset.y, scale: 1, rotation: 0 };

    if (!item) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startItemX = item.x;
    const startItemY = item.y;
    const startScale = item.scale || 1;
    const startRotation = item.rotation || 0;

    const onMove = (me: any) => {
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;

      if (mode === 'move') {
        if (type === 'drawing') {
          updateData(widget.id, { drawOffset: { x: startItemX + dx, y: startItemY + dy } });
        } else {
          const listKey = type + 'Items';
          const list = type === 'text' ? textItems : (type === 'emoji' ? emojiItems : (type === 'image' ? imageItems : shapeItems));
          updateData(widget.id, { [listKey]: list.map((i: any) => i.id === id ? { ...i, x: startItemX + dx, y: startItemY + dy } : i) });
        }
      } else if (mode === 'scale' && type !== 'drawing') {
        const dist = Math.sqrt(dx * dx + dy * dy);
        const factor = 1 + (dx > 0 ? dist / 200 : -dist / 200);
        const newScale = Math.max(0.1, Math.min(10, startScale * factor));
        const listKey = type + 'Items';
        const list = type === 'text' ? textItems : (type === 'emoji' ? emojiItems : (type === 'image' ? imageItems : shapeItems));
        updateData(widget.id, { [listKey]: list.map((i: any) => i.id === id ? { ...i, scale: newScale } : i) });
      } else if (mode === 'rotate' && type !== 'drawing') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const canvasRect = canvas.getBoundingClientRect();
        const mouseX = me.clientX - canvasRect.left;
        const mouseY = me.clientY - canvasRect.top;
        const angle = Math.atan2(mouseY - item.y, mouseX - item.x) * (180 / Math.PI);
        const listKey = type + 'Items';
        const list = type === 'text' ? textItems : (type === 'emoji' ? emojiItems : (type === 'image' ? imageItems : shapeItems));
        updateData(widget.id, { [listKey]: list.map((i: any) => i.id === id ? { ...i, rotation: angle + 90 } : i) });
      }
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const COLORS = ['#000000', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'];

  useEffect(() => {
    const initialImage = widget.data.initialImage;
    const pastedImage = widget.data.pastedImage;
    const imgToLoad = pastedImage || initialImage;

    if (imgToLoad) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.8;
        const newImg = {
          id: Date.now().toString(),
          src: imgToLoad,
          x: canvas.width / (2 * (window.devicePixelRatio || 1)),
          y: canvas.height / (2 * (window.devicePixelRatio || 1)),
          baseWidth: img.width,
          baseHeight: img.height,
          scale: scale,
          rotation: 0
        };
        updateData(widget.id, {
          imageItems: [...imageItems, newImg],
          initialImage: null,
          pastedImage: null
        });
        setSelectedItem({ type: 'image', id: newImg.id });
      };
      img.src = imgToLoad;
    }
  }, [widget.data.initialImage, widget.data.pastedImage]);

  return (
    <div className="h-full bg-white flex flex-col min-h-0 relative no-drag">
      <div className="bg-gray-50 p-2 border-b flex items-center gap-1 shrink-0 z-20 flex-nowrap overflow-x-auto custom-scrollbar">
        <button onClick={() => setShowBgPicker(!showBgPicker)} className={`p-1.5 rounded-lg transition-all ${bgType !== 'none' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200 text-gray-500'}`} title="Background Template">
          <Layout size={16} />
        </button>
        <div className="w-px h-5 bg-gray-200" />
        <div className="relative">
          <button onClick={() => setShowColorPicker(!showColorPicker)} className="w-7 h-7 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: color }} />
        </div>
        <div className="w-px h-5 bg-gray-200" />
        <button onClick={() => updateData(widget.id, { tool: 'select' })} className={`p-1.5 rounded-lg transition-all ${tool === 'select' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`} title="Select"><MousePointer2 size={16} /></button>
        <button onClick={() => updateData(widget.id, { tool: 'pen' })} className={`p-1.5 rounded-lg transition-all ${tool === 'pen' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`} title="Pen"><Pencil size={16} /></button>
        <button onClick={() => updateData(widget.id, { tool: 'eraser' })} className={`p-1.5 rounded-lg transition-all ${tool === 'eraser' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`} title="Eraser"><Eraser size={16} /></button>
        <button onClick={() => updateData(widget.id, { tool: 'text' })} className={`p-1.5 rounded-lg transition-all ${tool === 'text' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`} title="Text"><Type size={16} /></button>
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-1.5 rounded-lg transition-all ${showEmojiPicker ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`} title="Emoji"><Smile size={16} /></button>
        <button onClick={() => setShowShapePicker(!showShapePicker)} className={`p-1.5 rounded-lg transition-all ${showShapePicker ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'}`} title="Shapes"><Shapes size={16} /></button>
        <div className="w-px h-5 bg-gray-200" />
        <input type="range" min="2" max="40" value={brushSize} onChange={(e) => updateData(widget.id, { brushSize: Number(e.target.value) })} className="w-16 h-1 accent-blue-500" title={`Size: ${brushSize}`} />
        <div className="w-px h-5 bg-gray-200" />
        <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30" title="Undo"><Undo2 size={16} /></button>
        <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30" title="Redo"><Redo2 size={16} /></button>
        {selectedItem && <button onClick={deleteSelected} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100" title="Delete"><Trash2 size={16} /></button>}
        <div className="w-px h-5 bg-gray-200 ml-auto" />
        <div className="flex gap-1">
          <button onClick={downloadPNG} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-green-600" title="Download"><Download size={16} /></button>
          <button onClick={clearCanvas} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-500" title="Clear"><RotateCcw size={16} /></button>
        </div>
      </div>

      {showColorPicker && (
        <div className="absolute top-12 left-4 z-[100] bg-white p-2 rounded-xl shadow-2xl flex gap-1 border animate-in zoom-in-95 duration-200">
          {COLORS.map(c => (
            <button key={c} onClick={() => { updateData(widget.id, { color: c }); setShowColorPicker(false); }} className="w-6 h-6 rounded-full border hover:scale-125 transition-transform shadow-sm" style={{ backgroundColor: c, borderColor: c === '#ffffff' ? '#ddd' : c }} />
          ))}
        </div>
      )}

      {showEmojiPicker && (
        <div className="absolute top-12 left-10 z-[100] bg-white rounded-xl shadow-2xl border p-3 w-64 max-h-64 overflow-y-auto animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="grid grid-cols-6 gap-1">
            {DRAWING_EMOJIS.map((em, i) => (
              <button key={i} onClick={() => addEmoji(em)} className="text-xl p-1 rounded hover:bg-blue-50 hover:scale-110 transition-transform">{em}</button>
            ))}
          </div>
        </div>
      )}

      {showShapePicker && (
        <div className="absolute top-12 left-16 z-[100] bg-white rounded-xl shadow-2xl border p-2 w-48 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'square', label: 'Square', icon: <div className="w-6 h-6 bg-slate-400" /> },
              { id: 'circle', label: 'Circle', icon: <div className="w-6 h-6 bg-slate-400 rounded-full" /> },
              { id: 'triangle', label: 'Triangle', icon: <Triangle size={24} className="text-slate-400" /> },
              { id: 'hexagon', label: 'Hexagon', icon: <Hexagon size={24} className="text-slate-400" /> },
              { id: 'arrow', label: 'Arrow', icon: <ArrowRight size={24} className="text-slate-400" /> },
              { id: 'semicircle', label: 'Semicircle', icon: <div className="w-6 h-3 bg-slate-400 rounded-t-full" /> }
            ].map(s => (
              <button key={s.id} onClick={() => addShape(s.id)} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 transition-colors" title={s.label}>
                {s.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      {showBgPicker && (
        <div className="absolute top-12 left-2 z-[100] bg-white p-2 rounded-xl shadow-2xl flex flex-col gap-1 border min-w-[140px] animate-in zoom-in-95 duration-200">
          {BG_TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => { updateData(widget.id, { bgType: t.id }); setShowBgPicker(false); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${bgType === t.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-600'}`}
            >
              <div className="w-5 h-5 rounded border border-slate-200 shrink-0" style={t.style} />
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div
        className="flex-1 relative overflow-hidden bg-white min-h-0"
        style={BG_TEMPLATES.find(t => t.id === bgType)?.style || {}}
        onMouseDown={() => tool === 'select' && setSelectedItem(null)}
      >
        <div
          className="absolute inset-0 transition-shadow"
          style={{
            transform: `translate(${drawOffset.x}px, ${drawOffset.y}px)`,
            width: '100%',
            height: '100%',
            zIndex: selectedItem?.type === 'drawing' ? 10 : 0,
            border: (tool === 'select' && selectedItem?.type === 'drawing') ? '2px dashed #3b82f6' : 'none'
          }}
        >
          <canvas
            ref={canvasRef}
            className={`w-full h-full touch-none ${tool === 'pen' || tool === 'eraser' ? 'cursor-crosshair' : tool === 'select' ? 'cursor-move' : tool === 'text' ? 'cursor-text' : 'cursor-default'}`}
            onMouseDown={(e) => {
              if (tool === 'select') {
                handleItemMouseDown(e, 'drawing', 'layer');
              } else {
                startDrawing(e);
              }
            }}
            onClick={handleCanvasClick}
            onTouchStart={startDrawing}
          />
        </div>

        {imageItems.map((img: any) => {
          const imgScale = img.scale || 1;
          const w = (img.baseWidth || 100) * imgScale;
          const h = (img.baseHeight || 100) * imgScale;
          return (
            <div
              key={img.id}
              className="absolute"
              style={{ left: img.x, top: img.y, zIndex: selectedItem?.id === img.id ? 15 : 5 }}
            >
              <div
                className="cursor-move group"
                style={{
                  transform: `translate(-50%, -50%) rotate(${img.rotation}deg)`,
                  transformOrigin: 'center',
                  pointerEvents: tool === 'select' ? 'auto' : 'none'
                }}
                onMouseDown={(e) => handleItemMouseDown(e, 'image', img.id, 'move')}
              >
                <img
                  src={img.src}
                  alt=""
                  className={`max-w-none shadow-sm transition-shadow ${selectedItem?.id === img.id ? 'ring-2 ring-blue-500 shadow-xl' : 'group-hover:ring-1 group-hover:ring-blue-200'}`}
                  style={{ width: w, height: h }}
                />
                {selectedItem?.id === img.id && (
                  <>
                    <div
                      className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-grab shadow z-20 flex items-center justify-center -top-8 left-1/2 -translate-x-1/2"
                      onMouseDown={(e) => handleItemMouseDown(e, 'image', img.id, 'rotate')}
                      title="Rotate"
                    >
                      <RotateCw size={10} className="text-blue-500" />
                    </div>
                    <div
                      className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize shadow z-20 -bottom-2 -right-2"
                      onMouseDown={(e) => handleItemMouseDown(e, 'image', img.id, 'scale')}
                      title="Scale"
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}

        {textItems.map((t: any) => {
          const textScale = t.scale || 1;
          const baseHeight = 32;
          const baseWidth = Math.max(60, (t.text?.length || 0) * 11 + 20);
          return (
            <div key={t.id} className="absolute" style={{ left: t.x, top: t.y, zIndex: selectedItem?.id === t.id ? 10 : 1 }}>
              {selectedItem?.id === t.id && (
                <div className="absolute border-2 border-blue-500 rounded pointer-events-none"
                  style={{
                    width: baseWidth * textScale + 4,
                    height: baseHeight * textScale + 4,
                    top: -(baseHeight * textScale) / 2 - 2,
                    left: -(baseWidth * textScale) / 2 - 2,
                    transform: `rotate(${t.rotation}deg)`
                  }} />
              )}
              <div
                className="cursor-move select-none"
                style={{
                  transform: `translate(-50%, -50%) rotate(${t.rotation}deg) scale(${textScale})`,
                  transformOrigin: 'center',
                  pointerEvents: tool === 'select' ? 'auto' : 'none'
                }}
                onMouseDown={(e) => handleItemMouseDown(e, 'text', t.id, 'move')}
              >
                <input
                  type="text"
                  value={t.text}
                  onChange={(e) => updateTextContent(t.id, e.target.value)}
                  className="bg-transparent border-none outline-none text-center font-bold text-xl px-2 py-0 min-w-[40px] leading-tight"
                  style={{ color: t.color, cursor: tool === 'select' ? 'text' : 'inherit' }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {selectedItem?.id === t.id && (
                <div style={{ transform: `rotate(${t.rotation}deg)`, position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
                  <div className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-grab shadow z-20 flex items-center justify-center"
                    style={{ top: -(baseHeight * textScale) / 2 - 12, left: -10 }}
                    onMouseDown={(e) => handleItemMouseDown(e, 'text', t.id, 'rotate')} title="Rotate">
                    <RotateCw size={10} className="text-blue-500" />
                  </div>
                  <div className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize shadow z-20"
                    style={{ top: (baseHeight * textScale) / 2 - 10, left: (baseWidth * textScale) / 2 - 10 }}
                    onMouseDown={(e) => handleItemMouseDown(e, 'text', t.id, 'scale')} title="Scale" />
                </div>
              )}
            </div>
          );
        })}

        {shapeItems.map((s: any) => {
          const shapeScale = s.scale || 1;
          const boxSize = 60 * shapeScale;
          return (
            <div key={s.id} className="absolute" style={{ left: s.x, top: s.y, zIndex: selectedItem?.id === s.id ? 10 : 1 }}>
              {selectedItem?.id === s.id && (
                <div className="absolute border-2 border-blue-500 rounded pointer-events-none"
                  style={{
                    width: boxSize + 10,
                    height: boxSize + 10,
                    top: -boxSize / 2 - 5,
                    left: -boxSize / 2 - 5,
                    transform: `rotate(${s.rotation}deg)`
                  }} />
              )}
              <div
                className="cursor-move select-none"
                style={{
                  transform: `translate(-50%, -50%)`,
                  pointerEvents: tool === 'select' ? 'auto' : 'none'
                }}
                onMouseDown={(e) => handleItemMouseDown(e, 'shape', s.id, 'move')}
              >
                <Shape type={s.shapeType} color={s.color} scale={shapeScale} rotation={s.rotation} />
              </div>
              {selectedItem?.id === s.id && (
                <div style={{ transform: `rotate(${s.rotation}deg)`, position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
                  <div className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-grab shadow z-20 flex items-center justify-center font-bold text-blue-500"
                    style={{ top: -boxSize / 2 - 18, left: -10 }}
                    onMouseDown={(e) => handleItemMouseDown(e, 'shape', s.id, 'rotate')} title="Rotate">
                    <RotateCw size={10} />
                  </div>
                  <div className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize shadow z-20"
                    style={{ top: boxSize / 2 - 10, left: boxSize / 2 - 10 }}
                    onMouseDown={(e) => handleItemMouseDown(e, 'shape', s.id, 'scale')} title="Scale" />
                </div>
              )}
            </div>
          );
        })}

        {emojiItems.map((em: any) => {
          const emojiScale = em.scale || 1;
          const emojiSize = 30 * emojiScale;
          const boxSize = emojiSize + 8;
          return (
            <div key={em.id} className="absolute" style={{ left: em.x, top: em.y, zIndex: selectedItem?.id === em.id ? 10 : 1 }}>
              {selectedItem?.id === em.id && (
                <div className="absolute border-2 border-blue-500 rounded pointer-events-none"
                  style={{
                    width: boxSize + 4,
                    height: boxSize + 4,
                    top: -boxSize / 2 - 2,
                    left: -boxSize / 2 - 2,
                    transform: `rotate(${em.rotation}deg)`
                  }} />
              )}
              <div
                className="cursor-move select-none text-3xl"
                style={{
                  transform: `translate(-50%, -50%) rotate(${em.rotation}deg) scale(${emojiScale})`,
                  transformOrigin: 'center',
                  pointerEvents: tool === 'select' ? 'auto' : 'none',
                  userSelect: 'none'
                }}
                onMouseDown={(e) => handleItemMouseDown(e, 'emoji', em.id, 'move')}
              >
                {em.emoji}
              </div>
              {selectedItem?.id === em.id && (
                <div style={{ transform: `rotate(${em.rotation}deg)`, position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
                  <div className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-grab shadow z-20 flex items-center justify-center"
                    style={{ top: -boxSize / 2 - 12, left: -10 }}
                    onMouseDown={(e) => handleItemMouseDown(e, 'emoji', em.id, 'rotate')} title="Rotate">
                    <RotateCw size={10} className="text-blue-500" />
                  </div>
                  <div className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize shadow z-20"
                    style={{ top: boxSize / 2 - 10, left: boxSize / 2 - 10 }}
                    onMouseDown={(e) => handleItemMouseDown(e, 'emoji', em.id, 'scale')} title="Scale" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DrawingWidget;
