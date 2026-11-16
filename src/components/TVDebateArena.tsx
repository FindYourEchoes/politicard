import React from 'react';
import { GameState, RoundResult, CardDefinition } from '../types/duel';
import { FACTIONS, THEME_DETAILS } from '../data/factions';
import { DuelCard } from './DuelCard';
import {
  ArrowUp,
  ArrowRight
} from 'lucide-react';

interface TVDebateArenaProps {
  state: GameState;
  onNextRound: () => void;
  selectedCard: CardDefinition | null;
  onPlaySelectedCard: () => void;
}

export const TVDebateArena: React.FC<TVDebateArenaProps> = ({
  state,
  onNextRound,
  selectedCard,
  onPlaySelectedCard
}) => {
  const playerFaction = FACTIONS[state.playerFaction];
  const aiFaction = FACTIONS[state.aiFaction];

  const roundResult = state.currentRoundResult;
  const isVerdictPhase = state.phase === 'ROUND_VERDICT';
  const isRevealPhase = state.phase === 'ROUND_REVEAL';

  const themeInfo = THEME_DETAILS[state.roundTheme];

  const getVerdictBanner = (result: RoundResult) => {
    if (result.verdict === 'SCANDALE_PLAYER') {
      return {
        bg: 'from-amber-500 to-red-600 text-white border-amber-300',
        title: "SCANDALE D'ÉTAT !",
        subtitle: `Le favori adverse est éliminé (+${result.pointsAwarded} pts) !`
      };
    }
    if (result.verdict === 'SCANDALE_AI') {
      return {
        bg: 'from-red-900 to-rose-950 text-red-200 border-red-500',
        title: "DOSSIER NOIR ADVERSE !",
        subtitle: `Votre favori chute lourdement (+${result.pointsAwarded} pts IA).`
      };
    }
    if (result.winner === 'PLAYER') {
      return {
        bg: 'from-emerald-600 to-teal-700 text-white border-emerald-400',
        title: 'VICTOIRE DU ROUND !',
        subtitle: `Vous marquez +${result.pointsAwarded} ${result.pointsAwarded > 1 ? 'points' : 'point'} !`
      };
    }
    if (result.winner === 'AI') {
      return {
        bg: 'from-rose-900 to-slate-900 text-rose-200 border-rose-600',
        title: 'ROUND CONCÉDÉ',
        subtitle: `L'IA empoche +${result.pointsAwarded} ${result.pointsAwarded > 1 ? 'points' : 'point'}.`
      };
    }
    return {
      bg: 'from-amber-600 to-yellow-600 text-white border-amber-300',
      title: 'ÉGALITÉ FORCÉE',
      subtitle: `Point reporté : ${result.potAfterRound} pts en jeu au prochain tour.`
    };
  };

  return (
    <div className="relative flex-1 w-full overflow-hidden flex flex-col justify-between items-center px-2 py-1 max-w-2xl mx-auto select-none">
      {/* --- TOP: IA PODIUM MINI --- */}
      <div className="relative z-10 w-full flex items-center justify-between px-3 py-1 bg-slate-900/60 border border-slate-800 rounded-lg shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shadow-sm"
            style={{ backgroundColor: aiFaction.color }}
          />
          <h3 className="text-xs font-bold text-white">
            {aiFaction.candidateName}
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {state.aiHand.length} cartes en réserve
        </span>
      </div>

      {/* --- CENTER ARENA: THEME & CLASH --- */}
      <div className="relative z-10 flex-1 w-full flex flex-col items-center justify-center my-auto">
        {/* Round Theme Banner (Centrally placed, clean) */}
        {!isRevealPhase && !isVerdictPhase && (
          <div className="w-full flex flex-col items-center mb-3">
            <div
              className={`px-3 py-1 rounded-full border text-center shadow-md flex items-center gap-2 ${themeInfo.color}`}
            >
              <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-black/40">
                {themeInfo.badge}
              </span>
              <span className="text-xs font-black uppercase tracking-wide">
                {themeInfo.title}
              </span>
              <span className="text-[11px] text-slate-300 hidden sm:inline">
                • {themeInfo.subtitle}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 sm:hidden mt-0.5 font-medium">
              {themeInfo.subtitle}
            </p>
          </div>
        )}

        {/* If in choose mode: Unique action button or drag prompt */}
        {!isRevealPhase && !isVerdictPhase && (
          <div className="flex flex-col items-center justify-center text-center p-3 w-full max-w-sm">
            {selectedCard ? (
              <button
                onClick={onPlaySelectedCard}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 animate-bounce"
              >
                <span>JOUER {selectedCard.name.toUpperCase()} (RANG {selectedCard.rank})</span>
                <ArrowUp className="w-4 h-4 stroke-[3]" />
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-400 text-xs">
                <p className="font-semibold text-slate-300">Sélectionnez une carte en bas</p>
                <p className="text-[11px] text-slate-500 mt-0.5">ou glissez-la vers le haut pour la jouer</p>
              </div>
            )}
          </div>
        )}

        {/* If in reveal or verdict phase: show the two cards clashing */}
        {(isRevealPhase || isVerdictPhase) && state.playerPlayedCard && state.aiPlayedCard && (
          <div className="flex flex-col items-center justify-center w-full gap-2 my-auto">
            <div className="flex items-center justify-center gap-4 sm:gap-6 w-full">
              {/* IA Card */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">
                  IA
                </span>
                <DuelCard
                  card={state.aiPlayedCard}
                  isFaceDown={isRevealPhase}
                  isCancelled={roundResult ? !roundResult.aiPowerActive : false}
                  bonusForce={state.aiNextBonus}
                  size="md"
                  showDetails={true}
                />
              </div>

              {/* VS */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-amber-400 font-black text-xs font-mono shadow-md">
                  VS
                </div>
                {roundResult && (
                  <span className="text-[10px] font-mono text-slate-300 mt-1 font-bold">
                    {roundResult.playerEffectiveForce} - {roundResult.aiEffectiveForce}
                  </span>
                )}
              </div>

              {/* Player Card */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-bold mb-1">
                  VOUS
                </span>
                <DuelCard
                  card={state.playerPlayedCard}
                  isCancelled={roundResult ? !roundResult.playerPowerActive : false}
                  bonusForce={state.playerNextBonus}
                  size="md"
                  showDetails={true}
                />
              </div>
            </div>

            {/* Verdict Summary Box */}
            {roundResult && isVerdictPhase && (
              <div className="w-full max-w-md mt-1 p-2.5 rounded-xl border shadow-xl text-center flex flex-col items-center bg-slate-900/95 border-slate-700">
                {(() => {
                  const banner = getVerdictBanner(roundResult);
                  return (
                    <div
                      className={`w-full py-1.5 px-3 rounded-lg bg-gradient-to-r ${banner.bg} border shadow mb-1.5`}
                    >
                      <h3 className="text-xs sm:text-sm font-black uppercase">
                        {banner.title}
                      </h3>
                      <p className="text-[11px] font-medium">{banner.subtitle}</p>
                    </div>
                  );
                })()}

                {/* Power logs */}
                {roundResult.powerLogs.length > 0 && (
                  <div className="w-full space-y-1 text-left text-[10px] font-mono mb-2">
                    {roundResult.powerLogs.map((log, idx) => (
                      <p
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 truncate"
                      >
                        {log}
                      </p>
                    ))}
                  </div>
                )}

                {/* Single Next Round button */}
                <button
                  onClick={onNextRound}
                  className="w-full py-2 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Round Suivant</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- BOTTOM: PLAYER PODIUM MINI --- */}
      <div className="relative z-10 w-full flex items-center justify-between px-3 py-1 bg-slate-900/60 border border-slate-800 rounded-lg shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shadow-sm"
            style={{ backgroundColor: playerFaction.color }}
          />
          <h3 className="text-xs font-bold text-white">
            {playerFaction.candidateName}
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {state.playerHand.length} cartes restantes
        </span>
      </div>
    </div>
  );
};
