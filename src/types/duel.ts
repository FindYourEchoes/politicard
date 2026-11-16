export type FactionId =
  | 'revolution_permanente'
  | 'union_populaire'
  | 'social_democratie'
  | 'bloc_central'
  | 'droite_republicaine'
  | 'union_nationale';

export type CardRank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface CardDefinition {
  rank: CardRank;
  baseForce: number;
  name: string;
  roleTitle: string;
  shortPower: string;
  detailedPower: string;
  quote: string;
  factionId: FactionId;
}

export interface FactionInfo {
  id: FactionId;
  name: string;
  shortName: string;
  ideology: string;
  color: string;
  accentColor: string;
  bgGradient: string;
  cardBg: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  iconName: string;
  slogan: string;
  description: string;
  candidateName: string;
}

export type RoundVerdict =
  | 'PLAYER_WIN'
  | 'AI_WIN'
  | 'TIE'
  | 'SCANDALE_PLAYER'
  | 'SCANDALE_AI'
  | 'CANCELLED_PLAYER'
  | 'CANCELLED_AI';

export interface RoundResult {
  roundNumber: number;
  playerCard: CardDefinition;
  aiCard: CardDefinition;
  playerEffectiveForce: number;
  aiEffectiveForce: number;
  playerPowerActive: boolean;
  aiPowerActive: boolean;
  powerLogs: string[];
  verdict: RoundVerdict;
  winner: 'PLAYER' | 'AI' | 'NONE';
  pointsAwarded: number;
  potBeforeRound: number;
  potAfterRound: number;
  playerScoreAfter: number;
  aiScoreAfter: number;
}

export interface GameState {
  playerFaction: FactionId;
  aiFaction: FactionId;
  playerScore: number;
  aiScore: number;
  targetScore: number;
  pot: number;
  currentRound: number;
  maxRounds: number;
  playerHand: CardDefinition[];
  aiHand: CardDefinition[];
  playerNextBonus: number;
  aiNextBonus: number;
  aiHandRevealed: boolean;
  playerPlayedCard: CardDefinition | null;
  aiPlayedCard: CardDefinition | null;
  currentRoundResult: RoundResult | null;
  roundHistory: RoundResult[];
  phase: 'SELECT_CAMP' | 'ROUND_CHOOSE' | 'ROUND_REVEAL' | 'ROUND_VERDICT' | 'GAME_OVER';
  winner: 'PLAYER' | 'AI' | 'DRAW' | null;
}
