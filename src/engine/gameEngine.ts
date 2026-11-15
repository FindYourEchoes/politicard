import { buildDeckForOwner } from '../data/cards';
import { createInitialLanes } from '../data/lanes';
import {
  ActionLogEntry,
  Card,
  FloatingFeedback,
  GameState,
  Lane,
  VictoryReason,
} from '../types/game';

export const OPINION_MIN = -20;
export const OPINION_MAX = 20;
const MAX_TURNS = 8;
const MAX_CARDS_PER_LANE = 3;
const MAX_TRAPS_PER_LANE = 2;
const MAX_UNOPPOSED_OPINION_DAMAGE = 2;

export function getCardAtSlot(cards: Card[], slotIndex: number): Card | undefined {
  return cards.find((c, idx) => (c.slotIndex ?? idx) === slotIndex);
}

export function getFirstFreeSlotIndex(cards: Card[]): number {
  for (let s = 0; s < MAX_CARDS_PER_LANE; s++) {
    if (!getCardAtSlot(cards, s)) {
      return s;
    }
  }
  return -1;
}

let logSequence = 1;
let feedbackSequence = 1;
let trapAlertSequence = 1;

function getTimestamp(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${mins}:${secs}`;
}

export function createLogEntry(
  turn: number,
  actor: 'PLAYER' | 'AI' | 'SYSTEM',
  headline: string,
  details: string,
  category: ActionLogEntry['category']
): ActionLogEntry {
  logSequence += 1;
  return {
    id: `log-${logSequence}-${Date.now()}`,
    turn,
    timestamp: getTimestamp(),
    actor,
    headline,
    details,
    category,
  };
}

export function createFeedback(
  laneId: string,
  targetSide: 'PLAYER' | 'AI' | 'OPINION',
  text: string,
  tone: FloatingFeedback['tone'],
  cardId?: string
): FloatingFeedback {
  feedbackSequence += 1;
  return {
    id: `fb-${feedbackSequence}-${Date.now()}`,
    laneId,
    targetSide,
    cardId,
    text,
    tone,
  };
}

export function clampOpinion(value: number): number {
  return Math.max(OPINION_MIN, Math.min(OPINION_MAX, value));
}

/**
 * Vérifie si une Figure peut recevoir un nouvel Upgrade :
 * Maximum 1 seul Upgrade par Figure, SAUF pour "Le Stratège 'En Même Temps'" (EN_MEME_TEMPS_AGILE).
 */
export function canEquipUpgradeOnFigure(figure: Card): boolean {
  if (figure.type !== 'FIGURE') return false;
  if (figure.effect.code === 'EN_MEME_TEMPS_AGILE') return true;
  return figure.upgrades.length < 1;
}

export function drawCards(
  state: GameState,
  owner: 'PLAYER' | 'AI',
  count: number
): GameState {
  const nextState = structuredClone(state);
  const deckKey = owner === 'PLAYER' ? 'playerDeck' : 'aiDeck';
  const handKey = owner === 'PLAYER' ? 'playerHand' : 'aiHand';

  for (let i = 0; i < count; i++) {
    if (nextState[deckKey].length === 0) {
      nextState[deckKey] = buildDeckForOwner(owner);
    }
    const drawn = nextState[deckKey].shift();
    if (drawn && nextState[handKey].length < 8) {
      nextState[handKey].push(drawn);
    }
  }

  return nextState;
}

export function createInitialGameState(): GameState {
  const playerDeck = buildDeckForOwner('PLAYER');
  const aiDeck = buildDeckForOwner('AI');

  // Chaque joueur commence avec 3 cartes en main + pioche 1 carte au début du Tour 1 (4 cartes sur un deck de 20)
  const playerHand = playerDeck.splice(0, 4);
  const aiHand = aiDeck.splice(0, 4);

  // Garantit que l'IA commence avec au moins 2 Figures (dont au moins une de coût <= 3) pour occuper plusieurs terrains tôt
  const ensureAIFigureInHand = (maxCost: number) => {
    const hasAffordableFig = aiHand.some(
      (c) => c.type === 'FIGURE' && c.cost <= maxCost
    );
    if (!hasAffordableFig) {
      const deckFigIndex = aiDeck.findIndex(
        (c) => c.type === 'FIGURE' && c.cost <= maxCost
      );
      const nonFigHandIndex = aiHand.findIndex((c) => c.type !== 'FIGURE');
      if (deckFigIndex !== -1 && nonFigHandIndex !== -1) {
        const [deckFig] = aiDeck.splice(deckFigIndex, 1);
        const [replaced] = aiHand.splice(nonFigHandIndex, 1, deckFig);
        aiDeck.push(replaced);
      }
    }
  };
  ensureAIFigureInHand(2);
  if (aiHand.filter((c) => c.type === 'FIGURE').length < 2) {
    const deckFigIndex = aiDeck.findIndex((c) => c.type === 'FIGURE' && c.cost <= 3);
    const nonFigHandIndex = aiHand.findIndex((c) => c.type !== 'FIGURE');
    if (deckFigIndex !== -1 && nonFigHandIndex !== -1) {
      const [deckFig] = aiDeck.splice(deckFigIndex, 1);
      const [replaced] = aiHand.splice(nonFigHandIndex, 1, deckFig);
      aiDeck.push(replaced);
    }
  }

  const initialLog = createLogEntry(
    1,
    'SYSTEM',
    'OUVERTURE DE LA CAMPAGNE ÉLECTORALE',
    '8 tours avant le scrutin final. Contrôlez les 3 Terrains simultanément pour gagner +3 Opinion (Hégémonie Médiatique) !',
    'PRESS'
  );

  return {
    turn: 1,
    maxTurns: MAX_TURNS,
    phase: 'PLAYER_ACTION',
    opinion: 0,
    stakesMultiplier: 1,
    pressCalledBy: 'NONE',
    playerCapital: 1,
    playerMaxCapital: 1,
    aiCapital: 1,
    aiMaxCapital: 1,
    playerNextTurnCapitalBonus: 0,
    aiNextTurnCapitalBonus: 0,
    playerHand,
    aiHand,
    playerDeck,
    aiDeck,
    playerDiscard: [],
    aiDiscard: [],
    lanes: createInitialLanes(),
    logs: [initialLog],
    floatingFeedbacks: [],
    triggeredTrapAlert: null,
    winner: null,
    victoryReason: null,
  };
}

/**
 * Calcule le Charisme effectif d'une Figure sur un Terrain donné (incluant ses Upgrades, son passif et le bonus de Terrain).
 */
export function getEffectiveCardCharisma(
  card: Card,
  lane: Lane,
  allLanes?: Lane[]
): number {
  if (card.type !== 'FIGURE') return card.charisma;

  let total = card.charisma;

  // 1. Bonus des Upgrades équipés
  for (const upg of card.upgrades) {
    total += upg.charisma;
  }

  // 2. Effet passif : Le Stratège "En Même Temps" (+2 Charisme suppl. par Upgrade)
  if (card.effect.code === 'EN_MEME_TEMPS_AGILE' && card.upgrades.length > 0) {
    total += card.upgrades.length * 2;
  }

  // 3. Effet passif : L'Influenceur Politique (+3 sur La Rue ou JT de 20h)
  if (
    card.effect.code === 'INFLUENCEUR_RESEAUX' &&
    (lane.id === 'lane-la-rue' || lane.id === 'lane-jt-20h')
  ) {
    total += 3;
  }

  // 4. Effet passif : Le Magnat Populiste (+2 s'il y a au moins un adversaire sur ce terrain)
  const opposingCards = card.owner === 'PLAYER' ? lane.aiCards : lane.playerCards;
  if (card.effect.code === 'MAGNAT_POPULISTE_CLASH' && opposingCards.length > 0) {
    total += 2;
  }

  // 5. Effet passif : Le Tribun Insoumis (+1 Charisme pour chaque autre Figure alliée sur l'ensemble du plateau)
  if (card.effect.code === 'TRIBUN_INSOUMIS_RALLY') {
    const lanesToScan = allLanes ?? [lane];
    let otherFriendlyCount = 0;
    for (const scannedLane of lanesToScan) {
      const allies =
        card.owner === 'PLAYER' ? scannedLane.playerCards : scannedLane.aiCards;
      for (const ally of allies) {
        if (ally.id !== card.id && ally.credibility > 0) {
          otherFriendlyCount += 1;
        }
      }
    }
    total += otherFriendlyCount;
  }

  // 6. Effet d'aura : La Tribune Populaire (+1 aux autres Figures alliées sur ce terrain)
  const friendlyCards = card.owner === 'PLAYER' ? lane.playerCards : lane.aiCards;
  for (const ally of friendlyCards) {
    if (ally.id !== card.id && ally.effect.code === 'TRIBUNE_PEUPLE_RALLY') {
      total += 1;
    }
  }

  // 7. Modificateur de Terrain
  if (lane.modifierCode === 'JT_20H_MEDIA_AMPLIFIER') {
    if (card.alignments.includes('MEDIATIQUE') || card.upgrades.length > 0) {
      total += 1;
    }
  } else if (lane.modifierCode === 'HEMICYCLE_INSTITUTIONAL') {
    if (
      card.alignments.includes('INSTITUTIONNEL') ||
      card.alignments.includes('TECHNOCRATE')
    ) {
      total += 1;
    }
  } else if (lane.modifierCode === 'LA_RUE_POPULIST_ARENA') {
    if (card.alignments.includes('POPULISTE') || card.alignments.includes('MILITANT')) {
      total += 2;
    }
  }

  return Math.max(0, total);
}

/**
 * Calcule le Charisme total d'un camp sur un Terrain (seules les cartes encore crédibles > 0 comptent).
 */
export function getLaneTotalCharisma(
  lane: Lane,
  side: 'PLAYER' | 'AI',
  allLanes?: Lane[]
): number {
  const cards = side === 'PLAYER' ? lane.playerCards : lane.aiCards;
  return cards
    .filter((c) => c.credibility > 0)
    .reduce((acc, card) => acc + getEffectiveCardCharisma(card, lane, allLanes), 0);
}

/**
 * Vérifie si la Jauge d'Opinion a atteint un seuil de victoire instantanée (+20 ou -20).
 */
export function checkInstantVictory(state: GameState): GameState {
  if (state.winner) return state;

  if (state.opinion >= OPINION_MAX) {
    const next = structuredClone(state);
    next.opinion = OPINION_MAX;
    next.phase = 'GAME_OVER';
    next.winner = 'PLAYER';
    next.victoryReason = 'LANDSLIDE_PLAYER';
    next.logs.unshift(
      createLogEntry(
        next.turn,
        'SYSTEM',
        `RAZ-DE-MARÉE ÉLECTORAL (+${OPINION_MAX}) !`,
        `L'Opinion Publique bascule totalement en votre faveur (+${OPINION_MAX}). Vous remportez ${next.stakesMultiplier} point(s) de classement !`,
        'VICTORY'
      )
    );
    return next;
  }

  if (state.opinion <= OPINION_MIN) {
    const next = structuredClone(state);
    next.opinion = OPINION_MIN;
    next.phase = 'GAME_OVER';
    next.winner = 'AI';
    next.victoryReason = 'LANDSLIDE_AI';
    next.logs.unshift(
      createLogEntry(
        next.turn,
        'SYSTEM',
        `DÉROUTE HISTORIQUE (${OPINION_MIN}) !`,
        `L'Opinion Publique atteint ${OPINION_MIN}. L'Opposition remporte ${next.stakesMultiplier} point(s) de classement.`,
        'VICTORY'
      )
    );
    return next;
  }

  return state;
}

