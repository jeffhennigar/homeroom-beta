import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Timer, Shuffle, Users, Type, Armchair,
  Camera, Dices, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Plus, Settings, Youtube,
  Lock, Unlock, GripVertical, Undo2, ArrowRightSquare, Trash2, AlertTriangle, X,
  Calendar as CalendarIcon, StickyNote
} from 'lucide-react';
import DraggableResizable from './components/DraggableResizable';
import TimerWidget from './components/widgets/TimerWidget';
import RandomizerWidget from './components/widgets/RandomizerWidget';
import GroupMakerWidget from './components/widgets/GroupMakerWidget';
import SeatPickerWidget from './components/widgets/SeatPickerWidget';
import TextWidget from './components/widgets/TextWidget';
import WebcamWidget from './components/widgets/WebcamWidget';
import DiceWidget from './components/widgets/DiceWidget';
import YouTubeWidget from './components/widgets/YouTubeWidget';
import TrafficLightWidget from './components/widgets/TrafficLightWidget';
import CalendarWidget from './components/widgets/CalendarWidget';
import ScheduleWidget from './components/widgets/ScheduleWidget';
import SimpleTextWidget from './components/widgets/SimpleTextWidget';
import VoteWidget from './components/widgets/VoteWidget';
import WhiteboardWidget from './components/widgets/WhiteboardWidget';
import QRCodeWidget from './components/widgets/QRCodeWidget';
import AiChatWidget from './components/widgets/AiChatWidget';
import TranslatorWidget from './components/widgets/TranslatorWidget';
import ClockWidget from './components/widgets/ClockWidget';
import ClockDisplay from './components/ClockDisplay';
import OnboardingModal from './components/OnboardingModal';
import SettingsModal from './components/settings/SettingsModal';
import { Widget, WidgetType, Position, Size, WidgetData, Student, ClockStyle } from './types';
import { WIDGET_SIZES, INIT_DOCK_ORDER, BACKGROUNDS } from './constants';
import { getInitialStudents } from './utils/studentUtils';
import { supabase } from './services/supabaseClient';
import { dataService } from './services/dataService';
import LoginModal from './components/auth/LoginModal';

