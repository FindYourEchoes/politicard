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

export function App() {
  const [selectedPlayerFaction, setSelectedPlayerFaction] = useState<FactionId | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardDefinition | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // When player picks their political faction from select screen
  const handleSelectFaction = (factionId: FactionId) => {
    setSelectedPlayerFaction(factionId);
    const initial = createInitialGameState(factionId);
    setGameState(initial);
    setSelectedCard(null);
  };

  // Play card towards the podium (via central button, double tap, or confirm)
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

    // Brief reveal suspense (500ms) before computing verdict
    setTimeout(() => {
      setGameState((prev) => {
        if (!prev) return prev;
        const result = resolveDuelRound(prev, card, aiCard);
        return applyRoundResult(prev, result);
      });
    }, 500);
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

  // 1. Initial State: Camp Selection Screen (10 Factions 2027)
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

  // 3. Central Debate Duel Game View (max-w-2xl mx-auto w-full h-[100dvh])
  return (
    <div className="w-full h-[100dvh] bg-black flex justify-center items-center overflow-hidden font-sans select-none">
      <main className="max-w-2xl mx-auto w-full h-[100dvh] bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden shadow-2xl border-x border-slate-800/60 relative">
        {/* Top Header Bar with visual deduction pills */}
        <TopBar
          state={gameState}
          onOpenRules={() => setIsRulesOpen(true)}
          onRestart={handleChangeFaction}
        />

        {/* Center Compact 1-Arena TV Stage (Two slots face to face + Theme) */}
        <TVDebateArena
          state={gameState}
          onNextRound={handleNextRound}
          selectedCard={selectedCard}
          onPlaySelectedCard={() => {
            if (selectedCard) handlePlayCard(selectedCard);
          }}
        />

        {/* Bottom 4x2 Grid Hand (~45% of height, all 8 cards visible) */}
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
      </main>
    </div>
  );
}

export default App;
