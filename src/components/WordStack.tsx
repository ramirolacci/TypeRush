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
    <div className="w-full flex flex-col items-center justify-center py-4 bg-zinc-950/90 border-t border-zinc-800/80 shadow-2xl backdrop-blur-md z-10">
      {/* Active Target Word */}
      <div className="relative flex items-center justify-center tracking-[0.25em] text-2xl sm:text-3xl md:text-4xl font-mono font-bold py-1 select-none">
        {/* Completed Letters */}
        <span className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
          {typedPart}
        </span>

        {/* Current Target Letter with animated cursor underline */}
        {currentLetter && (
          <span className="relative text-white bg-amber-500/20 px-1 rounded border-b-4 border-amber-400 animate-pulse drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]">
            {currentLetter}
          </span>
        )}

        {/* Remaining Untyped Letters */}
        <span className="text-zinc-500">
          {remainingPart}
        </span>
      </div>

      {/* Upcoming Queued Words Stack (Just like screenshot) */}
      <div className="flex flex-col items-center gap-1 mt-2 text-zinc-500 font-mono text-sm sm:text-base tracking-widest opacity-75 select-none">
        {upcomingWords.slice(0, 3).map((word, idx) => (
          <div
            key={`${word}-${idx}`}
            className="transition-all duration-300 transform hover:scale-105"
            style={{ opacity: 1 - idx * 0.25 }}
          >
            {word}
          </div>
        ))}
      </div>
    </div>
  );
};
