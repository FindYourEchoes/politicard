import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Coins,
  Eye,
  Flame,
  Heart,
  HelpCircle,
  History,
  Library,
  Megaphone,
  Menu,
  MessageSquareWarning,
  MicOff,
  Newspaper,
  Play,
  Radio,
  RotateCcw,
  Scale,
  Shield,
  ShieldAlert,
  Siren,
  Smartphone,
  Sparkles,
  Trash2,
  TrendingUp,
  Trophy,
  Undo2,
  X,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import {
  advanceToNextTurn,
  applyHegemonyBonus,
  applyLaneCombatImpacts,
  callPressConference,
  canEquipUpgradeOnFigure,
  cleanupLaneEliminatedCards,
  createInitialGameState,
  evaluateEndOfTurn8Winner,
  executeAITurn,
  getEffectiveCardCharisma,
  getLaneTotalCharisma,
  OPINION_MAX,
  playCard,
} from '../engine/gameEngine';
import { CARD_DATABASE, DOUBLED_BASE_TEMPLATE_IDS } from '../data/cards';
import { Card, CardType, GameState, Lane, TriggeredTrapAlert } from '../types/game';
import { OpinionGauge } from './OpinionGauge';
import { LaneComponent } from './LaneComponent';
import { CardComponent } from './CardComponent';
import { ActionLog } from './ActionLog';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

const TYPE_BADGE_META: Record<
  CardType,
  { label: string; badgeClass: string }
> = {
  FIGURE: { label: 'FIGURE', badgeClass: 'bg-ink text-paper' },
  UPGRADE: { label: 'IDÉOLOGIE', badgeClass: 'bg-royal text-white' },
  EVENT: { label: 'UNE / FLASH', badgeClass: 'bg-gold text-white' },
  TRAP: { label: 'CASSEROLE', badgeClass: 'bg-crimson text-white' },
};

type PlayerTurnAction =
  | {
      type: 'PLAY_CARD';
      cardId: string;
      cardName: string;
      targetLaneId: string;
      targetFigureId?: string;
      targetSlotIndex?: number;
    }
  | { type: 'CALL_PRESS' };

