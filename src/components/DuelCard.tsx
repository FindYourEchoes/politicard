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
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  showDetails?: boolean;
}

export const DuelCard: React.FC<DuelCardProps> = ({
  card,
  isFaceDown = false,
  isSelected = false,
  isPlayable = false,
  bonusForce = 0,
  isCancelled = false,
  size = 'md',
  onClick,
  showDetails = true
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
    const sizeClasses = {
      sm: 'w-[74px] h-[108px]',
      md: 'w-[100px] h-[142px]',
      lg: 'w-[130px] h-[185px]'
    }[size];

    return (
      <div
        className={`relative ${sizeClasses} rounded-xl bg-slate-900 border-2 border-slate-700 shadow-xl flex flex-col items-center justify-center select-none overflow-hidden`}
      >
        <Lock className="w-4 h-4 text-slate-500 mb-1" />
        <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold">
          SECRET
        </span>
      </div>
    );
  }

  const containerClasses = {
    sm: 'w-[76px] h-[110px] p-1.5',
    md: 'w-[102px] sm:w-[118px] h-[148px] sm:h-[170px] p-2',
    lg: 'w-[130px] sm:w-[155px] h-[190px] sm:h-[225px] p-2.5'
  }[size];

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={`relative ${containerClasses} rounded-xl select-none flex flex-col justify-between transition-all duration-150 overflow-hidden cursor-pointer ${
        isSelected
          ? 'ring-4 ring-amber-400 scale-105 shadow-2xl -translate-y-2 z-20'
          : isPlayable
          ? 'hover:-translate-y-1 hover:ring-2 hover:ring-amber-300 active:scale-95'
          : 'opacity-90'
      } ${
        isCancelled ? 'grayscale brightness-75' : ''
      } bg-slate-900 border-2 shadow-lg`}
      style={{
        borderColor: isSelected ? '#FBBF24' : faction.color,
        boxShadow: isSelected ? `0 0 16px rgba(251, 191, 36, 0.4)` : undefined
      }}
    >
      {/* 1. Top row: Big Number + Role Badge */}
      <div className="flex items-center justify-between w-full">
        <div
          className={`flex items-center justify-center font-black rounded-lg border shadow-sm ${getRankBadgeColor(
            card.rank
          )} ${
            size === 'sm'
              ? 'w-6 h-6 text-sm'
              : size === 'md'
              ? 'w-7 h-7 sm:w-8 sm:h-8 text-base sm:text-lg'
              : 'w-8 h-8 sm:w-10 sm:h-10 text-xl'
          }`}
        >
          {card.rank}
        </div>

        {bonusForce > 0 && (
          <span className="flex items-center gap-0.5 bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full text-[9px]">
            <Sparkles className="w-2.5 h-2.5" />+{bonusForce}
          </span>
        )}

        <span className="text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-wider text-slate-300 bg-slate-800/90 border border-slate-700 px-1 py-0.5 rounded">
          {card.roleBadge}
        </span>
      </div>

      {/* 2. Middle: Short satirical name */}
      <div className="my-auto text-center px-0.5">
        <h4
          className={`font-black text-white leading-tight ${
            size === 'sm' ? 'text-[9px]' : size === 'md' ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'
          }`}
        >
          {card.name}
        </h4>
      </div>

      {/* 3. Bottom: Short Power (4 words max) */}
      {showDetails && (
        <div
          className={`rounded-lg p-1 text-center border ${
            isCancelled
              ? 'bg-red-950/60 border-red-800 text-red-300 text-[8px]'
              : 'bg-slate-950/90 border-slate-800 text-amber-200/90 text-[8px] sm:text-[9px]'
          }`}
        >
          <p className="font-bold leading-tight">
            {isCancelled ? 'Pouvoir neutralisé' : card.shortPower}
          </p>
        </div>
      )}
    </div>
  );
};
