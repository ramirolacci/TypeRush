import React from 'react';
import { TRANSLATIONS } from '../data/translations';

interface MobileKeyboardProps {
  targetChar: string | null;
  onKeyPress: (char: string) => void;
  language: 'en' | 'es';
}

const KEYBOARD_ROWS_EN = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

const KEYBOARD_ROWS_ES = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

export const MobileKeyboard: React.FC<MobileKeyboardProps> = ({
  targetChar,
  onKeyPress,
  language
}) => {
  const rows = language === 'es' ? KEYBOARD_ROWS_ES : KEYBOARD_ROWS_EN;
  const activeChar = targetChar?.toLowerCase() || null;
  const t = TRANSLATIONS[language];

  return (
    <div className="w-full bg-zinc-950/95 border-t border-zinc-800 p-1.5 sm:p-2.5 select-none z-40 pb-safe touch-manipulation">
      <div className="flex flex-col gap-1 max-w-lg mx-auto">
        {rows.map((row, rIdx) => (
          <div key={`row-${rIdx}`} className="flex justify-center gap-0.5 sm:gap-1">
            {row.map((key) => {
              const isTarget = activeChar === key;
              return (
                <button
                  key={key}
                  onClick={() => onKeyPress(key)}
                  className={`
                    flex-1 max-w-[34px] sm:max-w-[42px] h-10 sm:h-12 rounded-md sm:rounded-lg font-mono text-xs sm:text-base font-bold
                    flex items-center justify-center transition-all duration-100 active:scale-95 shadow-md touch-manipulation
                    ${isTarget
                      ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-amber-500/50 shadow-lg border-2 border-amber-300 animate-pulse'
                      : 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60'
                    }
                  `}
                >
                  {key.toUpperCase()}
                </button>
              );
            })}
          </div>
        ))}
        {/* Extra Bottom Row: Spacebar & Backspace */}
        <div className="flex justify-center gap-1.5 pt-0.5">
          <button
            onClick={() => onKeyPress(' ')}
            className="flex-2 h-10 px-4 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 rounded-md sm:rounded-lg font-mono text-xs font-bold border border-zinc-700 flex items-center justify-center touch-manipulation active:scale-95"
          >
            {t.spaceKey}
          </button>
          <button
            onClick={() => onKeyPress('Backspace')}
            className="flex-1 max-w-[100px] h-10 px-3 bg-rose-950/80 hover:bg-rose-900/80 text-rose-300 rounded-md sm:rounded-lg font-mono text-xs font-bold border border-rose-800 flex items-center justify-center touch-manipulation active:scale-95"
          >
            ⌫ {t.backspaceKey}
          </button>
        </div>
      </div>
    </div>
  );
};
