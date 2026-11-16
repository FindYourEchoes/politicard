import { FactionId, FactionInfo, CardDefinition, CardRank } from '../types/duel';

export const FACTIONS: Record<FactionId, FactionInfo> = {
  revolution_permanente: {
    id: 'revolution_permanente',
    name: 'Révolution Permanente',
    shortName: 'Rév. Permanente',
    ideology: 'Extrême Gauche',
    color: '#DC2626',
    accentColor: '#991B1B',
    bgGradient: 'from-red-900 via-rose-900 to-red-950',
    cardBg: 'bg-red-950',
    borderColor: 'border-red-600',
    textColor: 'text-red-500',
    badgeBg: 'bg-red-600',
    iconName: 'Megaphone',
    slogan: 'Grand Soir garanti dès demain matin, ou grève générale illimitée !',
    description: 'Abolition immédiate du grand capital, réquisition des chaînes d’info et barricades en carton recyclé.',
    candidateName: 'Nathalie Rouget'
  },
  union_populaire: {
    id: 'union_populaire',
    name: 'Union Populaire & Insoumise',
    shortName: 'Union Populaire',
    ideology: 'Gauche Radicale',
    color: '#E11D48',
    accentColor: '#0284C7',
    bgGradient: 'from-rose-900 via-sky-950 to-indigo-950',
    cardBg: 'bg-rose-950',
    borderColor: 'border-rose-500',
    textColor: 'text-rose-400',
    badgeBg: 'bg-rose-600',
    iconName: 'Zap',
    slogan: 'La République, c’est nous ! Et la 6e République aussi !',
    description: 'Bifurcation citoyenne, hologrammes en meeting et hausse d’impôt sur les super-profits imaginaires.',
    candidateName: 'Jean-Luc Mélenchonix'
  },
  social_democratie: {
    id: 'social_democratie',
    name: 'Social-Démocratie Historique',
    shortName: 'Social-Démocratie',
    ideology: 'Gauche Modérée',
    color: '#F43F5E',
    accentColor: '#BE123C',
    bgGradient: 'from-pink-900 via-rose-950 to-stone-900',
    cardBg: 'bg-pink-950',
    borderColor: 'border-pink-500',
    textColor: 'text-pink-400',
    badgeBg: 'bg-pink-600',
    iconName: 'Flower2',
    slogan: 'Un compromis historique entre la synthèse du consensus et le compromis.',
    description: 'Le sens du compromis modéré, 40 congrès internes par an et l’éternel fantôme de mai 1981.',
    candidateName: 'Olivier Fauredent'
  },
  bloc_central: {
    id: 'bloc_central',
    name: 'Bloc Central & Technocrate',
    shortName: 'Bloc Central',
    ideology: 'Centre / Majorité',
    color: '#F59E0B',
    accentColor: '#2563EB',
    bgGradient: 'from-amber-900 via-blue-950 to-slate-900',
    cardBg: 'bg-amber-950',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-400',
    badgeBg: 'bg-amber-600',
    iconName: 'Sparkles',
    slogan: 'En même temps disruptif, régalien et profondément pragmatique.',
    description: 'Gouvernance agile, ordonnances pédagogiques et 42 rapports McKinsey pour décider du menu de midi.',
    candidateName: 'Emmanuel Jupiter'
  },
  droite_republicaine: {
    id: 'droite_republicaine',
    name: 'Droite Républicaine',
    shortName: 'Droite Républicaine',
    ideology: 'Droite Classique',
    color: '#2563EB',
    accentColor: '#1E3A8A',
    bgGradient: 'from-blue-900 via-indigo-950 to-slate-950',
    cardBg: 'bg-blue-950',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    badgeBg: 'bg-blue-600',
    iconName: 'Landmark',
    slogan: 'L’ordre, le travail, le mérite... et les costumes sur mesure.',
    description: 'Baisse des dépenses publiques (sauf chez nous), gaullisme patrimonial et dîners du Siècle.',
    candidateName: 'Laurent Wauquillard'
  },
  union_nationale: {
    id: 'union_nationale',
    name: 'Union Nationale & Souverainiste',
    shortName: 'Union Nationale',
    ideology: 'Droite Nationale',
    color: '#0284C7',
    accentColor: '#1E293B',
    bgGradient: 'from-sky-950 via-slate-900 to-slate-950',
    cardBg: 'bg-slate-900',
    borderColor: 'border-sky-500',
    textColor: 'text-sky-400',
    badgeBg: 'bg-sky-600',
    iconName: 'ShieldAlert',
    slogan: 'Les frontières d’abord, le bon sens paysan et le JT de 13h !',
    description: 'Protectionnisme intégral, dénonciation de Bruxelles et selfies avec des éleveurs de charolaises.',
    candidateName: 'Marine La Penne'
  }
};

