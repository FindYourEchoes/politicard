import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Briefcase,
  Eye,
  FileWarning,
  Flame,
  FolderLock,
  History,
  Megaphone,
  MessageSquareWarning,
  MicOff,
  Scale,
  Shield,
  ShieldAlert,
  Smartphone,
  Sparkles,
  TrendingUp,
  Zap,
  HelpCircle,
  Heart,
} from 'lucide-react';
import { Card, FloatingFeedback, Lane } from '../types/game';
import { getEffectiveCardCharisma } from '../engine/gameEngine';

interface CardComponentProps {
  card: Card;
  lane?: Lane;
  allLanes?: Lane[];
  inHand?: boolean;
  handIndex?: number;
  handTotal?: number;
  isSelected?: boolean;
  isPlayable?: boolean;
  isTargetable?: boolean;
  isAttacking?: boolean;
  isNewlyPlaced?: boolean;
  cardFeedback?: FloatingFeedback;
  compact?: boolean;
  onClick?: () => void;
  onRecallCard?: () => void;
  onHoverCard?: (card: Card | null) => void;
  onDragStartCard?: (card: Card) => void;
  onDragEndCard?: () => void;
  onDragStartBoardCard?: (card: Card) => void;
  onDragEndBoardCard?: () => void;
  onDropOnFigure?: (figureId: string) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Zap,
  ShieldAlert,
  Smartphone,
  Scale,
  Briefcase,
  Megaphone,
  Shield,
  Flame,
  TrendingUp,
  Sparkles,
  Eye,
  MessageSquareWarning,
  BarChart3,
  MicOff,
  History,
};

const TYPE_STYLES: Record<
  Card['type'],
  { label: string; badgeBg: string; borderAccent: string }
> = {
  FIGURE: {
    label: 'FIGURE',
    badgeBg: 'bg-ink text-paper',
    borderAccent: 'border-ink',
  },
  UPGRADE: {
    label: 'IDÉOLOGIE',
    badgeBg: 'bg-royal text-white',
    borderAccent: 'border-royal',
  },
  EVENT: {
    label: 'UNE / FLASH',
    badgeBg: 'bg-gold text-white',
    borderAccent: 'border-gold',
  },
  TRAP: {
    label: 'CASSEROLE',
    badgeBg: 'bg-crimson text-white',
    borderAccent: 'border-crimson',
  },
};

