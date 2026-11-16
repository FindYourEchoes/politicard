import { useState } from 'react';
import { FactionId, GameState, CardDefinition } from './types/duel';
import {
  createInitialGameState,
  chooseAICard,
  resolveDuelRound,
  applyRoundResult,
  advanceToNextRound
} from './engine/duelEngine';
import { FactionSelectScreen } from './components/FactionSelectScreen';
import { TopBar } from './components/TopBar';
import { TVDebateArena } from './components/TVDebateArena';
import { PlayerHand } from './components/PlayerHand';
import { VictoryScreen } from './components/VictoryScreen';
import { RulesModal } from './components/RulesModal';
import { SpyModal } from './components/SpyModal';

export function App() {
  const [selectedPlayerFaction, setSelectedPlayerFaction] = useState<FactionId | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  const [selectedCard, setSelectedCard] = useState<CardDefinition | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSpyModalOpen, setIsSpyModalOpen] = useState(false);

  // When player picks their political faction from select screen
  const handleSelectFaction = (factionId: FactionId) => {
    setSelectedPlayerFaction(factionId);
    const initial = createInitialGameState(factionId);
    setGameState(initial);
    setSelectedCard(null);
  };

  // Play selected card towards the podium
  const handlePlayCard = (card: CardDefinition) => {
    if (!gameState || gameState.phase !== 'ROUND_CHOOSE') return;

    // AI selects a card intelligently
    const aiCard = chooseAICard(gameState);

    // Enter reveal phase
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        playerPlayedCard: card,
        aiPlayedCard: aiCard,
        phase: 'ROUND_REVEAL'
      };
    });

    setSelectedCard(null);

    // Short dramatic reveal suspense (600ms) before flipping and computing verdict
    setTimeout(() => {
      setGameState((prev) => {
        if (!prev) return prev;
        const result = resolveDuelRound(prev, card, aiCard);
        return applyRoundResult(prev, result);
      });
    }, 600);
  };

  // Advance to next round from verdict
  const handleNextRound = () => {
    if (!gameState) return;
    setGameState((prev) => {
      if (!prev) return prev;
      return advanceToNextRound(prev);
    });
    setSelectedCard(null);
  };

  // Rematch with same factions
  const handleRematch = () => {
    if (!selectedPlayerFaction) return;
    setGameState(createInitialGameState(selectedPlayerFaction));
    setSelectedCard(null);
  };

  // Go back to Camp Selection
  const handleChangeFaction = () => {
    setGameState(null);
    setSelectedPlayerFaction(null);
    setSelectedCard(null);
  };

  // 1. Initial State: Camp Selection Screen
  if (!gameState || !selectedPlayerFaction) {
    return <FactionSelectScreen onSelectFaction={handleSelectFaction} />;
  }

  // 2. Game Over: Victory / Election Night Screen
  if (gameState.phase === 'GAME_OVER') {
    return (
      <VictoryScreen
        state={gameState}
        onRematch={handleRematch}
        onChangeFaction={handleChangeFaction}
      />
    );
  }

  // 3. Central Debate Duel Game View (Strictly mobile-first: h-[100dvh] overflow-hidden)
  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header Bar */}
      <TopBar
        state={gameState}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenSpyModal={() => setIsSpyModalOpen(true)}
        onRestart={handleChangeFaction}
      />

      {/* Center 1-Arena TV Stage */}
      <TVDebateArena
        state={gameState}
        onNextRound={handleNextRound}
        selectedCard={selectedCard}
        onPlaySelectedCard={() => {
          if (selectedCard) handlePlayCard(selectedCard);
        }}
      />

      {/* Bottom Horizontal Player Hand */}
      <PlayerHand
        cards={gameState.playerHand}
        selectedCard={selectedCard}
        onSelectCard={(card) => setSelectedCard(card)}
        onPlayCard={handlePlayCard}
        playerNextBonus={gameState.playerNextBonus}
        disabled={gameState.phase !== 'ROUND_CHOOSE'}
      />

      {/* Rules & Mirror Roles Cheat Sheet Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Spy Modal (When Rank 0 has been played) */}
      <SpyModal
        isOpen={isSpyModalOpen}
        onClose={() => setIsSpyModalOpen(false)}
        aiHand={gameState.aiHand}
      />
    </div>
  );
}

export default App;
