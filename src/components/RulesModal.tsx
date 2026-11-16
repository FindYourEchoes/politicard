import React from 'react';
import { ROLE_DEFINITIONS, THEME_DETAILS } from '../data/factions';
import { CardRank, DebateTheme } from '../types/duel';
import {
  X,
  Crown,
  Zap,
  Eye,
  Shield,
  TrendingDown,
  Flag,
  AlertOctagon,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const ranks: CardRank[] = [7, 6, 5, 4, 3, 2, 1, 0];
  const themes: DebateTheme[] = ['CLASSIQUE', 'SONDAGE_INVERSE', 'FACE_A_FACE_BRUT', 'PRIME_TIME'];

  const getRankIcon = (rank: CardRank) => {
    switch (rank) {
      case 7:
        return <Crown className="w-3.5 h-3.5 text-amber-400" />;
      case 6:
        return <Zap className="w-3.5 h-3.5 text-purple-400" />;
      case 5:
        return <Eye className="w-3.5 h-3.5 text-blue-400" />;
      case 4:
        return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      case 3:
        return <TrendingDown className="w-3.5 h-3.5 text-orange-400" />;
      case 2:
        return <Flag className="w-3.5 h-3.5 text-rose-400" />;
      case 1:
        return <AlertOctagon className="w-3.5 h-3.5 text-red-500" />;
      case 0:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm select-none animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90dvh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase text-white flex items-center gap-1.5">
              <span className="text-amber-400">Règles & Rôles</span> • Duel TV
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              8 cartes identiques de chaque côté • Premier à 4 points
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Priority Order Banner */}
        <div className="my-2.5 p-2 rounded-xl bg-slate-950 border border-amber-500/30 text-center">
          <p className="text-[10px] font-mono uppercase text-amber-400 font-bold mb-1">
            ⚡ Ordre d'application des pouvoirs
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1 text-[10px] font-bold text-slate-200">
            <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700">5 Spin Doctor</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-700">3 Sondeur</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-700">1 Casserole</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">4 Bouclier</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700">2 Militant</span>
          </div>
        </div>

        {/* Themes Box */}
        <div className="mb-2.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800">
          <p className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1.5">
            📺 Les 4 Thèmes de Débat possibles
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            {themes.map((t) => {
              const info = THEME_DETAILS[t];
              return (
                <div key={t} className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col">
                  <span className="font-bold text-white uppercase">{info.title}</span>
                  <span className="text-[9px] text-slate-400">{info.subtitle}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 8 Cards List */}
        <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
          {ranks.map((rank) => {
            const bp = ROLE_DEFINITIONS[rank];
            return (
              <div
                key={rank}
                className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-black font-mono text-xs text-white shrink-0">
                    {rank}
                  </div>
                  {getRankIcon(rank)}
                  <span className="font-black text-xs text-white uppercase font-mono">
                    {bp.roleBadge}
                  </span>
                </div>
                <span className="text-[10px] text-amber-200 font-semibold text-right shrink-0">
                  {bp.shortPower}
                </span>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="pt-2.5 border-t border-slate-800 mt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
