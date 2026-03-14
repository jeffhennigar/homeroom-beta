import React, { useState, useEffect } from 'react';
import { Columns, Folder, Save, X, Trash2, Smartphone, Type, Image as ImageIcon, Smile, Search, Upload, RefreshCw, ChevronLeft, ChevronRight, Play, Layout, Settings } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

interface SortWidgetProps {
    widget: any;
    updateData: (data: any) => void;
    user: any;
}

const SortWidget: React.FC<SortWidgetProps> = ({ widget, updateData, user }) => {
    const {
        categories = [],
        unsorted = [],
        mode = 'setup',
        categoryCount = 2,
        bulkText = '',
        selectedMedia = []
    } = widget.data;

    const [setupTab, setSetupTab] = useState('text');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [emojiCategory, setEmojiCategory] = useState("Animals");
    const [searchSource, setSearchSource] = useState('wikimedia');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Saved Sets State
    const [savedSets, setSavedSets] = useState<any[]>([]);
    const [isLoadingSets, setIsLoadingSets] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showLoadMenu, setShowLoadMenu] = useState(false);
    const [saveTitle, setSaveTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: string, text: string } | null>(null);

    const DEFAULT_EMOJIS: Record<string, string[]> = {
        "Animals": ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"],
        "Food": ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇"],
        "Nature": ["🌵", "🎄", "🌲", "🌳", "🌴", "🪵", "🌱", "🌿"],
        "Objects": ["⌚", "📱", "💻", "📚", "🎨", "🎭", "🎮", "🧵"]
    };

    useEffect(() => {
        if (user) {
            loadActivitySets();
        }
    }, [user]);

    const loadActivitySets = async () => {
        if (!user) return;
        setIsLoadingSets(true);
        try {
            const { data, error } = await supabase
                .from('activity_sets')
                .select('*')
                .eq('user_id', user.id)
                .eq('activity_type', 'sort')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSavedSets(data || []);
        } catch (e) {
            console.error("Error loading activity sets:", e);
        } finally {
            setIsLoadingSets(false);
        }
    };

    const saveActivitySet = async () => {
        if (!user || !saveTitle.trim()) return;
        setIsSaving(true);
        setStatusMsg({ type: 'info', text: 'Saving...' });

        const content = {
            categories,
            bulkText,
            categoryCount,
            selectedMedia
        };

        try {
            const { error } = await supabase
                .from('activity_sets')
                .upsert({
                    user_id: user.id,
                    title: saveTitle,
                    activity_type: 'sort',
                    content: content
                });

            if (error) throw error;

            setStatusMsg({ type: 'success', text: 'Set saved!' });
            setShowSaveDialog(false);
            setSaveTitle('');
            loadActivitySets();
        } catch (e) {
            console.error("Error saving activity set:", e);
            setStatusMsg({ type: 'error', text: 'Failed to save.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setStatusMsg(null), 3000);
        }
    };

    const deleteActivitySet = async (setId: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('activity_sets')
                .delete()
                .eq('id', setId);

            if (error) throw error;
            loadActivitySets();
        } catch (e) {
            console.error("Error deleting activity set:", e);
        }
    };

    const handleLoadSet = (set: any) => {
        const { content } = set;
        updateData({
            categories: content.categories || [],
            bulkText: content.bulkText || '',
            categoryCount: content.categoryCount || 2,
            selectedMedia: content.selectedMedia || [],
            mode: 'setup'
        });
        setShowLoadMenu(false);
    };

    const searchWikimedia = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setErrorMsg(null);
        try {
            const res = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&generator=search&gsrsearch=${encodeURIComponent(searchQuery + " clipart")}&gsrnamespace=6&iiprop=url|thumburl&iiurlwidth=200&gsrlimit=20`);
            const data = await res.json();
            if (data.query && data.query.pages) {
                const hits = Object.values(data.query.pages).map((p: any) => ({
                    id: p.pageid,
                    previewURL: p.imageinfo[0].thumburl || p.imageinfo[0].url,
                    tags: p.title.replace('File:', '').split('.')[0]
                }));
                setSearchResults(hits);
            } else {
                setErrorMsg("No results found.");
            }
        } catch (e) {
            setErrorMsg("Search error.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        files.forEach((file: any) => {
            if (selectedMedia.length >= 12) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const newItem = {
                    id: `upload-${Date.now()}-${Math.random()}`,
                    type: 'image',
                    content: (ev.target as any)?.result,
                    label: file.name.split('.')[0]
                };
                updateData({ selectedMedia: [...(selectedMedia || []), newItem] });
            };
            reader.readAsDataURL(file);
        });
    };

    const handleGenerate = () => {
        const textLines = bulkText.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
        const textCards = textLines.map((text: string, i: number) => ({ id: `card-txt-${Date.now()}-${i}`, type: 'text', text }));
        const mediaCards = (selectedMedia || []).map((m: any, i: number) => ({
            id: `card-med-${Date.now()}-${i}`,
            type: m.type,
            content: m.content,
            text: m.label
        }));

        const newUnsorted = [...textCards, ...mediaCards];

        let newCategories = categories;
        if (newCategories.length !== categoryCount) {
            newCategories = Array.from({ length: categoryCount }, (_, i) => ({
                id: `cat-${i}`,
                name: categories[i]?.name || `Category ${i + 1}`,
                cards: []
            }));
        } else {
            newCategories = newCategories.map((c: any) => ({ ...c, cards: [] }));
        }

        updateData({
            categories: newCategories,
            unsorted: newUnsorted,
            mode: 'play'
        });
    };

    const handleCardDragStart = (e: React.DragEvent, card: any, sourceContext: string) => {
        e.dataTransfer.setData('cardId', card.id);
        e.dataTransfer.setData('sourceContext', sourceContext);
    };

    const handleDrop = (e: React.DragEvent, targetContext: string) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('cardId');
        const sourceContext = e.dataTransfer.getData('sourceContext');

        if (sourceContext === targetContext) return;

        let movedCard;
        let newUnsorted = [...unsorted];
        let newCategories = categories.map((c: any) => ({ ...c, cards: [...c.cards] }));

        if (sourceContext === 'unsorted') {
            const idx = newUnsorted.findIndex(c => c.id === cardId);
            if (idx > -1) [movedCard] = newUnsorted.splice(idx, 1);
        } else {
            const catIdx = parseInt(sourceContext);
            const idx = newCategories[catIdx].cards.findIndex((c: any) => c.id === cardId);
            if (idx > -1) [movedCard] = newCategories[catIdx].cards.splice(idx, 1);
        }

        if (!movedCard) return;

        if (targetContext === 'unsorted') {
            newUnsorted.push(movedCard);
        } else {
            const catIdx = parseInt(targetContext);
            newCategories[catIdx].cards.push(movedCard);
        }

        updateData({ unsorted: newUnsorted, categories: newCategories });
    };

    if (mode === 'setup') {
        const emojiList = DEFAULT_EMOJIS[emojiCategory] || [];
        const emojiCategories = Object.keys(DEFAULT_EMOJIS);

        return (
            <div className="flex flex-col h-full bg-slate-50 p-4 overflow-hidden relative">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Columns size={20} className="text-blue-600" />
                        Sort Setup
                    </h3>
                    <div className="flex gap-2">
                         <button onClick={() => setShowLoadMenu(!showLoadMenu)} className="p-2 bg-white border rounded-xl hover:bg-slate-50 transition-all"><Folder size={18} /></button>
                         <button onClick={() => setShowSaveDialog(!showSaveDialog)} className="p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all"><Save size={18} /></button>
                    </div>
                </div>

                {showLoadMenu && (
                    <div className="absolute top-16 right-4 w-64 bg-white rounded-2xl shadow-2xl border p-3 z-50">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Saved Sets</span>
                            <button onClick={() => setShowLoadMenu(false)}><X size={12}/></button>
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {savedSets.map(set => (
                                <button key={set.id} onClick={() => handleLoadSet(set)} className="w-full text-left p-2 hover:bg-slate-50 rounded-lg text-sm font-medium border-b border-slate-100 last:border-0">{set.title}</button>
                            ))}
                        </div>
                    </div>
                )}

                {showSaveDialog && (
                    <div className="absolute top-16 right-4 w-64 bg-white rounded-2xl shadow-2xl border p-4 z-50">
                         <input type="text" value={saveTitle} onChange={e => setSaveTitle(e.target.value)} placeholder="Title..." className="w-full p-2 border rounded-lg mb-2 outline-none focus:ring-2 focus:ring-blue-400" />
                         <button onClick={saveActivitySet} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold">Save Set</button>
                    </div>
                )}

                <div className="flex gap-4 mb-4 shrink-0 overflow-x-auto pb-1">
                    {['text', 'emoji', 'images'].map(tab => (
                        <button key={tab} onClick={() => setSetupTab(tab)} className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${setupTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {setupTab === 'text' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Items to Sort (One per line)</label>
                            <textarea
                                className="w-full h-40 p-4 border rounded-2xl resize-none outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                                value={bulkText}
                                onChange={e => updateData({ bulkText: e.target.value })}
                                placeholder="Apple&#10;Banana&#10;Carrot..."
                            />
                        </div>
                    )}

                    {setupTab === 'emoji' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                                {emojiCategories.map(cat => (
                                    <button key={cat} onClick={() => setEmojiCategory(cat)} className={`px-3 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${emojiCategory === cat ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                        {cat}
                                    </button>
                                ))}
                             </div>
                             <div className="grid grid-cols-4 gap-2">
                                {emojiList.map((emoji, i) => (
                                    <button key={i} onClick={() => updateData({ selectedMedia: [...selectedMedia, { id: `emoji-${Date.now()}-${i}`, type: 'emoji', content: emoji, label: '' }] })} className="aspect-square flex items-center justify-center text-3xl bg-white border rounded-xl hover:scale-110 active:scale-95 transition-all shadow-sm">
                                        {emoji}
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}

                    {setupTab === 'images' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex gap-2 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchWikimedia()} placeholder="Search clipart..." className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-400" />
                                </div>
                                <button onClick={searchWikimedia} className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all"><Search size={18}/></button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {isSearching ? <div className="col-span-3 text-center py-4 text-slate-400 italic text-sm">Searching...</div> : (searchResults || []).map(res => (
                                    <button key={res?.id || Math.random().toString()} onClick={() => updateData({ selectedMedia: [...(selectedMedia || []), { id: `img-${Date.now()}-${res?.id}`, type: 'image', content: res?.previewURL, label: '' }] })} className="aspect-square rounded-xl overflow-hidden border hover:border-blue-400 transition-all shadow-sm bg-white">
                                        <img src={res?.previewURL || ''} className="w-full h-full object-contain p-1" alt="clipart" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Number of Categories</label>
                        <div className="flex items-center gap-1 bg-white border rounded-xl p-1">
                            {[2, 3, 4].map(c => (
                                <button key={c} onClick={() => updateData({ categoryCount: c })} className={`w-8 h-8 rounded-lg font-bold transition-all ${categoryCount === c ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>{c}</button>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleGenerate} className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 group">
                        <Play size={20} className="group-hover:translate-x-1 transition-transform" />
                        Start Sorting
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            <div className="p-3 border-b bg-white flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-2 text-slate-800 font-black tracking-tight">
                    <Layout className="text-blue-600" size={18} />
                    SORT ACTIVITY
                </div>
                <div className="flex gap-2">
                    <button onClick={() => updateData({ mode: 'setup' })} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><Settings size={18} /></button>
                </div>
            </div>

            <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
                <div 
                    className="flex-1 bg-white/50 border-2 border-dashed border-slate-200 rounded-[2rem] p-6 flex flex-wrap gap-3 content-start overflow-y-auto custom-scrollbar relative"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleDrop(e, 'unsorted')}
                >
                    {unsorted.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest pointer-events-none">Sorted!</div>
                    ) : unsorted.map((card: any) => (
                        <div 
                            key={card.id}
                            draggable
                            onDragStart={e => handleCardDragStart(e, card, 'unsorted')}
                            className="p-3 bg-white shadow-lg rounded-2xl border border-slate-100 cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-all flex items-center gap-2 min-w-[100px] max-w-[180px]"
                        >
                            {card.type === 'image' && <img src={card.content} className="w-8 h-8 object-contain rounded-lg" />}
                            {card.type === 'emoji' && <span className="text-2xl">{card.content}</span>}
                            <span className="flex-1 text-sm font-bold text-slate-700 truncate">{card.text || 'Item'}</span>
                        </div>
                    ))}
                </div>

                <div className="flex gap-4 h-1/2 min-h-[300px]">
                    {categories.map((cat: any, idx: number) => (
                        <div 
                            key={cat.id}
                            className="flex-1 flex flex-col gap-3 group"
                        >
                            <input
                                className="w-full bg-transparent text-center font-black text-slate-800 uppercase tracking-widest outline-none focus:text-blue-600 transition-colors"
                                value={cat.name}
                                onChange={e => {
                                    const newCats = [...categories];
                                    newCats[idx] = { ...newCats[idx], name: e.target.value };
                                    updateData({ categories: newCats });
                                }}
                            />
                            <div 
                                className="flex-1 bg-white rounded-[2.5rem] p-4 shadow-xl border border-slate-100 flex flex-col gap-2 overflow-y-auto custom-scrollbar transition-all group-hover:shadow-2xl group-hover:border-blue-200"
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => handleDrop(e, idx.toString())}
                            >
                                {cat.cards.map((card: any) => (
                                    <div 
                                        key={card.id}
                                        draggable
                                        onDragStart={e => handleCardDragStart(e, card, idx.toString())}
                                        className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2 cursor-grab active:cursor-grabbing hover:bg-blue-50 transition-all shrink-0"
                                    >
                                        {card.type === 'image' && <img src={card.content} className="w-6 h-6 object-contain rounded-md" />}
                                        {card.type === 'emoji' && <span className="text-xl">{card.content}</span>}
                                        <span className="text-xs font-bold text-slate-600 truncate">{card.text || 'Item'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SortWidget;
