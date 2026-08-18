export type Language = 'en' | 'es';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type GameMode = 'rhythm' | 'sprint' | 'zen';

export type JudgmentType = 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS';

export interface NoteNode {
  id: string;
  char: string;         // The letter (e.g. 'S', 'H', 'O', 'U', 'T')
  wordId: string;       // ID of the word this letter belongs to
  charIndex: number;    // Index inside the word
  laneIndex: number;    // Track lane (0 to 4 horizontal lanes)
  progress: number;     // 0 (top of screen) to 1 (at strike line)
  y: number;            // Calculated Y position on canvas
  x: number;            // Calculated X position on canvas
  hit: boolean;         // Has been hit
  missed: boolean;      // Missed (passed strike line)
}

export interface WordItem {
  id: string;
  text: string;         // The actual word string (lowercase)
  typedIndex: number;   // How many characters have been correctly typed
  isCompleted: boolean;
}

export interface HitJudgment {
  id: string;
  type: JudgmentType;
  x: number;
  y: number;
  timestamp: number;
  text: string;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  multiplier: number;
  perfectCount: number;
  greatCount: number;
  goodCount: number;
  missCount: number;
  missedWordsCount: number;
  currentSpeed: number;
  totalLettersTyped: number;
  correctLettersTyped: number;
  startTime: number | null;
  wpm: number;
  accuracy: number;
}

export interface Settings {
  language: Language;
  difficulty: Difficulty;
  speed: number;         // 1 to 5 (speed multiplier)
  sfxVolume: number;     // 0 to 1
  musicVolume: number;   // 0 to 1
  soundEnabled: boolean;
  showMobileKeyboard: boolean;
  gameMode: GameMode;
}