export const Board: React.FC = () => {
  const [initialBootState] = useState<GameState>(() => createInitialGameState());
  const [gameState, setGameState] = useState<GameState>(() => initialBootState);
  const [turnStartState, setTurnStartState] = useState<GameState>(() =>
    structuredClone(initialBootState)
  );
  const [turnActions, setTurnActions] = useState<PlayerTurnAction[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hoveredHandCardId, setHoveredHandCardId] = useState<string | null>(
    null
  );
  const [hoveredBoardEntry, setHoveredBoardEntry] = useState<{
    card: Card;
    lane?: Lane;
  } | null>(null);
  const [draggingBoardCard, setDraggingBoardCard] = useState<{
    card: Card;
    sourceLaneId: string;
  } | null>(null);
  const [isDragOverHand, setIsDragOverHand] = useState(false);
  const [isDebating, setIsDebating] = useState(false);
  const [attackingLaneId, setAttackingLaneId] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFlashInfo, setShowFlashInfo] = useState(true);
  const [activeTrapFlash, setActiveTrapFlash] =
    useState<TriggeredTrapAlert | null>(null);
  const [collectionFilter, setCollectionFilter] = useState<'ALL' | CardType>(
    'ALL'
  );

  const rulesDialogRef = useRef<HTMLDialogElement | null>(null);
  const collectionDialogRef = useRef<HTMLDialogElement | null>(null);
  const discardDialogRef = useRef<HTMLDialogElement | null>(null);
  const gameOverDialogRef = useRef<HTMLDialogElement | null>(null);
  const lastShownTrapAlertIdRef = useRef<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  const latestLog = gameState.logs[0] || null;
  const currentTurnLogsCount = gameState.logs.filter(
    (entry) => entry.turn === gameState.turn
  ).length;

  // Fermeture du menu déroulant (☰ Menu) au clic extérieur ou touche Échap
  useEffect(() => {
    if (!isMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen]);

  // Bandeau "Flash Info" temporaire de 3 secondes à chaque nouvelle dépêche
  useEffect(() => {
    if (!latestLog) return;
    setShowFlashInfo(true);
    const timer = setTimeout(() => {
      setShowFlashInfo(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [latestLog?.id]);

  // Capture unique de chaque nouvelle alerte de Casserole (sans jamais la redéclencher en boucle)
  useEffect(() => {
    const alert = gameState.triggeredTrapAlert;
    if (!alert || lastShownTrapAlertIdRef.current === alert.id) return;
    lastShownTrapAlertIdRef.current = alert.id;
    setActiveTrapFlash(alert);
    setGameState((prev) =>
      prev.triggeredTrapAlert ? { ...prev, triggeredTrapAlert: null } : prev
    );
  }, [gameState.triggeredTrapAlert]);

  // Fermeture automatique garantie au bout de 1500ms + fermeture immédiate au clic n'importe où
  useEffect(() => {
    if (!activeTrapFlash) return;
    const timer = window.setTimeout(() => {
      setActiveTrapFlash(null);
    }, 1500);

    const dismissOnAnyPointerDown = () => {
      setActiveTrapFlash(null);
    };
    window.addEventListener('pointerdown', dismissOnAnyPointerDown);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', dismissOnAnyPointerDown);
    };
  }, [activeTrapFlash]);

  // Nettoyage automatique des notifications flottantes de combat au bout de 1,4 seconde
  useEffect(() => {
    if (gameState.floatingFeedbacks.length === 0) return;
    const timer = setTimeout(() => {
      setGameState((prev) =>
        prev.floatingFeedbacks.length > 0
          ? { ...prev, floatingFeedbacks: [] }
          : prev
      );
    }, 1400);
    return () => clearTimeout(timer);
  }, [gameState.floatingFeedbacks]);

  // Fallback light-dismiss pour les navigateurs ne supportant pas encore <dialog closedby="any">
  useEffect(() => {
    if (
      typeof HTMLDialogElement !== 'undefined' &&
      !('closedBy' in HTMLDialogElement.prototype)
    ) {
      const dialogs = [
        rulesDialogRef.current,
        collectionDialogRef.current,
        discardDialogRef.current,
        gameOverDialogRef.current,
      ].filter(Boolean) as HTMLDialogElement[];

      const handlers = dialogs.map((dialog) => {
        const onClick = (event: MouseEvent) => {
          if (event.target !== dialog) return;
          const rect = dialog.getBoundingClientRect();
          const isDialogContent =
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width;
          if (isDialogContent) return;
          dialog.close();
        };
        dialog.addEventListener('click', onClick);
        return { dialog, onClick };
      });

      return () => {
        handlers.forEach(({ dialog, onClick }) =>
          dialog.removeEventListener('click', onClick)
        );
      };
    }
  }, []);

  // Ouvre automatiquement la Une "Édition Spéciale" dès que la partie est terminée
  useEffect(() => {
    const dialog = gameOverDialogRef.current;
    if (!dialog) return;
    if (gameState.phase === 'GAME_OVER' && !dialog.open) {
      dialog.showModal();
    } else if (gameState.phase !== 'GAME_OVER' && dialog.open) {
      dialog.close();
    }
  }, [gameState.phase]);

  const totalPlayerFiguresOnBoard = gameState.lanes.reduce(
    (sum, l) => sum + l.playerCards.length,
    0
  );

  const eligibleFiguresForUpgradeCount = gameState.lanes.reduce(
    (sum, l) =>
      sum + l.playerCards.filter((fig) => canEquipUpgradeOnFigure(fig)).length,
    0
  );

  const isCardPlayable = (card: Card): boolean => {
    if (gameState.phase !== 'PLAYER_ACTION' || isDebating) return false;
    if (card.cost > gameState.playerCapital) return false;
    if (card.type === 'UPGRADE' && eligibleFiguresForUpgradeCount === 0)
      return false;
    return true;
  };

  const selectedCard: Card | null =
    gameState.playerHand.find((c) => c.id === selectedCardId) || null;

  const hoveredHandCard: Card | null =
    gameState.playerHand.find((c) => c.id === hoveredHandCardId) || null;

  const hoveredPlayableCard: Card | null =
    hoveredHandCard && isCardPlayable(hoveredHandCard) ? hoveredHandCard : null;

  const activeCard: Card | null = selectedCard || hoveredPlayableCard;

  // Carte inspectée dans l'emplacement fixe et dégagé (survol plateau > survol main > sélection main)
  const inspectedCardEntry: { card: Card; lane?: Lane } | null =
    hoveredBoardEntry ||
    (hoveredHandCard ? { card: hoveredHandCard } : null) ||
    (selectedCard ? { card: selectedCard } : null);

  const hasPlayedThisTurn = turnActions.some((a) => a.type === 'PLAY_CARD');

  const replayActionsFromTurnStart = (
    baseState: GameState,
    actions: PlayerTurnAction[]
  ): GameState => {
    let replayed = structuredClone(baseState);
    for (const act of actions) {
      if (act.type === 'PLAY_CARD') {
        replayed = playCard(
          replayed,
          'PLAYER',
          act.cardId,
          act.targetLaneId,
          act.targetFigureId,
          act.targetSlotIndex
        );
      } else if (act.type === 'CALL_PRESS') {
        replayed = callPressConference(replayed, 'PLAYER');
      }
    }
    replayed.floatingFeedbacks = [];
    replayed.triggeredTrapAlert = null;
    return replayed;
  };

  const handleStartNewGame = () => {
    setSelectedCardId(null);
    setHoveredHandCardId(null);
    setDraggingBoardCard(null);
    setIsDragOverHand(false);
    setIsDebating(false);
    setAttackingLaneId(null);
    setActiveTrapFlash(null);
    setStatusBanner(null);
    if (gameOverDialogRef.current?.open) {
      gameOverDialogRef.current.close();
    }
    const freshState = createInitialGameState();
    setGameState(freshState);
    setTurnStartState(structuredClone(freshState));
    setTurnActions([]);
  };

  /**
   * Restaure l'état complet du début du tour (remet toutes les cartes jouées ce tour-ci en main et rend le Capital dépensé).
   */
  const handleUndoTurn = () => {
    if (
      gameState.phase !== 'PLAYER_ACTION' ||
      isDebating ||
      turnActions.length === 0
    ) {
      return;
    }
    const restored = structuredClone(turnStartState);
    restored.floatingFeedbacks = [];
    restored.triggeredTrapAlert = null;
    setGameState(restored);
    setTurnActions([]);
    setSelectedCardId(null);
    setHoveredHandCardId(null);
    setDraggingBoardCard(null);
    setIsDragOverHand(false);
    setActiveTrapFlash(null);
    setStatusBanner(
      'Tour annulé : vos cartes jouées ce tour-ci sont revenues en main et votre Capital a été restauré.'
    );
  };

  /**
   * Reprend immédiatement en main une carte fraîchement posée sur le plateau durant le tour en cours.
   */
  const handleRecallCard = (cardId: string) => {
    if (gameState.phase !== 'PLAYER_ACTION' || isDebating) return;

    // Cas 1 : La carte cliquée a été posée directement ce tour-ci (Figure ou Casserole)
    const directPlayIdx = turnActions.findIndex(
      (a) => a.type === 'PLAY_CARD' && a.cardId === cardId
    );

    if (directPlayIdx !== -1) {
      const recalledAction = turnActions[directPlayIdx] as Extract<
        PlayerTurnAction,
        { type: 'PLAY_CARD' }
      >;
      // On retire l'action de pose de cette carte ainsi que tout Upgrade éventuellement équipé dessus ce tour-ci
      const remainingActions = turnActions.filter(
        (a, idx) =>
          idx !== directPlayIdx &&
          !(a.type === 'PLAY_CARD' && a.targetFigureId === cardId)
      );
      const nextState = replayActionsFromTurnStart(
        turnStartState,
        remainingActions
      );
      setGameState(nextState);
      setTurnActions(remainingActions);
      setSelectedCardId(null);
      setDraggingBoardCard(null);
      setIsDragOverHand(false);
      setStatusBanner(
        `« ${recalledAction.cardName} » a été reprise en main et son Capital vous a été rendu.`
      );
      return;
    }

    // Cas 2 : C'est une Figure d'un tour précédent qui a reçu un Upgrade ce tour-ci
    let upgradeActionIdx = -1;
    for (let i = turnActions.length - 1; i >= 0; i--) {
      const act = turnActions[i];
      if (act.type === 'PLAY_CARD' && act.targetFigureId === cardId) {
        upgradeActionIdx = i;
        break;
      }
    }

    if (upgradeActionIdx !== -1) {
      const recalledUpgrade = turnActions[upgradeActionIdx] as Extract<
        PlayerTurnAction,
        { type: 'PLAY_CARD' }
      >;
      const remainingActions = turnActions.filter(
        (_, idx) => idx !== upgradeActionIdx
      );
      const nextState = replayActionsFromTurnStart(
        turnStartState,
        remainingActions
      );
      setGameState(nextState);
      setTurnActions(remainingActions);
      setSelectedCardId(null);
      setDraggingBoardCard(null);
      setIsDragOverHand(false);
      setStatusBanner(
        `L'Upgrade « ${recalledUpgrade.cardName} » a été repris en main.`
      );
    }
  };

  /**
   * Déplace directement une carte posée pendant le tour en cours ("NOUVEAU") vers un autre Terrain ou un autre emplacement sans repasser par la main.
   */
  const handleMoveBoardCardToLane = (
    cardId: string,
    targetLaneId: string,
    targetSlotIndex?: number
  ) => {
    if (gameState.phase !== 'PLAYER_ACTION' || isDebating) return;

    const directPlayIdx = turnActions.findIndex(
      (a) => a.type === 'PLAY_CARD' && a.cardId === cardId
    );
    if (directPlayIdx === -1) return;

    const movedAction = turnActions[directPlayIdx] as Extract<
      PlayerTurnAction,
      { type: 'PLAY_CARD' }
    >;
    if (
      movedAction.targetLaneId === targetLaneId &&
      (targetSlotIndex === undefined || movedAction.targetSlotIndex === targetSlotIndex)
    ) {
      setDraggingBoardCard(null);
      return;
    }

    const updatedActions = turnActions.map((act, idx) => {
      if (idx === directPlayIdx && act.type === 'PLAY_CARD') {
        return {
          ...act,
          targetLaneId,
          targetSlotIndex,
        };
      }
      if (act.type === 'PLAY_CARD' && act.targetFigureId === cardId) {
        return { ...act, targetLaneId };
      }
      return act;
    });

    const nextState = replayActionsFromTurnStart(turnStartState, updatedActions);
    const destLaneName =
      nextState.lanes.find((l) => l.id === targetLaneId)?.name || 'le nouveau terrain';

    setGameState(nextState);
    setTurnActions(updatedActions);
    setDraggingBoardCard(null);
    setIsDragOverHand(false);
    setSelectedCardId(null);
    setStatusBanner(
      `« ${movedAction.cardName} » déplacée vers « ${destLaneName} »${
        targetSlotIndex !== undefined ? ` (Case #${targetSlotIndex + 1})` : ''
      }.`
    );
  };

  const handleOpenRules = () => {
    if (rulesDialogRef.current && !rulesDialogRef.current.open) {
      rulesDialogRef.current.showModal();
    }
  };

  const handleOpenCollection = () => {
    if (collectionDialogRef.current && !collectionDialogRef.current.open) {
      collectionDialogRef.current.showModal();
    }
  };

  const handleOpenDiscard = () => {
    if (discardDialogRef.current && !discardDialogRef.current.open) {
      discardDialogRef.current.showModal();
    }
  };

  const handleSelectHandCard = (card: Card) => {
    if (gameState.phase !== 'PLAYER_ACTION' || isDebating) return;
    if (card.cost > gameState.playerCapital) {
      setStatusBanner(
        `Capital Politique insuffisant (${gameState.playerCapital}/${card.cost}) pour jouer « ${card.name} ».`
      );
      return;
    }

    if (card.type === 'UPGRADE') {
      if (totalPlayerFiguresOnBoard === 0) {
        setStatusBanner(
          `Déployez d'abord une Figure Politique avant d'équiper « ${card.name} ».`
        );
        return;
      }
      if (eligibleFiguresForUpgradeCount === 0) {
        setStatusBanner(
          `Chaque Figure ne peut équiper qu'1 seul Upgrade (sauf Le Stratège « En Même Temps »).`
        );
        return;
      }
    }

    setStatusBanner(null);
    setSelectedCardId((prev) => (prev === card.id ? null : card.id));
  };

  const handlePlayOnLane = (laneId: string, slotIndex?: number) => {
    const cardToPlay = selectedCard || hoveredPlayableCard;
    if (!cardToPlay || gameState.phase !== 'PLAYER_ACTION' || isDebating)
      return;

    const updated = playCard(
      gameState,
      'PLAYER',
      cardToPlay.id,
      laneId,
      undefined,
      slotIndex
    );
    if (updated !== gameState) {
      setGameState(updated);
      setTurnActions((prev) => [
        ...prev,
        {
          type: 'PLAY_CARD',
          cardId: cardToPlay.id,
          cardName: cardToPlay.name,
          targetLaneId: laneId,
          targetSlotIndex: slotIndex,
        },
      ]);
    }
    setSelectedCardId(null);
    setHoveredHandCardId(null);
    setStatusBanner(null);
  };

  const handlePlayUpgradeOnFigure = (laneId: string, figureId: string) => {
    const cardToPlay = selectedCard || hoveredPlayableCard;
    if (
      !cardToPlay ||
      cardToPlay.type !== 'UPGRADE' ||
      gameState.phase !== 'PLAYER_ACTION' ||
      isDebating
    ) {
      return;
    }

    const updated = playCard(
      gameState,
      'PLAYER',
      cardToPlay.id,
      laneId,
      figureId
    );
    if (updated !== gameState) {
      setGameState(updated);
      setTurnActions((prev) => [
        ...prev,
        {
          type: 'PLAY_CARD',
          cardId: cardToPlay.id,
          cardName: cardToPlay.name,
          targetLaneId: laneId,
          targetFigureId: figureId,
        },
      ]);
    }
    setSelectedCardId(null);
    setHoveredHandCardId(null);
    setStatusBanner(null);
  };

  const handleCallPress = () => {
    if (
      gameState.phase !== 'PLAYER_ACTION' ||
      isDebating ||
      gameState.turn >= 7 ||
      gameState.stakesMultiplier > 1
    ) {
      return;
    }
    setGameState((prev) => callPressConference(prev, 'PLAYER'));
    setTurnActions((prev) => [...prev, { type: 'CALL_PRESS' }]);
  };

  /**
   * Séquence de Fin de Tour & Débat étape par étape :
   * 1. Tour de l'IA (active sur les 3 Terrains)
   * 2. Pour chaque Terrain actif :
   *    - Bordure dorée + bond des cartes + affichage de `-X CRÉD.` / `ÉLIMINÉ !` au-dessus de la carte touchée pendant 1 seconde
   *    - Disparition en fondu des cartes éliminées après 1 seconde
   * 3. Vérification du Bonus de Majorité ("Hégémonie Médiatique" : +3 Opinion si un camp contrôle les 3 Terrains simultanément)
   */
  const handleEndTurn = async () => {
    if (gameState.phase !== 'PLAYER_ACTION' || isDebating) return;
    setSelectedCardId(null);
    setHoveredHandCardId(null);
    setStatusBanner(null);
    setIsDebating(true);

    let current = executeAITurn(gameState);
    setGameState(current);

    if (current.triggeredTrapAlert) {
      await wait(1200);
    } else {
      await wait(450);
    }

    if (current.phase === 'GAME_OVER') {
      setIsDebating(false);
      return;
    }

    for (let i = 0; i < current.lanes.length; i++) {
      const lane = current.lanes[i];
      const hasActivity =
        lane.playerCards.length > 0 || lane.aiCards.length > 0;

      if (hasActivity) {
        setAttackingLaneId(lane.id);
        current = applyLaneCombatImpacts(current, i);
        setGameState(current);

        const hasElimination =
          current.lanes[i].playerCards.some((c) => c.credibility <= 0) ||
          current.lanes[i].aiCards.some((c) => c.credibility <= 0);

        await wait(hasElimination || current.triggeredTrapAlert ? 1050 : 750);

        if (hasElimination && current.phase !== 'GAME_OVER') {
          current = cleanupLaneEliminatedCards(current, i);
          setGameState(current);
          await wait(350);
        }
      }

      if (current.phase === 'GAME_OVER') {
        setAttackingLaneId(null);
        setIsDebating(false);
        return;
      }
    }

    setAttackingLaneId(null);

    // Bonus de Majorité ("Hégémonie Médiatique" : +3 Opinion si un joueur contrôle les 3 Terrains simultanément)
    const afterHegemony = applyHegemonyBonus(current);
    if (afterHegemony !== current) {
      current = afterHegemony;
      setGameState(current);
      await wait(650);
      if (current.phase === 'GAME_OVER') {
        setIsDebating(false);
        return;
      }
    }

    if (current.turn >= current.maxTurns) {
      current = evaluateEndOfTurn8Winner(current);
      setGameState(current);
    } else {
      current = advanceToNextTurn(current);
      setGameState(current);
      setTurnStartState(structuredClone(current));
      setTurnActions([]);
    }

    setIsDebating(false);
  };

  // Calcul du résumé des terrains et du Charisme total cumulé
  const playerLanesDominated = gameState.lanes.filter(
    (l) =>
      getLaneTotalCharisma(l, 'PLAYER', gameState.lanes) >
      getLaneTotalCharisma(l, 'AI', gameState.lanes)
  ).length;
  const aiLanesDominated = gameState.lanes.filter(
    (l) =>
      getLaneTotalCharisma(l, 'AI', gameState.lanes) >
      getLaneTotalCharisma(l, 'PLAYER', gameState.lanes)
  ).length;
  const totalPlayerCharisma = gameState.lanes.reduce(
    (sum, l) => sum + getLaneTotalCharisma(l, 'PLAYER', gameState.lanes),
    0
  );
  const totalAICharisma = gameState.lanes.reduce(
    (sum, l) => sum + getLaneTotalCharisma(l, 'AI', gameState.lanes),
    0
  );

  // Filtrage et tri par coût pour la modale "Collection"
  const filteredCollection = CARD_DATABASE.filter((card) =>
    collectionFilter === 'ALL' ? true : card.type === collectionFilter
  ).sort((a, b) => a.cost - b.cost);

  // Résumé textuel synthétique des 3 Terrains pour l'écran de fin de partie
  const lanesInlineSummary = gameState.lanes
    .map((lane) => {
      const pScore = getLaneTotalCharisma(lane, 'PLAYER', gameState.lanes);
      const aScore = getLaneTotalCharisma(lane, 'AI', gameState.lanes);
      const shortName = lane.name.replace('Le Plateau du ', '');
      if (pScore > aScore) {
        return `${shortName} : Gagné ${pScore} à ${aScore}`;
      }
      if (aScore > pScore) {
        return `${shortName} : Perdu ${pScore} à ${aScore}`;
      }
      return `${shortName} : Égalité (${pScore} à ${aScore})`;
    })
    .join(' | ');

  return (
    <div className="h-[100dvh] w-full max-w-[1680px] overflow-hidden bg-paper text-ink flex flex-col justify-between px-2 py-1.5 md:px-5 md:py-2.5 mx-auto select-none relative">
      {/* =====================================================================
          FLASH VISUEL CENTRAL LORSQU'UNE CASSEROLE (PIÈGE) SE DÉCLENCHE (1,5s)
      ===================================================================== */}
      <AnimatePresence>
        {activeTrapFlash && (
          <motion.div
            key={activeTrapFlash.id}
            initial={{ opacity: 0, scale: 0.75, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 340, damping: 22 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          >
            <div
              onClick={() => setActiveTrapFlash(null)}
              className="pointer-events-auto cursor-pointer max-w-lg w-full mx-4 bg-paper-light border-4 border-crimson shadow-press-lg p-5 text-center"
              title="Cliquer pour fermer cette alerte"
            >
              <div className="inline-flex items-center gap-2 bg-crimson text-white px-3 py-1 font-mono font-black text-xs uppercase tracking-widest mb-2 border border-ink">
                <Siren className="w-4 h-4 animate-bounce" />
                <span>ALERTE CASSEROLE SUR {activeTrapFlash.laneName}</span>
              </div>
              <h3 className="font-serif font-black text-2xl md:text-3xl text-ink uppercase tracking-tight mb-1.5">
                {activeTrapFlash.trapName}
              </h3>
              <p className="font-mono font-bold text-xs md:text-sm text-crimson bg-crimson/10 border border-crimson p-2">
                {activeTrapFlash.effectSummary}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          1. EN-TÊTE MINIMALISTE (2 LIGNES COMPACTES SUR MOBILE, 1 LIGNE SUR DESKTOP)
      ===================================================================== */}
      <header className="w-full max-w-full border-b-2 border-ink pb-1.5 mb-1 md:mb-1.5 shrink-0">
        {/* Ligne 1 : Logo court POLITICARD + Score Vous 0 - 0 IA + Bouton ☰ Menu à droite */}
        <div className="flex items-center justify-between gap-1.5 md:gap-4 w-full min-w-0">
          {/* À gauche : Logo POLITICARD compact + Score des Terrains */}
          <div className="flex items-center gap-1.5 md:gap-2 min-w-0 shrink">
            <div className="w-6 h-6 md:w-7 md:h-7 bg-ink text-paper flex items-center justify-center border border-ink shadow-press-sm shrink-0">
              <Newspaper className="w-3.5 h-3.5 md:w-4 md:h-4 text-gold" />
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
              <h1 className="font-serif font-black text-sm sm:text-base md:text-xl tracking-tight uppercase leading-none text-ink shrink-0">
                POLITICARD
              </h1>
              <div className="bg-paper-light border border-ink px-1.5 py-0.5 font-mono font-extrabold text-[10px] md:text-xs whitespace-nowrap shadow-press-sm shrink-0">
                <span className="text-royal">Vous {playerLanesDominated}</span>
                <span className="text-ink-muted mx-1">-</span>
                <span className="text-crimson">{aiLanesDominated} IA</span>
              </div>
            </div>
          </div>

          {/* Au centre sur Desktop (>= 768px) : Jauge d'Opinion Publique */}
          <div className="hidden md:flex flex-1 justify-center min-w-0 max-w-xl">
            <OpinionGauge
              opinion={gameState.opinion}
              stakesMultiplier={gameState.stakesMultiplier}
              pressCalledBy={gameState.pressCalledBy}
            />
          </div>

          {/* À droite : Bouton unique ☰ Menu jamais coupé */}
          <div ref={menuContainerRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              className="px-2 py-1 md:px-2.5 bg-paper-light hover:bg-paper-dark text-ink border-2 border-ink font-mono font-extrabold text-[11px] md:text-xs uppercase shadow-press-sm flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Menu className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
              <span>Menu</span>
              {currentTurnLogsCount > 0 && (
                <span className="px-1 py-0.2 bg-crimson text-white text-[9px] font-black border border-ink">
                  {currentTurnLogsCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.14 }}
                  role="menu"
                  className="absolute right-0 mt-1.5 w-56 bg-paper-light border-2 border-ink shadow-press-lg z-50 divide-y divide-ink/20 font-mono text-xs"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsLogDrawerOpen(true);
                    }}
                    className="w-full px-3 py-2.5 text-left font-bold uppercase hover:bg-paper-dark flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-crimson" />
                      <span>Dépêches AFP</span>
                    </span>
                    <span className="px-1.5 py-0.2 bg-crimson text-white text-[10px] font-black border border-ink">
                      {currentTurnLogsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleOpenCollection();
                    }}
                    className="w-full px-3 py-2.5 text-left font-bold uppercase hover:bg-paper-dark flex items-center gap-2 cursor-pointer"
                  >
                    <Library className="w-3.5 h-3.5 text-royal" />
                    <span>Collection</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleOpenRules();
                    }}
                    className="w-full px-3 py-2.5 text-left font-bold uppercase hover:bg-paper-dark flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-ink" />
                    <span>Règles</span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleOpenDiscard();
                    }}
                    className="w-full px-3 py-2.5 text-left font-bold uppercase hover:bg-paper-dark flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Trash2 className="w-3.5 h-3.5 text-ink-muted" />
                      <span>Défausse & Pioche</span>
                    </span>
                    <span className="text-[10px] font-bold text-ink-muted">
                      {gameState.playerDiscard.length} / {gameState.playerDeck.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleStartNewGame();
                    }}
                    className="w-full px-3 py-2.5 text-left font-black uppercase bg-ink text-paper hover:bg-ink-muted flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-gold" />
                    <span>Nouvelle Partie</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Ligne 2 sur Mobile (< 768px) : Jauge d'Opinion Publique sur 100 % de la largeur */}
        <div className="mt-1 w-full md:hidden">
          <OpinionGauge
            opinion={gameState.opinion}
            stakesMultiplier={gameState.stakesMultiplier}
            pressCalledBy={gameState.pressCalledBy}
          />
        </div>
      </header>

      {/* =====================================================================
          BANDEAU FIN CONTEXTUEL OU FLASH AFP (3 SECONDES)
      ===================================================================== */}
      {(selectedCard || statusBanner || (showFlashInfo && latestLog)) && (
        <div
          className={`h-5 md:h-6 mb-1 md:mb-1.5 shrink-0 items-center ${
            selectedCard || statusBanner ? 'flex' : 'hidden md:flex'
          }`}
        >
          <AnimatePresence mode="wait">
            {selectedCard || statusBanner ? (
              <motion.div
                key="selection-banner"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="w-full h-full px-2 bg-emerald-500/20 border border-emerald-700 flex items-center justify-between text-[10px] md:text-[11px] font-mono min-w-0"
              >
                <div className="flex items-center gap-1.5 font-bold text-ink truncate min-w-0">
                  <Sparkles className="w-3 h-3 text-emerald-700 shrink-0" />
                  {selectedCard ? (
                    <span className="truncate">
                      <strong>{selectedCard.name}</strong> —{' '}
                      {selectedCard.type === 'UPGRADE'
                        ? 'Touchez une Figure verte.'
                        : selectedCard.type === 'TRAP'
                        ? 'Touchez un Terrain rouge.'
                        : 'Touchez une case verte.'}
                    </span>
                  ) : (
                    <span className="truncate">{statusBanner}</span>
                  )}
                </div>
                {selectedCard && (
                  <button
                    type="button"
                    onClick={() => setSelectedCardId(null)}
                    className="ml-1.5 px-1.5 py-0.2 bg-paper-light border border-ink text-[9px] font-bold uppercase hover:bg-paper-dark cursor-pointer shrink-0"
                  >
                    Annuler
                  </button>
                )}
              </motion.div>
            ) : showFlashInfo && latestLog ? (
              <motion.div
                key={latestLog.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                onClick={() => setIsLogDrawerOpen(true)}
                className="w-full h-full px-2.5 bg-ink text-paper border border-ink flex items-center justify-between text-[11px] font-mono cursor-pointer hover:bg-ink-muted transition-colors"
                title="Cliquer pour ouvrir les Dépêches AFP"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="bg-crimson text-white px-1.5 py-0.2 text-[9px] font-extrabold uppercase shrink-0">
                    FLASH AFP
                  </span>
                  <span className="font-serif font-bold text-gold-light truncate">
                    {latestLog.headline}
                  </span>
                  <span className="text-paper/80 truncate hidden md:inline">
                    — {latestLog.details}
                  </span>
                </div>
                <span className="text-[10px] text-paper/60 shrink-0 ml-2">
                  {latestLog.timestamp}
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}

      {/* =====================================================================
          FICHE COMPLÈTE DÉTAILLÉE (EMPLACEMENT FIXE ET DÉGAGÉ SUR LE CÔTÉ,
          JAMAIS PAR-DESSUS LES AUTRES CARTES DE LA MAIN)
      ===================================================================== */}
      <AnimatePresence>
        {inspectedCardEntry && (
          <motion.aside
            key={inspectedCardEntry.card.id}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 14 }}
            transition={{ duration: 0.14 }}
            aria-label="Fiche détaillée de la carte"
            className="pointer-events-none hidden md:block fixed right-3 bottom-36 z-40 w-72 sm:w-80 bg-paper-light border-4 border-ink shadow-press-lg p-3 text-ink"
          >
            {(() => {
              const { card: inspected, lane: inspectedLane } = inspectedCardEntry;
              const isHiddenEnemyTrap =
                inspected.type === 'TRAP' &&
                inspected.owner === 'AI' &&
                inspected.isFaceDown;

              if (isHiddenEnemyTrap) {
                return (
                  <div>
                    <div className="flex items-center justify-between border-b-2 border-ink pb-1.5 mb-2">
                      <span className="px-2 py-0.5 bg-crimson text-white font-mono font-black text-[10px] uppercase border border-ink">
                        DOSSIER CONFIDENTIEL IA
                      </span>
                      <span className="font-mono text-[10px] font-bold text-ink-muted">
                        Face cachée
                      </span>
                    </div>
                    <h4 className="font-serif font-black text-base text-ink mb-1">
                      Casserole Adverse Secrète
                    </h4>
                    <p className="font-mono text-[11px] text-ink/90 leading-snug bg-paper-dark/70 border border-ink/30 p-2">
                      Ce piège se déclenchera automatiquement si sa condition secrète est remplie sur ce Terrain.
                    </p>
                  </div>
                );
              }

              const InspectedIcon = ICON_MAP[inspected.iconName] || Sparkles;
              const badgeMeta = TYPE_BADGE_META[inspected.type];
              const effectiveCharisma =
                inspected.type === 'FIGURE' && inspectedLane
                  ? getEffectiveCardCharisma(inspected, inspectedLane, gameState.lanes)
                  : inspected.charisma;

              return (
                <div>
                  {/* En-tête de la fiche : Coût + Type + Alignements */}
                  <div className="flex items-center justify-between gap-1.5 border-b-2 border-ink pb-1.5 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 bg-gold text-white border border-ink px-2 py-0.5 font-mono font-black text-xs">
                        <Coins className="w-3 h-3" />
                        {inspected.cost}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 border border-ink uppercase ${badgeMeta.badgeClass}`}
                      >
                        {badgeMeta.label}
                      </span>
                    </div>
                    {inspected.alignments.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-end">
                        {inspected.alignments.map((align) => (
                          <span
                            key={align}
                            className="text-[9px] font-mono font-bold uppercase px-1 py-0.2 bg-paper-dark border border-ink/50 text-ink"
                          >
                            {align}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Illustration + Nom + Sous-titre */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-10 h-10 shrink-0 rounded-full bg-paper border-2 border-ink flex items-center justify-center shadow-press-sm">
                      <InspectedIcon className="w-5 h-5 text-ink" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-serif font-black text-base leading-tight text-ink">
                        {inspected.name}
                      </h4>
                      <p className="text-[11px] font-serif italic text-ink-muted leading-tight">
                        {inspected.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Description complète du pouvoir */}
                  <div className="bg-paper-dark/85 border border-ink p-2 mb-2">
                    <div className="text-[10px] font-mono font-black uppercase text-crimson tracking-wider mb-0.5">
                      {inspected.effect.name}
                    </div>
                    <p className="text-xs leading-snug text-ink font-medium">
                      {inspected.effect.description}
                    </p>
                  </div>

                  {/* Upgrades équipés si sur le plateau */}
                  {inspected.upgrades && inspected.upgrades.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {inspected.upgrades.map((upg) => (
                        <span
                          key={upg.id}
                          className="text-[9px] font-mono font-bold bg-royal text-white px-1.5 py-0.5 border border-ink"
                        >
                          + {upg.name} (+{upg.charisma}⚡/+{upg.credibility}❤️)
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Citation satirique */}
                  <p className="text-[10px] font-serif italic text-ink-muted border-l-2 border-ink/40 pl-2 mb-2">
                    {inspected.flavorText}
                  </p>

                  {/* Stats Charisme & Crédibilité */}
                  {(inspected.type === 'FIGURE' || inspected.type === 'UPGRADE') && (
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-ink/30 font-mono text-xs font-black">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-royal text-white border border-ink">
                        <Zap className="w-3.5 h-3.5 text-gold-light" />
                        Charisme : {inspected.type === 'UPGRADE' ? `+${effectiveCharisma}` : effectiveCharisma}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-800 text-white border border-ink">
                        <Heart className="w-3.5 h-3.5 text-emerald-200" />
                        Crédibilité : {inspected.type === 'UPGRADE' ? `+${inspected.credibility}` : inspected.credibility}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* =====================================================================
          3. PLATEAU CENTRAL : 3 TERRAINS CÔTE À CÔTE EN PERMANENCE
      ===================================================================== */}
      <main
        tabIndex={0}
        aria-label="Terrains de campagne"
        className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3.5 mb-1 flex-1 min-h-0 w-full overflow-hidden"
      >
        {gameState.lanes.map((lane) => (
          <LaneComponent
            key={lane.id}
            lane={lane}
            allLanes={gameState.lanes}
            currentTurn={gameState.turn}
            activeCard={activeCard}
            draggingBoardCard={draggingBoardCard}
            isAttackingLane={attackingLaneId === lane.id}
            feedbacks={gameState.floatingFeedbacks.filter(
              (f) => f.laneId === lane.id
            )}
            onSelectLane={handlePlayOnLane}
            onSelectTargetFigure={handlePlayUpgradeOnFigure}
            onRecallCard={handleRecallCard}
            onStartDragBoardCard={(card, sourceLaneId) => {
              setSelectedCardId(null);
              setDraggingBoardCard({ card, sourceLaneId });
            }}
            onEndDragBoardCard={() => {
              setDraggingBoardCard(null);
              setIsDragOverHand(false);
            }}
            onMoveBoardCardToLane={handleMoveBoardCardToLane}
            onHoverCard={(card, hoveredLane) =>
              setHoveredBoardEntry(card ? { card, lane: hoveredLane } : null)
            }
          />
        ))}
      </main>

      {/* =====================================================================
          4. BARRE INFÉRIEURE : MAIN EN ÉVENTAIL COMPACT + BARRE D'ACTION
      ===================================================================== */}
      <footer
        onDragOver={(e) => {
          if (draggingBoardCard) {
            e.preventDefault();
            setIsDragOverHand(true);
          }
        }}
        onDragLeave={() => setIsDragOverHand(false)}
        onDrop={(e) => {
          if (draggingBoardCard) {
            e.preventDefault();
            const cardIdToRecall = draggingBoardCard.card.id;
            setIsDragOverHand(false);
            setDraggingBoardCard(null);
            handleRecallCard(cardIdToRecall);
          }
        }}
        className={`relative px-2 py-1 md:px-4 md:py-2 shrink-0 w-full max-w-full overflow-x-hidden transition-all ${
          draggingBoardCard
            ? isDragOverHand
              ? 'bg-amber-100 border-4 border-gold ring-4 ring-gold/70 shadow-press-gold'
              : 'bg-amber-50/90 border-4 border-dashed border-gold ring-2 ring-gold/50 shadow-press-gold'
            : 'bg-paper-dark border-2 border-ink shadow-press'
        }`}
      >
        {/* Bandeau d'indication doré lorsque le joueur glisse une carte "NOUVEAU" depuis le plateau */}
        <AnimatePresence>
          {draggingBoardCard && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="pointer-events-none mb-1 py-1 px-2 bg-gold text-white border-2 border-ink font-mono font-black text-[10px] md:text-xs uppercase flex items-center justify-center gap-1.5 shadow-press-sm"
            >
              <Undo2 className="w-3.5 h-3.5 animate-bounce shrink-0" />
              <span className="truncate">
                Relâcher ici pour reprendre « {draggingBoardCard.card.name} » (+
                {draggingBoardCard.card.cost} Capital)
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Petit bandeau clair au-dessus de la main résumant le pouvoir de la carte sélectionnée */}
        <AnimatePresence>
          {selectedCard && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="w-full mb-1 py-0.5 px-2 bg-paper-light border border-ink text-[10px] md:text-xs font-mono text-ink flex items-center justify-between shadow-press-sm shrink-0"
            >
              <span className="truncate">
                <strong className="text-royal">{selectedCard.name}</strong>{' '}
                <span className="text-crimson font-bold">[{selectedCard.effect.name}]</span> :{' '}
                {selectedCard.effect.description}
              </span>
              <button
                type="button"
                onClick={() => setSelectedCardId(null)}
                className="ml-1 text-[9px] font-mono font-bold uppercase underline hover:text-crimson shrink-0 cursor-pointer"
              >
                Fermer
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-1.5 md:gap-2 w-full min-w-0">
          {/* Cartes en main en éventail compact avec léger chevauchement négatif (-space-x-3) */}
          <div className="flex-1 flex flex-nowrap items-center justify-center -space-x-3 sm:-space-x-1.5 md:space-x-2 py-0.5 min-w-0 w-full overflow-visible">
            {gameState.playerHand.length === 0 ? (
              <div className="py-2.5 px-2 text-center font-mono text-[11px] md:text-xs text-ink-muted italic w-full">
                Aucune carte en main — touchez « FIN TOUR » pour piocher.
              </div>
            ) : (
              gameState.playerHand.map((card, index) => {
                const playable = isCardPlayable(card);

                return (
                  <CardComponent
                    key={card.id}
                    card={card}
                    inHand
                    handIndex={index}
                    handTotal={gameState.playerHand.length}
                    isSelected={selectedCardId === card.id}
                    isPlayable={playable}
                    onClick={() => handleSelectHandCard(card)}
                    onHoverCard={(hovered) =>
                      setHoveredHandCardId(hovered ? hovered.id : null)
                    }
                    onDragStartCard={(dragged) => {
                      setSelectedCardId(dragged.id);
                    }}
                    onDragEndCard={() => {
                      setHoveredHandCardId(null);
                    }}
                  />
                );
              })
            )}
          </div>

          {/* Barre de contrôle sur UNE SEULE LIGNE compacte */}
          <div className="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-1.5 shrink-0 border-t lg:border-t-0 lg:border-l-2 border-ink/30 pt-1 lg:pt-0 lg:pl-3 text-xs">
            {/* Indicateur Capital 1/1 */}
            <div
              className="flex items-center gap-1 bg-paper-light border-2 border-ink px-1.5 py-1 shadow-press-sm shrink-0"
              title="Votre Capital Politique disponible ce tour-ci"
            >
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gold text-white border border-ink flex items-center justify-center font-mono font-black text-xs md:text-sm">
                {gameState.playerCapital}
              </div>
              <span className="font-mono font-black text-[11px] md:text-xs text-ink whitespace-nowrap">
                <span className="hidden sm:inline">Capital </span>
                {gameState.playerCapital}/{gameState.playerMaxCapital}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
              {/* Bouton Annuler */}
              <button
                type="button"
                disabled={
                  !hasPlayedThisTurn ||
                  gameState.phase !== 'PLAYER_ACTION' ||
                  isDebating
                }
                onClick={handleUndoTurn}
                aria-label="Annuler le tour"
                className="px-2 py-1.5 bg-amber-100 text-ink border-2 border-ink font-mono font-extrabold text-xs uppercase shadow-press-sm hover:bg-amber-200 transition-all flex items-center justify-center gap-1 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer shrink-0"
                title="Annuler le tour (reprendre les cartes posées ce tour-ci et récupérer le Capital)"
              >
                <Undo2 className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Annuler</span>
              </button>

              {/* Bouton Presse x2 */}
              <button
                type="button"
                disabled={
                  gameState.turn >= 7 ||
                  gameState.stakesMultiplier > 1 ||
                  gameState.phase !== 'PLAYER_ACTION' ||
                  isDebating
                }
                onClick={handleCallPress}
                className={`px-2 py-1.5 border-2 border-ink font-mono font-extrabold text-[11px] md:text-xs uppercase flex items-center gap-1 transition-transform shrink-0 whitespace-nowrap ${
                  gameState.stakesMultiplier > 1
                    ? 'bg-gold text-white cursor-default shadow-press-sm'
                    : gameState.turn >= 7
                    ? 'bg-paper-dark text-ink-faint cursor-not-allowed opacity-50'
                    : 'bg-crimson text-white hover:-translate-y-0.5 shadow-press-sm cursor-pointer'
                }`}
                title={
                  gameState.stakesMultiplier > 1
                    ? 'Presse convoquée : victoire finale x2 !'
                    : gameState.turn >= 7
                    ? 'Indisponible aux Tours 7 et 8'
                    : 'Convoquer la Presse : double la mise finale (x2)'
                }
              >
                <Megaphone className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" />
                <span>Presse x2</span>
              </button>

              {/* Bouton principal FIN TOUR 1/8 */}
              <button
                type="button"
                disabled={gameState.phase !== 'PLAYER_ACTION' || isDebating}
                onClick={handleEndTurn}
                className="px-2.5 py-1.5 md:px-4 md:py-2 bg-royal text-white border-2 border-ink font-mono font-black text-xs uppercase shadow-press hover:bg-royal-dark hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                <span className="md:hidden">
                  {isDebating
                    ? 'Débat...'
                    : `FIN TOUR ${gameState.turn}/${gameState.maxTurns}`}
                </span>
                <span className="hidden md:inline">
                  {isDebating
                    ? 'Débat...'
                    : `FIN DE TOUR (Tour ${gameState.turn}/${gameState.maxTurns})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          5. TIROIR LATÉRAL ESCAMOTABLE "FIL DÉPÊCHES AFP"
      ===================================================================== */}
      <ActionLog
        logs={gameState.logs}
        isOpen={isLogDrawerOpen}
        onClose={() => setIsLogDrawerOpen(false)}
      />

      {/* =====================================================================
          6. MODALE "COLLECTION (POOL DE CARTES)" (<dialog closedby="any">)
      ===================================================================== */}
      <dialog
        ref={collectionDialogRef}
        {...({ closedby: 'any' } as React.DialogHTMLAttributes<HTMLDialogElement>)}
        aria-labelledby="collection-dialog-title"
        className="w-full max-w-5xl bg-paper-light text-ink border-4 border-ink shadow-press-lg p-0 m-auto"
      >
        <div className="bg-ink text-paper px-5 py-3 flex items-center justify-between border-b-2 border-ink">
          <div className="flex items-center gap-2.5">
            <Library className="w-5 h-5 text-gold" />
            <div>
              <h2
                id="collection-dialog-title"
                className="font-serif font-black text-lg uppercase tracking-wide leading-none"
              >
                Archives de Campagne — Collection Complète des Cartes
              </h2>
              <p className="text-[11px] font-mono text-paper/75 mt-0.5">
                Pool de {CARD_DATABASE.length} cartes uniques composant chaque deck de 20 cartes
              </p>
            </div>
          </div>
          <form method="dialog">
            <button
              type="submit"
              aria-label="Fermer la collection"
              className="p-1 bg-crimson text-white border border-paper hover:bg-crimson-dark cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Barre de filtres par type */}
        <div className="bg-paper-dark px-5 py-2.5 border-b-2 border-ink flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'ALL', label: `Toutes (${CARD_DATABASE.length})` },
                {
                  id: 'FIGURE',
                  label: `Figures (${
                    CARD_DATABASE.filter((c) => c.type === 'FIGURE').length
                  })`,
                },
                {
                  id: 'UPGRADE',
                  label: `Idéologies (${
                    CARD_DATABASE.filter((c) => c.type === 'UPGRADE').length
                  })`,
                },
                {
                  id: 'EVENT',
                  label: `Une / Flash (${
                    CARD_DATABASE.filter((c) => c.type === 'EVENT').length
                  })`,
                },
                {
                  id: 'TRAP',
                  label: `Casseroles (${
                    CARD_DATABASE.filter((c) => c.type === 'TRAP').length
                  })`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCollectionFilter(tab.id)}
                className={`px-3 py-1 border-2 border-ink font-mono font-extrabold text-xs uppercase transition-colors cursor-pointer ${
                  collectionFilter === tab.id
                    ? 'bg-royal text-white shadow-press-sm'
                    : 'bg-paper-light text-ink hover:bg-paper'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-mono text-ink-muted">
            Triées par coût en Capital Politique croissant
          </span>
        </div>

        {/* Grille des cartes */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto text-left">
          {filteredCollection.map((tpl) => {
            const IconComp = ICON_MAP[tpl.iconName] || HelpCircle;
            const meta = TYPE_BADGE_META[tpl.type];
            const copiesInDeck = DOUBLED_BASE_TEMPLATE_IDS.has(tpl.templateId)
              ? 2
              : 1;

            return (
              <div
                key={tpl.templateId}
                className="bg-paper border-2 border-ink shadow-press-sm p-3.5 flex flex-col justify-between"
              >
                <div>
                  {/* En-tête : Coût, Type et Nombre d'exemplaires */}
                  <div className="flex items-center justify-between border-b border-ink/30 pb-1.5 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 bg-gold text-white border border-ink font-mono font-extrabold text-xs flex items-center justify-center shadow-press-sm">
                        {tpl.cost}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 ${meta.badgeClass}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-paper-dark border border-ink/40 text-ink">
                      {copiesInDeck}x dans le deck
                    </span>
                  </div>

                  {/* Icône et Nom */}
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className="w-11 h-11 bg-paper-dark border-2 border-ink flex items-center justify-center shrink-0">
                      <IconComp className="w-5 h-5 text-ink" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif font-black text-sm text-ink leading-tight">
                        {tpl.name}
                      </h3>
                      <p className="text-[11px] font-mono text-ink-muted truncate">
                        {tpl.subtitle}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tpl.alignments.map((a) => (
                          <span
                            key={a}
                            className="text-[9px] font-mono font-bold uppercase px-1 bg-paper-dark border border-ink/30 text-ink-muted"
                          >
                            {a.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pouvoir détaillé */}
                  <div className="bg-paper-light border border-ink/40 p-2 mb-2">
                    <div className="text-xs font-serif font-extrabold text-ink flex items-center gap-1 mb-0.5">
                      <Award className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>{tpl.effect.name}</span>
                    </div>
                    <p className="text-xs text-ink leading-snug">
                      {tpl.effect.description}
                    </p>
                  </div>

                  {/* Citation satirique */}
                  <p className="text-[11px] font-serif italic text-ink-muted border-l-2 border-gold pl-2 mb-2">
                    {tpl.flavorText}
                  </p>
                </div>

                {/* Pied de carte : Stats pour Figures et Upgrades */}
                {(tpl.type === 'FIGURE' || tpl.type === 'UPGRADE') && (
                  <div className="flex items-center justify-between pt-2 border-t border-ink/30 font-mono font-black text-xs">
                    <span className="px-2 py-0.5 bg-gold text-white border border-ink flex items-center gap-1">
                      <Megaphone className="w-3.5 h-3.5" />
                      Charisme :{' '}
                      {tpl.type === 'UPGRADE' && tpl.charisma >= 0
                        ? `+${tpl.charisma}`
                        : tpl.charisma}
                    </span>
                    <span
                      className={`px-2 py-0.5 border border-ink flex items-center gap-1 ${
                        tpl.credibility < 0
                          ? 'bg-crimson text-white'
                          : 'bg-royal text-white'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5" />
                      Crédibilité :{' '}
                      {tpl.type === 'UPGRADE' && tpl.credibility >= 0
                        ? `+${tpl.credibility}`
                        : tpl.credibility}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-paper-dark px-5 py-3 border-t-2 border-ink flex justify-end">
          <form method="dialog">
            <button
              type="submit"
              className="px-4 py-1.5 bg-ink text-paper font-mono font-bold text-xs uppercase shadow-press-sm cursor-pointer"
            >
              Fermer la Collection
            </button>
          </form>
        </div>
      </dialog>

      {/* =====================================================================
          7. MODALE "DÉFAUSSE (CARTES ÉLIMINÉES & JOUÉES)" (<dialog closedby="any">)
      ===================================================================== */}
      <dialog
        ref={discardDialogRef}
        {...({ closedby: 'any' } as React.DialogHTMLAttributes<HTMLDialogElement>)}
        aria-labelledby="discard-dialog-title"
        className="w-full max-w-3xl bg-paper-light text-ink border-4 border-ink shadow-press-lg p-0 m-auto"
      >
        <div className="bg-ink text-paper px-5 py-3 flex items-center justify-between border-b-2 border-ink">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-crimson-light" />
            <h2
              id="discard-dialog-title"
              className="font-serif font-black text-lg uppercase tracking-wide"
            >
              Archives de la Défausse — Cartes Éliminées ou Jouées
            </h2>
          </div>
          <form method="dialog">
            <button
              type="submit"
              aria-label="Fermer la défausse"
              className="p-1 bg-crimson text-white border border-paper hover:bg-crimson-dark cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto text-left">
          {/* Votre Défausse */}
          <div className="bg-paper border-2 border-ink p-3">
            <h3 className="font-serif font-extrabold text-sm uppercase text-royal border-b-2 border-ink pb-1.5 mb-2.5">
              Votre Défausse ({gameState.playerDiscard.length})
            </h3>
            {gameState.playerDiscard.length === 0 ? (
              <p className="text-xs font-mono text-ink-muted italic py-6 text-center">
                Aucune de vos cartes n&apos;est encore dans la défausse.
              </p>
            ) : (
              <div className="space-y-2">
                {gameState.playerDiscard.map((card, i) => (
                  <div
                    key={`${card.id}-pdisc-${i}`}
                    className="p-2 bg-paper-light border border-ink flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-serif font-bold text-xs text-ink">
                        {card.name}
                      </div>
                      <div className="text-[10px] font-mono text-ink-muted">
                        {TYPE_BADGE_META[card.type].label} • {card.effect.name}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-gold text-white font-mono font-bold text-[10px] border border-ink">
                      Coût {card.cost}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Défausse Adverse (IA) */}
          <div className="bg-paper border-2 border-ink p-3">
            <h3 className="font-serif font-extrabold text-sm uppercase text-crimson border-b-2 border-ink pb-1.5 mb-2.5">
              Défausse Opposition IA ({gameState.aiDiscard.length})
            </h3>
            {gameState.aiDiscard.length === 0 ? (
              <p className="text-xs font-mono text-ink-muted italic py-6 text-center">
                Aucune carte adverse dans la défausse.
              </p>
            ) : (
              <div className="space-y-2">
                {gameState.aiDiscard.map((card, i) => (
                  <div
                    key={`${card.id}-adisc-${i}`}
                    className="p-2 bg-paper-light border border-ink flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-serif font-bold text-xs text-ink">
                        {card.name}
                      </div>
                      <div className="text-[10px] font-mono text-ink-muted">
                        {TYPE_BADGE_META[card.type].label} • {card.effect.name}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-crimson text-white font-mono font-bold text-[10px] border border-ink">
                      Coût {card.cost}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-paper-dark px-5 py-3 border-t-2 border-ink flex justify-end">
          <form method="dialog">
            <button
              type="submit"
              className="px-4 py-1.5 bg-ink text-paper font-mono font-bold text-xs uppercase shadow-press-sm cursor-pointer"
            >
              Fermer
            </button>
          </form>
        </div>
      </dialog>

      {/* =====================================================================
          8. MODALE DES RÈGLES DU JEU (<dialog closedby="any">)
      ===================================================================== */}
      <dialog
        ref={rulesDialogRef}
        {...({ closedby: 'any' } as React.DialogHTMLAttributes<HTMLDialogElement>)}
        aria-labelledby="rules-dialog-title"
        className="w-full max-w-2xl bg-paper-light text-ink border-4 border-ink shadow-press-lg p-0 m-auto"
      >
        <div className="bg-ink text-paper px-4 py-3 flex items-center justify-between border-b-2 border-ink">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gold" />
            <h2
              id="rules-dialog-title"
              className="font-serif font-black text-lg uppercase tracking-wide"
            >
              Manuel de Campagne — Règles de Politicard
            </h2>
          </div>
          <form method="dialog">
            <button
              type="submit"
              autoFocus
              aria-label="Fermer les règles"
              className="p-1 bg-crimson text-white border border-paper hover:bg-crimson-dark cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="p-5 space-y-4 text-left font-sans text-sm leading-relaxed max-h-[75vh] overflow-y-auto">
          <div className="bg-paper-dark border-l-4 border-crimson p-3">
            <h3 className="font-serif font-extrabold text-base text-ink mb-1">
              1. Objectif de la Campagne (8 Tours)
            </h3>
            <p className="text-xs text-ink-muted">
              Affrontez l&apos;Opposition IA sur <strong>3 Terrains médiatiques et politiques</strong> pendant 8 tours. Deux façons de remporter l&apos;élection :
            </p>
            <ul className="list-disc list-inside text-xs text-ink mt-1.5 space-y-1 font-medium">
              <li>
                <strong>Victoire Instantanée (Raz-de-Marée) :</strong> Faites grimper la Jauge d&apos;Opinion Publique jusqu&apos;à <strong>+{OPINION_MAX}</strong> (à <strong>-{OPINION_MAX}</strong>, vous perdez immédiatement !).
              </li>
              <li>
                <strong>Victoire aux Points (Fin du Tour 8) :</strong> Dominez davantage de <strong>Terrains</strong> que l&apos;adversaire. En cas d&apos;égalité sur le nombre de Terrains gagnés, le vainqueur est départagé par la <strong>Jauge d&apos;Opinion Publique</strong> (et si elle est à 0, par le <strong>Charisme total cumulé</strong> sur le plateau).
              </li>
              <li>
                <strong>Hégémonie Médiatique (+3 Opinion) :</strong> Contrôler simultanément les <strong>3 Terrains</strong> à la fin d&apos;un tour octroie un bonus immédiat de <strong>+3 Opinion</strong> !
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border-2 border-ink p-3 bg-paper">
              <h4 className="font-serif font-bold text-sm uppercase text-royal mb-1">
                2. Capital Politique & Pioche Dynamique
              </h4>
              <p className="text-xs text-ink-muted">
                Deck de <strong>20 cartes</strong>. Au début de chaque tour, vous piochez 1 carte (ou jusqu&apos;à avoir <strong>3 cartes en main</strong> si vous en aviez moins).
              </p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>
                  <strong>FIGURE :</strong> Glissez-la sur un emplacement libre (illuminé en vert). Possède du <em>Charisme</em> (Orange) et de la <em>Crédibilité</em> (Bleu/Rouge).
                </li>
                <li>
                  <strong>IDÉOLOGIE (Upgrade) :</strong> <strong>1 seul Upgrade max</strong> par Figure alliée (sauf <em>Le Stratège &laquo; En Même Temps &raquo;</em>).
                </li>
                <li>
                  <strong>UNE / FLASH (Événement) :</strong> Effet immédiat (dégâts, pioche, sondage).
                </li>
                <li>
                  <strong>CASSEROLE (Piège) :</strong> Posée comme un dossier confidentiel sur un terrain, explose quand l&apos;adversaire y agit !
                </li>
              </ul>
            </div>

            <div className="border-2 border-ink p-3 bg-paper">
              <h4 className="font-serif font-bold text-sm uppercase text-crimson mb-1">
                3. Combat Face-à-Face (Slot vs Slot) & Bluff
              </h4>
              <p className="text-xs text-ink-muted">
                À la fin de chaque tour, les Figures s&apos;affrontent emplacement par emplacement (Case #1 vs #1, #2 vs #2, #3 vs #3) :
              </p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>
                  <strong>Duel Face-à-Face :</strong> Si deux Figures se font face sur le même numéro d&apos;emplacement, elles s&apos;infligent mutuellement leur Charisme sur leur Crédibilité.
                </li>
                <li>
                  <strong>Case libre en face (+1 Opinion) :</strong> Une Figure sans adversaire directement en face d&apos;elle inflige <strong>+1 point direct à l&apos;Opinion</strong> (plafonné à <strong>2 points max</strong> par terrain et par tour).
                </li>
                <li>
                  <strong>Démission :</strong> Toute Figure tombant à 0 de Crédibilité est éliminée et rapporte <strong>+1 Opinion</strong> à l&apos;adversaire.
                </li>
                <li>
                  <strong>Convoquer la Presse (x2) :</strong> Avant le tour 7, doublez les points de classement misés pour la victoire finale !
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-paper-dark px-4 py-3 border-t-2 border-ink flex justify-end">
          <form method="dialog">
            <button
              type="submit"
              className="px-4 py-1.5 bg-ink text-paper font-mono font-bold text-xs uppercase shadow-press-sm cursor-pointer"
            >
              Compris, retour au QG !
            </button>
          </form>
        </div>
      </dialog>

      {/* =====================================================================
          9. MODALE DE FIN DE PARTIE ("UNE DE JOURNAL : ÉDITION SPÉCIALE")
      ===================================================================== */}
      <dialog
        ref={gameOverDialogRef}
        {...({ closedby: 'any' } as React.DialogHTMLAttributes<HTMLDialogElement>)}
        aria-labelledby="gameover-dialog-title"
        className="w-full max-w-3xl bg-paper-light text-ink border-4 border-ink shadow-press-lg p-0 m-auto"
      >
        {/* Bandeau Édition Spéciale */}
        <div
          className={`px-5 py-3 border-b-4 border-double border-ink flex items-center justify-between ${
            gameState.winner === 'PLAYER'
              ? 'bg-royal text-white'
              : gameState.winner === 'AI'
              ? 'bg-crimson text-white'
              : 'bg-ink text-paper'
          }`}
        >
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            <span className="font-mono font-extrabold text-xs uppercase tracking-widest">
              UNE DU JOUR • ÉDITION SPÉCIALE SCRUTIN NATIONAL
            </span>
          </div>
          <span className="font-mono text-xs font-bold">
            Tour {gameState.turn}/{gameState.maxTurns}
          </span>
        </div>

        <div className="p-6 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-ink bg-paper-dark shadow-press">
            {gameState.winner === 'PLAYER' ? (
              <Trophy className="w-9 h-9 text-gold" />
            ) : gameState.winner === 'AI' ? (
              <AlertTriangle className="w-9 h-9 text-crimson" />
            ) : (
              <Award className="w-9 h-9 text-ink" />
            )}
          </div>

          <h2
            id="gameover-dialog-title"
            className="font-serif font-black text-3xl md:text-4xl uppercase tracking-tight text-ink border-y-2 border-ink py-2"
          >
            {gameState.winner === 'PLAYER'
              ? 'ÉDITION SPÉCIALE : VICTOIRE TRIOMPHALE !'
              : gameState.winner === 'AI'
              ? 'ÉDITION SPÉCIALE : DÉFAITE CUISANTE !'
              : 'ÉDITION SPÉCIALE : ÉGALITÉ PARFAITE !'}
          </h2>

          {/* Bandeau synthétique explicite du verdict des 3 Terrains */}
          <div className="bg-ink text-paper px-4 py-2.5 border-2 border-ink font-mono text-xs md:text-sm font-bold shadow-press-sm">
            <div>{lanesInlineSummary}</div>
            <div className="text-gold-light font-extrabold mt-1 uppercase">
              ➔ Bilan des Terrains : {playerLanesDominated} Terrain(s) pour Vous contre{' '}
              {aiLanesDominated} pour l&apos;IA
              {playerLanesDominated === aiLanesDominated &&
                gameState.victoryReason !== 'LANDSLIDE_PLAYER' &&
                gameState.victoryReason !== 'LANDSLIDE_AI' &&
                (gameState.opinion !== 0
                  ? ` (Départage à l'Opinion : ${
                      gameState.opinion > 0
                        ? `+${gameState.opinion}`
                        : gameState.opinion
                    })`
                  : ` (Départage au Charisme cumulé : ${totalPlayerCharisma} à ${totalAICharisma})`)}
            </div>
          </div>

          <p className="font-serif italic text-sm md:text-base text-ink-muted max-w-xl mx-auto">
            {gameState.victoryReason === 'LANDSLIDE_PLAYER' &&
              `Raz-de-marée historique (+${OPINION_MAX} Opinion) ! Les sondages ont explosé le plafond, l’Opposition quitte la vie politique.`}
            {gameState.victoryReason === 'LANDSLIDE_AI' &&
              `Naufrage dans l’Opinion (-${OPINION_MAX}) ! Les casseroles et les punchlines adverses ont eu raison de votre campagne.`}
            {gameState.victoryReason === 'POINTS_PLAYER' &&
              (playerLanesDominated > aiLanesDominated
                ? `Au terme des 8 tours de campagne, vous remportez l'élection (${playerLanesDominated} Terrain(s) gagné(s) à ${aiLanesDominated}) !`
                : gameState.opinion > 0
                ? `Égalité sur les Terrains (${playerLanesDominated} partout) : vous l'emportez grâce à la Jauge d'Opinion Publique (+${gameState.opinion}) !`
                : `Égalité sur les Terrains et l'Opinion (0) : vous l'emportez au Charisme total cumulé sur le plateau (${totalPlayerCharisma} à ${totalAICharisma}) !`)}
            {gameState.victoryReason === 'POINTS_AI' &&
              (aiLanesDominated > playerLanesDominated
                ? `Au soir du 8e tour, l'Opposition s'impose dans les urnes (${aiLanesDominated} Terrain(s) gagné(s) à ${playerLanesDominated}).`
                : gameState.opinion < 0
                ? `Égalité sur les Terrains (${playerLanesDominated} partout) : l'Opposition l'emporte grâce à la Jauge d'Opinion Publique (${gameState.opinion}).`
                : `Égalité sur les Terrains et l'Opinion (0) : l'Opposition l'emporte au Charisme total cumulé sur le plateau (${totalAICharisma} à ${totalPlayerCharisma}).`)}
            {gameState.victoryReason === 'TIE_OPINION' &&
              'Aucun camp n’a réussi à se départager ni sur les terrains, ni dans l’opinion, ni au Charisme cumulé. Un recomptage des voix est exigé !'}
          </p>

          {/* Récapitulatif détaillé des 3 Terrains */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left pt-1">
            {gameState.lanes.map((lane) => {
              const pScore = getLaneTotalCharisma(lane, 'PLAYER', gameState.lanes);
              const aScore = getLaneTotalCharisma(lane, 'AI', gameState.lanes);
              const pWin = pScore > aScore;
              const aWin = aScore > pScore;
              return (
                <div
                  key={lane.id}
                  className={`p-3 border-2 border-ink shadow-press-sm ${
                    pWin
                      ? 'bg-royal/10 border-royal'
                      : aWin
                      ? 'bg-crimson/10 border-crimson'
                      : 'bg-paper-dark'
                  }`}
                >
                  <div className="font-serif font-black text-xs uppercase text-ink truncate border-b border-ink/30 pb-1">
                    {lane.name}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-mono font-black">
                    <span className="px-2 py-0.5 bg-royal text-white border border-ink">
                      Vous : {pScore}
                    </span>
                    <span className="text-ink-muted">vs</span>
                    <span className="px-2 py-0.5 bg-crimson text-white border border-ink">
                      IA : {aScore}
                    </span>
                  </div>
                  <div
                    className={`mt-2 text-xs font-mono uppercase font-extrabold ${
                      pWin
                        ? 'text-royal'
                        : aWin
                        ? 'text-crimson'
                        : 'text-ink-muted'
                    }`}
                  >
                    {pWin
                      ? `✓ Gagné (${pScore} à ${aScore})`
                      : aWin
                      ? `✗ Perdu (${pScore} à ${aScore})`
                      : `= Égalité (${pScore} à ${aScore})`}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-paper-dark border border-ink p-2.5 font-mono text-xs flex flex-wrap items-center justify-around gap-2">
            <span>
              <strong>Opinion Finale :</strong>{' '}
              {gameState.opinion > 0
                ? `+${gameState.opinion}`
                : gameState.opinion}{' '}
              / {OPINION_MAX}
            </span>
            <span>
              <strong>Charisme Cumulé :</strong> Vous ({totalPlayerCharisma}) vs IA ({totalAICharisma})
            </span>
            <span>
              <strong>Points de Classement en Jeu :</strong>{' '}
              {gameState.winner === 'PLAYER'
                ? `+${gameState.stakesMultiplier} Pt(s)`
                : gameState.winner === 'AI'
                ? `-${gameState.stakesMultiplier} Pt(s)`
                : '0 Pt'}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleStartNewGame}
              className="px-6 py-2.5 bg-royal text-white border-2 border-ink font-mono font-extrabold text-sm uppercase shadow-press hover:bg-royal-dark flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Nouvelle Campagne</span>
            </button>
            <form method="dialog">
              <button
                type="submit"
                className="px-4 py-2.5 bg-paper-dark text-ink border-2 border-ink font-mono font-bold text-xs uppercase shadow-press-sm hover:bg-paper-aged cursor-pointer"
              >
                Examiner le Plateau
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};
