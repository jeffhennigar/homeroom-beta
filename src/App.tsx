import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Timer, Shuffle, Users, Armchair, Type, Camera, Dices, BarChart2,
    Edit3, Calendar, Youtube, Share2, Palette, Settings, Plus, RotateCw,
    Info, Calculator, Clock
} from 'lucide-react';

// Components
import DraggableResizable from './components/layout/DraggableResizable';
import TimerWidget from './components/widgets/TimerWidget';
import DiceWidget from './components/widgets/DiceWidget';
import SeatPickerWidget from './components/widgets/SeatPickerWidget';
import GroupMakerWidget from './components/widgets/GroupMakerWidget';
import TextWidget from './components/widgets/TextWidget';
import TrafficLightWidget from './components/widgets/TrafficLightWidget'; // Missing in imports? No I created it.
import VoteWidget from './components/widgets/VoteWidget';
import WhiteboardWidget from './components/widgets/WhiteboardWidget';
import ScheduleWidget from './components/widgets/ScheduleWidget';
import QRCodeWidget from './components/widgets/QRCodeWidget';
import YouTubeWidget from './components/widgets/YouTubeWidget';
import CalculatorWidget from './components/widgets/CalculatorWidget';
import CountdownWidget from './components/widgets/CountdownWidget';
import SettingsModal from './components/settings/SettingsModal';
import OnboardingModal from './components/modals/OnboardingModal'; // Imported Modal
import { supabase } from './services/supabaseClient';
import { dataService } from './services/dataService';


// ... (rest of imports)

// ...



// ...

// In renderDockItem (onClick logic) needs to be updated too, but addWidget check covers the main logic? 
// No, the onClick calls addWidget. 
// But wait, renderDockItem needs to be defined or I need to find where it is used.
// In the App.tsx I wrote previously, I used specific Dock rendering logic in the return statement.
// Let's check where the Dock logic is.
// I'll update the loop map.

// Icons for Dock
const TrafficLightIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="7" y="2" width="10" height="20" rx="4" />
        <circle cx="12" cy="7" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="17" r="2" />
    </svg>
);

const DOCK_LABELS = {
    TIMER: { label: 'Timer', icon: <Timer /> },
    RANDOMIZER: { label: 'Random', icon: <Shuffle /> },
    GROUP_MAKER: { label: 'Groups', icon: <Users /> },
    SEAT_PICKER: { label: 'Seats', icon: <Armchair /> },
    TEXT: { label: 'Notes', icon: <Type /> },
    TRAFFIC: { label: 'Noise', icon: <TrafficLightIcon /> },
    QR: { label: 'QR Code', icon: <Share2 /> },
    WEBCAM: { label: 'Cam', icon: <Camera /> },
    DICE: { label: 'Dice', icon: <Dices /> },
    VOTE: { label: 'Poll', icon: <BarChart2 /> },
    WHITEBOARD: { label: 'Draw', icon: <Edit3 /> },
    SCHEDULE: { label: 'Schedule', icon: <Calendar /> },
    YOUTUBE: { label: 'Embed', icon: <Youtube /> },
    CALCULATOR: { label: 'Calc', icon: <Calculator /> },
    COUNTDOWN: { label: 'Countdown', icon: <Clock /> }
};

const DEFAULT_NAMES = ["Student 1", "Student 2", "Student 3", "Student 4", "Student 5"];

const INIT_DOCK_ORDER = ['TIMER', 'RANDOMIZER', 'GROUP_MAKER', 'SEAT_PICKER', 'SCHEDULE', 'TEXT', 'TRAFFIC', 'QR', 'WEBCAM', 'DICE', 'VOTE', 'WHITEBOARD', 'YOUTUBE', 'CALCULATOR', 'COUNTDOWN'];

