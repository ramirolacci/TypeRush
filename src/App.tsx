import React, { useState, useEffect, useCallback, useRef } from 'react';
import type {
  NoteNode,
  WordItem,
  HitJudgment,
  Particle,
  GameStats,
  Settings,
  Difficulty
} from './types/game';
import { getRandomWord } from './data/dictionaries';
import { TRANSLATIONS } from './data/translations';
import { soundEngine } from './services/audio';
import { animationService } from './services/animation';
import { RhythmCanvas } from './components/RhythmCanvas';
import { WordStack } from './components/WordStack';
import { ParagraphView } from './components/ParagraphView';
import { HUD } from './components/HUD';
import { MobileKeyboard } from './components/MobileKeyboard';
import { SettingsModal } from './components/SettingsModal';
import { GameOverModal } from './components/GameOverModal';
import { Play, Globe, Zap, Keyboard, AlignLeft, Gamepad2 } from 'lucide-react';

export const App: React.FC = () => {
  // Game States
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  // Settings
  const [settings, setSettings] = useState<Settings>({
    language: 'es',
    difficulty: 'easy',
    speed: 1.5,
    sfxVolume: 0.5,
    musicVolume: 0.3,
    soundEnabled: true,
    showMobileKeyboard: false,
    gameMode: 'rhythm'
  });

  // Game Data
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [upcomingWords, setUpcomingWords] = useState<string[]>([]);
  const [notes, setNotes] = useState<NoteNode[]>([]);
  const [judgments, setJudgments] = useState<HitJudgment[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Statistics
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    multiplier: 1,
    perfectCount: 0,
    greatCount: 0,
    goodCount: 0,
    missCount: 0,
    missedWordsCount: 0,
    currentSpeed: 0.7,
    totalLettersTyped: 0,
    correctLettersTyped: 0,
    completedWordsCount: 0,
    level: 1,
    activeDifficulty: 'easy',
    startTime: null,
    wpm: 0,
    accuracy: 100
  });

  const [levelUpInfo, setLevelUpInfo] = useState<{ level: number; difficulty: string } | null>(null);
  const levelUpBannerRef = useRef<HTMLDivElement | null>(null);

  // Keep refs updated for animation frame loop
  const currentWordRef = useRef<WordItem | null>(null);
  const upcomingWordsRef = useRef<string[]>([]);
  const notesRef = useRef<NoteNode[]>([]);
  const gameStateRef = useRef(gameState);
  const statsRef = useRef(stats);

  currentWordRef.current = currentWord;
  upcomingWordsRef.current = upcomingWords;
  notesRef.current = notes;
  gameStateRef.current = gameState;
  statsRef.current = stats;

  // Auto-detect mobile touch screen on mount
  useEffect(() => {
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isMobile) {
      setSettings(s => ({ ...s, showMobileKeyboard: true }));
    }
  }, []);

  // Update sound engine settings
  useEffect(() => {
    soundEngine.setEnabled(settings.soundEnabled);
    soundEngine.setSfxVolume(settings.sfxVolume);
    soundEngine.setMusicVolume(settings.musicVolume);
  }, [settings]);

  // Spawn notes for a new word
  const spawnWordNotes = useCallback((wordText: string, wordId: string) => {
    const newNotes: NoteNode[] = [];
    const numLanes = 4;

    for (let i = 0; i < wordText.length; i++) {
      const char = wordText[i];
      const laneIndex = (i * 1 + Math.floor(Math.random() * 2)) % numLanes;
      const initialProgress = -0.18 * i;

      newNotes.push({
        id: `${wordId}-${i}-${Date.now()}`,
        char: char.toLowerCase(),
        wordId,
        charIndex: i,
        laneIndex,
        progress: initialProgress,
        x: 0,
        y: 0,
        hit: false,
        missed: false
      });
    }

    setNotes(newNotes);
    notesRef.current = newNotes;
  }, []);

  // Advance to next word in queue
  const advanceToNextWord = useCallback((diff?: Difficulty) => {
    const activeDiff = diff || statsRef.current.activeDifficulty || 'easy';
    const queue = upcomingWordsRef.current;

    const nextWordText = queue[0] || getRandomWord(settings.language, activeDiff);
    const newUpcoming = [
      ...queue.slice(1),
      getRandomWord(settings.language, activeDiff)
    ];
    const newWordId = `word-${Date.now()}`;

    const newWordItem: WordItem = {
      id: newWordId,
      text: nextWordText,
      typedIndex: 0,
      isCompleted: false
    };

    setCurrentWord(newWordItem);
    currentWordRef.current = newWordItem;
    setUpcomingWords(newUpcoming);
    upcomingWordsRef.current = newUpcoming;

    spawnWordNotes(nextWordText, newWordId);
  }, [settings.language, spawnWordNotes]);

  const hasAdvancedRef = useRef(false);

  // Handle Word Completion & Level Progression Logic
  const handleWordCompleted = useCallback((wasSuccess: boolean) => {
    const currentCompleted = statsRef.current.completedWordsCount || 0;

    if (wasSuccess) {
      const newCompletedWords = currentCompleted + 1;
      let newLevel = 1;
      let newDifficulty: Difficulty = 'easy';
      let newSpeed = 0.7;

      if (newCompletedWords >= 18) {
        newLevel = 4;
        newDifficulty = 'expert';
        newSpeed = 1.85;
      } else if (newCompletedWords >= 10) {
        newLevel = 3;
        newDifficulty = 'hard';
        newSpeed = 1.45;
      } else if (newCompletedWords >= 4) {
        newLevel = 2;
        newDifficulty = 'medium';
        newSpeed = 1.05;
      } else {
        newLevel = 1;
        newDifficulty = 'easy';
        newSpeed = Math.min(1.0, 0.7 + newCompletedWords * 0.08);
      }

      const prevLevel = statsRef.current.level || 1;

      if (newLevel > prevLevel) {
        soundEngine.playComboUp(4);
        setLevelUpInfo({ level: newLevel, difficulty: newDifficulty });
        setTimeout(() => {
          animationService.animateLevelUpBanner(levelUpBannerRef.current);
        }, 30);
      }

      setStats(s => ({
        ...s,
        completedWordsCount: newCompletedWords,
        level: newLevel,
        activeDifficulty: newDifficulty,
        currentSpeed: newSpeed
      }));

      setTimeout(() => {
        advanceToNextWord(newDifficulty);
        hasAdvancedRef.current = false;
      }, 20);
    } else {
      // Word missed (fell past strike line)
      soundEngine.playHit('MISS');
      setStats(s => {
        const newMissedWords = (s.missedWordsCount || 0) + 1;
        if (newMissedWords >= 3) {
          setTimeout(() => setGameState('gameover'), 50);
        }
        return {
          ...s,
          combo: 0,
          multiplier: 1,
          missCount: s.missCount + 1,
          missedWordsCount: newMissedWords
        };
      });

      setTimeout(() => {
        advanceToNextWord(statsRef.current.activeDifficulty || 'easy');
        hasAdvancedRef.current = false;
      }, 20);
    }
  }, [advanceToNextWord]);

  // Start / Restart Game Round
  const startNewGame = useCallback(() => {
    const firstWordText = getRandomWord(settings.language, 'easy');
    const firstWordId = `word-${Date.now()}`;

    const queue: string[] = [];
    for (let i = 0; i < 6; i++) {
      queue.push(getRandomWord(settings.language, 'easy'));
    }

    const firstWordItem: WordItem = {
      id: firstWordId,
      text: firstWordText,
      typedIndex: 0,
      isCompleted: false
    };

    setCurrentWord(firstWordItem);
    currentWordRef.current = firstWordItem;

    setUpcomingWords(queue);
    upcomingWordsRef.current = queue;

    spawnWordNotes(firstWordText, firstWordId);

    hasAdvancedRef.current = false;
    setLevelUpInfo(null);

    setStats({
      score: 0,
      combo: 0,
      maxCombo: 0,
      multiplier: 1,
      perfectCount: 0,
      greatCount: 0,
      goodCount: 0,
      missCount: 0,
      missedWordsCount: 0,
      currentSpeed: 0.7,
      totalLettersTyped: 0,
      correctLettersTyped: 0,
      completedWordsCount: 0,
      level: 1,
      activeDifficulty: 'easy',
      startTime: Date.now(),
      wpm: 0,
      accuracy: 100
    });

    setJudgments([]);
    setParticles([]);
    setGameState('playing');
  }, [settings.language, spawnWordNotes]);

  // Create Spark Explosion Particles
  const spawnParticles = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        radius: 2.5 + Math.random() * 3.5,
        alpha: 1.0,
        life: 0,
        maxLife: 20 + Math.random() * 15
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Main Animation Loop
  useEffect(() => {
    if (gameState !== 'playing' || settings.gameMode !== 'rhythm') return;

    let animId: number;
    let lastTime = performance.now();

    const update = (now: number) => {
      if (gameStateRef.current !== 'playing' || settings.gameMode !== 'rhythm') return;

      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Falling speed multiplier based on progressive currentSpeed (starts at 0.7, caps at 1.85)
      const currentSpeedMultiplier = (stats.currentSpeed || 0.7) * 0.45;

      // 1. Move all notes downwards
      setNotes(prevNotes => {
        let wordWasMissed = false;
        const currWord = currentWordRef.current;

        const updated = prevNotes.map(note => {
          if (note.hit || note.missed) return note;

          const newProgress = note.progress + delta * currentSpeedMultiplier;

          // Check if passed strike line
          if (newProgress > 1.15) {
            return { ...note, progress: newProgress, missed: true };
          }

          return { ...note, progress: newProgress };
        });

        // 2. Check active word letter progression & automatic advance if missed
        if (currWord) {
          const targetNote = updated.find(n => n.charIndex === currWord.typedIndex);
          if (targetNote && (targetNote.missed || targetNote.progress > 1.15)) {
            wordWasMissed = true;
          }

          const wordNotes = updated.filter(n => n.wordId === currWord.id);
          if (wordNotes.length > 0 && wordNotes.every(n => n.hit || n.missed)) {
            const hasUnfinishedLetters = currWord.typedIndex < currWord.text.length;
            if (hasUnfinishedLetters) {
              wordWasMissed = true;
            }
          }
        }

        // 3. Handle Word Missed Advancement
        if (wordWasMissed && !hasAdvancedRef.current) {
          hasAdvancedRef.current = true;
          handleWordCompleted(false);
        }

        return updated;
      });

      // 4. Update Particles
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            alpha: 1 - p.life / p.maxLife,
            life: p.life + 1
          }))
          .filter(p => p.life < p.maxLife)
      );

      // 5. Clean up expired judgments
      setJudgments(prev => prev.filter(j => Date.now() - j.timestamp < 900));

      // 6. Real-time WPM Calculation
      setStats(s => {
        if (!s.startTime) return s;
        const elapsedMins = (Date.now() - s.startTime) / 60000;
        if (elapsedMins <= 0) return s;
        const currentWpm = Math.round((s.correctLettersTyped / 5) / elapsedMins);
        return { ...s, wpm: currentWpm };
      });

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [gameState, settings.gameMode, stats.currentSpeed, handleWordCompleted]);

  // Handle Input Keypress with Strike Line Timing Restriction
  const handleKeyPress = useCallback(
    (pressedChar: string) => {
      if (gameState !== 'playing' || settings.gameMode !== 'rhythm' || !currentWord) return;

      const charToMatch = pressedChar.toLowerCase();
      const targetCharIndex = currentWord.typedIndex;
      const targetChar = currentWord.text[targetCharIndex]?.toLowerCase();

      // Find active note for current target letter
      const targetNote = notes.find(
        n => !n.hit && !n.missed && n.charIndex === targetCharIndex
      );

      // Rule: Keystrokes are ONLY accepted if the target note is currently inside the bottom circles row (progress 0.70 to 1.15)
      if (!targetNote) return;

      const isInHitWindow = targetNote.progress >= 0.70 && targetNote.progress <= 1.15;

      if (!isInHitWindow) {
        // Attempted too early (note is still above circles) or too late: resets combo & multiplier bar to x1, does NOT lose lives!
        soundEngine.playHit('MISS');
        setJudgments(j => [
          ...j,
          {
            id: `early-${Date.now()}`,
            type: 'MISS',
            x: targetNote.x || window.innerWidth / 2,
            y: targetNote.y || window.innerHeight * 0.72,
            timestamp: Date.now(),
            text: targetNote.progress < 0.70 ? 'TEMPRANO' : 'TARDE',
            color: '#f59e0b'
          }
        ]);
        setStats(s => ({
          ...s,
          combo: 0,
          multiplier: 1,
          missCount: s.missCount + 1
        }));
        return; // REJECT KEYPRESS - DO NOT ADVANCE!
      }

      if (charToMatch === targetChar) {
        // Correct Key Press inside timing window!
        soundEngine.playKeyPress();

        let judgmentType: 'PERFECT' | 'GREAT' | 'GOOD' = 'GOOD';
        let points = 100;
        let color = '#10b981'; // Green

        const diff = Math.abs(targetNote.progress - 1.0);
        if (diff < 0.12) {
          judgmentType = 'PERFECT';
          points = 300;
          color = '#f59e0b'; // Gold
        } else if (diff < 0.22) {
          judgmentType = 'GREAT';
          points = 200;
          color = '#06b6d4'; // Cyan
        }

        // Mark note as hit
        setNotes(prev =>
          prev.map(n => (n.id === targetNote.id ? { ...n, hit: true } : n))
        );
        spawnParticles(targetNote.x, targetNote.y, color);

        // Update Stats & Combo
        setStats(s => {
          const newCombo = s.combo + 1;
          const newMaxCombo = Math.max(s.maxCombo, newCombo);
          const newMultiplier = Math.min(4, 1 + Math.floor(newCombo / 10));
          const earnedScore = points * newMultiplier;

          if (newMultiplier > s.multiplier) {
            soundEngine.playComboUp(newMultiplier);
          } else {
            soundEngine.playHit(judgmentType, newCombo);
          }

          const newTotal = s.totalLettersTyped + 1;
          const newCorrect = s.correctLettersTyped + 1;
          const newAcc = (newCorrect / newTotal) * 100;

          return {
            ...s,
            score: s.score + earnedScore,
            combo: newCombo,
            maxCombo: newMaxCombo,
            multiplier: newMultiplier,
            perfectCount: s.perfectCount + (judgmentType === 'PERFECT' ? 1 : 0),
            greatCount: s.greatCount + (judgmentType === 'GREAT' ? 1 : 0),
            goodCount: s.goodCount + (judgmentType === 'GOOD' ? 1 : 0),
            totalLettersTyped: newTotal,
            correctLettersTyped: newCorrect,
            accuracy: newAcc
          };
        });

        // Add Judgment Text
        setJudgments(j => [
          ...j,
          {
            id: `hit-${Date.now()}`,
            type: judgmentType,
            x: targetNote.x,
            y: targetNote.y,
            timestamp: Date.now(),
            text: judgmentType,
            color
          }
        ]);

        // Advance Word Progress
        const nextTypedIndex = currentWord.typedIndex + 1;

        if (nextTypedIndex >= currentWord.text.length) {
          hasAdvancedRef.current = true;
          handleWordCompleted(true);
        } else {
          const updatedWord = { ...currentWord, typedIndex: nextTypedIndex };
          setCurrentWord(updatedWord);
          currentWordRef.current = updatedWord;
        }
      } else {
        // Wrong Key Press: resets combo & multiplier bar to x1, does NOT lose lives!
        soundEngine.playHit('MISS');
        setStats(s => {
          const newTotal = s.totalLettersTyped + 1;
          const newAcc = (s.correctLettersTyped / newTotal) * 100;
          return {
            ...s,
            combo: 0,
            multiplier: 1,
            missCount: s.missCount + 1,
            totalLettersTyped: newTotal,
            accuracy: newAcc
          };
        });
      }
    },
    [gameState, currentWord, notes, handleWordCompleted]
  );

  // Physical Keyboard Listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        handleKeyPress(e.key);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, handleKeyPress]);

  const paragraphKeyHandlerRef = useRef<((char: string) => void) | null>(null);

  const targetChar = currentWord ? currentWord.text[currentWord.typedIndex] || null : null;

  const handleMobileKeyPress = (char: string) => {
    if (settings.gameMode === 'paragraph' && paragraphKeyHandlerRef.current) {
      paragraphKeyHandlerRef.current(char);
    } else {
      handleKeyPress(char);
    }
  };

  const t = TRANSLATIONS[settings.language];

  // GSAP Menu Entrance Animation
  useEffect(() => {
    if (gameState === 'menu') {
      animationService.animateMenuEntrance(menuContainerRef.current);
    }
  }, [gameState]);

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-white font-sans overflow-hidden select-none">
      {/* 1. Main Landing Menu View */}
      {gameState === 'menu' && (
        <div className="relative flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-950 via-zinc-950 to-neutral-950">
          <div
            ref={menuContainerRef}
            className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6"
          >
            {/* Project Logo Image */}
            <div className="animate-gsap-item flex justify-center mb-1">
              <img
                src="/Logo.png"
                alt="TypeRush Logo"
                className="w-24 sm:w-32 h-auto max-h-32 object-contain drop-shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="animate-gsap-item inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold uppercase">
              <Zap className="w-4 h-4 fill-amber-400" /> {t.menuBadge}
            </div>

            <h1 className="animate-gsap-item text-4xl sm:text-5xl font-black font-mono tracking-wider bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]">
              TYPE RUSH
            </h1>

            <p className="animate-gsap-item text-zinc-400 text-sm font-mono leading-relaxed">
              {t.menuDescription}
            </p>

            {/* Game Mode Picker Tabs on Main Menu */}
            <div className="animate-gsap-item grid grid-cols-2 gap-2 bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800">
              <button
                onClick={() => setSettings(s => ({ ...s, gameMode: 'rhythm' }))}
                className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  settings.gameMode === 'rhythm'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> {t.modeTypeRush}
              </button>

              <button
                onClick={() => setSettings(s => ({ ...s, gameMode: 'paragraph' }))}
                className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  settings.gameMode === 'paragraph'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" /> {t.modeWordSprint}
              </button>
            </div>

            <div className="animate-gsap-item grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setSettings(s => ({ ...s, language: s.language === 'es' ? 'en' : 'es' }))}
                className="py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm font-mono font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Globe className="w-4 h-4 text-amber-400" />
                {t.languageName}
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm font-mono font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Keyboard className="w-4 h-4 text-cyan-400" />
                {t.options}
              </button>
            </div>

            <button
              onClick={startNewGame}
              className="animate-gsap-item w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black font-mono font-black text-xl rounded-2xl shadow-xl hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-wider"
            >
              <Play className="w-6 h-6 fill-black" /> {t.start}
            </button>
          </div>
        </div>
      )}

      {/* 2. Active Game Screen */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <div className="relative flex-1 w-full h-full overflow-hidden bg-slate-950">
          {/* Level Up Notification Banner */}
          {levelUpInfo && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
              <div
                ref={levelUpBannerRef}
                className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 border-2 border-yellow-200 text-black px-6 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md"
              >
                <Zap className="w-6 h-6 fill-black animate-bounce" />
                <div className="text-center">
                  <div className="text-base font-black font-mono tracking-wider uppercase">
                    {t.levelUpTitle} &bull; {t.levelLabel} {levelUpInfo.level}
                  </div>
                  <div className="text-xs font-mono font-bold text-zinc-900">
                    {t.levelUpDesc}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top HUD */}
          <HUD
            stats={stats}
            settings={settings}
            isPaused={gameState === 'paused'}
            onTogglePause={() => setGameState(g => (g === 'playing' ? 'paused' : 'playing'))}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onRestart={startNewGame}
          />

          {/* Render Mode Content */}
          {settings.gameMode === 'paragraph' ? (
            <ParagraphView
              settings={settings}
              stats={stats}
              isPaused={gameState === 'paused'}
              onUpdateStats={setStats}
              onCompleteRound={(bonus) => {
                setStats(s => ({
                  ...s,
                  score: s.score + bonus,
                  completedParagraphs: (s.completedParagraphs || 0) + 1
                }));
              }}
              onTimeOut={() => setGameState('gameover')}
              onKeyPressRegister={(handler) => {
                paragraphKeyHandlerRef.current = handler;
              }}
            />
          ) : (
            <>
              {/* Rhythm Lane Canvas Container (Fills screen) */}
              <div className="w-full h-full">
                <RhythmCanvas
                  notes={notes}
                  judgments={judgments}
                  particles={particles}
                  combo={stats.combo}
                />
              </div>

              {/* Bottom Word Stack (Floating overlay at bottom center) */}
              <WordStack
                currentWord={currentWord}
                upcomingWords={upcomingWords}
                hasMobileKeyboard={settings.showMobileKeyboard}
              />
            </>
          )}

          {/* Optional Mobile Touch Virtual Keyboard */}
          {settings.showMobileKeyboard && (
            <div className="absolute bottom-0 left-0 right-0 z-40">
              <MobileKeyboard
                targetChar={targetChar}
                onKeyPress={handleMobileKeyPress}
                language={settings.language}
              />
            </div>
          )}
        </div>
      )}

      {/* 3. Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={newS => setSettings(s => ({ ...s, ...newS }))}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* 4. Game Over Modal */}
      {gameState === 'gameover' && (
        <GameOverModal
          stats={stats}
          language={settings.language}
          onRestart={startNewGame}
          onGoToMenu={() => setGameState('menu')}
        />
      )}
    </div>
  );
};

export default App;
