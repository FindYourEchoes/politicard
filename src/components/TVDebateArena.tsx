import React from 'react';
import { GameState, RoundResult, CardDefinition } from '../types/duel';
import { FACTIONS, THEME_DETAILS } from '../data/factions';
import { DuelCard } from './DuelCard';
import {
  ArrowRight,
  Send,
  Zap
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
        subtitle: `Le favori adverse chute (+${result.pointsAwarded} pts) !`
      };
    }
    if (result.verdict === 'SCANDALE_AI') {
      return {
        bg: 'from-red-900 to-rose-950 text-red-200 border-red-500',
        title: "DOSSIER NOIR ADVERSE !",
        subtitle: `Votre favori est éliminé (+${result.pointsAwarded} pts IA).`
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
    <div className="relative flex-1 w-full min-h-0 flex flex-col justify-between items-center px-2 py-1 select-none overflow-hidden">
      {/* 1. TOP PUPITRE: IA */}
      <div className="w-full flex items-center justify-between px-2.5 py-1 bg-slate-900/80 border border-slate-800 rounded-lg shrink-0">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: aiFaction.color }}
          />
          <span className="text-[11px] font-bold text-white truncate max-w-[150px]">
            {aiFaction.candidateName}
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          IA • {state.aiHand.length} cartes
        </span>
      </div>

      {/* 2. CENTER DUEL ARENA: TWO SLOTS FACE TO FACE + THEME/VERDICT */}
      <div className="flex-1 w-full min-h-0 my-1 flex flex-col justify-around items-center">
        {/* Slot Haut (IA) & Slot Bas (Joueur) Face to Face */}
        <div className="w-full flex items-center justify-center gap-3 sm:gap-6 my-auto">
          {/* Pupitre IA Slot */}
          <div className="w-[110px] sm:w-[130px] h-[105px] sm:h-[120px] flex flex-col items-center justify-center">
            {isRevealPhase || isVerdictPhase ? (
              state.aiPlayedCard && (
                <DuelCard
                  card={state.aiPlayedCard}
                  isFaceDown={isRevealPhase}
                  isCancelled={roundResult ? !roundResult.aiPowerActive : false}
                  bonusForce={state.aiNextBonus}
                  size="arena"
                />
              )
            ) : (
              <div className="w-full h-full rounded-xl border border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center text-slate-600">
                <span className="text-[10px] font-mono font-bold uppercase">Pupitre IA</span>
                <span className="text-[9px] text-slate-500">En attente</span>
              </div>
            )}
          </div>

          {/* Central Clash / Theme / Verdict Column */}
          <div className="flex flex-col items-center justify-center max-w-[160px] sm:max-w-[200px] text-center shrink-0">
            {/* Theme Badge */}
            <div
              className={`px-2 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1 shadow-sm mb-1 ${themeInfo.color}`}
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="truncate">{themeInfo.title}</span>
            </div>

            {/* During Choose Mode: Prompt or Single Action Button */}
            {!isRevealPhase && !isVerdictPhase ? (
              selectedCard ? (
                <button
                  onClick={onPlaySelectedCard}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 animate-bounce"
                >
                  <span>JOUER</span>
                  <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono text-center leading-tight">
                  Touchez 2x ou sélectionnez une carte
                </span>
              )
            ) : roundResult && isVerdictPhase ? (
              /* During Verdict: Winner banner & next round button */
              <div className="flex flex-col items-center gap-1 w-full animate-scale-in">
                {(() => {
                  const banner = getVerdictBanner(roundResult);
                  return (
                    <div
                      className={`w-full py-1 px-2 rounded-lg bg-gradient-to-r ${banner.bg} border text-center shadow`}
                    >
                      <h4 className="text-[11px] font-black uppercase leading-tight">
                        {banner.title}
                      </h4>
                      <p className="text-[9px] font-semibold opacity-95 leading-tight mt-0.5">
                        {banner.subtitle}
                      </p>
                    </div>
                  );
                })()}

                <button
                  onClick={onNextRound}
                  className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase shadow active:scale-95 transition-all flex items-center justify-center gap-1"
                >
                  <span>SUIVANT</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            ) : (
              /* During Reveal suspense */
              <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-amber-400 font-black text-xs font-mono shadow animate-spin">
                VS
              </div>
            )}
          </div>

          {/* Pupitre Joueur Slot */}
          <div className="w-[110px] sm:w-[130px] h-[105px] sm:h-[120px] flex flex-col items-center justify-center">
            {isRevealPhase || isVerdictPhase ? (
              state.playerPlayedCard && (
                <DuelCard
                  card={state.playerPlayedCard}
                  isCancelled={roundResult ? !roundResult.playerPowerActive : false}
                  bonusForce={state.playerNextBonus}
                  size="arena"
                />
              )
            ) : selectedCard ? (
              <DuelCard card={selectedCard} isSelected={true} size="arena" />
            ) : (
              <div className="w-full h-full rounded-xl border border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center text-slate-600">
                <span className="text-[10px] font-mono font-bold uppercase">Votre Pupitre</span>
                <span className="text-[9px] text-slate-500">Choisissez</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM PUPITRE: JOUEUR */}
      <div className="w-full flex items-center justify-between px-2.5 py-1 bg-slate-900/80 border border-slate-800 rounded-lg shrink-0">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: playerFaction.color }}
          />
          <span className="text-[11px] font-bold text-white truncate max-w-[150px]">
            {playerFaction.candidateName}
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Vous • {state.playerHand.length} cartes
        </span>
      </div>
    </div>
  );
};