/**
 * Déclenche les pièges ennemis présents sur un terrain lorsqu'une Figure est jouée ou équipée.
 */
function triggerOpposingTrapsOnCardAction(
  state: GameState,
  lane: Lane,
  targetCard: Card,
  actor: 'PLAYER' | 'AI'
): { trapCancelledEntry: boolean; cardEliminated: boolean } {
  const opposingTraps = actor === 'PLAYER' ? lane.aiTraps : lane.playerTraps;
  const opposingDiscard = actor === 'PLAYER' ? state.aiDiscard : state.playerDiscard;
  let trapCancelledEntry = false;
  let cardEliminated = false;

  if (opposingTraps.length === 0) {
    return { trapCancelledEntry, cardEliminated };
  }

  // Cas spécial : La Porte-Parole de Choc désamorce tous les pièges ennemis sur le terrain !
  if (targetCard.effect.code === 'PORTE_PAROLE_ANTI_TRAP') {
    const count = opposingTraps.length;
    targetCard.credibility += count;
    targetCard.maxCredibility += count;
    while (opposingTraps.length > 0) {
      const removed = opposingTraps.shift()!;
      removed.isFaceDown = false;
      opposingDiscard.push(removed);
    }

    trapAlertSequence += 1;
    state.triggeredTrapAlert = {
      id: `trap-alert-${trapAlertSequence}-${Date.now()}`,
      trapName: 'CASSEROLE DÉSAMORCÉE !',
      targetName: targetCard.name,
      laneName: lane.name,
      effectSummary: `${targetCard.name} neutralise ${count} piège(s) et gagne +${count} Crédibilité !`,
      triggeredByOwner: actor,
    };

    state.logs.unshift(
      createLogEntry(
        state.turn,
        actor,
        `CASSEROLE DÉSAMORCÉE SUR ${lane.name.toUpperCase()}`,
        `${targetCard.name} neutralise ${count} piège(s) adverse(s) grâce à sa Langue de Bois Blindée (+${count} Crédibilité) !`,
        'TRAP'
      )
    );
    state.floatingFeedbacks.push(
      createFeedback(lane.id, actor, `Piège annulé ! +${count} Créd.`, 'buff', targetCard.id)
    );
    return { trapCancelledEntry: false, cardEliminated: false };
  }

  // Sinon, le premier piège ennemi se déclenche !
  const triggeredTrap = opposingTraps.shift()!;
  triggeredTrap.isFaceDown = false;
  opposingDiscard.push(triggeredTrap);

  const trapOwner = actor === 'PLAYER' ? 'AI' : 'PLAYER';
  trapAlertSequence += 1;

  if (triggeredTrap.effect.code === 'TRAP_MICRO_OUVERT') {
    trapCancelledEntry = true;
    targetCard.credibility -= 3;
    targetCard.charisma = Math.max(0, targetCard.charisma - 1);

    state.triggeredTrapAlert = {
      id: `trap-alert-${trapAlertSequence}-${Date.now()}`,
      trapName: `SCANDALE : ${triggeredTrap.name.toUpperCase()} !`,
      targetName: targetCard.name,
      laneName: lane.name,
      effectSummary: `${targetCard.name} subit -3 Crédibilité, -1 Charisme et voit son bonus d'entrée annulé !`,
      triggeredByOwner: trapOwner,
    };

    state.logs.unshift(
      createLogEntry(
        state.turn,
        trapOwner,
        `CASSEROLE ! « LE MICRO OUVERT » EXPLOSE !`,
        `Sur ${lane.name}, ${targetCard.name} subit -3 Crédibilité, -1 Charisme et voit son effet d'entrée annulé !`,
        'TRAP'
      )
    );
    state.floatingFeedbacks.push(
      createFeedback(lane.id, actor, 'MICRO OUVERT ! -3 CRÉD.', 'trap', targetCard.id)
    );
  } else if (triggeredTrap.effect.code === 'TRAP_TWEET_2012') {
    const destroyedUpgrades = targetCard.upgrades.length;
    targetCard.upgrades = [];
    targetCard.credibility -= 2;

    state.triggeredTrapAlert = {
      id: `trap-alert-${trapAlertSequence}-${Date.now()}`,
      trapName: `SCANDALE : ${triggeredTrap.name.toUpperCase()} !`,
      targetName: targetCard.name,
      laneName: lane.name,
      effectSummary: `${targetCard.name} perd ses Upgrades (${destroyedUpgrades}) et subit -2 Crédibilité !`,
      triggeredByOwner: trapOwner,
    };

    state.logs.unshift(
      createLogEntry(
        state.turn,
        trapOwner,
        `SCANDALE ! « TWEET DE 2012 DÉTERRÉ » !`,
        `Sur ${lane.name}, ${targetCard.name} perd ${destroyedUpgrades} Upgrade(s) et subit -2 Crédibilité !`,
        'TRAP'
      )
    );
    state.floatingFeedbacks.push(
      createFeedback(lane.id, actor, 'TWEET 2012 ! -2 CRÉD.', 'trap', targetCard.id)
    );
  } else if (triggeredTrap.effect.code === 'TRAP_RETOURNEMENT_VESTE') {
    const previousCharisma = targetCard.charisma;
    targetCard.charisma = Math.floor(targetCard.charisma / 2);

    if (trapOwner === 'PLAYER') {
      state.playerNextTurnCapitalBonus = (state.playerNextTurnCapitalBonus ?? 0) + 1;
      state.aiNextTurnCapitalBonus = (state.aiNextTurnCapitalBonus ?? 0) - 1;
    } else {
      state.aiCapital += 1;
      state.playerNextTurnCapitalBonus = (state.playerNextTurnCapitalBonus ?? 0) - 1;
    }

    state.triggeredTrapAlert = {
      id: `trap-alert-${trapAlertSequence}-${Date.now()}`,
      trapName: `TRAHISON : ${triggeredTrap.name.toUpperCase()} !`,
      targetName: targetCard.name,
      laneName: lane.name,
      effectSummary: `${targetCard.name} voit son Charisme réduit de moitié (${previousCharisma} → ${targetCard.charisma}) et ${trapOwner === 'PLAYER' ? 'vous volez' : 'l\'IA vole'} +1 Capital Politique pour le prochain tour !`,
      triggeredByOwner: trapOwner,
    };

    state.logs.unshift(
      createLogEntry(
        state.turn,
        trapOwner,
        `SCANDALE ! « RETOURNEMENT DE VESTE » SUR ${lane.name.toUpperCase()} !`,
        `${targetCard.name} voit son Charisme réduit de moitié (${previousCharisma} → ${targetCard.charisma}) et perd 1 Capital Politique au profit de ${trapOwner === 'PLAYER' ? 'votre camp' : 'l\'Opposition'} !`,
        'TRAP'
      )
    );
    state.floatingFeedbacks.push(
      createFeedback(
        lane.id,
        actor,
        'RETOURNEMENT ! CHARISME ÷2 & -1 CAP.',
        'trap',
        targetCard.id
      )
    );
  }

  if (targetCard.credibility <= 0) {
    cardEliminated = true;
    const opinionDelta = actor === 'PLAYER' ? -1 : 1;
    state.opinion = clampOpinion(state.opinion + opinionDelta);
    state.logs.unshift(
      createLogEntry(
        state.turn,
        trapOwner,
        `${targetCard.name.toUpperCase()} DÉMISSIONNE SOUS LES HUÉES !`,
        `Éliminé par une casserole dès son arrivée (${opinionDelta > 0 ? `+${opinionDelta}` : opinionDelta} Opinion).`,
        'TRAP'
      )
    );
    state.floatingFeedbacks.push(
      createFeedback(lane.id, actor, 'ÉLIMINÉ !', 'eliminated', targetCard.id)
    );
  }

  return { trapCancelledEntry, cardEliminated };
}

