import { FactionId, FactionInfo, CardDefinition, CardRank, DebateTheme } from '../types/duel';

export const THEME_DETAILS: Record<DebateTheme, { title: string; subtitle: string; badge: string; color: string }> = {
  CLASSIQUE: {
    title: 'Débat Classique',
    subtitle: 'Règles et pouvoirs normaux',
    badge: 'STANDARD',
    color: 'border-slate-700 bg-slate-900 text-slate-300'
  },
  SONDAGE_INVERSE: {
    title: 'Sondage Inversé',
    subtitle: 'La plus faible force l’emporte !',
    badge: 'INVERSION',
    color: 'border-amber-500/60 bg-amber-950/80 text-amber-300'
  },
  FACE_A_FACE_BRUT: {
    title: 'Face-à-Face Brut',
    subtitle: 'Tous les pouvoirs sont désactivés',
    badge: 'FORCE PURE',
    color: 'border-red-500/60 bg-red-950/80 text-red-300'
  },
  PRIME_TIME: {
    title: 'Prime Time x2',
    subtitle: '+1 point bonus dans le pot',
    badge: 'BONUS POT',
    color: 'border-emerald-500/60 bg-emerald-950/80 text-emerald-300'
  }
};

export const FACTIONS: Record<FactionId, FactionInfo> = {
  extreme_gauche: {
    id: 'extreme_gauche',
    name: 'Extrême Gauche Révolutionnaire',
    shortName: 'Extrême Gauche',
    ideology: 'Révolutionnaire',
    color: '#DC2626',
    accentColor: '#991B1B',
    iconName: 'Megaphone',
    slogan: 'Grand Soir garanti dès demain, grève générale illimitée !',
    candidateName: 'Nathalie Rouget'
  },
  gauche_insoumise: {
    id: 'gauche_insoumise',
    name: 'Gauche Insoumise',
    shortName: 'Insoumis',
    ideology: 'Gauche Radicale',
    color: '#E11D48',
    accentColor: '#0284C7',
    iconName: 'Zap',
    slogan: 'La République, c’est nous ! Et la 6e République aussi !',
    candidateName: 'Jean-Luc Le Tribun'
  },
  parti_communiste: {
    id: 'parti_communiste',
    name: 'Parti Communiste',
    shortName: 'Communistes',
    ideology: 'Gauche Populaire',
    color: '#B91C1C',
    accentColor: '#991B1B',
    iconName: 'Flame',
    slogan: 'La bonne viande, le vin rouge et les jours heureux !',
    candidateName: 'Fabien Du Barbecue'
  },
  ecologistes: {
    id: 'ecologistes',
    name: 'Les Écologistes',
    shortName: 'Écologistes',
    ideology: 'Écologie Politique',
    color: '#16A34A',
    accentColor: '#15803D',
    iconName: 'Leaf',
    slogan: 'Déconstruction, vélos cargo et zéro bitume !',
    candidateName: 'Marine Du Zéro Carbone'
  },
  parti_socialiste: {
    id: 'parti_socialiste',
    name: 'Parti Socialiste',
    shortName: 'Socialistes',
    ideology: 'Social-Démocratie',
    color: '#EC4899',
    accentColor: '#BE123C',
    iconName: 'Flower2',
    slogan: 'Le compromis historique entre la synthèse et le consensus.',
    candidateName: 'Olivier Des Synthèses'
  },
  bloc_central: {
    id: 'bloc_central',
    name: 'Bloc Central & Majorité',
    shortName: 'Bloc Central',
    ideology: 'Centre Technocrate',
    color: '#F59E0B',
    accentColor: '#2563EB',
    iconName: 'Sparkles',
    slogan: 'En même temps disruptif, régalien et pragmatique.',
    candidateName: 'Emmanuel Jupiter'
  },
  droite_republicaine: {
    id: 'droite_republicaine',
    name: 'Droite Républicaine',
    shortName: 'Droite Rép.',
    ideology: 'Droite Classique',
    color: '#2563EB',
    accentColor: '#1E3A8A',
    iconName: 'Landmark',
    slogan: 'L’ordre, le travail, le mérite... et les beaux costumes.',
    candidateName: 'Laurent Des Notables'
  },
  droite_liberale: {
    id: 'droite_liberale',
    name: 'Droite Libérale',
    shortName: 'Libéraux',
    ideology: 'Droite Conservatrice',
    color: '#6366F1',
    accentColor: '#4338CA',
    iconName: 'TrendingUp',
    slogan: 'Moins d’impôts, plus de caméras et débats sur CNews.',
    candidateName: 'Éric De La Reconquête'
  },
  souverainistes: {
    id: 'souverainistes',
    name: 'Souverainistes de France',
    shortName: 'Souverainistes',
    ideology: 'Souverainisme',
    color: '#0284C7',
    accentColor: '#0369A1',
    iconName: 'ShieldAlert',
    slogan: 'La France d’abord, les frontières et le Frexit tranquille !',
    candidateName: 'Nicolas Du Pont de l’Île'
  },
  rassemblement_national: {
    id: 'rassemblement_national',
    name: 'Rassemblement National',
    shortName: 'Rassemblement',
    ideology: 'Droite Nationale',
    color: '#1E3A8A',
    accentColor: '#0F172A',
    iconName: 'ShieldCheck',
    slogan: 'Le bon sens paysan, le JT de 13h et la priorité nationale !',
    candidateName: 'Jordan Du Micro'
  }
};

