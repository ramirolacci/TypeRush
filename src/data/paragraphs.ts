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
    "supera tus propios limites en cada ronda y convierte la practica diaria en un habito indestructible",
    "el diseño de cada nivel desafia tu concentracion y tu empeño constante en cada intento",
    "mañana podras superar tus marcas con practica y perseverancia frente a la pantalla",
    "el español es un idioma rico lleno de palabras hermosas para practicar la mecanografia",
    "un pequeño esfuerzo diario genera grandes resultados a lo largo del tiempo",
    "mantener una postura adecuada y relajada permite escribir durante horas sin fatiga muscular",
    "la memoria muscular de las manos es el secreto mejor guardado de los mecanografos expertos"
  ],
  en: [
    "typing speed is a skill that develops through consistent practice and continuous focus on accuracy",
    "the rhythm of your fingers flowing across the keyboard creates a smooth stream of thoughts into digital words",
    "every keystroke typed with precision boosts your performance and sharpens your muscle memory for future challenges",
    "true speed comes not from rushing blindly but from maintaining a steady calm momentum without making mistakes",
    "react quickly as each character presents itself under the pressure of the countdown timer running out",
    "great code and ideas are born when mind and fingers synchronize in total harmony with the mechanical switches",
    "developing finger dexterity and smooth coordination opens up endless possibilities for speed typing",
    "focusing on rhythm and fluid movements allows you to type faster without straining your hands",
    "mastering touch typing transforms your computer into a seamless natural extension of your thoughts"
  ]
};

/**
 * Calculates the dynamic time limit in seconds based on character count and difficulty.
 */
export function calculateTimeLimit(totalChars: number, difficulty: Difficulty): number {
  const cpsMap: Record<Difficulty, number> = {
    easy: 3.2,
    medium: 4.2,
    hard: 5.5,
    expert: 7.0
  };

  const cps = cpsMap[difficulty] || 4.2;
  const calculatedSeconds = Math.ceil(totalChars / cps) + 2;
  return Math.max(6, calculatedSeconds);
}

let lastSentenceIdx = -1;

/**
 * Generates a paragraph item (either a curated text sentence or a random word list).
 * - isTextMode = true: Curated text sentence
 * - isTextMode = false: Random word list from dictionary
 */
export function getRandomParagraph(
  lang: Language,
  difficulty: Difficulty = 'medium',
  isTextMode?: boolean
): ParagraphItem {
  // Default to boolean logic if not specified
  const shouldBeText = isTextMode !== undefined ? isTextMode : true;
  let text = '';

  if (shouldBeText) {
    // Pick a curated sentence from database (avoiding immediate repeat)
    const database = PARAGRAPH_DATABASE[lang] || PARAGRAPH_DATABASE.es;
    let randIdx = Math.floor(Math.random() * database.length);
    if (database.length > 1 && randIdx === lastSentenceIdx) {
      randIdx = (randIdx + 1) % database.length;
    }
    lastSentenceIdx = randIdx;
    text = database[randIdx];
  } else {
    // Generate a random word list (Monkeytype word sprint style)
    const wordList = DICTIONARIES[lang][difficulty] || DICTIONARIES[lang].medium;
    const selectedWords: string[] = [];
    const targetWordCount = difficulty === 'easy' ? 16 : difficulty === 'medium' ? 22 : 28;

    for (let i = 0; i < targetWordCount; i++) {
      const randIdx = Math.floor(Math.random() * wordList.length);
      selectedWords.push(wordList[randIdx].toLowerCase());
    }
    text = selectedWords.join(' ');
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