const BACKGROUNDS = [
    { id: 'default', name: 'Original', type: 'preset', preview: 'bg-gradient-to-br from-blue-200 to-orange-200', style: {}, textColor: 'text-slate-800' },
    { id: 'forest', name: 'Forest', type: 'image', src: 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1920', textColor: 'text-white' },
    { id: 'ocean', name: 'Ocean', type: 'image', src: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1920', textColor: 'text-slate-800' },
    { id: 'sunset', name: 'Sunset', type: 'image', src: 'https://images.pexels.com/photos/36717/amazing-animal-beautiful-beautifull.jpg?auto=compress&cs=tinysrgb&w=1920', textColor: 'text-white' },
    { id: 'galaxy', name: 'Galaxy', type: 'image', src: 'https://images.pexels.com/photos/956981/milky-way-starry-sky-night-sky-star-956981.jpeg?auto=compress&cs=tinysrgb&w=1920', textColor: 'text-white' },
    { id: 'puppy', name: 'Puppy', type: 'image', src: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=1920', textColor: 'text-white' },
    { id: 'kitten', name: 'Kitten', type: 'image', src: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=1920', textColor: 'text-white' },
    { id: 'aurora', name: 'Aurora', type: 'image', src: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1920&q=80', textColor: 'text-white' },
];

const WIDGET_SIZES = {
    TIMER: { width: 280, height: 340 },
    RANDOMIZER: { width: 250, height: 250 },
    GROUP_MAKER: { width: 600, height: 400 },
    SEAT_PICKER: { width: 900, height: 600 },
    TEXT: { width: 340, height: 260 },
    WEBCAM: { width: 320, height: 240 },
    DICE: { width: 300, height: 320 },
    TRAFFIC: { width: 220, height: 320 },
    QR: { width: 250, height: 280 },
    VOTE: { width: 400, height: 350 },
    WHITEBOARD: { width: 500, height: 400 },
    SCHEDULE: { width: 380, height: 500 },
    YOUTUBE: { width: 480, height: 360 },
    CALCULATOR: { width: 280, height: 380 },
    COUNTDOWN: { width: 280, height: 280 }
};

const App = () => {
    // Global Persisted State
    const [allRosters, setAllRosters] = useState(() => {
        try {
            const parsed = JSON.parse(localStorage.getItem('homeroom_all_rosters'));
            return Array.isArray(parsed) ? parsed : [{ id: 'default', name: "My Class", roster: DEFAULT_NAMES.map(n => ({ id: Math.random().toString(36).substr(2, 9), name: n, active: true })) }];
        }
        catch { return [{ id: 'default', name: "My Class", roster: [] }]; }
    });
    const [activeRosterId, setActiveRosterId] = useState(() => localStorage.getItem('homeroom_active_roster_id') || 'default');

    // Computed current state
    const activeRosterObj = allRosters.find(r => r.id === activeRosterId) || allRosters[0];
    const [roster, setRoster] = useState(() => {
        return Array.isArray(activeRosterObj?.roster) ? activeRosterObj.roster : [];
    });

    const [background, setBackground] = useState(() => {
        try { return JSON.parse(localStorage.getItem('homeroom_background')) || BACKGROUNDS[0]; } catch { return BACKGROUNDS[0]; }
    });

    const [customBackgrounds, setCustomBackgrounds] = useState(() => {
        try {
            const parsed = JSON.parse(localStorage.getItem('homeroom_custom_backgrounds'));
            return Array.isArray(parsed) ? parsed : [];
        } catch { return []; }
    });

    const [dockOrder, setDockOrder] = useState(() => {
        try {
            const parsed = JSON.parse(localStorage.getItem('homeroom_dock_order'));
            if (!Array.isArray(parsed)) return INIT_DOCK_ORDER;
            // Remove types that no longer exist in DOCK_LABELS (e.g. unfinished GOALS)
            const cleaned = parsed.filter(t => DOCK_LABELS[t]);
            // Append any new types from INIT_DOCK_ORDER that the user doesn't have yet
            const missing = INIT_DOCK_ORDER.filter(t => !cleaned.includes(t));
            return [...cleaned, ...missing];
        } catch { return INIT_DOCK_ORDER; }
    });

    const [widgets, setWidgets] = useState([]);
    const [zIndices, setZIndices] = useState({});
    const [maxZ, setMaxZ] = useState(10);
    const [showSettings, setShowSettings] = useState(false);
    const [showGrid, setShowGrid] = useState(() => localStorage.getItem('homeroom_grid') === 'true');
    const [dockEditMode, setDockEditMode] = useState(false);
    const [isDockMinimized, setIsDockMinimized] = useState(false);
    const [isCheckingPro, setIsCheckingPro] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [clockStyle, setClockStyle] = useState('12h');
    const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
    const [lastSyncError, setLastSyncError] = useState<string | null>(null);

    // Guards for cloud sync
    const cloudLoaded = useRef(false);   // true once initial cloud data is fetched
    const savingRef = useRef(false);     // true while a save is in-flight (to ignore own realtime events)

    // Access Control Gating
    useEffect(() => {
        const checkAccess = async () => {
            try {
                const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

                if (!authUser || userError) {
                    console.log('No user session found, redirecting to signin');
                    window.location.href = 'https://ourhomeroom.app/signin';
                    return;
                }

                setUser(authUser);

                // Check pro status from profiles table
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('pro_status, grid_enabled')
                    .eq('id', authUser.id)
                    .single();

                if (profileError || profile?.pro_status !== 'pro') {
                    console.log('Access denied: Basic or missing profile, redirecting to free');
                    window.location.href = 'https://free.ourhomeroom.app';
                    return;
                }

                if (profile?.grid_enabled !== undefined) {
                    setShowGrid(profile.grid_enabled);
                }

                // Access granted
                setIsCheckingPro(false);
            } catch (err) {
                console.error('Core auth error:', err);
                window.location.href = 'https://ourhomeroom.app/signin';
            }
        };

        checkAccess();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = 'https://ourhomeroom.app/signin';
    };

    // Persist Grid Setting
    useEffect(() => {
        localStorage.setItem('homeroom_grid', String(showGrid));

        if (!isCheckingPro) {
            const saveGrid = async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await dataService.updateProfile(user.id, { grid_enabled: showGrid });
                }
            };
            // Debounce slightly or just save (it's infrequent)
            saveGrid();
        }
    }, [showGrid, isCheckingPro]);

    // Load Data from Cloud
    useEffect(() => {
        const loadCloudData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            try {
                // Load Widgets (Slide 0 for now)
                const slides = await dataService.getSlides(user.id);
                if (slides && slides.length > 0) {
                    const loadedWidgets = slides[0].widgets;
                    if (Array.isArray(loadedWidgets)) setWidgets(loadedWidgets);
                }

                // Load Rosters
                const rosters = await dataService.getRosters(user.id);
                if (rosters && Array.isArray(rosters) && rosters.length > 0) {
                    setAllRosters(rosters.map(r => ({ ...r, active: true })));
                }
            } catch (e) {
                console.error("Error loading cloud data", e);
            }

            // Mark cloud as loaded AFTER data is fetched — this unblocks the save effect
            cloudLoaded.current = true;
        };

        if (!isCheckingPro) loadCloudData();
    }, [isCheckingPro]);

    // Sync Widgets to Cloud (guarded: only runs after cloud data has loaded)
    useEffect(() => {
        if (!cloudLoaded.current) return; // Don't save until initial cloud data is loaded

        const saveWidgetsToCloud = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            try {
                savingRef.current = true;
                await dataService.saveSlide(user.id, 0, widgets);
            } catch (e) {
                console.error("Failed to save widgets", e);
            } finally {
                // Small delay before clearing the flag so the realtime echo is ignored
                setTimeout(() => { savingRef.current = false; }, 500);
            }
        };

        const timeoutId = setTimeout(saveWidgetsToCloud, 2000); // 2s Debounce
        return () => clearTimeout(timeoutId);
    }, [widgets]);

    // Realtime cross-tab sync for widgets
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('slides-realtime')
            .on(
                'postgres_changes' as any,
                { event: '*', schema: 'public', table: 'slides', filter: `user_id=eq.${user.id}` },
                (payload: any) => {
                    // Ignore our own writes
                    if (savingRef.current) return;
                    const newWidgets = payload.new?.widgets;
                    if (Array.isArray(newWidgets)) {
                        cloudLoaded.current = true;
                        setWidgets(newWidgets);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);


    // Onboarding
    const [showOnboarding, setShowOnboarding] = useState(false);
    useEffect(() => {
        // Simple check if roster is default
        const isDefault = allRosters.length === 1 && allRosters[0].id === 'default' && allRosters[0].roster.length === 0;
        // Or deeper check, for now simple:
        if (!localStorage.getItem('homeroom_onboarded')) setShowOnboarding(true);
    }, []);

    // Persist Effects
    useEffect(() => { localStorage.setItem('homeroom_background', JSON.stringify(background)); }, [background]);
    useEffect(() => { localStorage.setItem('homeroom_dock_order', JSON.stringify(dockOrder)); }, [dockOrder]);
    useEffect(() => { localStorage.setItem('homeroom_all_rosters', JSON.stringify(allRosters)); }, [allRosters]);
    useEffect(() => {
        localStorage.setItem('homeroom_active_roster_id', activeRosterId);
        // Sync roster state when ID changes
        const r = allRosters.find(x => x.id === activeRosterId);
        if (r) setRoster(r.roster);
    }, [activeRosterId]);

    // Sync roster changes back to allRosters
    useEffect(() => {
        setAllRosters(prev => prev.map(r => r.id === activeRosterId ? { ...r, roster } : r));
    }, [roster]);

    const addWidget = (type) => {
        if (isDockMinimized) return; // Fix: Prevent click when minimized
        const id = Date.now().toString();
        const defaults = WIDGET_SIZES[type] || { width: 300, height: 300 };
        // Center logic
        const x = Math.max(0, window.innerWidth / 2 - defaults.width / 2 + (Math.random() * 40 - 20));
        const y = Math.max(0, window.innerHeight / 2 - defaults.height / 2 + (Math.random() * 40 - 20));

        setWidgets([...widgets, { id, type, x, y, width: defaults.width, height: defaults.height, data: {} }]);
        bringToFront(id);
    };

    const removeWidget = (id) => setWidgets(widgets.filter(w => w.id !== id));

    const updateWidgetData = (id, newData) => {
        setWidgets(widgets.map(w => w.id === id ? { ...w, data: { ...w.data, ...newData } } : w));
    };

    const updateWidgetLayout = (id, layout) => {
        setWidgets(widgets.map(w => w.id === id ? { ...w, ...layout } : w));
    };

    const bringToFront = (id) => {
        setMaxZ(prev => prev + 1);
        setZIndices(prev => ({ ...prev, [id]: maxZ + 1 }));
    };

    const updateRoster = (newRoster) => setRoster(newRoster);
    const handleUpdateRoster = (newRoster) => setRoster(newRoster); // Renamed for consistency with provided snippet

    // Background Styles
    const bgStyle = background.type === 'image'
        ? { backgroundImage: `url(${background.src})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : (background.type === 'custom' ? { backgroundImage: `url(${background.src})`, backgroundSize: 'cover' } : {});

    // Render Widget Content
    // The original renderWidgetContent function was replaced by an IIFE within the map.
    // Keeping the original structure for clarity, but the actual rendering logic is now inline.
    // const renderWidgetContent = (widget) => { ... };

    if (isCheckingPro) {
        return (
            <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-bold text-slate-800">Homeroom Pro</h2>
                    <p className="text-slate-500 font-medium">Verifying your active subscription...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-screen h-screen overflow-hidden relative ${background.preview || ''}`} style={bgStyle}>

            {/* Grid Overlay */}
            {showGrid && (
                <div className="absolute inset-0 pointer-events-none z-0"
                    style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />
            )}

            {/* Widgets Layer */}
            {widgets.map(w => (
                <DraggableResizable
                    key={w.id}
                    id={w.id}
                    title={DOCK_LABELS[w.type]?.label || w.type}
                    icon={DOCK_LABELS[w.type]?.icon}
                    position={{ x: w.x, y: w.y }}
                    size={{ width: w.width, height: w.height }}
                    zIndex={zIndices[w.id] || 10}
                    onUpdate={updateWidgetLayout}
                    onFocus={() => bringToFront(w.id)}
                    onRemove={removeWidget}
                    minWidth={200} minHeight={150}
                    {...w.data} // Pass locked/minimized/transparent
                >
                    {(() => {
                        const props = { widget: w, updateData: updateWidgetData, updateSize: (id, sz) => updateWidgetLayout(id, sz), roster, onUpdateRoster: handleUpdateRoster, allRosters, activeRosterId };
                        switch (w.type) {
                            // case 'NOTES': return <NotesWidget {...props} />; // Assuming NotesWidget, StopwatchWidget, CalculatorWidget are defined elsewhere or will be added
                            case 'TIMER': return <TimerWidget {...props} />;
                            // case 'STOPWATCH': return <StopwatchWidget {...props} />;
                            // case 'CALCULATOR': return <CalculatorWidget {...props} />;
                            case 'DICE': return <DiceWidget {...props} />;
                            case 'SEAT_PICKER': return <SeatPickerWidget {...props} />;
                            case 'GROUP_MAKER': return <GroupMakerWidget {...props} />;
                            case 'TEXT': return <TextWidget {...props} />;
                            case 'TRAFFIC': return <TrafficLightWidget {...props} />;
                            case 'VOTE': return <VoteWidget {...props} />;
                            case 'WHITEBOARD': return <WhiteboardWidget {...props} />;
                            case 'SCHEDULE': return <ScheduleWidget {...props} onOpenSettings={() => setShowSettings(true)} />;
                            case 'QR': return <QRCodeWidget {...props} />;
                            case 'YOUTUBE': return <YouTubeWidget {...props} />;
                            case 'CALCULATOR': return <CalculatorWidget {...props} />;
                            case 'COUNTDOWN': return <CountdownWidget {...props} />;
                            case 'RANDOMIZER': // Random student picker
                                return (
                                    <div className="flex flex-col h-full bg-white p-4 items-center justify-center text-center">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Random Student</h3>
                                        <div className="flex-1 flex items-center justify-center w-full">
                                            <div className="text-3xl font-black text-indigo-600 animate-in zoom-in duration-300 border-2 border-indigo-100 rounded-2xl p-6 shadow-sm bg-indigo-50/50">
                                                {w.data.student || "Ready?"}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const active = roster.filter(s => s.active);
                                                const rand = active[Math.floor(Math.random() * active.length)];
                                                updateWidgetData(w.id, { student: rand?.name || "No Students" });
                                            }}
                                            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                                        >
                                            <Shuffle size={18} /> Pick Random
                                        </button>
                                    </div>
                                );
                            case 'WEBCAM':
                                return (
                                    <div className="h-full bg-black flex flex-col items-center justify-center relative overflow-hidden rounded-2xl">
                                        {!w.data.streamActive ? (
                                            <button onClick={async () => {
                                                try {
                                                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                                                    const video = document.getElementById(`video-${w.id}`) as HTMLVideoElement;
                                                    if (video) video.srcObject = stream;
                                                    updateWidgetData(w.id, { streamActive: true });
                                                } catch (e) { alert("Camera error"); }
                                            }} className="text-white flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                                                <Camera size={48} />
                                                <span className="font-bold">Start Camera</span>
                                            </button>
                                        ) : (
                                            <video id={`video-${w.id}`} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                                        )}
                                        {w.data.streamActive && (
                                            <button onClick={() => {
                                                const video = document.getElementById(`video-${w.id}`) as HTMLVideoElement;
                                                if (video && video.srcObject) {
                                                    (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
                                                    video.srcObject = null;
                                                }
                                                updateWidgetData(w.id, { streamActive: false });
                                            }} className="absolute bottom-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">Stop</button>
                                        )}
                                    </div>
                                );
                            default: return <div>Unknown Widget</div>;
                        }
                    })()}
                </DraggableResizable>
            ))}

            {/* Dock */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[10000]">
                <div className="backdrop-blur-2xl shadow-2xl rounded-2xl flex items-center p-2 gap-1 transition-all duration-300 hover:scale-[1.02] ring-1 ring-white/50 relative">
                    <div className="absolute inset-0 bg-white/20 rounded-2xl overflow-hidden -z-10 border border-white/40">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/5 pointer-events-none" />
                    </div>
                    {dockOrder.map(type => (
                        <button
                            key={type}
                            onClick={() => addWidget(type)}
                            draggable={!isDockMinimized}
                            onDragStart={(e) => { e.currentTarget.classList.add('scale-105'); }}
                            onDragEnd={(e) => { e.currentTarget.classList.remove('scale-105'); }}
                            className="p-3 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-xl transition-all relative group flex flex-col items-center gap-1 z-10"
                            title={DOCK_LABELS[type].label}
                        >
                            <div className="transition-transform group-hover:-translate-y-1">{DOCK_LABELS[type].icon}</div>
                            <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 absolute -bottom-4 bg-gray-800 text-white px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none transition-opacity">
                                {DOCK_LABELS[type].label}
                            </span>
                        </button>
                    ))}
                    <div className="w-px h-8 bg-slate-300 mx-2" />
                    <div className="flex flex-col gap-1">
                        <button onClick={() => setShowSettings(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><Settings size={20} /></button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showOnboarding && (
                <OnboardingModal
                    onComplete={() => {
                        setShowOnboarding(false);
                        localStorage.setItem('homeroom_onboarded', 'true');
                    }}
                    onSaveRoster={updateRoster}
                />
            )}

            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                user={user}
                onSignOut={handleSignOut}
                onSignIn={() => window.location.href = 'https://ourhomeroom.app/signin'}
                isSyncing={isSyncing}
                clockStyle={clockStyle}
                setClockStyle={setClockStyle}
                cloudSyncEnabled={cloudSyncEnabled}
                setCloudSyncEnabled={setCloudSyncEnabled}
                lastSyncError={lastSyncError}
                roster={roster}
                setRoster={setRoster}
                backgrounds={[...BACKGROUNDS, ...customBackgrounds]}
                currentBackground={background}
                setBackground={setBackground}
                onUploadBackground={(src) => {
                    const newBg = { id: Date.now().toString(), name: 'Custom', type: 'custom', src, textColor: 'text-white' };
                    setCustomBackgrounds([...customBackgrounds, newBg]);
                    setBackground(newBg);
                    localStorage.setItem('homeroom_custom_backgrounds', JSON.stringify([...customBackgrounds, newBg]));
                }}
                onDeleteBackground={(id) => {
                    const newCustoms = customBackgrounds.filter(b => b.id !== id);
                    setCustomBackgrounds(newCustoms);
                    localStorage.setItem('homeroom_custom_backgrounds', JSON.stringify(newCustoms));
                    if (background.id === id) setBackground(BACKGROUNDS[0]);
                }}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
                allRosters={allRosters}
                setAllRosters={setAllRosters}
                activeRosterId={activeRosterId}
                setActiveRosterId={setActiveRosterId}
                activeScheduleDays={{}}
                saveScheduleTemplate={() => { }}
                widgets={widgets}
                setWidgets={setWidgets}
            />
        </div>
    );
};

export default App;