export const ROLE_BLUEPRINTS: Record<CardRank, {
  roleTitle: string;
  shortPower: string;
  detailedPower: string;
}> = {
  7: {
    roleTitle: 'Le / La Candidate Présidentiel(le)',
    shortPower: 'Immunité totale (force et pouvoir protégés)',
    detailedPower: 'Immunité totale : son pouvoir et sa force ne peuvent être annulés par le Spin Doctor adverse.'
  },
  6: {
    roleTitle: 'Le / La Lieutenante (Bras Droit)',
    shortPower: 'Victoire : +2 en force pour votre prochain round',
    detailedPower: 'Si vous gagnez ce round, votre prochaine carte jouée bénéficiera de +2 en force brute au tour suivant.'
  },
  5: {
    roleTitle: 'Le Spin Doctor (Conseiller de l’Ombre)',
    shortPower: 'Annule le pouvoir spécial de la carte adverse',
    detailedPower: 'Annule complètement le pouvoir spécial adverse sur ce round (sauf contre le Candidat 7 immunisé).'
  },
  4: {
    roleTitle: 'L’Attaché(e) de Presse',
    shortPower: 'Bouclier : défaite annulée (égalité forcée)',
    detailedPower: 'Bouclier médiatique : si vous perdez ce round, l’adversaire ne marque rien. Égalité forcée, le point va au pot !'
  },
  3: {
    roleTitle: 'Le Sondeur / L’Influenceur',
    shortPower: 'Inversion des courbes (la force faible l’emporte)',
    detailedPower: 'Inversion des courbes : sur ce round, c’est la carte avec la force la PLUS FAIBLE qui remporte le duel !'
  },
  2: {
    roleTitle: 'Le / La Militante de Terrain',
    shortPower: 'Victoire automatique en cas d’égalité',
    detailedPower: 'Mobilisation : si les forces sont à égalité sur ce round, vous remportez automatiquement la manche.'
  },
  1: {
    roleTitle: 'La Casserole / Le Dossier Noir',
    shortPower: 'Élimine le 7 ou le 6 adverse (+2 pts d’Opinion !)',
    detailedPower: 'Scandale d’État : si l’adversaire joue son rang 7 ou 6, vous l’éliminez net et encaissez +2 pts d’Opinion d’un coup !'
  },
  0: {
    roleTitle: 'La Gaffe en Direct / Le Stagiaire',
    shortPower: 'Round perdu, mais espionne toute la main adverse',
    detailedPower: 'Vous perdez ce round d’office, mais vous infiltrez les coulisses : révèle toutes les cartes restantes de l’IA !'
  }
};

