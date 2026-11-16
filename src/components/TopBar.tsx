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
    <header className="relative z-30 w-full px-2 sm:px-3 py-1 bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md flex flex-col gap-1 shrink-0 select-none">
      {/* Top Row: Player - Pot - AI */}
      <div className="flex items-center justify-between w-full">
        {/* 1. Left: Player */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center font-black text-white text-[10px] sm:text-xs shadow shrink-0"
            style={{ backgroundColor: playerFaction.color }}
          >
            {playerFaction.shortName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-black text-white truncate max-w-[80px] sm:max-w-[120px]">
              {playerFaction.shortName}
            </span>
            <div className="flex gap-0.5 ml-1">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs border ${
                    idx < state.playerScore
                      ? 'bg-amber-400 border-amber-300 shadow-xs'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-black font-mono text-amber-400">
              {state.playerScore}
            </span>
          </div>
        </div>

        {/* 2. Center: Pot */}
        <div
          className={`px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${
            state.pot > 1
              ? 'bg-gradient-to-r from-red-600 to-amber-600 border-amber-400 shadow-sm animate-pulse'
              : 'bg-slate-900 border-slate-700 text-slate-200'
          }`}
        >
          <Flame className="w-3 h-3 text-amber-300" />
          <span className="text-[11px] font-black font-mono">
            POT : {state.pot} {state.pot > 1 ? 'PTS' : 'PT'}
          </span>
        </div>

        {/* 3. Right: AI & Actions */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-black font-mono text-amber-400">
              {state.aiScore}
            </span>
            <div className="flex gap-0.5 mr-1">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs border ${
                    idx < state.aiScore
                      ? 'bg-amber-400 border-amber-300 shadow-xs'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-black text-white truncate max-w-[80px] sm:max-w-[120px]">
              {aiFaction.shortName}
            </span>
          </div>
          <div
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center font-black text-white text-[10px] sm:text-xs shadow shrink-0"
            style={{ backgroundColor: aiFaction.color }}
          >
            {aiFaction.shortName.slice(0, 2).toUpperCase()}
          </div>

          <button
            onClick={onOpenRules}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Règles"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRestart}
            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400"
            title="Changer de camp"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Round tracker & AI 8 Deduction Pills (Always 100% visible, no clipping!) */}
      <div className="flex items-center justify-between px-1 text-[10px] font-mono text-slate-400 border-t border-slate-800/60 pt-0.5">
        <span className="font-bold">Round {state.currentRound}/8</span>

        <div className="flex items-center gap-1">
          <span className="text-[9px] uppercase font-bold text-slate-400">Cartes IA :</span>
          <div className="flex items-center gap-0.5">
            {allRanks.map((r) => {
              const isPlayed = state.aiPlayedRanks.includes(r);
              return (
                <div
                  key={r}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded text-[9px] font-black flex items-center justify-center border transition-all ${
                    isPlayed
                      ? 'bg-slate-950/80 border-slate-900 text-slate-600 line-through opacity-30'
                      : 'bg-slate-800 border-slate-600 text-amber-300 shadow-xs'
                  }`}
                >
                  {r}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