const App: React.FC = () => {
  // --- STATE ---
  const [slides, setSlides] = useState<Widget[][]>(() => {
    try {
      const stored = localStorage.getItem('homeroom_slides');
      if (stored) return JSON.parse(stored);
    } catch (e) { console.error('Error loading slides:', e); }
    return [[]];
  });
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(10);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  const [isDockMinimized, setIsDockMinimized] = useState(false);
  /* Dock State */
  const [dockOrder, setDockOrder] = useState<string[]>(() => {
    try {
      const storedStr = localStorage.getItem('homeroom_dock_order');
      if (!storedStr) return INIT_DOCK_ORDER;
      const stored = JSON.parse(storedStr);
      // Ensure OVERLAY_TEXT is in storage migration
      const uniqueStored = Array.from(new Set(stored as string[]));
      const missing = INIT_DOCK_ORDER.filter(id => !uniqueStored.includes(id));
      if (!uniqueStored.includes('OVERLAY_TEXT')) {
        const textIdx = uniqueStored.indexOf('TEXT');
        if (textIdx > -1) uniqueStored.splice(textIdx + 1, 0, 'OVERLAY_TEXT');
        else uniqueStored.push('OVERLAY_TEXT');
      }
      return [...uniqueStored, ...missing.filter(m => m !== 'OVERLAY_TEXT')];
    } catch { return INIT_DOCK_ORDER; }
  });
  const [isDockLocked, setIsDockLocked] = useState(false);
  const [clockStyle, setClockStyle] = useState<ClockStyle>(() => {
    return (localStorage.getItem('homeroom_clock_style') as ClockStyle) || 'standard';
  });

  useEffect(() => {
    localStorage.setItem('homeroom_clock_style', clockStyle);
  }, [clockStyle]);

  // Spotlight
  const [spotlightID, setSpotlightID] = useState<string | null>(null);

  // Appearance & Settings
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isGridEnabled, setIsGridEnabled] = useState(() => { try { return JSON.parse(localStorage.getItem('homeroom_grid_enabled') || 'false'); } catch { return false; } });

  // Roster Management
  const [allRosters, setAllRosters] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('homeroom_all_rosters') || '[]'); } catch { return []; }
  });
  const [activeRosterId, setActiveRosterId] = useState(() => localStorage.getItem('homeroom_active_roster_id') || null);
  const [roster, setRoster] = useState<Student[]>([]);

  // Backgrounds
  const [background, setBackground] = useState(() => { try { return JSON.parse(localStorage.getItem('homeroom_background') || '') || BACKGROUNDS[0]; } catch { return BACKGROUNDS[0]; } });
  const [slideBackgrounds, setSlideBackgrounds] = useState(() => { try { return JSON.parse(localStorage.getItem('homeroom_slide_backgrounds') || '{}'); } catch { return {}; } });
  const [customBackgrounds, setCustomBackgrounds] = useState(() => { try { return JSON.parse(localStorage.getItem('homeroom_my_backgrounds') || '[]'); } catch { return []; } });

  // Schedule
  const [activeScheduleDays, setActiveScheduleDays] = useState(() => { try { return JSON.parse(localStorage.getItem('homeroom_schedule') || '{}'); } catch { return {}; } });

  // Undo/Redo
  const [history, setHistory] = useState<Widget[][][]>([]);
  const [redoStack, setRedoStack] = useState<Widget[][][]>([]);

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const widgets = slides[currentSlideIndex] || [];
  const currentBg = slideBackgrounds[currentSlideIndex] || background;

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => { localStorage.setItem('homeroom_grid_enabled', JSON.stringify(isGridEnabled)); }, [isGridEnabled]);
  useEffect(() => { localStorage.setItem('homeroom_dock_order', JSON.stringify(dockOrder)); }, [dockOrder]);
  useEffect(() => { localStorage.setItem('homeroom_background', JSON.stringify(background)); }, [background]);
  useEffect(() => { localStorage.setItem('homeroom_slide_backgrounds', JSON.stringify(slideBackgrounds)); }, [slideBackgrounds]);
  useEffect(() => { localStorage.setItem('homeroom_my_backgrounds', JSON.stringify(customBackgrounds)); }, [customBackgrounds]);
  useEffect(() => { localStorage.setItem('homeroom_schedule', JSON.stringify(activeScheduleDays)); }, [activeScheduleDays]);
  useEffect(() => { localStorage.setItem('homeroom_slides', JSON.stringify(slides)); }, [slides]);

  useEffect(() => {
    if (allRosters.length > 0) {
      localStorage.setItem('homeroom_all_rosters', JSON.stringify(allRosters));
    }
  }, [allRosters]);

  useEffect(() => {
    if (activeRosterId) {
      localStorage.setItem('homeroom_active_roster_id', activeRosterId);
      const active = allRosters.find(r => r.id === activeRosterId);
      if (active) setRoster(active.roster || []);
    } else if (allRosters.length > 0) {
      // Default to first if none active
      setActiveRosterId(allRosters[0].id);
      setRoster(allRosters[0].roster || []);
    } else {
      // No rosters at all? Check legacy storage or show onboarding
      const legacy = localStorage.getItem('homeroom_roster_v2'); // from older version
      if (legacy) {
        const r = JSON.parse(legacy);
        const newRoster = { id: 'default', name: 'My Class', roster: r, slides: [] };
        setAllRosters([newRoster]);
        setActiveRosterId('default');
        setRoster(r);
      } else if (!user) {
        setShowOnboarding(true);
      }
    }
  }, [activeRosterId, allRosters, user]);

  // Auth Sync
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch from Supabase on Login
  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      setIsSyncing(true);
      try {
        const profile = await dataService.getProfile(user.id);
        if (profile) {
          if (profile.dock_order) setDockOrder(profile.dock_order);
          if (profile.background) setBackground(profile.background);
          if (profile.slide_backgrounds) setSlideBackgrounds(profile.slide_backgrounds);
          if (profile.my_backgrounds) setCustomBackgrounds(profile.my_backgrounds);
          if (profile.schedule) setActiveScheduleDays(profile.schedule);
          if (profile.grid_enabled !== undefined) setIsGridEnabled(profile.grid_enabled);
          if (profile.clock_style) setClockStyle(profile.clock_style);
          if (profile.active_roster_id) setActiveRosterId(profile.active_roster_id);
        }

        const cloudSlides = await dataService.getSlides(user.id);
        if (cloudSlides && cloudSlides.length > 0) {
          const sortedSlides = cloudSlides.map(s => s.widgets);
          setSlides(sortedSlides);
        }

        const cloudRosters = await dataService.getRosters(user.id);
        if (cloudRosters && cloudRosters.length > 0) {
          setAllRosters(cloudRosters);
        }
      } catch (e) {
        console.error('Error loading cloud data:', e);
      } finally {
        setIsSyncing(false);
      }
    };

    loadUserData();
  }, [user]);

  // Sync to Supabase on Change (Debounced)
  useEffect(() => {
    if (!user || isSyncing) return;

    const timer = setTimeout(async () => {
      try {
        await dataService.updateProfile(user.id, {
          dock_order: dockOrder,
          background,
          slide_backgrounds: slideBackgrounds,
          my_backgrounds: customBackgrounds,
          schedule: activeScheduleDays,
          grid_enabled: isGridEnabled,
          clock_style: clockStyle,
          active_roster_id: activeRosterId
        });
      } catch (e) { console.error('Error syncing profile:', e); }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, dockOrder, background, slideBackgrounds, customBackgrounds, activeScheduleDays, isGridEnabled, clockStyle, activeRosterId, isSyncing]);

  useEffect(() => {
    if (!user || isSyncing) return;

    const timer = setTimeout(async () => {
      try {
        await dataService.saveSlide(user.id, currentSlideIndex, slides[currentSlideIndex]);
      } catch (e) { console.error('Error syncing slide:', e); }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, slides, currentSlideIndex, isSyncing]);

  // Sync Rosters to Supabase
  useEffect(() => {
    if (!user || isSyncing || allRosters.length === 0) return;

    const timer = setTimeout(async () => {
      try {
        // Find the active roster or sync all
        // For simplicity, we sync the active one or the most recently changed
        // Based on the dataService.saveRoster signature, it's one by one
        for (const r of allRosters) {
          await dataService.saveRoster(user.id, r);
        }
      } catch (e) { console.error('Error syncing rosters:', e); }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, allRosters, isSyncing]);

  useEffect(() => {
    // Timer
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
      setCurrentDate(new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }, 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  // --- ACTIONS ---
  const handleUpdateRoster = (newRoster: Student[]) => {
    setRoster(newRoster);
    if (activeRosterId) {
      setAllRosters(prev => prev.map(r => r.id === activeRosterId ? { ...r, roster: newRoster } : r));
    } else {
      // First roster creation
      const newId = 'default';
      setAllRosters([{ id: newId, name: 'My Class', roster: newRoster, slides: [] }]);
      setActiveRosterId(newId);
    }
  };

  const setWidgets = useCallback((updater: (prev: Widget[]) => Widget[]) => {
    setSlides(prevSlides => {
      const newSlides = [...prevSlides]; // shallow copy
      const oldWidgets = newSlides[currentSlideIndex];
      const newWidgets = updater(oldWidgets);

      // History Push
      if (oldWidgets !== newWidgets) {
        setHistory(h => [...h.slice(-19), prevSlides]);
        setRedoStack([]);
      }

      newSlides[currentSlideIndex] = newWidgets;
      return newSlides;
    });
  }, [currentSlideIndex]);

  // Special update for widgets that doesn't trigger history (e.g. Timer tick)?
  // For now generic one triggers history which might be spammy for timer. 
  // Ideally separate 'data' update from 'structural' update.
  // But for simple widgets, we update frequently. 
  // index.html handles this by separating `updateData` to `setWidgets` but logic is similar. Note: `addToHistory` is manual in index.html for major actions.
  // Here we can use manual history.

  const addWidget = (type: WidgetType) => {
    setHistory(h => [...h.slice(-19), slides]);
    const id = Date.now().toString();
    const size = WIDGET_SIZES[type];
    const position = {
      x: (window.innerWidth / 2) - (size.width / 2) + (Math.random() * 40 - 20),
      y: (window.innerHeight / 2) - (size.height / 2) + (Math.random() * 40 - 20)
    };

    let data: WidgetData = { fontSize: 36 };
    if (type === 'TIMER') data = { ...data, durationMinutes: 2, timeLeft: 120, isRunning: false };
    if (type === 'RANDOMIZER') data = { ...data, currentName: null, isAnimating: false };
    if (type === 'GROUP_MAKER') data = { ...data, groupCount: 4, groups: [] };
    if (type === 'SEAT_PICKER') {
      const existingSeatPicker = (slides[currentSlideIndex] || []).find(w => w.type === 'SEAT_PICKER');
      if (existingSeatPicker) {
        // Copy data from existing SeatPicker, but reset groups and editing state
        data = { ...existingSeatPicker.data, groups: [], isEditing: false };
      } else {
        // Initial data for a new SeatPicker - seed with some default desks if roster has students
        const initialStudents = roster.length > 0 ? roster : getInitialStudents();
        const initialDesks = initialStudents.slice(0, 8).map((s, i) => ({
          id: `desk-${i}`,
          x: 50 + (i % 4) * 150,
          y: 50 + Math.floor(i / 4) * 120,
          student: s.name,
          color: 'blue',
          type: 'student',
          rotation: 0
        }));
        data = { ...data, groups: [], desks: initialDesks, isEditing: false };
      }
    }
    if (type === 'CLOCK') data = { ...data, style: 'standard' };
    if (type === 'TEXT') data = { ...data, mode: 'text', content: '', items: [] };
    if (type === 'OVERLAY_TEXT') data = { ...data, content: '' };
    if (type === 'WEBCAM') data = { ...data, isMirrored: true, isActive: true };
    if (type === 'DICE') data = { ...data, sides: 6, diceCount: 1, results: [1], isRolling: false };
    if (type === 'YOUTUBE') data = { ...data, youtubeUrl: '' };
    if (type === 'TRAFFIC') data = { ...data, activeLight: null, isListening: false, sensitivity: 50, threshold: 80, showSettings: false };
    if (type === 'CALENDAR') data = { ...data };
    if (type === 'SCHEDULE') data = { ...data, items: [] };
    if (type === 'VOTE') data = { ...data, question: 'Class Poll', options: [{ id: '1', text: 'Yes', count: 0 }, { id: '2', text: 'No', count: 0 }] };
    if (type === 'WHITEBOARD') data = { ...data, lines: [], textItems: [], emojiItems: [] };
    if (type === 'QR') data = { ...data, url: '' };
    if (type === 'AI_CHAT') data = { ...data, messages: [] };
    if (type === 'TRANSLATOR') data = { ...data, sourceText: '', translatedText: '', targetLanguage: 'Spanish' };

    const newWidget: Widget = { id, type, position, size, zIndex: maxZIndex + 1, data, isMinimized: false };

    setSlides(prev => {
      const newS = [...prev];
      newS[currentSlideIndex] = [...newS[currentSlideIndex], newWidget];
      return newS;
    });
    setMaxZIndex(prev => prev + 1);
    setSelectedId(id);
  };

  const removeWidget = (id: string) => {
    setHistory(h => [...h.slice(-19), slides]);
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const updateWidgetLayout = useCallback((id: string, newPos: Position, newSize: Size) => {
    setSlides(prev => {
      const newS = [...prev];
      newS[currentSlideIndex] = newS[currentSlideIndex].map(w => w.id === id ? { ...w, position: newPos, size: newSize } : w);
      return newS;
    });
  }, [currentSlideIndex]);

  const updateWidgetData = useCallback((id: string, updates: Partial<WidgetData>) => {
    setSlides(prev => {
      const newS = [...prev];
      newS[currentSlideIndex] = newS[currentSlideIndex].map(w => w.id === id ? { ...w, data: { ...w.data, ...updates } } : w);
      return newS;
    });
  }, [currentSlideIndex]);

  const bringToFront = (id: string) => {
    setSelectedId(id);
    setMaxZIndex(prev => prev + 1);
    setSlides(prev => {
      const newS = [...prev];
      newS[currentSlideIndex] = newS[currentSlideIndex].map(w => w.id === id ? { ...w, zIndex: maxZIndex + 1 } : w);
      return newS;
    });
  };

  const toggleMinimize = useCallback((id: string) => {
    setSlides(prev => {
      const newS = [...prev];
      newS[currentSlideIndex] = newS[currentSlideIndex].map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w);
      return newS;
    });
  }, [currentSlideIndex]);

  const nextSlide = () => {
    if (currentSlideIndex === slides.length - 1) setSlides(prev => [...prev, []]);
    setCurrentSlideIndex(prev => prev + 1);
    setSelectedId(null);
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) { setCurrentSlideIndex(prev => prev - 1); setSelectedId(null); }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setRedoStack(r => [...r, slides]);
    setSlides(prev);
    setHistory(h => h.slice(0, -1));
  };

  // Dock Logic
  const handleDockDrop = (e: React.DragEvent, targetIndex?: number) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('widgetType');
    if (!type || isDockLocked) return;
    const newOrder = [...dockOrder];
    const currentIndex = newOrder.indexOf(type);
    if (currentIndex > -1) {
      newOrder.splice(currentIndex, 1);
      if (targetIndex !== undefined) {
        if (currentIndex < targetIndex) targetIndex--;
        newOrder.splice(targetIndex, 0, type);
      }
      setDockOrder(newOrder);
    }
  };

  const DOCK_LABELS: Record<string, { label: string, icon: React.ReactNode, type: WidgetType }> = {
    'TIMER': { label: 'Timer', icon: <Timer />, type: 'TIMER' },
    'RANDOMIZER': { label: 'Random', icon: <Shuffle />, type: 'RANDOMIZER' },
    'GROUP_MAKER': { label: 'Groups', icon: <Users />, type: 'GROUP_MAKER' },
    'SEAT_PICKER': { label: 'Seats', icon: <Armchair />, type: 'SEAT_PICKER' },
    'TEXT': { label: 'Notes', icon: <StickyNote />, type: 'TEXT' },
    'OVERLAY_TEXT': { label: 'Text', icon: <Type />, type: 'OVERLAY_TEXT' },
    'TRAFFIC': { label: 'Noise', icon: <Settings />, type: 'TRAFFIC' },
    'WEBCAM': { label: 'Cam', icon: <Camera />, type: 'WEBCAM' },
    'DICE': { label: 'Dice', icon: <Dices />, type: 'DICE' },
    'YOUTUBE': { label: 'Video', icon: <Youtube />, type: 'YOUTUBE' },
    'CALENDAR': { label: 'Calendar', icon: <CalendarIcon />, type: 'CALENDAR' },
    'SCHEDULE': { label: 'Schedule', icon: <CalendarIcon />, type: 'SCHEDULE' },
    'VOTE': { label: 'Poll', icon: <Users />, type: 'VOTE' },
    'WHITEBOARD': { label: 'Draw', icon: <StickyNote />, type: 'WHITEBOARD' },
    'QR': { label: 'QR', icon: <Plus />, type: 'QR' },
    'AI_CHAT': { label: 'AI', icon: <Type />, type: 'AI_CHAT' },
    'TRANSLATOR': { label: 'Translate', icon: <Type />, type: 'TRANSLATOR' },
    'CLOCK': { label: 'Clock', icon: <Timer />, type: 'CLOCK' },
  };

  const renderDockItem = (id: string, index: number) => {
    const info = DOCK_LABELS[id];
    if (!info) return null;
    return (
      <div
        key={id}
        draggable={!isDockLocked}
        onDragStart={(e) => { e.dataTransfer.setData('widgetType', id); e.currentTarget.style.transform = "rotate(5deg) scale(1.1)"; }}
        onDragEnd={(e) => { e.currentTarget.style.transform = "none"; }}
        onDragOver={(e) => !isDockLocked && e.preventDefault()}
        onDrop={(e) => handleDockDrop(e, index)}
        className={`relative group transition-all duration-200 ${!isDockLocked ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
      >
        <ToolBtn icon={info.icon as React.ReactElement} label={info.label} onClick={() => addWidget(info.type)} />
        {!isDockLocked && <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"><GripVertical size={12} /></div>}
      </div>
    );
  };

  const renderWidgetContent = (widget: Widget) => {
    const props = { widget, updateData: updateWidgetData, roster, onUpdateRoster: handleUpdateRoster };
    switch (widget.type) {
      case 'TIMER': return <TimerWidget {...props} />;
      case 'RANDOMIZER': return <RandomizerWidget {...props} />;
      case 'GROUP_MAKER': return <GroupMakerWidget {...props} />;
      case 'SEAT_PICKER': return <SeatPickerWidget {...props} />;
      case 'TEXT': return <TextWidget {...props} />;
      case 'WEBCAM': return <WebcamWidget {...props} />;
      case 'DICE': return <DiceWidget {...props} />;
      case 'YOUTUBE': return <YouTubeWidget {...props} />;
      case 'TRAFFIC': return <TrafficLightWidget {...props} />;
      case 'CALENDAR': return <CalendarWidget {...props} />;
      case 'SCHEDULE': return <ScheduleWidget {...props} onOpenSettings={() => setShowSettingsModal(true)} />;
      case 'OVERLAY_TEXT': return <SimpleTextWidget {...props} />;
      case 'VOTE': return <VoteWidget {...props} />;
      case 'WHITEBOARD': return <WhiteboardWidget {...props} />;
      case 'QR': return <QRCodeWidget {...props} />;
      case 'AI_CHAT': return <AiChatWidget {...props} />;
      case 'TRANSLATOR': return <TranslatorWidget {...props} />;
      case 'CLOCK': return <ClockWidget {...props} extraProps={{ clockStyle, isGlassy: 'clear', showDate: true, textColor: currentBg.textColor }} />;
      default: return null;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{
      backgroundColor: '#dbeafe',
      backgroundImage: currentBg.id !== 'default' ? `url(${currentBg.src})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* Background Layer for Default */}
      {currentBg.id === 'default' && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg className="w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradOrange" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{ stopColor: "#fb923c", stopOpacity: 1 }} /><stop offset="100%" style={{ stopColor: "#ea580c", stopOpacity: 1 }} /></linearGradient>
              <linearGradient id="gradBlue" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 1 }} /><stop offset="100%" style={{ stopColor: "#60a5fa", stopOpacity: 1 }} /></linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="#dbeafe" />
            <path d="M1920 0V900C1400 900 1000 400 500 0H1920Z" fill="url(#gradOrange)" opacity="0.9" />
            <path d="M1920 0V700C1600 700 1300 300 900 0H1920Z" fill="#fed7aa" opacity="0.5" />
            <path d="M0 1080V300C500 300 900 800 1600 1080H0Z" fill="url(#gradBlue)" opacity="0.9" />
            <path d="M0 1080V500C300 500 700 900 1200 1080H0Z" fill="#93c5fd" opacity="0.5" />
          </svg>
        </div>
      )}
      {currentBg.id !== 'default' && <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />}

      {/* Cloud Status */}
      {user && (
        <div className="absolute bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-full border border-white/50 shadow-sm transition-all hover:bg-white">
          <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Synced as {user.email}</span>
        </div>
      )}

      {/* Modals */}
      {showOnboarding && <OnboardingModal onComplete={() => setShowOnboarding(false)} onSave={handleUpdateRoster} />}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        user={user}
        onSignOut={() => supabase.auth.signOut()}
        roster={roster}
        setRoster={handleUpdateRoster}
        backgrounds={BACKGROUNDS}
        currentBackground={background}
        setBackground={setBackground}
        onUploadBackground={(newBg: any) => setCustomBackgrounds(p => [newBg, ...p])} // Simplified
        onDeleteBackground={(id: string) => setCustomBackgrounds(p => p.filter(b => b.id !== id))}
        showGrid={isGridEnabled}
        setShowGrid={setIsGridEnabled}
        allRosters={allRosters}
        setAllRosters={setAllRosters}
        activeRosterId={activeRosterId}
        setActiveRosterId={setActiveRosterId}
        activeScheduleDays={activeScheduleDays}
        saveScheduleTemplate={setActiveScheduleDays}
        clockStyle={clockStyle}
        setClockStyle={setClockStyle}
      />

      {/* Top Bar */}
      <div className={`absolute top-10 left-12 z-10 select-none transition-colors duration-300 ${currentBg.textColor || 'text-slate-800'}`}>
        <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowSettingsModal(true)}>
          <div className="flex items-center gap-1.5 mb-1 opacity-60">
            <div className={`px-1.5 py-0.5 rounded text-[10px] font-black tracking-tighter shadow-md ${currentBg.textColor === 'text-white' ? 'bg-white text-slate-900' : 'bg-slate-800 text-white'}`}>HR</div>
            <div className="text-xs font-bold uppercase tracking-widest">HomeRoom</div>
          </div>
          <div className="text-8xl font-bold tracking-tight drop-shadow-sm">{currentTime}</div>
          <div className="text-3xl font-medium mt-2 opacity-80">{currentDate}</div>
        </div>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-8 right-8 z-50 flex gap-2">
        <button onClick={handleUndo} disabled={history.length === 0} className="p-3 bg-white/80 backdrop-blur-md hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-white/80 rounded-full shadow-lg border border-white/50 transition-all active:scale-95 group" title="Undo">
          <Undo2 size={24} className="group-hover:text-blue-600" />
        </button>
      </div>

      {/* Widgets */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {widgets.map(w => (
          <DraggableResizable
            key={w.id}
            id={w.id}
            position={w.position}
            size={w.size}
            zIndex={w.zIndex}
            isSelected={selectedId === w.id}
            isMinimized={w.isMinimized}
            isSpotlighted={spotlightID === w.id}
            isGridEnabled={isGridEnabled}
            widgetType={w.type}
            chromeless={w.type === 'OVERLAY_TEXT'}
            onSelect={bringToFront}
            onUpdate={updateWidgetLayout}
            onRemove={removeWidget}
            onFontSizeChange={(delta) => updateWidgetData(w.id, { fontSize: Math.max(8, (w.data.fontSize || 16) + delta) })}
            onMinimizeToggle={toggleMinimize}
            onSpotlightToggle={(id) => setSpotlightID(prev => prev === id ? null : id)}
          >
            {renderWidgetContent(w)}
          </DraggableResizable>
        ))}
      </div>

      {/* Slide Nav */}
      <div className="absolute bottom-6 right-8 z-50 flex items-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-0.5 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-1 border border-white/60 ring-1 ring-black/5">
          <button onClick={prevSlide} disabled={currentSlideIndex === 0} className="p-1.5 hover:bg-blue-50 rounded-xl text-gray-500 hover:text-blue-600 transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed group active:scale-95"><ChevronLeft size={20} /></button>
          <div className="px-2 flex items-center justify-center min-w-[35px]"><span className="text-[10px] font-bold uppercase text-gray-400 group-hover:text-blue-600 tracking-wide select-none">{currentSlideIndex + 1} / {slides.length}</span></div>
          <button onClick={nextSlide} className="p-1.5 hover:bg-blue-50 rounded-xl text-gray-500 hover:text-blue-600 transition-all duration-200 group active:scale-95 flex items-center justify-center">{currentSlideIndex === slides.length - 1 ? <Plus size={20} /> : <ChevronRight size={20} />}</button>
        </div>
      </div>

      {/* Dock */}
      <div className="absolute bottom-2 left-0 right-0 z-50 flex flex-col items-center justify-end pointer-events-none">
        <div className={`pointer-events-auto max-w-4xl mx-4 mb-1 transition-all duration-300 ease-in-out origin-bottom ${isDockMinimized ? 'translate-y-4 opacity-0 scale-95 pointer-events-none' : 'translate-y-0 opacity-100 scale-100'}`}>
          <div className="flex justify-between items-center bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-2 border border-white/60 overflow-x-auto ring-1 ring-black/5">
            <div className="flex items-center gap-1">
              {dockOrder.map((id, index) => renderDockItem(id, index))}
            </div>
            <div className="w-px h-10 bg-gray-300 mx-2"></div>
            <ToolBtn icon={<Settings />} label="Settings" onClick={() => setShowSettingsModal(true)} />
            <ToolBtn
              icon={user ? <Unlock className="text-green-600" /> : <Lock className="text-slate-400" />}
              label={user ? 'Logout' : 'Cloud'}
              onClick={() => user ? supabase.auth.signOut() : setShowLoginModal(true)}
            />
            <button onClick={() => setIsDockLocked(!isDockLocked)} className={`ml-2 p-2 rounded-xl transition-colors ${isDockLocked ? 'text-slate-600 hover:text-slate-800' : 'text-blue-600 bg-blue-50'}`} title="Lock Dock">
              {isDockLocked ? <Lock size={16} /> : <Unlock size={16} />}
            </button>
          </div>
        </div>
        <div className="pointer-events-auto transition-all duration-300 z-50">
          <button onClick={() => setIsDockMinimized(!isDockMinimized)} className="bg-white/90 backdrop-blur-md hover:bg-white text-slate-500 hover:text-blue-600 p-1.5 rounded-full shadow-lg border border-white/50 transition-all active:scale-95">
            {isDockMinimized ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
          </button>
        </div>
      </div>
    </div>
  );
};

const ToolBtn: React.FC<{ icon: React.ReactElement, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center min-w-[70px] p-2 hover:bg-blue-50 rounded-xl group transition-all duration-200 active:scale-95">
    <div className="text-gray-500 group-hover:text-blue-600 mb-1 transition-colors p-2 bg-transparent group-hover:bg-white rounded-full shadow-none group-hover:shadow-sm">
      {React.cloneElement(icon, { size: 22 })}
    </div>
    <span className="text-[10px] font-bold uppercase text-gray-400 group-hover:text-blue-600 tracking-wide">{label}</span>
  </button>
);

export default App;