/**
 * Joue une carte depuis la main d'un joueur (PLAYER ou AI).
 */
export function playCard(
  state: GameState,
  actor: 'PLAYER' | 'AI',
  cardId: string,
  targetLaneId: string,
  targetFigureId?: string,
  targetSlotIndex?: number
): GameState {
  if (state.phase === 'GAME_OVER') return state;

  const next = structuredClone(state);
  next.floatingFeedbacks = [];
  next.triggeredTrapAlert = null;

  const hand = actor === 'PLAYER' ? next.playerHand : next.aiHand;
  const capitalKey = actor === 'PLAYER' ? 'playerCapital' : 'aiCapital';
  const discard = actor === 'PLAYER' ? next.playerDiscard : next.aiDiscard;

  const cardIndex = hand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) return state;

  const card = hand[cardIndex];
  if (next[capitalKey] < card.cost) return state;

  const lane = next.lanes.find((l) => l.id === targetLaneId);
  if (!lane) return state;

  // ==========================================
  // CAS 1 : POSER UNE FIGURE POLITIQUE
  // ==========================================
  if (card.type === 'FIGURE') {
    const laneCards = actor === 'PLAYER' ? lane.playerCards : lane.aiCards;
    if (laneCards.length >= MAX_CARDS_PER_LANE) return state;

    const assignedSlot =
      targetSlotIndex !== undefined &&
      targetSlotIndex >= 0 &&
      targetSlotIndex < MAX_CARDS_PER_LANE &&
      !getCardAtSlot(laneCards, targetSlotIndex)
        ? targetSlotIndex
        : getFirstFreeSlotIndex(laneCards);

    if (assignedSlot === -1) return state;

    next[capitalKey] -= card.cost;
    hand.splice(cardIndex, 1);
    card.playedOnTurn = next.turn;
    card.slotIndex = assignedSlot;

    if (
      lane.modifierCode === 'HEMICYCLE_INSTITUTIONAL' &&
      (card.alignments.includes('INSTITUTIONNEL') || card.alignments.includes('TECHNOCRATE'))
    ) {
      card.credibility += 1;
      card.maxCredibility += 1;
    }

    const { trapCancelledEntry, cardEliminated } = triggerOpposingTrapsOnCardAction(
      next,
      lane,
      card,
      actor
    );

    if (!cardEliminated) {
      laneCards.push(card);
      laneCards.sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0));

      next.logs.unshift(
        createLogEntry(
          next.turn,
          actor,
          `${actor === 'PLAYER' ? 'VOUS DÉPLOYEZ' : 'L\'OPPOSITION DÉPLOIE'} ${card.name.toUpperCase()}`,
          `Entrée en lice sur « ${lane.name} » [Case #${assignedSlot + 1}] (${getEffectiveCardCharisma(card, lane, next.lanes)} Charisme, ${card.credibility} Crédibilité).`,
          'PLAY'
        )
      );

      if (!trapCancelledEntry) {
        if (card.effect.code === 'JEUNE_LOUP_RUSH') {
          const delta = actor === 'PLAYER' ? 1 : -1;
          next.opinion = clampOpinion(next.opinion + delta);
          next.floatingFeedbacks.push(
            createFeedback(lane.id, 'OPINION', `${delta > 0 ? `+${delta}` : delta} Opinion`, 'opinion', card.id)
          );
        } else if (card.effect.code === 'MANDARIN_BERCY_TAX') {
          next[capitalKey] += 1;
          const delta = actor === 'PLAYER' ? 1 : -1;
          next.opinion = clampOpinion(next.opinion + delta);
          next.floatingFeedbacks.push(
            createFeedback(lane.id, actor, '+1 Capital & +1 Opinion', 'buff', card.id)
          );
        } else if (card.effect.code === 'DIPLOMATE_EXIL') {
          const opposingCards = actor === 'PLAYER' ? lane.aiCards : lane.playerCards;
          const opposingSide = actor === 'PLAYER' ? 'AI' : 'PLAYER';
          const oppositeFigure = getCardAtSlot(opposingCards, assignedSlot);

          if (oppositeFigure) {
            const candidateLanes = next.lanes.filter((otherLane) => {
              if (otherLane.id === lane.id) return false;
              const otherOpposing =
                actor === 'PLAYER' ? otherLane.aiCards : otherLane.playerCards;
              return otherOpposing.length < MAX_CARDS_PER_LANE;
            });

            if (candidateLanes.length > 0) {
              const destLane =
                candidateLanes[Math.floor(Math.random() * candidateLanes.length)];
              const destOpposing =
                actor === 'PLAYER' ? destLane.aiCards : destLane.playerCards;
              const oppIdx = opposingCards.findIndex((c) => c.id === oppositeFigure.id);
              if (oppIdx !== -1) opposingCards.splice(oppIdx, 1);

              const destSlot = !getCardAtSlot(destOpposing, assignedSlot)
                ? assignedSlot
                : getFirstFreeSlotIndex(destOpposing);
              oppositeFigure.slotIndex = destSlot;
              destOpposing.push(oppositeFigure);
              destOpposing.sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0));

              next.logs.unshift(
                createLogEntry(
                  next.turn,
                  actor,
                  `VOIE DIPLOMATIQUE : ${oppositeFigure.name.toUpperCase()} EXILÉ !`,
                  `${card.name} repousse ${oppositeFigure.name} (en face sur la Case #${assignedSlot + 1}) vers « ${destLane.name} » !`,
                  'PLAY'
                )
              );
              next.floatingFeedbacks.push(
                createFeedback(
                  lane.id,
                  opposingSide,
                  `EXILÉ VERS ${destLane.name.toUpperCase()} !`,
                  'trap',
                  card.id
                )
              );
              next.floatingFeedbacks.push(
                createFeedback(
                  destLane.id,
                  opposingSide,
                  'REPOUSSÉ ICI !',
                  'damage',
                  oppositeFigure.id
                )
              );
            }
          }
        }
      }
    } else {
      discard.push(card);
    }

    return checkInstantVictory(next);
  }

  // ==========================================
  // CAS 2 : JOUER UN UPGRADE SUR UNE FIGURE ALLIÉE
  // ==========================================
  if (card.type === 'UPGRADE') {
    const laneCards = actor === 'PLAYER' ? lane.playerCards : lane.aiCards;
    const targetFigure = targetFigureId
      ? laneCards.find((c) => c.id === targetFigureId)
      : laneCards.find((c) => canEquipUpgradeOnFigure(c));

    if (!targetFigure || !canEquipUpgradeOnFigure(targetFigure)) {
      return state;
    }

    next[capitalKey] -= card.cost;
    hand.splice(cardIndex, 1);
    card.playedOnTurn = next.turn;

    targetFigure.upgrades.push(card);
    targetFigure.credibility = Math.max(1, targetFigure.credibility + card.credibility);
    targetFigure.maxCredibility = Math.max(1, targetFigure.maxCredibility + card.maxCredibility);

    if (targetFigure.effect.code === 'EN_MEME_TEMPS_AGILE') {
      targetFigure.credibility += 1;
      targetFigure.maxCredibility += 1;
    }

    next.logs.unshift(
      createLogEntry(
        next.turn,
        actor,
        `UPGRADE : « ${card.name.toUpperCase()} » SUR ${targetFigure.name.toUpperCase()}`,
        `Équipé sur « ${lane.name} ». Charisme actuel de la Figure : ${getEffectiveCardCharisma(targetFigure, lane, next.lanes)}.`,
        'PLAY'
      )
    );

    next.floatingFeedbacks.push(
      createFeedback(
        lane.id,
        actor,
        `+${card.charisma} CHARISME`,
        'buff',
        targetFigure.id
      )
    );

    const opposingTraps = actor === 'PLAYER' ? lane.aiTraps : lane.playerTraps;
    const tweetTrapIndex = opposingTraps.findIndex((t) => t.effect.code === 'TRAP_TWEET_2012');
    if (tweetTrapIndex !== -1) {
      // S'assure que Tweet de 2012 est en tête de liste pour se déclencher immédiatement sur l'équipement d'Upgrade
      if (tweetTrapIndex > 0) {
        const [tweetTrap] = opposingTraps.splice(tweetTrapIndex, 1);
        opposingTraps.unshift(tweetTrap);
      }
      const { cardEliminated } = triggerOpposingTrapsOnCardAction(
        next,
        lane,
        targetFigure,
        actor
      );
      if (cardEliminated) {
        const idx = laneCards.findIndex((c) => c.id === targetFigure.id);
        if (idx !== -1) laneCards.splice(idx, 1);
        discard.push(targetFigure);
      }
    }

    return checkInstantVictory(next);
  }

  // ==========================================
  // CAS 3 : JOUER UN ÉVÉNEMENT IMMÉDIAT
  // ==========================================
  if (card.type === 'EVENT') {
    next[capitalKey] -= card.cost;
    hand.splice(cardIndex, 1);
    card.playedOnTurn = next.turn;
    discard.push(card);

    if (card.effect.code === 'EVENT_SONDAGE_COMMANDE') {
      const isJT20h =
        lane.id === 'lane-jt-20h' || lane.modifierCode === 'JT_20H_MEDIA_AMPLIFIER';
      const magnitude = isJT20h ? 4 : 2;
      const rawDelta = actor === 'PLAYER' ? magnitude : -magnitude;
      next.opinion = clampOpinion(next.opinion + rawDelta);
      next.logs.unshift(
        createLogEntry(
          next.turn,
          actor,
          `ÉVÉNEMENT : « SONDAGE COMMANDÉ » SUR ${lane.name.toUpperCase()} !`,
          `La Jauge d'Opinion progresse de ${rawDelta > 0 ? `+${rawDelta}` : rawDelta}${
            isJT20h ? ' (Bonus Prime Time JT de 20h !)' : ''
          } !`,
          'OPINION'
        )
      );
      next.floatingFeedbacks.push(
        createFeedback(
          lane.id,
          'OPINION',
          `${rawDelta > 0 ? `+${rawDelta}` : rawDelta} OPINION !`,
          'opinion'
        )
      );
      return checkInstantVictory(next);
    }

    if (card.effect.code === 'EVENT_CELLULE_CRISE') {
      const friendlyCards = actor === 'PLAYER' ? lane.playerCards : lane.aiCards;
      for (const fig of friendlyCards) {
        fig.maxCredibility = Math.max(fig.maxCredibility, fig.credibility + 3);
        fig.credibility += 3;
        fig.charisma += 1;
        next.floatingFeedbacks.push(
          createFeedback(lane.id, actor, '+3 CRÉD. & +1 CHAR.', 'buff', fig.id)
        );
      }
      next.logs.unshift(
        createLogEntry(
          next.turn,
          actor,
          `ÉVÉNEMENT : « REMANIEMENT MINISTÉRIEL » SUR ${lane.name.toUpperCase()} !`,
          friendlyCards.length > 0
            ? `${friendlyCards.length} Figure(s) alliée(s) gagnent +3 Crédibilité et +1 Charisme sur « ${lane.name} » !`
            : `Remaniement annoncé sur « ${lane.name} » (aucune Figure alliée en place).`,
          'PLAY'
        )
      );
      return checkInstantVictory(next);
    }

    if (card.effect.code === 'EVENT_MOTION_CENSURE') {
      const opposingCards = actor === 'PLAYER' ? lane.aiCards : lane.playerCards;
      const opposingSide = actor === 'PLAYER' ? 'AI' : 'PLAYER';
      const opposingDiscard = actor === 'PLAYER' ? next.aiDiscard : next.playerDiscard;

      const victims = opposingCards.filter((c) => c.credibility <= 3);
      if (victims.length > 0) {
        for (const victim of victims) {
          const idx = opposingCards.findIndex((c) => c.id === victim.id);
          if (idx !== -1) opposingCards.splice(idx, 1);
          opposingDiscard.push(victim);

          const bonusOpinion = actor === 'PLAYER' ? 1 : -1;
          next.opinion = clampOpinion(next.opinion + bonusOpinion);
          next.floatingFeedbacks.push(
            createFeedback(
              lane.id,
              opposingSide,
              'CENSURÉ ! ÉLIMINÉ !',
              'eliminated',
              victim.id
            )
          );
        }
        next.logs.unshift(
          createLogEntry(
            next.turn,
            actor,
            `MOTION DE CENSURE ADOPTÉE SUR ${lane.name.toUpperCase()} !`,
            `${victims.map((v) => v.name).join(', ')} (${victims.length} Figure(s) ≤ 3 Créd.) ${
              victims.length > 1 ? 'sont renversées' : 'est renversée'
            } !`,
            'COMBAT'
          )
        );
      } else {
        next.logs.unshift(
          createLogEntry(
            next.turn,
            actor,
            `MOTION DE CENSURE SANS EFFET SUR ${lane.name.toUpperCase()}`,
            `Aucune Figure adverse n'avait 3 de Crédibilité ou moins sur « ${lane.name} ».`,
            'PLAY'
          )
        );
        next.floatingFeedbacks.push(
          createFeedback(lane.id, actor, 'AUCUNE CIBLE ≤ 3 CRÉD.', 'damage')
        );
      }
      return checkInstantVictory(next);
    }

    if (card.effect.code === 'EVENT_PETITE_PHRASE') {
      const opposingCards = actor === 'PLAYER' ? lane.aiCards : lane.playerCards;
      const opposingSide = actor === 'PLAYER' ? 'AI' : 'PLAYER';
      const opposingDiscard = actor === 'PLAYER' ? next.aiDiscard : next.playerDiscard;

      if (opposingCards.length > 0) {
        const target = opposingCards.reduce((lowest, curr) =>
          curr.credibility < lowest.credibility ? curr : lowest
        );
        target.credibility -= 2;

        next.logs.unshift(
          createLogEntry(
            next.turn,
            actor,
            `PETITE PHRASE ASSASSINE CONTRE ${target.name.toUpperCase()} !`,
            `${target.name} perd 2 Crédibilité sur « ${lane.name} ». ${actor === 'PLAYER' ? 'Vous piochez' : 'L\'IA pioche'} 1 carte.`,
            'COMBAT'
          )
        );

        if (target.credibility <= 0) {
          const idx = opposingCards.findIndex((c) => c.id === target.id);
          if (idx !== -1) opposingCards.splice(idx, 1);
          opposingDiscard.push(target);

          const bonusOpinion = actor === 'PLAYER' ? 1 : -1;
          next.opinion = clampOpinion(next.opinion + bonusOpinion);
          next.logs.unshift(
            createLogEntry(
              next.turn,
              actor,
              `${target.name.toUpperCase()} EST ÉLIMINÉ PAR LA POLÉMIQUE !`,
              `Sa Crédibilité tombe à 0. Gain d'Opinion : ${bonusOpinion > 0 ? `+${bonusOpinion}` : bonusOpinion}.`,
              'OPINION'
            )
          );
          next.floatingFeedbacks.push(
            createFeedback(lane.id, opposingSide, 'ÉLIMINÉ !', 'eliminated', target.id)
          );
        } else {
          next.floatingFeedbacks.push(
            createFeedback(lane.id, opposingSide, '-2 CRÉD.', 'damage', target.id)
          );
        }
      } else {
        const bonusOpinion = actor === 'PLAYER' ? 2 : -2;
        next.opinion = clampOpinion(next.opinion + bonusOpinion);
        next.logs.unshift(
          createLogEntry(
            next.turn,
            actor,
            `PETITE PHRASE ASSASSINE SANS CONTRADICTEUR !`,
            `Terrain adverse désert sur « ${lane.name} » : ${bonusOpinion > 0 ? `+${bonusOpinion}` : bonusOpinion} Opinion et +1 carte piochée.`,
            'OPINION'
          )
        );
        next.floatingFeedbacks.push(
          createFeedback(lane.id, 'OPINION', `${bonusOpinion > 0 ? `+${bonusOpinion}` : bonusOpinion} OPINION`, 'opinion')
        );
      }

      const afterDraw = drawCards(next, actor, 1);
      return checkInstantVictory(afterDraw);
    }
  }

  // ==========================================
  // CAS 4 : POSER UN PIÈGE (CASSEROLE FACE CACHÉE)
  // ==========================================
  if (card.type === 'TRAP') {
    const trapsList = actor === 'PLAYER' ? lane.playerTraps : lane.aiTraps;
    if (trapsList.length >= MAX_TRAPS_PER_LANE) return state;

    next[capitalKey] -= card.cost;
    hand.splice(cardIndex, 1);
    card.isFaceDown = true;
    card.playedOnTurn = next.turn;
    trapsList.push(card);

    next.logs.unshift(
      createLogEntry(
        next.turn,
        actor,
        `${actor === 'PLAYER' ? 'CASSEROLE DÉPOSÉE' : 'DOSSIER CONFIDENTIEL DÉPOSÉ PAR L\'IA'}`,
        `Une Casserole face cachée a été placée sur « ${lane.name} ».`,
        'TRAP'
      )
    );
    next.floatingFeedbacks.push(
      createFeedback(lane.id, actor, 'CASSEROLE POSÉE', 'trap')
    );

    return next;
  }

  return next;
}

