import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Timer, Shuffle, Users, Armchair, Type, Camera, Dices, BarChart2,
    Edit3, Calendar, Youtube, Share2, Palette, Settings, Plus, RotateCw,
    Info, Calculator, Clock, Volume2, Ruler, ChevronLeft, ChevronRight, Unlock, Lock, MoreHorizontal, ChevronDown, ChevronUp, LayoutGrid, Gamepad2,
    StickyNote, Lightbulb, Cloud, Columns, Undo2, Copy, Trash2, ArrowRightSquare, CircleDot, AlertTriangle, X as XIcon
} from 'lucide-react';

// Components
import DraggableResizable from './components/layout/DraggableResizable';
import TimerWidget from './components/widgets/TimerWidget';
import DiceWidget from './components/widgets/DiceWidget';
import SeatPickerWidget from './components/widgets/SeatPickerWidget';
import GroupMakerWidget from './components/widgets/GroupMakerWidget';
import TextWidget from './components/widgets/TextWidget';
import TrafficLightWidget from './components/widgets/TrafficLightWidget';
import VoteWidget from './components/widgets/VoteWidget';
import WhiteboardWidget from './components/widgets/WhiteboardWidget';
import DrawingWidget from './components/widgets/DrawingWidget';
import ScheduleWidget from './components/widgets/ScheduleWidget';
import QRCodeWidget from './components/widgets/QRCodeWidget';
import EmbedWidget from './components/widgets/EmbedWidget';
import CalculatorWidget from './components/widgets/CalculatorWidget';
import GamesWidget from './components/widgets/GamesWidget';
import CountdownWidget from './components/widgets/CountdownWidget';
import SoundboardWidget from './components/widgets/SoundboardWidget';
import PolypadWidget from './components/widgets/PolypadWidget';
import CalendarWidget from './components/widgets/CalendarWidget';
import SettingsModal from './components/settings/SettingsModal';
import SlideManager from './components/slides/SlideManager';
import OnboardingModal from './components/modals/OnboardingModal';
import ClockDisplay from './components/ClockDisplay';
import SparkWidget from './components/widgets/SparkWidget';
import SortWidget from './components/widgets/SortWidget';
import MarbleJarWidget from './components/widgets/MarbleJarWidget';
import WeatherWidget from './components/widgets/WeatherWidget';
import RandomizerWidget from './components/widgets/RandomizerWidget';
import SimpleTextWidget from './components/widgets/SimpleTextWidget';
import { supabase } from './services/supabaseClient';
import { syncManager } from './services/SyncManager';
import { dataService } from './services/dataService';
import { Widget, Student } from './types';
import { 
    INIT_DOCK_ORDER, 
    BACKGROUNDS, 
    CLOCK_STYLES, 
    WIDGET_SIZES, 
    THEME_COLORS,
    DEFAULT_NAMES
} from './constants';


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
    TIMER: { label: 'Timers', icon: <Timer size={24} /> },
    CLOCK: { label: 'Clock', icon: <Clock size={24} /> },
    RANDOMIZER: { label: 'Random', icon: <Shuffle size={24} /> },
    GROUP_MAKER: { label: 'Groups', icon: <Users size={24} /> },
    SEAT_PICKER: { label: 'Seats', icon: <Armchair size={24} /> },
    TEXT: { label: 'Notes', icon: <StickyNote size={24} /> },
    OVERLAY_TEXT: { label: 'Text', icon: <Type size={24} /> },
    TRAFFIC: { label: 'Noise', icon: <TrafficLightIcon /> },
    QR: { label: 'Exit Ticket', icon: <Share2 size={24} /> },
    WEBCAM: { label: 'Cam', icon: <Camera size={24} /> },
    DICE: { label: 'Dice', icon: <Dices size={24} /> },
    VOTE: { label: 'Poll', icon: <BarChart2 size={24} /> },
    WHITEBOARD: { label: 'Drawing', icon: <Edit3 size={24} /> },
    DRAWING: { label: 'Drawing', icon: <Edit3 size={24} /> }, // Alias for parity
    SCHEDULE: { label: 'Schedule', icon: <Calendar size={24} /> },
    EMBED: { label: 'Embed', icon: <Youtube size={24} /> },
    CALCULATOR: { label: 'Calc', icon: <Calculator size={24} /> },
    SPARK: { label: 'Spark', icon: <Lightbulb size={24} /> },
    WEATHER: { label: 'Weather', icon: <Cloud size={24} /> },
    SORT: { label: 'Sort', icon: <Columns size={24} /> },
    COUNTDOWN: { label: 'Countdown', icon: <Clock size={24} /> },
    SOUNDBOARD: { label: 'Sounds', icon: <Volume2 size={24} /> },
    POLYPAD: { label: 'Polypad', icon: <Ruler size={24} /> },
    GAMES: { label: 'Games', icon: <Gamepad2 size={24} /> },
    MARBLE_JAR: { label: 'Reward', icon: <CircleDot size={24} /> },
    CALENDAR: { label: 'Calendar', icon: <Calendar size={24} /> }
};



const OriginalBackground = () => (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="gradOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#fb923c", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "#ea580c", stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "#60a5fa", stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="#dbeafe" />
            <path d="M1920 0V900C1400 900 1000 400 500 0H1920Z" fill="url(#gradOrange)" opacity="0.9" />
            <path d="M1920 0V700C1600 700 1300 300 900 0H1920Z" fill="#fed7aa" opacity="0.5" />
            <path d="M0 1080V300C500 300 900 800 1600 1080H0Z" fill="url(#gradBlue)" opacity="0.9" />
            <path d="M0 1080V500C300 500 700 900 1200 1080H0Z" fill="#93c5fd" opacity="0.5" />
        </svg>
    </div>
);


