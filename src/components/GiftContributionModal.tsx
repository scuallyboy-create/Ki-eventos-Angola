import React, { useState } from 'react';
import { GiftOption, GiftContribution } from '../types';
import { 
  X, 
  Check, 
  Copy, 
  Sparkles, 
  Heart, 
  Smartphone, 
  Building2, 
  CreditCard, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface GiftContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  gift: GiftOption;
  celebrants: string;
  onContribute: (contribution: GiftContribution, amountToAdd: number) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
];

export const GiftContributionModal: React.FC<GiftContributionModalProps> = ({
  isOpen,
  onClose,
  gift,
  celebrants,
  onContribute,
}) => {
  const currency = gift.currency || 'Kz';
  const target = gift.targetAmount || 350000;
  const current = gift.currentAmount || 0;
  const remaining = Math.max(0, target - current);

  const [contributorName, setContributorName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [amount, setAmount] = useState<number>(25000);
  const [customAmountStr, setCustomAmountStr] = useState('25000');
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'express' | 'iban' | 'unitel_money' | 'mbway'>('express');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSelectPresetAmount = (val: number) => {
    setAmount(val);
    setCustomAmountStr(val.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = parseInt(raw, 10) || 0;
    setCustomAmountStr(raw);
    setAmount(num);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributorName.trim() || amount <= 0) return;
    setStep('payment');
  };

  const handleConfirmPayment = () => {
    const contribution: GiftContribution = {
      id: 'cnt_' + Date.now(),
      contributorName: contributorName.trim(),
      contributorAvatar: selectedAvatar,
      amount: amount,
      message: message.trim() || 'Muitas felicidades para os noivos nesta nova caminhada!',
      paymentMethod: paymentMethod === 'unitel_money' ? 'express' : paymentMethod,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onContribute(contribution, amount);
    setStep('success');
  };

  const formattedAmount = new Intl.NumberFormat('pt-PT').format(amount);
  const formattedRemaining = new Intl.NumberFormat('pt-PT').format(remaining);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#FAF9F5] rounded-3xl border border-stone-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-white px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-amber-700 text-amber-700" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-normal text-stone-900 leading-tight">
                {gift.title}
              </h3>
              <p className="text-[11px] text-stone-500">
                Presente para {celebrants}
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

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-stone-800">

          {/* STEP 1: FORM */}
          {step === 'form' && (
            <form onSubmit={handleProceedToPayment} className="space-y-5">
              {/* Progress Summary Card */}
              <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Valor Restante a Descontar:</span>
                  <span className="font-bold text-amber-900 font-mono text-sm">
                    {formattedRemaining} {currency}
                  </span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((current / target) * 100))}%` }}
                  />
                </div>
                <p className="text-[11px] text-stone-500 italic text-center">
                  Cada valor inserido é descontado em tempo real no objetivo do presente.
                </p>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-2">
                  Quanto deseja contribuir? ({currency})
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2.5">
                  {[10000, 25000, 50000, 100000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSelectPresetAmount(val)}
                      className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        amount === val
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {new Intl.NumberFormat('pt-PT').format(val)} {currency}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customAmountStr}
                    onChange={handleCustomAmountChange}
                    placeholder="Outro valor personalizado..."
                    className="w-full pl-3 pr-12 py-2.5 text-sm font-mono font-semibold bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-semibold text-stone-500">
                    {currency}
                  </span>
                </div>
              </div>

              {/* Contributor Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  O Seu Nome / Nome da Família
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos & Helena Silva"
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              {/* Contributor Avatar Choice */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Escolha o seu Avatar para a Miniatura:
                </label>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`relative w-11 h-11 rounded-full overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        selectedAvatar === av
                          ? 'border-amber-700 ring-2 ring-amber-300/80 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Message of affection */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Mensagem Carinhosa para os Noivos (Aparecerá no mural e miniatura)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Muitas felicidades para a vossa linda lua de mel! Aproveitem muito cada segundo..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={amount <= 0 || !contributorName.trim()}
                className="w-full py-3.5 px-4 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <span>Continuar para Meios de Pagamento ({formattedAmount} {currency})</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD SELECTION & INSTRUCTIONS */}
          {step === 'payment' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-amber-800 font-semibold">
                  Passo 2 · Escolha o Meio de Pagamento Local
                </span>
                <h4 className="font-serif text-xl text-stone-900">
                  Contribuição de {formattedAmount} {currency}
                </h4>
                <p className="text-xs text-stone-500">
                  Por {contributorName}
                </p>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('express')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'express'
                      ? 'border-amber-700 bg-amber-50/60 text-amber-900 font-semibold shadow-2xs'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-amber-700" />
                  <span className="text-xs">MCX Express</span>
                  <span className="text-[9px] text-stone-400">Multicaixa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('iban')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'iban'
                      ? 'border-amber-700 bg-amber-50/60 text-amber-900 font-semibold shadow-2xs'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-stone-700" />
                  <span className="text-xs">IBAN / Banco</span>
                  <span className="text-[9px] text-stone-400">BAI / BFA / BIC</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('unitel_money')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'unitel_money'
                      ? 'border-amber-700 bg-amber-50/60 text-amber-900 font-semibold shadow-2xs'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs">Unitel Money</span>
                  <span className="text-[9px] text-stone-400">Telemóvel</span>
                </button>
              </div>

              {/* METHOD DETAILS & INSTRUCTIONS */}
              {paymentMethod === 'express' && (
                <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-amber-600" />
                      Multicaixa Express (MCX)
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                      Instantâneo
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-500 block mb-0.5">
                      Número de Telemóvel Associado ao MCX Express:
                    </label>
                    <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="font-mono text-xs font-bold text-stone-900">
                        +244 923 888 777
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy('+244923888777', 'mcx')}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'mcx' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'mcx' ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    1. Abra a sua aplicação <strong>Multicaixa Express</strong> no telemóvel.<br />
                    2. Selecione <strong>Transferir</strong> para o número indicado.<br />
                    3. Insira o valor de <strong>{formattedAmount} {currency}</strong>.<br />
                    4. Clique em "Concluir & Registar Contribuição" abaixo.
                  </p>
                </div>
              )}

              {paymentMethod === 'iban' && (
                <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-stone-700" />
                      Transferência Bancária (IBAN)
                    </span>
                    <span className="text-[10px] text-stone-500">BFA / BAI</span>
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-500 block mb-0.5">
                      IBAN Nacional (Angola):
                    </label>
                    <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="font-mono text-[11px] font-bold text-stone-900 break-all">
                        AO06 0040 0000 1234 5678 9012 3
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy('AO06004000001234567890123', 'iban')}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                      >
                        {copiedKey === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'iban' ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-600">
                    <span>Titular da Conta: <strong>João Fernandes & Alice Mendes</strong></span>
                  </div>
                </div>
              )}

              {paymentMethod === 'unitel_money' && (
                <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      Unitel Money
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                      Direto
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-500 block mb-0.5">
                      Número Unitel Money:
                    </label>
                    <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <span className="font-mono text-xs font-bold text-stone-900">
                        +244 923 888 777
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy('+244923888777', 'unitel')}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'unitel' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'unitel' ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] text-stone-500 bg-stone-100/70 p-3 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>O valor será descontado diretamente do presente e ficará visível aos noivos com a sua mensagem carinhosa.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="px-4 py-3 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="flex-1 py-3 px-4 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Concluir & Registar Contribuição</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CELEBRATION */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8 text-amber-500" />
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-widest text-amber-800 font-bold block mb-1">
                  Contribuição Registada com Sucesso
                </span>
                <h4 className="font-serif text-2xl text-stone-900">
                  Muito Obrigado, {contributorName}!
                </h4>
                <p className="text-xs text-stone-600 max-w-sm mx-auto mt-2 leading-relaxed">
                  O seu presente de <strong>{formattedAmount} {currency}</strong> foi adicionado ao objetivo de {gift.title}. A sua miniatura e mensagem já estão visíveis no convite!
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-stone-200 text-left max-w-sm mx-auto space-y-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <img src={selectedAvatar} alt={contributorName} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <span className="font-semibold text-stone-900 block">{contributorName}</span>
                    <span className="text-[10px] text-emerald-700 font-mono">+{formattedAmount} {currency}</span>
                  </div>
                </div>
                {message && (
                  <p className="text-[11px] text-stone-600 italic border-t border-stone-100 pt-1.5 font-serif">
                    "{message}"
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
              >
                Voltar ao Convite
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