/**
 * Mécanique de Bluff : "Convoquer la Presse"
 * Double uniquement les points de classement misés pour la victoire finale (x2).
 */
export function callPressConference(
  state: GameState,
  actor: 'PLAYER' | 'AI'
): GameState {
  if (state.phase === 'GAME_OVER') return state;
  if (state.turn >= 7 || state.stakesMultiplier > 1) return state;

  const next = structuredClone(state);
  next.stakesMultiplier = 2;
  next.pressCalledBy = actor;

  next.logs.unshift(
    createLogEntry(
      next.turn,
      actor,
      'FLASH SPÉCIAL : CONFÉRENCE DE PRESSE CONVOQUÉE (MISE FINALE x2) !',
      `${actor === 'PLAYER' ? 'Vous convoquez' : 'L\'Opposition convoque'} la presse ! Les points de classement misés sur la victoire finale sont doublés (2 pts au lieu de 1).`,
      'PRESS'
    )
  );

  return next;
}

/**
 * Intelligence Artificielle Multi-Terrains Active :
 * - Dépense la quasi-totalité de son Capital disponible à chaque tour.
 * - Déploie prioritairement des Figures sur les terrains vides ou contestés afin de contrôler au moins 2 Terrains sur 3 (voire les 3).
 * - Évite d'empiler inutilement sur un terrain déjà largement dominé tant que d'autres terrains sont vides ou perdus.
 */
