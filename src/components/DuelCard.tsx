import React from 'react';
import { CardDefinition, CardRank } from '../types/duel';
import { FACTIONS } from '../data/factions';
import { Sparkles, Lock } from 'lucide-react';

interface DuelCardProps {
  card: CardDefinition;
  isFaceDown?: boolean;
  isSelected?: boolean;
  isPlayable?: boolean;
  bonusForce?: number;
  isCancelled?: boolean;
  size?: 'grid' | 'arena';
  onClick?: () => void;
  onDoubleClick?: () => void;
}

export const DuelCard: React.FC<DuelCardProps> = ({
  card,
  isFaceDown = false,
  isSelected = false,
  isPlayable = false,
  bonusForce = 0,
  isCancelled = false,
  size = 'grid',
  onClick,
  onDoubleClick
}) => {
  const faction = FACTIONS[card.factionId];

  const getRankBadgeColor = (rank: CardRank) => {
    switch (rank) {
      case 7:
        return 'bg-amber-400 text-slate-950 border-amber-300';
      case 6:
        return 'bg-purple-500 text-white border-purple-400';
      case 5:
        return 'bg-blue-500 text-white border-blue-400';
      case 4:
        return 'bg-emerald-500 text-white border-emerald-400';
      case 3:
        return 'bg-orange-500 text-white border-orange-400';
      case 2:
        return 'bg-rose-500 text-white border-rose-400';
      case 1:
        return 'bg-red-600 text-white border-red-500';
      case 0:
        return 'bg-slate-600 text-slate-200 border-slate-500';
    }
  };

  if (isFaceDown) {
    return (
      <div
        className="w-full h-full min-h-[90px] sm:min-h-[110px] rounded-xl bg-slate-900 border-2 border-slate-700 shadow-xl flex flex-col items-center justify-center select-none overflow-hidden"
      >
        <Lock className="w-5 h-5 text-slate-500 mb-1" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold">
          SECRET
        </span>
      </div>
    );
  }

  const isArena = size === 'arena';

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      onDoubleClick={isPlayable ? onDoubleClick : undefined}
      className={`relative w-full h-full min-h-[92px] sm:min-h-[114px] rounded-xl select-none flex flex-col justify-between p-1.5 sm:p-2 transition-all duration-150 overflow-hidden cursor-pointer ${
        isSelected
          ? 'ring-4 ring-amber-400 scale-[1.02] shadow-2xl -translate-y-1 z-20 bg-slate-850'
          : isPlayable
          ? 'hover:-translate-y-0.5 hover:ring-2 hover:ring-amber-300 active:scale-95 bg-slate-900/90'
          : 'opacity-90 bg-slate-900'
      } ${
        isCancelled ? 'grayscale brightness-75' : ''
      } border-2 shadow-md`}
      style={{
        borderColor: isSelected ? '#FBBF24' : faction.color,
        boxShadow: isSelected ? `0 0 16px rgba(251, 191, 36, 0.45)` : undefined
      }}
    >
      {/* 1. Top row: Big Number + Role Badge */}
      <div className="flex items-center justify-between w-full">
        <div
          className={`flex items-center justify-center font-black rounded-lg border shadow-sm ${getRankBadgeColor(
            card.rank
          )} ${
            isArena
              ? 'w-7 h-7 sm:w-8 sm:h-8 text-base sm:text-lg'
              : 'w-6 h-6 sm:w-7 sm:h-7 text-sm sm:text-base'
          }`}
        >
          {card.rank}
        </div>

        {bonusForce > 0 && (
          <span className="flex items-center gap-0.5 bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full text-[9px] shadow-sm">
            <Sparkles className="w-2.5 h-2.5" />+{bonusForce}
          </span>
        )}

        <span className="text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-wider text-slate-200 bg-slate-800/95 border border-slate-700 px-1.5 py-0.5 rounded truncate max-w-[85px]">
          {card.roleBadge}
        </span>
      </div>

      {/* 2. Middle: Real political figure name */}
      <div className="my-auto text-center px-0.5 py-1">
        <h4
          className={`font-black text-white leading-tight ${
            isArena
              ? 'text-xs sm:text-sm'
              : 'text-[11px] sm:text-xs'
          }`}
        >
          {card.name}
        </h4>
      </div>

      {/* 3. Bottom: Short Power (<= 4 words, high contrast) */}
      <div
        className={`rounded-md px-1 py-0.5 sm:py-1 text-center border ${
          isCancelled
            ? 'bg-red-950/80 border-red-800 text-red-300 text-[8px] sm:text-[9px]'
            : 'bg-slate-950/90 border-slate-800 text-amber-300 text-[8px] sm:text-[9px]'
        }`}
      >
        <p className="font-bold leading-none truncate">
          {isCancelled ? 'Neutralisé' : card.shortPower}
        </p>
      </div>
    </div>
  );
};