export const ROLE_DEFINITIONS: Record<CardRank, {
  roleBadge: string;
  shortPower: string;
  detailedPower: string;
}> = {
  7: {
    roleBadge: 'CANDIDAT',
    shortPower: 'Immunité totale',
    detailedPower: 'Immunité : force et pouvoir ne peuvent être annulés.'
  },
  6: {
    roleBadge: 'LIEUTENANT',
    shortPower: 'Gagne = +2 suivant',
    detailedPower: 'Si victorieux, votre prochain round a +2 en force.'
  },
  5: {
    roleBadge: 'SPIN DOCTOR',
    shortPower: 'Annule le pouvoir adverse',
    detailedPower: 'Neutralise le pouvoir spécial de la carte adverse.'
  },
  4: {
    roleBadge: 'BOUCLIER',
    shortPower: 'Défaite = Égalité forcée',
    detailedPower: 'Si vous perdez ce round, transforme en égalité.'
  },
  3: {
    roleBadge: 'SONDEUR',
    shortPower: 'Le plus faible gagne',
    detailedPower: 'Inversion : la force la plus basse remporte le duel.'
  },
  2: {
    roleBadge: 'MILITANT',
    shortPower: 'Égalité = Victoire',
    detailedPower: 'En cas d’égalité de score, vous gagnez la manche.'
  },
  1: {
    roleBadge: 'CASSEROLE',
    shortPower: 'Bat le 7 et 6',
    detailedPower: 'Élimine le 7 ou 6 adverse et offre +2 pts d’Opinion !'
  },
  0: {
    roleBadge: 'GAFFE',
    shortPower: 'Révèle la main IA',
    detailedPower: 'Perd d’office ce tour, mais espionne la main de l’IA.'
  }
};

export const FACTION_NAMES: Record<FactionId, Record<CardRank, string>> = {
  extreme_gauche: {
    7: 'La Porte-Parole',
    6: 'Le Délégué CGT',
    5: 'L’Agitateur',
    4: 'Le Tracteur',
    3: 'Le Blogueur',
    2: 'Le Colleur',
    1: 'La Casserole',
    0: 'La Gaffe TV'
  },
  gauche_insoumise: {
    7: 'Le Tribun',
    6: 'La Députée',
    5: 'Le Stratège TikTok',
    4: 'Le Débunkueur',
    3: 'Le Sondage Interne',
    2: 'La Caravane',
    1: 'Le Logement Caché',
    0: 'Le Tweet de 3h'
  },
  parti_communiste: {
    7: 'Le Secrétaire',
    6: 'Le Métallo',
    5: 'L’Édito l’Huma',
    4: 'Le Porte-Drapeau',
    3: 'L’Écho Populaire',
    2: 'Le Camarade Fête',
    1: 'Le Banquet Oublié',
    0: 'Le Micro Ouvert'
  },
  ecologistes: {
    7: 'Le Maire Vert',
    6: 'La Députée Climat',
    5: 'Le Conseiller Vélo',
    4: 'La Plume Bio',
    3: 'L’Index Éco',
    2: 'Le Zadiste',
    1: 'Le Vol en Avion',
    0: 'Le Couac Éolien'
  },
  parti_socialiste: {
    7: 'L’Ancien Ministre',
    6: 'Le Député Sortant',
    5: 'Le Rédacteur Flou',
    4: 'L’Éditorialiste',
    3: 'Le Baromètre',
    2: 'Le Maire Rural',
    1: 'Le Compte Suisse',
    0: 'L’Oubli du Nom'
  },
  bloc_central: {
    7: 'Le Président',
    6: 'Le Premier Ministre',
    5: 'Le Senior McKinsey',
    4: 'La Porte-Parole',
    3: 'L’Indice Stat',
    2: 'Le Marcheur',
    1: 'Le Montage Conseil',
    0: 'La Phrase Choc'
  },
  droite_republicaine: {
    7: 'Le Baron Local',
    6: 'Le Directeur',
    5: 'Le Communicant',
    4: 'La Plume Figaro',
    3: 'L’Analyste Libéral',
    2: 'Le Notaire Local',
    1: 'L’Emploi Fictif',
    0: 'Le Pain Chocolat'
  },
  droite_liberale: {
    7: 'Le Polémiste',
    6: 'Le Lieutenant TV',
    5: 'Le Stratège Digital',
    4: 'Le Chroniqueur',
    3: 'Le Grand Sondage',
    2: 'Le Jeune Militant',
    1: 'Le Prêt Douteux',
    0: 'La Fausse Citation'
  },
  souverainistes: {
    7: 'Le Patriote Chef',
    6: 'Le Député Souverain',
    5: 'Le Douanier Chef',
    4: 'Le Rédacteur Libre',
    3: 'La Voix Terroir',
    2: 'Le Gardien Borne',
    1: 'L’Annexe Cachée',
    0: 'La Fiche Échappée'
  },
  rassemblement_national: {
    7: 'La Présidente',
    6: 'Le Numéro Deux',
    5: 'Le Chroniqueur TV',
    4: 'Le Porte-Voix',
    3: 'L’Observateur',
    2: 'Le Délégué Canton',
    1: 'L’Emprunt Russe',
    0: 'L’Erreur de Fiche'
  }
};

export function generateFactionDeck(factionId: FactionId): CardDefinition[] {
  const ranks: CardRank[] = [7, 6, 5, 4, 3, 2, 1, 0];
  const names = FACTION_NAMES[factionId];

  return ranks.map((rank) => {
    const role = ROLE_DEFINITIONS[rank];
    return {
      rank,
      baseForce: rank,
      name: names[rank],
      roleBadge: role.roleBadge,
      shortPower: role.shortPower,
      detailedPower: role.detailedPower,
      factionId
    };
  });
}
