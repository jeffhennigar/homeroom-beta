import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Bold, Italic, Underline, Palette, Sun, Minus, Plus, Type } from 'lucide-react';
import FloatingFormattingToolbar from './FloatingFormattingToolbar';
import { WidgetProps } from '../../types';

const SimpleTextWidget: React.FC<WidgetProps> = ({ widget, updateData }) => {
    const { content = "", styles = {}, fontFamily = 'Poppins', fontScale = 1 } = widget.data;
    const editorRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dynamicFontSize, setDynamicFontSize] = useState(16);
    const [formats, setFormats] = useState({ bold: false, italic: false, underline: false });
    const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
    const [showFontColorMenu, setShowFontColorMenu] = useState(false);
    const [showFontMenu, setShowFontMenu] = useState(false);
    const isFocused = useRef(false);

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

    const exec = (command: string, value: string | undefined = undefined) => {
        editorRef.current?.focus();
        document.execCommand(command, false, value);
        updateFormats();
        if (editorRef.current) updateData(widget.id, { content: editorRef.current.innerHTML });
    };

    // Advanced Auto-Size & Font Scaling Logic
    useEffect(() => {
        const calculateFontSize = () => {
            if (!editorRef.current || !containerRef.current) return;

            const container = containerRef.current;
            const editor = editorRef.current;

            const maxWidth = container.clientWidth - 40;
            const maxHeight = container.clientHeight - 40;

            let min = 10;
            let max = 300;
            let optimal = 16;

            while (min <= max) {
                const mid = Math.floor((min + max) / 2);
                editor.style.fontSize = mid + 'px';

                if (editor.scrollWidth <= maxWidth && editor.scrollHeight <= maxHeight) {
                    optimal = mid;
                    min = mid + 1;
                } else {
                    max = mid - 1;
                }
            }

            setDynamicFontSize(optimal);
        };

        calculateFontSize();

        const observer = new ResizeObserver(calculateFontSize);
        if (containerRef.current) observer.observe(containerRef.current);

        return () => observer.disconnect();

    }, [content, widget.size.width, widget.size.height]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        updateData(widget.id, { content: e.currentTarget.innerHTML });
    };

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        isFocused.current = false;
        updateData(widget.id, { content: e.target.innerHTML });
        updateFormats();
    };

    const handleFocus = () => {
        isFocused.current = true;
    };

    return (
        <div ref={containerRef} className="w-full h-full relative group flex items-center justify-center p-4 overflow-hidden">
            <FloatingFormattingToolbar
                pos={toolbarPos}
                formats={formats}
                exec={exec}
                onClose={() => setToolbarPos(null)}
                updateData={updateData}
                widgetId={widget.id}
                hasShadow={widget.data.hasShadow}
                fontScale={fontScale}
                fontFamily={fontFamily}
                showFontColorMenu={showFontColorMenu}
                setShowFontColorMenu={setShowFontColorMenu}
                showFontMenu={showFontMenu}
                setShowFontMenu={setShowFontMenu}
            />
            <div
                ref={editorRef}
                contentEditable
                className={`inline-block outline-none cursor-text select-text transition-[font-size] duration-100 ${widget.data.hasShadow ? 'drop-shadow-lg' : ''}`}
                style={{
                    fontSize: (dynamicFontSize * fontScale) + 'px',
                    fontFamily: `${fontFamily}, sans-serif`,
                    ...styles,
                    minWidth: '50px',
                    textAlign: 'center',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                }}
                dangerouslySetInnerHTML={isFocused.current ? undefined : { __html: content }}
                onInput={handleInput}
                onBlur={handleBlur}
                onFocus={handleFocus}
                onKeyUp={updateFormats}
                onMouseUp={updateFormats}
                onMouseDown={(e) => {
                    if (e.target === editorRef.current || (e.target as HTMLElement).parentElement === editorRef.current) {
                        e.stopPropagation();
                    }
                    setToolbarPos(null);
                }}
            />
        </div>
    );
};

export default SimpleTextWidget;
