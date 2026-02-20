import React, { useState } from 'react';
import { Youtube, Check, X } from 'lucide-react';

const EmbedWidget = ({ widget, updateData }) => {
    const { url = "", youtubeUrl = "" } = widget.data;
    const currentUrl = url || youtubeUrl;
    const [input, setInput] = useState(currentUrl);

    const getEmbedSrc = (link) => {
        if (!link) return null;
        let processedLink = link.trim();
        // Auto-add protocol if missing (and not an iframe tag)
        if (!processedLink.startsWith('http://') && !processedLink.startsWith('https://') && !processedLink.startsWith('<iframe')) {
            processedLink = 'https://' + processedLink;
        }

        if (processedLink.includes("youtube.com") || processedLink.includes("youtu.be")) {
            const id = processedLink.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]{11})/)?.[1];
            // User requested yout-ube.com for ad-free experience
            return id ? `https://www.yout-ube.com/watch?v=${id}` : null;
        }
        if (processedLink.includes("vimeo.com")) {
            const id = processedLink.match(/vimeo\.com\/(\d+)/)?.[1];
            return id ? `https://player.vimeo.com/video/${id}` : null;
        }
        if (processedLink.includes("<iframe")) {
            const src = processedLink.match(/src="([^"]+)"/)?.[1];
            return src || null;
        }
        return processedLink;
    };

    const embedSrc = getEmbedSrc(currentUrl);

    return (
        <div className="h-full flex flex-col bg-white border border-slate-200 shadow-xl rounded-2xl relative group overflow-hidden">
            {!embedSrc ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-600 gap-4">
                    <div className="p-4 bg-red-50 rounded-full text-red-500"><Youtube size={32} /></div>
                    <div className="text-center space-y-3 w-full">
                        <div className="font-bold text-lg text-slate-800">Embed Content</div>
                        <p className="text-slate-400 text-xs text-center max-w-[200px] mx-auto">Paste a link (YouTube, Google Slides, website) or embed code.</p>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 outline-none transition-all"
                                placeholder="Paste link here..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        let title = "Embed";
                                        try {
                                            const urlObj = new URL(input.startsWith('http') ? input : `https://${input}`);
                                            title = urlObj.hostname.replace('www.', '');
                                        } catch (e) { }
                                        updateData(widget.id, { url: input, title });
                                    }
                                }}
                            />
                            <button onClick={() => {
                                let title = "Embed";
                                try {
                                    const urlObj = new URL(input.startsWith('http') ? input : `https://${input}`);
                                    title = urlObj.hostname.replace('www.', '');
                                } catch (e) { }
                                updateData(widget.id, { url: input, title });
                            }} className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"><Check size={18} /></button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <iframe src={embedSrc} className="w-full h-full bg-white" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    <button
                        onClick={() => updateData(widget.id, { url: "", youtubeUrl: "" })}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm border border-slate-100"
                        title="Remove Embed"
                    >
                        <X size={16} />
                    </button>
                </>
            )}
        </div>
    );
};

export default EmbedWidget;
