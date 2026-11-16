import React, { useState, useEffect } from 'react';
import { GameState, RoundResult } from '../types/duel';
import { FACTIONS } from '../data/factions';
import { DuelCard } from './DuelCard';
import {
  Mic,
  Tv,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface TVDebateArenaProps {
  state: GameState;
  onNextRound: () => void;
  selectedCard: any;
  onPlaySelectedCard: () => void;
}

const SATIRICAL_NEWS = [
  "FLASH INFO : Selon un sondage exclusif, 78 % des téléspectateurs préfèrent regarder le débat avec le son coupé.",
  "DIRECT : Le micro d'un candidat a mystérieusement capté un bruit de couverts et d'assiettes.",
  "POLITIQUE : Un cabinet de conseil facture 450 000 € pour recommander l'usage de la couleur bleue.",
  "DÉBAT TV : La régie annonce que le temps de parole sera compensé par 3 minutes de météo agricole.",
  "ÉLECTIONS : Les instituts de sondage prédisent une égalité parfaite entre tous les candidats.",
  "MÉDIAS : Le pupitre du favori a été discrètement surélevé de 4 centimètres par les équipes techniques.",
  "SCOOP : Un stagiaire avoue avoir inversé les fiches sur la fiscalité du gazole et le prix du croissant."
];

export const TVDebateArena: React.FC<TVDebateArenaProps> = ({
  state,
  onNextRound,
  selectedCard,
  onPlaySelectedCard
}) => {
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % SATIRICAL_NEWS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const playerFaction = FACTIONS[state.playerFaction];
  const aiFaction = FACTIONS[state.aiFaction];

  const roundResult = state.currentRoundResult;
  const isVerdictPhase = state.phase === 'ROUND_VERDICT';
  const isRevealPhase = state.phase === 'ROUND_REVEAL';

  const getVerdictBanner = (result: RoundResult) => {
    if (result.verdict === 'SCANDALE_PLAYER') {
      return {
        bg: 'from-amber-500 via-red-600 to-amber-600 text-white border-amber-300',
        title: "🚨 SCANDALE D'ÉTAT !",
        subtitle: `Le favori adverse s'effondre en direct ! +${result.pointsAwarded} pts d'Opinion !`
      };
    }
    if (result.verdict === 'SCANDALE_AI') {
      return {
        bg: 'from-red-900 via-rose-950 to-red-900 text-red-200 border-red-500',
        title: "🚨 DOSSIER NOIR REVELÉ !",
        subtitle: `Votre tête d'affiche est éliminée ! L'IA remporte +${result.pointsAwarded} pts !`
      };
    }
    if (result.winner === 'PLAYER') {
      return {
        bg: 'from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-400',
        title: '🏆 VICTOIRE DU ROUND !',
        subtitle: `Vous gagnez ce round de débat (+${result.pointsAwarded} ${result.pointsAwarded > 1 ? 'pts' : 'pt'}) !`
      };
    }
    if (result.winner === 'AI') {
      return {
        bg: 'from-rose-900 via-red-900 to-rose-950 text-rose-200 border-rose-600',
        title: '❌ MANCHE CONCÉDÉE !',
        subtitle: `L'argument adverse l'emporte (+${result.pointsAwarded} ${result.pointsAwarded > 1 ? 'pts' : 'pt'} pour l'IA).`
      };
    }
    return {
      bg: 'from-amber-600 via-yellow-600 to-amber-700 text-white border-amber-300',
      title: '🤝 ÉGALITÉ SUR LE PLATEAU !',
      subtitle: `Les points restent dans le Pot Médiatique (${result.potAfterRound} pts en jeu au prochain tour) !`
    };
  };

  return (
    <div className="relative flex-1 w-full overflow-hidden flex flex-col justify-between items-center px-2 py-1 max-w-4xl mx-auto select-none">
      {/* Studio Studio Backdrop Lights & Neon Lines */}
      <div className="absolute inset-0 bg-radial-gradient from-blue-950/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent pointer-events-none" />

      {/* --- TOP: IA PODIUM (PUPITRE ADVERSAIRE) --- */}
      <div className="relative z-10 w-full flex items-center justify-between px-3 py-1 bg-slate-900/60 border border-slate-800/80 rounded-xl backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-md"
            style={{ backgroundColor: aiFaction.color }}
          >
            <Mic className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-[9px] font-mono uppercase text-slate-400 leading-tight">
              PUPITRE ADVERSE • {aiFaction.shortName}
            </p>
            <h3 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
              {aiFaction.candidateName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {state.aiNextBonus > 0 && (
            <span className="flex items-center gap-1 bg-purple-950 border border-purple-500 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Bonus +{state.aiNextBonus}
            </span>
          )}
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded">
            {state.aiHand.length} cartes en main
          </span>
        </div>
      </div>

      {/* --- CENTER ARENA: THE DUEL CLASH --- */}
      <div className="relative z-10 flex-1 w-full flex flex-col items-center justify-center my-1">
        {/* If in choose mode: show ready slots */}
        {!isRevealPhase && !isVerdictPhase && (
          <div className="flex flex-col items-center justify-center text-center p-3 sm:p-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 w-full max-w-md my-auto">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-amber-400 mb-2 shadow-inner">
              <Tv className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
              Round {state.currentRound} : Déposez votre carte
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Touchez une de vos 8 cartes en bas pour l'envoyer au pupitre face à l'IA.
            </p>

            {selectedCard && (
              <div className="mt-3 flex items-center gap-2 animate-fade-in">
                <button
                  onClick={onPlaySelectedCard}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>Jouer {selectedCard.name} (Rang {selectedCard.rank})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* If in reveal or verdict phase: show the two cards clashing */}
        {(isRevealPhase || isVerdictPhase) && state.playerPlayedCard && state.aiPlayedCard && (
          <div className="flex flex-col items-center justify-center w-full gap-2 sm:gap-3 my-auto">
            {/* The two cards side by side / opposing */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 w-full">
              {/* IA Played Card */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                  Coup de l'IA
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

              {/* Central VS or Verdict Badge */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900 border-2 border-amber-400/80 flex items-center justify-center text-amber-400 font-black text-xs sm:text-sm font-mono shadow-lg shadow-amber-500/20">
                  VS
                </div>
                {roundResult && (
                  <span className="text-[10px] font-mono text-slate-400 mt-1">
                    Forces : {roundResult.playerEffectiveForce} vs {roundResult.aiEffectiveForce}
                  </span>
                )}
              </div>

              {/* Player Played Card */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">
                  Votre coup
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

            {/* Verdict Summary Box & Logs */}
            {roundResult && isVerdictPhase && (
              <div className="w-full max-w-lg mt-1 p-2 sm:p-3 rounded-xl border shadow-2xl backdrop-blur-md animate-scale-in text-center flex flex-col items-center bg-slate-900/90 border-slate-700">
                {(() => {
                  const banner = getVerdictBanner(roundResult);
                  return (
                    <div
                      className={`w-full py-1.5 px-3 rounded-lg bg-gradient-to-r ${banner.bg} border shadow-md mb-2`}
                    >
                      <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase">
                        {banner.title}
                      </h3>
                      <p className="text-[11px] font-medium opacity-95">{banner.subtitle}</p>
                    </div>
                  );
                })()}

                {/* Power Resolution Steps */}
                <div className="w-full space-y-1 text-left text-[10px] sm:text-[11px] font-mono px-1">
                  {roundResult.powerLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-1 rounded bg-slate-950/60 border border-slate-800/80 text-slate-300 leading-tight flex items-center gap-1.5"
                    >
                      <span>{log}</span>
                    </div>
                  ))}
                </div>

                {/* Next Round Button */}
                <button
                  onClick={onNextRound}
                  className="mt-2.5 w-full sm:w-auto px-6 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Passer au Round Suivant</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- BOTTOM: PLAYER PODIUM (PUPITRE JOUEUR) --- */}
      <div className="relative z-10 w-full flex items-center justify-between px-3 py-1 bg-slate-900/60 border border-slate-800/80 rounded-xl backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-md"
            style={{ backgroundColor: playerFaction.color }}
          >
            <Mic className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-[9px] font-mono uppercase text-slate-400 leading-tight">
              VOTRE PUPITRE • {playerFaction.shortName}
            </p>
            <h3 className="text-xs sm:text-sm font-extrabold text-white leading-tight">
              {playerFaction.candidateName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {state.playerNextBonus > 0 && (
            <span className="flex items-center gap-1 bg-emerald-950 border border-emerald-500 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Bonus +{state.playerNextBonus}
            </span>
          )}
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded">
            {state.playerHand.length} cartes en main
          </span>
        </div>
      </div>

      {/* --- TV NEWS TICKER (FLASH INFO) --- */}
      <div className="relative z-10 w-full mt-1 px-2 py-1 bg-black/80 border-t border-slate-800/80 flex items-center gap-2 shrink-0 overflow-hidden text-[10px] sm:text-[11px] font-mono">
        <span className="bg-red-600 text-white font-black px-1.5 py-0.5 rounded text-[9px] shrink-0 animate-pulse">
          DIRECT
        </span>
        <p className="text-slate-300 truncate">
          {SATIRICAL_NEWS[tickerIndex]}
        </p>
      </div>
    </div>
  );
};
