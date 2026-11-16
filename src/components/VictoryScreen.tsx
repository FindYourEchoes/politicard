import React from 'react';
import { GameState } from '../types/duel';
import { FACTIONS } from '../data/factions';
import {
  Trophy,
  RotateCcw,
  Tv,
  Users,
  XCircle
} from 'lucide-react';

interface VictoryScreenProps {
  state: GameState;
  onRematch: () => void;
  onChangeFaction: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  state,
  onRematch,
  onChangeFaction
}) => {
  const isPlayerWinner = state.winner === 'PLAYER';
  const isDraw = state.winner === 'DRAW';

  const playerFaction = FACTIONS[state.playerFaction];
  const aiFaction = FACTIONS[state.aiFaction];

  // Calculate simulated vote percentages for the 20h00 reveal
  const totalPoints = state.playerScore + state.aiScore;
  let playerVotePct = 50.0;
  let aiVotePct = 50.0;

  if (totalPoints > 0) {
    playerVotePct = Number(((state.playerScore / totalPoints) * 30 + 35).toFixed(1));
    aiVotePct = Number((100 - playerVotePct).toFixed(1));
  }
  if (isPlayerWinner && playerVotePct <= 50) {
    playerVotePct = 53.4;
    aiVotePct = 46.6;
  } else if (!isPlayerWinner && !isDraw && aiVotePct <= 50) {
    aiVotePct = 53.4;
    playerVotePct = 46.6;
  }

  const winningFaction = isPlayerWinner ? playerFaction : aiFaction;

  return (
    <div className="relative w-full h-[100dvh] overflow-y-auto bg-slate-950 text-slate-100 flex flex-col items-center justify-between font-sans select-none p-3 sm:p-6">
      {/* Background Lighting */}
      <div
        className={`absolute inset-0 bg-radial-gradient ${
          isPlayerWinner
            ? 'from-emerald-950/40 via-slate-950 to-black'
            : isDraw
            ? 'from-amber-950/40 via-slate-950 to-black'
            : 'from-red-950/40 via-slate-950 to-black'
        } pointer-events-none`}
      />

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-2xl flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-md">
            <Tv className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black tracking-tight uppercase text-white">
              SOIRÉE ÉLECTORALE EN DIRECT
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Estimation Officielle de 20H00</p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-red-950 border border-red-600 text-red-300 px-2 py-0.5 rounded uppercase font-bold animate-pulse">
          RÉSULTATS DÉFINITIFS
        </span>
      </header>

      {/* Main Announcement Box */}
      <div className="relative z-10 w-full max-w-xl my-auto text-center flex flex-col items-center py-4">
        {/* Big Icon / Badge */}
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white mb-3 shadow-2xl border-2 ${
            isPlayerWinner
              ? 'bg-emerald-600 border-emerald-400 shadow-emerald-500/30'
              : isDraw
              ? 'bg-amber-600 border-amber-400 shadow-amber-500/30'
              : 'bg-red-600 border-red-400 shadow-red-500/30'
          }`}
        >
          {isPlayerWinner ? (
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-200 animate-bounce" />
          ) : isDraw ? (
            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          ) : (
            <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          )}
        </div>

        {/* Big Verdict Headline */}
        <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-tight">
          {isPlayerWinner
            ? 'VICTOIRE ÉLECTORALE !'
            : isDraw
            ? 'BALLOTTAGE PARFAIT !'
            : 'DÉFAITE AU SECOND TOUR !'}
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
          {isPlayerWinner
            ? `Les électeurs ont plébiscité ${playerFaction.name} ! ${playerFaction.candidateName} s'installe à l'Élysée !`
            : isDraw
            ? `Égalité parfaite après les 8 rounds ! Le Conseil Constitutionnel ordonne un recompte minutieux.`
            : `Le camp ${aiFaction.name} l'emporte avec ${aiFaction.candidateName}. Votre équipe prépare déjà les recours.`}
        </p>

        {/* 20H00 Result Box (Gauge) */}
        <div className="w-full mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <div
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: playerFaction.color }}
              />
              <span className="font-bold text-white truncate max-w-[130px]">
                {playerFaction.shortName} (Vous)
              </span>
            </div>
            <span className="text-lg font-black font-mono text-amber-400">
              {playerVotePct} %
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex">
            <div
              className="h-full transition-all duration-1000"
              style={{
                width: `${playerVotePct}%`,
                backgroundColor: playerFaction.color
              }}
            />
            <div
              className="h-full transition-all duration-1000"
              style={{
                width: `${aiVotePct}%`,
                backgroundColor: aiFaction.color
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-lg font-black font-mono text-slate-400">
              {aiVotePct} %
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white truncate max-w-[130px]">
                {aiFaction.shortName} (IA)
              </span>
              <div
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: aiFaction.color }}
              />
            </div>
          </div>

          {/* Points score recap */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-6 text-xs font-mono text-slate-400">
            <span>Points d'Opinion Vous : <strong className="text-white">{state.playerScore}</strong> / 4</span>
            <span>•</span>
            <span>Points d'Opinion IA : <strong className="text-white">{state.aiScore}</strong> / 4</span>
          </div>
        </div>

        {/* Satirical quote */}
        <div className="mt-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 max-w-md italic text-xs text-amber-200/90">
          "{winningFaction.slogan}"
        </div>
      </div>

      {/* Action Buttons */}
      <footer className="relative z-10 w-full max-w-xl flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={onRematch}
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
          <span>Prendre sa Revanche</span>
        </button>

        <button
          onClick={onChangeFaction}
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm border border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Users className="w-4 h-4" />
          <span>Changer de Camp Politique</span>
        </button>
      </footer>
    </div>
  );
};
