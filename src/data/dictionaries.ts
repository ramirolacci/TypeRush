import type { Language } from '../types/game';

export const DICTIONARIES: Record<Language, {
  easy: string[];
  medium: string[];
  hard: string[];
  expert: string[];
}> = {
  en: {
    easy: [
      "beat", "rhythm", "flow", "rush", "hero", "type", "fast", "note", "song", "tempo",
      "track", "vibe", "groove", "wave", "pulse", "jump", "dash", "glow", "star", "fire",
      "laser", "cyber", "neon", "flash", "sonic", "combo", "score", "level", "stage", "play",
      "speed", "click", "key", "press", "shift", "space", "power", "boost", "drive", "sound",
      "audio", "synth", "music", "chord", "pitch", "tune", "band", "jam", "bass", "drum"
    ],
    medium: [
      "shouting", "glacier", "flamingo", "chicken", "avalanche", "hyperdrive", "electric",
      "spectrum", "frequency", "resonance", "synthesizer", "wavelength", "subwoofer",
      "accelerate", "overdrive", "luminescence", "velocity", "turbulence", "amplifier",
      "vibration", "harmonize", "distortion", "sequencer", "starlight", "cyberpunk",
      "mechanism", "adrenaline", "trajectory", "revolution", "breakthrough", "supernova",
      "kaleidoscope", "metropolis", "chronometer", "firewall", "javascript", "react", "keyboard"
    ],
    hard: [
      "electromagnetic", "crystallization", "extraordinary", "synchronization", "microprocessor",
      "multidimensional", "interstellar", "telecommunication", "neuroplasticity", "photosynthesis",
      "thermodynamics", "counterclockwise", "biodegradable", "incomprehensible", "hyperdimensional",
      "characterization", "disproportionate", "standardization", "intercontinental", "subconscious"
    ],
    expert: [
      "antigravity", "supercalifragilistic", "electroencephalogram", "pseudopseudohypoparathyroidism",
      "flocinaucinihilipilification", "pneumonoultramicroscopicsilicovolcanoconiosis",
      "incomprehensibilities", "unpredictability", "counterrevolutionaries", "institutionalization"
    ]
  },
  es: {
    easy: [
      "ritmo", "flujo", "velez", "tecla", "nota", "fuego", "rayo", "cyber", "neon", "pista",
      "musica", "sonido", "bajo", "onda", "pulso", "juego", "nivel", "punto", "combo", "turbo",
      "golpe", "salto", "luces", "flash", "rapido", "facil", "tipeo", "dedos", "mano", "cable",
      "disco", "radio", "baile", "sueño", "fuerza", "poder", "modo", "meta", "base", "seña",
      "niño", "caña", "guiño", "año", "daño", "leña"
    ],
    medium: [
      "velocidad", "teclado", "guitarra", "acelerar", "frecuencia", "sintetizador", "vibracion",
      "resonancia", "electricidad", "espectro", "turbolencia", "amplificador", "distorsion",
      "secuenciador", "supernova", "trayectoria", "revolucion", "adrenalina", "mecanismo",
      "antigravedad", "microchip", "pantalla", "algoritmo", "programacion", "computadora",
      "relampago", "metropolis", "calidoscopio", "constelacion", "horizonte", "fantastico",
      "diseño", "mañana", "montaña", "muñeca", "pequeño", "compañero", "español", "enseñanza"
    ],
    hard: [
      "electromagnetico", "sincronizacion", "multidimensional", "interestelar", "telecomunicacion",
      "neuroplasticidad", "fotosintesis", "termodinamica", "biodegradable", "incomprensible",
      "caracterizacion", "desproporcionado", "estandarizacion", "intercontinental", "subconsciente",
      "compañerismo", "desempeño", "añoranza", "empeño"
    ],
    expert: [
      "electroencefalograma", "inconstitucionalidad", "desoxirribonucleico", "esternocleidomastoideo",
      "contrarrevolucionario", "electrodomestico", "interdisciplinariedad", "anticonstitucional"
    ]
  }
};

export function getRandomWord(lang: Language, difficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'medium'): string {
  const wordList = DICTIONARIES[lang][difficulty] || DICTIONARIES[lang].medium;
  const randomIndex = Math.floor(Math.random() * wordList.length);
  return wordList[randomIndex].toLowerCase();
}
