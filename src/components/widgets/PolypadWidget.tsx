import React from 'react';

const PolypadWidget: React.FC = () => {
    return (
        <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
            <iframe
                src="https://mathigon.org/polypad#geometry"
                className="flex-1 w-full h-full border-none"
                title="Polypad"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; camera; microphone; clipboard-read; clipboard-write"
                allowFullScreen
            />
            <div className="h-6 bg-slate-50 border-t border-slate-200 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Materials created using Polypad by Amplify</span>
            </div>
        </div>
    );
};

export default PolypadWidget;
