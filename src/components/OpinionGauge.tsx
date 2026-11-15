import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Megaphone, Scale, TrendingUp } from 'lucide-react';
import { OPINION_MAX, OPINION_MIN } from '../engine/gameEngine';

interface OpinionGaugeProps {
  opinion: number;
  stakesMultiplier: number;
  pressCalledBy: 'NONE' | 'PLAYER' | 'AI';
}

export const OpinionGauge: React.FC<OpinionGaugeProps> = ({
  opinion,
  stakesMultiplier,
  pressCalledBy,
}) => {
  // Convertit [-20, +20] en pourcentage [0%, 100%] (0 = 50%)
  const clamped = Math.max(OPINION_MIN, Math.min(OPINION_MAX, opinion));
  const percentage = ((clamped - OPINION_MIN) / (OPINION_MAX - OPINION_MIN)) * 100;

  const isPlayerLeading = opinion > 0;
  const isAILeading = opinion < 0;

  return (
    <div className="flex items-center gap-2 w-full max-w-xl select-none">
      {/* Borne IA (-20) */}
      <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-extrabold uppercase text-crimson shrink-0">
        <Flame className="w-3.5 h-3.5 fill-crimson/20" />
        <span>IA {OPINION_MIN}</span>
      </div>

      {/* Barre de Tir à la Corde (-20 à +20) intégrée dans le Header */}
      <div
        className="relative h-6 flex-1 bg-paper-dark border-2 border-ink overflow-hidden shadow-press-sm"
        title={`Jauge d'Opinion Publique (${OPINION_MIN} à +${OPINION_MAX}). Atteignez +${OPINION_MAX} pour une Victoire par Raz-de-Marée !`}
      >
        {/* Fond bicolore */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 h-full bg-gradient-to-r from-crimson/85 via-crimson/35 to-paper-dark border-r border-ink/40" />
          <div className="w-1/2 h-full bg-gradient-to-l from-royal/85 via-royal/35 to-paper-dark" />
        </div>

        {/* Repères et score central */}
        <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none text-[10px] font-mono font-bold text-ink/80">
          <span className="sm:hidden text-crimson font-black">{OPINION_MIN}</span>
          <span className="hidden sm:inline opacity-75">-10</span>
          <motion.span
            key={opinion}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`px-1.5 py-0.2 border border-ink font-mono font-black text-[10px] md:text-xs shadow-press-sm z-20 ${
              isPlayerLeading
                ? 'bg-royal text-white'
                : isAILeading
                ? 'bg-crimson text-white'
                : 'bg-ink text-paper'
            }`}
          >
            <Scale className="w-2.5 h-2.5 inline mr-1 -mt-0.5" />
            {opinion > 0 ? `+${opinion}` : opinion}
          </motion.span>
          <span className="hidden sm:inline opacity-75">+10</span>
          <span className="sm:hidden text-royal font-black">+{OPINION_MAX}</span>
        </div>

        {/* Curseur oscillant animé */}
        <motion.div
          className="absolute top-0 bottom-0 w-3 -ml-1.5 z-10 flex flex-col items-center justify-center pointer-events-none"
          animate={{ left: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        >
          <div className="w-2.5 h-full bg-gold border-2 border-ink shadow-press-sm flex items-center justify-center">
            <div className="w-0.5 h-2.5 bg-ink" />
          </div>
        </motion.div>
      </div>

      {/* Borne Joueur (+20) */}
      <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-extrabold uppercase text-royal shrink-0">
        <span>+{OPINION_MAX} VOUS</span>
        <TrendingUp className="w-3.5 h-3.5" />
      </div>

      {stakesMultiplier > 1 && (
        <motion.div
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1 bg-gold text-white px-1.5 py-0.5 border border-ink text-[10px] font-mono font-black uppercase shadow-press-sm shrink-0"
          title={`Conférence de Presse convoquée par ${
            pressCalledBy === 'PLAYER' ? 'Vous' : "l'Opposition"
          } : mise finale x${stakesMultiplier}`}
        >
          <Megaphone className="w-3 h-3" />
          <span>x{stakesMultiplier}</span>
        </motion.div>
      )}
    </div>
  );
};
