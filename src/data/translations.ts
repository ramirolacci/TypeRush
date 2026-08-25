import type { Language } from '../types/game';

export const TRANSLATIONS: Record<Language, {
  // Main Menu
  menuBadge: string;
  menuDescription: string;
  modeTypeRush: string;
  modeWordSprint: string;
  options: string;
  start: string;
  languageName: string;

  // Settings Modal
  settingsTitle: string;
  gameModeLabel: string;
  languageLabel: string;
  difficultyLabel: string;
  speedLabel: string;
  sfxLabel: string;
  musicLabel: string;
  touchKeyboardLabel: string;
  saveAndContinue: string;
  diffEasy: string;
  diffMedium: string;
  diffHard: string;
  diffExpert: string;

  // HUD
  score: string;
  lives: string;
  speed: string;
  accuracy: string;

  // GameOver Modal
  gameOverTitle: string;
  gameOverSubtitle: string;
  finalScore: string;
  wpm: string;
  precision: string;
  maxCombo: string;
  playAgain: string;
  mainMenu: string;
  judgmentPerfect: string;
  judgmentGreat: string;
  judgmentGood: string;
  judgmentMiss: string;

  // Paragraph View
  textHeader: string;
  characters: string;
  timeRemaining: string;
  assignedTime: string;
  skipText: string;
  textCompleted: string;
  loadingNext: string;

  // Mobile Keyboard
  spaceKey: string;
  backspaceKey: string;

  // Level Progression
  levelLabel: string;
  levelUpTitle: string;
  levelUpDesc: string;
}> = {
  es: {
    // Main Menu
    menuBadge: 'JUEGO DE TIPEO MULTIMODO',
    menuDescription: 'Elige tu modo favorito: velocidad por carriles de letras o contrarreloj de textos.',
    modeTypeRush: 'Type Rush',
    modeWordSprint: 'Word Sprint',
    options: 'OPCIONES',
    start: 'EMPEZAR',
    languageName: '🇪🇸 ESPAÑOL',

    // Settings Modal
    settingsTitle: 'CONFIGURACIÓN',
    gameModeLabel: 'MODO DE JUEGO',
    languageLabel: 'IDIOMA',
    difficultyLabel: 'DIFICULTAD',
    speedLabel: 'VELOCIDAD',
    sfxLabel: 'SFX (TECLADO / IMPACTO)',
    musicLabel: 'MÚSICA / RHYTHM BEAT',
    touchKeyboardLabel: 'TECLADO TÁCTIL EN PANTALLA',
    saveAndContinue: 'GUARDAR Y CONTINUAR',
    diffEasy: 'FÁCIL',
    diffMedium: 'MEDIO',
    diffHard: 'DIFÍCIL',
    diffExpert: 'EXPERTO',

    // HUD
    score: 'PUNTAJE',
    lives: 'VIDAS',
    speed: 'VELOCIDAD',
    accuracy: 'PRECISIÓN',

    // GameOver Modal
    gameOverTitle: 'FIN DEL JUEGO',
    gameOverSubtitle: '¡Se ha completado la ronda! Revisa tus estadísticas de velocidad y precisión.',
    finalScore: 'PUNTAJE FINAL',
    wpm: 'WPM',
    precision: 'PRECISIÓN',
    maxCombo: 'COMBO MÁX',
    playAgain: 'REINTENTAR',
    mainMenu: 'MENÚ PRINCIPAL',
    judgmentPerfect: 'PERFECTO',
    judgmentGreat: 'GENIAL',
    judgmentGood: 'BUENO',
    judgmentMiss: 'FALLO',

    // Paragraph View
    textHeader: 'TEXTO',
    characters: 'CARACTERES',
    timeRemaining: 'TIEMPO RESTANTE',
    assignedTime: 'Tiempo asignado:',
    skipText: 'Saltar Texto',
    textCompleted: '¡TEXTO COMPLETADO!',
    loadingNext: 'Cargando siguiente párrafo...',

    // Mobile Keyboard
    spaceKey: 'ESPACIO',
    backspaceKey: 'BORRAR',

    // Level Progression
    levelLabel: 'NIVEL',
    levelUpTitle: '¡SUBIDA DE NIVEL!',
    levelUpDesc: 'Palabras más largas y mayor velocidad de caída'
  },
  en: {
    // Main Menu
    menuBadge: 'MULTI-MODE TYPING GAME',
    menuDescription: 'Choose your favorite mode: falling letters lane speed or paragraph time trial.',
    modeTypeRush: 'Type Rush',
    modeWordSprint: 'Word Sprint',
    options: 'OPTIONS',
    start: 'START',
    languageName: '🇺🇸 ENGLISH',

    // Settings Modal
    settingsTitle: 'SETTINGS',
    gameModeLabel: 'GAME MODE',
    languageLabel: 'LANGUAGE',
    difficultyLabel: 'DIFFICULTY',
    speedLabel: 'SPEED',
    sfxLabel: 'SFX (KEYBOARD / IMPACT)',
    musicLabel: 'MUSIC / RHYTHM BEAT',
    touchKeyboardLabel: 'TOUCH VIRTUAL KEYBOARD',
    saveAndContinue: 'SAVE & CONTINUE',
    diffEasy: 'EASY',
    diffMedium: 'MEDIUM',
    diffHard: 'HARD',
    diffExpert: 'EXPERT',

    // HUD
    score: 'SCORE',
    lives: 'LIVES',
    speed: 'SPEED',
    accuracy: 'ACCURACY',

    // GameOver Modal
    gameOverTitle: 'GAME OVER',
    gameOverSubtitle: 'Round completed! Check your speed and accuracy metrics below.',
    finalScore: 'FINAL SCORE',
    wpm: 'WPM',
    precision: 'ACCURACY',
    maxCombo: 'MAX COMBO',
    playAgain: 'PLAY AGAIN',
    mainMenu: 'MAIN MENU',
    judgmentPerfect: 'PERFECT',
    judgmentGreat: 'GREAT',
    judgmentGood: 'GOOD',
    judgmentMiss: 'MISS',

    // Paragraph View
    textHeader: 'TEXT',
    characters: 'CHARACTERS',
    timeRemaining: 'TIME REMAINING',
    assignedTime: 'Assigned time:',
    skipText: 'Skip Text',
    textCompleted: 'TEXT COMPLETED!',
    loadingNext: 'Loading next paragraph...',

    // Mobile Keyboard
    spaceKey: 'SPACE',
    backspaceKey: 'BACKSPACE',

    // Level Progression
    levelLabel: 'LEVEL',
    levelUpTitle: 'LEVEL UP!',
    levelUpDesc: 'Longer words and faster falling speed'
  }
};
