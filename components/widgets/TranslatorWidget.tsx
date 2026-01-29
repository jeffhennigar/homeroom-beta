import React, { useState } from 'react';
import { Languages, ArrowRight } from 'lucide-react';
import { WidgetProps } from '../../types';
import { translateText } from '../../services/geminiService';

const TranslatorWidget: React.FC<WidgetProps> = ({ widget, updateData }) => {
    const { sourceText = '', translatedText = '', targetLanguage = 'Spanish' } = widget.data;
    const [isTranslating, setIsTranslating] = useState(false);

    const handleTranslate = async () => {
        if(!sourceText.trim()) return;
        setIsTranslating(true);
        const result = await translateText(sourceText, targetLanguage);
        updateData(widget.id, { translatedText: result });
        setIsTranslating(false);
    };

    return (
        <div className="flex flex-col h-full bg-white p-0 overflow-hidden">
            <div className="bg-emerald-600 text-white p-3 flex justify-between items-center shadow-md z-10">
                <div className="flex items-center gap-2 font-bold">
                    <Languages size={18}/>
                    <span>Translator</span>
                </div>
                <select 
                    className="text-emerald-900 text-xs rounded py-1 px-2 font-medium focus:outline-none" 
                    value={targetLanguage} 
                    onChange={e => updateData(widget.id, {targetLanguage: e.target.value})}
                >
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Japanese</option>
                    <option>Chinese</option>
                    <option>Arabic</option>
                    <option>Portuguese</option>
                    <option>Italian</option>
                </select>
            </div>
            
            <div className="flex-1 flex flex-col p-4 gap-4 bg-gray-50 overflow-y-auto custom-scrollbar">
                <div className="flex-1 flex flex-col">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 ml-1">English</label>
                    <textarea 
                        className="flex-1 w-full border border-gray-200 rounded-xl p-3 resize-none focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 text-lg bg-white shadow-sm" 
                        placeholder="Type here..." 
                        value={sourceText} 
                        onChange={e => updateData(widget.id, {sourceText: e.target.value})}
                    />
                </div>
                
                <div className="flex justify-center">
                    <button 
                        onClick={handleTranslate} 
                        disabled={isTranslating || !sourceText} 
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2 rounded-full font-bold shadow-md flex items-center gap-2 transition-all active:scale-95"
                    >
                        {isTranslating ? "Translating..." : "Translate"} <ArrowRight size={16}/>
                    </button>
                </div>

                <div className="flex-1 flex flex-col">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{targetLanguage}</label>
                    <div className="flex-1 w-full bg-white border border-gray-200 rounded-xl p-3 text-lg text-emerald-900 shadow-sm overflow-auto min-h-[100px]">
                        {translatedText || <span className="text-gray-300 italic">Translation will appear here...</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TranslatorWidget;