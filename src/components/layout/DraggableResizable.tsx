import React, { useRef, useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, Lock, Unlock, Minus, GripVertical } from 'lucide-react';

const DraggableResizable = ({
    id, position, size, zIndex,
    onUpdate, onFocus,
    children, title, icon, onRemove,
    minWidth = 200, minHeight = 150,
    locked = false, isMinimized = false, isTransparent = false, isDockEditMode = false,
    chromeless = false, isSelected = false, closingWidgetId = null
}) => {
    const nodeRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    // Ref for drag state to avoid stale closures in event listeners
    const dragRef = useRef({
        startX: 0, startY: 0,
        initialX: 0, initialY: 0,
        initialW: 0, initialH: 0
    });

    const handleMouseDown = (e) => {
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
    };

    const handleResizeDown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onFocus();
        setIsResizing(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialW: size.width,
            initialH: size.height
        };
    };

    useEffect(() => {
        const handleCheckParam = (e) => {
            if (!isDragging && !isResizing) return;

            e.preventDefault();

            if (isDragging) {
                const dx = e.clientX - dragRef.current.startX;
                const dy = e.clientY - dragRef.current.startY;

                const newX = dragRef.current.initialX + dx;
                const newY = dragRef.current.initialY + dy;

                // We can update local DOM for speed, or just call onUpdate
                // Calling onUpdate might track history/state in parent
                onUpdate(id, { x: newX, y: newY });
            }

            if (isResizing) {
                const dx = e.clientX - dragRef.current.startX;
                const dy = e.clientY - dragRef.current.startY;

                const newW = Math.max(minWidth, dragRef.current.initialW + dx);
                const newH = Math.max(minHeight, dragRef.current.initialH + dy);

                onUpdate(id, { width: newW, height: newH });
            }
        };

        const handleUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleCheckParam);
            window.addEventListener('mouseup', handleUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleCheckParam);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [isDragging, isResizing, id, minWidth, minHeight, onUpdate]);

    const containerStyle = chromeless ? {
        background: 'transparent',
        boxShadow: isSelected ? '0 0 0 2px #3b82f6' : 'none',
        border: 'none',
    } : {};

    const borderClass = chromeless
        ? (isSelected ? 'border-2 border-blue-500 shadow-2xl' : 'border-0 border-transparent')
        : (isSelected ? 'border-blue-500 shadow-2xl' : 'border-gray-100');

    return (
        <div
            ref={nodeRef}
            onMouseDown={onFocus}
            className={`absolute flex flex-col pointer-events-auto transition-all duration-200 border
                ${chromeless ? '' : 'bg-white rounded-xl shadow-xl border-2 overflow-hidden'}
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
            {/* Header */}
            {!chromeless && (
                <div
                    className={`h-10 flex items-center justify-between px-3 shrink-0 select-none border-b border-slate-100
          ${locked ? 'cursor-default bg-slate-50' : 'cursor-grab active:cursor-grabbing bg-white'}
        `}
                    onMouseDown={handleMouseDown}
                >
                    <div className="flex items-center gap-2 text-slate-700 overflow-hidden">
                        <div className="text-indigo-500">{icon}</div>
                        <span className="font-bold text-sm truncate">{title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onUpdate(id, { locked: !locked })}
                            className={`p-1 rounded-lg transition-colors ${locked ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                        >
                            {locked ? <Lock size={14} /> : <Unlock size={14} />}
                        </button>

                        {!locked && (
                            <>
                                <button
                                    onClick={() => onUpdate(id, { isMinimized: !isMinimized })}
                                    className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    {isMinimized ? <Maximize2 size={14} /> : <Minus size={14} />}
                                </button>
                                <button
                                    onClick={() => onRemove(id)}
                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className={`flex-1 min-h-0 relative ${chromeless ? '' : 'overflow-hidden'}`} style={chromeless ? { overflow: 'visible' } : {}}>
                {children}

                {/* Chromeless Drag Handle */}
                {chromeless && isSelected && (
                    <div className="absolute -top-8 right-0 flex gap-1 z-50 animate-in fade-in slide-in-from-bottom-2">
                        <button onMouseDown={handleMouseDown} className="p-1.5 bg-white shadow-md rounded-lg text-slate-500 hover:text-blue-600 cursor-move" title="Drag"><GripVertical size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onRemove(id); }} className="p-1.5 bg-white shadow-md rounded-lg text-red-400 hover:text-red-600" title="Delete"><X size={16} /></button>
                    </div>
                )}

                {/* Resize Handle */}
                {(!locked) && (
                    <div
                        className={`absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize z-20 flex items-end justify-end p-1 transition-opacity
                            ${chromeless ? (isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-100') : 'opacity-0 hover:opacity-100 bg-gradient-to-tl from-gray-100 to-transparent'}
                        `}
                        onMouseDown={handleResizeDown}
                    >
                        <Maximize2 size={16} className={`${chromeless ? 'text-blue-400' : 'text-gray-400'} transform rotate-90`} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DraggableResizable;
