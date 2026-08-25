import React from 'react';
import type { WordItem } from '../types/game';

interface WordStackProps {
  currentWord: WordItem | null;
  upcomingWords: string[];
  hasMobileKeyboard?: boolean;
}

export const WordStack: React.FC<WordStackProps> = ({
  currentWord,
  upcomingWords,
  hasMobileKeyboard = false
}) => {
  if (!currentWord) return null;

  const { text, typedIndex } = currentWord;
  const typedPart = text.slice(0, typedIndex);
  const currentLetter = text[typedIndex] || '';
  const remainingPart = text.slice(typedIndex + 1);

  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-30 select-none pointer-events-none transition-all duration-300 w-full max-w-[95vw] ${
        hasMobileKeyboard ? 'bottom-40 sm:bottom-44' : 'bottom-4 sm:bottom-6'
      }`}
    >
      {/* Active Target Word with Code Editor / Terminal Typography */}
      <div className="relative flex items-center justify-center tracking-wider sm:tracking-[0.25em] text-xl sm:text-3xl md:text-4xl font-['JetBrains_Mono','Fira_Code','Cascadia_Code','Consolas',monospace] font-black py-1 px-2.5 sm:py-1.5 sm:px-4 bg-zinc-950/90 border border-zinc-800/80 rounded-xl sm:rounded-2xl shadow-2xl backdrop-blur-md max-w-full overflow-hidden">
        {/* Console Prompt Symbol */}
        <span className="text-zinc-600 text-sm sm:text-xl font-mono mr-1.5 select-none">&gt;_</span>

        {/* Completed Letters */}
        <span className="text-amber-400 drop-shadow-[0_0_14px_rgba(245,158,11,0.9)]">
          {typedPart}
        </span>

        {/* Current Target Letter with cursor block / underline */}
        {currentLetter && (
          <span className="relative text-white bg-amber-500/20 border-b-2 sm:border-b-4 border-amber-400 px-0.5 rounded-t-sm drop-shadow-[0_0_18px_rgba(255,255,255,1)] animate-pulse">
            {currentLetter}
          </span>
        )}

        {/* Remaining Untyped Letters */}
        <span className="text-zinc-500">
          {remainingPart}
        </span>
      </div>

      {/* Upcoming Queued Words Stack with Console Font */}
      <div className="flex flex-col items-center gap-0.5 mt-1 sm:mt-2 text-zinc-500 font-['JetBrains_Mono','Fira_Code','Consolas',monospace] text-xs sm:text-sm tracking-wider sm:tracking-[0.2em] font-semibold select-none">
        {upcomingWords.slice(0, hasMobileKeyboard ? 1 : 2).map((word, idx) => (
          <div
            key={`${word}-${idx}`}
            className="transition-all duration-300 flex items-center gap-1"
            style={{ opacity: 0.60 - idx * 0.2 }}
          >
            <span className="text-zinc-700 text-[10px] sm:text-xs">$</span> {word}
          </div>
        ))}
      </div>
    </div>
  );
};

