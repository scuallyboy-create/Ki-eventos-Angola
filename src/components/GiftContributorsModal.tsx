import React from 'react';
import { GiftOption, GiftContribution } from '../types';
import { X, Heart, Sparkles, MessageCircleHeart, PlusCircle } from 'lucide-react';

interface GiftContributorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gift: GiftOption;
  celebrants: string;
  onOpenContributeModal: () => void;
}

export const GiftContributorsModal: React.FC<GiftContributorsModalProps> = ({
  isOpen,
  onClose,
  gift,
  celebrants,
  onOpenContributeModal,
}) => {
  if (!isOpen) return null;

  const currency = gift.currency || 'Kz';
  const contributions = gift.contributions || [];
  const target = gift.targetAmount || 350000;
  const current = gift.currentAmount || 0;
  const remaining = Math.max(0, target - current);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#FAF9F5] rounded-3xl border border-stone-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-white px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
              <MessageCircleHeart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-normal text-stone-900 leading-tight">
                Mural de Contribuições & Carinho
              </h3>
              <p className="text-[11px] text-stone-500">
                {gift.title} · {celebrants}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress header */}
        <div className="bg-[#FAF8F2] px-6 py-3.5 border-b border-stone-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-stone-500 block text-[10px] uppercase tracking-wider">Arrecadado:</span>
            <span className="font-bold text-stone-900 font-mono">
              {new Intl.NumberFormat('pt-PT').format(current)} {currency}
            </span>
          </div>
          <div className="text-right">
            <span className="text-stone-500 block text-[10px] uppercase tracking-wider">Falta apenas:</span>
            <span className="font-bold text-amber-800 font-mono">
              {new Intl.NumberFormat('pt-PT').format(remaining)} {currency}
            </span>
          </div>
        </div>

        {/* List of all contributions */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1 text-stone-800">
          {contributions.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs">
              Seja o primeiro a contribuir com este presente e deixe a sua mensagem!
            </div>
          ) : (
            contributions.map((cnt: GiftContribution, idx: number) => (
              <div 
                key={cnt.id || idx}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-2 hover:border-amber-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {cnt.contributorAvatar ? (
                      <img 
                        src={cnt.contributorAvatar} 
                        alt={cnt.contributorName} 
                        className="w-9 h-9 rounded-full object-cover border border-stone-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                        {cnt.contributorName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-semibold text-stone-900 leading-tight">
                        {cnt.contributorName}
                      </h4>
                      <span className="text-[10px] text-stone-400">
                        {cnt.createdAt ? new Date(cnt.createdAt).toLocaleDateString('pt-PT') : 'Recentemente'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    +{new Intl.NumberFormat('pt-PT').format(cnt.amount)} {currency}
                  </span>
                </div>

                {cnt.message && (
                  <p className="text-xs text-stone-700 italic font-serif leading-relaxed pl-1 pt-1 border-t border-stone-100">
                    "{cnt.message}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Bottom CTA to encourage contribution */}
        <div className="bg-white px-6 py-4 border-t border-stone-200 flex items-center justify-between gap-3">
          <p className="text-[11px] text-stone-500">
            Junte-se a quem já contribuiu e faça parte desta conquista!
          </p>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenContributeModal();
            }}
            className="py-2.5 px-4 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>Contribuir Também</span>
          </button>
        </div>
      </div>
    </div>
  );
};
