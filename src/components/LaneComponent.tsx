import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlameKindling,
  Info,
  Landmark,
  Swords,
  Tv,
} from 'lucide-react';
import { Card, FloatingFeedback, Lane } from '../types/game';
import {
  canEquipUpgradeOnFigure,
  getCardAtSlot,
  getLaneTotalCharisma,
} from '../engine/gameEngine';
import { CardComponent } from './CardComponent';

interface LaneComponentProps {
  lane: Lane;
  allLanes: Lane[];
  currentTurn: number;
  activeCard: Card | null;
  draggingBoardCard: { card: Card; sourceLaneId: string } | null;
  isAttackingLane: boolean;
  feedbacks: FloatingFeedback[];
  onSelectLane: (laneId: string, slotIndex?: number) => void;
  onSelectTargetFigure: (laneId: string, figureId: string) => void;
  onRecallCard: (cardId: string) => void;
  onHoverCard?: (card: Card | null, lane?: Lane) => void;
  onStartDragBoardCard: (card: Card, laneId: string) => void;
  onEndDragBoardCard: () => void;
  onMoveBoardCardToLane: (
    cardId: string,
    targetLaneId: string,
    targetSlotIndex?: number
  ) => void;
}

const LANE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Tv,
  Landmark,
  FlameKindling,
};

const SHORT_LANE_BADGES: Record<Lane['modifierCode'], string> = {
  JT_20H_MEDIA_AMPLIFIER: 'Médiatique +1',
  HEMICYCLE_INSTITUTIONAL: 'Institutionnel +1/+1',
  LA_RUE_POPULIST_ARENA: 'Populiste +2',
};

const SHORT_MOBILE_TITLES: Record<Lane['modifierCode'], string> = {
  JT_20H_MEDIA_AMPLIFIER: 'JT 20h',
  HEMICYCLE_INSTITUTIONAL: 'Hémicycle',
  LA_RUE_POPULIST_ARENA: 'La Rue',
};

