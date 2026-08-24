import type { Language, Difficulty } from '../types/game';
import { DICTIONARIES } from './dictionaries';

export interface ParagraphItem {
  id: string;
  text: string;
  words: string[];
  totalChars: number;
  timeLimitSeconds: number;
}

// Curated authentic mini-texts for engaging typing sessions
const PARAGRAPH_DATABASE: Record<Language, string[]> = {
  es: [
    "la velocidad de tipeo depende de la practica constante y la precision de cada movimiento en el teclado",
    "el ritmo de los dedos sobre las teclas crea una melodia invisible de palabras y pensamientos veloces",
    "cada caracter ingresado a tiempo aumenta tu puntuacion y demuestra la destreza de tus manos",
    "la concentracion es la clave para dominar el arte de la mecanografia sin mirar los dedos",
    "un buen mecanografo no solo busca la maxima rapidez sino mantener la exactitud en cada palabra",
    "la agilidad mental y los reflejos se combinan en este desafio de velocidad contra el reloj",
    "los grandes desarrolladores escriben codigo con fluidez convirtiendo ideas en algoritmos al instante",
    "supera tus propios limites en cada ronda y convierte la practica diaria en un habito indestructible"
  ],
  en: [
    "down the system all however the thing lead again same now more late another keep long great out leave the last early general at",
    "typing speed is a skill that develops through consistent practice and continuous focus on accuracy",
    "the rhythm of your fingers flowing across the keyboard creates a smooth stream of thoughts into digital words",
    "every keystroke typed with precision boosts your performance and sharpens your muscle memory for future challenges",
    "true speed comes not from rushing blindly but from maintaining a steady calm momentum without making mistakes",
    "react quickly as each character presents itself under the pressure of the countdown timer running out",
    "great code and ideas are born when mind and fingers synchronize in total harmony with the mechanical switches"
  ]
};

/**
 * Calculates the dynamic time limit in seconds based on character count and difficulty.
 * - Easy: ~3.2 CPS (Characters Per Second)
 * - Medium: ~4.2 CPS
 * - Hard: ~5.5 CPS
 * - Expert: ~7.0 CPS
 */
export function calculateTimeLimit(totalChars: number, difficulty: Difficulty): number {
  const cpsMap: Record<Difficulty, number> = {
    easy: 3.2,
    medium: 4.2,
    hard: 5.5,
    expert: 7.0
  };

  const cps = cpsMap[difficulty] || 4.2;
  // Give a small 2-second grace period for initial reaction
  const calculatedSeconds = Math.ceil(totalChars / cps) + 2;
  return Math.max(6, calculatedSeconds);
}

/**
 * Generates a paragraph item (either from curated database or 25 random words like Monkeytype).
 */
export function getRandomParagraph(lang: Language, difficulty: Difficulty = 'medium'): ParagraphItem {
  const useGenerated = Math.random() > 0.4;
  let text = '';

  if (useGenerated) {
    // Generate a 25-word random paragraph (Monkeytype classic style)
    const wordList = DICTIONARIES[lang][difficulty] || DICTIONARIES[lang].medium;
    const selectedWords: string[] = [];
    const targetWordCount = difficulty === 'easy' ? 18 : difficulty === 'medium' ? 25 : 30;

    for (let i = 0; i < targetWordCount; i++) {
      const randIdx = Math.floor(Math.random() * wordList.length);
      selectedWords.push(wordList[randIdx].toLowerCase());
    }
    text = selectedWords.join(' ');
  } else {
    const database = PARAGRAPH_DATABASE[lang] || PARAGRAPH_DATABASE.es;
    const randIdx = Math.floor(Math.random() * database.length);
    text = database[randIdx];
  }

  const words = text.split(' ');
  const totalChars = text.length;
  const timeLimitSeconds = calculateTimeLimit(totalChars, difficulty);

  return {
    id: `paragraph-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    text,
    words,
    totalChars,
    timeLimitSeconds
  };
}
