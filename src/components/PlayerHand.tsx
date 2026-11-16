import React from 'react';
import { CardDefinition } from '../types/duel';
import { DuelCard } from './DuelCard';
import { Sparkles, Send } from 'lucide-react';

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
  return (
    <div className="relative z-20 w-full shrink-0 bg-slate-950/95 border-t border-slate-800/80 px-2 pt-1 pb-2 sm:pb-3 flex flex-col items-center select-none backdrop-blur-md">
      {/* Top micro status bar: Active Bonus or Card helper message */}
      <div className="w-full max-w-4xl flex items-center justify-between text-[11px] mb-1 px-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-400 font-bold uppercase text-[10px]">
            Vos cartes restantes ({cards.length}) :
          </span>
          {playerNextBonus > 0 && (
            <span className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-black px-2 py-0.5 rounded-full text-[10px] animate-pulse">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Bonus Bras Droit actif : +{playerNextBonus} en force !
            </span>
          )}
        </div>

        {selectedCard && !disabled && (
          <button
            onClick={() => onPlayCard(selectedCard)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black px-3 py-1 rounded-lg text-xs uppercase tracking-wide shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <span>Envoyer au Pupitre</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Selected Card Power Banner (quick readout) */}
      {selectedCard && (
        <div className="w-full max-w-2xl mx-auto mb-1.5 px-3 py-1 bg-slate-900/90 border border-amber-400/40 rounded-lg flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2 truncate">
            <span className="font-black text-amber-400 font-mono">[{selectedCard.rank}]</span>
            <span className="font-bold text-white truncate">{selectedCard.name} :</span>
            <span className="text-slate-300 text-[11px] truncate">{selectedCard.shortPower}</span>
          </div>
          <span className="text-[10px] text-slate-400 italic shrink-0 hidden sm:inline ml-2">
            Touchez à nouveau pour confirmer
          </span>
        </div>
      )}

      {/* Horizontal Cards Fan / Scroller */}
      <div className="w-full overflow-x-auto overflow-y-hidden pb-1 pt-1 scrollbar-none flex justify-start sm:justify-center items-end gap-1.5 sm:gap-2 px-2">
        {cards.map((card) => {
          const isSelected = selectedCard?.rank === card.rank;
          return (
            <div
              key={card.rank}
              className="shrink-0 transition-transform"
              onClick={() => {
                if (disabled) return;
                if (isSelected) {
                  onPlayCard(card);
                } else {
                  onSelectCard(card);
                }
              }}
            >
              <DuelCard
                card={card}
                isSelected={isSelected}
                isPlayable={!disabled}
                bonusForce={playerNextBonus}
                size="sm"
                showDetails={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