export const LaneComponent: React.FC<LaneComponentProps> = ({
  lane,
  allLanes,
  currentTurn,
  activeCard,
  draggingBoardCard,
  isAttackingLane,
  feedbacks,
  onSelectLane,
  onSelectTargetFigure,
  onRecallCard,
  onHoverCard,
  onStartDragBoardCard,
  onEndDragBoardCard,
  onMoveBoardCardToLane,
}) => {
  const [showLaneTooltip, setShowLaneTooltip] = useState(false);
  const [isDragOverLane, setIsDragOverLane] = useState(false);
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState<number | null>(null);

  const LaneIcon = LANE_ICONS[lane.iconName] || Landmark;
  const playerCharisma = getLaneTotalCharisma(lane, 'PLAYER', allLanes);
  const aiCharisma = getLaneTotalCharisma(lane, 'AI', allLanes);
  const shortBadge = SHORT_LANE_BADGES[lane.modifierCode];
  const shortMobileTitle = SHORT_MOBILE_TITLES[lane.modifierCode] || lane.name;

  const eligibleUpgradeTargets = lane.playerCards.filter((fig) =>
    canEquipUpgradeOnFigure(fig)
  );

  const isMovingBoardCardCrossLane =
    draggingBoardCard !== null && draggingBoardCard.sourceLaneId !== lane.id;

  const canAcceptMovedBoardFigure =
    draggingBoardCard !== null &&
    draggingBoardCard.card.type === 'FIGURE' &&
    (isMovingBoardCardCrossLane ? lane.playerCards.length < 3 : true);

  const canAcceptMovedBoardTrap =
    isMovingBoardCardCrossLane &&
    draggingBoardCard.card.type === 'TRAP' &&
    lane.playerTraps.length < 2;

  // Règles de surlignage contextuel
  const isHighlightingFigureSlots =
    (activeCard?.type === 'FIGURE' && lane.playerCards.length < 3) ||
    canAcceptMovedBoardFigure;
  const isHighlightingTrapZone =
    (activeCard?.type === 'TRAP' && lane.playerTraps.length < 2) ||
    canAcceptMovedBoardTrap;
  const isHighlightingEventLane = activeCard?.type === 'EVENT';
  const isHighlightingUpgradeFigures =
    activeCard?.type === 'UPGRADE' && eligibleUpgradeTargets.length > 0;

  const canDropOnLane =
    isHighlightingFigureSlots ||
    isHighlightingTrapZone ||
    isHighlightingEventLane;

  const isPlayerDominating = playerCharisma > aiCharisma;
  const isAIDominating = aiCharisma > playerCharisma;

  const laneLevelFeedbacks = feedbacks.filter((fb) => !fb.cardId);

  const getLaneBorderClasses = () => {
    if (isAttackingLane) {
      return 'border-2 md:border-4 border-gold ring-2 md:ring-4 ring-gold/70 shadow-press-gold';
    }
    if (isDragOverLane && (canDropOnLane || isHighlightingUpgradeFigures)) {
      return 'border-2 md:border-4 border-emerald-600 ring-2 md:ring-4 ring-emerald-500/50 shadow-press';
    }
    if (isPlayerDominating) {
      return 'border-2 md:border-4 border-royal shadow-press-royal';
    }
    if (isAIDominating) {
      return 'border-2 md:border-4 border-crimson shadow-press-crimson';
    }
    return 'border-2 border-ink shadow-press';
  };

  // Rendu individuel d'un emplacement IA
  const renderAISlot = (slotIndex: number) => {
    const aiCard = getCardAtSlot(lane.aiCards, slotIndex);
    const cardFb = aiCard
      ? feedbacks.find((fb) => fb.cardId === aiCard.id)
      : undefined;

    return (
      <div className="w-full h-full min-h-[58px] sm:min-h-[68px] md:min-h-[82px] flex items-stretch">
        <AnimatePresence mode="popLayout">
          {aiCard ? (
            <CardComponent
              key={aiCard.id}
              card={aiCard}
              lane={lane}
              allLanes={allLanes}
              compact
              isAttacking={isAttackingLane}
              cardFeedback={cardFb}
              onHoverCard={(hovered) => onHoverCard?.(hovered, lane)}
            />
          ) : (
            <motion.div
              key={`ai-empty-box-${slotIndex}`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className={`w-full h-full min-h-[58px] sm:min-h-[68px] md:min-h-[82px] rounded-xs border border-dashed transition-all flex items-center justify-center ${
                isHighlightingTrapZone
                  ? 'border-orange-600 bg-crimson/15'
                  : 'border-ink/20 bg-paper/40'
              }`}
            >
              <span className="font-mono text-[8px] text-ink-muted/50 font-bold select-none">
                #{slotIndex + 1}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Rendu individuel d'un emplacement Joueur
  const renderPlayerSlot = (slotIndex: number) => {
    const playerCard = getCardAtSlot(lane.playerCards, slotIndex);
    const cardFb = playerCard
      ? feedbacks.find((fb) => fb.cardId === playerCard.id)
      : undefined;
    const canThisFigureTakeUpgrade =
      playerCard !== undefined &&
      activeCard?.type === 'UPGRADE' &&
      canEquipUpgradeOnFigure(playerCard);

    const isSlotHoveredForFigure =
      dragOverSlotIndex === slotIndex && isHighlightingFigureSlots;

    return (
      <div className="w-full h-full min-h-[58px] sm:min-h-[68px] md:min-h-[82px] flex items-stretch">
        <AnimatePresence mode="popLayout">
          {playerCard ? (
            <CardComponent
              key={playerCard.id}
              card={playerCard}
              lane={lane}
              allLanes={allLanes}
              compact
              isAttacking={isAttackingLane}
              isNewlyPlaced={
                playerCard.playedOnTurn === currentTurn ||
                playerCard.upgrades.some((u) => u.playedOnTurn === currentTurn)
              }
              cardFeedback={cardFb}
              isTargetable={canThisFigureTakeUpgrade}
              onClick={() => {
                if (canThisFigureTakeUpgrade) {
                  onSelectTargetFigure(lane.id, playerCard.id);
                }
              }}
              onRecallCard={() => onRecallCard(playerCard.id)}
              onHoverCard={(hovered) => onHoverCard?.(hovered, lane)}
              onDragStartBoardCard={(dragged) =>
                onStartDragBoardCard(dragged, lane.id)
              }
              onDragEndBoardCard={onEndDragBoardCard}
              onDropOnFigure={(figureId) => {
                if (canThisFigureTakeUpgrade) {
                  onSelectTargetFigure(lane.id, figureId);
                }
              }}
            />
          ) : (
            <motion.div
              key={`player-empty-box-${slotIndex}`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              onClick={(e) => {
                if (activeCard?.type === 'FIGURE' && lane.playerCards.length < 3) {
                  e.stopPropagation();
                  onSelectLane(lane.id, slotIndex);
                }
              }}
              onDragOver={(e) => {
                if (isHighlightingFigureSlots) {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverLane(true);
                  setDragOverSlotIndex(slotIndex);
                }
              }}
              onDragLeave={() => {
                if (dragOverSlotIndex === slotIndex) {
                  setDragOverSlotIndex(null);
                }
              }}
              onDrop={(e) => {
                if (isHighlightingFigureSlots) {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverLane(false);
                  setDragOverSlotIndex(null);
                  if (draggingBoardCard && canAcceptMovedBoardFigure) {
                    onMoveBoardCardToLane(
                      draggingBoardCard.card.id,
                      lane.id,
                      slotIndex
                    );
                  } else if (activeCard?.type === 'FIGURE') {
                    onSelectLane(lane.id, slotIndex);
                  }
                }
              }}
              className={`w-full h-full min-h-[58px] sm:min-h-[68px] md:min-h-[82px] rounded-xs border border-dashed transition-all flex items-center justify-center cursor-pointer ${
                isSlotHoveredForFigure
                  ? 'border-emerald-700 bg-emerald-500/35 ring-2 ring-emerald-500/70'
                  : isHighlightingFigureSlots
                  ? 'border-emerald-600/80 bg-emerald-500/15 hover:bg-emerald-500/30'
                  : 'border-ink/20 bg-paper/40'
              }`}
            >
              <span className="font-mono text-[8px] text-ink-muted/50 font-bold select-none">
                #{slotIndex + 1}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      id={lane.id}
      tabIndex={-1}
      animate={isAttackingLane ? { scale: [1, 1.015, 1] } : { scale: 1 }}
      transition={{ duration: 0.45 }}
      onClick={() => {
        if (isHighlightingTrapZone || isHighlightingEventLane) {
          onSelectLane(lane.id);
        } else if (activeCard?.type === 'FIGURE' && lane.playerCards.length < 3) {
          onSelectLane(lane.id);
        }
      }}
      onDragOver={(e) => {
        if (canDropOnLane || isHighlightingUpgradeFigures) {
          e.preventDefault();
          setIsDragOverLane(true);
        }
      }}
      onDragLeave={() => {
        setIsDragOverLane(false);
        setDragOverSlotIndex(null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOverLane(false);
        setDragOverSlotIndex(null);
        if (
          draggingBoardCard &&
          (canAcceptMovedBoardFigure || canAcceptMovedBoardTrap)
        ) {
          onMoveBoardCardToLane(draggingBoardCard.card.id, lane.id);
        } else if (canDropOnLane) {
          onSelectLane(lane.id);
        } else if (isHighlightingUpgradeFigures && eligibleUpgradeTargets[0]) {
          onSelectTargetFigure(lane.id, eligibleUpgradeTargets[0].id);
        }
      }}
      className={`group relative flex flex-col justify-between bg-paper-light transition-all h-full w-full min-w-0 outline-none ${getLaneBorderClasses()} ${
        canDropOnLane ? 'cursor-pointer' : ''
      }`}
    >
      {/* Notifications de niveau Terrain (+2 OPINION !) */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1">
        <AnimatePresence>
          {laneLevelFeedbacks.map((fb) => (
            <motion.div
              key={fb.id}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [6, -6, -14, -26],
                scale: [0.85, 1.06, 1, 0.92],
              }}
              exit={{ opacity: 0, y: -30, scale: 0.85 }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
              className="px-2.5 py-0.5 border-2 border-ink bg-gold text-white font-mono font-black text-[10px] md:text-xs uppercase shadow-press"
            >
              {fb.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 1. EN-TÊTE ULTRA-COMPACT DU TERRAIN */}
      <div
        className={`relative border-b-2 border-ink px-1.5 py-1 md:px-2.5 md:py-1.5 select-none transition-colors shrink-0 ${
          isAttackingLane
            ? 'bg-gold/25'
            : isPlayerDominating
            ? 'bg-royal/15'
            : isAIDominating
            ? 'bg-crimson/15'
            : 'bg-paper-dark'
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 min-w-0">
            <div
              className={`w-5 h-5 md:w-6 md:h-6 flex items-center justify-center shrink-0 border border-ink ${
                isAttackingLane
                  ? 'bg-gold text-white'
                  : isPlayerDominating
                  ? 'bg-royal text-white'
                  : isAIDominating
                  ? 'bg-crimson text-white'
                  : 'bg-ink text-paper'
              }`}
            >
              <LaneIcon className="w-3 h-3 md:w-3.5 md:h-3.5" />
            </div>
            <h3 className="font-serif font-black text-[10px] sm:text-xs md:text-sm text-ink uppercase tracking-tight leading-none truncate">
              <span className="md:hidden">{shortMobileTitle}</span>
              <span className="hidden md:inline">{lane.name}</span>
            </h3>
          </div>

          <div
            className="flex items-center gap-1 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              setShowLaneTooltip((prev) => !prev);
            }}
          >
            <span className="hidden lg:inline px-1 py-0.2 bg-paper-light border border-ink/60 text-[9px] font-mono font-bold text-crimson uppercase whitespace-nowrap">
              {shortBadge}
            </span>
            <Info className="w-3.5 h-3.5 text-ink-muted hover:text-ink cursor-help shrink-0" />
          </div>
        </div>

        {/* Infobulle détaillée du terrain */}
        <AnimatePresence>
          {showLaneTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute z-50 top-full left-1 right-1 mt-1 p-2.5 bg-paper-light border-2 border-ink shadow-press-lg text-left pointer-events-none"
            >
              <div className="font-serif font-black text-[11px] uppercase text-ink mb-0.5">
                {lane.name}
              </div>
              <p className="text-[10px] font-serif italic text-ink-muted mb-1">
                « {lane.description} »
              </p>
              <div className="text-[10px] font-mono bg-paper-dark p-1.5 border border-ink/40 text-ink leading-snug">
                <strong className="text-crimson uppercase">Règle :</strong>{' '}
                {lane.modifierText}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. CAMP IA : GRILLE 2 + 1 (Slot 0 & 1 en haut, Slot 2 centré en bas) */}
      <div
        className={`p-1 md:p-1.5 flex-1 flex flex-col justify-between min-h-0 transition-all ${
          isHighlightingTrapZone
            ? 'bg-orange-500/20 ring-2 ring-inset ring-orange-600 animate-pulse'
            : isHighlightingEventLane
            ? 'bg-gold/15 ring-2 ring-inset ring-gold'
            : 'bg-paper-light'
        }`}
      >
        {/* Casseroles (Pièges) posées sur le terrain */}
        {(lane.aiTraps.length > 0 || lane.playerTraps.length > 0) && (
          <div className="flex flex-wrap items-center justify-between gap-1 mb-1 shrink-0">
            <div className="flex items-center gap-1">
              {lane.playerTraps.map((trap) => (
                <CardComponent
                  key={trap.id}
                  card={trap}
                  lane={lane}
                  allLanes={allLanes}
                  isNewlyPlaced={trap.playedOnTurn === currentTurn}
                  onRecallCard={() => onRecallCard(trap.id)}
                  onHoverCard={(hovered) => onHoverCard?.(hovered, lane)}
                  onDragStartBoardCard={(dragged) =>
                    onStartDragBoardCard(dragged, lane.id)
                  }
                  onDragEndBoardCard={onEndDragBoardCard}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              {lane.aiTraps.map((trap) => (
                <CardComponent
                  key={trap.id}
                  card={trap}
                  lane={lane}
                  allLanes={allLanes}
                  onHoverCard={(hovered) => onHoverCard?.(hovered, lane)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Grille 2+1 IA */}
        <div className="grid grid-cols-2 gap-1 md:gap-1.5 flex-1 min-h-0 items-stretch">
          {/* Rangée 1 : Slot 0 (gauche) & Slot 1 (droite) */}
          {renderAISlot(0)}
          {renderAISlot(1)}

          {/* Rangée 2 : Slot 2 centré */}
          <div className="col-span-2 w-1/2 mx-auto h-full flex items-stretch">
            {renderAISlot(2)}
          </div>
        </div>
      </div>

      {/* 3. BANDEAU CENTRAL : DUEL DE SCORE TRÈS LISIBLE (IA X ⚔️ Y VOUS) */}
      <div
        className={`px-1 md:px-2 py-0.5 md:py-1 flex items-center justify-between border-y-2 border-ink transition-colors shrink-0 ${
          isAttackingLane
            ? 'bg-gold text-white'
            : isPlayerDominating
            ? 'bg-royal text-white'
            : isAIDominating
            ? 'bg-crimson text-white'
            : 'bg-ink text-paper'
        }`}
      >
        <div className="flex items-center gap-0.5 md:gap-1 font-mono font-black text-[10px] md:text-xs tracking-tight">
          <span className="opacity-80">IA</span>
          <span className="px-1 py-0.2 bg-ink/85 text-white border border-white/40 rounded-xs">
            {aiCharisma}
          </span>
        </div>

        <Swords
          className={`w-3 h-3 md:w-3.5 md:h-3.5 ${
            isAttackingLane ? 'text-white animate-bounce' : 'text-gold'
          }`}
        />

        <div className="flex items-center gap-0.5 md:gap-1 font-mono font-black text-[10px] md:text-xs tracking-tight">
          <span className="px-1 py-0.2 bg-ink/85 text-white border border-white/40 rounded-xs">
            {playerCharisma}
          </span>
          <span className="opacity-80">VOUS</span>
        </div>
      </div>

      {/* 4. CAMP JOUEUR : GRILLE 2 + 1 (Slot 0 & 1 en haut, Slot 2 centré en bas) */}
      <div
        className={`p-1 md:p-1.5 flex-1 flex flex-col justify-between min-h-0 relative transition-all ${
          isHighlightingEventLane ? 'bg-gold/15' : 'bg-paper-light'
        }`}
      >
        <div className="grid grid-cols-2 gap-1 md:gap-1.5 flex-1 min-h-0 items-stretch">
          {/* Rangée 1 : Slot 0 (gauche) & Slot 1 (droite) */}
          {renderPlayerSlot(0)}
          {renderPlayerSlot(1)}

          {/* Rangée 2 : Slot 2 centré */}
          <div className="col-span-2 w-1/2 mx-auto h-full flex items-stretch">
            {renderPlayerSlot(2)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
