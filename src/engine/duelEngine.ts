import { CardDefinition, FactionId, GameState, RoundResult, RoundVerdict } from '../types/duel';
import { generateFactionDeck, FACTIONS } from '../data/factions';

export function createInitialGameState(playerFaction: FactionId, aiFaction?: FactionId): GameState {
  // If aiFaction not provided, pick random faction different from player
  const allFactionIds = Object.keys(FACTIONS) as FactionId[];
  const availableAIFactions = allFactionIds.filter((f) => f !== playerFaction);
  const selectedAIFaction = aiFaction || availableAIFactions[Math.floor(Math.random() * availableAIFactions.length)];

  return {
    playerFaction,
    aiFaction: selectedAIFaction,
    playerScore: 0,
    aiScore: 0,
    targetScore: 4,
    pot: 1,
    currentRound: 1,
    maxRounds: 8,
    playerHand: generateFactionDeck(playerFaction),
    aiHand: generateFactionDeck(selectedAIFaction),
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
 * Intelligent AI choice heuristic
 */
export function chooseAICard(state: GameState): CardDefinition {
  const { aiHand, playerHand, pot, playerScore, aiScore } = state;

  if (aiHand.length === 1) {
    return aiHand[0];
  }

  const playerHasRank7 = playerHand.some((c) => c.rank === 7);
  const playerHasRank6 = playerHand.some((c) => c.rank === 6);
  const playerHasRank1 = playerHand.some((c) => c.rank === 1);
  const playerHasRank3 = playerHand.some((c) => c.rank === 3);

  // Score candidate cards
  const scores: { card: CardDefinition; weight: number }[] = aiHand.map((card) => {
    let weight = 10;

    switch (card.rank) {
      case 7: {
        // Le Candidat (7)
        if (playerHasRank1) {
          // Dangerous if player still has Casserole!
          weight += pot >= 2 ? 5 : -15;
        } else {
          // If Casserole is out of the way, 7 is supreme!
          weight += 40 + pot * 15;
        }
        break;
      }
      case 6: {
        // La Lieutenante (6)
        if (playerHasRank1) {
          weight += -10;
        } else {
          weight += 25 + pot * 8;
        }
        break;
      }
      case 5: {
        // Le Spin Doctor (5)
        // Excellent counter against tricks (3, 1, 4)
        if (playerHasRank1 || playerHasRank3) {
          weight += 28 + pot * 5;
        } else {
          weight += 15;
        }
        break;
      }
      case 4: {
        // L'Attaché de Presse (4) - Bouclier
        // Great defensive play when pot is high or when behind
        if (pot >= 2 || playerScore > aiScore) {
          weight += 30 + pot * 10;
        } else {
          weight += 12;
        }
        break;
      }
      case 3: {
        // Le Sondeur (3) - Inversion
        // Great if player likely to play high card (7, 6)
        if (playerHasRank7 || playerHasRank6) {
          weight += 26 + (playerHasRank1 ? 5 : 15);
        } else {
          weight += 8;
        }
        break;
      }
      case 2: {
        // Le Militant (2) - Tie breaker
        weight += 14;
        break;
      }
      case 1: {
        // La Casserole (1) - Trap for 7 and 6
        if (playerHasRank7 || playerHasRank6) {
          // High pot or late game = player tempted to play 7 or 6
          const playerProb = (playerHasRank7 ? 20 : 0) + (playerHasRank6 ? 15 : 0) + pot * 10;
          weight += playerProb;
        } else {
          // Dead card basically
          weight -= 20;
        }
        break;
      }
      case 0: {
        // La Gaffe (0) - Spy hand
        // Best used in round 1 or 2 when pot is 1
        if (state.currentRound <= 2 && pot === 1) {
          weight += 22;
        } else {
          weight -= 15;
        }
        break;
      }
    }

    // Add small random noise for variety
    weight += Math.random() * 8;
    return { card, weight };
  });

  scores.sort((a, b) => b.weight - a.weight);
  return scores[0].card;
}

/**
 * Resolves a round between playerCard and aiCard
 * Priority: 5 Spin Doctor > 3 Sondeur > 1 Casserole > 4 Attaché de presse > 2 Militant
 */
export function resolveDuelRound(
  state: GameState,
  playerCard: CardDefinition,
  aiCard: CardDefinition
): RoundResult {
  const roundNum = state.currentRound;
  const potBefore = state.pot;
  const powerLogs: string[] = [];

  let playerPowerActive = true;
  let aiPowerActive = true;

  // 1. STEP: Spin Doctor (Rank 5)
  // Cancels opponent's power UNLESS opponent is Rank 7 (Candidate is fully immune!)
  const playerPlayed5 = playerCard.rank === 5;
  const aiPlayed5 = aiCard.rank === 5;

  if (playerPlayed5 && aiPlayed5) {
    powerLogs.push(`🌪️ Double Spin Doctor ! Les deux cellules de crise s’annulent mutuellement.`);
    // Both are 5s, both powers effectively neutralize
  } else {
    if (playerPlayed5) {
      if (aiCard.rank === 7) {
        powerLogs.push(`🛡️ Le Candidat adverse (7) est immunisé contre le Spin Doctor !`);
      } else {
        aiPowerActive = false;
        powerLogs.push(`🔇 Votre Spin Doctor (5) annule le pouvoir spécial adverse (${aiCard.name}) !`);
      }
    }

    if (aiPlayed5) {
      if (playerCard.rank === 7) {
        powerLogs.push(`🛡️ Votre Candidat (7) est immunisé contre le Spin Doctor adverse !`);
      } else {
        playerPowerActive = false;
        powerLogs.push(`🔇 Le Spin Doctor de l’IA (5) neutralise votre pouvoir (${playerCard.name}) !`);
      }
    }
  }

  // 2. STEP: Gaffe en direct (Rank 0) - Spy effect
  if (playerCard.rank === 0 && playerPowerActive) {
    powerLogs.push(`👀 Gaffe du Stagiaire : Vous infiltrez les coulisses et dévoilez la main adverse !`);
  }
  if (aiCard.rank === 0 && aiPowerActive) {
    powerLogs.push(`🕵️ L'IA commet une gaffe mais analyse vos cartes restantes.`);
  }

  // 3. STEP: Casserole / Dossier Noir (Rank 1) vs 7 or 6
  let winner: 'PLAYER' | 'AI' | 'NONE' = 'NONE';
  let verdict: RoundVerdict = 'TIE';
  let pointsAwarded = 0;
  let isCasseroleTriggered = false;

  const playerTriggers1 = playerCard.rank === 1 && playerPowerActive && (aiCard.rank === 7 || aiCard.rank === 6);
  const aiTriggers1 = aiCard.rank === 1 && aiPowerActive && (playerCard.rank === 7 || playerCard.rank === 6);

  if (playerTriggers1 && aiTriggers1) {
    // Both played 1 against each other's 7/6? Impossible since cards played are 1 and 1
  } else if (playerTriggers1) {
    winner = 'PLAYER';
    verdict = 'SCANDALE_PLAYER';
    pointsAwarded = Math.max(potBefore, 2);
    isCasseroleTriggered = true;
    powerLogs.push(`🚨 SCANDALE D'ÉTAT ! Votre Casserole (1) anéantit le ${aiCard.name} adverse ! +${pointsAwarded} pts d'Opinion !`);
  } else if (aiTriggers1) {
    winner = 'AI';
    verdict = 'SCANDALE_AI';
    pointsAwarded = Math.max(potBefore, 2);
    isCasseroleTriggered = true;
    powerLogs.push(`🚨 SCANDALE D'ÉTAT ! Le Dossier Noir adverse (1) fait chuter votre ${playerCard.name} ! L'IA prend +${pointsAwarded} pts !`);
  }

  // 4. If Casserole did not conclude the round: Compare forces & other powers
  const playerEffectiveForce = playerCard.baseForce + state.playerNextBonus;
  const aiEffectiveForce = aiCard.baseForce + state.aiNextBonus;

  if (!isCasseroleTriggered) {
    // Check Rank 0 auto-loss:
    const playerAutoLoses = playerCard.rank === 0 && playerPowerActive;
    const aiAutoLoses = aiCard.rank === 0 && aiPowerActive;

    if (playerAutoLoses && aiAutoLoses) {
      winner = 'NONE';
      verdict = 'TIE';
      powerLogs.push(`🤝 Double Gaffe en direct ! Égalité des bourdes.`);
    } else if (playerAutoLoses) {
      winner = 'AI';
      verdict = 'AI_WIN';
      powerLogs.push(`📉 Votre Gaffe (0) vous coûte ce round de débat.`);
    } else if (aiAutoLoses) {
      winner = 'PLAYER';
      verdict = 'PLAYER_WIN';
      powerLogs.push(`📈 La Gaffe adverse (0) vous offre le round sur un plateau !`);
    } else {
      // Inversion des courbes (Rank 3 Sondeur)
      const playerInverts = playerCard.rank === 3 && playerPowerActive;
      const aiInverts = aiCard.rank === 3 && aiPowerActive;
      const isInverted = playerInverts || aiInverts;

      if (isInverted) {
        powerLogs.push(`📊 Inversion des Courbes ! La carte avec la plus FAIBLE force l’emporte !`);
      }

      if (playerEffectiveForce === aiEffectiveForce) {
        // Equal forces: Check Rank 2 (Militant - Mobilisation)
        const playerMilitant = playerCard.rank === 2 && playerPowerActive;
        const aiMilitant = aiCard.rank === 2 && aiPowerActive;

        if (playerMilitant && !aiMilitant) {
          winner = 'PLAYER';
          verdict = 'PLAYER_WIN';
          powerLogs.push(`🚩 Mobilisation de terrain (2) : Vos militants font basculer l’égalité en votre faveur !`);
        } else if (aiMilitant && !playerMilitant) {
          winner = 'AI';
          verdict = 'AI_WIN';
          powerLogs.push(`🚩 Mobilisation adverse (2) : Les militants de l’IA arrachent la victoire sur l’égalité !`);
        } else {
          winner = 'NONE';
          verdict = 'TIE';
          powerLogs.push(`⚖️ Égalité parfaite de forces (${playerEffectiveForce} vs ${aiEffectiveForce}) !`);
        }
      } else {
        // Forces are different
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

      // 5. STEP: Attaché de Presse (Rank 4) - Bouclier médiatique
      // If losing, forces a tie (no points for opponent)
      if (winner === 'AI' && playerCard.rank === 4 && playerPowerActive) {
        winner = 'NONE';
        verdict = 'TIE';
        powerLogs.push(`🛡️ Bouclier Médiatique : Votre Attaché de Presse (4) étouffe l’affaire ! Égalité forcée.`);
      } else if (winner === 'PLAYER' && aiCard.rank === 4 && aiPowerActive) {
        winner = 'NONE';
        verdict = 'TIE';
        powerLogs.push(`🛡️ Bouclier Médiatique : L’Attaché de Presse adverse (4) sauve les meubles ! Égalité forcée.`);
      }
    }
  }

  // Calculate points and pot adjustments
  let potAfterRound = 1;
  let playerScoreAfter = state.playerScore;
  let aiScoreAfter = state.aiScore;

  if (winner === 'PLAYER') {
    if (!isCasseroleTriggered) {
      pointsAwarded = potBefore;
    }
    playerScoreAfter += pointsAwarded;
    potAfterRound = 1;
  } else if (winner === 'AI') {
    if (!isCasseroleTriggered) {
      pointsAwarded = potBefore;
    }
    aiScoreAfter += pointsAwarded;
    potAfterRound = 1;
  } else {
    // TIE: Point stays in pot for next round!
    pointsAwarded = 0;
    potAfterRound = potBefore + 1;
    powerLogs.push(`🔥 Égalité ! Le point est reporté au Pot Médiatique (${potAfterRound} pts en jeu au prochain tour) !`);
  }

  // 6. Lieutenante (Rank 6) - Momentum bonus for next round if won
  if (winner === 'PLAYER' && playerCard.rank === 6 && playerPowerActive) {
    powerLogs.push(`⚡ Tremplin Médiatique : Victoire du Bras Droit (6) ! +2 en force pour votre prochain round.`);
  }
  if (winner === 'AI' && aiCard.rank === 6 && aiPowerActive) {
    powerLogs.push(`⚡ Tremplin Médiatique : L'IA remporte le round avec son Bras Droit (6) ! +2 en force au prochain tour.`);
  }

  return {
    roundNumber: roundNum,
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
    potBeforeRound: potBefore,
    potAfterRound,
    playerScoreAfter,
    aiScoreAfter
  };
}

/**
 * Applies a resolved round to the GameState
 */
export function applyRoundResult(state: GameState, result: RoundResult): GameState {
  const newPlayerHand = state.playerHand.filter((c) => c.rank !== result.playerCard.rank);
  const newAIHand = state.aiHand.filter((c) => c.rank !== result.aiCard.rank);

  // Check if AI hand was revealed by player playing 0
  const aiHandRevealed = state.aiHandRevealed || (result.playerCard.rank === 0 && result.playerPowerActive);

  // Next round bonus: only if won with rank 6
  const playerNextBonus = result.winner === 'PLAYER' && result.playerCard.rank === 6 && result.playerPowerActive ? 2 : 0;
  const aiNextBonus = result.winner === 'AI' && result.aiCard.rank === 6 && result.aiPowerActive ? 2 : 0;

  // Determine game winner
  let winner: 'PLAYER' | 'AI' | 'DRAW' | null = null;
  let phase: GameState['phase'] = 'ROUND_VERDICT';

  if (result.playerScoreAfter >= state.targetScore) {
    winner = 'PLAYER';
    phase = 'GAME_OVER';
  } else if (result.aiScoreAfter >= state.targetScore) {
    winner = 'AI';
    phase = 'GAME_OVER';
  } else if (state.currentRound >= state.maxRounds || newPlayerHand.length === 0) {
    // All 8 rounds played
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
    playerNextBonus,
    aiNextBonus,
    aiHandRevealed,
    currentRoundResult: result,
    roundHistory: [...state.roundHistory, result],
    phase,
    winner
  };
}

/**
 * Advances to the next round after reviewing verdict
 */
export function advanceToNextRound(state: GameState): GameState {
  if (state.phase === 'GAME_OVER') return state;

  return {
    ...state,
    currentRound: state.currentRound + 1,
    playerPlayedCard: null,
    aiPlayedCard: null,
    currentRoundResult: null,
    phase: 'ROUND_CHOOSE'
  };
}
