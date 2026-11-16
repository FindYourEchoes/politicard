export type FactionId =
  | 'france_insoumise'
  | 'rassemblement_national'
  | 'bloc_central'
  | 'place_publique_ps'
  | 'les_republicains'
  | 'reconquete'
  | 'ecologistes'
  | 'parti_communiste'
  | 'lutte_ouvriere_npa'
  | 'souverainistes';

export type CardRank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type DebateTheme =
  | 'CLASSIQUE'
  | 'SONDAGE_INVERSE'
  | 'FACE_A_FACE_BRUT'
  | 'PRIME_TIME';

export interface CardDefinition {
  rank: CardRank;
  baseForce: number;
  name: string;
  roleBadge: string;
  shortPower: string;
  detailedPower: string;
  factionId: FactionId;
}

export interface FactionInfo {
  id: FactionId;
  name: string;
  shortName: string;
  ideology: string;
  color: string;
  accentColor: string;
  iconName: string;
  slogan: string;
  candidateName: string;
}

export type RoundVerdict =
  | 'PLAYER_WIN'
  | 'AI_WIN'
  | 'TIE'
  | 'SCANDALE_PLAYER'
  | 'SCANDALE_AI';

export interface RoundResult {
  roundNumber: number;
  theme: DebateTheme;
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
  roundTheme: DebateTheme;
  playerHand: CardDefinition[];
  aiHand: CardDefinition[];
  playerPlayedRanks: CardRank[];
  aiPlayedRanks: CardRank[];
  playerNextBonus: number;
  aiNextBonus: number;
  aiHandRevealed: boolean;
  playerPlayedCard: CardDefinition | null;
  aiPlayedCard: CardDefinition | null;
  currentRoundResult: RoundResult | null;
  roundHistory: RoundResult[];
  phase: 'ROUND_CHOOSE' | 'ROUND_REVEAL' | 'ROUND_VERDICT' | 'GAME_OVER';
  winner: 'PLAYER' | 'AI' | 'DRAW' | null;
}
