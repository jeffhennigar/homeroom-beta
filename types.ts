export type WidgetType =
  | 'TIMER'
  | 'RANDOMIZER'
  | 'GROUP_MAKER'
  | 'SEAT_PICKER'
  | 'TEXT'
  | 'WEBCAM'
  | 'DICE'
  | 'YOUTUBE'
  | 'TRAFFIC'
  | 'CALENDAR'
  | 'SCHEDULE'
  | 'OVERLAY_TEXT'
  | 'VOTE'
  | 'WHITEBOARD'
  | 'QR'
  | 'AI_CHAT'
  | 'TRANSLATOR'
  | 'CLOCK';

export type ClockStyle = 'standard' | 'analog' | 'bighour' | 'modern' | 'retro';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Student {
  id: string;
  name: string;
  active: boolean;
}

export interface WidgetData {
  fontSize?: number;
  // Timer
  durationMinutes?: number;
  timeLeft?: number;
  isRunning?: boolean;

  // Randomizer / Groups / Seats
  students?: Student[];
  currentName?: string | null;
  isAnimating?: boolean;
  groupCount?: number;
  groups?: Student[][];

  // Text
  content?: string;

  // Webcam
  isMirrored?: boolean;
  isActive?: boolean;

  // Dice
  sides?: number;
  diceCount?: number;
  results?: number[];
  isRolling?: boolean;

  // AI Chat
  messages?: { role: 'user' | 'model'; text: string }[];

  // Translator
  sourceText?: string;
  translatedText?: string;
  targetLanguage?: string;

  // YouTube
  youtubeUrl?: string;

  // Traffic Light
  activeLight?: 'red' | 'yellow' | 'green' | null;
  isListening?: boolean;
  sensitivity?: number;
  threshold?: number;
  // Schedule
  activeScheduleDays?: any;
  items?: any[];

  // General / UI
  mode?: string;
  showSettings?: boolean;
  question?: string;
  lines?: any[];
  url?: string;
  textItems?: any[];
  emojiItems?: any[];
  options?: any[];
  desks?: any[];
  isEditing?: boolean;
  style?: string;
  showDate?: boolean;
}

export interface Widget {
  id: string;
  type: WidgetType;
  position: Position;
  size: Size;
  zIndex: number;
  data: WidgetData;
  isMinimized?: boolean;
  originalHeight?: number;
}

export interface WidgetProps {
  widget: Widget;
  updateData: (id: string, data: Partial<WidgetData>) => void;
}