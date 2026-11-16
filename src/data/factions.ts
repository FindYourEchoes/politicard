import { FactionId, FactionInfo, CardDefinition, CardRank, DebateTheme } from '../types/duel';

export const THEME_DETAILS: Record<DebateTheme, { title: string; subtitle: string; badge: string; color: string }> = {
  CLASSIQUE: {
    title: 'Débat Classique',
    subtitle: 'Règles et pouvoirs normaux',
    badge: 'STANDARD',
    color: 'border-slate-700 bg-slate-900/90 text-slate-200'
  },
  SONDAGE_INVERSE: {
    title: 'Sondage Inversé',
    subtitle: 'La plus faible force gagne ce tour !',
    badge: 'INVERSION',
    color: 'border-amber-500/80 bg-amber-950/90 text-amber-300'
  },
  FACE_A_FACE_BRUT: {
    title: 'Face-à-Face Brut',
    subtitle: 'Pouvoirs spéciaux désactivés !',
    badge: 'FORCE PURE',
    color: 'border-red-500/80 bg-red-950/90 text-red-300'
  },
  PRIME_TIME: {
    title: 'Prime Time x2',
    subtitle: '+1 point bonus dans le pot médiatique',
    badge: 'BONUS POT',
    color: 'border-emerald-500/80 bg-emerald-950/90 text-emerald-300'
  }
};

export const FACTIONS: Record<FactionId, FactionInfo> = {
  france_insoumise: {
    id: 'france_insoumise',
    name: 'La France Insoumise',
    shortName: 'LFI',
    ideology: 'Gauche Radicale',
    color: '#E11D48',
    accentColor: '#9F1239',
    iconName: 'Zap',
    slogan: 'Faites mieux ! La République, le bruit et la fureur, c’est nous !',
    candidateName: 'Jean-Luc Mélenchon'
  },
  rassemblement_national: {
    id: 'rassemblement_national',
    name: 'Rassemblement National',
    shortName: 'RN',
    ideology: 'Droite Nationale',
    color: '#1E3A8A',
    accentColor: '#0F172A',
    iconName: 'ShieldCheck',
    slogan: 'Vivement demain ! Le bon sens populaire et la priorité nationale.',
    candidateName: 'Marine Le Pen'
  },
  bloc_central: {
    id: 'bloc_central',
    name: 'Bloc Central (Renaissance / Horizons)',
    shortName: 'Bloc Central',
    ideology: 'Centre / Majorité',
    color: '#F59E0B',
    accentColor: '#D97706',
    iconName: 'Sparkles',
    slogan: 'En même temps réarmement civique, ordonnances et dépassement.',
    candidateName: 'Gabriel Attal'
  },
  place_publique_ps: {
    id: 'place_publique_ps',
    name: 'Place Publique & Parti Socialiste',
    shortName: 'PP / PS',
    ideology: 'Gauche Européenne',
    color: '#EC4899',
    accentColor: '#BE123C',
    iconName: 'Flower2',
    slogan: 'Le réveil européen, l’écologie pragmatique et la rose au poing.',
    candidateName: 'Raphaël Glucksmann'
  },
  les_republicains: {
    id: 'les_republicains',
    name: 'Les Républicains (Droite)',
    shortName: 'LR',
    ideology: 'Droite Républicaine',
    color: '#2563EB',
    accentColor: '#1D4ED8',
    iconName: 'Landmark',
    slogan: 'L’ordre, le travail, le mérite et les valeurs républicaines.',
    candidateName: 'Laurent Wauquiez'
  },
  reconquete: {
    id: 'reconquete',
    name: 'Reconquête !',
    shortName: 'Reconquête',
    ideology: 'Droite Identitaire',
    color: '#6366F1',
    accentColor: '#4338CA',
    iconName: 'TrendingUp',
    slogan: 'Pour que la France reste la France ! Débats non-stop et reconquête.',
    candidateName: 'Éric Zemmour'
  },
  ecologistes: {
    id: 'ecologistes',
    name: 'Les Écologistes',
    shortName: 'Les Verts',
    ideology: 'Écologie Politique',
    color: '#16A34A',
    accentColor: '#15803D',
    iconName: 'Leaf',
    slogan: 'La veste verte, la justice climatique et zéro mégabassine !',
    candidateName: 'Marine Tondelier'
  },
  parti_communiste: {
    id: 'parti_communiste',
    name: 'Parti Communiste Français',
    shortName: 'PCF',
    ideology: 'Gauche Populaire',
    color: '#DC2626',
    accentColor: '#B91C1C',
    iconName: 'Flame',
    slogan: 'La France des jours heureux, la bonne viande et le pouvoir d’achat.',
    candidateName: 'Fabien Roussel'
  },
  lutte_ouvriere_npa: {
    id: 'lutte_ouvriere_npa',
    name: 'Lutte Ouvrière / NPA',
    shortName: 'LO / NPA',
    ideology: 'Extrême Gauche',
    color: '#991B1B',
    accentColor: '#7F1D1D',
    iconName: 'Megaphone',
    slogan: 'Travailleuses, travailleurs : renversons le capitalisme bourgeois !',
    candidateName: 'Nathalie Arthaud'
  },
  souverainistes: {
    id: 'souverainistes',
    name: 'Souverainistes & Divers',
    shortName: 'Souverainistes',
    ideology: 'Souverainisme',
    color: '#0284C7',
    accentColor: '#0369A1',
    iconName: 'ShieldAlert',
    slogan: 'Frexit immédiat, défense du terroir et sortie des traités !',
    candidateName: 'François Asselineau'
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
    detailedPower: 'Si victorieux, votre prochaine carte aura +2 en force.'
  },
  5: {
    roleBadge: 'SPIN DOCTOR',
    shortPower: 'Annule pouvoir adverse',
    detailedPower: 'Neutralise le pouvoir spécial de la carte adverse.'
  },
  4: {
    roleBadge: 'BOUCLIER',
    shortPower: 'Défaite = Égalité',
    detailedPower: 'Si vous perdez ce round, transforme la manche en égalité.'
  },
  3: {
    roleBadge: 'SONDEUR',
    shortPower: 'Plus faible gagne',
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
    shortPower: 'Révèle main IA',
    detailedPower: 'Perd d’office ce tour, mais espionne la main de l’IA.'
  }
};

