import React, { useEffect, useRef } from 'react';
import type { Settings, Difficulty } from '../types/game';
import { TRANSLATIONS } from '../data/translations';
import { animationService } from '../services/animation';
import { X, Volume2, Globe, Zap, Sliders, Smartphone, Music, Gamepad2, AlignLeft } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div ref={modalRef} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-white">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold font-mono tracking-wider">{t.settingsTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 py-5">
          {/* Modo de Juego / Game Mode */}
          <div>
            <label className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2 uppercase">
              <Gamepad2 className="w-4 h-4 text-amber-500" /> {t.gameModeLabel}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ gameMode: 'rhythm' })}
                className={`py-2.5 px-3 rounded-xl font-mono font-bold text-xs border flex items-center justify-center gap-1.5 transition-all ${
                  settings.gameMode === 'rhythm'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> ⚡ {t.modeTypeRush}
              </button>

              <button
                onClick={() => onUpdateSettings({ gameMode: 'paragraph' })}
                className={`py-2.5 px-3 rounded-xl font-mono font-bold text-xs border flex items-center justify-center gap-1.5 transition-all ${
                  settings.gameMode === 'paragraph'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" /> ⏱️ {t.modeWordSprint}
              </button>
            </div>
          </div>

          {/* 1. Language Option (Español / English) */}
          <div>
            <label className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2 uppercase">
              <Globe className="w-4 h-4 text-amber-500" /> {t.languageLabel}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ language: 'es' })}
                className={`py-2.5 px-4 rounded-xl font-mono font-bold text-sm border flex items-center justify-center gap-2 transition-all ${
                  settings.language === 'es'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                }`}
              >
                🇪🇸 Español
              </button>
              <button
                onClick={() => onUpdateSettings({ language: 'en' })}
                className={`py-2.5 px-4 rounded-xl font-mono font-bold text-sm border flex items-center justify-center gap-2 transition-all ${
                  settings.language === 'en'
                    ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                }`}
              >
                🇺🇸 English
              </button>
            </div>
          </div>

          {/* 2. Difficulty Level */}
          <div>
            <label className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-2 uppercase">
              <Zap className="w-4 h-4 text-amber-500" /> {t.difficultyLabel}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => onUpdateSettings({ difficulty: diff })}
                  className={`py-2 px-2 rounded-lg font-mono font-bold text-xs uppercase border transition-all ${
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
            <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
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
              className="w-full accent-amber-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* 4. Sound & Audio Volumes */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
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
                className="w-full accent-amber-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1">
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
                className="w-full accent-amber-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* 5. Mobile Virtual Keyboard Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <span className="flex items-center gap-2 text-xs font-mono text-zinc-300">
              <Smartphone className="w-4 h-4 text-amber-500" /> {t.touchKeyboardLabel}
            </span>
            <button
              onClick={() => onUpdateSettings({ showMobileKeyboard: !settings.showMobileKeyboard })}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                settings.showMobileKeyboard ? 'bg-amber-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.showMobileKeyboard ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-mono font-bold rounded-xl shadow-lg hover:brightness-110 transition-all uppercase tracking-wider mt-2"
        >
          {t.saveAndContinue}
        </button>
      </div>
    </div>
  );
};
