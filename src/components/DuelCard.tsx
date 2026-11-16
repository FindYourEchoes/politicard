import React from 'react';
import { CardDefinition, CardRank } from '../types/duel';
import { FACTIONS } from '../data/factions';
import {
  Crown,
  Zap,
  Eye,
  Shield,
  TrendingDown,
  Flag,
  AlertOctagon,
  HelpCircle,
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

  const getRankIcon = (rank: CardRank, className = 'w-4 h-4') => {
    switch (rank) {
      case 7:
        return <Crown className={className} />;
      case 6:
        return <Zap className={className} />;
      case 5:
        return <Eye className={className} />;
      case 4:
        return <Shield className={className} />;
      case 3:
        return <TrendingDown className={className} />;
      case 2:
        return <Flag className={className} />;
      case 1:
        return <AlertOctagon className={className} />;
      case 0:
        return <HelpCircle className={className} />;
    }
  };

  const getRankBadgeColor = (rank: CardRank) => {
    switch (rank) {
      case 7:
        return 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 border-amber-300';
      case 6:
        return 'bg-gradient-to-br from-purple-500 to-indigo-700 text-white border-purple-400';
      case 5:
        return 'bg-gradient-to-br from-blue-500 to-cyan-700 text-white border-blue-400';
      case 4:
        return 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white border-emerald-400';
      case 3:
        return 'bg-gradient-to-br from-orange-500 to-amber-700 text-white border-orange-400';
      case 2:
        return 'bg-gradient-to-br from-rose-500 to-red-700 text-white border-rose-400';
      case 1:
        return 'bg-gradient-to-br from-red-600 to-black text-white border-red-500';
      case 0:
        return 'bg-gradient-to-br from-slate-600 to-zinc-800 text-slate-200 border-slate-500';
    }
  };

  // Face-down card design
  if (isFaceDown) {
    const sizeClasses = {
      sm: 'w-16 h-24 text-[10px]',
      md: 'w-24 h-36 sm:w-28 sm:h-40 text-xs',
      lg: 'w-36 h-52 sm:w-44 sm:h-64 text-sm'
    }[size];

    return (
      <div
        className={`relative ${sizeClasses} rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border-2 border-slate-700 shadow-xl flex flex-col items-center justify-center select-none overflow-hidden`}
      >
        <div className="absolute inset-1 rounded-lg border border-dashed border-slate-600/50 flex flex-col items-center justify-center p-2 text-center bg-slate-900/40">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-1 border border-slate-700">
            <Lock className="w-4 h-4" />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold">
            CONFIDENTIEL
          </span>
          <span className="text-[8px] text-slate-500 mt-0.5">DÉBAT TV</span>
        </div>
      </div>
    );
  }

  // Sizing definitions
  const containerClasses = {
    sm: 'w-[78px] h-[116px] text-[10px] p-1.5',
    md: 'w-[104px] sm:w-[124px] h-[155px] sm:h-[185px] text-xs p-2',
    lg: 'w-[140px] sm:w-[170px] h-[210px] sm:h-[250px] text-sm p-3'
  }[size];


  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={`relative ${containerClasses} rounded-xl select-none flex flex-col justify-between transition-all duration-200 overflow-hidden cursor-pointer ${
        isSelected
          ? 'ring-4 ring-amber-400 scale-105 shadow-2xl -translate-y-2 z-20'
          : isPlayable
          ? 'hover:-translate-y-1.5 hover:shadow-xl hover:ring-2 hover:ring-amber-300 active:scale-95'
          : 'opacity-90'
      } ${
        isCancelled ? 'grayscale brightness-75' : ''
      } bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 shadow-lg`}
      style={{
        borderColor: isSelected ? '#FBBF24' : faction.color,
        boxShadow: isSelected ? `0 0 20px rgba(251, 191, 36, 0.5)` : undefined
      }}
    >
      {/* Top Bar: Big Rank Number + Role Icon */}
      <div className="flex items-center justify-between w-full relative z-10">
        <div
          className={`flex items-center justify-center font-black rounded-lg border shadow-sm ${getRankBadgeColor(
            card.rank
          )} ${
            size === 'sm'
              ? 'w-6 h-6 text-sm'
              : size === 'md'
              ? 'w-7 h-7 sm:w-8 sm:h-8 text-base sm:text-lg'
              : 'w-9 h-9 sm:w-11 sm:h-11 text-xl sm:text-2xl'
          }`}
        >
          {card.rank}
        </div>

        {/* Bonus indicator if active */}
        {bonusForce > 0 && (
          <span className="flex items-center gap-0.5 bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full text-[10px] shadow-md animate-bounce">
            <Sparkles className="w-2.5 h-2.5" />+{bonusForce}
          </span>
        )}

        <div
          className="rounded-md p-1 text-slate-300 bg-slate-800/80 border border-slate-700/60"
          title={card.roleTitle}
        >
          {getRankIcon(card.rank, size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')}
        </div>
      </div>

      {/* Middle: Satirical Character Name & Role Title */}
      <div className="relative z-10 my-0.5 sm:my-1 text-center">
        <p className="font-mono text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 font-bold truncate">
          {card.roleTitle}
        </p>
        <h4
          className={`font-black text-slate-100 leading-tight truncate ${
            size === 'sm' ? 'text-[9px]' : size === 'md' ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'
          }`}
        >
          {card.name}
        </h4>
      </div>

      {/* Bottom Power Box */}
      {showDetails && (
        <div
          className={`relative z-10 rounded-lg p-1 text-[8px] sm:text-[9px] leading-tight border transition-colors ${
            isCancelled
              ? 'bg-red-950/40 border-red-800/60 text-red-300'
              : 'bg-slate-950/80 border-slate-800 text-slate-200'
          }`}
        >
          {isCancelled ? (
            <p className="font-bold line-through text-red-400">Pouvoir neutralisé par Spin Doctor</p>
          ) : (
            <p className="line-clamp-2 font-medium">{card.shortPower}</p>
          )}
        </div>
      )}

      {/* Background faction watermark accent */}
      <div
        className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full opacity-10 pointer-events-none"
        style={{ backgroundColor: faction.color }}
      />
    </div>
  );
};
