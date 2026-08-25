import React, { useEffect, useRef } from 'react';
import type { Settings, Difficulty } from '../types/game';
import { TRANSLATIONS } from '../data/translations';
import { animationService } from '../services/animation';
import { X, Volume2, Globe, Zap, Sliders, Smartphone, Music, Gamepad2, AlignLeft } from 'lucide-react';
import { LetterRainCanvas } from './LetterRainCanvas';

interface SettingsModalProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Partial<Settings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const t = TRANSLATIONS[settings.language];

  const difficultyNames: Record<Difficulty, string> = {
    easy: t.diffEasy,
    medium: t.diffMedium,
    hard: t.diffHard,
    expert: t.diffExpert
  };

  useEffect(() => {
    animationService.animateModalPopup(modalRef.current);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 select-none">
      {/* Gentle ambient letter rain in background */}
      <LetterRainCanvas density={40} speedMultiplier={0.9} />

      <div
        ref={modalRef}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 sm:p-6 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl relative text-white z-10"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-2.5 sm:pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            <h2 className="text-base sm:text-xl font-bold font-mono tracking-wider">{t.settingsTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3.5 sm:gap-5 py-3 sm:py-5">
          {/* Modo de Juego / Game Mode */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-zinc-400 mb-1.5 uppercase font-bold">
              <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" /> {t.gameModeLabel}
            </label>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <button
                onClick={() => onUpdateSettings({ gameMode: 'rhythm' })}
                className={`py-1.5 sm:py-2.5 px-2.5 sm:px-3 rounded-lg sm:rounded-xl font-mono font-bold text-[11px] sm:text-xs border flex items-center justify-center gap-1.5 transition-all ${
                  settings.gameMode === 'rhythm'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                }`}
              >
                <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {t.modeTypeRush}
              </button>

              <button
                onClick={() => onUpdateSettings({ gameMode: 'paragraph' })}
                className={`py-1.5 sm:py-2.5 px-2.5 sm:px-3 rounded-lg sm:rounded-xl font-mono font-bold text-[11px] sm:text-xs border flex items-center justify-center gap-1.5 transition-all ${
                  settings.gameMode === 'paragraph'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                }`}
              >
                <AlignLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {t.modeWordSprint}
              </button>
            </div>
          </div>

          {/* 1. Language Option (Español / English) */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-zinc-400 mb-1.5 uppercase font-bold">
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" /> {t.languageLabel}
            </label>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <button
                onClick={() => onUpdateSettings({ language: 'es' })}
                className={`py-1.5 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl font-mono font-bold text-[11px] sm:text-sm border flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                  settings.language === 'es'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                }`}
              >
                🇪🇸 Español
              </button>
              <button
                onClick={() => onUpdateSettings({ language: 'en' })}
                className={`py-1.5 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl font-mono font-bold text-[11px] sm:text-sm border flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                  settings.language === 'en'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                }`}
              >
                🇺🇸 English
              </button>
            </div>
          </div>

          {/* 2. Difficulty Level */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-zinc-400 mb-1.5 uppercase font-bold">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" /> {t.difficultyLabel}
            </label>
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
              {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => onUpdateSettings({ difficulty: diff })}
                  className={`py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg font-mono font-bold text-[10px] sm:text-xs uppercase border transition-all ${
                    settings.difficulty === diff
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                      : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {difficultyNames[diff]}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Falling Speed Multiplier */}
          <div>
            <div className="flex justify-between text-[11px] sm:text-xs font-mono text-zinc-400 mb-0.5 sm:mb-1">
              <span>{t.speedLabel}</span>
              <span className="text-amber-400 font-bold">{settings.speed}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={settings.speed}
              onChange={(e) => onUpdateSettings({ speed: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 bg-zinc-800 h-1.5 sm:h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* 4. Sound & Audio Volumes */}
          <div className="space-y-2 sm:space-y-3">
            <div>
              <div className="flex justify-between text-[11px] sm:text-xs font-mono text-zinc-400 mb-0.5 sm:mb-1">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-amber-500" /> {t.sfxLabel}
                </span>
                <span className="text-zinc-300 font-bold">{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.sfxVolume}
                onChange={(e) => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 bg-zinc-800 h-1.5 sm:h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] sm:text-xs font-mono text-zinc-400 mb-0.5 sm:mb-1">
                <span className="flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-amber-500" /> {t.musicLabel}
                </span>
                <span className="text-zinc-300 font-bold">{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.musicVolume}
                onChange={(e) => onUpdateSettings({ musicVolume: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 bg-zinc-800 h-1.5 sm:h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* 5. Mobile Virtual Keyboard Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <span className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono text-zinc-300">
              <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" /> {t.touchKeyboardLabel}
            </span>
            <button
              onClick={() => onUpdateSettings({ showMobileKeyboard: !settings.showMobileKeyboard })}
              className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors relative p-0.5 sm:p-1 ${
                settings.showMobileKeyboard ? 'bg-amber-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.showMobileKeyboard ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex justify-center pt-1.5 sm:pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-mono font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:brightness-110 transition-all uppercase tracking-wider inline-flex items-center justify-center active:scale-95"
          >
            {t.saveAndContinue}
          </button>
        </div>
      </div>
    </div>
  );
};
