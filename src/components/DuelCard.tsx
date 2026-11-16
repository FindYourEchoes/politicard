import React, { useState } from 'react';
import { CardDefinition, CardRank } from '../types/duel';
import { FACTIONS } from '../data/factions';
import {
  Crown,
  Zap,
  Eye,
  Shield,
  TrendingDown,
  Flag,
  Bomb,
  Search,
  Sparkles,
  Lock
} from 'lucide-react';

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const faction = FACTIONS[card.factionId];
  const imageSrc = `/cards/${card.factionId}/${card.rank}.png`;

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

  const getRoleIcon = (rank: CardRank) => {
    const iconClass = 'w-3.5 h-3.5 sm:w-4 sm:h-4';
    switch (rank) {
      case 7:
        return <Crown className={`${iconClass} text-amber-400`} />;
      case 6:
        return <Zap className={`${iconClass} text-purple-400`} />;
      case 5:
        return <Eye className={`${iconClass} text-blue-400`} />;
      case 4:
        return <Shield className={`${iconClass} text-emerald-400`} />;
      case 3:
        return <TrendingDown className={`${iconClass} text-orange-400`} />;
      case 2:
        return <Flag className={`${iconClass} text-rose-400`} />;
      case 1:
        return <Bomb className={`${iconClass} text-red-500`} />;
      case 0:
        return <Search className={`${iconClass} text-slate-300`} />;
    }
  };

  if (isFaceDown) {
    return (
      <div className="w-full h-full min-h-[92px] sm:min-h-[114px] rounded-xl bg-slate-900 border-2 border-slate-700 shadow-xl flex flex-col items-center justify-center select-none overflow-hidden">
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
      className={`relative w-full h-full min-h-[92px] sm:min-h-[114px] rounded-xl select-none flex flex-col justify-between transition-all duration-150 overflow-hidden cursor-pointer ${
        isSelected
          ? 'ring-4 ring-amber-400 scale-[1.02] shadow-2xl -translate-y-1 z-20'
          : isPlayable
          ? 'hover:-translate-y-0.5 hover:ring-2 hover:ring-amber-300 active:scale-95'
          : 'opacity-90'
      } ${
        isCancelled ? 'grayscale brightness-75' : ''
      } border-2 shadow-md`}
      style={{
        borderColor: isSelected ? '#FBBF24' : faction.color,
        boxShadow: isSelected ? `0 0 16px rgba(251, 191, 36, 0.45)` : undefined
      }}
    >
      {/* Background: Full-Art Caricature Image OR Fallback Gradient */}
      {!imageError && (
        <img
          src={imageSrc}
          alt={card.name}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Fallback Graphic (when image is not loaded / missing) */}
      {(!imageLoaded || imageError) && (
        <div
          className="absolute inset-0 w-full h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex items-center justify-center pointer-events-none"
        >
          <div
            className="w-20 h-20 rounded-full opacity-15 blur-sm"
            style={{ backgroundColor: faction.color }}
          />
          <span className="absolute font-black text-4xl sm:text-5xl text-white/5 font-mono select-none">
            {faction.shortName}
          </span>
        </div>
      )}

      {/* 1. Top row: Big Number + Role Icon (No overflowing text!) */}
      <div className="relative z-10 flex items-center justify-between w-full p-1.5 sm:p-2">
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

        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-950/85 border border-slate-700/80 flex items-center justify-center shadow-xs">
          {getRoleIcon(card.rank)}
        </div>
      </div>

      {/* 2. Bottom Plate: Semi-transparent full-width box with Name + 2-3 words Power */}
      <div className="relative z-10 w-full bg-slate-950/85 backdrop-blur-xs border-t border-slate-800/80 px-1 py-1 sm:py-1.5 text-center flex flex-col justify-end">
        <h4
          className={`font-black text-white leading-tight ${
            isArena ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'
          }`}
        >
          {card.name}
        </h4>
        <p className="text-[8px] sm:text-[9px] text-amber-300 font-semibold leading-tight mt-0.5">
          {isCancelled ? 'Pouvoir neutralisé' : card.shortPower}
        </p>
      </div>
    </div>
  );
};
