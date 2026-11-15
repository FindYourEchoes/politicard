export type CardType = 'FIGURE' | 'UPGRADE' | 'EVENT' | 'TRAP';

export type Alignment =
  | 'INSTITUTIONNEL'
  | 'POPULISTE'
  | 'MEDIATIQUE'
  | 'TECHNOCRATE'
  | 'MILITANT'
  | 'SOUVERAINISTE';

export type EffectTrigger =
  | 'ON_PLAY'
  | 'PASSIVE_AURA'
  | 'ON_UPGRADE'
  | 'ON_TRAP_TRIGGER'
  | 'INSTANT_EVENT';

export type EffectCode =
  | 'VIEUX_GENERAL_SHIELD'        // Réduit les dégâts reçus de 2 (min 1)
  | 'EN_MEME_TEMPS_AGILE'         // Gagne +2 Charisme et +1 Crédibilité supplémentaires par Upgrade équipé
  | 'MAGNAT_POPULISTE_CLASH'      // +2 Charisme s'il y a au moins une Figure adverse en face
  | 'PORTE_PAROLE_ANTI_TRAP'      // Annule les Pièges ennemis sur ce terrain à la pose et gagne +1 Crédibilité
  | 'JEUNE_LOUP_RUSH'             // Donne +1 Opinion Publique immédiatement à la pose
  | 'INFLUENCEUR_RESEAUX'         // +3 Charisme sur La Rue / Réseaux Sociaux ou Le Plateau du JT
  | 'MANDARIN_BERCY_TAX'          // Fait gagner +1 Capital Politique ce tour-ci et +1 Opinion à la pose
  | 'TRIBUNE_PEUPLE_RALLY'        // Donne +1 Charisme aux autres Figures alliées sur ce terrain
  | 'TRIBUN_INSOUMIS_RALLY'       // Gagne +1 Charisme pour chaque autre Figure alliée présente sur l'ensemble du plateau
  | 'DIPLOMATE_EXIL'              // À la pose, repousse la Figure adverse située directement en face vers un autre terrain libre aléatoire
  | 'UPGRADE_POPULISME'           // +4 Charisme, -2 Crédibilité
  | 'UPGRADE_PLAN_COM'            // +1 Charisme, +2 Crédibilité
  | 'UPGRADE_SPIN_DOCTOR'         // +2 Charisme, +3 Crédibilité
  | 'EVENT_PETITE_PHRASE'         // Inflige 2 dégâts à une Figure adverse (ou +2 Opinion si aucune) + Pioche 1 carte
  | 'EVENT_SONDAGE_COMMANDE'      // Fait avancer la Jauge d'Opinion de +2 (+4 sur Le Plateau du JT de 20h)
  | 'EVENT_CELLULE_CRISE'         // Remaniement Ministériel : Soigne +3 Crédibilité et donne +1 Charisme à toutes vos Figures sur un terrain
  | 'EVENT_MOTION_CENSURE'        // Détruit immédiatement toute Figure adverse sur le terrain ciblé ayant 3 de Crédibilité ou moins
  | 'TRAP_MICRO_OUVERT'           // Annule le bonus d'entrée de la prochaine Figure adverse jouée ici et lui inflige 3 dégâts
  | 'TRAP_TWEET_2012'             // Détruit tous les Upgrades de la Figure adverse qui attaque ou reçoit un Upgrade, et lui inflige 2 dégâts
  | 'TRAP_CONTROLE_FISCAL'        // Inflige 2 dégâts et réduit le Charisme de 2 sur la prochaine Figure adverse jouée sur ce terrain
  | 'TRAP_RETOURNEMENT_VESTE';    // Réduit le Charisme de moitié (arrondi à l'inférieur) et vole +1 Capital Politique pour votre prochain tour

export interface ActiveEffect {
  id: string;
  code: EffectCode;
  trigger: EffectTrigger;
  name: string;
  description: string;
  value?: number;
}

