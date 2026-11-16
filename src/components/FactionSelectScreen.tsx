import React, { useState } from 'react';
import { FactionId } from '../types/duel';
import { FACTIONS } from '../data/factions';
import {
  Megaphone,
  Zap,
  Flower2,
  Sparkles,
  Landmark,
  ShieldAlert,
  Tv,
  ArrowRight,
  Flame
} from 'lucide-react';

interface FactionSelectScreenProps {
  onSelectFaction: (factionId: FactionId) => void;
}

export const FactionSelectScreen: React.FC<FactionSelectScreenProps> = ({ onSelectFaction }) => {
  const [selected, setSelected] = useState<FactionId>('bloc_central');

  const getFactionIcon = (iconName: string, className = 'w-6 h-6') => {
    switch (iconName) {
      case 'Megaphone':
        return <Megaphone className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Flower2':
        return <Flower2 className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Landmark':
        return <Landmark className={className} />;
      case 'ShieldAlert':
        return <ShieldAlert className={className} />;
      default:
        return <Flame className={className} />;
    }
  };

  const factionList = Object.values(FACTIONS);
  const currentFaction = FACTIONS[selected];

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Background TV studio lighting & subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header bar */}
      <header className="relative z-10 px-4 py-2 sm:py-3 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-lg shadow-red-600/30">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
              POLITICARD <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded font-mono font-bold animate-pulse">EN DIRECT</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Grand Débat Présidentiel • Duel Télévisé</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-mono text-amber-400 font-semibold uppercase bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded">
            1 Arène • 8 Cartes Miroirs
          </span>
        </div>
      </header>

      {/* Subheader Title */}
      <div className="relative z-10 px-4 pt-2 pb-1 text-center shrink-0">
        <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Étape 1 sur 2 : Choisissez votre écurie politique
        </p>
        <h2 className="text-sm sm:text-base font-extrabold text-slate-100">
          Quel camp défendrez-vous sur le plateau ?
        </h2>
      </div>

      {/* Main Grid: 6 Factions */}
      <div className="relative z-10 flex-1 px-3 sm:px-6 py-1 overflow-y-auto min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-w-5xl mx-auto w-full">
        {factionList.map((faction) => {
          const isSelected = selected === faction.id;
          return (
            <button
              key={faction.id}
              onClick={() => setSelected(faction.id)}
              className={`relative text-left p-3 rounded-xl transition-all duration-200 border flex flex-col justify-between group overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-2 shadow-xl ring-2 ring-offset-1 ring-offset-slate-950'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
              style={{
                borderColor: isSelected ? faction.color : undefined,
                boxShadow: isSelected ? `0 0 20px ${faction.color}33` : undefined,
                ['--tw-ring-color' as any]: isSelected ? faction.color : undefined
              }}
            >
              {/* Top accent badge */}
              <div className="flex items-center justify-between w-full mb-1">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: faction.color }}
                >
                  {getFactionIcon(faction.iconName, 'w-4 h-4')}
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: `${faction.color}15`,
                    color: faction.color,
                    borderColor: `${faction.color}40`
                  }}
                >
                  {faction.ideology}
                </span>
              </div>

              {/* Faction Name & Candidate */}
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors">
                  {faction.name}
                </h3>
                <p className="text-[11px] font-mono text-slate-400">
                  Tête de liste : <span className="text-slate-200 font-semibold">{faction.candidateName}</span>
                </p>
              </div>

              {/* Slogan */}
              <div className="my-1.5 p-2 rounded-lg bg-slate-950/50 border border-slate-800/70">
                <p className="text-[11px] italic text-amber-200/90 leading-tight">
                  "{faction.slogan}"
                </p>
              </div>

              {/* Description */}
              <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {faction.description}
              </p>

              {/* Radio check icon */}
              <div className="mt-2 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-[10px] text-slate-500 font-mono">8 cartes miroirs équitables</span>
                <span
                  className={`font-bold transition-transform flex items-center gap-1 ${
                    isSelected ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                >
                  {isSelected ? '✓ Sélectionné' : 'Choisir'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Sticky Action Footer */}
      <footer className="relative z-10 p-3 sm:p-4 border-t border-slate-800/80 bg-slate-900/95 backdrop-blur-md shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg"
            style={{ backgroundColor: currentFaction.color }}
          >
            {getFactionIcon(currentFaction.iconName, 'w-5 h-5')}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 font-mono leading-none">Votre camp sélectionné :</p>
            <p className="text-sm font-black text-white truncate">{currentFaction.name}</p>
            <p className="text-[11px] text-slate-400 italic truncate leading-none mt-0.5">
              "{currentFaction.slogan}"
            </p>
          </div>
        </div>

        <button
          onClick={() => onSelectFaction(selected)}
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2 border border-amber-300"
        >
          <span>Entrer sur le Plateau TV</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </footer>
    </div>
  );
};