export function executeAITurn(state: GameState): GameState {
  if (state.phase === 'GAME_OVER') return state;

  let current = structuredClone(state);
  current.triggeredTrapAlert = null;

  if (
    current.turn >= 4 &&
    current.turn < 7 &&
    current.stakesMultiplier === 1 &&
    current.opinion <= -10
  ) {
    current = callPressConference(current, 'AI');
  }

  let safetyIterations = 0;

  while (safetyIterations < 8 && current.phase !== 'GAME_OVER') {
    safetyIterations += 1;

    const playableCards = current.aiHand.filter((c) => c.cost <= current.aiCapital);
    if (playableCards.length === 0) break;

    let actionTaken = false;

    // 1. PRIORITÉ ABSOLUE : Déployer des Figures sur les terrains vides (côté IA) ou contestés
    const playableFigures = playableCards.filter((c) => c.type === 'FIGURE');
    const availableLanes = current.lanes.filter(
      (l) => l.aiCards.length < MAX_CARDS_PER_LANE
    );

    if (playableFigures.length > 0 && availableLanes.length > 0) {
      const emptyOrLosingLanesCount = availableLanes.filter(
        (l) =>
          l.aiCards.length === 0 ||
          getLaneTotalCharisma(l, 'AI', current.lanes) <=
            getLaneTotalCharisma(l, 'PLAYER', current.lanes)
      ).length;

      let chosenFigure: Card | null = null;
      if (emptyOrLosingLanesCount >= 2 && playableFigures.length >= 2) {
        const sortedAsc = [...playableFigures].sort((a, b) => a.cost - b.cost);
        if (sortedAsc[0].cost + sortedAsc[1].cost <= current.aiCapital) {
          chosenFigure = sortedAsc[0];
        }
      }
      if (!chosenFigure) {
        const mandarin = playableFigures.find(
          (f) => f.effect.code === 'MANDARIN_BERCY_TAX'
        );
        const sortedDesc = [...playableFigures].sort((a, b) => b.cost - a.cost);
        chosenFigure = mandarin || sortedDesc[0];
      }

      const scoredLanes = availableLanes.map((lane) => {
        let score = 0;
        const playerPower = getLaneTotalCharisma(lane, 'PLAYER', current.lanes);
        const aiPower = getLaneTotalCharisma(lane, 'AI', current.lanes);

        if (lane.aiCards.length === 0 && lane.playerCards.length > 0) {
          score += 28;
        } else if (lane.aiCards.length === 0 && lane.playerCards.length === 0) {
          score += 22;
        } else if (aiPower < playerPower) {
          score += 15;
        } else if (aiPower === playerPower) {
          score += 11;
        } else {
          if (emptyOrLosingLanesCount > 0) {
            score -= 14 + lane.aiCards.length * 5;
          } else {
            score += 2;
          }
        }

        // Bonus si Le Diplomate Chevronné peut exiler une Figure ennemie sur ce terrain
        if (
          chosenFigure.effect.code === 'DIPLOMATE_EXIL' &&
          lane.playerCards.length > 0 &&
          current.lanes.some(
            (other) => other.id !== lane.id && other.playerCards.length < MAX_CARDS_PER_LANE
          )
        ) {
          score += 10;
        }

        // Bonus de synergie avec le Terrain
        if (
          lane.modifierCode === 'JT_20H_MEDIA_AMPLIFIER' &&
          (chosenFigure.alignments.includes('MEDIATIQUE') ||
            chosenFigure.effect.code === 'INFLUENCEUR_RESEAUX')
        ) {
          score += 3;
        }
        if (
          lane.modifierCode === 'HEMICYCLE_INSTITUTIONAL' &&
          (chosenFigure.alignments.includes('INSTITUTIONNEL') ||
            chosenFigure.alignments.includes('TECHNOCRATE'))
        ) {
          score += 3;
        }
        if (
          lane.modifierCode === 'LA_RUE_POPULIST_ARENA' &&
          (chosenFigure.alignments.includes('POPULISTE') ||
            chosenFigure.alignments.includes('MILITANT') ||
            chosenFigure.effect.code === 'INFLUENCEUR_RESEAUX')
        ) {
          score += 3;
        }

        return { lane, score };
      });

      scoredLanes.sort((a, b) => b.score - a.score);
      const bestLane = scoredLanes[0].lane;

      // Choix intelligent de l'emplacement (slot 0, 1 ou 2) :
      // - Si Le Diplomate Chevronné : cible un emplacement occupé en face par la plus grosse menace du Joueur.
      // - Sinon : privilégie de bloquer une case où le Joueur a une Figure non bloquée (pour empêcher le +1 Opinion direct et l'attaquer), ou prend une case libre.
      const freeSlots = [0, 1, 2].filter((s) => !getCardAtSlot(bestLane.aiCards, s));
      let chosenSlot = freeSlots[0] ?? 0;

      if (freeSlots.length > 1) {
        let bestSlotScore = -999;
        for (const slot of freeSlots) {
          let slotScore = 0;
          const opposingAtSlot = getCardAtSlot(bestLane.playerCards, slot);
          if (chosenFigure.effect.code === 'DIPLOMATE_EXIL') {
            if (opposingAtSlot) {
              slotScore +=
                20 + getEffectiveCardCharisma(opposingAtSlot, bestLane, current.lanes);
            }
          } else if (opposingAtSlot) {
            const oppCharisma = getEffectiveCardCharisma(
              opposingAtSlot,
              bestLane,
              current.lanes
            );
            // Bloquer une Figure adverse empêche +1 Opinion en face-à-face
            slotScore += 10;
            if (chosenFigure.credibility > oppCharisma) {
              slotScore += 6; // Survit au duel
            }
            if (chosenFigure.charisma >= opposingAtSlot.credibility) {
              slotScore += 8; // Élimine la Figure adverse !
            }
          } else {
            // Case libre en face : infligera +1 Opinion direct si la carte a peu de PV
            if (chosenFigure.credibility <= 4) {
              slotScore += 12;
            } else {
              slotScore += 4;
            }
          }

          if (slotScore > bestSlotScore) {
            bestSlotScore = slotScore;
            chosenSlot = slot;
          }
        }
      }

      current = playCard(current, 'AI', chosenFigure.id, bestLane.id, undefined, chosenSlot);
      actionTaken = true;
    }

    if (actionTaken) continue;

    // 2. ÉQUIPER DES UPGRADES SUR LES FIGURES EN LICE (en priorité sur un terrain contesté)
    const upgrades = playableCards.filter((c) => c.type === 'UPGRADE');
    if (upgrades.length > 0) {
      const chosenUpgrade = upgrades[0];
      let bestTarget: { lane: Lane; figure: Card; score: number } | null = null;

      for (const lane of current.lanes) {
        const pPower = getLaneTotalCharisma(lane, 'PLAYER', current.lanes);
        const aPower = getLaneTotalCharisma(lane, 'AI', current.lanes);

        for (const fig of lane.aiCards) {
          if (
            canEquipUpgradeOnFigure(fig) &&
            fig.credibility + chosenUpgrade.credibility >= 2
          ) {
            let targetScore = 5;
            if (aPower <= pPower && lane.playerCards.length > 0) {
              targetScore += 12;
            }
            if (fig.effect.code === 'EN_MEME_TEMPS_AGILE') {
              targetScore += 6;
            }
            if (!bestTarget || targetScore > bestTarget.score) {
              bestTarget = { lane, figure: fig, score: targetScore };
            }
          }
        }
      }

      if (bestTarget) {
        current = playCard(
          current,
          'AI',
          chosenUpgrade.id,
          bestTarget.lane.id,
          bestTarget.figure.id
        );
        actionTaken = true;
      }
    }

    if (actionTaken) continue;

    // 3. JOUER LES ÉVÉNEMENTS (UNE / FLASH) AVEC LE CAPITAL RESTANT
    const events = playableCards.filter((c) => c.type === 'EVENT');
    if (events.length > 0) {
      for (const candidateEvent of events) {
        if (candidateEvent.effect.code === 'EVENT_SONDAGE_COMMANDE') {
          const jtLane =
            current.lanes.find((l) => l.id === 'lane-jt-20h') || current.lanes[0];
          current = playCard(current, 'AI', candidateEvent.id, jtLane.id);
          actionTaken = true;
          break;
        }

        if (candidateEvent.effect.code === 'EVENT_CELLULE_CRISE') {
          const lanesWithAI = [...current.lanes]
            .filter((l) => l.aiCards.length > 0)
            .sort((a, b) => b.aiCards.length - a.aiCards.length);
          if (lanesWithAI.length > 0) {
            current = playCard(current, 'AI', candidateEvent.id, lanesWithAI[0].id);
            actionTaken = true;
            break;
          }
          continue;
        }

        if (candidateEvent.effect.code === 'EVENT_MOTION_CENSURE') {
          const lanesWithWeakPlayer = [...current.lanes]
            .map((l) => ({
              lane: l,
              weakCount: l.playerCards.filter((c) => c.credibility <= 3).length,
            }))
            .filter((entry) => entry.weakCount > 0)
            .sort((a, b) => b.weakCount - a.weakCount);

          if (lanesWithWeakPlayer.length > 0) {
            current = playCard(
              current,
              'AI',
              candidateEvent.id,
              lanesWithWeakPlayer[0].lane.id
            );
            actionTaken = true;
            break;
          }
          continue;
        }

        // Par défaut (ex: Petite Phrase Assassine)
        const laneWithWeakestPlayer =
          [...current.lanes]
            .filter((l) => l.playerCards.length > 0)
            .sort(
              (a, b) =>
                Math.min(...a.playerCards.map((c) => c.credibility)) -
                Math.min(...b.playerCards.map((c) => c.credibility))
            )[0] || current.lanes[0];

        current = playCard(current, 'AI', candidateEvent.id, laneWithWeakestPlayer.id);
        actionTaken = true;
        break;
      }
    }

    if (actionTaken) continue;

    // 4. POSER DES CASSEROLES (PIÈGES) SUR LES TERRAINS CONTESTÉS OU VIDES
    const traps = playableCards.filter((c) => c.type === 'TRAP');
    const trapLanes = current.lanes.filter((l) => l.aiTraps.length < MAX_TRAPS_PER_LANE);
    if (traps.length > 0 && trapLanes.length > 0) {
      const chosenTrap = traps[0];
      const targetLane =
        trapLanes.find(
          (l) =>
            l.playerCards.length > 0 &&
            l.playerCards.length < MAX_CARDS_PER_LANE &&
            l.aiTraps.length === 0
        ) ||
        trapLanes.find((l) => l.aiTraps.length === 0) ||
        trapLanes[0];
      current = playCard(current, 'AI', chosenTrap.id, targetLane.id);
      actionTaken = true;
    }

    if (!actionTaken) break;
  }

  return current;
}