const App = () => {
    const dockClickLockRef = useRef(false);
    // Global Persisted State
    const [allRosters, setAllRosters] = useState(() => {
        try {
            const raw = localStorage.getItem('homeroom_all_rosters');
            if (!raw) return [{ id: 'default', name: "My Class", roster: DEFAULT_NAMES.map(n => ({ id: Math.random().toString(36).substr(2, 9), name: n, active: true })) }];
            const parsed = JSON.parse(raw);
            const data = (parsed && typeof parsed === 'object' && 'rosters' in parsed) ? parsed.rosters : parsed;
            return Array.isArray(data) ? data : [{ id: 'default', name: "My Class", roster: [] }];
        }
        catch { return [{ id: 'default', name: "My Class", roster: [] }]; }
    });
    const [activeRosterId, setActiveRosterId] = useState(() => localStorage.getItem('homeroom_active_roster_id') || 'default');

    // Schedule Global State
    const [scheduleTemplate, setScheduleTemplate] = useState(() => {
        try {
            const raw = localStorage.getItem('homeroom_schedule_template');
            const data = raw ? JSON.parse(raw) : null;
            const template = (data && typeof data === 'object' && 'template' in data) ? data.template : (data || {});
            return { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], ...template };
        }
        catch { return { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] }; }
    });
    const [scheduleOverrides, setScheduleOverrides] = useState(() => {
        try {
            const raw = localStorage.getItem('homeroom_schedule_overrides');
            const data = raw ? JSON.parse(raw) : null;
            const overrides = (data && typeof data === 'object' && 'overrides' in data) ? data.overrides : (data || {});
            return overrides;
        }
        catch { return {}; }
    });
    const [scheduleSettings, setScheduleSettings] = useState(() => {
        try {
            const raw = localStorage.getItem('homeroom_schedule_settings');
            const data = raw ? JSON.parse(raw) : null;
            const settings = (data && typeof data === 'object' && 'settings' in data) ? data.settings : (data || {});
            return { 
                scheduleMode: 'weekly', 
                dayLabels: [], 
                daysInCycle: 6,
                realignDate: new Date().toISOString().split('T')[0],
                realignDay: 1,
                showDescriptions: true,
                ...settings 
            };
        }
        catch { return { scheduleMode: 'weekly', dayLabels: [], daysInCycle: 6, realignDate: new Date().toISOString().split('T')[0], realignDay: 1, showDescriptions: true }; }
    });

    // Computed current state
    const activeRosterObj = allRosters.find(r => r.id === activeRosterId) || allRosters[0];
    const [roster, setRoster] = useState(() => {
        return Array.isArray(activeRosterObj?.roster) ? activeRosterObj.roster : [];
    });

    const [background, setBackground] = useState(() => {
        try {
            const raw = localStorage.getItem('homeroom_background');
            const data = raw ? JSON.parse(raw) : BACKGROUNDS[0];
            return (data && typeof data === 'object' && 'id' in data) ? data : (data || BACKGROUNDS[0]);
        } catch { return BACKGROUNDS[0]; }
    });

    const [customBackgrounds, setCustomBackgrounds] = useState(() => {
        try {
            const raw = localStorage.getItem('homeroom_custom_backgrounds');
            const data = raw ? JSON.parse(raw) : [];
            return Array.isArray(data) ? data : [];
        } catch { return []; }
    });

    const [slideBackgrounds, setSlideBackgrounds] = useState(() => {
        try {
            const raw = localStorage.getItem('homeroom_slide_backgrounds');
            const data = raw ? JSON.parse(raw) : {};
            const backgrounds = (data && typeof data === 'object' && 'backgrounds' in data) ? data.backgrounds : (data || {});
            return backgrounds;
        }
        catch { return {}; }
    });

    const [dockOrder, setDockOrder] = useState<any>(() => {
        try {
            const raw = localStorage.getItem('homeroom_dock_order');
            const data = raw ? JSON.parse(raw) : null;
            const parsed = (data && typeof data === 'object' && 'items' in data) ? data.items : data;

            const mainDefaults = ['TIMER', 'CLOCK', 'OVERLAY_TEXT', 'RANDOMIZER', 'GROUP_MAKER', 'SEAT_PICKER', 'SCHEDULE', 'TEXT', 'CALENDAR'];
            const drawerDefaults = INIT_DOCK_ORDER.filter(id => !mainDefaults.includes(id));

            if (parsed && typeof parsed === 'object' && parsed.main && parsed.drawer) {
                // Remove non-existent types
                const cleanedMain = (parsed.main || []).map((t: string) => t === 'YOUTUBE' ? 'EMBED' : t).filter((t: string) => DOCK_LABELS[t]);
                const cleanedDrawer = (parsed.drawer || []).map((t: string) => t === 'YOUTUBE' ? 'EMBED' : t).filter((t: string) => DOCK_LABELS[t]);
                const currentIds = [...cleanedMain, ...cleanedDrawer];
                
                // FORCE: Add CLOCK and OVERLAY_TEXT to MAIN if they are completely missing
                const forceMain = [];
                if (!currentIds.includes('CLOCK')) forceMain.push('CLOCK');
                if (!currentIds.includes('OVERLAY_TEXT')) forceMain.push('OVERLAY_TEXT');

                const missing = INIT_DOCK_ORDER.filter(t => !currentIds.includes(t) && !forceMain.includes(t));
                return { 
                    main: [...cleanedMain, ...forceMain], 
                    drawer: [...cleanedDrawer, ...missing] 
                };
            }

            if (Array.isArray(parsed)) {
                const cleaned = parsed.map((t: string) => t === 'YOUTUBE' ? 'EMBED' : t).filter((t: string) => DOCK_LABELS[t]);
                const currentIds = cleaned;
                const missing = INIT_DOCK_ORDER.filter(t => !currentIds.includes(t));
                const all = [...cleaned, ...missing];
                return {
                    main: all.slice(0, 8),
                    drawer: all.slice(8)
                };
            }

            return { main: mainDefaults, drawer: drawerDefaults };
        } catch {
            return {
                main: ['TIMER', 'RANDOMIZER', 'GROUP_MAKER', 'SEAT_PICKER', 'SCHEDULE', 'TEXT', 'CALENDAR'],
                drawer: ['TRAFFIC', 'QR', 'WEBCAM', 'DICE', 'VOTE', 'WHITEBOARD', 'EMBED', 'CALCULATOR', 'COUNTDOWN', 'SOUNDBOARD', 'POLYPAD', 'GAMES']
            };
        }
    });

    const [widgets, setWidgets] = useState([]);
    const [allSlides, setAllSlides] = useState<any[]>(() => {
        try {
            const raw = localStorage.getItem('homeroom_all_slides');
            let slidesData: any[] = [[]];
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) slidesData = parsed;
                else if (parsed && typeof parsed === 'object' && 'slides' in parsed) slidesData = parsed.slides;
            }
            
            // Ensure Default Widgets exist on Slide 0 for new users or fresh sessions
            if (slidesData.length > 0 && Array.isArray(slidesData[0]) && slidesData[0].length === 0) {
                const now = Date.now();
                const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1440;
                const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 900;
                
                const defaults = [
                    {
                        id: 'default-clock-' + now,
                        type: 'CLOCK',
                        x: Math.round((screenWidth - 500) / 2),
                        y: 80,
                        width: 500,
                        height: 210,
                        data: { style: 'standard', fontSize: 20, isGlassy: 'clear' },
                        zIndex: 1
                    },
                    {
                        id: 'default-timer-' + now,
                        type: 'TIMER',
                        x: 80,
                        y: 120,
                        width: 280,
                        height: 340,
                        data: { timeLeft: 120, isRunning: false, mode: 'visual', fontSize: 14 },
                        zIndex: 2
                    },
                    {
                        id: 'default-text-' + now,
                        type: 'TEXT',
                        x: Math.round(screenWidth - 380),
                        y: 120,
                        width: 300,
                        height: 300,
                        data: { mode: 'text', content: '## Welcome to HomeRoom Pro! 🚀\n\nThis is your space to organize your classroom.\n\n- Drag tools to move them\n- Resize from the corners\n- Use the dock below to add more tools!', fontSize: 13 },
                        zIndex: 3
                    },
                    {
                        id: 'default-calendar-' + now,
                        type: 'CALENDAR',
                        x: Math.round(screenWidth - 400),
                        y: Math.max(120, screenHeight - 450),
                        width: 320,
                        height: 380,
                        data: { isGlassy: 'clear' },
                        zIndex: 4
                    }
                ];
                slidesData[0] = defaults;
            }
            return slidesData;
        } catch (e) { return [[]]; }
    }); // Array of widget arrays
    const widgetsSlideIndexRef = useRef(0);
    const [closingWidgetId, setClosingWidgetId] = useState(null);
    const [zIndices, setZIndices] = useState({});
    const [maxZ, setMaxZ] = useState(10);
    const [showSettings, setShowSettings] = useState(false);
    const [showGrid, setShowGrid] = useState(() => localStorage.getItem('homeroom_grid') === 'true');
    const [dockEditMode, setDockEditMode] = useState(false);
    const [isDockMinimized, setIsDockMinimized] = useState(false);
    const [isCheckingPro, setIsCheckingPro] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStats, setSyncStats] = useState({ pending: 0, raw: 0, comp: 0, lastSync: null });

    useEffect(() => {
        return syncManager.subscribe((state) => {
            setIsSyncing(state.status === 'syncing' || state.status === 'pending');
            setSyncStats({ pending: state.pendingCount, raw: state.rawBytesSaved, comp: state.compressedBytesSaved, lastSync: state.lastSyncTime });
        });
    }, []);
    const [clockStyle, setClockStyle] = useState('12h');
    const [accentColor, setAccentColor] = useState(() => localStorage.getItem('homeroom_accent_color') || 'indigo');
    const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
    const [lastSyncError, setLastSyncError] = useState<string | null>(null);
    const [focusedId, setFocusedId] = useState<string | null>(null);

    // Feature Toggles (Pro Parity)
    const [showClockDate, setShowClockDate] = useState(() => localStorage.getItem('homeroom_show_clock_date') !== 'false');
    const [is24Hour, setIs24Hour] = useState(() => localStorage.getItem('homeroom_24hour') === 'true');
    const [isGlassy, setIsGlassy] = useState(() => localStorage.getItem('homeroom_glassy') || 'glass');

    useEffect(() => { localStorage.setItem('homeroom_show_clock_date', String(showClockDate)); }, [showClockDate]);
    useEffect(() => { localStorage.setItem('homeroom_24hour', String(is24Hour)); }, [is24Hour]);
    useEffect(() => { localStorage.setItem('homeroom_glassy', isGlassy); }, [isGlassy]);

    // Backup Reminder Toast
    const [showBackupReminder, setShowBackupReminder] = useState(false);
    const [backupDaysOverdue, setBackupDaysOverdue] = useState(0);

    useEffect(() => {
        try {
            const enabled = JSON.parse(localStorage.getItem('homeroom_backup_enabled') || 'false');
            if (!enabled) return;
            const interval = parseInt(localStorage.getItem('homeroom_backup_interval') || '7');
            const lastBackup = localStorage.getItem('homeroom_last_backup');
            const lastDate = lastBackup ? new Date(lastBackup) : null;
            const daysSince = lastDate ? Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
            if (daysSince >= interval) {
                setBackupDaysOverdue(daysSince);
                setShowBackupReminder(true);
            }
        } catch (e) { /* ignore */ }
    }, []);

    const [showMoreDrawer, setShowMoreDrawer] = useState(false);
    const drawerRef = useRef<HTMLDivElement>(null);

    // Diagnostics State
    const [debugLog, setDebugLog] = useState<{ id: string, msg: string, time: string, type: 'info' | 'error' | 'success' }[]>([]);
    const [showSlideManager, setShowSlideManager] = useState(false);
    const [channelStatus, setChannelStatus] = useState<Record<string, 'connected' | 'disconnected' | 'error'>>({
        slides: 'disconnected',
        profile: 'disconnected',
        rosters: 'disconnected'
    });
    const [history, setHistory] = useState<any[]>([]);
    const [redoStack, setRedoStack] = useState<any[]>([]);

    const [sparkGrade, setSparkGrade] = useState(() => localStorage.getItem('homeroom_spark_grade') || '3rd Grade');
    const [studentName, setStudentName] = useState('');

    const addToHistory = () => {
        setHistory(prev => [...prev.slice(-19), widgets]);
        setRedoStack([]);
    };

    const handleUndo = useCallback(() => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setRedoStack(prev => [...prev, widgets]);
        setWidgets(previous);
        setHistory(prev => prev.slice(0, -1));
        setRedoStack(prev => prev.slice(0, -1));
    }, [redoStack, widgets]);


    const addDebugLog = (msg: string, type: 'info' | 'error' | 'success' = 'info') => {
        setDebugLog(prev => [{
            id: Date.now().toString(),
            msg,
            time: new Date().toLocaleTimeString(),
            type
        }, ...prev].slice(0, 15));
    };

    // Click outside listener for drawer
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
                setShowMoreDrawer(false);
            }
        };
        if (showMoreDrawer) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMoreDrawer]);

    // --- NEW: Pro Features & Limits ---
    const [currentSlideIndex, setCurrentSlideIndex] = useState(() => {
        try { return parseInt(localStorage.getItem('homeroom_current_slide') || '0'); } catch { return 0; }
    });
    const [isLocked, setIsLocked] = useState(() => localStorage.getItem('homeroom_locked') === 'true');
    const SLIDE_LIMIT = 25;
    const BG_LIMIT = 12;

    // Persist session-local slide/lock
    useEffect(() => { localStorage.setItem('homeroom_current_slide', currentSlideIndex.toString()); }, [currentSlideIndex]);
    useEffect(() => { localStorage.setItem('homeroom_locked', String(isLocked)); }, [isLocked]);

    // Guards for cloud sync
    const cloudLoaded = useRef(false);   // true once initial cloud data is fetched
    const savingRef = useRef(false);     // true while a save is in-flight (to ignore own realtime events)
    const lastSyncedRef = useRef({ profile: null, slides: {}, rosters: {} });

    // Access Control Gating
    useEffect(() => {
        const checkAccess = async () => {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            
            try {
                const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

                if (!authUser || userError) {
                    if (isLocal) {
                        console.log('No user session, but on localhost. Bypassing redirect.');
                        setIsCheckingPro(false);
                        return;
                    }
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

                if ((profileError || profile?.pro_status !== 'pro') && !isLocal) {
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
                if (!isLocal) {
                    window.location.href = 'https://ourhomeroom.app/signin';
                } else {
                    setIsCheckingPro(false);
                }
            }
        };

        checkAccess();

        // Reactive auth state listener (cross-tab login, token refresh, sign-out)
        let subscription: { unsubscribe: () => void } | null = null;
        try {
            const { data } = supabase.auth.onAuthStateChange((_event, session) => {
                const newUser = session?.user ?? null;
                setUser(newUser);
                if (!newUser) {
                    // User signed out — clear sync state
                    cloudLoaded.current = false;
                    savingRef.current = false;
                    lastSyncedRef.current = { profile: null, slides: {}, rosters: {} };
                }
            });
            subscription = data?.subscription ?? null;
        } catch (e) {
            console.warn('onAuthStateChange setup failed:', e);
        }

        return () => { subscription?.unsubscribe(); };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = 'https://ourhomeroom.app/signin';
    };

    // --- CLOUD SYNC CONSOLIDATION ---
    const profileLastModified = useRef(0);

    useEffect(() => {
        if (isCheckingPro || !user || !cloudSyncEnabled || !cloudLoaded.current) return;

        const syncToCloud = async () => {
            if (!cloudLoaded.current || !user || !cloudSyncEnabled) return;
            // Removed savingRef restriction from start to ensure all state changes eventually queue
            try {
                setIsSyncing(true);
                savingRef.current = true;

                // 1. Sync Current Slide (Check for changes)
                const widgetsStr = JSON.stringify(widgets);
                let slideChanged = false;
                if (lastSyncedRef.current.slides[currentSlideIndex] !== widgetsStr) {
                    syncManager.saveSlide(user.id, currentSlideIndex, widgets);
                    lastSyncedRef.current.slides[currentSlideIndex] = widgetsStr;
                    slideChanged = true;
                }

                // 2. Sync Rosters & Modernize IDs
                const currentRosters = [...allRosters];
                let rostersChanged = false;

                for (let i = 0; i < currentRosters.length; i++) {
                    const r = currentRosters[i];
                    if (r.id === 'default' && r.roster.length === 0) continue;

                    const rStr = JSON.stringify(r);
                    if (lastSyncedRef.current.rosters[r.id] === rStr) continue;

                    try {
                        const updated = await syncManager.saveRoster(user.id, r);
                        lastSyncedRef.current.rosters[r.id] = rStr;

                        if (updated && updated.id !== r.id) {
                            currentRosters[i] = { ...r, id: updated.id };
                            lastSyncedRef.current.rosters[updated.id] = JSON.stringify(currentRosters[i]);
                            rostersChanged = true;

                            if (activeRosterId === r.id) {
                                setActiveRosterId(updated.id);
                            }
                        }
                    } catch (err) {
                        console.error('Individual roster sync error:', err);
                    }
                }

                if (rostersChanged) {
                    setAllRosters(currentRosters);
                }

                // Clean up deleted rosters
                const validUUIDs = currentRosters
                    .map(r => r.id)
                    .filter(id => id && id !== 'default' && /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(String(id)));

                if (validUUIDs.length > 0) {
                    await supabase.from('rosters')
                        .delete()
                        .eq('user_id', user.id)
                        .not('id', 'in', `(${validUUIDs.map(id => `'${id}'`).join(',')})`);
                }

                // 3. Sync Profile (Check for changes)
                const profilePayload = {
                    grid_enabled: showGrid,
                    clock_style: clockStyle,
                    accent_color: accentColor,
                    dock_order: dockOrder,
                    background: background,
                    slide_backgrounds: slideBackgrounds,
                    my_backgrounds: customBackgrounds,
                    schedule: {
                        ...scheduleTemplate,
                        _settings: scheduleSettings
                    },
                    schedule_overrides: scheduleOverrides,
                    active_roster_id: activeRosterId !== 'default' ? activeRosterId : null,
                };

                const profileStr = JSON.stringify(profilePayload);
                if (lastSyncedRef.current.profile === profileStr && !slideChanged && !rostersChanged) {
                    // Nothing changed
                } else {
                    syncManager.updateProfile(user.id, { ...profilePayload, last_modified: Date.now() });
                    lastSyncedRef.current.profile = profileStr;
                    addDebugLog("Cloud sync successful", 'success');
                }

                setLastSyncError(null);
            } catch (e: any) {
                console.error("Cloud Sync Failure:", e);
                setLastSyncError(e.message || "Cloud sync failed");
            } finally {
                setIsSyncing(false);
                setTimeout(() => { savingRef.current = false; }, 500); // Shorter lock
            }
        };

        syncToCloud();
    }, [user, widgets, allRosters, activeRosterId, showGrid, clockStyle, accentColor, dockOrder, background, slideBackgrounds, customBackgrounds, scheduleTemplate, scheduleOverrides, scheduleSettings, cloudSyncEnabled, currentSlideIndex, isCheckingPro]);

    // Load Data from Cloud (with Local-First timestamp comparison)
    useEffect(() => {
        const loadCloudData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            try {
                // Helper to get local timestamp
                const getLocalTime = (key: string) => {
                    const raw = localStorage.getItem(key);
                    if (!raw) return 0;
                    try {
                        const parsed = JSON.parse(raw);
                        return parsed?.last_modified || 0;
                    } catch { return 0; }
                };

                // 1. Load Profile
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (profile) {
                    const cloudTime = profile.last_modified || 0;
                    // We check profile fields individually or as a block depending on how specific we want to be.
                    // For now, if the cloud profile is older than ANY local piece, we might want to skip some.
                    // Let's do a general profile check first.
                    const localProfileTime = Math.max(
                        getLocalTime('homeroom_background'),
                        getLocalTime('homeroom_dock_order'),
                        getLocalTime('homeroom_schedule_template'),
                        getLocalTime('homeroom_schedule_settings')
                    );

                    if (cloudTime >= localProfileTime) {
                        if (profile.background) setBackground(profile.background);
                        if (profile.slide_backgrounds) setSlideBackgrounds(profile.slide_backgrounds);
                        if (profile.clock_style) setClockStyle(profile.clock_style);
                        if (profile.accent_color) setAccentColor(profile.accent_color);
                        if (profile.grid_enabled !== undefined) setShowGrid(profile.grid_enabled);
                        if (profile.dock_order && (profile.dock_order.main?.length > 0 || profile.dock_order.drawer?.length > 0)) {
                            setDockOrder(profile.dock_order);
                        }

                        if (profile.schedule) {
                            const { _settings, ...template } = profile.schedule;
                            setScheduleTemplate(template);
                            if (_settings) setScheduleSettings(_settings);
                            else if (profile.schedule_settings) setScheduleSettings(profile.schedule_settings);
                        }
                        if (profile.schedule_overrides) setScheduleOverrides(profile.schedule_overrides);
                        if (!profile.schedule?._settings && profile.schedule_settings) {
                            setScheduleSettings(profile.schedule_settings);
                        }
                    } else {
                        console.log('Sync: Local profile is newer than cloud, skipping overwrite.');
                        addDebugLog("Local profile is newer than cloud. Keeping local.");
                    }
                }

                // 2. Load Slides (Widgets)
                const rawSlides = await dataService.getSlides(user.id);
                const slides = (rawSlides || []).map(s => ({ ...s, widgets: syncManager.decompressPayload(s.widgets) }));
                if (slides && Array.isArray(slides)) {
                    const slide = slides.find(s => s.slide_index === currentSlideIndex);
                    if (slide) {
                        const cloudTime = slide.last_modified || 0;
                        const localTime = getLocalTime(`homeroom_mirror_slide_${user.id}_${currentSlideIndex}`); // SyncManager's mirror also has timestamps now

                        if (cloudTime >= localTime) {
                            if (Array.isArray(slide.widgets)) {
                                setWidgets(slide.widgets);
                            }
                        } else {
                            console.log(`Sync: Local slide ${currentSlideIndex} is newer than cloud.`);
                            addDebugLog(`Local slide ${currentSlideIndex} is newer. Keeping local.`);
                        }
                    } else {
                        setWidgets([]);
                    }
                }

                // 3. Load Rosters
                const rawRosters = await dataService.getRosters(user.id);
                const cloudRosters = (rawRosters || []).map(r => ({ ...r, roster: syncManager.decompressPayload(r.roster) }));

                // For rosters, we merge but prioritize newest
                const localRostersWrapper = JSON.parse(localStorage.getItem('homeroom_all_rosters') || '{}');
                const localRosters = localRostersWrapper.rosters || [];
                const localRostersTime = localRostersWrapper.last_modified || 0;

                let mergedRosters = allRosters;
                if (cloudRosters && Array.isArray(cloudRosters)) {
                    const uniqueMap = new Map();
                    // Merge logic: If cloud is newer overall, prefer it. Otherwise, look at individual rosters.
                    cloudRosters.forEach((r: any) => uniqueMap.set(r.id, r));

                    allRosters.forEach(r => {
                        const cloudMatch = cloudRosters.find(cr => cr.id === r.id);
                        if (cloudMatch) {
                            const cloudTime = cloudMatch.last_modified || 0;
                            const localTime = r.last_modified || 0;
                            if (localTime > cloudTime) {
                                uniqueMap.set(r.id, r); // Local wins for this specific roster
                            }
                        } else {
                            // If it has a UUID but isn't in cloud, it's from another account. Strip it!
                            const isUUID = r.id && r.id !== 'default' && /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(String(r.id));
                            const sanitizedRoster = isUUID ? { ...r, id: 'default' } : r;
                            uniqueMap.set(sanitizedRoster.id === 'default' ? `temp-${Date.now()}-${Math.random()}` : sanitizedRoster.id, sanitizedRoster);
                        }
                    });

                    mergedRosters = Array.from(uniqueMap.values()).map(r => {
                        if (typeof r.id === 'string' && r.id.startsWith('temp-')) return { ...r, id: 'default' };
                        return r;
                    });
                    setAllRosters(mergedRosters);
                }

                // Update lastSyncedRef to match what we just loaded or kept
                const profilePayload = {
                    grid_enabled: profile?.grid_enabled ?? false,
                    clock_style: profile?.clock_style ?? '12h',
                    accent_color: profile?.accent_color ?? 'indigo',
                    dock_order: profile?.dock_order ?? dockOrder,
                    background: profile?.background ?? BACKGROUNDS[0],
                    slide_backgrounds: profile?.slide_backgrounds ?? {},
                    my_backgrounds: profile?.my_backgrounds ?? [],
                    schedule: profile?.schedule ?? { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] },
                    schedule_overrides: profile?.schedule_overrides ?? {},
                    active_roster_id: profile?.active_roster_id ?? null,
                };
                lastSyncedRef.current.profile = JSON.stringify(profilePayload);

                if (slides && Array.isArray(slides)) {
                    // Populate allSlides state
                    const sortedSlides = [...slides].sort((a, b) => a.slide_index - b.slide_index);
                    const slidesArray = sortedSlides.map(s => s.widgets || []);
                    setAllSlides(slidesArray);

                    slides.forEach((s: any) => {
                        if (s.slide_index !== undefined) {
                            lastSyncedRef.current.slides[s.slide_index] = JSON.stringify(s.widgets || []);

                            // Reconcile current slide widgets immediately
                            if (s.slide_index === currentSlideIndex) {
                                const cloudTime = s.last_modified || 0;
                                const localTime = getLocalTime(`homeroom_mirror_slide_${user.id}_${currentSlideIndex}`);

                                // If cloud is newer OR we have no widgets locally, trust cloud
                                if (cloudTime >= localTime || widgets.length === 0) {
                                    if (Array.isArray(s.widgets)) {
                                        setWidgets(s.widgets);
                                    }
                                }
                            }
                        }
                    });
                }
            } catch (e) {
                console.error("Error loading cloud data", e);
            } finally {
                cloudLoaded.current = true;
            }
        };

        if (!isCheckingPro) loadCloudData();
    }, [isCheckingPro, currentSlideIndex]);

    const handleHardRefresh = () => {
        if (!confirm("This will clear local cache and re-sync from the cloud. Continue?")) return;
        addDebugLog("Starting hard refresh...", 'info');
        localStorage.clear();
        // Keep essential auth if any (though usually handled by redirect)
        window.location.reload();
    };

    // Redundant Widget Sync removed - consolidated into effect above

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
                    // Only sync if it's the current slide
                    if (payload.new?.slide_index === currentSlideIndex) {
                        const newWidgets = payload.new?.widgets;
                        if (Array.isArray(newWidgets)) {
                            addDebugLog("Realtime: Widgets updated from cloud", 'success');
                            cloudLoaded.current = true;
                            lastSyncedRef.current.slides[currentSlideIndex] = JSON.stringify(newWidgets);
                            setWidgets(newWidgets);
                        }
                    }
                }
            )
            .subscribe((status) => {
                setChannelStatus(prev => ({ ...prev, slides: status === 'SUBSCRIBED' ? 'connected' : 'error' }));
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, currentSlideIndex]);

    // Realtime Profile Sync (Background, Schedule, Dock, etc.)
    useEffect(() => {
        if (!user) return;

        const profileChannel = supabase
            .channel('profile-realtime')
            .on(
                'postgres_changes' as any,
                { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
                (payload: any) => {
                    if (savingRef.current) return;
                    const p = payload.new;
                    if (!p) return;

                    // Update lastSyncedRef to avoid ping-pong
                    const { last_modified, id, updated_at, ...rest } = p;
                    lastSyncedRef.current.profile = JSON.stringify(rest);

                    // Apply layout/theme updates
                    if (p.background) setBackground(p.background);
                    if (p.slide_backgrounds) setSlideBackgrounds(p.slide_backgrounds);
                    if (p.clock_style) setClockStyle(p.clock_style);
                    if (p.accent_color) setAccentColor(p.accent_color);
                    if (p.grid_enabled !== undefined) setShowGrid(p.grid_enabled);
                    if (p.dock_order && (p.dock_order.main?.length > 0 || p.dock_order.drawer?.length > 0)) {
                        setDockOrder(p.dock_order);
                    }

                    // Apply schedule updates
                    if (p.schedule) {
                        const { _settings, ...template } = p.schedule;
                        setScheduleTemplate(template);
                        if (_settings) setScheduleSettings(_settings);
                        else if (p.schedule_settings) setScheduleSettings(p.schedule_settings);
                    }
                    if (p.schedule_overrides) setScheduleOverrides(p.schedule_overrides);

                    if (p.active_roster_id) setActiveRosterId(p.active_roster_id);

                    addDebugLog("Realtime: Profile updated from cloud", 'success');
                }
            )
            .subscribe((status) => {
                setChannelStatus(prev => ({ ...prev, profile: status === 'SUBSCRIBED' ? 'connected' : 'error' }));
            });

        return () => { supabase.removeChannel(profileChannel); };
    }, [user]);

    // Realtime Roster Sync
    useEffect(() => {
        if (!user) return;

        const rosterChannel = supabase
            .channel('roster-realtime')
            .on(
                'postgres_changes' as any,
                { event: '*', schema: 'public', table: 'rosters', filter: `user_id=eq.${user.id}` }, (payload: any) => {
                    if (savingRef.current) return;
                    const updatedRoster = payload.new as any;
                    if (updatedRoster) {
                        lastSyncedRef.current.rosters[updatedRoster.id] = JSON.stringify(updatedRoster);
                        setAllRosters(prev => {
                            const existingIdx = prev.findIndex(r => r.name === updatedRoster.name || r.id === updatedRoster.id);
                            if (existingIdx !== -1) {
                                const next = [...prev];
                                next[existingIdx] = { ...next[existingIdx], roster: updatedRoster.roster, id: updatedRoster.id };
                                // If name changed, we might want to know, but id shouldn't change here typically
                                return next;
                            } else {
                                return [...prev, { id: updatedRoster.id, name: updatedRoster.name, roster: updatedRoster.roster, slides: [[]] }];
                            }
                        });
                        addDebugLog("Realtime: Rosters updated from cloud", 'success');
                    }
                }
            )
            .subscribe((status) => {
                setChannelStatus(prev => ({ ...prev, rosters: status === 'SUBSCRIBED' ? 'connected' : 'error' }));
            });

        return () => { supabase.removeChannel(rosterChannel); };
    }, [user, activeRosterId]);

    // Onboarding
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Onboarding trigger improved
    useEffect(() => {
        if (isCheckingPro || isSyncing || !cloudLoaded.current) return;

        // Only show onboarding if NO data AND NO widgets
        const hasData = allRosters.length > 0 && allRosters.some(r => r.roster && r.roster.length > 0);
        const hasWidgets = allSlides.some(s => s && s.length > 0);
        
        if (!hasData && !hasWidgets && !localStorage.getItem('homeroom_onboarded')) {
            setShowOnboarding(true);
        } else {
            setShowOnboarding(false);
        }
    }, [isCheckingPro, isSyncing, allRosters, allSlides]);

    // Safety Net: Force Roster Sync if mismatch detected
    useEffect(() => {
        if (cloudLoaded.current && activeRosterId) {
            const r = allRosters.find(rr => rr.id === activeRosterId);
            if (r && r.roster?.length !== roster.length) {
                console.log("Safety Net: Roster mismatch detected. Syncing view.");
                setRoster(Array.isArray(r.roster) ? r.roster : []);
            }
        }
    }, [activeRosterId, allRosters]);

    // Persist Effects (with timestamps for local-first sync)
    useEffect(() => {
        if (!cloudLoaded.current) return;
        localStorage.setItem('homeroom_background', JSON.stringify({ ...background, last_modified: Date.now() }));
    }, [background]);

    useEffect(() => {
        if (!cloudLoaded.current) return;
        localStorage.setItem('homeroom_dock_order', JSON.stringify({ items: dockOrder, last_modified: Date.now() }));
    }, [dockOrder]);

    useEffect(() => {
        if (!cloudLoaded.current) return;
        localStorage.setItem('homeroom_all_rosters', JSON.stringify({ rosters: allRosters, last_modified: Date.now() }));
    }, [allRosters]);

    useEffect(() => {
        if (!cloudLoaded.current) return;
        localStorage.setItem('homeroom_slide_backgrounds', JSON.stringify({ backgrounds: slideBackgrounds, last_modified: Date.now() }));
    }, [slideBackgrounds]);

    useEffect(() => {
        if (!cloudLoaded.current) return;
        localStorage.setItem('homeroom_schedule_template', JSON.stringify({ template: scheduleTemplate, last_modified: Date.now() }));
    }, [scheduleTemplate]);

    useEffect(() => {
        if (!cloudLoaded.current) return;
        localStorage.setItem('homeroom_schedule_overrides', JSON.stringify({ overrides: scheduleOverrides, last_modified: Date.now() }));
    }, [scheduleOverrides]);

    useEffect(() => {
        if (!cloudLoaded.current) return;
        localStorage.setItem('homeroom_all_slides', JSON.stringify({ slides: allSlides, last_modified: Date.now() }));
    }, [allSlides]);

    useEffect(() => {
        if (!cloudLoaded.current) return;
        localStorage.setItem('homeroom_schedule_settings', JSON.stringify({ settings: scheduleSettings, last_modified: Date.now() }));
    }, [scheduleSettings]);

    useEffect(() => {
        if (!cloudLoaded.current) return;
        localStorage.setItem('homeroom_accent_color', accentColor);
    }, [accentColor]);

    useEffect(() => {
        if (!cloudLoaded.current) return;
        localStorage.setItem('homeroom_grid', String(showGrid));
    }, [showGrid]);

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

    // Load Slide Widgets when Index Changes
    useEffect(() => {
        if (!cloudLoaded.current) return;
        const currentSlide = allSlides[currentSlideIndex] || [];
        setWidgets(currentSlide);
        widgetsSlideIndexRef.current = currentSlideIndex;
    }, [currentSlideIndex]);

    // Sync current slide widgets back to allSlides
    useEffect(() => {
        // Only sync if widgets are for the current index
        if (widgetsSlideIndexRef.current !== currentSlideIndex) return;

        setAllSlides(prev => {
            const next = [...prev];
            if (next[currentSlideIndex] !== widgets) {
                next[currentSlideIndex] = widgets;
                return next;
            }
            return prev;
        });
    }, [widgets, currentSlideIndex]);

    const handleAddSlide = async () => {
        if (allSlides.length >= SLIDE_LIMIT) {
            alert(`Pro Plan Limit: Max of ${SLIDE_LIMIT} slides.`);
            return;
        }
        const newIndex = allSlides.length;
        const newAllSlides = [...allSlides, []];
        setAllSlides(newAllSlides);

        // Immediate sync call for the new slide container
        if (user) {
            syncManager.saveSlide(user.id, newIndex, []);
            addDebugLog(`Created new slide ${newIndex + 1}`, 'info');
        }

        setCurrentSlideIndex(newIndex);
        setShowSlideManager(false);
    };

    const handleReorderSlides = async (from: number, to: number) => {
        const newSlides = [...allSlides];
        const [moved] = newSlides.splice(from, 1);
        newSlides.splice(to, 0, moved);
        setAllSlides(newSlides);

        // Reorder backgrounds
        const finalBgs: any = {};
        const bgArray = Array.from({ length: allSlides.length }).map((_, i) => slideBackgrounds[i]);
        const [movedBgItem] = bgArray.splice(from, 1);
        bgArray.splice(to, 0, movedBgItem);
        bgArray.forEach((bg, i) => { if (bg) finalBgs[i] = bg; });
        setSlideBackgrounds(finalBgs);

        // Persist all affected slides to cloud
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const start = Math.min(from, to);
            const end = Math.max(from, to);
            for (let i = start; i <= end; i++) {
                syncManager.saveSlide(user.id, i, newSlides[i]);
            }
            syncManager.updateProfile(user.id, { slide_backgrounds: finalBgs });
        }

        // Update current index if it was moved
        if (currentSlideIndex === from) {
            setCurrentSlideIndex(to);
        } else if (from < currentSlideIndex && to >= currentSlideIndex) {
            setCurrentSlideIndex(prev => prev - 1);
        } else if (from > currentSlideIndex && to <= currentSlideIndex) {
            setCurrentSlideIndex(prev => prev + 1);
        }
    };

    const addWidget = (type, extraData = {}) => {
        if (isDockMinimized) return;
        const id = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7);
        const size = WIDGET_SIZES[type] || { width: 400, height: 300 };

        // Center logic (use latest available window metrics)
        let x = Math.max(0, window.innerWidth / 2 - size.width / 2 + (Math.random() * 40 - 20));
        let y = Math.max(0, window.innerHeight / 2 - size.height / 2 + (Math.random() * 40 - 20));

        // Refined positioning for specific widgets
        if (type === 'RANDOMIZER' || type === 'GROUP_MAKER') {
            x = Math.round((window.innerWidth - size.width) / 2);
            y = Math.round((window.innerHeight - size.height) / 2 - 50);
        } else {
            if (type === 'SEAT_PICKER') { y = 30; x += 60; }
            if (type === 'QR') { y = 20; x = (window.innerWidth / 2) - (size.width / 2); }
            if (type === 'DRAWING') y -= 80;
            if (type === 'CALCULATOR') y -= 60;
            if (type === 'COUNTDOWN') y -= 50;
            if (type === 'SPARK') y -= 40;
            if (type === 'WEBCAM') {
                y = (window.innerHeight / 2) - (size.height / 2) - 100;
                x = (window.innerWidth / 2) - (size.width / 2);
            }
        }

        let data: any = { fontSize: 16 };
        if (type === 'TIMER') data = { ...data, timeLeft: 120, isRunning: false, mode: 'visual', fontSize: 14 };
        if (type === 'CLOCK') data = { ...data, style: 'standard', isGlassy: 'clear', fontSize: 20 };
        if (type === 'RANDOMIZER') data = { ...data, students: [], currentName: null, isAnimating: false, fontSize: 16 };
        if (type === 'GROUP_MAKER') data = { ...data, groupCount: 4, groups: [] };
        if (type === 'TEXT') data = { ...data, mode: 'text', content: '', items: [], fontSize: 12 };
        if (type === 'OVERLAY_TEXT') data = { ...data, fontSize: 32, fontScale: 3, hasShadow: true, isGlassy: 'clear' };
        if (type === 'WHITEBOARD' || type === 'DRAWING') data = { ...data, color: '#000000', brushSize: 5, tool: 'pen' };
        if (type === 'MARBLE_JAR') data = { ...data, title: 'Classroom Goal', count: 0, goal: 50, theme: 'classic', jarColor: 'standard' };
        if (type === 'SPARK') data = { ...data, topic: '', type: 'HOOK', result: null };
        if (type === 'WEATHER') data = { ...data, city: 'London' };
        if (type === 'SORT') data = { ...data, categories: [], items: [] };
        if (type === 'CALENDAR' || type === 'SCHEDULE') data = { ...data, isGlassy: 'clear' };
        if (type === 'EMBED' || type === 'YOUTUBE') data = { ...data, youtubeUrl: '' };
        if (type === 'CALCULATOR') data = { ...data, fontSize: 16 };

        data = { ...data, ...extraData };

        setWidgets(prev => {
            const existingCount = prev.filter(w => w.type === type).length;
            const title = existingCount > 0 ? `${DOCK_LABELS[type]?.label || type} ${existingCount + 1}` : undefined;
            if (title) data.title = title;
            const newWidget = { id, type, x, y, width: size.width, height: size.height, data, zIndex: maxZ + 1 };
            return [...prev, newWidget];
        });

        bringToFront(id);
    };

    const toggleMinimize = useCallback((id, e = null) => {
        const widget = widgets.find(w => w.id === id);
        if (!widget) return;

        let targetRect = null;
        // ALWAYS try to find the dock icon for this type first
        const dockIcon = document.querySelector(`[data-dock-type="${widget.type}"]`);

        if (dockIcon) {
            targetRect = dockIcon.getBoundingClientRect();
        } else {
            // Fallback to "More" button if icon is in closed drawer
            const moreButton = document.querySelector('[data-dock-more="true"]');
            if (moreButton) {
                targetRect = moreButton.getBoundingClientRect();
            } else if (e) {
                targetRect = e.currentTarget.getBoundingClientRect();
            }
        }

        if (targetRect) {
            const centerX = targetRect.left + targetRect.width / 2;
            const centerY = targetRect.top + targetRect.height / 2;
            const el = document.querySelector(`[data-widget-id="${id}"]`) as HTMLElement;
            if (el) {
                el.style.setProperty('--dock-x', `${centerX}px`);
                el.style.setProperty('--dock-y', `${centerY}px`);
            }
        }
        setWidgets(prev => prev.map(w => w.id === id ? { ...w, data: { ...w.data, isMinimized: !w.data?.isMinimized } } : w));
    }, [widgets]);

    const handleDockDragStart = (e, type) => {
        if (isLocked) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('text/plain', type);
    };

    const handleDockDrop = (e, targetType, location = 'main') => {
        e.preventDefault();
        if (isLocked) return;

        const sourceType = e.dataTransfer.getData('text/plain');
        if (!sourceType || sourceType === targetType) return;

        setDockOrder(prev => {
            const next = { ...prev };
            // Find where it came from
            const fromMain = prev.main.includes(sourceType);
            const fromDrawer = prev.drawer.includes(sourceType);

            // Remove from source arrays
            if (fromMain) next.main = prev.main.filter(t => t !== sourceType);
            if (fromDrawer) next.drawer = prev.drawer.filter(t => t !== sourceType);

            // Insert at target position
            if (location === 'main') {
                const targetIdx = next.main.indexOf(targetType);
                if (targetIdx === -1) {
                    next.main.push(sourceType);
                } else {
                    next.main.splice(targetIdx, 0, sourceType);
                }
            } else {
                const targetIdx = next.drawer.indexOf(targetType);
                if (targetIdx === -1) {
                    next.drawer.push(sourceType);
                } else {
                    next.drawer.splice(targetIdx, 0, sourceType);
                }
            }

            return next;
        });
    };

    const handleDockClick = (id, location = 'main', e = null) => {
        if (isDockMinimized) return;

        if (dockClickLockRef.current) return;
        dockClickLockRef.current = true;
        setTimeout(() => { dockClickLockRef.current = false; }, 300);

        // Shift click always adds a new instance
        if (e && e.shiftKey) {
            if (e.preventDefault) e.preventDefault();
            if (e.stopPropagation) e.stopPropagation();
            addWidget(id);
            if (location === 'drawer') setShowMoreDrawer(false);
            return;
        }

        const activeWidgets = widgets.filter(w => w.type === id);

        if (activeWidgets.length > 0) {
            // Find the most recently used (highest Z)
            const sorted = [...activeWidgets].sort((a, b) => (zIndices[b.id] || 0) - (zIndices[a.id] || 0));
            const topMost = sorted[0];

            if (topMost.data?.isMinimized) {
                toggleMinimize(topMost.id, e);
                bringToFront(topMost.id);
            } else {
                // If it's already focused (maxZ), minimize it. Otherwise bring to front.
                if (zIndices[topMost.id] === maxZ) {
                    toggleMinimize(topMost.id, e);
                } else {
                    bringToFront(topMost.id);
                }
            }
        } else {
            addWidget(id);
        }

        if (location === 'drawer') setShowMoreDrawer(false);
    };

    const removeWidget = (id) => {
        setClosingWidgetId(id);
        setTimeout(() => {
            setWidgets(widgets.filter(w => w.id !== id));
            setClosingWidgetId(null);
        }, 300);
    };

    const updateWidgetData = (id, newData) => {
        setWidgets(prev => prev.map(w => w.id === id ? { ...w, data: typeof newData === 'function' ? newData(w.data) : { ...w.data, ...newData } } : w));
    };

    const updateWidgetLayout = (id, layout) => {
        setWidgets(widgets.map(w => w.id === id ? { ...w, ...layout } : w));
    };

    const bringToFront = (id) => {
        setFocusedId(id);
        setMaxZ(prev => {
            const nextZ = prev + 1;
            setZIndices(prevIndices => ({ ...prevIndices, [id]: nextZ }));
            // Also store in widget data for persistence and previews
            setWidgets(ws => ws.map(w => w.id === id ? { ...w, zIndex: nextZ } : w));
            return nextZ;
        });
    };

    const nextSlide = () => {
        if (currentSlideIndex < allSlides.length - 1) {
            setCurrentSlideIndex(prev => prev + 1);
        } else {
            // Add new slide
            addToHistory();
            const newSlides = [...allSlides, []];
            setAllSlides(newSlides);
            setCurrentSlideIndex(newSlides.length - 1);
        }
    };

    const prevSlide = () => {
        setCurrentSlideIndex(prev => Math.max(0, prev - 1));
    };

    const duplicateCurrentSlide = () => {
        addToHistory();
        const newSlide = JSON.parse(JSON.stringify(widgets)).map(w => ({ ...w, id: Date.now().toString() + Math.random().toString(36).substr(2, 5) }));
        const newSlides = [...allSlides];
        const newIndex = currentSlideIndex + 1;
        newSlides.splice(newIndex, 0, newSlide);
        setAllSlides(newSlides);

        setSlideBackgrounds(prev => {
            const next = { ...prev };
            Object.keys(next).map(Number).sort((a, b) => b - a).forEach(k => {
                if (k > currentSlideIndex) {
                    next[k + 1] = next[k];
                    delete next[k];
                }
            });
            if (prev[currentSlideIndex]) {
                next[newIndex] = prev[currentSlideIndex];
            }
            return next;
        });

        setCurrentSlideIndex(newIndex);
    };

    const deleteCurrentSlide = () => {
        if (allSlides.length <= 1) return;
        if (!window.confirm("Delete this page and all its tools?")) return;
        addToHistory();
        const newSlides = allSlides.filter((_, i) => i !== currentSlideIndex);
        setAllSlides(newSlides);
        setSlideBackgrounds(prev => {
            const next = { ...prev };
            delete next[currentSlideIndex];
            Object.keys(next).map(Number).sort((a, b) => a - b).forEach(k => {
                if (k > currentSlideIndex) {
                    next[k - 1] = next[k];
                    delete next[k];
                }
            });
            return next;
        });
        setCurrentSlideIndex(prev => Math.max(0, prev - 1));
    };


    const updateRoster = (newRoster) => setRoster(newRoster);
    const handleUpdateRoster = (newRoster: Student[], targetRosterId?: string) => {
        const targetId = targetRosterId || activeRosterId;
        setAllRosters(prev => prev.map(r => r.id === targetId ? { ...r, roster: newRoster } : r));
        if (targetId === activeRosterId) {
            setRoster(newRoster);
        }
    };

    // Background Styles
    const activeBg = slideBackgrounds[currentSlideIndex] || background;
    const bgStyle = activeBg.type === 'image'
        ? { backgroundImage: `url(${activeBg.src})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : (activeBg.type === 'custom' ? { backgroundImage: `url(${activeBg.src})`, backgroundSize: 'cover' } : {});

    const setTextColor = (color) => {
        setBackground(prev => ({ ...prev, textColor: color }));
    };

    const onDeleteBackground = (id) => {
        const newCustoms = customBackgrounds.filter(b => b.id !== id);
        setCustomBackgrounds(newCustoms);
        localStorage.setItem('homeroom_custom_backgrounds', JSON.stringify(newCustoms));
        if (background.id === id) setBackground(BACKGROUNDS[0]);
    };

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
        <div 
            className={`w-screen h-screen overflow-hidden relative ${activeBg.type === 'image' || activeBg.type === 'custom' ? '' : (activeBg.preview || '')}`} 
            style={bgStyle}
            onPointerDown={(e) => {
                // If we clicked the background directly (not a widget or dock), defocus all
                if (e.target === e.currentTarget) {
                    setFocusedId(null);
                }
            }}
        >
            {activeBg.id === 'default' && <OriginalBackground />}

            {/* Backup Reminder Toast */}
            {showBackupReminder && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] animate-in slide-in-from-top duration-500">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3 max-w-lg">
                        <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-bold text-amber-900">
                                {backupDaysOverdue > 30 ? "It's been a while" : `It's been ${backupDaysOverdue} day${backupDaysOverdue !== 1 ? 's' : ''}`} since your last backup.
                            </p>
                            <p className="text-xs text-amber-700 mt-0.5">Export your data from Settings → Account to keep it safe.</p>
                        </div>
                        <button onClick={() => setShowBackupReminder(false)} className="p-1 hover:bg-amber-100 rounded-lg text-amber-500 transition-colors">
                            <XIcon size={14} />
                        </button>
                    </div>
                </div>
            )}


            {/* Spotlight Overlay */}
            <div 
                className={`fixed inset-0 bg-slate-950/80 backdrop-blur-[3px] transition-opacity duration-1000 ease-in-out pointer-events-none ${widgets?.some(w => w.data?.isSpotlighted) ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}
                style={{ zIndex: 19000 }}
            />

            {/* Widgets Layer */}
            {widgets?.map(w => (
                <DraggableResizable
                    key={w.id}
                    id={w.id}
                    data-widget-id={w.id}
                    title={w.data?.title || DOCK_LABELS[w.type]?.label || w.type}
                    icon={DOCK_LABELS[w.type]?.icon}
                    position={{ x: w.x, y: w.y }}
                    size={{ width: w.width, height: w.height }}
                    zIndex={w.data?.isSpotlighted ? 20000 + (zIndices[w.id] || 0) : (zIndices[w.id] || 10)}
                    onUpdate={updateWidgetLayout}
                    onFocus={() => bringToFront(w.id)}
                    onRemove={removeWidget}
                    minWidth={200} minHeight={150}
                    onMinimizeToggle={toggleMinimize}
                    onSpotlight={(id) => {
                        const widget = widgets.find(x => x.id === id);
                        updateWidgetData(id, { isSpotlighted: !widget?.data?.isSpotlighted });
                    }}
                    onToggleGlass={() => updateWidgetData(w.id, { isGlassy: w.data?.isGlassy === 'glass' ? 'solid' : (w.data?.isGlassy === 'solid' ? 'clear' : 'glass') })}
                    onSettings={() => setShowSettings(true)}
                    widgetType={w.type}
                    locked={isLocked || w.data?.locked}
                    closingWidgetId={closingWidgetId}
                    chromeless={['WEATHER'].includes(w.type)}
                    isSelected={focusedId === w.id}
                    {...w.data} // Pass minimized/transparent etc.
                    accentColor={accentColor}
                    showGrid={showGrid}
                >
                    {(() => {
                        const extraProps = {
                            accentColor,
                            theme: THEME_COLORS[accentColor] || THEME_COLORS.indigo,
                            textColor: background?.textColor || 'text-slate-800',
                            sparkGrade,
                            setSparkGrade: (g: string) => { setSparkGrade(g); localStorage.setItem('homeroom_spark_grade', g); },
                            studentName,
                            setStudentName,
                            geminiApiKey: localStorage.getItem('homeroom_gemini_api_key') || '',
                            setGeminiApiKey: (k: string) => localStorage.setItem('homeroom_gemini_api_key', k)
                        };
                        const props = { 
                            widget: w, 
                            updateData: (arg1: any, arg2?: any) => {
                                if (arg2 !== undefined) updateWidgetData(arg1, arg2);
                                else updateWidgetData(w.id, arg1);
                            },
                            updateSize: (sz: any) => updateWidgetLayout(w.id, sz), 
                            roster, 
                            onUpdateRoster: handleUpdateRoster, 
                            onSelectRoster: (id: string) => setActiveRosterId(id), 
                            allRosters, 
                            activeRosterId, 
                            extraProps, 
                            accentColor,
                            user 
                        };
                        switch (w.type) {
                            case 'SPARK': return <SparkWidget {...props} />;
                            case 'SORT': return <SortWidget {...props} />;
                            case 'SOUNDBOARD': return <SoundboardWidget {...props} />;
                            case 'TIMER': return <TimerWidget {...props} />;
                            case 'DICE': return <DiceWidget {...props} />;
                            case 'SEAT_PICKER': return <SeatPickerWidget {...props} />;
                            case 'GROUP_MAKER': return <GroupMakerWidget {...props} />;
                            case 'TEXT': return <TextWidget {...props} />;
                            case 'TRAFFIC': return <TrafficLightWidget {...props} />;
                            case 'VOTE': return <VoteWidget {...props} />;
                            case 'DRAWING':
                            case 'WHITEBOARD': return <DrawingWidget {...props} />;
                            case 'SCHEDULE': return <ScheduleWidget {...props}
                                scheduleTemplate={scheduleTemplate} setScheduleTemplate={setScheduleTemplate}
                                scheduleOverrides={scheduleOverrides} setScheduleOverrides={setScheduleOverrides}
                                scheduleSettings={scheduleSettings} setScheduleSettings={setScheduleSettings}
                                onOpenSettings={() => setShowSettings(true)} />;
                            case 'QR': return <QRCodeWidget {...props} />;
                            case 'CLOCK': 
                                return (
                                    <div className="flex h-full items-center justify-center p-8 overflow-hidden">
                                        <ClockDisplay 
                                            style={w.data?.style || 'standard'} 
                                            showDate={w.data?.showDate !== undefined ? w.data.showDate : showClockDate}
                                            textColor={extraProps.textColor}
                                            onSettingsClick={() => setShowSettings(true)}
                                        />
                                    </div>
                                );
                            case 'YOUTUBE': // Legacy support
                            case 'EMBED': return <EmbedWidget {...props} />;
                            case 'CALCULATOR': return <CalculatorWidget {...props} />;
                            case 'GAMES': return <GamesWidget {...props} />;
                            case 'MARBLE_JAR': return <MarbleJarWidget {...props} />;
                            case 'WEATHER': return <WeatherWidget {...props} />;
                            case 'COUNTDOWN': return <CountdownWidget {...props} />;
                            case 'POLYPAD': return <PolypadWidget {...props} />;
                            case 'OVERLAY_TEXT': return <SimpleTextWidget {...props} />;
                            case 'CALENDAR': return <CalendarWidget {...props} textColor={extraProps.textColor} />;
                            case 'RANDOMIZER': return <RandomizerWidget {...props} />;
                            case 'WEBCAM':
                                return (
                                    <div className="h-full bg-black flex flex-col items-center justify-center relative overflow-hidden rounded-2xl">
                                        {!w.data?.streamActive ? (
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
                                        {w.data?.streamActive && (
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
                            default: return <div className="p-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center h-full">Unknown Widget: {w.type}</div>;
                        }
                    })()}
                </DraggableResizable>
            ))}

            {/* Removed Top Bar Slide Switcher for Parity */}

            {/* Dock */}
            <div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[10000] flex flex-col items-center justify-end pointer-events-none transition-opacity duration-500"
            >
                <div className={`transition-all duration-300 ease-in-out origin-bottom pointer-events-auto ${isDockMinimized ? 'translate-y-12 opacity-0 scale-50 pointer-events-none invisible' : 'translate-y-0 opacity-100 scale-100 visible'}`}>
                    <div
                        className="backdrop-blur-3xl shadow-2xl rounded-[1.5rem] flex items-center p-1 gap-0.5 transition-all duration-300 hover:scale-[1.01] ring-1 ring-white/30 relative bg-white/20 backdrop-saturate-150"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        {dockOrder?.main?.map((type: string) => {
                            const activeInstances = (widgets || []).filter(w => w.type === type);
                            const isActive = activeInstances.length > 0;
                            const isMinimizedStatus = activeInstances.some(w => w.isMinimized);
                            const labelData = DOCK_LABELS[type] || { label: type, icon: <LayoutGrid size={24} /> };

                            return (
                                <button
                                    key={type}
                                    data-dock-type={type}
                                    onClick={(e) => handleDockClick(type, 'main', e)}
                                    draggable={!isDockMinimized && !isLocked}
                                    onDragStart={(e) => handleDockDragStart(e, type)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => handleDockDrop(e, type, 'main')}
                                    className={`p-1.5 rounded-[1rem] transition-all relative group flex flex-col items-center gap-0.5 z-10 hover:bg-white/30 ${background?.textColor || 'text-slate-800'} ${!isLocked ? 'animate-wobble ring-2 ring-white/50 bg-white/10 shadow-lg' : ''}`}
                                    title={labelData.label}
                                >
                                    <div className={`w-9 h-9 flex items-center justify-center transition-all duration-300 dock-icon-wrapper group-hover:-translate-y-1 rounded-xl ${isMinimizedStatus ? (accentColor === 'rose' ? 'bg-rose-100/50 text-rose-600' : accentColor === 'blue' ? 'bg-blue-100/50 text-blue-600' : accentColor === 'purple' ? 'bg-purple-100/50 text-purple-600' : accentColor === 'emerald' ? 'bg-emerald-100/50 text-emerald-600' : accentColor === 'amber' ? 'bg-amber-100/50 text-amber-600' : 'bg-indigo-100/50 text-indigo-600') + ' shadow-inner' : (background?.textColor === 'text-white' ? 'bg-white/10' : 'bg-slate-800/5')}`}>
                                        {labelData.icon}
                                        {activeInstances.length > 1 && (
                                            <div className={`absolute -top-1 -right-1 ${accentColor === 'rose' ? 'bg-rose-600' : accentColor === 'blue' ? 'bg-blue-600' : accentColor === 'purple' ? 'bg-purple-600' : accentColor === 'emerald' ? 'bg-emerald-600' : accentColor === 'amber' ? 'bg-amber-600' : 'bg-indigo-600'} text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-lg border border-white/20`}>
                                                {activeInstances.length}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 absolute -bottom-5 bg-slate-900 text-white px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap pointer-events-none transition-all transform translate-y-2 group-hover:translate-y-0">
                                        {labelData.label}
                                    </span>
                                    {isActive && (
                                        <div className={`mt-0.5 w-[2px] h-[2px] rounded-full transition-all ${isMinimizedStatus ? (accentColor === 'rose' ? 'bg-rose-500' : accentColor === 'blue' ? 'bg-blue-500' : accentColor === 'purple' ? 'bg-purple-500' : accentColor === 'emerald' ? 'bg-emerald-500' : accentColor === 'amber' ? 'bg-amber-500' : 'bg-indigo-500') : (background?.textColor === 'text-white' ? 'bg-white/80' : 'bg-slate-400')}`} />
                                    )}

                                    {/* Reflection */}
                                    <div className="absolute top-full left-0 right-0 flex flex-col items-center pointer-events-none -mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="w-9 h-9 flex items-center justify-center dock-reflection scale-y-[-1] blur-[1px] opacity-20">
                                            {labelData.icon}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}

                        <div className="w-px h-8 bg-slate-400/40 mx-2" />

                        {/* More Drawer Button */}
                        <div className="relative" ref={drawerRef}>
                            <button
                                onClick={() => setShowMoreDrawer(!showMoreDrawer)}
                                data-dock-more="true"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDockDrop(e, 'LAST', 'drawer')}
                                className={`p-1.5 rounded-[1rem] transition-all relative group flex flex-col items-center gap-0.5 z-10 hover:bg-white/30 ${background.textColor || 'text-slate-800'}`}
                                title="More Tools"
                            >
                                <div className="w-9 h-9 flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 rounded-xl bg-slate-800/5">
                                    <div className={`relative w-6 h-6 flex items-center justify-center transition-all duration-500 ${showMoreDrawer ? 'rotate-90 animate-wobble' : 'rotate-0'}`}>
                                        <div className={`flex gap-1.5 transition-all duration-500 flex-row`}>
                                            {[0, 1, 2].map((i) => (
                                                <div 
                                                    key={i} 
                                                    className={`w-1.5 h-1.5 rounded-full bg-current shadow-sm transition-all duration-500 ${showMoreDrawer ? 'scale-110' : 'group-hover:animate-bounce'}`}
                                                    style={{ transitionDelay: `${i * 100}ms` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 absolute -bottom-5 bg-slate-900 text-white px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap pointer-events-none transition-all transform translate-y-2 group-hover:translate-y-0">
                                    More
                                </span>
                            </button>

                            {showMoreDrawer && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-3 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 grid grid-cols-3 gap-2 min-w-[280px] z-50 animate-in slide-in-from-bottom-2 duration-200">
                                    {dockOrder?.drawer?.map((type: string) => {
                                        const activeInstances = (widgets || []).filter(w => w.type === type);
                                        const isActive = activeInstances.length > 0;
                                        const isMinimizedStatus = activeInstances.some(w => w.isMinimized);
                                        const labelData = DOCK_LABELS[type] || { label: type, icon: <LayoutGrid size={24} /> };

                                        return (
                                            <button
                                                key={type}
                                                data-dock-type={type}
                                                draggable={!isLocked}
                                                onDragStart={(e) => handleDockDragStart(e, type)}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => handleDockDrop(e, type, 'drawer')}
                                                onClick={(e) => handleDockClick(type, 'drawer', e)}
                                                className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 relative text-slate-600 ${!isLocked ? 'animate-wobble ring-2 ring-indigo-500/30 shadow-lg' : ''} ${accentColor === 'rose' ? 'hover:bg-rose-50 hover:text-rose-600' : accentColor === 'blue' ? 'hover:bg-blue-50 hover:text-blue-600' : accentColor === 'purple' ? 'hover:bg-purple-50 hover:text-purple-600' : accentColor === 'emerald' ? 'hover:bg-emerald-50 hover:text-emerald-600' : accentColor === 'amber' ? 'hover:bg-amber-50 hover:text-amber-600' : 'hover:bg-indigo-50 hover:text-indigo-600'}`}
                                            >
                                                <div className="relative">
                                                    {labelData.icon}
                                                </div>
                                                <span className="text-[10px] font-bold">{labelData.label}</span>
                                                {activeInstances.length > 1 && (
                                                    <div className={`absolute -top-1 -right-1 ${accentColor === 'rose' ? 'bg-rose-600' : accentColor === 'blue' ? 'bg-blue-600' : accentColor === 'purple' ? 'bg-purple-600' : accentColor === 'emerald' ? 'bg-emerald-600' : accentColor === 'amber' ? 'bg-amber-600' : 'bg-indigo-600'} text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-lg border border-white/20`}>
                                                        {activeInstances.length}
                                                    </div>
                                                )}
                                                {isActive && (
                                                    <div className={`mt-0.5 w-[4px] h-[4px] rounded-full transition-all ${isMinimizedStatus ? (accentColor === 'rose' ? 'bg-rose-500' : accentColor === 'blue' ? 'bg-blue-500' : accentColor === 'purple' ? 'bg-purple-500' : accentColor === 'emerald' ? 'bg-emerald-500' : accentColor === 'amber' ? 'bg-amber-500' : 'bg-indigo-500') : 'bg-slate-400'}`} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="w-px h-6 bg-slate-400/40 mx-2" />

                        <button
                            onClick={() => setIsLocked(!isLocked)}
                            className={`p-1.5 rounded-[1rem] transition-all relative group flex flex-col items-center gap-0.5 z-10 hover:bg-white/30 ${isLocked ? (accentColor === 'rose' ? 'text-rose-600' : accentColor === 'blue' ? 'text-blue-600' : accentColor === 'purple' ? 'text-purple-600' : accentColor === 'emerald' ? 'text-emerald-600' : accentColor === 'amber' ? 'text-amber-600' : 'text-indigo-600') + ' font-bold' : (background.textColor === 'text-white' ? 'text-white' : 'text-slate-800')}`}
                            title={isLocked ? "Unlock Widgets" : "Lock Widgets"}
                        >
                            <div className={`w-9 h-9 flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 rounded-xl ${isLocked ? (accentColor === 'rose' ? 'bg-rose-100/50' : accentColor === 'blue' ? 'bg-blue-100/50' : accentColor === 'purple' ? 'bg-purple-100/50' : accentColor === 'emerald' ? 'bg-emerald-100/50' : accentColor === 'amber' ? 'bg-amber-100/50' : 'bg-indigo-100/50') : 'bg-slate-800/5'}`}>
                                {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 absolute -bottom-5 bg-slate-900 text-white px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap pointer-events-none transition-all transform translate-y-2 group-hover:translate-y-0">
                                {isLocked ? 'Locked' : 'Unlocked'}
                            </span>
                        </button>


                    </div>
                </div>

                <div className="pointer-events-auto transition-all duration-300 z-50 mt-1">
                    <button
                        onClick={() => setIsDockMinimized(!isDockMinimized)}
                        className="bg-white/90 backdrop-blur-md hover:bg-white text-slate-500 hover:text-blue-600 p-1.5 rounded-full shadow-lg border border-white/50 transition-all active:scale-95"
                    >
                        {isDockMinimized ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                    </button>
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


            {/* Top Right - Settings Gear */}
            <button
                onClick={() => setShowSettings(true)}
                className={`absolute top-10 right-12 z-50 p-4 rounded-full transition-all duration-500 hover:rotate-90 active:scale-95 group shadow-lg backdrop-blur-md border border-white/20 hover:shadow-2xl ${activeBg.textColor || 'text-slate-800'} ${activeBg.textColor === 'text-white' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-800/5 hover:bg-slate-800/10'}`}
                title="Settings"
            >
                <Settings size={28} className="drop-shadow-sm" />
            </button>


            {/* Bottom Right - Page & Undo Controls */}
            <div className={`absolute bottom-8 right-10 z-[60] flex items-center pointer-events-none transition-opacity duration-500`}>
                <div className="flex items-center gap-2 p-1 px-2.5 bg-white/20 backdrop-blur-3xl backdrop-saturate-150 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-white/40 pointer-events-auto group/cluster hover:bg-white/30 transition-all">
                    
                    {/* Undo Control */}
                    <button
                        onClick={handleUndo}
                        disabled={history.length === 0}
                        className={`p-2 rounded-xl transition-all duration-200 active:scale-90 group/btn
                        ${history.length === 0 ? 'opacity-20 grayscale cursor-not-allowed' : (accentColor === 'rose' ? 'hover:bg-rose-50 text-rose-600' : accentColor === 'blue' ? 'hover:bg-blue-50 text-blue-600' : accentColor === 'purple' ? 'hover:bg-purple-50 text-purple-600' : accentColor === 'emerald' ? 'hover:bg-emerald-50 text-emerald-600' : accentColor === 'amber' ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-indigo-50 text-indigo-600')}`}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo2 size={18} className="group-hover/btn:-rotate-45 transition-transform" />
                    </button>


                    <div className="w-px h-6 bg-slate-200/50 mx-1" />

                    {/* Page Navigation */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={prevSlide}
                            disabled={currentSlideIndex === 0}
                            className={`p-2 rounded-xl transition-all ${currentSlideIndex === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-600'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        
                        <div className="flex flex-col items-center min-w-[2.5rem]">
                            <span className="text-xs font-black text-slate-800 leading-none">
                                {currentSlideIndex + 1}<span className="text-slate-300 font-bold mx-0.5">/</span>{allSlides.length}
                            </span>
                        </div>

                        <button
                            onClick={nextSlide}
                            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-all font-bold"
                        >
                            {currentSlideIndex === allSlides.length - 1 ? <Plus size={20} className={accentColor === 'rose' ? 'text-rose-600' : accentColor === 'blue' ? 'text-blue-600' : accentColor === 'purple' ? 'text-purple-600' : accentColor === 'emerald' ? 'text-emerald-600' : accentColor === 'amber' ? 'text-amber-600' : 'text-indigo-600'} /> : <ChevronRight size={20} />}
                        </button>
                    </div>

                    <div className="w-px h-6 bg-slate-200/50 mx-1" />

                    {/* Pro Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={duplicateCurrentSlide}
                            className={`p-2 text-slate-400 ${accentColor === 'rose' ? 'hover:text-rose-600 hover:bg-rose-50' : accentColor === 'blue' ? 'hover:text-blue-600 hover:bg-blue-50' : accentColor === 'purple' ? 'hover:text-purple-600 hover:bg-purple-50' : accentColor === 'emerald' ? 'hover:text-emerald-600 hover:bg-emerald-50' : accentColor === 'amber' ? 'hover:text-amber-600 hover:bg-amber-50' : 'hover:text-indigo-600 hover:bg-indigo-50'} rounded-xl transition-all group/dup`}
                            title="Duplicate Page"
                        >
                            <Copy size={16} className="group-hover/dup:scale-110 transition-transform" />
                        </button>

                        <button
                            onClick={deleteCurrentSlide}
                            disabled={allSlides.length <= 1}
                            className={`p-2 rounded-xl transition-all ${allSlides.length <= 1 ? 'opacity-20 cursor-not-allowed' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                            title="Delete Page"
                        >
                            <Trash2 size={16} />
                        </button>

                    </div>

                    <div className="w-px h-6 bg-slate-200/50 mx-1" />

                    {/* Slide Manager Trigger */}
                    <button
                        onClick={() => setShowSlideManager(true)}
                        className={`p-2 ${accentColor === 'rose' ? 'bg-rose-600 shadow-rose-200 hover:bg-rose-700' : accentColor === 'blue' ? 'bg-blue-600 shadow-blue-200 hover:bg-blue-700' : accentColor === 'purple' ? 'bg-purple-600 shadow-purple-200 hover:bg-purple-700' : accentColor === 'emerald' ? 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700' : accentColor === 'amber' ? 'bg-amber-600 shadow-amber-200 hover:bg-amber-700' : 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700'} text-white rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center min-w-[3rem]`}
                        title="View All Pages"
                    >
                        <LayoutGrid size={18} />
                    </button>

                </div>
            </div>


            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                user={user}
                onSignOut={handleSignOut}
                onSignIn={() => window.location.href = 'https://ourhomeroom.app/signin'}
                isSyncing={isSyncing}
                syncStats={syncStats}
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
                    if (customBackgrounds.length >= BG_LIMIT) {
                        alert(`Background Limit: You have reached the max of ${BG_LIMIT} custom uploads. Please delete some before adding more.`);
                        return;
                    }
                    const newBg = { id: Date.now().toString(), name: 'Custom', type: 'custom', src, textColor: 'text-white' };
                    setCustomBackgrounds([...customBackgrounds, newBg]);
                    setBackground(newBg);
                    localStorage.setItem('homeroom_custom_backgrounds', JSON.stringify([...customBackgrounds, newBg]));
                }}
                onDeleteBackground={onDeleteBackground}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
                allRosters={allRosters}
                setAllRosters={setAllRosters}
                activeRosterId={activeRosterId}
                setActiveRosterId={setActiveRosterId}
                activeScheduleDays={scheduleTemplate}
                saveScheduleTemplate={setScheduleTemplate}
                widgets={widgets}
                setWidgets={setWidgets}
                textColor={background.textColor}
                setTextColor={setTextColor}
                debugLog={debugLog}
                channelStatus={channelStatus}
                onHardRefresh={handleHardRefresh}
                // Pro States
                showClockDate={showClockDate}
                setShowClockDate={setShowClockDate}
                is24Hour={is24Hour}
                setIs24Hour={setIs24Hour}
                isGlassy={isGlassy}
                setIsGlassy={setIsGlassy}
                accentColor={accentColor}
                setAccentColor={setAccentColor}
                scheduleSettings={scheduleSettings}
                setScheduleSettings={setScheduleSettings}
            />
        </div>
    );
};

export default App;

