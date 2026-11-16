import React from 'react';
import { CardDefinition } from '../types/duel';
import { DuelCard } from './DuelCard';
import { X, Eye } from 'lucide-react';

interface SpyModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiHand: CardDefinition[];
}

export const SpyModal: React.FC<SpyModalProps> = ({ isOpen, onClose, aiHand }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm select-none animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-indigo-500/50 rounded-2xl shadow-2xl p-4 sm:p-5 text-slate-100 flex flex-col max-h-[85dvh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Eye className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black uppercase text-white flex items-center gap-1.5">
                ESPIONNAGE DE COULISSES ACTIF
              </h2>
              <p className="text-[11px] text-indigo-300 font-mono">
                Cartes encore en possession de l'adversaire ({aiHand.length})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative text */}
        <p className="text-xs text-slate-400 my-2">
          Grâce à votre Gaffe du Stagiaire (Rang 0), vous avez infiltré le camp adverse. Voici les cartes que l'IA peut encore abattre :
        </p>

        {/* Revealed Cards Grid */}
        <div className="flex-1 overflow-y-auto py-2 grid grid-cols-2 sm:grid-cols-4 gap-2 justify-items-center">
          {aiHand.map((card) => (
            <div key={card.rank} className="w-full flex justify-center">
              <DuelCard card={card} size="sm" isPlayable={false} showDetails={true} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-indigo-600/20"
          >
            Retourner au Débat
          </button>
        </div>
      </div>
    </div>
  );
};
