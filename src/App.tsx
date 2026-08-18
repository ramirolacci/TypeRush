import React, { useState, useEffect, useCallback, useRef } from 'react';
import type {
  NoteNode,
  WordItem,
  HitJudgment,
  Particle,
  GameStats,
  Settings
} from './types/game';
import { getRandomWord } from './data/dictionaries';
import { soundEngine } from './services/audio';
import { RhythmCanvas } from './components/RhythmCanvas';
import { WordStack } from './components/WordStack';
import { HUD } from './components/HUD';
import { MobileKeyboard } from './components/MobileKeyboard';
import { SettingsModal } from './components/SettingsModal';
import { GameOverModal } from './components/GameOverModal';
import { Play, Globe, Zap, Keyboard } from 'lucide-react';

export const App: React.FC = () => {
  // Game States
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');

  // Settings
  const [settings, setSettings] = useState<Settings>({
    language: 'es',
    difficulty: 'medium',
    speed: 2,
    sfxVolume: 0.7,
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
    startTime: null,
    wpm: 0,
    accuracy: 100
  });

  // Keep refs updated for animation frame loop
  const currentWordRef = useRef<WordItem | null>(null);
  const upcomingWordsRef = useRef<string[]>([]);
  const notesRef = useRef<NoteNode[]>([]);
  const gameStateRef = useRef(gameState);

  currentWordRef.current = currentWord;
  upcomingWordsRef.current = upcomingWords;
  notesRef.current = notes;
  gameStateRef.current = gameState;

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
    const numLanes = 5;

    for (let i = 0; i < wordText.length; i++) {
      const char = wordText[i];
      const laneIndex = (i * 2 + Math.floor(Math.random() * 2)) % numLanes;
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
  const advanceToNextWord = useCallback(() => {
    const queue = upcomingWordsRef.current;
    const nextWordText = queue[0] || getRandomWord(settings.language, settings.difficulty);
    const newUpcoming = [
      ...queue.slice(1),
      getRandomWord(settings.language, settings.difficulty)
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
  }, [settings.language, settings.difficulty, spawnWordNotes]);

  const hasAdvancedRef = useRef(false);

  // Start / Restart Game Round
  const startNewGame = useCallback(() => {
    const firstWordText = getRandomWord(settings.language, settings.difficulty);
    const firstWordId = `word-${Date.now()}`;

    const queue: string[] = [];
    for (let i = 0; i < 6; i++) {
      queue.push(getRandomWord(settings.language, settings.difficulty));
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
      startTime: Date.now(),
      wpm: 0,
      accuracy: 100
    });

    setJudgments([]);
    setParticles([]);
    setGameState('playing');
  }, [settings.language, settings.difficulty, spawnWordNotes]);

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
    if (gameState !== 'playing') return;

    let animId: number;
    let lastTime = performance.now();

    const update = (now: number) => {
      if (gameStateRef.current !== 'playing') return;

      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Falling speed multiplier based on progressive currentSpeed (starts at 0.7, caps at 1.6)
      const currentSpeedMultiplier = (stats.currentSpeed || 0.7) * 0.45;

      // 1. Move all notes downwards
      setNotes(prevNotes => {
        let shouldAdvanceWord = false;
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

        // 2. Check active word letter progression & automatic advance
        if (currWord) {
          // If the note corresponding to current target letter is missed (passed strike line), advance target index!
          const targetNote = updated.find(n => n.charIndex === currWord.typedIndex);
          if (targetNote && (targetNote.missed || targetNote.progress > 1.15)) {
            const nextIndex = currWord.typedIndex + 1;
            if (nextIndex >= currWord.text.length) {
              shouldAdvanceWord = true;
            } else {
              const updatedWord = { ...currWord, typedIndex: nextIndex };
              setCurrentWord(updatedWord);
              currentWordRef.current = updatedWord;
            }
          }

          // If all notes for this word are hit or missed, advance to next word!
          const wordNotes = updated.filter(n => n.wordId === currWord.id);
          if (wordNotes.length > 0 && wordNotes.every(n => n.hit || n.missed)) {
            shouldAdvanceWord = true;
          }
        }

        // 3. Handle Word Advancement & 3-Missed-Words Limit
        if (shouldAdvanceWord && !hasAdvancedRef.current) {
          hasAdvancedRef.current = true;
          const wasCompleted = currWord && currWord.typedIndex >= currWord.text.length;

          if (!wasCompleted) {
            soundEngine.playHit('MISS');
            setStats(s => {
              const newMissedWords = s.missedWordsCount + 1;
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
          } else {
            // Word completed successfully! Gradually increase speed up to 1.6 cap
            setStats(s => ({
              ...s,
              currentSpeed: Math.min(1.6, s.currentSpeed + 0.025)
            }));
          }

          setTimeout(() => {
            advanceToNextWord();
            hasAdvancedRef.current = false;
          }, 20);
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
  }, [gameState, stats.currentSpeed, advanceToNextWord]);

  // Handle Input Keypress with Strike Line Timing Restriction
  const handleKeyPress = useCallback(
    (pressedChar: string) => {
      if (gameState !== 'playing' || !currentWord) return;

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
        // Attempted too early (note is still above circles) or too late
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
          advanceToNextWord();
        } else {
          const updatedWord = { ...currentWord, typedIndex: nextTypedIndex };
          setCurrentWord(updatedWord);
          currentWordRef.current = updatedWord;
        }
      } else {
        // Wrong Key Press!
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
    [gameState, currentWord, notes, advanceToNextWord]
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

  const targetChar = currentWord ? currentWord.text[currentWord.typedIndex] || null : null;

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-white font-sans overflow-hidden select-none">
      {/* 1. Main Landing Menu View */}
      {gameState === 'menu' && (
        <div className="relative flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-950 via-zinc-950 to-neutral-950">
          <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold uppercase">
              <Zap className="w-4 h-4 fill-amber-400" /> RHYTHM TYPING GAME
            </div>

            <h1 className="text-4xl sm:text-5xl font-black font-mono tracking-wider bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(245,158,11,0.4)]">
              TYPE RUSH
            </h1>

            <p className="text-zinc-400 text-sm font-mono leading-relaxed">
              Demuestra tu velocidad tipeando palabras al ritmo del flujo de notas estilo Guitar Hero.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setSettings(s => ({ ...s, language: s.language === 'es' ? 'en' : 'es' }))}
                className="py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm font-mono font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Globe className="w-4 h-4 text-amber-400" />
                {settings.language === 'es' ? '🇪🇸 ESPAÑOL' : '🇺🇸 ENGLISH'}
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm font-mono font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Keyboard className="w-4 h-4 text-cyan-400" />
                OPCIONES
              </button>
            </div>

            <button
              onClick={startNewGame}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black font-mono font-black text-xl rounded-2xl shadow-xl hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-wider"
            >
              <Play className="w-6 h-6 fill-black" /> EMPEZAR / START RUSH
            </button>
          </div>
        </div>
      )}

      {/* 2. Active Game Screen */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <div className="relative flex-1 w-full h-full overflow-hidden bg-slate-950">
          {/* Top HUD */}
          <HUD
            stats={stats}
            settings={settings}
            isPaused={gameState === 'paused'}
            onTogglePause={() => setGameState(g => (g === 'playing' ? 'paused' : 'playing'))}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onRestart={startNewGame}
          />

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

          {/* Optional Mobile Touch Virtual Keyboard */}
          {settings.showMobileKeyboard && (
            <div className="absolute bottom-0 left-0 right-0 z-40">
              <MobileKeyboard
                targetChar={targetChar}
                onKeyPress={handleKeyPress}
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
        <GameOverModal stats={stats} onRestart={startNewGame} />
      )}
    </div>
  );
};

export default App;
