import React from 'react';
import { GameState } from '../types/duel';
import { FACTIONS } from '../data/factions';
import {
  Flame,
  Eye,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

interface TopBarProps {
  state: GameState;
  onOpenRules: () => void;
  onOpenSpyModal: () => void;
  onRestart: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  state,
  onOpenRules,
  onOpenSpyModal,
  onRestart
}) => {
  const playerFaction = FACTIONS[state.playerFaction];
  const aiFaction = FACTIONS[state.aiFaction];

  const potIsBoosted = state.pot > 1;

  return (
    <header className="relative z-30 w-full px-2 sm:px-4 py-1.5 sm:py-2 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between shrink-0 select-none">
      {/* Left: Player Profile & Opinion Score */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-md border border-white/10 shrink-0 text-xs sm:text-sm"
          style={{ backgroundColor: playerFaction.color }}
          title={playerFaction.name}
        >
          {playerFaction.shortName.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-[10px] sm:text-xs font-black uppercase text-slate-200">
              VOUS
            </span>
            <span className="text-[9px] font-mono text-slate-400 hidden sm:inline truncate max-w-[100px]">
              ({playerFaction.shortName})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm border transition-all ${
                    idx < state.playerScore
                      ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                      : 'bg-slate-800/80 border-slate-700'
                  }`}
                  title={`${state.playerScore} / 4 points d'Opinion`}
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm font-black font-mono text-amber-400 ml-1">
              {state.playerScore}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Pot Médiatique */}
      <div className="flex flex-col items-center justify-center">
        <div
          className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border flex items-center gap-1.5 transition-all ${
            potIsBoosted
              ? 'bg-gradient-to-r from-red-600 to-amber-600 border-amber-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
              : 'bg-slate-900 border-slate-700 text-slate-200'
          }`}
        >
          <Flame
            className={`w-3.5 h-3.5 ${
              potIsBoosted ? 'text-amber-200 animate-bounce' : 'text-amber-400'
            }`}
          />
          <span className="text-[10px] sm:text-xs font-black tracking-wide uppercase font-mono">
            POT : <span className="text-white text-xs sm:text-sm font-bold">{state.pot}</span> {state.pot > 1 ? 'PTS' : 'PT'}
          </span>
        </div>
        <span className="text-[8px] sm:text-[9px] font-mono text-slate-400 mt-0.5">
          Round {state.currentRound} / 8 • 4 pts pour l'Élection
        </span>
      </div>

      {/* Right: AI Profile & Opinion Score + Action Tools */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-mono text-slate-400 hidden sm:inline truncate max-w-[100px]">
              ({aiFaction.shortName})
            </span>
            <span className="text-[10px] sm:text-xs font-black uppercase text-slate-200">
              IA
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm font-black font-mono text-amber-400 mr-1">
              {state.aiScore}
            </span>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm border transition-all ${
                    idx < state.aiScore
                      ? 'bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                      : 'bg-slate-800/80 border-slate-700'
                  }`}
                  title={`${state.aiScore} / 4 points d'Opinion`}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-md border border-white/10 shrink-0 text-xs sm:text-sm"
          style={{ backgroundColor: aiFaction.color }}
          title={aiFaction.name}
        >
          {aiFaction.shortName.slice(0, 2).toUpperCase()}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-800">
          {state.aiHandRevealed && (
            <button
              onClick={onOpenSpyModal}
              className="p-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500 text-indigo-300 hover:bg-indigo-900 hover:text-white transition-colors"
              title="Voir les cartes révélées de l'IA (Espionnage actif)"
            >
              <Eye className="w-3.5 h-3.5 animate-pulse" />
            </button>
          )}

          <button
            onClick={onOpenRules}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title="Aide & Rôles des cartes"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onRestart}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:bg-red-950 hover:text-red-300 hover:border-red-700 transition-colors"
            title="Changer de Camp / Recommencer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
