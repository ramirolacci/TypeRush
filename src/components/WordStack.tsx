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
      className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center z-30 select-none pointer-events-none transition-all duration-300 ${
        hasMobileKeyboard ? 'bottom-36 sm:bottom-40' : 'bottom-4 sm:bottom-6'
      }`}
    >
      {/* Active Target Word */}
      <div className="relative flex items-center justify-center tracking-[0.3em] text-3xl sm:text-4xl md:text-5xl font-mono font-black py-1">
        {/* Completed Letters */}
        <span className="text-amber-400 drop-shadow-[0_0_14px_rgba(245,158,11,0.9)]">
          {typedPart}
        </span>

        {/* Current Target Letter with cursor underline */}
        {currentLetter && (
          <span className="relative text-white border-b-4 border-amber-400 px-0.5 py-0.5 drop-shadow-[0_0_18px_rgba(255,255,255,1)]">
            {currentLetter}
          </span>
        )}

        {/* Remaining Untyped Letters */}
        <span className="text-zinc-500">
          {remainingPart}
        </span>
      </div>

      {/* Upcoming Queued Words Stack */}
      <div className="flex flex-col items-center gap-1 mt-1 text-zinc-400 font-mono text-base sm:text-lg tracking-[0.25em] font-semibold select-none">
        {upcomingWords.slice(0, 3).map((word, idx) => (
          <div
            key={`${word}-${idx}`}
            className="transition-all duration-300"
            style={{ opacity: 0.65 - idx * 0.18 }}
          >
            {word}
          </div>
        ))}
      </div>
    </div>
  );
};

