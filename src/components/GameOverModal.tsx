import React, { useEffect, useRef } from 'react';
import type { GameStats, Language } from '../types/game';
import { TRANSLATIONS } from '../data/translations';
import { animationService } from '../services/animation';
import { Trophy, RefreshCw, Flame, Target, Award, Home } from 'lucide-react';
import { LetterConfettiCanvas } from './LetterConfettiCanvas';

interface GameOverModalProps {
  stats: GameStats;
  language: Language;
  onRestart: () => void;
  onGoToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, language, onRestart, onGoToMenu }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const scoreRef = useRef<HTMLDivElement | null>(null);
  const accuracyRef = useRef<HTMLSpanElement | null>(null);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    animationService.animateModalPopup(modalRef.current);
    animationService.animateScoreCounter(scoreRef.current, stats.score);

    if (accuracyRef.current) {
      accuracyRef.current.textContent = `${stats.accuracy.toFixed(1)}%`;
    }
  }, [stats.accuracy, stats.score]);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 select-none">
      {/* Explosive letter confetti animation upon game over */}
      <LetterConfettiCanvas />
      <div
        ref={modalRef}
        className="bg-zinc-900/95 border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl relative text-white text-center z-10 backdrop-blur-xl"
      >
        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[11px] sm:text-xs font-mono font-bold uppercase mb-2 sm:mb-3">
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {t.gameOverTitle}
        </div>

        <p className="text-zinc-400 text-[11px] sm:text-xs font-mono mb-2.5 sm:mb-4">
          {t.gameOverSubtitle}
        </p>

        {/* Final Score */}
        <div className="text-[10px] sm:text-xs font-mono text-zinc-400 uppercase tracking-widest">{t.finalScore}</div>
        <div
          ref={scoreRef}
          className="text-3xl sm:text-5xl font-black font-mono text-white tracking-wider my-1 sm:my-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
        >
          0
        </div>

        {/* Highlight Cards Grid */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 my-3 sm:my-6">
          <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-xl sm:rounded-2xl p-2 sm:p-3 flex flex-col items-center">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mb-0.5 sm:mb-1" />
            <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 uppercase">{t.wpm}</span>
            <span className="text-base sm:text-xl font-bold font-mono text-white">{stats.wpm}</span>
          </div>

          <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-xl sm:rounded-2xl p-2 sm:p-3 flex flex-col items-center">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 mb-0.5 sm:mb-1" />
            <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 uppercase">{t.precision}</span>
            <span className="text-base sm:text-xl font-bold font-mono text-white">{stats.accuracy.toFixed(1)}%</span>
          </div>

          <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-xl sm:rounded-2xl p-2 sm:p-3 flex flex-col items-center">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mb-0.5 sm:mb-1" />
            <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 uppercase">{t.maxCombo}</span>
            <span className="text-base sm:text-xl font-bold font-mono text-white">x{stats.maxCombo}</span>
          </div>
        </div>

        {/* Hit Breakdown Table */}
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 mb-3.5 sm:mb-6 font-mono text-[11px] sm:text-xs text-left space-y-1 sm:space-y-2">
          <div className="flex justify-between items-center text-amber-400">
            <span>{t.judgmentPerfect}</span>
            <span className="font-bold">{stats.perfectCount}</span>
          </div>
          <div className="flex justify-between items-center text-cyan-400">
            <span>{t.judgmentGreat}</span>
            <span className="font-bold">{stats.greatCount}</span>
          </div>
          <div className="flex justify-between items-center text-emerald-400">
            <span>{t.judgmentGood}</span>
            <span className="font-bold">{stats.goodCount}</span>
          </div>
          <div className="flex justify-between items-center text-rose-500">
            <span>{t.judgmentMiss}</span>
            <span className="font-bold">{stats.missCount}</span>
          </div>
        </div>

        {/* Action Buttons - Side-by-Side in One Line */}
        <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 pt-0.5 sm:pt-1">
          <button
            onClick={onRestart}
            className="px-3.5 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black font-mono font-black text-xs sm:text-base rounded-xl sm:rounded-2xl shadow-xl hover:scale-[1.03] active:scale-95 transition-all inline-flex items-center justify-center gap-1.5 sm:gap-2 uppercase tracking-wider whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {t.playAgain}
          </button>

          <button
            onClick={onGoToMenu}
            className="px-3.5 py-2.5 sm:px-5 sm:py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white font-mono font-bold text-xs sm:text-base rounded-xl sm:rounded-2xl shadow-md hover:scale-[1.03] active:scale-95 transition-all inline-flex items-center justify-center gap-1.5 sm:gap-2 uppercase tracking-wider whitespace-nowrap"
          >
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> {t.mainMenu}
          </button>
        </div>
      </div>
    </div>
  );
};
