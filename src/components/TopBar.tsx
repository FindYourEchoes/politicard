import React from 'react';
import { GameState, CardRank } from '../types/duel';
import { FACTIONS } from '../data/factions';
import {
  Flame,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

interface TopBarProps {
  state: GameState;
  onOpenRules: () => void;
  onRestart: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  state,
  onOpenRules,
  onRestart
}) => {
  const playerFaction = FACTIONS[state.playerFaction];
  const aiFaction = FACTIONS[state.aiFaction];

  const allRanks: CardRank[] = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <header className="relative z-30 w-full px-2 sm:px-4 py-1.5 bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between shrink-0 select-none">
      {/* 1. Left: Player Score */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-md shrink-0"
          style={{ backgroundColor: playerFaction.color }}
        >
          {playerFaction.shortName.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-white">{playerFaction.shortName}</span>
            <span className="text-[10px] font-mono text-slate-400 font-bold">(Vous)</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-sm border transition-all ${
                  idx < state.playerScore
                    ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'bg-slate-900 border-slate-800'
                }`}
              />
            ))}
            <span className="text-xs font-black font-mono text-amber-400 ml-1">
              {state.playerScore}/4
            </span>
          </div>
        </div>
      </div>

      {/* 2. Center: Pot Indicator & Round */}
      <div className="flex flex-col items-center">
        <div
          className={`px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
            state.pot > 1
              ? 'bg-gradient-to-r from-red-600 to-amber-600 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse'
              : 'bg-slate-900 border-slate-700 text-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-xs font-black font-mono tracking-wide">
            POT : {state.pot} {state.pot > 1 ? 'PTS' : 'PT'}
          </span>
        </div>
        <span className="text-[9px] font-mono text-slate-400 mt-0.5">
          Round {state.currentRound}/8
        </span>
      </div>

      {/* 3. Right: AI with Deduction Pills (0 1 2 3 4 5 6 7) */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 font-bold">(IA)</span>
            <span className="text-xs font-black text-white">{aiFaction.shortName}</span>
            <span className="text-xs font-black font-mono text-amber-400 ml-1">
              {state.aiScore}/4
            </span>
          </div>

          {/* Visual Deduction Tracker: 8 pills */}
          <div className="flex items-center gap-0.5 mt-1" title="Cartes restantes de l'IA">
            {allRanks.map((r) => {
              const isPlayed = state.aiPlayedRanks.includes(r);
              return (
                <div
                  key={r}
                  className={`w-4 h-4 rounded text-[9px] font-mono font-black flex items-center justify-center border transition-all ${
                    isPlayed
                      ? 'bg-slate-950/70 border-slate-900 text-slate-600 line-through opacity-30'
                      : 'bg-slate-800 border-slate-600 text-amber-300 shadow-sm'
                  }`}
                >
                  {r}
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs shadow-md shrink-0"
          style={{ backgroundColor: aiFaction.color }}
        >
          {aiFaction.shortName.slice(0, 2).toUpperCase()}
        </div>

        {/* Small tool buttons */}
        <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
          <button
            onClick={onOpenRules}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Règles"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRestart}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400"
            title="Changer de camp"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
