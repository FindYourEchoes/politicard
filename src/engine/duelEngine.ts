import {
  CardDefinition,
  CardRank,
  DebateTheme,
  FactionId,
  GameState,
  RoundResult,
  RoundVerdict
} from '../types/duel';
import { generateFactionDeck, FACTIONS } from '../data/factions';

const THEMES: DebateTheme[] = ['CLASSIQUE', 'CLASSIQUE', 'SONDAGE_INVERSE', 'FACE_A_FACE_BRUT', 'PRIME_TIME'];

export function drawRandomTheme(roundNumber: number): DebateTheme {
  if (roundNumber === 1) return 'CLASSIQUE';
  return THEMES[Math.floor(Math.random() * THEMES.length)];
}

export function createInitialGameState(playerFaction: FactionId, aiFaction?: FactionId): GameState {
  const allFactionIds = Object.keys(FACTIONS) as FactionId[];
  const availableAIFactions = allFactionIds.filter((f) => f !== playerFaction);
  const selectedAIFaction = aiFaction || availableAIFactions[Math.floor(Math.random() * availableAIFactions.length)];

  const initialTheme = drawRandomTheme(1);

  return {
    playerFaction,
    aiFaction: selectedAIFaction,
    playerScore: 0,
    aiScore: 0,
    targetScore: 4,
    pot: 1,
    currentRound: 1,
    maxRounds: 8,
    roundTheme: initialTheme,
    playerHand: generateFactionDeck(playerFaction),
    aiHand: generateFactionDeck(selectedAIFaction),
    playerPlayedRanks: [],
    aiPlayedRanks: [],
    playerNextBonus: 0,
    aiNextBonus: 0,
    aiHandRevealed: false,
    playerPlayedCard: null,
    aiPlayedCard: null,
    currentRoundResult: null,
    roundHistory: [],
    phase: 'ROUND_CHOOSE',
    winner: null
  };
}

/**
 * Intelligent AI choice heuristic adapted to remaining cards & current round theme
 */
export function chooseAICard(state: GameState): CardDefinition {
  const { aiHand, playerHand, pot, playerScore, aiScore, roundTheme } = state;

  if (aiHand.length === 1) {
    return aiHand[0];
  }

  const effectivePot = roundTheme === 'PRIME_TIME' ? pot + 1 : pot;
  const playerHasRank7 = playerHand.some((c) => c.rank === 7);
  const playerHasRank6 = playerHand.some((c) => c.rank === 6);
  const playerHasRank1 = playerHand.some((c) => c.rank === 1);
  const playerHasRank3 = playerHand.some((c) => c.rank === 3);

  const scores: { card: CardDefinition; weight: number }[] = aiHand.map((card) => {
    let weight = 10;

    // Theme adaptations
    if (roundTheme === 'SONDAGE_INVERSE') {
      // Inverted theme: low ranks are kings!
      if (card.rank === 0 || card.rank === 1 || card.rank === 2) {
        weight += 40 - card.rank * 10;
      } else {
        weight -= 20;
      }
      return { card, weight };
    }

    if (roundTheme === 'FACE_A_FACE_BRUT') {
      // Raw force only: no powers! 7 and 6 have zero risk from 1 or 3
      if (card.rank >= 5) {
        weight += 35 + card.rank * 5;
      } else {
        weight -= 10;
      }
      return { card, weight };
    }

    // Standard & Prime Time heuristic
    switch (card.rank) {
      case 7:
        if (playerHasRank1) {
          weight += effectivePot >= 2 ? 8 : -15;
        } else {
          weight += 45 + effectivePot * 15;
        }
        break;

      case 6:
        if (playerHasRank1) {
          weight += -10;
        } else {
          weight += 28 + effectivePot * 8;
        }
        break;

      case 5:
        if (playerHasRank1 || playerHasRank3) {
          weight += 30 + effectivePot * 5;
        } else {
          weight += 15;
        }
        break;

      case 4:
        if (effectivePot >= 2 || playerScore > aiScore) {
          weight += 30 + effectivePot * 10;
        } else {
          weight += 12;
        }
        break;

      case 3:
        if (playerHasRank7 || playerHasRank6) {
          weight += 28 + (playerHasRank1 ? 5 : 15);
        } else {
          weight += 8;
        }
        break;

      case 2:
        weight += 15;
        break;

      case 1:
        if (playerHasRank7 || playerHasRank6) {
          weight += (playerHasRank7 ? 25 : 0) + (playerHasRank6 ? 15 : 0) + effectivePot * 10;
        } else {
          weight -= 20;
        }
        break;

      case 0:
        if (state.currentRound <= 2 && effectivePot === 1) {
          weight += 25;
        } else {
          weight -= 15;
        }
        break;
    }

    weight += Math.random() * 8;
    return { card, weight };
  });

  scores.sort((a, b) => b.weight - a.weight);
  return scores[0].card;
}