export const FACTION_NAMES: Record<FactionId, Record<CardRank, string>> = {
  france_insoumise: {
    7: 'Jean-Luc Mélenchon',
    6: 'Manuel Bompard',
    5: 'Mathilde Panot',
    4: 'Rima Hassan',
    3: 'Louis Boyard',
    2: 'Militant Insoumis',
    1: 'Note de Frais',
    0: 'Tweet Nocturne'
  },
  rassemblement_national: {
    7: 'Marine Le Pen',
    6: 'Jordan Bardella',
    5: 'Sébastien Chenu',
    4: 'Jean-Philippe Tanguy',
    3: 'Influenceur TikTok RN',
    2: 'Militant Patriote',
    1: 'Prêt Bancaire',
    0: 'Gaffe en Direct'
  },
  bloc_central: {
    7: 'Gabriel Attal',
    6: 'Édouard Philippe',
    5: 'Stéphane Séjourné',
    4: 'Aurore Bergé',
    3: 'Consultant Cabinet',
    2: 'Marcheur de Terrain',
    1: '49.3 Surprise',
    0: 'Phrase "Traverser la Rue"'
  },
  place_publique_ps: {
    7: 'Raphaël Glucksmann',
    6: 'Olivier Faure',
    5: 'Boris Vallaud',
    4: 'Carole Delga',
    3: 'Sondeur Opinion',
    2: 'Militant à la Rose',
    1: 'Motion de Synthèse',
    0: 'Score à 1,7%'
  },
  les_republicains: {
    7: 'Laurent Wauquiez',
    6: 'Bruno Retailleau',
    5: 'Xavier Bertrand',
    4: 'Annie Genevard',
    3: 'Éditorialiste Figaro',
    2: 'Militant Droite',
    1: 'Emploi Fictif',
    0: 'Dîner Fastueux'
  },
  reconquete: {
    7: 'Éric Zemmour',
    6: 'Sarah Knafo',
    5: 'Marion Maréchal',
    4: 'Stanislas Rigault',
    3: 'Polémiste CNews',
    2: 'Militant Reconquête',
    1: 'Doigt d’Honneur',
    0: 'Micro Ouvert'
  },
  ecologistes: {
    7: 'Marine Tondelier',
    6: 'Sandrine Rousseau',
    5: 'Yannick Jadot',
    4: 'Cyrielle Chatelain',
    3: 'Activiste Climat',
    2: 'Cycliste Urbain',
    1: 'Barbecue Polémique',
    0: 'Sapin de Noël'
  },
  parti_communiste: {
    7: 'Fabien Roussel',
    6: 'Léon Deffontaines',
    5: 'Ian Brossat',
    4: 'Elsa Faucillon',
    3: 'Chroniqueur L’Huma',
    2: 'Syndicaliste CGT',
    1: 'Camion Merguez',
    0: 'Archive URSS'
  },
  lutte_ouvriere_npa: {
    7: 'Nathalie Arthaud',
    6: 'Philippe Poutou',
    5: 'Olivier Besancenot',
    4: 'Anasse Kazib',
    3: 'Porte-Voix AG',
    2: 'Gréviste RATP',
    1: 'Tract Illisible',
    0: 'Scission du Parti'
  },
  souverainistes: {
    7: 'François Asselineau',
    6: 'Nicolas Dupont-Aignan',
    5: 'Jean Lassalle',
    4: 'Florian Philippot',
    3: 'Youtuber Frexit',
    2: 'Gilet Jaune',
    1: 'Article 50',
    0: 'Micro Coupé'
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
