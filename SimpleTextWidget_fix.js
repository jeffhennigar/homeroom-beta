const SimpleTextWidget = ({ widget, updateData, isGlassy, chromeless }) =\u003e {
    const data = widget.data || {};
const { content = \"\", fontSize = 16, fontFamily = 'Poppins', hasShadow = false } = data;
      const editorRef = useRef(null);
const [formats, setFormats] = useState({ bold: false, italic: false, underline: false });
const [toolbarPos, setToolbarPos] = useState(null);
const [showFontColorMenu, setShowFontColorMenu] = useState(false);
const [showFontMenu, setShowFontMenu] = useState(false);

const updateFormats = useCallback(() =\u003e {
    setFormats({
        bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic'),
    underline: document.queryCommandState('underline')
});

const selection = window.getSelection();
if (selection \u0026\u0026 selection.rangeCount \u003e 0 \u0026\u0026!selection.isCollapsed \u0026\u0026 editorRef.current?.contains(selection.anchorNode)) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setToolbarPos({ top: rect.top, left: rect.left + rect.width / 2 });
} else {
    setToolbarPos(null);
}
      }, []);

const exec = (command, value = null) =\u003e {
    editorRef.current?.focus();
document.execCommand(command, false, value);
updateFormats();
if (editorRef.current) updateData(widget.id, { content: editorRef.current.innerHTML });
      };

useEffect(() =\u003e {
    if(editorRef.current \u0026\u0026 document.activeElement !== editorRef.current) {
    if (editorRef.current.innerHTML !== (content || '')) {
        editorRef.current.innerHTML = content || '';
    }
}
      }, [content]);

return (
\u003cdiv className =\"w-full h-full flex flex-col relative overflow-hidden\" onClick={() =\u003e { setShowFontColorMenu(false); setShowFontMenu(false); }}\u003e
\u003cdiv
ref = { editorRef }
className =\"w-full h-full p-4 outline-none overflow-auto custom-scrollbar leading-relaxed text-lg break-words\"
contentEditable
suppressContentEditableWarning
onInput = {(e) =\u003e updateData(widget.id, { content: e.currentTarget.innerHTML })}
onKeyUp = { updateFormats }
onMouseUp = { updateFormats }
onMouseDown = {(e) =\u003e {
    if (document.activeElement === editorRef.current) {
        e.stopPropagation();
    }
    setToolbarPos(null);
}}
style = {{
    fontSize: fontSize + 'px',
        fontFamily: `${fontFamily}, sans-serif`,
            textShadow: hasShadow ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none',
                wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                        whiteSpace: 'pre-wrap'
}}
placeholder =\"Type here...\"
    /\u003e
\u003cFloatingFormattingToolbar
pos = { toolbarPos }
formats = { formats }
exec = { exec }
onClose = {() =\u003e setToolbarPos(null)}
updateData = { updateData }
widgetId = { widget.id }
hasShadow = { hasShadow }
fontScale = { fontSize / 16}
fontFamily = { fontFamily }
showFontColorMenu = { showFontColorMenu }
setShowFontColorMenu = { setShowFontColorMenu }
showFontMenu = { showFontMenu }
setShowFontMenu = { setShowFontMenu }
    /\u003e
\u003c / div\u003e
      );
    };
