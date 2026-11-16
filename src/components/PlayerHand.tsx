import React, { useRef } from 'react';
import { CardDefinition } from '../types/duel';
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

export const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  selectedCard,
  onSelectCard,
  onPlayCard,
  playerNextBonus,
  disabled
}) => {
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent, card: CardDefinition) => {
    if (disabled) return;
    touchStartY.current = e.touches[0].clientY;
    onSelectCard(card);
  };

  const handleTouchEnd = (e: React.TouchEvent, card: CardDefinition) => {
    if (disabled || touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;
    touchStartY.current = null;

    // If swiped/dragged up by more than 40px -> Play card directly!
    if (deltaY > 40) {
      onPlayCard(card);
    }
  };

  return (
    <div className="relative z-20 w-full shrink-0 bg-slate-950/95 border-t border-slate-800/80 px-2 pt-1 pb-2 sm:pb-3 flex flex-col items-center select-none backdrop-blur-md">
      {/* Top Bonus indicator if active */}
      {playerNextBonus > 0 && (
        <div className="w-full max-w-md flex items-center justify-center mb-1">
          <span className="flex items-center gap-1 bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-black px-2 py-0.5 rounded-full text-[10px] animate-pulse">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Bonus Lieutenant actif : +{playerNextBonus} en force !
          </span>
        </div>
      )}

      {/* Horizontal Cards Fan */}
      <div className="w-full overflow-x-auto overflow-y-hidden pb-1 pt-1 scrollbar-none flex justify-start sm:justify-center items-end gap-1.5 sm:gap-2 px-1">
        {cards.map((card) => {
          const isSelected = selectedCard?.rank === card.rank;
          return (
            <div
              key={card.rank}
              className="shrink-0 transition-transform"
              onTouchStart={(e) => handleTouchStart(e, card)}
              onTouchEnd={(e) => handleTouchEnd(e, card)}
              onClick={() => {
                if (disabled) return;
                onSelectCard(card);
              }}
            >
              <DuelCard
                card={card}
                isSelected={isSelected}
                isPlayable={!disabled}
                bonusForce={playerNextBonus}
                size="sm"
                showDetails={true}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