export const FACTION_CARD_FLAVORS: Record<FactionId, Record<CardRank, { name: string; quote: string }>> = {
  revolution_permanente: {
    7: {
      name: 'Nathalie la Porte-Parole',
      quote: '« Camarades, nous ne débattrons pas avec le grand patronat : nous prendrons les clés ! »'
    },
    6: {
      name: 'Le Délégué CGT des Barricades',
      quote: '« La raffinerie est bloquée, le périph aussi. On maintient la cadence ! »'
    },
    5: {
      name: 'Le Théoricien de l’Agit-Prop',
      quote: '« La dialectique matérialiste neutralise tout discours bourgeois contradictoire. »'
    },
    4: {
      name: 'La Responsable des Tracts',
      quote: '« Même si l’on perd l’antenne, nos 50 000 tracts sont déjà dans les gares. Zéro point pour eux ! »'
    },
    3: {
      name: 'Le Blogueur Anti-Système',
      quote: '« Moins on nous invite dans les médias, plus notre légitimité révolutionnaire explose ! »'
    },
    2: {
      name: 'Le Colleur d’Affiches Nocturne',
      quote: '« De la colle à papier peint plein les doigts, 4 heures de colle par nuit : on ne lâche rien. »'
    },
    1: {
      name: 'L’Exclusion pour Déviationnisme',
      quote: '« Camarade, nous avons retrouvé un compte épargne à ton nom. Auto-critique immédiate ! »'
    },
    0: {
      name: 'Le Couac sur BFM TV',
      quote: '« J’ai confondu la dette publique avec le budget cantine... mais la révolution est en marche ! »'
    }
  },
  union_populaire: {
    7: {
      name: 'Le Tribun Suprême',
      quote: '« Qu’ils s’en aillent tous ! La République, le souffle civique, c’est moi ! »'
    },
    6: {
      name: 'La Députée de Piquet',
      quote: '« On a déposé 4 000 sous-amendements cette nuit. Le train des réformes est stoppé net ! »'
    },
    5: {
      name: 'Le Stratège des Mèmes TikTok',
      quote: '« Une vidéo de 15 secondes avec un montage trap, et l’argument adverse est annihilé. »'
    },
    4: {
      name: 'L’Attaché aux Éléments de Langage',
      quote: '« Ce n’est pas une défaite, c’est une manœuvre de résistance républicaine ! Circulez ! »'
    },
    3: {
      name: 'L’Institut Populaire des Sondages',
      quote: '« Les sondages officiels mentent. Dans notre sondage interne sur Telegram, nous sommes à 94 %. »'
    },
    2: {
      name: 'La Caravane des Quartiers',
      quote: '« On fait du porte-à-porte jusqu’au 18e étage sans ascenseur. C’est ça, le peuple en marche. »'
    },
    1: {
      name: 'L’Appartement Social Non Déclaré',
      quote: '« Une omission administrative de 140 m² qui fait s’effondrer le grand favori du scrutin ! »'
    },
    0: {
      name: 'Le Tweet Furieux de 3h du Matin',
      quote: '« Des majuscules, de la ponctuation agressive... Oups, le stagiaire a cliqué sur publier. »'
    }
  },
  social_democratie: {
    7: {
      name: 'Le Premier Secrétaire',
      quote: '« La synthèse de la motion B sur l’amendement C permet un rassemblement loyal et mesuré. »'
    },
    6: {
      name: 'L’Ancien Premier Ministre',
      quote: '« L’expérience de l’État ne s’improvise pas. Je connais chaque couloir de Matignon. »'
    },
    5: {
      name: 'Le Rédacteur de Synthèses Floues',
      quote: '« En rendant la conclusion incompréhensible pour les deux camps, j’annule toute contestation. »'
    },
    4: {
      name: 'L’Éditorialiste Complaisant',
      quote: '« Certes les chiffres sont mauvais, mais la dignité du port de costume reste intacte. Match nul. »'
    },
    3: {
      name: 'Le Politologue de France Inter',
      quote: '« Quand les courbes s’inversent, c’est le candidat le plus tiède qui recueille l’adhésion secrète. »'
    },
    2: {
      name: 'Le Maire Rural Indéboulonnable',
      quote: '« 35 ans de mandat, j’ai inauguré le rond-point et le boulodrome. En cas d’égalité, je passe. »'
    },
    1: {
      name: 'Le Compte Secret à Genève',
      quote: '« Les yeux dans les yeux, je vous dis que ce compte n’existait pas... jusqu’à ce matin. »'
    },
    0: {
      name: 'L’Oubli du Nom du Candidat',
      quote: '« Je soutiens chaleureusement notre champion... dont le nom m’échappe pour le moment. »'
    }
  },
  bloc_central: {
    7: {
      name: 'Le Président Jupiter',
      quote: '« Je traverse la rue, je disrupte le débat et je transcende les vieux clivages du monde d’avant. »'
    },
    6: {
      name: 'Le Ministre de l’Attractivité',
      quote: '« Un sommet Choose France avec buffet bio : le prochain tour démarre avec +2 de croissance ! »'
    },
    5: {
      name: 'Le Senior Partner McKinsey',
      quote: '« Nous avons benchmarqué les argumentaires : la slide 42 débranche toute offensive adverse. »'
    },
    4: {
      name: 'La Porte-Parole du Gouvernement',
      quote: '« Ce n’est pas un échec, c’est que les Français n’étaient pas assez mûrs pour la pédagogie. Zéro point ! »'
    },
    3: {
      name: 'Le Data Scientist de l’INSEE',
      quote: '« Selon nos modèles bayésiens, plus un chiffre est faible, plus la dynamique d’innovation est forte ! »'
    },
    2: {
      name: 'Le Marcheur de la Première Heure',
      quote: '« Baskets blanches, badge tech et enthousiasme managérial. On gagne toujours les balles au centre. »'
    },
    1: {
      name: 'Le Rétro-Commissionnement BFM',
      quote: '« Un montage de cabinets-conseils à 1,8 milliard d’euros. Le patron vient de démissionner en direct. »'
    },
    0: {
      name: 'La Petite Phrase sur les Gares',
      quote: '« Il y a ceux qui réussissent et ceux qui ne sont rien... Oups, le micro était resté ouvert. »'
    }
  },
  droite_republicaine: {
    7: {
      name: 'Le Baron des Hauts-de-Seine',
      quote: '« La valeur travail, le sens de l’effort et le respect absolu de la parole de nos anciens. »'
    },
    6: {
      name: 'Le Directeur de Campagne Gaulliste',
      quote: '« Une poignée de main virile sur le marché de Neuilly, et notre momentum est relancé ! »'
    },
    5: {
      name: 'Le Communicant du 16e Arrondissement',
      quote: '« Un coup de fil au rédacteur en chef de Figaro Mag et le dossier adverse part à la poubelle. »'
    },
    4: {
      name: 'La Plume des Valeurs Bourgeoises',
      quote: '« Le tribunal de l’opinion peut bien siffler, notre respectabilité institutionnelle étouffe l’affaire. »'
    },
    3: {
      name: 'Le Chroniqueur Économique Libéral',
      quote: '« Moins l’État intervient, mieux se porte le pays ! Moins c’est gros, plus c’est efficace ! »'
    },
    2: {
      name: 'Le Trésorier Notaire de Province',
      quote: '« Les cotisations sont à jour depuis 1974. En cas de ballottage, la tradition l’emporte toujours. »'
    },
    1: {
      name: 'L’Emploi Fictif de l’Épouse & Costumes',
      quote: '« Deux costumes offerts par un ami mécène et une assistante parlementaire invisible. Rideau ! »'
    },
    0: {
      name: 'Le Pain au Chocolat à 10 Centimes',
      quote: '« Je ne prends pas le métro, mais je sais qu’une baguette coûte approximativement 8 sous. »'
    }
  },
  union_nationale: {
    7: {
      name: 'La Présidente Patriote',
      quote: '« Au nom du peuple français et des terroirs oubliés, nous allons rendre la France aux Français ! »'
    },
    6: {
      name: 'Le Numéro Deux de Plateau',
      quote: '« Cravate impeccable, sourire goguenard : l’offensive médiatique du prochain tour est amorcée ! »'
    },
    5: {
      name: 'Le Polémiste Vedette de CNews',
      quote: '« En 30 secondes d’indignation sur le plateau du soir, toute l’argumentation bien-pensante est pulvérisée. »'
    },
    4: {
      name: 'Le Rédacteur du Mensuel Souverainiste',
      quote: '« Qu’importe le vote des juges parisiens ! Le verdict populaire est gelé : aucun point concédé. »'
    },
    3: {
      name: 'L’Influenceur Réinformation',
      quote: '« Les instituts officiels sont à la solde des mondialistes ! Les derniers seront les premiers ! »'
    },
    2: {
      name: 'Le Gardien du Terroir et Chasseurs',
      quote: '« Présent à chaque foire au boudin, on connaît tous les maires de canton. On ne lâche pas un pouce. »'
    },
    1: {
      name: 'Le Prêt Russe Non Remboursé',
      quote: '« Un chèque en roubles signé à l’ambassade qui refait surface au JT de 20 heures... Catastrophe ! »'
    },
    0: {
      name: 'La Mauvaise Fiche sur le SMIC et l’Écu',
      quote: '« Attendez, je confonds le franc, l’écu et les cotisations... Où sont passées mes notes jaunes ? »'
    }
  }
};

/**
 * Generate full 8 cards for a given faction
 */
export function generateFactionDeck(factionId: FactionId): CardDefinition[] {
  const ranks: CardRank[] = [7, 6, 5, 4, 3, 2, 1, 0];
  const flavor = FACTION_CARD_FLAVORS[factionId];

  return ranks.map((rank) => {
    const blueprint = ROLE_BLUEPRINTS[rank];
    const itemFlavor = flavor[rank];

    return {
      rank,
      baseForce: rank,
      name: itemFlavor.name,
      roleTitle: blueprint.roleTitle,
      shortPower: blueprint.shortPower,
      detailedPower: blueprint.detailedPower,
      quote: itemFlavor.quote,
      factionId
    };
  });
}
