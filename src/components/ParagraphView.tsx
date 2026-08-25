import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Settings, GameStats } from '../types/game';
import { getRandomParagraph, type ParagraphItem } from '../data/paragraphs';
import { TRANSLATIONS } from '../data/translations';
import { soundEngine } from '../services/audio';
import { animationService } from '../services/animation';
import { Sparkles, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { LetterConfettiCanvas } from './LetterConfettiCanvas';

interface ParagraphViewProps {
  settings: Settings;
  stats: GameStats;
  onUpdateStats: (updater: (prev: GameStats) => GameStats) => void;
  onCompleteRound: (bonusPoints: number) => void;
  onTimeOut: () => void;
  isPaused: boolean;
  onKeyPressRegister?: (handler: (char: string) => void) => void;
}

export const ParagraphView: React.FC<ParagraphViewProps> = ({
  settings,
  stats: _stats,
  onUpdateStats,
  onCompleteRound,
  onTimeOut,
  isPaused,
  onKeyPressRegister
}) => {
  const timerRef = useRef<HTMLDivElement | null>(null);
  const t = TRANSLATIONS[settings.language];

  // Streak of paragraphs completed in current run
  const [paragraphCount, setParagraphCount] = useState<number>(1);

  // Current Paragraph State (starts with true = authentic text sentence!)
  const [paragraph, setParagraph] = useState<ParagraphItem>(() =>
    getRandomParagraph(settings.language, settings.difficulty, true)
  );

  // User Typing State
  const [userInput, setUserInput] = useState<string>('');
  const [charStatus, setCharStatus] = useState<('correct' | 'incorrect')[]>([]);

  // Dynamic Timer (in seconds, with 1 decimal accuracy)
  const [timeLeft, setTimeLeft] = useState<number>(paragraph.timeLimitSeconds);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Keep refs for event listeners and callbacks
  const userInputRef = useRef(userInput);
  const paragraphRef = useRef(paragraph);
  const isPausedRef = useRef(isPaused);
  const isCompletedRef = useRef(isCompleted);
  const onTimeOutRef = useRef(onTimeOut);

  userInputRef.current = userInput;
  paragraphRef.current = paragraph;
  isPausedRef.current = isPaused;
  isCompletedRef.current = isCompleted;
  onTimeOutRef.current = onTimeOut;

  // Load a fresh paragraph alternating between Text (odd count) and Word List (even count)
  const loadNextParagraph = useCallback(() => {
    setParagraphCount(prevCount => {
      const nextCount = prevCount + 1;
      const isTextMode = nextCount % 2 === 1; // Odd = Text sentence, Even = Word list
      const nextPara = getRandomParagraph(settings.language, settings.difficulty, isTextMode);

      setParagraph(nextPara);
      setUserInput('');
      setCharStatus([]);
      setTimeLeft(nextPara.timeLimitSeconds);
      setIsCompleted(false);
      return nextCount;
    });
  }, [settings.language, settings.difficulty]);

  // Handle character input from keyboard or virtual mobile keys
  const handleCharInput = useCallback(
    (char: string) => {
      if (isPausedRef.current || isCompletedRef.current) return;

      const currentText = paragraphRef.current.text;
      const currInput = userInputRef.current;
      const targetIdx = currInput.length;

      // Handle Backspace
      if (char === 'Backspace') {
        if (targetIdx > 0) {
          setUserInput(prev => prev.slice(0, -1));
          setCharStatus(prev => prev.slice(0, -1));
          soundEngine.playKeyPress();
        }
        return;
      }

      // Ignore non-printable keys
      if (char.length !== 1) return;

      // Cannot type beyond paragraph length
      if (targetIdx >= currentText.length) return;

      const expectedChar = currentText[targetIdx];
      const isMatch = char === expectedChar;

      const newStatus = isMatch ? 'correct' : 'incorrect';
      const newInput = currInput + char;

      setUserInput(newInput);
      setCharStatus(prev => [...prev, newStatus]);

      // Audio & Stats Feedback
      if (isMatch) {
        soundEngine.playKeyPress();
        onUpdateStats(s => {
          const newTotal = s.totalLettersTyped + 1;
          const newCorrect = s.correctLettersTyped + 1;
          const newCombo = s.combo + 1;
          const newMaxCombo = Math.max(s.maxCombo, newCombo);
          return {
            ...s,
            score: s.score + 10 * s.multiplier,
            combo: newCombo,
            maxCombo: newMaxCombo,
            totalLettersTyped: newTotal,
            correctLettersTyped: newCorrect,
            accuracy: (newCorrect / newTotal) * 100
          };
        });
      } else {
        soundEngine.playHit('MISS');
        animationService.animateTimerShake(timerRef.current);
        onUpdateStats(s => {
          const newTotal = s.totalLettersTyped + 1;
          return {
            ...s,
            combo: 0,
            multiplier: 1,
            missCount: s.missCount + 1,
            totalLettersTyped: newTotal,
            accuracy: (s.correctLettersTyped / newTotal) * 100
          };
        });
      }

      // Check if Paragraph Completed!
      if (newInput.length >= currentText.length) {
        setIsCompleted(true);
        soundEngine.playComboUp(3);

        // Calculate time bonus points
        const bonus = Math.round(timeLeft * 50);
        onCompleteRound(bonus);

        // Auto-advance after brief pause
        setTimeout(() => {
          loadNextParagraph();
        }, 1200);
      }
    },
    [timeLeft, onUpdateStats, onCompleteRound, loadNextParagraph]
  );

  // Expose key press callback to parent if needed
  useEffect(() => {
    if (onKeyPressRegister) {
      onKeyPressRegister(handleCharInput);
    }
  }, [onKeyPressRegister, handleCharInput]);

  // Physical Keyboard Listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === 'Backspace' || e.key.length === 1) {
        if (e.key === ' ') e.preventDefault(); // Prevent scrolling on spacebar
        handleCharInput(e.key);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleCharInput]);

  // Real-time Countdown Timer Loop
  useEffect(() => {
    if (isPaused || isCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timer);
          soundEngine.playHit('MISS');
          onTimeOutRef.current();
          return 0;
        }
        return Math.max(0, parseFloat((prev - 0.1).toFixed(1)));
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isPaused, isCompleted]);

  // Calculate current word index for top progress header (e.g. 2/25)
  const currentWordIndex = Math.min(
    paragraph.words.length,
    userInput.trim().length === 0 ? 0 : userInput.split(' ').length
  );

  // Time warning styling
  const isTimeLow = timeLeft <= 5 && timeLeft > 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-8 select-none relative bg-gradient-to-b from-slate-950 via-zinc-950 to-neutral-950 overflow-y-auto">
      {/* Background Grid Lines (Matching Type Rush Canvas Vibe) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:45px_45px] pointer-events-none" />

      {/* Background Subtle Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-slate-950 pointer-events-none" />

      <div className="max-w-3xl sm:max-w-4xl w-full flex flex-col items-center text-center z-10 space-y-4 sm:space-y-5 pt-12 sm:pt-14 pb-4">
        
        {/* Top Header: Word Counter (e.g. 0/18) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold tracking-widest text-amber-500/90 uppercase mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {t.textHeader} #{paragraphCount} &bull; {paragraph.totalChars} {t.characters}
          </div>

          <div className="text-4xl sm:text-6xl md:text-7xl font-black font-mono tracking-wider text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
            {currentWordIndex}/{paragraph.words.length}
          </div>
        </div>

        {/* Central Text Box Component */}
        <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl relative min-h-[160px] flex items-center justify-center">
          
          <div className="text-xl sm:text-2xl md:text-3xl font-mono leading-relaxed tracking-wide text-left flex flex-wrap gap-x-[0.3em] gap-y-2">
            {paragraph.words.map((word, wordIdx) => {
              // Calculate start char index for this word in paragraph.text
              const startCharIndex = paragraph.words.slice(0, wordIdx).join(' ').length + (wordIdx > 0 ? 1 : 0);

              return (
                <span key={`word-${wordIdx}`} className="inline-flex items-center whitespace-nowrap">
                  {word.split('').map((char, charInWordIdx) => {
                    const globalIdx = startCharIndex + charInWordIdx;
                    const typedChar = userInput[globalIdx];
                    const status = charStatus[globalIdx];
                    const isCursorHere = globalIdx === userInput.length;

                    let charClass = 'text-zinc-500 transition-colors duration-100';
                    if (status === 'correct') {
                      charClass = 'text-amber-400 font-bold drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]';
                    } else if (status === 'incorrect') {
                      charClass = 'text-rose-500 font-black underline bg-rose-950/70 rounded px-[2px]';
                    }

                    return (
                      <span key={`c-${globalIdx}`} className="relative inline-block">
                        {/* Cursor vertical caret bar */}
                        {isCursorHere && (
                          <span className="absolute -left-[3px] top-0 bottom-0 w-[3px] bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b]" />
                        )}
                        <span className={charClass}>
                          {typedChar !== undefined && status === 'incorrect' ? typedChar : char}
                        </span>
                      </span>
                    );
                  })}

                  {/* Handle space after word */}
                  {wordIdx < paragraph.words.length - 1 && (() => {
                    const spaceGlobalIdx = startCharIndex + word.length;
                    const spaceStatus = charStatus[spaceGlobalIdx];
                    const isCursorAtSpace = spaceGlobalIdx === userInput.length;

                    let spaceClass = 'inline-block w-[0.4em]';
                    if (spaceStatus === 'correct') {
                      spaceClass += ' text-amber-400/40';
                    } else if (spaceStatus === 'incorrect') {
                      spaceClass += ' bg-rose-500/40 rounded';
                    }

                    return (
                      <span key={`space-${wordIdx}`} className="relative inline-block">
                        {isCursorAtSpace && (
                          <span className="absolute -left-[3px] top-0 bottom-0 w-[3px] bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b]" />
                        )}
                        <span className={spaceClass}>&nbsp;</span>
                      </span>
                    );
                  })()}
                </span>
              );
            })}
          </div>

          {/* Victory Overlay Animation */}
          {isCompleted && (
            <>
              <LetterConfettiCanvas />
              <div className="absolute inset-0 bg-zinc-950/95 rounded-3xl flex flex-col items-center justify-center gap-2 animate-fade-in text-emerald-400">
              <CheckCircle2 className="w-14 h-14 animate-bounce" />
              <span className="text-xl sm:text-2xl font-black font-mono uppercase tracking-wider">
                {t.textCompleted}
              </span>
              <span className="text-sm font-mono text-zinc-400">{t.loadingNext}</span>
            </div>
          </>
          )}
        </div>

        {/* Dynamic Countdown Timer Display */}
        <div className="flex flex-col items-center space-y-2 w-full max-w-md">
          <div className="text-xs sm:text-sm font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
            <Zap className="w-4 h-4 text-amber-500 animate-bounce" /> {t.timeRemaining}
          </div>

          <div
            ref={timerRef}
            className={`text-4xl sm:text-6xl md:text-7xl font-black font-mono transition-all duration-150 ${
              isTimeLow
                ? 'text-rose-500 scale-110 drop-shadow-[0_0_25px_rgba(244,63,94,0.9)] animate-pulse'
                : 'text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]'
            }`}
          >
            {timeLeft.toFixed(1)}s
          </div>

          {/* Animated Glowing Progress Bar */}
          <div className="w-full h-2.5 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-100 ${
                isTimeLow
                  ? 'bg-gradient-to-r from-rose-600 to-red-500 shadow-[0_0_12px_#f43f5e]'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_10px_#f59e0b]'
              }`}
              style={{
                width: `${Math.max(0, Math.min(100, (timeLeft / paragraph.timeLimitSeconds) * 100))}%`
              }}
            />
          </div>

          <p className="text-xs sm:text-sm font-mono text-zinc-400 pt-0.5">
            {t.assignedTime} <span className="text-zinc-200 font-bold">{paragraph.timeLimitSeconds}s</span> ({paragraph.totalChars} {t.characters})
          </p>
        </div>

        {/* Manual Skip Button */}
        <button
          onClick={loadNextParagraph}
          className="py-2.5 px-6 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-full text-xs sm:text-sm font-mono font-bold text-zinc-200 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          {t.skipText} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