/**
 * ÉTAPE 1 DU COMBAT SUR UN TERRAIN (Système 2.0 : Duel Face-à-Face Emplacement par Emplacement) :
 * - Compare `slot 0` vs `slot 0`, `slot 1` vs `slot 1`, `slot 2` vs `slot 2`.
 * - Si deux Figures se font face sur le même emplacement, elles s'infligent mutuellement leur Charisme sur leur Crédibilité.
 * - Si une Figure n'a aucune carte adverse directement en face d'elle sur son emplacement, elle inflige +1 point direct
 *   à la Jauge d'Opinion Publique (plafonné à 2 points max par terrain et par tour).
 * - Les pièges ne sont PAS déclenchés ici (uniquement lors de la pose/équipement dans `playCard`).
 */
export function applyLaneCombatImpacts(
  state: GameState,
  laneIndex: number
): GameState {
  if (state.phase === 'GAME_OVER') return state;

  const next = structuredClone(state);
  next.floatingFeedbacks = [];
  next.triggeredTrapAlert = null;

  const lane = next.lanes[laneIndex];
  if (!lane) return next;

  const activePlayerCards = lane.playerCards.filter((c) => c.credibility > 0);
  const activeAICards = lane.aiCards.filter((c) => c.credibility > 0);

  if (activePlayerCards.length === 0 && activeAICards.length === 0) {
    return next;
  }

  // Pré-calcul des Charismes effectifs avant l'application simultanée des dégâts
  const playerCharismaById = new Map<string, number>();
  for (const pCard of activePlayerCards) {
    playerCharismaById.set(pCard.id, getEffectiveCardCharisma(pCard, lane, next.lanes));
  }
  const aiCharismaById = new Map<string, number>();
  for (const aCard of activeAICards) {
    aiCharismaById.set(aCard.id, getEffectiveCardCharisma(aCard, lane, next.lanes));
  }

  let duelsCount = 0;
  let playerUnopposedCount = 0;
  let aiUnopposedCount = 0;

  for (let slot = 0; slot < MAX_CARDS_PER_LANE; slot++) {
    const pCard = getCardAtSlot(activePlayerCards, slot);
    const aCard = getCardAtSlot(activeAICards, slot);

    if (pCard && aCard) {
      duelsCount += 1;
      const pDmgRaw = playerCharismaById.get(pCard.id) ?? 0;
      const aDmgRaw = aiCharismaById.get(aCard.id) ?? 0;

      if (pDmgRaw > 0) {
        let effectiveDmgToAI = pDmgRaw;
        if (aCard.effect.code === 'VIEUX_GENERAL_SHIELD') {
          effectiveDmgToAI = Math.max(1, effectiveDmgToAI - 2);
        }
        aCard.credibility -= effectiveDmgToAI;

        const badgeText =
          aCard.credibility <= 0 ? 'ÉLIMINÉ !' : `-${effectiveDmgToAI} CRÉD.`;
        const badgeTone = aCard.credibility <= 0 ? 'eliminated' : 'damage';
        next.floatingFeedbacks.push(
          createFeedback(lane.id, 'AI', badgeText, badgeTone, aCard.id)
        );
      }

      if (aDmgRaw > 0) {
        let effectiveDmgToPlayer = aDmgRaw;
        if (pCard.effect.code === 'VIEUX_GENERAL_SHIELD') {
          effectiveDmgToPlayer = Math.max(1, effectiveDmgToPlayer - 2);
        }
        pCard.credibility -= effectiveDmgToPlayer;

        const badgeText =
          pCard.credibility <= 0 ? 'ÉLIMINÉ !' : `-${effectiveDmgToPlayer} CRÉD.`;
        const badgeTone = pCard.credibility <= 0 ? 'eliminated' : 'damage';
        next.floatingFeedbacks.push(
          createFeedback(lane.id, 'PLAYER', badgeText, badgeTone, pCard.id)
        );
      }
    } else if (pCard && !aCard) {
      playerUnopposedCount += 1;
      if (playerUnopposedCount <= MAX_UNOPPOSED_OPINION_DAMAGE) {
        next.floatingFeedbacks.push(
          createFeedback(lane.id, 'PLAYER', '+1 OPINION (LIBRE)', 'buff', pCard.id)
        );
      }
    } else if (aCard && !pCard) {
      aiUnopposedCount += 1;
      if (aiUnopposedCount <= MAX_UNOPPOSED_OPINION_DAMAGE) {
        next.floatingFeedbacks.push(
          createFeedback(lane.id, 'AI', '-1 OPINION (LIBRE)', 'damage', aCard.id)
        );
      }
    }
  }

  const playerOpinionGain = Math.min(MAX_UNOPPOSED_OPINION_DAMAGE, playerUnopposedCount);
  const aiOpinionLoss = Math.min(MAX_UNOPPOSED_OPINION_DAMAGE, aiUnopposedCount);
  const netOpinionDelta = playerOpinionGain - aiOpinionLoss;

  if (netOpinionDelta !== 0) {
    next.opinion = clampOpinion(next.opinion + netOpinionDelta);
    next.floatingFeedbacks.push(
      createFeedback(
        lane.id,
        'OPINION',
        `${netOpinionDelta > 0 ? `+${netOpinionDelta}` : netOpinionDelta} OPINION !`,
        'opinion'
      )
    );
  }

  if (duelsCount > 0 || netOpinionDelta !== 0) {
    const summaryParts: string[] = [];
    if (duelsCount > 0) {
      summaryParts.push(`${duelsCount} duel(s) face-à-face`);
    }
    if (playerOpinionGain > 0) {
      summaryParts.push(
        `+${playerOpinionGain} Opinion (${playerUnopposedCount} case(s) libre(s) joueur)`
      );
    }
    if (aiOpinionLoss > 0) {
      summaryParts.push(
        `-${aiOpinionLoss} Opinion (${aiUnopposedCount} case(s) libre(s) IA)`
      );
    }

    next.logs.unshift(
      createLogEntry(
        next.turn,
        netOpinionDelta > 0 ? 'PLAYER' : netOpinionDelta < 0 ? 'AI' : 'SYSTEM',
        `DÉBAT SUR « ${lane.name.toUpperCase()} »`,
        `Résolution par emplacement : ${summaryParts.join(' | ')}.`,
        duelsCount > 0 ? 'COMBAT' : 'OPINION'
      )
    );
  }

  return checkInstantVictory(next);
}

