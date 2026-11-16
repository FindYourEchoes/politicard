import React from 'react';
import { ROLE_BLUEPRINTS } from '../data/factions';
import { CardRank } from '../types/duel';
import {
  X,
  Shield,
  Crown,
  Zap,
  Eye,
  TrendingDown,
  Flag,
  AlertOctagon,
  HelpCircle,
  Flame,
  ArrowRight
} from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const ranks: CardRank[] = [7, 6, 5, 4, 3, 2, 1, 0];

  const getRankIcon = (rank: CardRank) => {
    switch (rank) {
      case 7:
        return <Crown className="w-4 h-4 text-amber-400" />;
      case 6:
        return <Zap className="w-4 h-4 text-purple-400" />;
      case 5:
        return <Eye className="w-4 h-4 text-blue-400" />;
      case 4:
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 3:
        return <TrendingDown className="w-4 h-4 text-orange-400" />;
      case 2:
        return <Flag className="w-4 h-4 text-rose-400" />;
      case 1:
        return <AlertOctagon className="w-4 h-4 text-red-500" />;
      case 0:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm select-none animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90dvh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase text-white flex items-center gap-2">
              <span className="text-amber-400">Règles du Débat</span> • 8 Rôles Miroirs
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Aucun hasard de pioche : les deux joueurs ont les 8 mêmes cartes !
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Priority Order Banner */}
        <div className="my-3 p-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-center">
          <p className="text-[10px] sm:text-xs font-mono uppercase text-amber-400 font-bold mb-1">
            ⚡ Ordre d'application des pouvoirs
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-bold text-slate-200">
            <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700">5 Spin Doctor</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-700">3 Sondeur</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-700">1 Casserole</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">4 Attaché de Presse</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700">2 Militant</span>
          </div>
        </div>

        {/* Pot & Goal rules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <h4 className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
              <Flame className="w-4 h-4 text-amber-400" />
              Le Pot Médiatique
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Chaque round met <strong>1 pt</strong> en jeu. En cas d'égalité (ou grâce au bouclier de l'Attaché de Presse), le point s'accumule dans le pot pour le tour suivant !
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
              🏆 Condition de Victoire
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Le premier joueur à cumuler <strong>4 points d'Opinion</strong> remporte immédiatement l'élection (ou celui en tête après les 8 rounds).
            </p>
          </div>
        </div>

        {/* 8 Cards List */}
        <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
          {ranks.map((rank) => {
            const bp = ROLE_BLUEPRINTS[rank];
            return (
              <div
                key={rank}
                className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-black font-mono text-sm text-white shrink-0 mt-0.5">
                  {rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getRankIcon(rank)}
                    <h5 className="font-bold text-xs sm:text-sm text-white truncate">
                      {bp.roleTitle}
                    </h5>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    {bp.detailedPower}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="pt-3 border-t border-slate-800 mt-3 text-center">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Fermer et Reprendre le Débat
          </button>
        </div>
      </div>
    </div>
  );
};