export interface Card {
  id: string;
  templateId: string;
  name: string;
  subtitle: string;
  type: CardType;
  cost: number;
  charisma: number;         // Attaque / Influence
  maxCredibility: number;   // PV Max
  credibility: number;      // PV actuels
  alignments: Alignment[];
  effect: ActiveEffect;
  flavorText: string;
  iconName: string;
  imageUrl?: string;        // Illustration Full-Art (ex: /cards/fig-jeune-loup.png)
  upgrades: Card[];         // Upgrades équipés sur cette Figure
  owner: 'PLAYER' | 'AI';
  isFaceDown?: boolean;     // Pour les Pièges (Casseroles)
  playedOnTurn?: number;    // Tour auquel la carte a été posée (pour l'annulation / reprise en main)
  slotIndex?: number;       // Emplacement exact (0, 1 ou 2) occupé sur le Terrain pour le duel face-à-face
}

export type LaneModifierCode =
  | 'JT_20H_MEDIA_AMPLIFIER'
  | 'HEMICYCLE_INSTITUTIONAL'
  | 'LA_RUE_POPULIST_ARENA';

export interface Lane {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  modifierCode: LaneModifierCode;
  modifierText: string;
  iconName: string;
  playerCards: Card[];      // Max 3 Figures
  aiCards: Card[];          // Max 3 Figures
  playerTraps: Card[];      // Pièges posés par le joueur sur ce terrain (se déclenchent contre l'IA)
  aiTraps: Card[];          // Pièges posés par l'IA sur ce terrain (se déclenchent contre le joueur)
}

export interface FloatingFeedback {
  id: string;
  laneId: string;
  targetSide: 'PLAYER' | 'AI' | 'OPINION';
  cardId?: string;
  text: string;
  tone: 'damage' | 'buff' | 'opinion' | 'trap' | 'eliminated';
}

export interface TriggeredTrapAlert {
  id: string;
  trapName: string;
  targetName: string;
  laneName: string;
  effectSummary: string;
  triggeredByOwner: 'PLAYER' | 'AI';
}

export interface ActionLogEntry {
  id: string;
  turn: number;
  timestamp: string;
  actor: 'PLAYER' | 'AI' | 'SYSTEM';
  headline: string;
  details: string;
  category: 'PLAY' | 'COMBAT' | 'TRAP' | 'OPINION' | 'PRESS' | 'VICTORY';
}

export type GamePhase = 'PLAYER_ACTION' | 'DEBATE_RESOLUTION' | 'GAME_OVER';

export type VictoryReason =
  | 'LANDSLIDE_PLAYER'
  | 'LANDSLIDE_AI'
  | 'POINTS_PLAYER'
  | 'POINTS_AI'
  | 'TIE_OPINION';

export interface GameState {
  turn: number;
  maxTurns: number;
  phase: GamePhase;
  opinion: number;          // -20 (Raz-de-marée IA) à +20 (Raz-de-marée Joueur)
  stakesMultiplier: number; // 1 par défaut, 2 si "Convoquer la Presse" activé (double les points de classement finaux)
  pressCalledBy: 'NONE' | 'PLAYER' | 'AI';
  playerCapital: number;
  playerMaxCapital: number;
  aiCapital: number;
  aiMaxCapital: number;
  playerNextTurnCapitalBonus?: number;
  aiNextTurnCapitalBonus?: number;
  playerHand: Card[];
  aiHand: Card[];
  playerDeck: Card[];
  aiDeck: Card[];
  playerDiscard: Card[];
  aiDiscard: Card[];
  lanes: Lane[];
  logs: ActionLogEntry[];
  floatingFeedbacks: FloatingFeedback[];
  triggeredTrapAlert?: TriggeredTrapAlert | null;
  winner: 'PLAYER' | 'AI' | 'DRAW' | null;
  victoryReason: VictoryReason | null;
}
