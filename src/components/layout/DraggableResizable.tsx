import React, { useRef, useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, Lock, Unlock, Minus, GripVertical, Lightbulb, Settings, Ghost, Square, Circle } from 'lucide-react';

const DraggableResizable = ({
    id, position, size, zIndex,
    onUpdate, onFocus,
    children, title, icon, onRemove,
    minWidth = 200, minHeight = 150,
    locked = false, isMinimized = false, isTransparent = false, isDockEditMode = false,
    isGlassy = 'solid', // Default to solid
    chromeless = false, isSelected = false, closingWidgetId = null,
    onMinimizeToggle = null,
    onSpotlight = null, isSpotlighted = false,
    onToggleGlass = null,
    onSettings = null,
    widgetType,
    accentColor = 'indigo', // Default to indigo
    showGrid = false,
    ...props
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const nodeRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    // Ref for drag state to avoid stale closures in event listeners
    const dragRef = useRef({
        startX: 0, startY: 0,
        initialX: 0, initialY: 0,
        initialW: 0, initialH: 0,
        type: 'both' as 'both' | 'right' | 'bottom'
    });

    const handlePointerDown = (e) => {
        if (locked) return;
        // If we clicked an interactive element, don't initiate drag
        if (e.target.closest('button, input, textarea, select, .no-drag')) return;
        if (e.target.closest('[contenteditable="true"]') && !e.defaultPrevented) return;

        onFocus();
        setIsDragging(true);

        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: position.x,
            initialY: position.y
        };

        const target = e.currentTarget as HTMLElement;
        if (target.setPointerCapture) target.setPointerCapture(e.pointerId);
    };

    const handleResizePointerDown = (e, type: 'both' | 'right' | 'bottom' = 'both') => {
        e.stopPropagation();
        onFocus();
        setIsResizing(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialW: size.width,
            initialH: size.height,
            type
        };
        const target = e.currentTarget as HTMLElement;
        if (target.setPointerCapture) target.setPointerCapture(e.pointerId);
    };

    useEffect(() => {
        const handleCheckParam = (e) => {
            if (!isDragging && !isResizing) return;

            if (isDragging) {
                const dx = e.clientX - dragRef.current.startX;
                const dy = e.clientY - dragRef.current.startY;

                let newX = dragRef.current.initialX + dx;
                let newY = dragRef.current.initialY + dy;

                if (showGrid) {
                    newX = Math.round(newX / 20) * 20;
                    newY = Math.round(newY / 20) * 20;
                }

                onUpdate(id, { x: newX, y: newY });
            }

            if (isResizing) {
                const dx = e.clientX - dragRef.current.startX;
                const dy = e.clientY - dragRef.current.startY;

                let newW = size.width;
                let newH = size.height;

                if (dragRef.current.type === 'both' || dragRef.current.type === 'right') {
                    newW = Math.max(minWidth, dragRef.current.initialW + dx);
                    if (showGrid) newW = Math.round(newW / 20) * 20;
                }
                if (dragRef.current.type === 'both' || dragRef.current.type === 'bottom') {
                    newH = Math.max(minHeight, dragRef.current.initialH + dy);
                    if (showGrid) newH = Math.round(newH / 20) * 20;
                }

                onUpdate(id, { width: newW, height: newH });
            }
        };

        const handleUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            window.addEventListener('pointermove', handleCheckParam);
            window.addEventListener('pointerup', handleUp);
            window.addEventListener('pointercancel', handleUp);
        }

        return () => {
            window.removeEventListener('pointermove', handleCheckParam);
            window.removeEventListener('pointerup', handleUp);
            window.removeEventListener('pointercancel', handleUp);
        };
    }, [isDragging, isResizing, id, minWidth, minHeight, onUpdate]);

    const containerStyle = chromeless ? {
        background: 'transparent',
        boxShadow: isSelected ? `0 0 0 3px ${accentColor === 'indigo' ? '#6366f1' : 'currentColor'}` : 'none',
        border: 'none',
    } : {};

    const colorMap: Record<string, string> = {
        indigo: 'border-indigo-500',
        blue: 'border-blue-500',
        purple: 'border-purple-500',
        rose: 'border-rose-500',
        amber: 'border-amber-500',
        emerald: 'border-emerald-500',
        slate: 'border-slate-500'
    };

    const textMap: Record<string, string> = {
        indigo: 'text-indigo-500',
        blue: 'text-blue-500',
        purple: 'text-purple-500',
        rose: 'text-rose-500',
        amber: 'text-amber-500',
        emerald: 'text-emerald-500',
        slate: 'text-slate-500'
    };

    const bgMap: Record<string, string> = {
        indigo: 'bg-indigo-50',
        blue: 'bg-blue-50',
        purple: 'bg-purple-50',
        rose: 'bg-rose-50',
        amber: 'bg-amber-50',
        emerald: 'bg-emerald-50',
        slate: 'bg-slate-50'
    };

    const borderClass = chromeless
        ? (isSelected ? `border-2 ${colorMap[accentColor] || 'border-indigo-500'} shadow-2xl` : 'border-0 border-transparent')
        : (isSelected ? `${colorMap[accentColor] || 'border-indigo-500'} shadow-2xl scale-[1.002]` : 'border-gray-100');

    return (
        <div
            ref={nodeRef}
            onPointerDown={onFocus}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            data-widget-id={id}
            className={`absolute flex flex-col pointer-events-auto transition-all duration-700 ease-in-out border
                ${chromeless ? '' : (isGlassy === 'clear' ? 'rounded-xl overflow-hidden' : 'rounded-xl shadow-xl border-2 overflow-hidden')}
                ${!chromeless && isGlassy === 'glass' ? 'glass-premium' : ''}
                ${!chromeless && isGlassy === 'solid' ? 'bg-white' : ''}
                ${!chromeless && isGlassy === 'clear' ? 'bg-transparent border-transparent shadow-none' : ''}
                ${isSpotlighted ? 'ring-4 ring-amber-400/50 shadow-[0_0_80px_rgba(251,191,36,0.6),0_0_150px_rgba(251,191,36,0.3),0_0_200px_rgba(251,191,36,0.1)]' : ''}
                ${isDragging ? 'shadow-2xl z-50 cursor-grabbing' : ''}
                ${isDockEditMode ? 'animate-wobble pointer-events-none opacity-80' : ''}
                ${closingWidgetId === id ? 'animate-shrink' : (isMinimized ? 'animate-minimize' : 'animate-elastic')}
                ${isMinimized ? 'pointer-events-none' : 'pointer-events-auto'}
                ${borderClass}
            `}
            style={{
                left: position.x,
                top: position.y,
                transform: 'translate(0px, 0px)',
                width: size.width,
                height: size.height,
                zIndex: isDragging ? 9999 : zIndex,
                touchAction: 'none',
                ...containerStyle
            }}
        >
            {/* Restored Structural Header */}
            {!chromeless && (
                <div
                    className={`h-10 flex items-center justify-between px-3 shrink-0 select-none group transition-all duration-500
                        ${isGlassy === 'clear' ? 'border-b border-transparent' : 'border-b border-slate-100'}
                        ${locked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
                        ${isGlassy === 'glass' ? 'bg-white/20' : (isGlassy === 'clear' ? 'bg-transparent' : 'bg-white')}
                        ${(isGlassy === 'clear' || isGlassy === 'glass') && ['CLOCK', 'OVERLAY_TEXT', 'CALENDAR', 'SCHEDULE', 'TEXT'].includes(widgetType)
                            ? (isSelected ? 'opacity-100 h-10 visible' : 'opacity-0 h-0 overflow-hidden invisible pointer-events-none')
                            : 'opacity-100 h-10 visible'}
                    `}
                    onPointerDown={handlePointerDown}
                >
                    {/* Left/Center: Icon and Title */}
                    <div className="flex items-center gap-2 text-slate-700 overflow-hidden pointer-events-none">
                        <div className={isGlassy === 'clear' ? 'text-white/80' : (textMap[accentColor] || 'text-indigo-500')}>{icon}</div>
                        <span className={`font-bold text-sm truncate ${isGlassy === 'clear' ? 'text-white/90' : 'text-slate-700'}`}>{title}</span>
                    </div>

                    {/* Right side tools (Spotlight, Transparency, Settings, Minimize, Close) */}
                    <div className={`flex items-center gap-1 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {onSpotlight && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onSpotlight(id); }}
                                className={`p-1 w-7 h-7 flex flex-col items-center justify-center rounded-md transition-all duration-300 
                                    ${isSpotlighted 
                                        ? (isGlassy === 'clear' ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-amber-500 bg-amber-50') 
                                        : (isGlassy === 'clear' ? 'text-white/60 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50')}`}
                                title="Spotlight"
                            >
                                <Lightbulb size={14} strokeWidth={isGlassy === 'clear' ? 3 : 2} />
                            </button>
                        )}
                        {(onToggleGlass && ['CLOCK', 'OVERLAY_TEXT', 'CALENDAR', 'SCHEDULE', 'TEXT'].includes(widgetType)) && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleGlass(); }}
                                className={`p-1 w-7 h-7 flex flex-col items-center justify-center rounded-md transition-all duration-300
                                    ${isGlassy !== 'solid' 
                                        ? (isGlassy === 'clear' ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]' : 'text-indigo-600 bg-indigo-50') 
                                        : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'}`}
                                title={`Transparency: ${isGlassy}`}
                            >
                                <Ghost size={14} strokeWidth={isGlassy === 'clear' ? 3 : 2} className={isGlassy !== 'solid' ? 'opacity-100' : 'opacity-40'} />
                            </button>
                        )}
                        {(onSettings && (widgetType === 'CLOCK' || widgetType === 'CALENDAR')) && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onSettings(id); }}
                                className={`p-1 w-7 h-7 flex flex-col items-center justify-center rounded-md transition-all duration-300
                                    ${isGlassy === 'clear' ? 'text-white/60 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'}`}
                                title="Settings"
                            >
                                <Settings size={14} strokeWidth={isGlassy === 'clear' ? 3 : 2} />
                            </button>
                        )}
                        {onMinimizeToggle && (
                            <button
                                onClick={(e) => {
                                    if (onMinimizeToggle) {
                                        onMinimizeToggle(id, e);
                                    } else {
                                        onUpdate(id, { isMinimized: !isMinimized });
                                    }
                                }}
                                className={`p-1 w-7 h-7 flex flex-col items-center justify-center rounded-md transition-all duration-300
                                    ${isGlassy === 'clear' ? 'text-white/60 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'}`}
                                title={isMinimized ? "Restore" : "Minimize"}
                            >
                                {isMinimized ? <Maximize2 size={14} strokeWidth={isGlassy === 'clear' ? 3 : 2} /> : <Minus size={14} strokeWidth={isGlassy === 'clear' ? 3 : 2} />}
                            </button>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); onRemove(id); }}
                            className={`p-1 w-7 h-7 flex flex-col items-center justify-center rounded-md transition-all duration-300
                                ${isGlassy === 'clear' ? 'text-white/40 hover:text-red-400 hover:drop-shadow-[0_0_8px_rgba(248,113,113,0.4)]' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                            title="Close"
                        >
                            <X size={14} strokeWidth={isGlassy === 'clear' ? 3 : 2} />
                        </button>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className={`flex-1 min-h-0 relative ${chromeless ? '' : 'overflow-hidden'}`} style={chromeless ? { overflow: 'visible' } : {}}>
                {children}

                {/* Chromeless Floating Tools - Only on Hover or Selection */}
                {chromeless && (
                    <div className={`absolute top-2 right-2 flex gap-1 z-50 transition-opacity duration-200 ${isSelected || isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="flex bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 p-0.5 pointer-events-auto">
                            {(onSettings && (widgetType === 'CLOCK' || widgetType === 'CALENDAR')) && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onSettings(id); }}
                                    className="p-1 w-7 h-7 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                    title="Settings"
                                >
                                    <Settings size={14} />
                                </button>
                            )}
                            {onMinimizeToggle && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onMinimizeToggle(id, e); }}
                                    className="p-1 w-7 h-7 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="Minimize"
                                >
                                    <Minus size={14} />
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); onRemove(id); }}
                                className="p-1 w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                title="Close"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Resize Handles */}
                {(!locked) && (
                    <>
                        {/* Corner Handle */}
                        <div
                            className={`absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize z-30 flex items-end justify-end p-1 transition-opacity duration-300
                                ${isSelected || isHovered ? 'opacity-100' : 'opacity-0'}
                            `}
                            onPointerDown={(e) => handleResizePointerDown(e, 'both')}
                        >
                            <div className={`p-1 rounded-br-2xl transition-all
                                ${isGlassy === 'clear' 
                                    ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' 
                                    : 'text-slate-400 bg-white/50 group-hover:bg-white'}
                            `}>
                                <Maximize2 size={16} className="transform rotate-90" />
                            </div>
                        </div>

                        {/* Right Edge Handle */}
                        <div
                            className={`absolute top-4 right-0 bottom-8 w-2 cursor-ew-resize z-25 transition-all
                                ${isSelected || isHovered ? 'opacity-100 hover:bg-slate-400/20' : 'opacity-0'}`}
                            onPointerDown={(e) => handleResizePointerDown(e, 'right')}
                        />

                        {/* Bottom Edge Handle */}
                        <div
                            className={`absolute bottom-0 left-4 right-8 h-2 cursor-ns-resize z-25 transition-all
                                ${isSelected || isHovered ? 'opacity-100 hover:bg-slate-400/20' : 'opacity-0'}`}
                            onPointerDown={(e) => handleResizePointerDown(e, 'bottom')}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default DraggableResizable;