export const CardComponent: React.FC<CardComponentProps> = ({
  card,
  lane,
  allLanes,
  inHand = false,
  handIndex = 0,
  handTotal = 1,
  isSelected = false,
  isPlayable = true,
  isTargetable = false,
  isAttacking = false,
  isNewlyPlaced = false,
  cardFeedback,
  compact = false,
  onClick,
  onRecallCard,
  onHoverCard,
  onDragStartCard,
  onDragEndCard,
  onDragStartBoardCard,
  onDragEndBoardCard,
  onDropOnFigure,
}) => {
  const [isDragOverFigure, setIsDragOverFigure] = useState(false);
  const [isDraggingSelf, setIsDraggingSelf] = useState(false);

  const IconComponent = ICON_MAP[card.iconName] || HelpCircle;
  const typeMeta = TYPE_STYLES[card.type];
  const effectiveCharisma =
    lane && card.type === 'FIGURE'
      ? getEffectiveCardCharisma(card, lane, allLanes)
      : card.charisma;

  const isBuffedCharisma = effectiveCharisma > card.charisma;
  const isDamaged =
    card.type === 'FIGURE' && card.credibility < card.maxCredibility;
  const isEliminated = card.type === 'FIGURE' && card.credibility <= 0;

  // Léger effet d'éventail pour les cartes en main
  const middleIndex = (handTotal - 1) / 2;
  const offsetFromCenter = inHand ? handIndex - middleIndex : 0;
  const fanRotate = inHand ? offsetFromCenter * 1.2 : 0;
  const fanY = inHand ? Math.abs(offsetFromCenter) * 2 : 0;

  const handleMouseEnter = () => {
    if (isDraggingSelf) return;
    onHoverCard?.(card);
  };

  const handleMouseLeave = () => {
    onHoverCard?.(null);
  };

  // =========================================================================
  // RENDU D'UNE CASSEROLE (PIÈGE) POSÉE SUR UN TERRAIN :
  // Véritable enveloppe / dossier secret bien visible sur le bord du terrain !
  // =========================================================================
  if (card.type === 'TRAP' && !inHand) {
    const isHiddenAI = card.owner === 'AI' && card.isFaceDown;
    const canRecallTrap = isNewlyPlaced && card.owner === 'PLAYER' && Boolean(onRecallCard);
    return (
      <div
        className="relative inline-block select-none"
        draggable={canRecallTrap}
        onDragStart={(e) => {
          if (canRecallTrap) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.id);
            setIsDraggingSelf(true);
            onHoverCard?.(null);
            onDragStartBoardCard?.(card);
          }
        }}
        onDragEnd={() => {
          setIsDraggingSelf(false);
          if (canRecallTrap) {
            onDragEndBoardCard?.();
          }
        }}
        onContextMenu={(e) => {
          if (canRecallTrap && onRecallCard) {
            e.preventDefault();
            e.stopPropagation();
            onHoverCard?.(null);
            onRecallCard();
          }
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -3 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          onClick={(e) => {
            if (canRecallTrap && onRecallCard) {
              e.stopPropagation();
              onRecallCard();
            }
          }}
          title={
            canRecallTrap
              ? 'Glissez vers votre main ou un autre Terrain • Clic droit pour reprendre en main'
              : undefined
          }
          className={`px-2 py-1 border-2 shadow-press-sm flex items-center gap-1.5 ${
            isHiddenAI
              ? 'bg-crimson text-white border-ink cursor-help'
              : canRecallTrap
              ? 'bg-amber-100 text-ink border-dashed border-amber-700 hover:bg-amber-200 draggable-card'
              : 'bg-amber-100 text-ink border-gold-dark cursor-help'
          }`}
        >
          <div
            className={`w-5 h-5 border border-ink flex items-center justify-center shrink-0 ${
              isHiddenAI ? 'bg-ink text-crimson-light' : 'bg-gold text-white'
            }`}
          >
            {isHiddenAI ? (
              <FolderLock className="w-3 h-3" />
            ) : (
              <FileWarning className="w-3 h-3" />
            )}
          </div>
          <div className="text-left leading-none">
            <div className="flex items-center gap-1">
              <span
                className={`text-[8px] font-mono font-extrabold uppercase tracking-wider ${
                  isHiddenAI ? 'text-amber-200' : 'text-crimson'
                }`}
              >
                {isHiddenAI ? 'SECRET IA' : 'CASSEROLE'}
              </span>
              {canRecallTrap && (
                <span className="px-1 py-0.2 bg-amber-600 text-white text-[7px] font-mono font-black uppercase border border-ink">
                  NOUVEAU
                </span>
              )}
            </div>
            <div className="text-[10px] font-serif font-black truncate max-w-[110px] mt-0.5">
              {isHiddenAI ? 'Confidentiel [?]' : card.name}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // MODE "PION" SUR LE PLATEAU (compact = true)
  // Uniquement : Grande icône, Nom court, et 2 gros badges + Badge d'impact au-dessus !
  // =========================================================================
  if (compact) {
    const canRecallFigure =
      isNewlyPlaced && card.owner === 'PLAYER' && !isTargetable && Boolean(onRecallCard);

    return (
      <div
        className="relative w-full h-full min-h-[104px] select-none"
        draggable={canRecallFigure}
        onDragStart={(e) => {
          if (canRecallFigure) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.id);
            setIsDraggingSelf(true);
            onHoverCard?.(null);
            onDragStartBoardCard?.(card);
          }
        }}
        onDragEnd={() => {
          setIsDraggingSelf(false);
          if (canRecallFigure) {
            onDragEndBoardCard?.();
          }
        }}
        onContextMenu={(e) => {
          if (isNewlyPlaced && card.owner === 'PLAYER' && onRecallCard) {
            e.preventDefault();
            e.stopPropagation();
            onHoverCard?.(null);
            onRecallCard();
          }
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDragOver={(e) => {
          if (isTargetable) {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOverFigure(true);
          }
        }}
        onDragLeave={() => setIsDragOverFigure(false)}
        onDrop={(e) => {
          if (isTargetable && onDropOnFigure) {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOverFigure(false);
            onDropOnFigure(card.id);
          }
        }}
      >
        {/* Gros badge animé (-4 CRÉD. ou ÉLIMINÉ !) directement au-dessus de la carte touchée */}
        <AnimatePresence>
          {cardFeedback && (
            <motion.div
              key={cardFeedback.id}
              initial={{ opacity: 0, y: 8, scale: 0.7 }}
              animate={{ opacity: 1, y: -14, scale: 1.08 }}
              exit={{ opacity: 0, y: -28, scale: 0.85 }}
              transition={{ duration: 0.3 }}
              className={`pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 z-40 px-2.5 py-1 border-2 border-ink font-mono font-black text-xs uppercase whitespace-nowrap shadow-press ${
                cardFeedback.tone === 'eliminated'
                  ? 'bg-ink text-crimson-light ring-2 ring-crimson'
                  : cardFeedback.tone === 'damage'
                  ? 'bg-crimson text-white'
                  : cardFeedback.tone === 'trap'
                  ? 'bg-amber-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {cardFeedback.text}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 1, scale: 0.92 }}
          animate={
            isEliminated
              ? {
                  opacity: [1, 0.7, 0.35],
                  scale: 0.94,
                  rotate: -2,
                }
              : isAttacking
              ? {
                  opacity: 1,
                  y: [0, card.owner === 'PLAYER' ? -18 : 18, 0],
                  scale: [1, 1.09, 1],
                }
              : {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  scale: isTargetable || isDragOverFigure ? 1.04 : 1,
                }
          }
          exit={{ opacity: 0, scale: 0.75 }}
          transition={{ duration: 0.4 }}
          onClick={(e) => {
            if (isTargetable && onClick) {
              e.stopPropagation();
              onClick();
            } else if (canRecallFigure && onRecallCard) {
              e.stopPropagation();
              onRecallCard();
            }
          }}
          title={
            canRecallFigure
              ? 'Glissez vers votre main ou un autre Terrain • Clic droit pour reprendre en main'
              : undefined
          }
          className={`relative w-full h-full min-h-[104px] p-1.5 border-2 flex flex-col items-center justify-between transition-colors ${
            isEliminated
              ? 'bg-crimson/25 border-crimson ring-2 ring-crimson'
              : isTargetable || isDragOverFigure
              ? 'bg-emerald-50/90 border-emerald-600 ring-4 ring-emerald-500/60 cursor-pointer animate-pulse shadow-lg'
              : canRecallFigure
              ? 'bg-amber-50/70 border-dashed border-amber-700 shadow-press-sm hover:border-royal hover:bg-amber-100/70 draggable-card'
              : card.owner === 'PLAYER'
              ? 'bg-paper-light border-ink shadow-press-sm hover:border-royal'
              : 'bg-paper-light border-ink shadow-press-sm hover:border-crimson'
          }`}
        >
          {/* Pastille de camp / badge "NOUVEAU" en haut à gauche + Upgrades équipés en haut à droite */}
          <div className="w-full flex items-center justify-between gap-1">
            <div className="flex items-center gap-1">
              <span
                className={`text-[8px] font-mono font-extrabold px-1 py-0.2 border border-ink ${
                  card.owner === 'PLAYER'
                    ? 'bg-royal text-white'
                    : 'bg-crimson text-white'
                }`}
              >
                {card.owner === 'PLAYER' ? 'VOUS' : 'IA'}
              </span>
              {isNewlyPlaced && card.owner === 'PLAYER' && (
                <span className="bg-amber-600 text-white px-1 py-0.2 text-[7px] font-mono font-black uppercase border border-ink">
                  NOUVEAU
                </span>
              )}
            </div>

            {card.upgrades.length > 0 && (
              <span className="bg-gold text-white px-1 py-0.2 text-[8px] font-mono font-black border border-ink flex items-center gap-0.5 shadow-press-sm">
                <Sparkles className="w-2.5 h-2.5" />+{card.upgrades.length}
              </span>
            )}
          </div>

          {/* Grande Illustration / Icône gravure de presse */}
          <div
            className="w-9 h-9 my-0.5 bg-paper-dark border-2 border-ink flex items-center justify-center relative shadow-press-sm shrink-0"
            style={{
              backgroundImage:
                'radial-gradient(#1A1A1A 0.6px, transparent 0.6px)',
              backgroundSize: '4px 4px',
            }}
          >
            <div className="bg-paper-light/95 p-1 border border-ink/50">
              <IconComponent className="w-4 h-4 text-ink" />
            </div>
          </div>

          {/* Nom court centré */}
          <div className="w-full text-center px-0.5 mb-0.5">
            <h4 className="font-serif font-black text-[11px] text-ink leading-tight truncate">
              {card.name}
            </h4>
          </div>

          {/* Deux gros badges très lisibles en bas : Charisme (Orange) & Crédibilité (Bleu/Rouge) */}
          <div className="w-full flex items-center justify-between gap-1 pt-1 border-t border-ink/25">
            <div
              className={`flex items-center justify-center gap-0.5 px-1.5 py-0.5 border-2 border-ink font-mono font-black text-xs shadow-press-sm ${
                isBuffedCharisma
                  ? 'bg-amber-500 text-white ring-1 ring-gold'
                  : 'bg-gold text-white'
              }`}
              title="Charisme (Force d'attaque)"
            >
              <Megaphone className="w-3 h-3 shrink-0" />
              <span>{effectiveCharisma}</span>
            </div>

            <div
              className={`flex items-center justify-center gap-0.5 px-1.5 py-0.5 border-2 border-ink font-mono font-black text-xs shadow-press-sm ${
                isDamaged || isEliminated
                  ? 'bg-crimson text-white'
                  : 'bg-royal text-white'
              }`}
              title="Crédibilité (Points de vie)"
            >
              <Heart className="w-3 h-3 shrink-0" />
              <span>{Math.max(0, card.credibility)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // MODE CARTE EN MAIN ULTRA-ÉPURÉ (inHand = true)
  // Uniquement : Coût, Grande zone d'illustration, Nom de la carte, et 2 gros badges de stats !
  // =========================================================================
  return (
    <div
      className="relative select-none shrink-0"
      draggable={inHand && isPlayable}
      onDragStart={(e) => {
        if (inHand && isPlayable) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', card.id);
          setIsDraggingSelf(true);
          onDragStartCard?.(card);
        }
      }}
      onDragEnd={() => {
        setIsDraggingSelf(false);
        if (inHand) {
          onDragEndCard?.();
        }
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        layout={!isDraggingSelf}
        initial={{ opacity: 0, y: 18, scale: 0.94 }}
        animate={{
          opacity: inHand && !isPlayable ? 0.45 : 1,
          y: isDraggingSelf ? 0 : isSelected ? -14 : fanY,
          rotate: isDraggingSelf ? 0 : isSelected ? 0 : fanRotate,
          scale: isDraggingSelf ? 1 : isSelected ? 1.06 : 1,
        }}
        whileHover={
          inHand && isPlayable && !isDraggingSelf
            ? { y: -12, rotate: 0, scale: 1.04, zIndex: 30 }
            : undefined
        }
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        onClick={onClick}
        className={`relative bg-paper-light border-2 ${
          isSelected
            ? 'border-emerald-600 ring-4 ring-emerald-500/60 shadow-press z-20'
            : typeMeta.borderAccent
        } w-28 sm:w-32 md:w-36 p-2 flex flex-col justify-between shadow-press transition-all ${
          inHand && isPlayable
            ? 'draggable-card'
            : inHand && !isPlayable
            ? 'cursor-not-allowed grayscale-[35%]'
            : 'cursor-default'
        }`}
      >
        {/* 1. En-tête : Coût en Capital + Badge Type court */}
        <div className="flex items-center justify-between gap-1">
          <span
            className={`w-6 h-6 text-xs ${
              isPlayable ? 'bg-gold text-white' : 'bg-ink-faint text-paper'
            } border-2 border-ink font-mono font-black flex items-center justify-center shadow-press-sm shrink-0`}
            title={`Coût : ${card.cost} Capital Politique`}
          >
            {card.cost}
          </span>
          <span
            className={`text-[8px] px-1.5 py-0.5 font-mono font-extrabold uppercase truncate ${typeMeta.badgeBg}`}
          >
            {typeMeta.label}
          </span>
        </div>

        {/* 2. Grande Zone d'Illustration centrée */}
        <div
          className="w-full h-12 sm:h-14 my-1.5 bg-paper-dark border-2 border-ink flex items-center justify-center relative overflow-hidden shadow-press-sm"
          style={{
            backgroundImage:
              'radial-gradient(#1A1A1A 0.6px, transparent 0.6px)',
            backgroundSize: '4px 4px',
          }}
        >
          <div className="bg-paper-light/95 p-1.5 border border-ink/50 shadow-press-sm">
            <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-ink" />
          </div>
        </div>

        {/* 3. Nom de la carte (sans sous-titre ni pavé de texte) */}
        <div className="min-h-[2rem] flex items-center justify-center text-center px-0.5 mb-1.5">
          <h4 className="font-serif font-black text-[11px] sm:text-xs leading-tight text-ink line-clamp-2">
            {card.name}
          </h4>
        </div>

        {/* 4. Deux gros badges de stats en bas (Charisme Orange / Crédibilité Bleu) */}
        {card.type === 'FIGURE' || card.type === 'UPGRADE' ? (
          <div className="flex items-center justify-between gap-1 pt-1 border-t border-ink/30 font-mono font-black text-xs">
            <div
              className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gold text-white border-2 border-ink shadow-press-sm"
              title="Charisme (Force d'attaque)"
            >
              <Megaphone className="w-3 h-3 shrink-0" />
              <span>
                {card.type === 'UPGRADE' && effectiveCharisma >= 0
                  ? `+${effectiveCharisma}`
                  : effectiveCharisma}
              </span>
            </div>

            <div
              className={`flex items-center gap-0.5 px-1.5 py-0.5 border-2 border-ink shadow-press-sm ${
                card.credibility < 0
                  ? 'bg-crimson text-white'
                  : 'bg-royal text-white'
              }`}
              title="Crédibilité (Points de vie)"
            >
              <Heart className="w-3 h-3 shrink-0" />
              <span>
                {card.type === 'UPGRADE' && card.credibility >= 0
                  ? `+${card.credibility}`
                  : card.credibility}
              </span>
            </div>
          </div>
        ) : (
          <div className="pt-1 border-t border-ink/30">
            <div
              className={`w-full py-0.5 text-center font-mono font-black text-[9px] uppercase border border-ink ${
                card.type === 'EVENT'
                  ? 'bg-gold/25 text-ink'
                  : 'bg-crimson/15 text-crimson'
              }`}
            >
              {card.type === 'EVENT' ? '⚡ Effet Immédiat' : '📁 Piège Secret'}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
