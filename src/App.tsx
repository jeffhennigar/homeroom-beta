import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Timer, Shuffle, Users, Armchair, Type, Camera, Dices, BarChart2,
    Edit3, Calendar, Youtube, Share2, Palette, Settings, Plus, RotateCw,
    Info, Calculator, Clock, Volume2, Ruler, ChevronLeft, ChevronRight, Unlock, Lock, MoreHorizontal, ChevronDown
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
import ScheduleWidget from './components/widgets/ScheduleWidget';
import QRCodeWidget from './components/widgets/QRCodeWidget';
import YouTubeWidget from './components/widgets/YouTubeWidget';
import CalculatorWidget from './components/widgets/CalculatorWidget';
import CountdownWidget from './components/widgets/CountdownWidget';
import SoundboardWidget from './components/widgets/SoundboardWidget';
import PolypadWidget from './components/widgets/PolypadWidget';
import CalendarWidget from './components/widgets/CalendarWidget';
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
    COUNTDOWN: { label: 'Countdown', icon: <Clock /> },
    SOUNDBOARD: { label: 'Sounds', icon: <Volume2 /> },
    POLYPAD: { label: 'Polypad', icon: <Ruler /> },
    CALENDAR: { label: 'Calendar', icon: <Calendar /> }
};

const DEFAULT_NAMES = ["Student 1", "Student 2", "Student 3", "Student 4", "Student 5"];

const INIT_DOCK_ORDER = ['TIMER', 'RANDOMIZER', 'GROUP_MAKER', 'SEAT_PICKER', 'SCHEDULE', 'TEXT', 'TRAFFIC', 'QR', 'WEBCAM', 'DICE', 'VOTE', 'WHITEBOARD', 'YOUTUBE', 'CALCULATOR', 'COUNTDOWN', 'SOUNDBOARD', 'POLYPAD'];

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
    COUNTDOWN: { width: 280, height: 280 },
    SOUNDBOARD: { width: 440, height: 500 },
    POLYPAD: { width: 800, height: 600 },
    CALENDAR: { width: 340, height: 320 }
};