/**
 * Resolves a duel round
 */
export function resolveDuelRound(
  state: GameState,
  playerCard: CardDefinition,
  aiCard: CardDefinition
): RoundResult {
  const roundNum = state.currentRound;
  const theme = state.roundTheme;
  const potBase = state.pot;
  const effectivePot = theme === 'PRIME_TIME' ? potBase + 1 : potBase;
  const powerLogs: string[] = [];

  let playerPowerActive = true;
  let aiPowerActive = true;

  // If FACE_A_FACE_BRUT: All powers are disabled!
  if (theme === 'FACE_A_FACE_BRUT') {
    playerPowerActive = false;
    aiPowerActive = false;
    powerLogs.push(`🥊 Face-à-Face Brut : Tous les pouvoirs spéciaux sont désactivés !`);
  } else {
    // 1. Spin Doctor (5)
    const playerPlayed5 = playerCard.rank === 5;
    const aiPlayed5 = aiCard.rank === 5;

    if (playerPlayed5 && aiPlayed5) {
      powerLogs.push(`🌪️ Double Spin Doctor : neutralisation mutuelle.`);
    } else {
      if (playerPlayed5) {
        if (aiCard.rank === 7) {
          powerLogs.push(`🛡️ Candidat adverse (7) immunisé au Spin Doctor.`);
        } else {
          aiPowerActive = false;
          powerLogs.push(`🔇 Votre Spin Doctor neutralise le pouvoir adverse.`);
        }
      }

      if (aiPlayed5) {
        if (playerCard.rank === 7) {
          powerLogs.push(`🛡️ Votre Candidat (7) immunisé au Spin Doctor.`);
        } else {
          playerPowerActive = false;
          powerLogs.push(`🔇 Le Spin Doctor adverse neutralise votre pouvoir.`);
        }
      }
    }
  }

  // 2. Rank 0 (Gaffe / Stagiaire) spy effect
  if (playerCard.rank === 0 && playerPowerActive) {
    powerLogs.push(`👀 La Gaffe révèle toute la main adverse.`);
  }

  // 3. Rank 1 (Casserole) vs 7 or 6
  let winner: 'PLAYER' | 'AI' | 'NONE' = 'NONE';
  let verdict: RoundVerdict = 'TIE';
  let pointsAwarded = 0;
  let isCasseroleTriggered = false;

  const playerTriggers1 = playerCard.rank === 1 && playerPowerActive && (aiCard.rank === 7 || aiCard.rank === 6);
  const aiTriggers1 = aiCard.rank === 1 && aiPowerActive && (playerCard.rank === 7 || playerCard.rank === 6);

  if (playerTriggers1) {
    winner = 'PLAYER';
    verdict = 'SCANDALE_PLAYER';
    pointsAwarded = Math.max(effectivePot, 2);
    isCasseroleTriggered = true;
    powerLogs.push(`🚨 Scandale d'État ! La Casserole élimine le favori (+${pointsAwarded} pts) !`);
  } else if (aiTriggers1) {
    winner = 'AI';
    verdict = 'SCANDALE_AI';
    pointsAwarded = Math.max(effectivePot, 2);
    isCasseroleTriggered = true;
    powerLogs.push(`🚨 Scandale d'État adverse ! Votre favori s'effondre (+${pointsAwarded} pts IA) !`);
  }

  // 4. Force comparison
  const playerEffectiveForce = playerCard.baseForce + state.playerNextBonus;
  const aiEffectiveForce = aiCard.baseForce + state.aiNextBonus;

  if (!isCasseroleTriggered) {
    const playerAutoLoses = playerCard.rank === 0 && playerPowerActive;
    const aiAutoLoses = aiCard.rank === 0 && aiPowerActive;

    if (playerAutoLoses && aiAutoLoses) {
      winner = 'NONE';
      verdict = 'TIE';
      powerLogs.push(`🤝 Double Gaffe : égalité.`);
    } else if (playerAutoLoses) {
      winner = 'AI';
      verdict = 'AI_WIN';
      powerLogs.push(`📉 La Gaffe vous fait perdre ce round.`);
    } else if (aiAutoLoses) {
      winner = 'PLAYER';
      verdict = 'PLAYER_WIN';
      powerLogs.push(`📈 La Gaffe adverse vous offre la manche.`);
    } else {
      // Inversion check: from Theme OR Rank 3
      const themeInverts = theme === 'SONDAGE_INVERSE';
      const playerInverts = playerCard.rank === 3 && playerPowerActive;
      const aiInverts = aiCard.rank === 3 && aiPowerActive;
      const isInverted = themeInverts || playerInverts || aiInverts;

      if (isInverted) {
        powerLogs.push(`📊 Inversion : le plus petit score gagne !`);
      }

      if (playerEffectiveForce === aiEffectiveForce) {
        // Tie: Militant (2) check
        const playerMilitant = playerCard.rank === 2 && playerPowerActive;
        const aiMilitant = aiCard.rank === 2 && aiPowerActive;

        if (playerMilitant && !aiMilitant) {
          winner = 'PLAYER';
          verdict = 'PLAYER_WIN';
          powerLogs.push(`🚩 Militants : vous remportez l'égalité.`);
        } else if (aiMilitant && !playerMilitant) {
          winner = 'AI';
          verdict = 'AI_WIN';
          powerLogs.push(`🚩 Militants adverses : l'IA remporte l'égalité.`);
        } else {
          winner = 'NONE';
          verdict = 'TIE';
          powerLogs.push(`⚖️ Égalité parfaite (${playerEffectiveForce} vs ${aiEffectiveForce}).`);
        }
      } else {
        const playerIsWeaker = playerEffectiveForce < aiEffectiveForce;
        const playerWinsCombat = isInverted ? playerIsWeaker : !playerIsWeaker;

        if (playerWinsCombat) {
          winner = 'PLAYER';
          verdict = 'PLAYER_WIN';
        } else {
          winner = 'AI';
          verdict = 'AI_WIN';
        }
      }

      // 5. Bouclier (4)
      if (winner === 'AI' && playerCard.rank === 4 && playerPowerActive) {
        winner = 'NONE';
        verdict = 'TIE';
        powerLogs.push(`🛡️ Bouclier : défaite annulée (égalité forcée).`);
      } else if (winner === 'PLAYER' && aiCard.rank === 4 && aiPowerActive) {
        winner = 'NONE';
        verdict = 'TIE';
        powerLogs.push(`🛡️ Bouclier adverse : égalité forcée.`);
      }
    }
  }

  // Adjust pot and scores
  let potAfterRound = 1;
  let playerScoreAfter = state.playerScore;
  let aiScoreAfter = state.aiScore;

  if (winner === 'PLAYER') {
    if (!isCasseroleTriggered) {
      pointsAwarded = effectivePot;
    }
    playerScoreAfter += pointsAwarded;
    potAfterRound = 1;
  } else if (winner === 'AI') {
    if (!isCasseroleTriggered) {
      pointsAwarded = effectivePot;
    }
    aiScoreAfter += pointsAwarded;
    potAfterRound = 1;
  } else {
    pointsAwarded = 0;
    potAfterRound = effectivePot + 1;
    powerLogs.push(`🔥 Égalité : ${potAfterRound} pts en jeu au prochain tour !`);
  }

  // Rank 6 next bonus
  if (winner === 'PLAYER' && playerCard.rank === 6 && playerPowerActive) {
    powerLogs.push(`⚡ Lieutenant : +2 force au prochain tour.`);
  }
  if (winner === 'AI' && aiCard.rank === 6 && aiPowerActive) {
    powerLogs.push(`⚡ Lieutenant adverse : +2 force au prochain tour.`);
  }

  return {
    roundNumber: roundNum,
    theme,
    playerCard,
    aiCard,
    playerEffectiveForce,
    aiEffectiveForce,
    playerPowerActive,
    aiPowerActive,
    powerLogs,
    verdict,
    winner,
    pointsAwarded,
    potBeforeRound: effectivePot,
    potAfterRound,
    playerScoreAfter,
    aiScoreAfter
  };
}

