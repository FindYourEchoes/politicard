import { Card } from '../types/game';

export type CardTemplate = Omit<Card, 'id' | 'owner' | 'upgrades' | 'isFaceDown' | 'playedOnTurn' | 'slotIndex'>;

export const CARD_DATABASE: CardTemplate[] = [
  // ==========================================
  // 1. FIGURES POLITIQUES (10 Cartes)
  // ==========================================
  {
    templateId: 'fig-jeune-loup',
    name: 'Le Jeune Loup',
    subtitle: 'Énarque Dents-Longues',
    type: 'FIGURE',
    cost: 1,
    charisma: 2,
    maxCredibility: 4,
    credibility: 4,
    alignments: ['INSTITUTIONNEL', 'MEDIATIQUE'],
    effect: {
      id: 'eff-jeune-loup',
      code: 'JEUNE_LOUP_RUSH',
      trigger: 'ON_PLAY',
      name: 'Percée Médiatique',
      description: 'À la pose : Fait immédiatement avancer la Jauge d\'Opinion de +1 vers votre camp.',
      value: 1,
    },
    flavorText: '« Je n’ai pas d’ambition personnelle, je sers simplement mon destin national. »',
    iconName: 'Zap',
  },
  {
    templateId: 'fig-porte-parole',
    name: 'La Porte-Parole de Choc',
    subtitle: 'Pare-Feu Ministériel',
    type: 'FIGURE',
    cost: 2,
    charisma: 2,
    maxCredibility: 6,
    credibility: 6,
    alignments: ['INSTITUTIONNEL', 'MEDIATIQUE'],
    effect: {
      id: 'eff-porte-parole',
      code: 'PORTE_PAROLE_ANTI_TRAP',
      trigger: 'ON_PLAY',
      name: 'Langue de Bois Blindée',
      description: 'À la pose : Désamorce toutes les Casseroles (Pièges) adverses sur ce terrain et gagne +1 Crédibilité par piège annulé.',
      value: 1,
    },
    flavorText: '« Ce n’est pas un recul, c’est une réorientation pédagogique du calendrier. »',
    iconName: 'ShieldAlert',
  },
  {
    templateId: 'fig-influenceur',
    name: 'L\'Influenceur Politique',
    subtitle: 'Polémiste 2.0 en Direct',
    type: 'FIGURE',
    cost: 2,
    charisma: 2,
    maxCredibility: 5,
    credibility: 5,
    alignments: ['MEDIATIQUE', 'POPULISTE'],
    effect: {
      id: 'eff-influenceur',
      code: 'INFLUENCEUR_RESEAUX',
      trigger: 'PASSIVE_AURA',
      name: 'Algorithme Viral',
      description: 'Gagne +3 Charisme s\'il est déployé sur "La Rue & Réseaux" ou "Le Plateau du JT de 20h".',
      value: 3,
    },
    flavorText: '« Abonnez-vous et partagez avant que le Système ne censure cette vidéo ! »',
    iconName: 'Smartphone',
  },
  {
    templateId: 'fig-stratege-emt',
    name: 'Le Stratège "En Même Temps"',
    subtitle: 'Acrobate du Consensus',
    type: 'FIGURE',
    cost: 3,
    charisma: 3,
    maxCredibility: 6,
    credibility: 6,
    alignments: ['TECHNOCRATE', 'INSTITUTIONNEL'],
    effect: {
      id: 'eff-stratege-emt',
      code: 'EN_MEME_TEMPS_AGILE',
      trigger: 'ON_UPGRADE',
      name: 'Synthèse Agile',
      description: 'Peut équiper plusieurs Upgrades. Chaque Upgrade équipé lui confère un bonus additionnel de +2 Charisme et +1 Crédibilité.',
      value: 2,
    },
    flavorText: '« Je suis résolument pour, tout en étant fermement opposé au contraire. »',
    iconName: 'Scale',
  },
  {
    templateId: 'fig-mandarin-bercy',
    name: 'Le Mandarin de Bercy',
    subtitle: 'Grand Prêtre du Tableur',
    type: 'FIGURE',
    cost: 3,
    charisma: 2,
    maxCredibility: 7,
    credibility: 7,
    alignments: ['TECHNOCRATE', 'INSTITUTIONNEL'],
    effect: {
      id: 'eff-mandarin-bercy',
      code: 'MANDARIN_BERCY_TAX',
      trigger: 'ON_PLAY',
      name: 'Amendement Budgétaire 49.3',
      description: 'À la pose : Vous rend immédiatement +1 Capital Politique ce tour-ci et +1 Opinion Publique.',
      value: 1,
    },
    flavorText: '« Les Français comprennent très bien la nécessité d’un effort structurel. »',
    iconName: 'Briefcase',
  },
  {
    templateId: 'fig-diplomate-chevronne',
    name: 'Le Diplomate Chevronné',
    subtitle: 'Ambassadeur des Couloirs Feutrés',
    type: 'FIGURE',
    cost: 3,
    charisma: 2,
    maxCredibility: 6,
    credibility: 6,
    alignments: ['INSTITUTIONNEL'],
    effect: {
      id: 'eff-diplomate-exil',
      code: 'DIPLOMATE_EXIL',
      trigger: 'ON_PLAY',
      name: 'Mutation Diplomatique',
      description: 'À la pose : Repousse la Figure adverse située directement en face vers un autre terrain libre aléatoire.',
      value: 1,
    },
    flavorText: '« Je viens de le nommer Haut-Commissaire aux Terres Australes. Il part demain matin. »',
    iconName: 'Briefcase',
  },
  {
    templateId: 'fig-tribune-peuple',
    name: 'La Tribune Populaire',
    subtitle: 'Voix des Mégaphones',
    type: 'FIGURE',
    cost: 3,
    charisma: 3,
    maxCredibility: 6,
    credibility: 6,
    alignments: ['MILITANT', 'POPULISTE'],
    effect: {
      id: 'eff-tribune-peuple',
      code: 'TRIBUNE_PEUPLE_RALLY',
      trigger: 'PASSIVE_AURA',
      name: 'Ferveur Militante',
      description: 'Tant qu\'elle est en jeu, donne +1 Charisme à toutes les autres Figures alliées sur ce terrain.',
      value: 1,
    },
    flavorText: '« La République, c’est nous ! Et surtout aux heures de grande écoute ! »',
    iconName: 'Megaphone',
  },
  {
    templateId: 'fig-tribun-insoumis',
    name: 'Le Tribun Insoumis',
    subtitle: 'Hologramme de Masse',
    type: 'FIGURE',
    cost: 4,
    charisma: 4,
    maxCredibility: 6,
    credibility: 6,
    alignments: ['MILITANT', 'POPULISTE'],
    effect: {
      id: 'eff-tribun-insoumis',
      code: 'TRIBUN_INSOUMIS_RALLY',
      trigger: 'PASSIVE_AURA',
      name: 'Mobilisation Générale',
      description: 'Gagne +1 Charisme pour chaque autre Figure alliée présente sur l\'ensemble du plateau.',
      value: 1,
    },
    flavorText: '« Nous sommes le nombre, nous sommes le bruit et la fureur des urnes ! »',
    iconName: 'Flame',
  },
  {
    templateId: 'fig-vieux-general',
    name: 'Le Vieux Général',
    subtitle: 'Statue du Commandeur',
    type: 'FIGURE',
    cost: 4,
    charisma: 3,
    maxCredibility: 10,
    credibility: 10,
    alignments: ['INSTITUTIONNEL', 'SOUVERAINISTE'],
    effect: {
      id: 'eff-vieux-general',
      code: 'VIEUX_GENERAL_SHIELD',
      trigger: 'PASSIVE_AURA',
      name: 'Képi Insubmersible',
      description: 'Tank défensif : Réduit de 2 tous les dégâts de Charisme subis lors de la Phase de Débat (minimum 1 dégât).',
      value: 2,
    },
    flavorText: '« De mon temps, on ne tweetait pas, on rédigeait des mémoires en trois tomes. »',
    iconName: 'Shield',
  },
  {
    templateId: 'fig-magnat-populiste',
    name: 'Le Magnat Populiste',
    subtitle: 'Milliardaire Anti-Système',
    type: 'FIGURE',
    cost: 5,
    charisma: 6,
    maxCredibility: 7,
    credibility: 7,
    alignments: ['POPULISTE', 'MEDIATIQUE'],
    effect: {
      id: 'eff-magnat-populiste',
      code: 'MAGNAT_POPULISTE_CLASH',
      trigger: 'PASSIVE_AURA',
      name: 'Prime au Clash',
      description: 'Gros frappeur : Gagne +2 Charisme supplémentaires s\'il fait face à au moins une Figure adverse sur ce terrain.',
      value: 2,
    },
    flavorText: '« J’ai acheté trois chaînes d’info pour pouvoir dire qu’on me bâillonne ! »',
    iconName: 'Flame',
  },

  // ==========================================
  // 2. UPGRADES IDÉOLOGIQUES (3 Cartes)
  // ==========================================
  {
    templateId: 'upg-populisme-decomplexe',
    name: 'Populisme Décomplexé',
    subtitle: 'Raccourci Démagogique',
    type: 'UPGRADE',
    cost: 2,
    charisma: 4,
    maxCredibility: -2,
    credibility: -2,
    alignments: ['POPULISTE'],
    effect: {
      id: 'eff-upg-populisme',
      code: 'UPGRADE_POPULISME',
      trigger: 'ON_UPGRADE',
      name: 'Punchline Explosif',
      description: 'Équipe une Figure alliée : +4 Charisme, mais -2 Crédibilité (minimum 1 PV restant).',
      value: 4,
    },
    flavorText: 'Pourquoi proposer un programme quand un bon bouc émissaire suffit ?',
    iconName: 'TrendingUp',
  },
  {
    templateId: 'upg-plan-com',
    name: 'Plan Com\' Millimétré',
    subtitle: 'Coaching & Éléments de Langage',
    type: 'UPGRADE',
    cost: 2,
    charisma: 1,
    maxCredibility: 2,
    credibility: 2,
    alignments: ['MEDIATIQUE', 'TECHNOCRATE'],
    effect: {
      id: 'eff-upg-plan-com',
      code: 'UPGRADE_PLAN_COM',
      trigger: 'ON_UPGRADE',
      name: 'Maquillage Télévisuel',
      description: 'Équipe une Figure alliée : +1 Charisme et +2 Crédibilité.',
      value: 2,
    },
    flavorText: 'Manches retroussées de 4 centimètres, regard tourné vers l\'horizon à 15 degrés.',
    iconName: 'Sparkles',
  },
  {
    templateId: 'upg-spin-doctor',
    name: 'Cabinet Noir & Spin Doctor',
    subtitle: 'Conseiller de l\'Ombre',
    type: 'UPGRADE',
    cost: 3,
    charisma: 2,
    maxCredibility: 3,
    credibility: 3,
    alignments: ['TECHNOCRATE', 'INSTITUTIONNEL'],
    effect: {
      id: 'eff-upg-spin-doctor',
      code: 'UPGRADE_SPIN_DOCTOR',
      trigger: 'ON_UPGRADE',
      name: 'Immunité Médiatique',
      description: 'Équipe une Figure alliée : +2 Charisme et +3 Crédibilité.',
      value: 3,
    },
    flavorText: '« Il n’y a pas d’affaire, il n’y a qu’un calendrier judiciaire regrettable. »',
    iconName: 'Eye',
  },

  // ==========================================
  // 3. ÉVÉNEMENTS (4 Cartes)
  // ==========================================
  {
    templateId: 'evt-petite-phrase',
    name: 'Petite Phrase Assassine',
    subtitle: 'Scandale en Direct',
    type: 'EVENT',
    cost: 2,
    charisma: 0,
    maxCredibility: 0,
    credibility: 0,
    alignments: ['MEDIATIQUE'],
    effect: {
      id: 'eff-evt-petite-phrase',
      code: 'EVENT_PETITE_PHRASE',
      trigger: 'INSTANT_EVENT',
      name: 'Saillie Virale',
      description: 'Inflige 2 dégâts de Crédibilité à la Figure adverse la plus exposée sur le terrain ciblé (ou +2 Opinion si le terrain adverse est vide) et pioche 1 carte.',
      value: 2,
    },
    flavorText: 'Répétée en boucle sur les bandeaux d’info continue pendant 72 heures.',
    iconName: 'MessageSquareWarning',
  },
  {
    templateId: 'evt-sondage-commande',
    name: 'Sondage Commandé',
    subtitle: 'Institut "Opinion Express"',
    type: 'EVENT',
    cost: 2,
    charisma: 0,
    maxCredibility: 0,
    credibility: 0,
    alignments: ['INSTITUTIONNEL', 'MEDIATIQUE'],
    effect: {
      id: 'eff-evt-sondage',
      code: 'EVENT_SONDAGE_COMMANDE',
      trigger: 'INSTANT_EVENT',
      name: 'Marge d\'Erreur Favorable',
      description: 'Fait progresser la Jauge d\'Opinion de +2 vers votre camp (+4 s\'il est joué sur Le Plateau du JT de 20h).',
      value: 2,
    },
    flavorText: 'Échantillon représentatif de 14 personnes interrogées à la sortie du siège du parti.',
    iconName: 'BarChart3',
  },
  {
    templateId: 'evt-remaniement-ministeriel',
    name: 'Remaniement Ministériel',
    subtitle: 'Nouveau Casting Gouvernemental',
    type: 'EVENT',
    cost: 2,
    charisma: 0,
    maxCredibility: 0,
    credibility: 0,
    alignments: ['INSTITUTIONNEL', 'MEDIATIQUE'],
    effect: {
      id: 'eff-evt-remaniement',
      code: 'EVENT_CELLULE_CRISE',
      trigger: 'INSTANT_EVENT',
      name: 'Second Souffle Politique',
      description: 'Soigne +3 Crédibilité à toutes vos Figures sur le terrain ciblé et leur donne +1 Charisme.',
      value: 3,
    },
    flavorText: '« On garde exactement la même politique, mais on change toutes les cravates. »',
    iconName: 'Sparkles',
  },
  {
    templateId: 'evt-motion-censure',
    name: 'Motion de Censure',
    subtitle: 'Vote Solennel à l\'Assemblée',
    type: 'EVENT',
    cost: 4,
    charisma: 0,
    maxCredibility: 0,
    credibility: 0,
    alignments: ['INSTITUTIONNEL', 'MILITANT'],
    effect: {
      id: 'eff-evt-motion-censure',
      code: 'EVENT_MOTION_CENSURE',
      trigger: 'INSTANT_EVENT',
      name: 'Chute du Cabinet',
      description: 'Détruit immédiatement toute Figure adverse sur le terrain ciblé ayant 3 de Crédibilité ou moins.',
      value: 3,
    },
    flavorText: '« La séance est levée ! Le gouvernement est renversé à trois voix près ! »',
    iconName: 'Scale',
  },

  // ==========================================
  // 4. CASSEROLES / PIÈGES (3 Cartes)
  // ==========================================
  {
    templateId: 'trp-micro-ouvert',
    name: 'Le Micro Ouvert',
    subtitle: 'Enregistrement Off Fuite',
    type: 'TRAP',
    cost: 2,
    charisma: 0,
    maxCredibility: 0,
    credibility: 0,
    alignments: ['MEDIATIQUE'],
    effect: {
      id: 'eff-trp-micro-ouvert',
      code: 'TRAP_MICRO_OUVERT',
      trigger: 'ON_TRAP_TRIGGER',
      name: 'Gaffe en Coulisses',
      description: 'Piège face cachée : Quand l\'adversaire pose une Figure sur ce terrain, annule son bonus d\'entrée, lui inflige 3 dégâts de Crédibilité et réduit son Charisme de 1.',
      value: 3,
    },
    flavorText: '« Mais non, le micro est coupé là, je peux dire ce que je pense vraiment des électeurs… »',
    iconName: 'MicOff',
  },
  {
    templateId: 'trp-tweet-2012',
    name: 'Tweet de 2012 Déterré',
    subtitle: 'Archéologie Numérique',
    type: 'TRAP',
    cost: 1,
    charisma: 0,
    maxCredibility: 0,
    credibility: 0,
    alignments: ['MILITANT', 'MEDIATIQUE'],
    effect: {
      id: 'eff-trp-tweet-2012',
      code: 'TRAP_TWEET_2012',
      trigger: 'ON_TRAP_TRIGGER',
      name: 'Archive Compromettante',
      description: 'Piège face cachée : Quand l\'adversaire pose ou équipe une Figure sur ce terrain, détruit tous ses Upgrades et lui inflige 2 dégâts de Crédibilité.',
      value: 2,
    },
    flavorText: 'Internet n’oublie jamais, surtout à 48 heures du premier tour.',
    iconName: 'History',
  },
  {
    templateId: 'trp-retournement-veste',
    name: 'Retournement de Veste',
    subtitle: 'Trahison de Dernière Minute',
    type: 'TRAP',
    cost: 2,
    charisma: 0,
    maxCredibility: 0,
    credibility: 0,
    alignments: ['MEDIATIQUE', 'INSTITUTIONNEL'],
    effect: {
      id: 'eff-trp-retournement-veste',
      code: 'TRAP_RETOURNEMENT_VESTE',
      trigger: 'ON_TRAP_TRIGGER',
      name: 'Transfuge Opportuniste',
      description: 'Piège face cachée : Quand l\'adversaire pose une Figure sur ce terrain, réduit son Charisme de moitié (arrondi à l\'inférieur) et vole +1 Capital Politique à l\'adversaire pour votre prochain tour.',
      value: 1,
    },
    flavorText: '« Mes convictions n’ont pas changé, elles ont simplement rejoint la majorité actuelle. »',
    iconName: 'Zap',
  },
];

let uniqueCardSequence = 1;

export function createCardInstance(template: CardTemplate, owner: 'PLAYER' | 'AI'): Card {
  uniqueCardSequence += 1;
  return {
    ...template,
    id: `${owner.toLowerCase()}-${template.templateId}-${uniqueCardSequence}`,
    owner,
    upgrades: [],
    isFaceDown: template.type === 'TRAP',
  };
}

export const DOUBLED_BASE_TEMPLATE_IDS = new Set<string>([]);

export function buildDeckForOwner(owner: 'PLAYER' | 'AI'): Card[] {
  // Crée un deck complet de 20 cartes uniques issues de CARD_DATABASE
  const templatesToInclude: CardTemplate[] = [...CARD_DATABASE];
  for (const template of CARD_DATABASE) {
    if (DOUBLED_BASE_TEMPLATE_IDS.has(template.templateId)) {
      templatesToInclude.push(template);
    }
  }
  const instances = templatesToInclude.map((template) =>
    createCardInstance(template, owner)
  );
  return shuffleCards(instances);
}

export function shuffleCards<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}
