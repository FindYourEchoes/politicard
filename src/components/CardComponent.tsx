import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Briefcase,
  Eye,
  FileWarning,
  Flame,
  FolderLock,
  Heart,
  HelpCircle,
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
    label: 'IDÉO',
    badgeBg: 'bg-royal text-white',
    borderAccent: 'border-royal',
  },
  EVENT: {
    label: 'FLASH',
    badgeBg: 'bg-gold text-white',
    borderAccent: 'border-gold',
  },
  TRAP: {
    label: 'PIÈGE',
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
  const [imgError, setImgError] = useState(false);

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

  // Effet d'éventail subtil pour les cartes en main
  const middleIndex = (handTotal - 1) / 2;
  const offsetFromCenter = inHand ? handIndex - middleIndex : 0;
  const fanRotate = inHand ? offsetFromCenter * 2 : 0;
  const fanY = inHand ? Math.abs(offsetFromCenter) * 2 : 0;

  const handleMouseEnter = () => {
    if (isDraggingSelf) return;
    onHoverCard?.(card);
  };

  const handleMouseLeave = () => {
    onHoverCard?.(null);
  };

  const hasImage = Boolean(card.imageUrl) && !imgError;

  // Rendu de l'illustration Full-Art ou repli sur fond stylisé gravure/presse
  const renderCardArt = () => {
    if (hasImage) {
      return (
        <img
          src={card.imageUrl}
          alt={card.name}
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      );
    }

    return (
      <div
        className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none select-none overflow-hidden"
        style={{
          background:
            card.type === 'FIGURE'
              ? 'radial-gradient(circle at 50% 35%, #FAF7F0 0%, #E6DEC8 55%, #C2B39B 100%)'
              : card.type === 'UPGRADE'
              ? 'radial-gradient(circle at 50% 35%, #F0F4FA 0%, #D0DFF6 55%, #9DBAE8 100%)'
              : card.type === 'EVENT'
              ? 'radial-gradient(circle at 50% 35%, #FCF9EB 0%, #FAECBA 55%, #E3C56D 100%)'
              : 'radial-gradient(circle at 50% 35%, #FCEEEC 0%, #F8CDC7 55%, #DE9289 100%)',
          backgroundImage:
            'radial-gradient(rgba(26,26,26,0.14) 1px, transparent 1px)',
          backgroundSize: '5px 5px',
        }}
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-paper/85 border border-ink/40 flex items-center justify-center shadow-press-sm">
          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-ink" />
        </div>
      </div>
    );
  };

  // =========================================================================
  // RENDU D'UNE CASSEROLE (PIÈGE) POSÉE SUR UN TERRAIN (Dossier secret)
  // =========================================================================
  if (card.type === 'TRAP' && !inHand) {
    const isHiddenAI = card.owner === 'AI' && card.isFaceDown;
    const canRecallTrap =
      isNewlyPlaced && card.owner === 'PLAYER' && Boolean(onRecallCard);

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
              ? 'Glissez vers votre main ou un autre Terrain • Clic droit pour reprendre'
              : undefined
          }
          className={`px-1.5 py-0.5 border-2 shadow-press-sm flex items-center gap-1 ${
            isHiddenAI
              ? 'bg-crimson text-white border-ink cursor-help'
              : canRecallTrap
              ? 'bg-amber-100 text-ink border-dashed border-amber-700 hover:bg-amber-200 draggable-card'
              : 'bg-amber-100 text-ink border-gold-dark cursor-help'
          }`}
        >
          <div
            className={`w-4 h-4 border border-ink flex items-center justify-center shrink-0 ${
              isHiddenAI ? 'bg-ink text-crimson-light' : 'bg-gold text-white'
            }`}
          >
            {isHiddenAI ? (
              <FolderLock className="w-2.5 h-2.5" />
            ) : (
              <FileWarning className="w-2.5 h-2.5" />
            )}
          </div>
          <div className="text-left leading-none min-w-0">
            <span
              className={`text-[7px] font-mono font-black uppercase ${
                isHiddenAI ? 'text-amber-200' : 'text-crimson'
              }`}
            >
              {isHiddenAI ? 'SECRET IA' : 'PIÈGE'}
            </span>
            <div className="text-[9px] font-serif font-black truncate max-w-[70px]">
              {isHiddenAI ? 'Confidentiel' : card.name}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // MODE PION SUR LE PLATEAU (compact = true) - DESIGN FULL-ART
  // =========================================================================
  if (compact) {
    const canRecallFigure =
      isNewlyPlaced &&
      card.owner === 'PLAYER' &&
      !isTargetable &&
      Boolean(onRecallCard);

    return (
      <div
        className="relative w-full h-full min-h-[58px] sm:min-h-[68px] md:min-h-[82px] select-none"
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
        {/* Badge animé (-4 CRÉD. ou ÉLIMINÉ !) */}
        <AnimatePresence>
          {cardFeedback && (
            <motion.div
              key={cardFeedback.id}
              initial={{ opacity: 0, y: 8, scale: 0.7 }}
              animate={{ opacity: 1, y: -12, scale: 1.05 }}
              exit={{ opacity: 0, y: -24, scale: 0.85 }}
              transition={{ duration: 0.3 }}
              className={`pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 z-40 px-1.5 py-0.5 border-2 border-ink font-mono font-black text-[10px] md:text-xs uppercase whitespace-nowrap shadow-press ${
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
          initial={{ opacity: 1, scale: 0.94 }}
          animate={
            isEliminated
              ? { opacity: [1, 0.6, 0.25], scale: 0.92, rotate: -2 }
              : isAttacking
              ? {
                  opacity: 1,
                  y: [0, card.owner === 'PLAYER' ? -14 : 14, 0],
                  scale: [1, 1.08, 1],
                }
              : {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  scale: isTargetable || isDragOverFigure ? 1.05 : 1,
                }
          }
          exit={{ opacity: 0, scale: 0.75 }}
          transition={{ duration: 0.35 }}
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
              ? 'Glissez vers votre main ou un autre Terrain • Clic droit pour reprendre'
              : undefined
          }
          className={`relative w-full h-full min-h-[58px] sm:min-h-[68px] md:min-h-[82px] rounded-sm overflow-hidden border-2 flex flex-col justify-between transition-all ${
            isEliminated
              ? 'border-crimson ring-2 ring-crimson'
              : isTargetable || isDragOverFigure
              ? 'border-emerald-600 ring-2 md:ring-4 ring-emerald-500/70 animate-pulse cursor-pointer shadow-lg'
              : canRecallFigure
              ? 'border-dashed border-amber-700 shadow-press-sm hover:border-royal draggable-card'
              : card.owner === 'PLAYER'
              ? 'border-ink shadow-press-sm hover:border-royal'
              : 'border-ink shadow-press-sm hover:border-crimson'
          }`}
        >
          {/* Illustration Full-Art (fond plein cadre) */}
          {renderCardArt()}

          {/* Vignette dégradée supérieure */}
          <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-[2]" />

          {/* Pastille de camp en haut à gauche + Upgrades en haut à droite */}
          <div className="relative z-10 w-full flex items-center justify-between p-0.5">
            <span
              className={`text-[7px] md:text-[8px] font-mono font-black px-1 py-0.2 rounded-xs border border-ink ${
                card.owner === 'PLAYER'
                  ? 'bg-royal text-white'
                  : 'bg-crimson text-white'
              }`}
            >
              {card.owner === 'PLAYER' ? 'VOUS' : 'IA'}
            </span>

            {card.upgrades.length > 0 && (
              <span className="bg-gold text-white px-1 py-0.2 text-[7px] md:text-[8px] font-mono font-black rounded-xs border border-ink flex items-center gap-0.5 shadow-press-sm">
                <Sparkles className="w-2 h-2" />+{card.upgrades.length}
              </span>
            )}
          </div>

          {/* Vignette dégradée inférieure pour le nom et les macarons */}
          <div className="absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-black/90 via-black/55 to-transparent pointer-events-none z-[3]" />

          {/* Nom court centré au-dessus des badges */}
          <div className="relative z-10 w-full text-center px-1 mb-0.5 pointer-events-none">
            <span className="font-serif font-black text-[8px] sm:text-[9px] md:text-[10px] text-paper-light drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate block leading-none">
              {card.name}
            </span>
          </div>

          {/* Macarons flottants en bas : Charisme (gauche) & Crédibilité (droite) */}
          <div className="relative z-10 w-full flex items-center justify-between p-0.5">
            <div
              className={`flex items-center justify-center gap-0.5 px-1 py-0.2 rounded-xs border border-ink font-mono font-black text-[8px] md:text-[10px] shadow-press-sm ${
                isBuffedCharisma
                  ? 'bg-amber-500 text-white ring-1 ring-gold'
                  : 'bg-gold text-white'
              }`}
              title="Charisme"
            >
              <Megaphone className="w-2 h-2 shrink-0" />
              <span>{effectiveCharisma}</span>
            </div>

            <div
              className={`flex items-center justify-center gap-0.5 px-1 py-0.2 rounded-xs border border-ink font-mono font-black text-[8px] md:text-[10px] shadow-press-sm ${
                isDamaged || isEliminated
                  ? 'bg-crimson text-white'
                  : 'bg-royal text-white'
              }`}
              title="Crédibilité"
            >
              <Heart className="w-2 h-2 shrink-0" />
              <span>{Math.max(0, card.credibility)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // MODE CARTE EN MAIN FULL-ART (STYLE MARVEL SNAP)
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
        initial={{ opacity: 0, y: 10, scale: 0.94 }}
        animate={{
          opacity: inHand && !isPlayable ? 0.5 : 1,
          y: isDraggingSelf ? 0 : isSelected ? -16 : fanY,
          rotate: isDraggingSelf ? 0 : isSelected ? 0 : fanRotate,
          scale: isDraggingSelf ? 1 : isSelected ? 1.12 : 1,
          zIndex: isSelected ? 30 : 10 + handIndex,
        }}
        whileHover={
          inHand && isPlayable && !isDraggingSelf
            ? { y: -12, rotate: 0, scale: 1.06, zIndex: 35 }
            : undefined
        }
        transition={{ type: 'spring', stiffness: 340, damping: 22 }}
        onClick={onClick}
        className={`relative rounded border-2 overflow-hidden shadow-press transition-all ${
          isSelected
            ? 'border-emerald-600 ring-4 ring-emerald-500/70 shadow-press-gold'
            : typeMeta.borderAccent
        } w-16 h-24 sm:w-20 sm:h-28 md:w-28 md:h-38 flex flex-col justify-between ${
          inHand && isPlayable
            ? 'draggable-card cursor-pointer'
            : inHand && !isPlayable
            ? 'cursor-not-allowed grayscale-[35%]'
            : 'cursor-default'
        }`}
      >
        {/* Illustration Full-Art plein cadre */}
        {renderCardArt()}

        {/* Vignette dégradée supérieure */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-[2]" />

        {/* 1. Macaron Coût (en haut à gauche) + Type court (en haut à droite) */}
        <div className="relative z-10 w-full flex items-center justify-between p-1">
          <div
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${
              isPlayable ? 'bg-gold text-white' : 'bg-ink-faint text-paper'
            } border-2 border-ink font-mono font-black text-[10px] sm:text-xs flex items-center justify-center shadow-press-sm`}
            title={`Coût : ${card.cost} Capital`}
          >
            {card.cost}
          </div>

          <span
            className={`text-[7px] sm:text-[8px] px-1 py-0.2 rounded-xs font-mono font-black uppercase border border-ink shadow-sm ${typeMeta.badgeBg}`}
          >
            {typeMeta.label}
          </span>
        </div>

        {/* Vignette dégradée inférieure pour le nom et les stats */}
        <div className="absolute inset-x-0 bottom-0 h-10 sm:h-12 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none z-[3]" />

        {/* 2. Nom de la carte centré en bas */}
        <div className="relative z-10 w-full text-center px-1 mb-0.5 pointer-events-none">
          <h4 className="font-serif font-black text-[8px] sm:text-[10px] md:text-[11px] text-paper-light drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate leading-tight">
            {card.name}
          </h4>
        </div>

        {/* 3. Macarons flottants en bas : Charisme (gauche) & Crédibilité (droite) */}
        <div className="relative z-10 w-full flex items-center justify-between p-1">
          {card.type === 'FIGURE' || card.type === 'UPGRADE' ? (
            <>
              <div
                className="flex items-center gap-0.5 px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded-xs bg-gold text-white border border-ink font-mono font-black text-[8px] sm:text-[10px] shadow-press-sm"
                title="Charisme"
              >
                <Megaphone className="w-2.5 h-2.5 shrink-0" />
                <span>
                  {card.type === 'UPGRADE' && effectiveCharisma >= 0
                    ? `+${effectiveCharisma}`
                    : effectiveCharisma}
                </span>
              </div>

              <div
                className={`flex items-center gap-0.5 px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded-xs border border-ink font-mono font-black text-[8px] sm:text-[10px] shadow-press-sm ${
                  card.credibility < 0
                    ? 'bg-crimson text-white'
                    : 'bg-royal text-white'
                }`}
                title="Crédibilité"
              >
                <Heart className="w-2.5 h-2.5 shrink-0" />
                <span>
                  {card.type === 'UPGRADE' && card.credibility >= 0
                    ? `+${card.credibility}`
                    : card.credibility}
                </span>
              </div>
            </>
          ) : (
            <div className="w-full text-center">
              <span
                className={`px-1.5 py-0.2 rounded-xs font-mono font-black text-[7px] sm:text-[8px] uppercase border border-ink ${
                  card.type === 'EVENT'
                    ? 'bg-gold/90 text-white'
                    : 'bg-crimson/90 text-white'
                }`}
              >
                {card.type === 'EVENT' ? '⚡ ACTION' : '📁 SECRET'}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