const THEME_COLORS: Record<string, any> = {
    indigo: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
    blue: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
    emerald: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 500: '#10b981', 600: '#059669', 700: '#047857' },
    teal: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e' },
    orange: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 500: '#f97316', 600: '#ea580c', 700: '#c2410c' },
    red: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
    pink: { 50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 500: '#ec4899', 600: '#db2777', 700: '#be185d' },
    purple: { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce' },
    amber: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
    slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 500: '#64748b', 600: '#475569', 700: '#334155' }
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

    // Schedule Global State
    const [scheduleTemplate, setScheduleTemplate] = useState(() => {
        try { return JSON.parse(localStorage.getItem('homeroom_schedule_template')) || { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] }; }
        catch { return { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] }; }
    });
    const [scheduleOverrides, setScheduleOverrides] = useState(() => {
        try { return JSON.parse(localStorage.getItem('homeroom_schedule_overrides')) || {}; }
        catch { return {}; }
    });
    const [scheduleSettings, setScheduleSettings] = useState(() => {
        try { return JSON.parse(localStorage.getItem('homeroom_schedule_settings')) || { scheduleMode: 'weekly', dayLabels: [] }; }
        catch { return { scheduleMode: 'weekly', dayLabels: [] }; }
    });

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

    const [slideBackgrounds, setSlideBackgrounds] = useState(() => {
        try { return JSON.parse(localStorage.getItem('homeroom_slide_backgrounds')) || {}; }
        catch { return {}; }
    });

    const [dockOrder, setDockOrder] = useState<any>(() => {
        try {
            const parsed = JSON.parse(localStorage.getItem('homeroom_dock_order'));
            const mainDefaults = ['TIMER', 'RANDOMIZER', 'GROUP_MAKER', 'SEAT_PICKER', 'SCHEDULE', 'TEXT'];
            const drawerDefaults = INIT_DOCK_ORDER.filter(id => !mainDefaults.includes(id));

            if (parsed && parsed.main && parsed.drawer) {
                // Remove non-existent types
                const cleanedMain = parsed.main.filter((t: string) => DOCK_LABELS[t]);
                const cleanedDrawer = parsed.drawer.filter((t: string) => DOCK_LABELS[t]);
                const currentIds = [...cleanedMain, ...cleanedDrawer];
                const missing = INIT_DOCK_ORDER.filter(t => !currentIds.includes(t));
                return { main: cleanedMain, drawer: [...cleanedDrawer, ...missing] };
            }

            if (Array.isArray(parsed)) {
                const cleaned = parsed.filter(t => DOCK_LABELS[t]);
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
                main: ['TIMER', 'RANDOMIZER', 'GROUP_MAKER', 'SEAT_PICKER', 'SCHEDULE', 'TEXT'],
                drawer: ['TRAFFIC', 'QR', 'WEBCAM', 'DICE', 'VOTE', 'WHITEBOARD', 'YOUTUBE', 'CALCULATOR', 'COUNTDOWN', 'SOUNDBOARD', 'POLYPAD']
            };
        }
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
    const [accentColor, setAccentColor] = useState(() => localStorage.getItem('homeroom_accent_color') || 'indigo');
    const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
    const [lastSyncError, setLastSyncError] = useState<string | null>(null);

    const [showMoreDrawer, setShowMoreDrawer] = useState(false);
    const drawerRef = useRef<HTMLDivElement>(null);

    // Diagnostics State
    const [debugLog, setDebugLog] = useState<{ id: string, msg: string, time: string, type: 'info' | 'error' | 'success' }[]>([]);
    const [channelStatus, setChannelStatus] = useState<Record<string, 'connected' | 'disconnected' | 'error'>>({
        slides: 'disconnected',
        profile: 'disconnected',
        rosters: 'disconnected'
    });

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

    // --- CLOUD SYNC CONSOLIDATION ---
    const profileLastModified = useRef(0);

    useEffect(() => {
        if (isCheckingPro || !user || !cloudSyncEnabled || !cloudLoaded.current) return;

        const syncToCloud = async () => {
            if (savingRef.current) return;
            try {
                setIsSyncing(true);
                savingRef.current = true;
                addDebugLog("Syncing widgets...", 'info');

                // 1. Sync Current Slide
                await dataService.saveSlide(user.id, currentSlideIndex, widgets);

                // 2. Sync Rosters & Modernize IDs
                const currentRosters = [...allRosters];
                let rostersChanged = false;

                for (let i = 0; i < currentRosters.length; i++) {
                    const r = currentRosters[i];
                    if (r.id === 'default' && r.roster.length === 0) continue;

                    try {
                        const updated = await dataService.saveRoster(user.id, r);
                        if (updated && updated.id !== r.id) {
                            currentRosters[i] = { ...r, id: updated.id };
                            rostersChanged = true;
                            if (activeRosterId === r.id) {
                                setActiveRosterId(updated.id);
                            }
                        }
                    } catch (rosterErr) {
                        console.error('Roster sync error:', rosterErr);
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

                // 3. Sync Profile (consolidate backgrounds/dock/settings)
                const profilePayload: any = {
                    grid_enabled: showGrid,
                    clock_style: clockStyle,
                    accent_color: accentColor,
                    dock_order: dockOrder,
                    background: background,
                    slide_backgrounds: slideBackgrounds,
                    my_backgrounds: customBackgrounds,
                    // Consolidate schedule_settings into the schedule object to avoid missing column error
                    schedule: {
                        ...scheduleTemplate,
                        _settings: scheduleSettings
                    },
                    schedule_overrides: scheduleOverrides,
                    active_roster_id: activeRosterId !== 'default' ? activeRosterId : null,
                    last_modified: Date.now()
                };

                await dataService.updateProfile(user.id, profilePayload);

                setLastSyncError(null);
                addDebugLog("Cloud sync successful", 'success');
            } catch (e: any) {
                console.error("Cloud Sync Failure:", e);
                setLastSyncError(e.message || "Cloud sync failed");
                addDebugLog(`Sync Error: ${e.message}`, 'error');
            } finally {
                setIsSyncing(false);
                setTimeout(() => { savingRef.current = false; }, 1000);
            }
        };

        const timer = setTimeout(syncToCloud, 10000); // 10s Debounce
        return () => clearTimeout(timer);
    }, [user, widgets, allRosters, activeRosterId, showGrid, clockStyle, accentColor, dockOrder, background, slideBackgrounds, customBackgrounds, scheduleTemplate, scheduleOverrides, scheduleSettings, cloudSyncEnabled, currentSlideIndex, isCheckingPro]);

    // Load Data from Cloud
    useEffect(() => {
        const loadCloudData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            try {
                // 1. Load Profile
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (profile) {
                    if (profile.background) setBackground(profile.background);
                    if (profile.slide_backgrounds) setSlideBackgrounds(profile.slide_backgrounds);
                    if (profile.clock_style) setClockStyle(profile.clock_style);
                    if (profile.accent_color) setAccentColor(profile.accent_color);
                    if (profile.grid_enabled !== undefined) setShowGrid(profile.grid_enabled);
                    if (profile.dock_order) setDockOrder(profile.dock_order);

                    // Schedule Sync
                    if (profile.schedule) {
                        // Unpack settings if they were consolidated
                        const { _settings, ...template } = profile.schedule;
                        setScheduleTemplate(template);
                        if (_settings) setScheduleSettings(_settings);
                        else if (profile.schedule_settings) setScheduleSettings(profile.schedule_settings);
                    }
                    if (profile.schedule_overrides) setScheduleOverrides(profile.schedule_overrides);
                    // Fallback for legacy standalone column
                    if (!profile.schedule?._settings && profile.schedule_settings) {
                        setScheduleSettings(profile.schedule_settings);
                    }
                }

                // 2. Load Slides (Widgets) for current slide
                const slides = await dataService.getSlides(user.id);
                if (slides && Array.isArray(slides)) {
                    const slide = slides.find(s => s.slide_index === currentSlideIndex);
                    if (slide && Array.isArray(slide.widgets)) {
                        setWidgets(slide.widgets);
                    } else {
                        setWidgets([]);
                    }
                }

                // 3. Load Rosters & Smart Merge
                const cloudRosters = await dataService.getRosters(user.id);
                let mergedRosters = allRosters;

                if (cloudRosters && Array.isArray(cloudRosters)) {
                    const uniqueMap = new Map();
                    const cloudRosterIds = new Set(cloudRosters.map((r: any) => r.id));

                    // Cloud is source of truth
                    cloudRosters.forEach((r: any) => uniqueMap.set(r.id, r));

                    // Local rosters: keep only if they don't conflict, and strip zombie UUIDs
                    allRosters.forEach(r => {
                        // Check if this roster already exists in cloud (by ID or exact name)
                        const existsInCloud = cloudRosters.some(cr => cr.id === r.id || cr.name === r.name);

                        if (!existsInCloud) {
                            // If it has a UUID but isn't in cloud, it's from another account. Strip it!
                            const isUUID = r.id && r.id !== 'default' && /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(String(r.id));
                            const sanitizedRoster = isUUID ? { ...r, id: 'default' } : r;

                            if (!uniqueMap.has(sanitizedRoster.id) || sanitizedRoster.id === 'default') {
                                // For 'default' we might want to be careful, but saveRoster handles 'default' by stripping it.
                                uniqueMap.set(sanitizedRoster.id === 'default' ? `temp-${Date.now()}-${Math.random()}` : sanitizedRoster.id, sanitizedRoster);
                            }
                        }
                    });
                    mergedRosters = Array.from(uniqueMap.values()).map(r => {
                        if (typeof r.id === 'string' && r.id.startsWith('temp-')) return { ...r, id: 'default' };
                        return r;
                    });
                    setAllRosters(mergedRosters);
                }

                // Set Active Roster from profile or fallback
                const activeIdFromProfile = profile?.active_roster_id;
                if (activeIdFromProfile && mergedRosters.some(r => r.id === activeIdFromProfile)) {
                    setActiveRosterId(activeIdFromProfile);
                }
            } catch (e) {
                console.error("Error loading cloud data", e);
            }

            // Mark cloud as loaded AFTER data is fetched — this unblocks the save effect
            cloudLoaded.current = true;
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

                    // Apply layout/theme updates
                    if (p.background) setBackground(p.background);
                    if (p.slide_backgrounds) setSlideBackgrounds(p.slide_backgrounds);
                    if (p.clock_style) setClockStyle(p.clock_style);
                    if (p.accent_color) setAccentColor(p.accent_color);
                    if (p.grid_enabled !== undefined) setShowGrid(p.grid_enabled);
                    if (p.dock_order) setDockOrder(p.dock_order);

                    // Apply schedule updates
                    if (p.schedule) setScheduleTemplate(p.schedule);
                    if (p.schedule_overrides) setScheduleOverrides(p.schedule_overrides);
                    if (p.schedule_settings) setScheduleSettings(p.schedule_settings);

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
                { event: '*', schema: 'public', table: 'rosters', filter: `user_id=eq.${user.id}` },
                async () => {
                    if (savingRef.current) return;
                    try {
                        const cloudRosters = await dataService.getRosters(user.id);
                        if (cloudRosters) {
                            setAllRosters(cloudRosters);
                            // Refresh current active roster view if updated
                            const current = cloudRosters.find((r: any) => r.id === activeRosterId);
                            if (current) setRoster(current.roster || []);

                            addDebugLog("Realtime: Rosters updated from cloud", 'success');
                        }
                    } catch (e) { console.error("Realtime roster refresh failed", e); }
                }
            )
            .subscribe((status) => {
                setChannelStatus(prev => ({ ...prev, rosters: status === 'SUBSCRIBED' ? 'connected' : 'error' }));
            });

        return () => { supabase.removeChannel(rosterChannel); };
    }, [user, activeRosterId]);


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
    useEffect(() => { localStorage.setItem('homeroom_slide_backgrounds', JSON.stringify(slideBackgrounds)); }, [slideBackgrounds]);
    useEffect(() => { localStorage.setItem('homeroom_schedule_template', JSON.stringify(scheduleTemplate)); }, [scheduleTemplate]);
    useEffect(() => { localStorage.setItem('homeroom_schedule_overrides', JSON.stringify(scheduleOverrides)); }, [scheduleOverrides]);
    useEffect(() => { localStorage.setItem('homeroom_schedule_settings', JSON.stringify(scheduleSettings)); }, [scheduleSettings]);
    useEffect(() => { localStorage.setItem('homeroom_accent_color', accentColor); }, [accentColor]);
    useEffect(() => { localStorage.setItem('homeroom_grid', String(showGrid)); }, [showGrid]);
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
        <div className={`w-screen h-screen overflow-hidden relative ${activeBg.preview || ''}`} style={bgStyle}>

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
                    locked={isLocked || w.data?.locked}
                    {...w.data} // Pass minimized/transparent etc.
                >
                    {(() => {
                        const extraProps = {
                            accentColor,
                            theme: THEME_COLORS[accentColor] || THEME_COLORS.indigo,
                            textColor: background?.textColor || 'text-slate-800'
                        };
                        const props = { widget: w, updateData: (data) => updateWidgetData(w.id, data), updateSize: (sz) => updateWidgetLayout(w.id, sz), roster, onUpdateRoster: handleUpdateRoster, allRosters, activeRosterId, extraProps };
                        switch (w.type) {
                            case 'SOUNDBOARD': return <SoundboardWidget {...props} />;
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
                            case 'SCHEDULE': return <ScheduleWidget {...props}
                                scheduleTemplate={scheduleTemplate} setScheduleTemplate={setScheduleTemplate}
                                scheduleOverrides={scheduleOverrides} setScheduleOverrides={setScheduleOverrides}
                                scheduleSettings={scheduleSettings} setScheduleSettings={setScheduleSettings}
                                onOpenSettings={() => setShowSettings(true)} />;
                            case 'QR': return <QRCodeWidget {...props} />;
                            case 'YOUTUBE': return <YouTubeWidget {...props} />;
                            case 'CALCULATOR': return <CalculatorWidget {...props} />;
                            case 'COUNTDOWN': return <CountdownWidget {...props} />;
                            case 'POLYPAD': return <PolypadWidget {...props} />;
                            case 'CALENDAR': return <CalendarWidget {...props} textColor={extraProps.textColor} />;
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

            {/* Top Bar: Slide Switcher & Lock */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3">
                {/* Slide Switcher */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-1.5 flex items-center gap-1 ring-1 ring-black/5">
                    <button
                        onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentSlideIndex === 0}
                        className={`p-1.5 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent ${background.textColor === 'text-white' ? 'text-slate-800' : 'text-slate-500'}`}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div className="px-3 py-1 bg-indigo-50 rounded-lg border border-indigo-100">
                        <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">Dashboard {currentSlideIndex + 1}</span>
                    </div>
                    <button
                        onClick={() => {
                            if (currentSlideIndex < SLIDE_LIMIT - 1) {
                                setCurrentSlideIndex(prev => prev + 1);
                            } else {
                                alert(`Pro Plan Limit: You have reached the maximum of ${SLIDE_LIMIT} dashboards.`);
                            }
                        }}
                        className={`p-1.5 hover:bg-slate-100 rounded-xl transition-all ${background.textColor === 'text-white' ? 'text-slate-800' : 'text-slate-500'}`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Lock Toggle */}
                <button
                    onClick={() => setIsLocked(!isLocked)}
                    className={`h-11 px-4 rounded-2xl flex items-center gap-2 font-bold text-sm transition-all border shadow-lg ${isLocked ? 'bg-amber-100/90 text-amber-700 border-amber-200 backdrop-blur-sm' : `bg-white/80 backdrop-blur-xl border-white/40 hover:border-indigo-300 ${background.textColor === 'text-white' ? 'text-slate-800' : 'text-slate-600'}`}`}
                >
                    {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                    {isLocked ? 'Dashboard Locked' : 'Unlocked'}
                </button>
            </div>

            {/* Dock */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[10000]">
                <div className="backdrop-blur-2xl shadow-2xl rounded-2xl flex items-center p-2 gap-1 transition-all duration-300 hover:scale-[1.02] ring-1 ring-white/50 relative">
                    <div className="absolute inset-0 bg-white/10 rounded-2xl overflow-hidden -z-10 border border-white/20">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-white/5 pointer-events-none" />
                    </div>
                    {dockOrder.main.map((type: string) => (
                        <button
                            key={type}
                            onClick={() => addWidget(type)}
                            draggable={!isDockMinimized}
                            onDragStart={(e) => { e.currentTarget.classList.add('scale-105'); }}
                            onDragEnd={(e) => { e.currentTarget.classList.remove('scale-105'); }}
                            className={`p-3 rounded-xl transition-all relative group flex flex-col items-center gap-1 z-10 hover:bg-white/40 ${background.textColor || 'text-slate-800'}`}
                            title={DOCK_LABELS[type].label}
                        >
                            <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:-translate-y-1">{DOCK_LABELS[type].icon}</div>
                            <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 absolute -bottom-4 bg-gray-800 text-white px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none transition-opacity">
                                {DOCK_LABELS[type].label}
                            </span>
                        </button>
                    ))}

                    <div className="w-px h-8 bg-slate-400/40 mx-2" />

                    {/* More Drawer Button */}
                    <div className="relative" ref={drawerRef}>
                        <button
                            onClick={() => setShowMoreDrawer(!showMoreDrawer)}
                            className={`p-3 rounded-xl transition-all relative group flex flex-col items-center gap-1 z-10 hover:bg-white/40 ${background.textColor || 'text-slate-800'}`}
                            title="More Tools"
                        >
                            <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:-translate-y-1">
                                {showMoreDrawer ? <ChevronDown size={24} /> : <MoreHorizontal size={24} />}
                            </div>
                            <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 absolute -bottom-4 bg-gray-800 text-white px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none transition-opacity">
                                More
                            </span>
                        </button>

                        {showMoreDrawer && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-3 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 grid grid-cols-3 gap-2 min-w-[280px] z-50 animate-in slide-in-from-bottom-2 duration-200">
                                {dockOrder.drawer.map((type: string) => (
                                    <button
                                        key={type}
                                        onClick={() => { addWidget(type); setShowMoreDrawer(false); }}
                                        className="p-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all flex flex-col items-center gap-1"
                                    >
                                        <div>{DOCK_LABELS[type].icon}</div>
                                        <span className="text-[10px] font-bold">{DOCK_LABELS[type].label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-px h-8 bg-slate-400/40 mx-2" />

                    <div className="flex flex-col gap-1">
                        <button onClick={() => setShowSettings(true)} className={`p-2 rounded-lg hover:bg-white/40 ${background.textColor || 'text-slate-800'}`}><Settings size={20} /></button>
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
                activeScheduleDays={{}}
                saveScheduleTemplate={() => { }}
                widgets={widgets}
                setWidgets={setWidgets}
                textColor={background.textColor}
                setTextColor={setTextColor}
                debugLog={debugLog}
                channelStatus={channelStatus}
                onHardRefresh={handleHardRefresh}
            />
        </div>
    );
};

export default App;
