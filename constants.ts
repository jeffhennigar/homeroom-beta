import { Size, Student } from './types';

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
  const caps = [8, 6, 8, 9]; // Blue: 8, Green: 6, Yellow: 8, Red: 9

  students.forEach((s) => {
    // Distribute students by finding the first table with available capacity
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
  TIMER: { width: 250, height: 290 },
  RANDOMIZER: { width: 250, height: 250 },
  GROUP_MAKER: { width: 880, height: 460 },
  SEAT_PICKER: { width: 900, height: 390 },
  TEXT: { width: 300, height: 300 },
  WEBCAM: { width: 640, height: 480 },
  DICE: { width: 250, height: 250 },
  YOUTUBE: { width: 480, height: 360 },
  TRAFFIC: { width: 180, height: 320 },
  CALENDAR: { width: 300, height: 320 },
  SCHEDULE: { width: 380, height: 500 },
  OVERLAY_TEXT: { width: 500, height: 120 },
  VOTE: { width: 400, height: 350 },
  whiteboard: { width: 1200, height: 900 },
  QR: { width: 310, height: 360 }, // Updated size for Setup mode
  AI_CHAT: { width: 400, height: 500 },
  TRANSLATOR: { width: 350, height: 400 },
  CLOCK: { width: 400, height: 220 }
};

export const SCHEDULE_EMOJIS = ["📚", "✏️", "🎨", "🤸", "🍎", "🚌", "📝", "💻", "🔬", "🌈", "🎵", "⚽", "📖", "🧠", "🗣️"];

export const BACKGROUNDS = [
  { id: 'default', name: 'Original', type: 'preset', preview: 'bg-gradient-to-br from-blue-200 to-orange-200', style: {}, textColor: 'text-slate-800' },
  { id: 'forest', name: 'Forest', type: 'image', src: 'https://images.unsplash.com/photo-1622572860925-daa5e4219d53?q=80&w=1674&auto=format&fit=crop', textColor: 'text-white' },
  { id: 'ocean', name: 'Ocean', type: 'image', src: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1920', textColor: 'text-slate-800' },
  { id: 'sunset', name: 'Sunset', type: 'image', src: 'https://images.unsplash.com/photo-1503803548695-c2a7b4a5b875?q=80&w=1770&auto=format&fit=crop', textColor: 'text-white' },
  { id: 'galaxy', name: 'Galaxy', type: 'image', src: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1750&auto=format&fit=crop', textColor: 'text-white' },
  { id: 'puppy', name: 'Puppy', type: 'image', src: 'https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=1xw:0.74975xh;0,0.190xh', textColor: 'text-white' },
  { id: 'kitten', name: 'Kitten', type: 'image', src: 'https://www.vets4pets.com/siteassets/species/cat/kitten/tiny-kitten-in-sunlight.jpg', textColor: 'text-white' },
  { id: 'aurora', name: 'Aurora', type: 'image', src: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1920&q=80', textColor: 'text-white' },
];

export const CLOCK_STYLES = [
  { id: 'standard', name: 'Standard', preview: '12:00' },
  { id: 'analog', name: 'Analog', preview: '🕒' },
  { id: 'bighour', name: 'Big Hour', preview: '12 \n 00' },
  { id: 'modern', name: 'Modern', preview: '12:00' },
  { id: 'retro', name: 'Retro', preview: '12:00' }
];

export const INIT_DOCK_ORDER = ['SEAT_PICKER', 'GROUP_MAKER', 'SCHEDULE', 'CALENDAR', 'TEXT', 'OVERLAY_TEXT', 'CLOCK', 'TIMER', 'RANDOMIZER', 'TRAFFIC', 'WEBCAM', 'DICE', 'YOUTUBE', 'VOTE', 'WHITEBOARD', 'QR', 'AI_CHAT', 'TRANSLATOR'];