export function applyRoundResult(state: GameState, result: RoundResult): GameState {
  const newPlayerHand = state.playerHand.filter((c) => c.rank !== result.playerCard.rank);
  const newAIHand = state.aiHand.filter((c) => c.rank !== result.aiCard.rank);

  const aiHandRevealed = state.aiHandRevealed || (result.playerCard.rank === 0 && result.playerPowerActive);

  const playerNextBonus = result.winner === 'PLAYER' && result.playerCard.rank === 6 && result.playerPowerActive ? 2 : 0;
  const aiNextBonus = result.winner === 'AI' && result.aiCard.rank === 6 && result.aiPowerActive ? 2 : 0;

  const playerPlayedRanks: CardRank[] = [...state.playerPlayedRanks, result.playerCard.rank];
  const aiPlayedRanks: CardRank[] = [...state.aiPlayedRanks, result.aiCard.rank];

  let winner: 'PLAYER' | 'AI' | 'DRAW' | null = null;
  let phase: GameState['phase'] = 'ROUND_VERDICT';

  if (result.playerScoreAfter >= state.targetScore) {
    winner = 'PLAYER';
    phase = 'GAME_OVER';
  } else if (result.aiScoreAfter >= state.targetScore) {
    winner = 'AI';
    phase = 'GAME_OVER';
  } else if (state.currentRound >= state.maxRounds || newPlayerHand.length === 0) {
    if (result.playerScoreAfter > result.aiScoreAfter) {
      winner = 'PLAYER';
    } else if (result.aiScoreAfter > result.playerScoreAfter) {
      winner = 'AI';
    } else {
      winner = 'DRAW';
    }
    phase = 'GAME_OVER';
  }

  return {
    ...state,
    playerScore: result.playerScoreAfter,
    aiScore: result.aiScoreAfter,
    pot: result.potAfterRound,
    playerHand: newPlayerHand,
    aiHand: newAIHand,
    playerPlayedRanks,
    aiPlayedRanks,
    playerNextBonus,
    aiNextBonus,
    aiHandRevealed,
    currentRoundResult: result,
    roundHistory: [...state.roundHistory, result],
    phase,
    winner
  };
}

export function advanceToNextRound(state: GameState): GameState {
  if (state.phase === 'GAME_OVER') return state;

  const nextRoundNum = state.currentRound + 1;
  const nextTheme = drawRandomTheme(nextRoundNum);

  return {
    ...state,
    currentRound: nextRoundNum,
    roundTheme: nextTheme,
    playerPlayedCard: null,
    aiPlayedCard: null,
    currentRoundResult: null,
    phase: 'ROUND_CHOOSE'
  };
}
