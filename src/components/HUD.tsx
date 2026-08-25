import React, { useEffect, useRef } from 'react';
import type { GameStats, Settings } from '../types/game';
import { TRANSLATIONS } from '../data/translations';
import { animationService } from '../services/animation';
import { Settings as SettingsIcon, Pause, Play, Globe, RefreshCw, Heart, Zap } from 'lucide-react';

interface HUDProps {
  stats: GameStats;
  settings: Settings;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenSettings: () => void;
  onRestart: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  settings,
  isPaused,
  onTogglePause,
  onOpenSettings,
  onRestart
}) => {
  const comboRef = useRef<HTMLSpanElement | null>(null);
  const t = TRANSLATIONS[settings.language];

  useEffect(() => {
    if (stats.combo > 0) {
      animationService.animateComboPunch(comboRef.current);
    }
  }, [stats.combo, stats.multiplier]);

  return (
    <div className="absolute top-0 left-0 right-0 p-2 sm:p-5 pointer-events-none z-40">
      {/* MOBILE COMPACT TOP HUD (Visible only on <640px screens) */}
      <div className="flex sm:hidden items-center justify-between gap-1 bg-black/90 border border-zinc-800 rounded-2xl px-2.5 py-1.5 backdrop-blur-md shadow-2xl pointer-events-auto">
        {/* Left: Score & Hearts */}
        <div className="flex flex-col items-start min-w-[85px]">
          <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-tight">{t.score}</div>
          <div className="text-base font-black font-mono text-white tracking-tight leading-tight">
            {stats.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span ref={comboRef} className="text-[10px] font-bold font-mono text-amber-500">
              x{stats.multiplier}
            </span>
            <div className="flex items-center gap-0.5">
              {[0, 1, 2].map((idx) => {
                const isLost = idx < (stats.missedWordsCount || 0);
                return (
                  <Heart
                    key={`m-heart-${idx}`}
                    className={`w-3 h-3 transition-all ${
                      isLost ? 'text-zinc-600 fill-zinc-900' : 'text-rose-500 fill-rose-500'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Pause, Restart, Settings */}
        <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-full px-2 py-1">
          <button
            onClick={onTogglePause}
            className="p-1 rounded-full text-zinc-300 hover:text-white active:scale-95"
          >
            {isPaused ? <Play className="w-4 h-4 text-amber-500 fill-amber-500" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={onRestart}
            className="p-1 rounded-full text-zinc-300 hover:text-amber-400 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-1 rounded-full text-zinc-300 hover:text-white active:scale-95"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Level & WPM/Accuracy */}
        <div className="flex flex-col items-end min-w-[85px] text-right">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-mono font-bold">
            <Zap className="w-2.5 h-2.5 fill-amber-400" /> L{stats.level || 1}
          </span>
          <div className="text-sm font-black font-mono text-white leading-tight mt-0.5">
            {stats.accuracy.toFixed(0)}%
          </div>
          <div className="text-[9px] font-mono text-zinc-400">
            {stats.wpm} WPM
          </div>
        </div>
      </div>

      {/* DESKTOP FULL HUD (Visible on >=640px screens) */}
      <div className="hidden sm:flex justify-between items-start w-full">
        {/* Top Left: Score, Combo & Lives Counter */}
        <div className="pointer-events-auto bg-black/85 border border-zinc-800 rounded-xl p-4 shadow-2xl backdrop-blur-md min-w-[190px]">
          <div className="text-xs tracking-widest text-zinc-400 font-mono uppercase">{t.score}</div>
          <div className="text-4xl font-black font-mono text-white tracking-wider my-0.5">
            {stats.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
          </div>

          {/* Combo Multiplier Bar */}
          <div className="flex items-center gap-2 mt-1">
            <span ref={comboRef} className="text-sm font-bold font-mono text-amber-500 inline-block">
              x{stats.multiplier}
            </span>
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-200"
                style={{ width: `${Math.min(100, (stats.combo % 10) * 10)}%` }}
              />
            </div>
          </div>

          {/* 3-Lives Counter System */}
          <div className="flex items-center justify-between gap-1.5 mt-2 pt-2 border-t border-zinc-800/80">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">{t.lives}:</span>
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((idx) => {
                const isLost = idx < (stats.missedWordsCount || 0);
                return (
                  <Heart
                    key={`heart-${idx}`}
                    className={`w-4 h-4 transition-all duration-300 ${
                      isLost ? 'text-zinc-600 fill-zinc-900 scale-90' : 'text-rose-500 fill-rose-500 animate-pulse'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Controls: Pause, Restart & Settings */}
        <div className="pointer-events-auto flex items-center gap-2 bg-black/90 border border-zinc-800 rounded-full px-3.5 py-2 backdrop-blur-md shadow-2xl">
          <button
            onClick={onTogglePause}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
          >
            {isPaused ? <Play className="w-5 h-5 text-amber-500 fill-amber-500" /> : <Pause className="w-5 h-5" />}
          </button>

          <button
            onClick={onRestart}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Language Badge Indicator */}
          <span className="flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase">
            <Globe className="w-3 h-3" />
            {settings.language}
          </span>

          <div className="h-4 w-px bg-zinc-800" />

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Top Right: Level, Speed, Accuracy & WPM */}
        <div className="pointer-events-auto bg-black/85 border border-zinc-800 rounded-xl p-4 shadow-2xl backdrop-blur-md text-right min-w-[200px]">
          {/* Active Level Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold uppercase mb-1">
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
            {t.levelLabel} {stats.level || 1}
          </div>

          <div className="flex items-center justify-end gap-1.5 text-xs font-mono text-zinc-300 font-bold uppercase">
            {t.speed}: {((stats.currentSpeed || 0.7) * 1.2).toFixed(1)}x
          </div>

          {/* Accuracy % */}
          <div className="text-3xl font-black font-mono text-white mt-0.5">
            {stats.accuracy.toFixed(1)} <span className="text-sm font-normal">%</span>
          </div>

          {/* WPM badge */}
          <div className="text-[11px] font-mono text-zinc-400">
            WPM: <span className="text-white font-bold">{stats.wpm}</span>
          </div>

          {/* Level Progress Bar */}
          <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
              style={{
                width: `${
                  stats.completedWordsCount >= 18
                    ? 100
                    : stats.completedWordsCount >= 10
                    ? 66 + ((stats.completedWordsCount - 10) / 8) * 34
                    : stats.completedWordsCount >= 4
                    ? 33 + ((stats.completedWordsCount - 4) / 6) * 33
                    : (stats.completedWordsCount / 4) * 33
                }%`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