/**
 * ÉTAPE 2 DU COMBAT SUR UN TERRAIN (appelée après 1 seconde d'affichage des impacts) :
 * Retire du plateau les cartes tombées à Crédibilité <= 0 et attribue ±1 Opinion par Figure éliminée.
 */
export function cleanupLaneEliminatedCards(
  state: GameState,
  laneIndex: number
): GameState {
  if (state.phase === 'GAME_OVER') return state;

  const next = structuredClone(state);
  next.triggeredTrapAlert = null;
  const lane = next.lanes[laneIndex];
  if (!lane) return next;

  const survivingPlayerCards: Card[] = [];
  for (const pCard of lane.playerCards) {
    if (pCard.credibility <= 0) {
      next.playerDiscard.push(pCard);
      const penalty = 1;
      next.opinion = clampOpinion(next.opinion - penalty);
      next.logs.unshift(
        createLogEntry(
          next.turn,
          'AI',
          `${pCard.name.toUpperCase()} QUITTE LE PLATEAU !`,
          `Votre Figure est éliminée sur « ${lane.name} » (-${penalty} Opinion Publique).`,
          'COMBAT'
        )
      );
    } else {
      survivingPlayerCards.push(pCard);
    }
  }
  lane.playerCards = survivingPlayerCards;

  const survivingAICards: Card[] = [];
  for (const aCard of lane.aiCards) {
    if (aCard.credibility <= 0) {
      next.aiDiscard.push(aCard);
      const reward = 1;
      next.opinion = clampOpinion(next.opinion + reward);
      next.logs.unshift(
        createLogEntry(
          next.turn,
          'PLAYER',
          `${aCard.name.toUpperCase()} (IA) EST ÉLIMINÉ !`,
          `Figure adverse éliminée sur « ${lane.name} » (+${reward} Opinion Publique).`,
          'COMBAT'
        )
      );
    } else {
      survivingAICards.push(aCard);
    }
  }
  lane.aiCards = survivingAICards;

  return checkInstantVictory(next);
}

/**
 * Résout l'affrontement et le nettoyage sur UN SEUL Terrain.
 */
export function resolveSingleLaneDebate(
  state: GameState,
  laneIndex: number
): GameState {
  const afterImpacts = applyLaneCombatImpacts(state, laneIndex);
  return cleanupLaneEliminatedCards(afterImpacts, laneIndex);
}

/**
 * Bonus de Majorité ("Hégémonie Médiatique") :
 * Si un joueur contrôle les 3 Terrains simultanément à la fin d'un tour, il gagne un bonus immédiat de +3 sur la Jauge d'Opinion Publique (ou -3 si l'IA contrôle les 3 Terrains).
 */
