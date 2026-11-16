import React from 'react';
import { GameState, CardRank } from '../types/duel';
import { FACTIONS } from '../data/factions';
import {
  Flame,
  HelpCircle,
  RotateCcw,
  Eye
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
  const isRevealed = state.aiHandRevealed;

  return (
    <header className="relative z-30 w-full px-2 sm:px-3 py-1.5 bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md flex flex-col gap-1.5 shrink-0 select-none">
      {/* 1. Top Row: Player Score — Pot Médiatique — AI Score */}
      <div className="flex items-center justify-between w-full">
        {/* Left: Player Profile */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center font-black text-white text-[10px] sm:text-xs shadow shrink-0"
            style={{ backgroundColor: playerFaction.color }}
          >
            {playerFaction.shortName.slice(0, 3)}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-black text-white font-mono uppercase">
              {playerFaction.shortName}
            </span>
            <div className="flex gap-0.5 ml-1">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs border transition-all ${
                    idx < state.playerScore
                      ? 'bg-amber-400 border-amber-300 shadow-xs'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-black font-mono text-amber-400 ml-0.5">
              {state.playerScore}
            </span>
          </div>
        </div>

        {/* Center: Pot Indicator */}
        <div
          className={`px-2.5 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${
            state.pot > 1
              ? 'bg-gradient-to-r from-red-600 to-amber-600 border-amber-400 shadow-sm animate-pulse'
              : 'bg-slate-900 border-slate-700 text-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[11px] font-black font-mono tracking-wide">
            POT : {state.pot} {state.pot > 1 ? 'PTS' : 'PT'}
          </span>
        </div>

        {/* Right: AI Profile & Action buttons */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-black font-mono text-amber-400 mr-0.5">
              {state.aiScore}
            </span>
            <div className="flex gap-0.5 mr-1">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs border transition-all ${
                    idx < state.aiScore
                      ? 'bg-amber-400 border-amber-300 shadow-xs'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-black text-white font-mono uppercase">
              {aiFaction.shortName}
            </span>
          </div>
          <div
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-md flex items-center justify-center font-black text-white text-[10px] sm:text-xs shadow shrink-0"
            style={{ backgroundColor: aiFaction.color }}
          >
            {aiFaction.shortName.slice(0, 3)}
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

      {/* 2. Bottom Row: Round tracker & AI 8 Deduction Pills */}
      <div className="flex items-center justify-between px-1 text-[10px] font-mono text-slate-400 border-t border-slate-800/60 pt-1">
        <span className="font-bold">Round {state.currentRound}/8</span>

        <div className="flex items-center gap-1.5">
          {/* Espionnage Badge if active */}
          {isRevealed ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 font-black text-[9px] animate-pulse">
              <Eye className="w-3 h-3 text-emerald-400" />
              MAIN IA RÉVÉLÉE
            </span>
          ) : (
            <span className="text-[9px] uppercase font-bold text-slate-500">Cartes IA :</span>
          )}

          {/* 8 Pastilles */}
          <div className="flex items-center gap-0.5">
            {allRanks.map((r) => {
              const isPlayed = state.aiPlayedRanks.includes(r);
              const isRemainingInHand = !isPlayed;

              return (
                <div
                  key={r}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded text-[9px] font-black flex items-center justify-center border transition-all ${
                    isPlayed
                      ? 'bg-slate-950/80 border-slate-900 text-slate-600 line-through opacity-30'
                      : isRevealed && isRemainingInHand
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_8px_rgba(16,185,129,0.8)] font-black animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  title={
                    isPlayed
                      ? `Rang ${r} déjà joué par l'IA`
                      : isRevealed
                      ? `Rang ${r} encore en main de l'IA (Révélé !)`
                      : `Rang ${r}`
                  }
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
