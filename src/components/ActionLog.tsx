import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Radio, X } from 'lucide-react';
import { ActionLogEntry } from '../types/game';

interface ActionLogProps {
  logs: ActionLogEntry[];
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_BADGES: Record<
  ActionLogEntry['category'],
  { label: string; style: string }
> = {
  PLAY: { label: 'DÉPLOIEMENT', style: 'bg-royal text-white' },
  COMBAT: { label: 'CLASH EN DIRECT', style: 'bg-crimson text-white' },
  TRAP: { label: 'CASSEROLE', style: 'bg-ink text-paper' },
  OPINION: { label: 'SONDAGE', style: 'bg-gold text-white' },
  PRESS: { label: 'FLASH PRESSE', style: 'bg-paper-dark text-ink border border-ink' },
  VICTORY: { label: 'ÉDITION SPÉCIALE', style: 'bg-crimson text-white' },
};

export const ActionLog: React.FC<ActionLogProps> = ({
  logs,
  isOpen,
  onClose,
}) => {
  // Permet de fermer le tiroir avec la touche Échap
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Fond assombri cliquable pour refermer le tiroir */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/50 backdrop-blur-[1px] cursor-pointer"
            aria-label="Fermer le tiroir des dépêches"
          />

          {/* Tiroir latéral coulissant depuis la droite */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-paper-light border-l-4 border-ink shadow-press-lg flex flex-col z-10"
          >
            {/* En-tête Téléscripteur AFP */}
            <div className="bg-ink text-paper px-4 py-3 flex items-center justify-between border-b-2 border-ink">
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-crimson animate-pulse" />
                <div>
                  <h2 className="font-mono font-bold text-sm uppercase tracking-wider leading-none">
                    Fil Dépêches AFP — Direct
                  </h2>
                  <p className="text-[10px] font-mono text-paper/70 mt-0.5">
                    Historique complet de la campagne ({logs.length} dépêches)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-paper/60" />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fermer les dépêches"
                  className="p-1 bg-crimson text-white border border-paper hover:bg-crimson-dark transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Liste déroulante des dépêches */}
            <div className="p-3.5 overflow-y-auto space-y-2.5 flex-1 font-mono">
              {logs.map((entry) => {
                const badge = CATEGORY_BADGES[entry.category];
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-paper border-2 border-ink/60 shadow-press-sm text-left"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 uppercase ${badge.style}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-ink-muted font-bold">
                        Tour {entry.turn} • {entry.timestamp}
                      </span>
                    </div>
                    <div className="font-serif font-extrabold text-sm text-ink leading-snug">
                      {entry.headline}
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed mt-1 font-sans">
                      {entry.details}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
