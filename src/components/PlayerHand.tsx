import React, { useRef } from 'react';
import { CardDefinition, CardRank } from '../types/duel';
import { DuelCard } from './DuelCard';
import { Sparkles } from 'lucide-react';

interface PlayerHandProps {
  cards: CardDefinition[];
  selectedCard: CardDefinition | null;
  onSelectCard: (card: CardDefinition) => void;
  onPlayCard: (card: CardDefinition) => void;
  playerNextBonus: number;
  disabled: boolean;
}

const ALL_RANKS: CardRank[] = [7, 6, 5, 4, 3, 2, 1, 0];

export const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  selectedCard,
  onSelectCard,
  onPlayCard,
  playerNextBonus,
  disabled
}) => {
  const lastTapRef = useRef<{ rank: CardRank; time: number } | null>(null);

  const handleCardClick = (card: CardDefinition) => {
    if (disabled) return;

    const now = Date.now();
    // Double tap detection (within 350ms on same card) -> immediate play!
    if (lastTapRef.current && lastTapRef.current.rank === card.rank && now - lastTapRef.current.time < 350) {
      lastTapRef.current = null;
      onPlayCard(card);
      return;
    }

    lastTapRef.current = { rank: card.rank, time: now };
    onSelectCard(card);
  };

  return (
    <div className="relative z-20 w-full shrink-0 h-[45dvh] max-h-[380px] bg-slate-950/95 border-t border-slate-800/80 px-2 pt-1 pb-2 flex flex-col justify-between select-none backdrop-blur-md">
      {/* Micro header with bonus indicator */}
      <div className="flex items-center justify-between text-[10px] font-mono px-1 py-0.5 shrink-0">
        <span className="text-slate-400 font-bold uppercase">
          Votre Main (Grille 4×2) • {cards.length}/8
        </span>
        {playerNextBonus > 0 && (
          <span className="flex items-center gap-1 bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-black px-2 py-0.5 rounded-full text-[9px] animate-pulse">
            <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
            Bonus Lieutenant : +{playerNextBonus} force
          </span>
        )}
      </div>

      {/* 4x2 Grid occupying full remaining hand height */}
      <div className="grid grid-cols-4 grid-rows-2 gap-1.5 sm:gap-2 flex-1 w-full min-h-0">
        {ALL_RANKS.map((rank) => {
          const card = cards.find((c) => c.rank === rank);
          const isSelected = selectedCard?.rank === rank;

          if (!card) {
            // Already played placeholder slot
            return (
              <div
                key={rank}
                className="w-full h-full rounded-xl border border-dashed border-slate-800/60 bg-slate-950/40 flex flex-col items-center justify-center p-1 text-slate-600 font-mono select-none"
              >
                <span className="text-xs font-black line-through opacity-30">{rank}</span>
                <span className="text-[8px] uppercase tracking-wider opacity-40">JOUÉE</span>
              </div>
            );
          }

          return (
            <div key={rank} className="w-full h-full">
              <DuelCard
                card={card}
                isSelected={isSelected}
                isPlayable={!disabled}
                bonusForce={playerNextBonus}
                size="grid"
                onClick={() => handleCardClick(card)}
                onDoubleClick={() => {
                  if (!disabled) onPlayCard(card);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
