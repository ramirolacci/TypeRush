import React from 'react';
import type { WordItem } from '../types/game';

interface WordStackProps {
  currentWord: WordItem | null;
  upcomingWords: string[];
}

export const WordStack: React.FC<WordStackProps> = ({ currentWord, upcomingWords }) => {
  if (!currentWord) return null;

  const { text, typedIndex } = currentWord;
  const typedPart = text.slice(0, typedIndex);
  const currentLetter = text[typedIndex] || '';
  const remainingPart = text.slice(typedIndex + 1);

  return (
    <div className="w-full flex flex-col items-center justify-center py-4 bg-zinc-950 border-t-2 border-zinc-800 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] z-30 select-none">
      {/* Active Target Word */}
      <div className="relative flex items-center justify-center tracking-[0.3em] text-3xl sm:text-4xl md:text-5xl font-mono font-black py-2">
        {/* Completed Letters */}
        <span className="text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]">
          {typedPart}
        </span>

        {/* Current Target Letter with cursor underline */}
        {currentLetter && (
          <span className="relative text-white bg-amber-500/30 px-2 py-0.5 rounded border-b-4 border-amber-400 animate-pulse drop-shadow-[0_0_16px_rgba(255,255,255,1)]">
            {currentLetter}
          </span>
        )}

        {/* Remaining Untyped Letters */}
        <span className="text-zinc-500">
          {remainingPart}
        </span>
      </div>

      {/* Upcoming Queued Words Stack */}
      <div className="flex flex-col items-center gap-1.5 mt-2 text-zinc-400 font-mono text-base sm:text-lg tracking-[0.25em] font-semibold select-none">
        {upcomingWords.slice(0, 3).map((word, idx) => (
          <div
            key={`${word}-${idx}`}
            className="transition-all duration-300 transform hover:scale-105"
            style={{ opacity: 0.85 - idx * 0.25 }}
          >
            {word}
          </div>
        ))}
      </div>
    </div>
  );
};
