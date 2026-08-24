import React, { useEffect, useRef } from 'react';
import type { GameStats, Language } from '../types/game';
import { TRANSLATIONS } from '../data/translations';
import { animationService } from '../services/animation';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Flame, Target, Award } from 'lucide-react';

interface GameOverModalProps {
  stats: GameStats;
  language: Language;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, language, onRestart }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const scoreRef = useRef<HTMLDivElement | null>(null);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    animationService.animateModalPopup(modalRef.current);
    animationService.animateScoreCounter(scoreRef.current, stats.score);

    if (stats.accuracy > 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [stats.accuracy, stats.score]);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div ref={modalRef} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-white text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-mono font-bold uppercase mb-3">
          <Trophy className="w-4 h-4" /> {t.gameOverTitle}
        </div>

        <p className="text-zinc-400 text-xs font-mono mb-4">
          {t.gameOverSubtitle}
        </p>

        {/* Final Score */}
        <div className="text-xs font-mono text-zinc-400 uppercase tracking-widest">{t.finalScore}</div>
        <div ref={scoreRef} className="text-4xl sm:text-5xl font-black font-mono text-white tracking-wider my-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
          0
        </div>

        {/* Highlight Cards Grid */}
        <div className="grid grid-cols-3 gap-2.5 my-6">
          <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-2xl p-3 flex flex-col items-center">
            <Flame className="w-5 h-5 text-amber-500 mb-1" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase">{t.wpm}</span>
            <span className="text-xl font-bold font-mono text-white">{stats.wpm}</span>
          </div>

          <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-2xl p-3 flex flex-col items-center">
            <Target className="w-5 h-5 text-cyan-400 mb-1" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase">{t.precision}</span>
            <span className="text-xl font-bold font-mono text-white">{stats.accuracy.toFixed(1)}%</span>
          </div>

          <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-2xl p-3 flex flex-col items-center">
            <Award className="w-5 h-5 text-yellow-400 mb-1" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase">{t.maxCombo}</span>
            <span className="text-xl font-bold font-mono text-white">x{stats.maxCombo}</span>
          </div>
        </div>

        {/* Hit Breakdown Table */}
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 mb-6 font-mono text-xs text-left space-y-2">
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

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black font-mono font-black text-lg rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          <RefreshCw className="w-5 h-5" /> {t.playAgain}
        </button>
      </div>
    </div>
  );
};
