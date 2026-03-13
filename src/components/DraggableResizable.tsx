import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minus, Plus, Lightbulb, MinusSquare, PlusSquare } from 'lucide-react';
import { Position, Size } from '../types';

interface DraggableResizableProps {
  id: string;
  position: Position;
  size: Size;
  zIndex: number;
  isSelected: boolean;
  isMinimized?: boolean;
  isSpotlighted?: boolean;
  widgetType?: string;
  chromeless?: boolean;
  onUpdate: (id: string, position: Position, size: Size) => void;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onFontSizeChange?: (delta: number) => void;
  onMinimizeToggle?: (id: string) => void;
  onSpotlightToggle?: (id: string) => void;
  accentColor?: string;
  children: React.ReactNode;
}

const GRID_SIZE = 20;
const HEADER_HEIGHT = 40;

const DraggableResizable: React.FC<DraggableResizableProps> = ({
  id,
  position,
  size,
  zIndex,
  isSelected,
  isMinimized = false,
  isSpotlighted = false,
  widgetType,
  chromeless = false,
  onUpdate,
  onSelect,
  onRemove,
  onFontSizeChange,
  onMinimizeToggle,
  onSpotlightToggle,
  accentColor = 'indigo',
  children
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);

  const startMousePos = useRef<Position>({ x: 0, y: 0 });
  const startWidgetPos = useRef<Position>({ x: 0, y: 0 });
  const startWidgetSize = useRef<Size>({ width: 0, height: 0 });

  const onUpdateRef = useRef(onUpdate);
  const positionRef = useRef(position);
  const sizeRef = useRef(size);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    positionRef.current = position;
    sizeRef.current = size;
  }, [onUpdate, position, size]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if left click
    if (e.button !== 0) return;

    // Prevent dragging if clicking on an interactive element inside children
    // but allow dragging if clicking on the "blank space" of the widget
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, select, .no-drag')) return;
    if (target.closest('[contenteditable="true"]') && !e.defaultPrevented) return;

    e.stopPropagation();
    onSelect(id);
    setIsDragging(true);
    startMousePos.current = { x: e.clientX, y: e.clientY };
    startWidgetPos.current = { ...position };
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string = 'se') => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(id);
    setIsResizing(true);
    setResizeDirection(direction);
    startMousePos.current = { x: e.clientX, y: e.clientY };
    startWidgetPos.current = { ...position };
    startWidgetSize.current = { ...size };
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const dx = e.clientX - startMousePos.current.x;
      const dy = e.clientY - startMousePos.current.y;

      if (isDragging) {
        onUpdateRef.current(
          id,
          { x: startWidgetPos.current.x + dx, y: startWidgetPos.current.y + dy },
          sizeRef.current
        );
      } else if (isResizing && resizeDirection) {
        let newWidth = startWidgetSize.current.width;
        let newHeight = startWidgetSize.current.height;
        let newX = startWidgetPos.current.x;
        let newY = startWidgetPos.current.y;

        const minW = 100;
        const minH = 50;

        if (resizeDirection.includes('e')) {
          newWidth = Math.max(minW, startWidgetSize.current.width + dx);
        }
        if (resizeDirection.includes('w')) {
          newWidth = Math.max(minW, startWidgetSize.current.width - dx);
          newX = startWidgetPos.current.x + dx;
          if (newWidth === minW) newX = startWidgetPos.current.x + startWidgetSize.current.width - minW;
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(minH, startWidgetSize.current.height + dy);
        }
        if (resizeDirection.includes('n')) {
          newHeight = Math.max(minH, startWidgetSize.current.height - dy);
          newY = startWidgetPos.current.y + dy;
          if (newHeight === minH) newY = startWidgetPos.current.y + startWidgetSize.current.height - minH;
        }

        onUpdateRef.current(
          id,
          { x: newX, y: newY },
          { width: newWidth, height: newHeight }
        );
      }
    };

    const handleMouseUp = () => {
      // Snap to grid on release
      const snappedX = Math.round(positionRef.current.x / GRID_SIZE) * GRID_SIZE;
      const snappedY = Math.round(positionRef.current.y / GRID_SIZE) * GRID_SIZE;

      let finalSize = { ...sizeRef.current };
      if (isResizing) {
        finalSize = {
          width: Math.round(sizeRef.current.width / GRID_SIZE) * GRID_SIZE,
          height: Math.round(sizeRef.current.height / GRID_SIZE) * GRID_SIZE
        };
      }

      onUpdateRef.current(id, { x: snappedX, y: snappedY }, finalSize);

      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, id, resizeDirection]);

  const displayHeight = isMinimized ? HEADER_HEIGHT : size.height;

  // Header and Border Styles
  const isChromeless = chromeless;
  const showBorder = isSelected;
  const borderColor = isSelected ? (accentColor === 'rose' ? 'border-rose-500' : accentColor === 'blue' ? 'border-blue-500' : accentColor === 'purple' ? 'border-purple-500' : accentColor === 'emerald' ? 'border-emerald-500' : accentColor === 'amber' ? 'border-amber-500' : 'border-indigo-500') : 'border-transparent';
  const shadowClass = isSelected ? 'shadow-2xl' : 'shadow-none';

  return (
    <div
      className={`absolute flex flex-col transition-all duration-200 ${isChromeless ? 'rounded-2xl' : 'bg-white rounded-xl border-2'
        } ${showBorder ? 'border-2 ' + borderColor : (isChromeless ? 'border-2 border-transparent ' + (accentColor === 'rose' ? 'hover:border-rose-200' : accentColor === 'blue' ? 'hover:border-blue-200' : accentColor === 'purple' ? 'hover:border-purple-200' : accentColor === 'emerald' ? 'hover:border-emerald-200' : accentColor === 'amber' ? 'hover:border-amber-200' : 'hover:border-indigo-200') : 'border-gray-100')} ${shadowClass}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: displayHeight,
        zIndex: isSpotlighted ? 50 : (isSelected ? 9999 : zIndex),
        touchAction: 'none',
        background: isChromeless ? 'rgba(255,255,255,0.05)' : undefined,
        backdropFilter: isChromeless ? 'blur(8px)' : undefined,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Chromeless Drag Handle (Grip dots at center top) */}
      {isChromeless && isSelected && (
        <>
          <div
            className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-lg flex items-center justify-center cursor-move shadow-lg z-50 text-white hover:scale-110 transition-transform ${accentColor === 'rose' ? 'bg-rose-500' : accentColor === 'blue' ? 'bg-blue-500' : accentColor === 'purple' ? 'bg-purple-500' : accentColor === 'emerald' ? 'bg-emerald-500' : accentColor === 'amber' ? 'bg-amber-500' : 'bg-indigo-500'}`}
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsDragging(true);
              startMousePos.current = { x: e.clientX, y: e.clientY };
              startWidgetPos.current = { ...position };
            }}
          >
            <div className="grid grid-cols-2 gap-0.5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-0.5 h-0.5 bg-white rounded-full" />
              ))}
            </div>
          </div>

          {/* Float Controls for Chromeless */}
          <div className="absolute top-2 right-2 flex gap-1 z-50">
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(id); }}
              className="p-1.5 bg-white/90 backdrop-blur-sm shadow-md rounded-lg text-gray-400 hover:text-red-500 hover:bg-white transition-all ring-1 ring-black/5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </>
      )}

      {/* Header / Drag Handle (Standard Mode) */}
      {!isChromeless && (
        <div
          className="h-10 bg-gray-50 flex items-center justify-between px-2 cursor-move border-b border-gray-100 group select-none flex-shrink-0"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onFontSizeChange?.(-2); }}
              className={`p-1 text-gray-400 rounded transition-colors ${accentColor === 'rose' ? 'hover:text-rose-600 hover:bg-rose-100' : accentColor === 'blue' ? 'hover:text-blue-600 hover:bg-blue-100' : accentColor === 'purple' ? 'hover:text-purple-600 hover:bg-purple-100' : accentColor === 'emerald' ? 'hover:text-emerald-600 hover:bg-emerald-100' : accentColor === 'amber' ? 'hover:text-amber-600 hover:bg-amber-100' : 'hover:text-indigo-600 hover:bg-indigo-100'}`}
              title="Decrease Font Size"
            >
              <Minus size={14} strokeWidth={3} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onFontSizeChange?.(2); }}
              className={`p-1 text-gray-400 rounded transition-colors ${accentColor === 'rose' ? 'hover:text-rose-600 hover:bg-rose-100' : accentColor === 'blue' ? 'hover:text-blue-600 hover:bg-blue-100' : accentColor === 'purple' ? 'hover:text-purple-600 hover:bg-purple-100' : accentColor === 'emerald' ? 'hover:text-emerald-600 hover:bg-emerald-100' : accentColor === 'amber' ? 'hover:text-amber-600 hover:bg-amber-100' : 'hover:text-indigo-600 hover:bg-indigo-100'}`}
              title="Increase Font Size"
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>

          <div className="flex-1 flex justify-center">
            <div className={`w-12 h-1.5 rounded-full transition-colors ${accentColor === 'rose' ? 'bg-rose-300 group-hover:bg-rose-500' : accentColor === 'blue' ? 'bg-blue-300 group-hover:bg-blue-500' : accentColor === 'purple' ? 'bg-purple-300 group-hover:bg-purple-500' : accentColor === 'emerald' ? 'bg-emerald-300 group-hover:bg-emerald-500' : accentColor === 'amber' ? 'bg-amber-300 group-hover:bg-amber-500' : 'bg-gray-300 group-hover:bg-indigo-400'}`} />
          </div>

          <div className="flex items-center gap-1">
            {/* Spotlight Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onSpotlightToggle?.(id); }}
              className={`p-1 rounded transition-colors ${isSpotlighted
                ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                }`}
              title={isSpotlighted ? "Exit Spotlight" : "Spotlight"}
            >
              <Lightbulb size={14} strokeWidth={2} />
            </button>

            {/* Minimize Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onMinimizeToggle?.(id); }}
              className={`p-1 text-gray-400 rounded transition-colors ${accentColor === 'rose' ? 'hover:text-rose-600 hover:bg-rose-100' : accentColor === 'blue' ? 'hover:text-blue-600 hover:bg-blue-100' : accentColor === 'purple' ? 'hover:text-purple-600 hover:bg-purple-100' : accentColor === 'emerald' ? 'hover:text-emerald-600 hover:bg-emerald-100' : accentColor === 'amber' ? 'hover:text-amber-600 hover:bg-amber-100' : 'hover:text-indigo-600 hover:bg-indigo-100'}`}
              title={isMinimized ? "Restore" : "Minimize"}
            >
              {isMinimized ? <PlusSquare size={14} strokeWidth={2} /> : <MinusSquare size={14} strokeWidth={2} />}
            </button>

            {/* Close Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(id); }}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      )}

      {/* Widget Content - hidden when minimized */}
      {!isMinimized && (
        <div className={`flex-1 relative ${isChromeless ? 'overflow-visible' : 'overflow-hidden'} flex flex-col custom-scrollbar`}>
          {children}
        </div>
      )}

      {/* Resize Handles */}
      {isSelected && !isMinimized && (
        <>
          {/* Hit areas (invisible but larger) */}
          <div className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-[10005]" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
          <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-[10005]" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
          <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-[10005]" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-[10005]" onMouseDown={(e) => handleResizeStart(e, 'se')} />
          <div className="absolute top-0 left-4 right-4 h-2 cursor-n-resize z-[10005]" onMouseDown={(e) => handleResizeStart(e, 'n')} />
          <div className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize z-[10005]" onMouseDown={(e) => handleResizeStart(e, 's')} />
          <div className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize z-[10005]" onMouseDown={(e) => handleResizeStart(e, 'w')} />
          <div className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize z-[10005]" onMouseDown={(e) => handleResizeStart(e, 'e')} />

        </>
      )}
    </div>
  );
};

export default DraggableResizable;