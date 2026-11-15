import { Lane } from '../types/game';

export type LaneTemplate = Omit<Lane, 'playerCards' | 'aiCards' | 'playerTraps' | 'aiTraps'>;

export const LANE_TEMPLATES: LaneTemplate[] = [
  {
    id: 'lane-jt-20h',
    name: 'Le Plateau du JT de 20h',
    subtitle: 'Heure de Grande Écoute',
    description: 'Le temple de la petite phrase et du sourire ultra-bright devant 8 millions de téléspectateurs.',
    modifierCode: 'JT_20H_MEDIA_AMPLIFIER',
    modifierText: 'Figures MÉDIATIQUE : +1 Charisme. Si un camp attaque sans opposition ici, +1 Opinion supplémentaire.',
    iconName: 'Tv',
  },
  {
    id: 'lane-hemicycle',
    name: 'L\'Hémicycle',
    subtitle: 'Palais Bourbon & Couloirs',
    description: 'Séances nocturnes, rappels au règlement, claquements de pupitres et amendements en rafale.',
    modifierCode: 'HEMICYCLE_INSTITUTIONAL',
    modifierText: 'Figures INSTITUTIONNEL ou TECHNOCRATE : +1 Charisme passif et +1 Crédibilité dès la pose.',
    iconName: 'Landmark',
  },
  {
    id: 'lane-la-rue',
    name: 'La Rue & Réseaux',
    subtitle: 'Cortèges, Mégaphones & Hashtags',
    description: 'Là où les slogans claquent plus fort que les décrets et où la viralité fait la loi.',
    modifierCode: 'LA_RUE_POPULIST_ARENA',
    modifierText: 'Figures POPULISTE ou MILITANT : +2 Charisme passif sur ce terrain.',
    iconName: 'FlameKindling',
  },
];

export function createInitialLanes(): Lane[] {
  return LANE_TEMPLATES.map((template) => ({
    ...template,
    playerCards: [],
    aiCards: [],
    playerTraps: [],
    aiTraps: [],
  }));
}
