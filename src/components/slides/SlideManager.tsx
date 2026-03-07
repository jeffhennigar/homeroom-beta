import React from 'react';
import { X, Plus, GripVertical, LayoutGrid } from 'lucide-react';
import SlidePreview from './SlidePreview';

interface SlideManagerProps {
    isOpen: boolean;
    onClose: () => void;
    slides: any[];
    currentSlideIndex: number;
    onSelectSlide: (index: number) => void;
    onAddSlide: () => void;
    onReorderSlides: (startIndex: number, endIndex: number) => void;
    backgrounds: any[]; // User's custom/slide backgrounds
    globalBackground: any;
}

const SlideManager: React.FC<SlideManagerProps> = ({
    isOpen,
    onClose,
    slides,
    currentSlideIndex,
    onSelectSlide,
    onAddSlide,
    onReorderSlides,
    backgrounds,
    globalBackground
}) => {
    if (!isOpen) return null;

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('slideIndex', index.toString());
    };

    const handleDrop = (e: React.DragEvent, index: number) => {
        const fromIndex = parseInt(e.dataTransfer.getData('slideIndex'));
        if (fromIndex !== index) {
            onReorderSlides(fromIndex, index);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div
            className="fixed bottom-24 right-6 w-96 max-h-[70vh] bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 z-[9999] flex flex-col overflow-hidden animate-slide-manager"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 0 20px rgba(255,255,255,0.5)' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50">
                <div className="flex items-center gap-2 text-slate-700">
                    <LayoutGrid size={18} className="text-indigo-500" />
                    <span className="font-bold text-sm uppercase tracking-wider">Slide Manager</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-3 gap-4">
                    {slides.map((widgets, idx) => {
                        const isActive = idx === currentSlideIndex;
                        const slideBg = backgrounds[idx] || globalBackground;

                        return (
                            <div
                                key={idx}
                                draggable
                                onDragStart={(e) => handleDragStart(e, idx)}
                                onDrop={(e) => handleDrop(e, idx)}
                                onDragOver={handleDragOver}
                                onClick={() => onSelectSlide(idx)}
                                className={`relative group cursor-pointer transition-all duration-300 transform active:scale-95 ${isActive ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:scale-105'}`}
                            >
                                {/* Slide Number Badge */}
                                <div className={`absolute top-1 left-1 z-20 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shadow-md ${isActive ? 'bg-indigo-500 text-white' : 'bg-white/90 text-slate-600'}`}>
                                    {idx + 1}
                                </div>

                                {/* Drag Handle (Hover only) */}
                                <div className="absolute top-1 right-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-sm rounded-md p-0.5 cursor-grab active:cursor-grabbing text-white">
                                    <GripVertical size={12} />
                                </div>

                                {/* Preview */}
                                <SlidePreview
                                    widgets={widgets}
                                    background={slideBg}
                                    scale={0.1} // Smaller for the grid
                                />

                                {isActive && (
                                    <div className="absolute inset-0 bg-indigo-500/10 rounded-lg pointer-events-none" />
                                )}
                            </div>
                        );
                    })}

                    {/* Add Slide Button */}
                    <button
                        onClick={onAddSlide}
                        className="aspect-video rounded-lg border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-indigo-500 transition-all duration-200 group"
                    >
                        <Plus size={24} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Add Slide</span>
                    </button>
                </div>
            </div>

            {/* Footer / Tip */}
            <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-200/30 text-center">
                <span className="text-[10px] text-slate-400 font-medium">Drag to reorder • Click to jump</span>
            </div>
        </div>
    );
};

export default SlideManager;
