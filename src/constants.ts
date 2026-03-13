import { Size, Student } from './types';

export const THEME_COLORS = {
  indigo: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
  blue: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
  purple: { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce' },
  rose: { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c' },
  amber: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
  emerald: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857' },
  slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155' },
  teal: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e' },
  orange: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c' },
  red: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
  pink: { 50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d' }
};

export const DEFAULT_NAMES = [
  "Abbie", "Aiza", "Angus", "Avigail", "Billy", "Blessing", "Brook",
  "Fadil", "Grace", "Irisha", "JJ", "Kiara", "London G", "London W", "Minaaz",
  "Mohamad", "Quinn", "Rabiya", "Raj", "Safee", "Sebastian", "Shawn",
  "Veronica", "Vika", "Viktor", "Zhaoyang"
];

export const createDefaultStudents = (): Student[] => {
  return DEFAULT_NAMES.map(name => ({
    id: Math.random().toString(36).substr(2, 9),
    name,
    active: true
  }));
};

export const createDefaultGroups = (students: Student[]): Student[][] => {
  const groups: Student[][] = [[], [], [], []];
  const caps = [8, 6, 8, 9]; 

  students.forEach((s) => {
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].length < caps[i]) {
        groups[i].push(s);
        return;
      }
    }
  });

  return groups;
};

export const WIDGET_SIZES: Record<string, Size> = {
  TIMER: { width: 280, height: 340 },
  CLOCK: { width: 500, height: 210 },
  RANDOMIZER: { width: 250, height: 290 },
  GROUP_MAKER: { width: 900, height: 550 },
  SEAT_PICKER: { width: 900, height: 530 },
  TEXT: { width: 300, height: 300 },
  OVERLAY_TEXT: { width: 500, height: 120 },
  WEBCAM: { width: 900, height: 550 },
  DICE: { width: 300, height: 320 },
  TRAFFIC: { width: 220, height: 360 },
  QR: { width: 500, height: 470 },
  VOTE: { width: 400, height: 350 },
  WHITEBOARD: { width: 900, height: 550 },
  SCHEDULE: { width: 380, height: 500 },
  EMBED: { width: 480, height: 360 },
  CALENDAR: { width: 320, height: 350 },
  MARBLE_JAR: { width: 400, height: 500 },
  SOUNDBOARD: { width: 600, height: 500 },
  CALCULATOR: { width: 280, height: 390 },
  COUNTDOWN: { width: 300, height: 400 },
  SPARK: { width: 400, height: 450 },
  WEATHER: { width: 300, height: 300 },
  POLYPAD: { width: 900, height: 600 },
  GAMES: { width: 550, height: 650 },
  SORT: { width: 900, height: 550 }
};

export const SCHEDULE_EMOJIS = ["📚", "✏️", "🎨", "🤸", "🍎", "🚌", "📝", "💻", "🔬", "🌈", "🎵", "⚽", "📖", "🧠", "🗣️"];

export const BACKGROUNDS = [
  { id: 'default', name: 'Original', type: 'preset', preview: 'bg-gradient-to-br from-blue-200 to-orange-200', style: {}, textColor: 'text-slate-800' },
  { id: 'strata', name: 'Strata', type: 'image', src: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNkMmQ2ZDEiLz48cGF0aCBkPSJNMCwxMDgwIEM0ODAsMTA4MCA5NjAsODAwIDE5MjAsOTAwIEwxOTIwLDEwODAgTDAsMTA4MCBaIiBmaWxsPSIjYThhYTk3Ii8+PHBhdGggZD0iTTAsMTA4MCBDNDgwLDEwODAgOTYwLDYwMCAxOTIwLDcwMCBMMTkyMCwxMDgwIEwwLDEwODAgWiIgZmlsbD0iIzc0N2M3OCIvPjxwYXRoIGQ9Ik0wLDEwODAgQzQ4MCwxMDgwIDk2MCw0MDAgMTkyMCw1MDAgTDE5MjAsMTA4MCBMLDEwODAgWiIgZmlsbD0iIzQ4NWM4YSIvPjxwYXRoIGQ9Ik0wLDEwODAgQzQ4MCwxMDgwIDk2MCwyMDAgMTkyMCwzMDAgTDE5MjAsMTA4MCBMLDEwODAgWiIgZmlsbD0iIzI5M2I0NyIvPjwvc3ZnPg==', textColor: 'text-slate-800' },
  { id: 'forest', name: 'Forest', type: 'image', src: 'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=1920', textColor: 'text-white' },
  { id: 'ocean', name: 'Ocean', type: 'image', src: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1920', textColor: 'text-slate-800' },
  { id: 'sunset', name: 'Sunset', type: 'image', src: 'https://images.pexels.com/photos/36717/amazing-animal-beautiful-beautifull.jpg?auto=compress&cs=tinysrgb&w=1920', textColor: 'text-white' },
  { id: 'galaxy', name: 'Galaxy', type: 'image', src: 'https://images.pexels.com/photos/956981/milky-way-starry-sky-night-sky-star-956981.jpeg?auto=compress&cs=tinysrgb&w=1920', textColor: 'text-white' },
  { id: 'puppy', name: 'Puppy', type: 'image', src: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=1920', textColor: 'text-white' },
  { id: 'kitten', name: 'Kitten', type: 'image', src: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=1920', textColor: 'text-white' },
  { id: 'aurora', name: 'Aurora', type: 'image', src: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1920&q=80', textColor: 'text-white' },
];

export const CLOCK_STYLES = [
  { id: 'standard', name: 'Standard', preview: '12:00' },
  { id: 'analog', name: 'Analog', preview: '🕒' },
  { id: 'modern-analog', name: 'Modern Analog', preview: '⌚' },
  { id: 'bighour', name: 'Big Hour', preview: '12 \n 00' },
  { id: 'modern', name: 'Modern', preview: '12:00' },
  { id: 'retro', name: 'Retro', preview: '12:00' }
];

export const INIT_DOCK_ORDER = ['TIMER', 'CLOCK', 'OVERLAY_TEXT', 'RANDOMIZER', 'GROUP_MAKER', 'SEAT_PICKER', 'SCHEDULE', 'TEXT', 'TRAFFIC', 'QR', 'WEBCAM', 'DICE', 'VOTE', 'DRAWING', 'EMBED', 'CALCULATOR', 'COUNTDOWN', 'SOUNDBOARD', 'POLYPAD', 'GAMES', 'SPARK', 'MARBLE_JAR', 'WEATHER', 'SORT', 'CALENDAR'];