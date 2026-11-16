import React, { useState } from 'react';
import { FactionId } from '../types/duel';
import { FACTIONS } from '../data/factions';
import {
  Megaphone,
  Zap,
  Flame,
  Leaf,
  Flower2,
  Sparkles,
  Landmark,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Tv,
  ArrowRight
} from 'lucide-react';

interface FactionSelectScreenProps {
  onSelectFaction: (factionId: FactionId) => void;
}

export const FactionSelectScreen: React.FC<FactionSelectScreenProps> = ({ onSelectFaction }) => {
  const [selected, setSelected] = useState<FactionId>('bloc_central');

  const getFactionIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'Megaphone':
        return <Megaphone className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Leaf':
        return <Leaf className={className} />;
      case 'Flower2':
        return <Flower2 className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Landmark':
        return <Landmark className={className} />;
      case 'TrendingUp':
        return <TrendingUp className={className} />;
      case 'ShieldAlert':
        return <ShieldAlert className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      default:
        return <Flame className={className} />;
    }
  };

  const factionList = Object.values(FACTIONS);
  const currentFaction = FACTIONS[selected];

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Background Studio Lighting */}
      <div className="absolute inset-0 bg-radial-gradient from-blue-900/15 via-slate-950 to-black pointer-events-none" />

      {/* Header bar */}
      <header className="relative z-10 px-4 py-2 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-md">
            <Tv className="w-3.5 h-3.5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-tight text-white uppercase flex items-center gap-1.5">
              POLITICARD <span className="text-[10px] bg-red-600 text-white px-1 py-0.2 rounded font-mono font-bold animate-pulse">DIRECT</span>
            </h1>
          </div>
        </div>
        <span className="text-[10px] font-mono text-amber-400 font-bold uppercase bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded">
          10 Camps • Duel TV
        </span>
      </header>

      {/* Subheader */}
      <div className="relative z-10 px-4 pt-2 pb-1 text-center shrink-0">
        <h2 className="text-xs sm:text-sm font-extrabold text-slate-200">
          Choisissez votre camp sur l’échiquier politique
        </h2>
      </div>

      {/* Grid: 10 Factions */}
      <div className="relative z-10 flex-1 px-3 py-1 overflow-y-auto min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 max-w-6xl mx-auto w-full">
        {factionList.map((faction) => {
          const isSelected = selected === faction.id;
          return (
            <button
              key={faction.id}
              onClick={() => setSelected(faction.id)}
              className={`relative text-left p-2.5 rounded-xl transition-all duration-150 border flex flex-col justify-between group ${
                isSelected
                  ? 'bg-slate-900 border-2 shadow-lg ring-2 ring-offset-1 ring-offset-slate-950'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
              style={{
                borderColor: isSelected ? faction.color : undefined,
                boxShadow: isSelected ? `0 0 16px ${faction.color}33` : undefined,
                ['--tw-ring-color' as any]: isSelected ? faction.color : undefined
              }}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0"
                  style={{ backgroundColor: faction.color }}
                >
                  {getFactionIcon(faction.iconName, 'w-3.5 h-3.5')}
                </div>
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border truncate max-w-[120px]"
                  style={{
                    backgroundColor: `${faction.color}15`,
                    color: faction.color,
                    borderColor: `${faction.color}40`
                  }}
                >
                  {faction.ideology}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors leading-tight">
                  {faction.name}
                </h3>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Tête de liste : <span className="text-slate-200 font-semibold">{faction.candidateName}</span>
                </p>
              </div>

              <div className="my-1 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <p className="text-[10px] italic text-amber-200/90 leading-tight">
                  "{faction.slogan}"
                </p>
              </div>

              <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-mono">8 rôles miroirs</span>
                <span
                  className={`font-bold ${
                    isSelected ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  {isSelected ? '✓ Prêt' : 'Choisir'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Launch Button */}
      <footer className="relative z-10 p-2.5 sm:p-3 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md shrink-0 flex items-center justify-between gap-3 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow"
            style={{ backgroundColor: currentFaction.color }}
          >
            {getFactionIcon(currentFaction.iconName, 'w-4 h-4')}
          </div>
          <div className="truncate">
            <p className="text-xs font-black text-white truncate">{currentFaction.name}</p>
            <p className="text-[10px] text-slate-400 italic truncate">
              "{currentFaction.slogan}"
            </p>
          </div>
        </div>

        <button
          onClick={() => onSelectFaction(selected)}
          className="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 transition-all shadow-md active:scale-95 flex items-center gap-2 shrink-0 border border-amber-300"
        >
          <span>Lancer le Débat</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </footer>
    </div>
  );
};
