import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Layout, MousePointer2, Pencil, Eraser, Type, Smile, Shapes,
  Undo2, Redo2, Trash2, Download, RotateCcw, Triangle, Hexagon,
  ArrowRight, RotateCw, Square, Circle, Diamond, Star, Image as ImageIcon,
  BringToFront, SendToBack, ChevronUp, ChevronDown, Copy, Palette, Type as FontIcon,
  Maximize2, ArrowUpRight
} from 'lucide-react';

// --- Types ---

type ElementType = 'path' | 'line' | 'rect' | 'circle' | 'triangle' | 'diamond' | 'hexagon' | 'star' | 'arrow' | 'text' | 'emoji' | 'image';

interface DrawingElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  content?: string; // For text, emoji, image src, or path data
  points?: { x: number; y: number }[]; // For freehand paths
}

// --- Constants ---

const DRAWING_EMOJIS = ['⭐', '❤️', '✅', '❌', '👍', '👎', '🎯', '🏆', '🔥', '💡', '📌', '🎨', '📄', '🌟', '✨', '🎉', '💯', '👀', '🤔', '💪', '🌈', '⚡', '🎁', '😊', '🙌', '🎵', '🌸', '🍎', '🚀', '💎'];
const COLORS = ['#000000', '#ffffff', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', 'transparent'];

const BG_TEMPLATES = [
  { id: 'none', label: 'None', style: { backgroundColor: '#ffffff' } },
  { id: 'grid', label: 'Grid', style: { backgroundImage: 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)', backgroundSize: '30px 30px' } },
  { id: 'lines', label: 'Lines', style: { backgroundImage: 'linear-gradient(#f1f5f9 1px, transparent 1px)', backgroundSize: '100% 30px' } },
  { id: 'dots', label: 'Dots', style: { backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' } },
  { id: 'blueprint', label: 'Blueprint', style: { backgroundColor: '#1e293b', backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)', backgroundSize: '30px 30px' } }
];

// --- Sub-components ---

const ShapeRenderer = ({ element }: { element: DrawingElement }) => {
  const { type, width, height, fill, stroke, strokeWidth, points, content } = element;
  
  const commonProps = {
    fill: fill === 'transparent' ? 'none' : fill,
    stroke: stroke,
    strokeWidth: strokeWidth,
    width: width,
    height: height
  };

  switch (type) {
    case 'rect':
      return <rect {...commonProps} />;
    case 'line':
      return <line x1={0} y1={0} x2={width} y2={height} stroke={stroke} strokeWidth={strokeWidth} />;
    case 'circle':
      return <ellipse cx={width / 2} cy={height / 2} rx={width / 2} ry={height / 2} {...commonProps} />;
    case 'triangle':
      return <path d={`M ${width / 2} 0 L ${width} ${height} L 0 ${height} Z`} {...commonProps} />;
    case 'diamond':
      return <path d={`M ${width / 2} 0 L ${width} ${height / 2} L ${width / 2} ${height} L 0 ${height / 2} Z`} {...commonProps} />;
    case 'hexagon':
      return <path d={`M ${width * 0.25} 0 L ${width * 0.75} 0 L ${width} ${height * 0.5} L ${width * 0.75} ${height} L ${width * 0.25} ${height} L 0 ${height * 0.5} Z`} {...commonProps} />;
    case 'star':
      return <path d={`M ${width * 0.5} 0 L ${width * 0.61} ${height * 0.35} L ${width} ${height * 0.35} L ${width * 0.68} ${height * 0.57} L ${width * 0.79} ${height} L ${width * 0.5} ${height * 0.75} L ${width * 0.21} ${height} L ${width * 0.32} ${height * 0.57} L 0 ${height * 0.35} L ${width * 0.39} ${height * 0.35} Z`} {...commonProps} />;
    case 'arrow':
      return (
        <g {...commonProps}>
          <path d={`M 0 ${height * 0.35} L ${width * 0.6} ${height * 0.35} L ${width * 0.6} 0 L ${width} ${height * 0.5} L ${width * 0.6} ${height} L ${width * 0.6} ${height * 0.65} L 0 ${height * 0.65} Z`} />
        </g>
      );
    case 'path':
        if (!points || points.length < 2) return null;
        const d = points.reduce((acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), "");
        return <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />;
    case 'text':
      return (
        <foreignObject width={width} height={height}>
          <div style={{ color: stroke, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.min(width, height) * 0.4, fontWeight: 'bold', overflow: 'hidden', textAlign: 'center' }}>
            {content}
          </div>
        </foreignObject>
      );
    case 'emoji':
        return (
          <foreignObject width={width} height={height}>
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.min(width, height) * 0.8, userSelect: 'none' }}>
              {content}
            </div>
          </foreignObject>
        );
    case 'image':
        return <image href={content} width={width} height={height} preserveAspectRatio="none" />;
    default:
      return null;
  }
};

// --- Main Component ---

const DrawingWidget = ({ widget, updateData }) => {
  const {
    elements = [],
    tool = 'select',
    selectionId = null,
    bgType = 'none',
    activeColor = '#3b82f6',
    activeStroke = '#000000',
    activeSize = 4
  } = widget.data;

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragMode, setDragMode] = useState<'move' | 'resize' | 'rotate' | 'draw' | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  
  // History for standard Undo/Redo
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = useCallback((newData: any) => {
    setHistory(prev => {
        const next = [...prev.slice(0, historyIndex + 1), newData];
        if (next.length > 50) next.shift();
        return next;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
        const prev = history[historyIndex - 1];
        setHistoryIndex(historyIndex - 1);
        updateData(widget.id, prev);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
        const next = history[historyIndex + 1];
        setHistoryIndex(historyIndex + 1);
        updateData(widget.id, next);
    }
  };

  // --- Helpers ---

  const getRelativeCoords = (e: any) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    return { x, y };
  };

  const findElementById = (id: string) => elements.find((el: any) => el.id === id);

  // --- Tool Actions ---

  const addElement = (type: ElementType, x: number, y: number, content?: string) => {
    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type,
      x,
      y,
      width: 100,
      height: 100,
      rotation: 0,
      fill: type === 'path' ? 'transparent' : (type === 'text' || type === 'image' || type === 'emoji' ? 'transparent' : activeColor),
      stroke: activeStroke,
      strokeWidth: type === 'path' ? activeSize : (type === 'rect' || type === 'circle' ? 2 : 0),
      opacity: 1,
      content,
    };

    const newElements = [...elements, newElement];
    updateData(widget.id, { elements: newElements, selectionId: newElement.id, tool: 'select' });
    saveToHistory({ elements: newElements, selectionId: newElement.id });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const { x, y } = getRelativeCoords(e);
    
    if (tool === 'pen') {
        const newId = Date.now().toString();
        const newElement: DrawingElement = {
            id: newId,
            type: 'path',
            x: 0, y: 0,
            width: 1, height: 1,
            rotation: 0,
            fill: 'transparent',
            stroke: activeStroke,
            strokeWidth: activeSize,
            opacity: 1,
            points: [{ x, y }]
        };
        const newElements = [...elements, newElement];
        updateData(widget.id, { elements: newElements, selectionId: newId });
        setIsDragging(true);
        setDragMode('draw');
        setDragStart({ x, y });
        return;
    }

    if (tool === 'line') {
        const newId = Date.now().toString();
        const newElement: DrawingElement = {
            id: newId,
            type: 'line',
            x, y,
            width: 1, height: 1,
            rotation: 0,
            fill: 'transparent',
            stroke: activeStroke,
            strokeWidth: activeSize,
            opacity: 1
        };
        const newElements = [...elements, newElement];
        updateData(widget.id, { elements: newElements, selectionId: newId });
        setIsDragging(true);
        setDragMode('resize');
        setResizeHandle('se');
        setDragStart({ x, y });
        return;
    }

    if (tool === 'text') {
        addElement('text', x - 50, y - 50, 'Text');
        return;
    }

    if (tool === 'eraser') {
        const targetElement = (e.target as any).closest('.drawing-element');
        if (targetElement) {
            const id = targetElement.dataset.id;
            const newElements = elements.filter((el: any) => el.id !== id);
            updateData(widget.id, { elements: newElements, selectionId: null });
            saveToHistory({ elements: newElements, selectionId: null });
        }
        return;
    }

    // Default select/move logic
    const targetElement = (e.target as any).closest('.drawing-element');
    const handle = (e.target as any).closest('.resize-handle');
    const rotateHandle = (e.target as any).closest('.rotate-handle');

    if (rotateHandle) {
        setIsDragging(true);
        setDragMode('rotate');
        setDragStart({ x, y });
        return;
    }

    if (handle) {
        setIsDragging(true);
        setDragMode('resize');
        setResizeHandle(handle.dataset.handle);
        setDragStart({ x, y });
        return;
    }

    if (targetElement) {
      const id = targetElement.dataset.id;
      updateData(widget.id, { selectionId: id });
      setIsDragging(true);
      setDragMode('move');
      setDragStart({ x, y });
    } else {
      updateData(widget.id, { selectionId: null });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !selectionId) return;
    const { x, y } = getRelativeCoords(e);
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    if (dragMode === 'draw') {
        const newElements = elements.map((el: any) => {
            if (el.id === selectionId) {
                return { ...el, points: [...(el.points || []), { x, y }] };
            }
            return el;
        });
        updateData(widget.id, { elements: newElements });
        return;
    }

    const element = findElementById(selectionId);
    if (!element) return;

    if (dragMode === 'move') {
      const newElements = elements.map((el: any) => 
        el.id === selectionId ? { ...el, x: el.x + dx, y: el.y + dy } : el
      );
      updateData(widget.id, { elements: newElements });
      setDragStart({ x, y });
    } else if (dragMode === 'resize' && resizeHandle) {
        let newEl = { ...element };
        if (resizeHandle.includes('e')) newEl.width = Math.max(10, element.width + dx);
        if (resizeHandle.includes('s')) newEl.height = Math.max(10, element.height + dy);
        if (resizeHandle.includes('w')) {
            const dw = Math.min(element.width - 10, -dx);
            newEl.width = element.width + dw;
            newEl.x = element.x - dw;
        }
        if (resizeHandle.includes('n')) {
            const dh = Math.min(element.height - 10, -dy);
            newEl.height = element.height + dh;
            newEl.y = element.y - dh;
        }
        
        const newElements = elements.map((el: any) => el.id === selectionId ? newEl : el);
        updateData(widget.id, { elements: newElements });
        setDragStart({ x, y });
    } else if (dragMode === 'rotate') {
        const cx = element.x + element.width / 2;
        const cy = element.y + element.height / 2;
        const angle = Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 90;
        const newElements = elements.map((el: any) => el.id === selectionId ? { ...el, rotation: angle } : el);
        updateData(widget.id, { elements: newElements });
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
        setIsDragging(false);
        setDragMode(null);
        setResizeHandle(null);
        saveToHistory({ elements, selectionId });
    }
  };

  const deleteElement = () => {
    if (!selectionId) return;
    const newElements = elements.filter((el: any) => el.id !== selectionId);
    updateData(widget.id, { elements: newElements, selectionId: null });
    saveToHistory({ elements: newElements, selectionId: null });
  };

  const duplicateElement = () => {
    if (!selectionId) return;
    const el = findElementById(selectionId);
    if (!el) return;
    const newEl = { ...el, id: Date.now().toString(), x: el.x + 20, y: el.y + 20 };
    const newElements = [...elements, newEl];
    updateData(widget.id, { elements: newElements, selectionId: newEl.id });
    saveToHistory({ elements: newElements, selectionId: newEl.id });
  };

  const moveLayer = (direction: 'up' | 'down' | 'front' | 'back') => {
    if (!selectionId) return;
    const idx = elements.findIndex((el: any) => el.id === selectionId);
    const newElements = [...elements];
    const item = newElements.splice(idx, 1)[0];

    if (direction === 'up') newElements.splice(Math.min(newElements.length, idx + 1), 0, item);
    else if (direction === 'down') newElements.splice(Math.max(0, idx - 1), 0, item);
    else if (direction === 'front') newElements.push(item);
    else if (direction === 'back') newElements.unshift(item);

    updateData(widget.id, { elements: newElements });
    saveToHistory({ elements: newElements, selectionId });
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.includes('image')) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const src = event.target?.result as string;
            addElement('image', 100, 100, src);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }, [elements]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const downloadPNG = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.setAttribute("src", "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))));
    img.onload = () => {
      canvas.width = svg.clientWidth;
      canvas.height = svg.clientHeight;
      ctx?.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = "drawing.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  // --- Context Bar ---
  const selectedElement = findElementById(selectionId);

  return (
    <div className="h-full bg-white flex flex-col min-h-0 relative no-drag overflow-hidden" ref={containerRef}>
      {/* Top Toolbar */}
      <div className="bg-white p-1 border-b flex items-center gap-1 shrink-0 z-30 flex-nowrap overflow-x-auto custom-scrollbar shadow-sm">
        <div className="flex bg-gray-100 p-0.5 rounded-lg mr-2">
            <button onClick={() => updateData(widget.id, { tool: 'select' })} className={`p-1.5 rounded-md transition-all ${tool === 'select' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} title="Select"><MousePointer2 size={18} /></button>
            <button onClick={() => updateData(widget.id, { tool: 'pen' })} className={`p-1.5 rounded-md transition-all ${tool === 'pen' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} title="Pen"><Pencil size={18} /></button>
            <button onClick={() => updateData(widget.id, { tool: 'line' })} className={`p-1.5 rounded-md transition-all ${tool === 'line' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} title="Line"><Layout size={18} className="rotate-45" /></button>
            <button onClick={() => updateData(widget.id, { tool: 'eraser' })} className={`p-1.5 rounded-md transition-all ${tool === 'eraser' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} title="Eraser"><Eraser size={18} /></button>
            <button onClick={() => updateData(widget.id, { tool: 'text' })} className={`p-1.5 rounded-md transition-all ${tool === 'text' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`} title="Text"><Type size={18} /></button>
        </div>

        <div className="w-px h-6 bg-gray-200" />
        
        <div className="flex gap-1 mx-1">
            <button onClick={() => addElement('rect', 150, 150)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Rectangle"><Square size={18} /></button>
            <button onClick={() => addElement('circle', 150, 150)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Circle"><Circle size={18} /></button>
            <button onClick={() => addElement('triangle', 150, 150)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Triangle"><Triangle size={18} /></button>
            <button onClick={() => addElement('star', 150, 150)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Star"><Star size={18} /></button>
            <button onClick={() => addElement('diamond', 150, 150)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Diamond"><Diamond size={18} /></button>
            <button onClick={() => addElement('arrow', 150, 150)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Arrow"><ArrowUpRight size={18} /></button>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        <div className="flex gap-1 mx-1">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Emojis" onClick={() => {
                const em = DRAWING_EMOJIS[Math.floor(Math.random() * DRAWING_EMOJIS.length)];
                addElement('emoji', 200, 200, em);
            }}><Smile size={18} /></button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Image" onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e: any) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => addElement('image', 100, 100, ev.target?.result as string);
                        reader.readAsDataURL(file);
                    }
                };
                input.click();
            }}><ImageIcon size={18} /></button>
        </div>

        <div className="flex gap-1 ml-auto">
          <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30" title="Undo"><Undo2 size={18} /></button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30" title="Redo"><Redo2 size={18} /></button>
          <div className="w-px h-6 bg-gray-200" />
          <button onClick={downloadPNG} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-green-600" title="Export PNG"><Download size={18} /></button>
          <button onClick={() => { if(confirm('Clear all?')) updateData(widget.id, { elements: [], selectionId: null }); saveToHistory({ elements: [], selectionId: null }); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-500" title="Clear All"><RotateCcw size={18} /></button>
        </div>
      </div>

      {/* Formatting Context Bar (When element selected) */}
      {selectedElement && (
        <div className="bg-gray-50 border-b p-1 flex items-center gap-2 animate-in slide-in-from-top-1 duration-200 px-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 group relative">
                <Palette size={14} className="text-gray-400" />
                <div className="flex gap-0.5">
                    {COLORS.slice(0, 8).map(c => (
                        <button key={c} onClick={() => {
                            const newElements = elements.map((el: any) => el.id === selectionId ? { ...el, fill: c } : el);
                            updateData(widget.id, { elements: newElements });
                        }} className={`w-5 h-5 rounded-full border border-white shadow-sm hover:scale-110 transition-transform ${selectedElement.fill === c ? 'ring-2 ring-blue-500' : ''}`} style={{ backgroundColor: c }} />
                    ))}
                </div>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1">
                <div className="flex gap-1">
                    {['#000000', '#ffffff', '#ef4444', '#3b82f6'].map(c => (
                        <button key={c} onClick={() => {
                            const newElements = elements.map((el: any) => el.id === selectionId ? { ...el, stroke: c } : el);
                            updateData(widget.id, { elements: newElements });
                        }} className={`w-4 h-4 rounded-full border border-white shadow-sm ${selectedElement.stroke === c ? 'ring-2 ring-blue-500' : ''}`} style={{ backgroundColor: c }} />
                    ))}
                </div>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <input type="range" min="0" max="20" value={selectedElement.strokeWidth} onChange={(e) => {
                const val = parseInt(e.target.value);
                const newElements = elements.map((el: any) => el.id === selectionId ? { ...el, strokeWidth: val } : el);
                updateData(widget.id, { elements: newElements });
            }} className="w-16 accent-gray-600" title="Stroke Width" />
            
            <div className="w-px h-4 bg-gray-200" />
            
            <div className="flex gap-1">
                <button onClick={() => moveLayer('front')} className="p-1 rounded hover:bg-gray-200 text-gray-500" title="To Front"><BringToFront size={16} /></button>
                <button onClick={() => moveLayer('back')} className="p-1 rounded hover:bg-gray-200 text-gray-500" title="To Back"><SendToBack size={16} /></button>
                <button onClick={duplicateElement} className="p-1 rounded hover:bg-gray-200 text-gray-500" title="Duplicate"><Copy size={16} /></button>
                <button onClick={deleteElement} className="p-1 rounded hover:bg-red-100 text-red-500" title="Delete"><Trash2 size={16} /></button>
            </div>

            {selectedElement.type === 'text' && (
                <div className="ml-auto flex items-center bg-white rounded-md border p-0.5">
                    <input 
                        type="text" 
                        value={selectedElement.content} 
                        onChange={(e) => {
                            const newElements = elements.map((el: any) => el.id === selectionId ? { ...el, content: e.target.value } : el);
                            updateData(widget.id, { elements: newElements });
                        }}
                        className="text-xs px-2 w-32 outline-none border-none font-medium"
                        placeholder="Edit text..."
                        autoFocus
                    />
                </div>
            )}
        </div>
      )}

      {/* Main Drawing Area */}
      <div 
        className={`flex-1 relative overflow-hidden bg-white select-none`}
        style={BG_TEMPLATES.find(t => t.id === bgType)?.style}
      >
        <svg
          ref={svgRef}
          className={`w-full h-full touch-none ${tool === 'pen' ? 'cursor-crosshair' : tool === 'eraser' ? 'cursor-not-allowed' : 'cursor-default'}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {elements.map((el: DrawingElement) => (
            <g
              key={el.id}
              className={`drawing-element group ${selectionId === el.id ? 'is-selected' : ''}`}
              data-id={el.id}
              transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation}, ${el.width/2}, ${el.height/2})`}
              style={{ opacity: el.opacity, cursor: tool === 'select' ? 'move' : 'inherit' }}
            >
              <ShapeRenderer element={el} />
              
              {/* Active Selection Highlights & Handles */}
              {selectionId === el.id && (
                <g className="selection-overlay">
                  {/* Outline */}
                  <rect 
                    x={-2} y={-2} width={el.width + 4} height={el.height + 4} 
                    fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2"
                  />
                  
                  {/* Resize Handles */}
                  {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map(h => {
                    let hx = 0, hy = 0;
                    if (h.includes('e')) hx = el.width;
                    if (h.includes('s')) hy = el.height;
                    if (h === 'n' || h === 's') hx = el.width / 2;
                    if (h === 'e' || h === 'w') hy = el.height / 2;
                    
                    return (
                      <rect
                        key={h}
                        data-handle={h}
                        className={`resize-handle cursor-${h}-resize`}
                        x={hx - 4} y={hy - 4} width={8} height={8}
                        fill="white" stroke="#3b82f6" strokeWidth="1"
                      />
                    );
                  })}

                  {/* Rotate Handle */}
                  <g className="rotate-handle cursor-grab active:cursor-grabbing">
                    <line x1={el.width / 2} y1={0} x2={el.width / 2} y2={-20} stroke="#3b82f6" strokeWidth="1" />
                    <circle cx={el.width / 2} cy={-20} r={5} fill="white" stroke="#3b82f6" strokeWidth="1" />
                  </g>
                </g>
              )}
            </g>
          ))}
        </svg>

        {/* Floating background picker toggle */}
        <button 
            onClick={() => {
                const types = BG_TEMPLATES.map(t => t.id);
                const next = types[(types.indexOf(bgType) + 1) % types.length];
                updateData(widget.id, { bgType: next });
            }}
            className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full shadow-lg border border-gray-100 text-gray-400 hover:text-blue-500 hover:scale-110 transition-all z-20"
            title="Toggle Background"
        >
            <Layout size={20} />
        </button>
      </div>
    </div>
  );
};

export default DrawingWidget;
