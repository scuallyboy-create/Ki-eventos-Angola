import React, { useState } from 'react';
import { X, QrCode, Smartphone, ExternalLink, Copy, Check, Download, Sparkles } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteUrl: string;
  celebrants: string;
  onSimulateScan: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  isOpen,
  onClose,
  inviteUrl,
  celebrants,
  onSimulateScan,
}) => {
  const [copied, setCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulate = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onClose();
      onSimulateScan();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-stone-800" />
            </div>
            <div>
              <h3 className="font-serif text-base font-normal text-stone-900">
                Código QR do Convite
              </h3>
              <p className="text-[11px] text-stone-500">
                {celebrants}
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

        <div className="p-6 text-center space-y-5">
          {/* QR Code Container with interactive laser scanning bar effect */}
          <div className="relative mx-auto w-52 h-52 bg-stone-50 border-2 border-stone-900 rounded-2xl p-3 shadow-md flex items-center justify-center overflow-hidden">
            <div className="w-44 h-44 bg-white rounded-xl flex items-center justify-center p-2 shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&margin=8&data=${encodeURIComponent(inviteUrl)}`}
                alt="QR Code Oficial do Convite"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Scanning line animation when simulated */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,1)] animate-bounce top-1/2" />
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-stone-900 block">
              Pronto a Ler com Qualquer Câmara de Telemóvel
            </span>
            <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
              Ao apontar a câmara, o convidado acede diretamente ao convite interativo e confirmação de presença.
            </p>
          </div>

          {/* Direct Link Preview */}
          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex items-center justify-between text-left">
            <span className="font-mono text-[11px] text-stone-600 truncate flex-1 pr-2">
              {inviteUrl}
            </span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs font-semibold text-stone-800 bg-white border border-stone-300 rounded-md hover:bg-stone-100 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleSimulate}
              className="py-3 px-3 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Smartphone className="w-4 h-4 text-amber-200" />
              <span>Simular Leitura</span>
            </button>

            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-3 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-stone-600" />
              <span>Abrir numa Nova Aba</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