export function applyHegemonyBonus(state: GameState): GameState {
  if (state.phase === 'GAME_OVER') return state;

  let playerControlled = 0;
  let aiControlled = 0;

  for (const lane of state.lanes) {
    const pScore = getLaneTotalCharisma(lane, 'PLAYER', state.lanes);
    const aScore = getLaneTotalCharisma(lane, 'AI', state.lanes);
    if (pScore > aScore) playerControlled += 1;
    else if (aScore > pScore) aiControlled += 1;
  }

  if (playerControlled < 3 && aiControlled < 3) {
    return state;
  }

  const next = structuredClone(state);
  const centerLaneId = next.lanes[1]?.id || 'lane-hemicycle';

  if (playerControlled === 3) {
    next.opinion = clampOpinion(next.opinion + 3);
    next.logs.unshift(
      createLogEntry(
        next.turn,
        'PLAYER',
        'HÉGÉMONIE MÉDIATIQUE : VOUS CONTRÔLEZ LES 3 TERRAINS (+3 OPINION) !',
        'Domination simultanée sur le JT de 20h, L\'Hémicycle et La Rue : +3 sur la Jauge d\'Opinion Publique !',
        'OPINION'
      )
    );
    next.floatingFeedbacks.push(
      createFeedback(centerLaneId, 'OPINION', 'HÉGÉMONIE ! +3 OPINION', 'opinion')
    );
  } else if (aiControlled === 3) {
    next.opinion = clampOpinion(next.opinion - 3);
    next.logs.unshift(
      createLogEntry(
        next.turn,
        'AI',
        'HÉGÉMONIE MÉDIATIQUE DE L\'OPPOSITION (-3 OPINION) !',
        'L\'IA contrôle simultanément les 3 Terrains à la fin du tour : -3 sur la Jauge d\'Opinion Publique.',
        'OPINION'
      )
    );
    next.floatingFeedbacks.push(
      createFeedback(centerLaneId, 'OPINION', 'HÉGÉMONIE IA ! -3 OPINION', 'opinion')
    );
  }

  return checkInstantVictory(next);
}

/**
 * Phase de Débat : Résolution automatique des affrontements sur les 3 Terrains + Nettoyage + Bonus d'Hégémonie.
 */
export function resolveDebatePhase(state: GameState): GameState {
  if (state.phase === 'GAME_OVER') return state;

  let next = structuredClone(state);
  const allFeedbacks: FloatingFeedback[] = [];

  for (let i = 0; i < next.lanes.length; i++) {
    next = resolveSingleLaneDebate(next, i);
    allFeedbacks.push(...next.floatingFeedbacks);
    if (next.phase === 'GAME_OVER') {
      next.floatingFeedbacks = allFeedbacks;
      return next;
    }
  }

  next = applyHegemonyBonus(next);
  allFeedbacks.push(...next.floatingFeedbacks);
  next.floatingFeedbacks = allFeedbacks;

  if (next.phase === 'GAME_OVER') {
    return next;
  }

  if (next.turn >= next.maxTurns) {
    return evaluateEndOfTurn8Winner(next);
  }

  return next;
}

/**
 * Évalue le vainqueur à la fin du Tour 8.
 * En cas d'égalité sur le nombre de Terrains gagnés (ex: 1 Terrain partout),
 * le vainqueur est départagé par le score de la Jauge d'Opinion Publique,
 * et si elle est à 0, par le total cumulé de Charisme sur l'ensemble du plateau.
 */
export function evaluateEndOfTurn8Winner(state: GameState): GameState {
  const next = structuredClone(state);
  next.phase = 'GAME_OVER';

  let playerLanesWon = 0;
  let aiLanesWon = 0;
  let totalPlayerCharisma = 0;
  let totalAICharisma = 0;

  for (const lane of next.lanes) {
    const pCharisma = getLaneTotalCharisma(lane, 'PLAYER', next.lanes);
    const aCharisma = getLaneTotalCharisma(lane, 'AI', next.lanes);
    totalPlayerCharisma += pCharisma;
    totalAICharisma += aCharisma;
    if (pCharisma > aCharisma) playerLanesWon += 1;
    else if (aCharisma > pCharisma) aiLanesWon += 1;
  }

  let winner: 'PLAYER' | 'AI' | 'DRAW' = 'DRAW';
  let reason: VictoryReason = 'TIE_OPINION';

  if (playerLanesWon > aiLanesWon) {
    winner = 'PLAYER';
    reason = 'POINTS_PLAYER';
  } else if (aiLanesWon > playerLanesWon) {
    winner = 'AI';
    reason = 'POINTS_AI';
  } else {
    if (next.opinion > 0) {
      winner = 'PLAYER';
      reason = 'POINTS_PLAYER';
    } else if (next.opinion < 0) {
      winner = 'AI';
      reason = 'POINTS_AI';
    } else {
      if (totalPlayerCharisma > totalAICharisma) {
        winner = 'PLAYER';
        reason = 'POINTS_PLAYER';
      } else if (totalAICharisma > totalPlayerCharisma) {
        winner = 'AI';
        reason = 'POINTS_AI';
      } else {
        winner = 'DRAW';
        reason = 'TIE_OPINION';
      }
    }
  }

  next.winner = winner;
  next.victoryReason = reason;

  next.logs.unshift(
    createLogEntry(
      next.turn,
      'SYSTEM',
      `VERDICT DES URNES (FIN DU TOUR 8) : ${
        winner === 'PLAYER'
          ? 'VICTOIRE DU JOUEUR !'
          : winner === 'AI'
          ? 'VICTOIRE DE L\'OPPOSITION'
          : 'SECOND TOUR INDÉCIS (ÉGALITÉ)'
      }`,
      `Terrains dominés : Vous (${playerLanesWon}) — Opposition (${aiLanesWon}) | Opinion : ${
        next.opinion > 0 ? `+${next.opinion}` : next.opinion
      } | Charisme cumulé : Vous (${totalPlayerCharisma}) vs IA (${totalAICharisma}) | Mise : ${next.stakesMultiplier}.`,
      'VICTORY'
    )
  );

  return next;
}

/**
 * Passe au tour suivant :
 * - Incrémente le tour et recharge le Capital Politique (+1 jusqu'à 8, modulé par d'éventuels bonus/malus de pièges comme Retournement de Veste).
 * - Règle de pioche dynamique : chaque joueur pioche 1 carte normalement, MAIS s'il a moins de 3 cartes en main, il pioche jusqu'à avoir 3 cartes en main !
 */
export function advanceToNextTurn(state: GameState): GameState {
  if (state.phase === 'GAME_OVER') return state;

  let next = structuredClone(state);
  next.turn = Math.min(next.maxTurns, next.turn + 1);
  next.phase = 'PLAYER_ACTION';
  next.triggeredTrapAlert = null;

  const newMaxCapital = Math.min(8, next.turn);
  const playerBonus = next.playerNextTurnCapitalBonus ?? 0;
  const aiBonus = next.aiNextTurnCapitalBonus ?? 0;

  next.playerMaxCapital = newMaxCapital;
  next.playerCapital = Math.max(0, newMaxCapital + playerBonus);
  next.aiMaxCapital = newMaxCapital;
  next.aiCapital = Math.max(0, newMaxCapital + aiBonus);

  next.playerNextTurnCapitalBonus = 0;
  next.aiNextTurnCapitalBonus = 0;

  // Pioche dynamique : au moins 1 carte, ou le nombre nécessaire pour remonter à 3 cartes en main
  const playerCardsToDraw = Math.max(1, 3 - next.playerHand.length);
  const aiCardsToDraw = Math.max(1, 3 - next.aiHand.length);

  next = drawCards(next, 'PLAYER', playerCardsToDraw);
  next = drawCards(next, 'AI', aiCardsToDraw);

  // Si l'IA n'a aucune Figure en main après sa pioche, échange une carte non-Figure avec une Figure de sa pioche afin de maintenir une pression constante sur les 3 Terrains
  if (!next.aiHand.some((c) => c.type === 'FIGURE') && next.aiHand.length > 0) {
    const deckFigIdx = next.aiDeck.findIndex(
      (c) => c.type === 'FIGURE' && c.cost <= next.aiCapital
    );
    if (deckFigIdx !== -1) {
      const [fig] = next.aiDeck.splice(deckFigIdx, 1);
      const replaced = next.aiHand.pop()!;
      next.aiHand.push(fig);
      next.aiDeck.push(replaced);
    }
  }

  const capitalNote =
    playerBonus !== 0
      ? `${next.playerCapital} (${newMaxCapital}${playerBonus > 0 ? `+${playerBonus}` : playerBonus} suite à Retournement de Veste)`
      : `${next.playerCapital}`;

  next.logs.unshift(
    createLogEntry(
      next.turn,
      'SYSTEM',
      `TOUR ${next.turn} / ${next.maxTurns} — NOUVELLE SEMAINE POLITIQUE`,
      `Capital Politique : ${capitalNote}. Vous piochez ${playerCardsToDraw} carte(s) (${next.playerHand.length} en main).`,
      'PRESS'
    )
  );

  return next;
}
