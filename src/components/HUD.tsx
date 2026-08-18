import React from 'react';
import type { GameStats, Settings } from '../types/game';
import { Settings as SettingsIcon, Pause, Play, Globe } from 'lucide-react';

interface HUDProps {
  stats: GameStats;
  settings: Settings;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenSettings: () => void;
  trackName?: string;
  progressPercent?: number;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  settings,
  isPaused,
  onTogglePause,
  onOpenSettings,
  trackName = "TypeRush Rhythm Flow",
  progressPercent = 0
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-3 sm:p-5 flex justify-between items-start pointer-events-none z-20">
      {/* Top Left: Score & Combo Multiplier Card */}
      <div className="pointer-events-auto bg-black/80 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-xl backdrop-blur-md min-w-[140px] sm:min-w-[180px]">
        <div className="text-[10px] sm:text-xs tracking-widest text-zinc-400 font-mono uppercase">SCORE</div>
        <div className="text-2xl sm:text-4xl font-black font-mono text-white tracking-wider my-1">
          {stats.score.toLocaleString()}
        </div>

        {/* Combo Multiplier Bar */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs sm:text-sm font-bold font-mono text-amber-500">
            x{stats.multiplier}
          </span>
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-200"
              style={{ width: `${Math.min(100, (stats.combo % 10) * 10)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Center Controls: Pause & Quick Settings */}
      <div className="pointer-events-auto flex items-center gap-2 bg-black/80 border border-zinc-800/90 rounded-full px-3 py-1.5 backdrop-blur-md shadow-lg">
        <button
          onClick={onTogglePause}
          className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
          title={isPaused ? "Resume" : "Pause"}
        >
          {isPaused ? <Play className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-500" /> : <Pause className="w-4 h-4 sm:w-5 sm:h-5" />}
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
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Top Right: Track Info, Accuracy & WPM */}
      <div className="pointer-events-auto bg-black/80 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-xl backdrop-blur-md text-right min-w-[150px] sm:min-w-[200px]">
        <div className="text-[10px] sm:text-xs font-mono text-zinc-300 font-semibold truncate max-w-[160px] sm:max-w-[220px]">
          {trackName}
        </div>
        <div className="text-[10px] sm:text-xs font-mono uppercase text-amber-500 font-bold">
          {settings.difficulty} MODE
        </div>

        {/* Accuracy % */}
        <div className="text-xl sm:text-3xl font-black font-mono text-white mt-1">
          {stats.accuracy.toFixed(1)} <span className="text-sm font-normal">%</span>
        </div>

        {/* WPM badge */}
        <div className="text-[11px] font-mono text-zinc-400">
          WPM: <span className="text-white font-bold">{stats.wpm}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
