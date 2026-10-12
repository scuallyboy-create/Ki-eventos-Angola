import React, { useState } from 'react';
import { InvitationTemplate } from '../types';
import { INITIAL_TEMPLATES } from '../data/initialData';
import { X, Sparkles, ArrowRight, Check } from 'lucide-react';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (template: InvitationTemplate, title: string) => void;
  defaultTemplate?: InvitationTemplate;
}

export const NewEventModal: React.FC<NewEventModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  defaultTemplate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<InvitationTemplate>(
    defaultTemplate || INITIAL_TEMPLATES[0]
  );
  const [title, setTitle] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(selectedTemplate, title || `Novo Convite de ${selectedTemplate.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <h3 className="font-serif text-2xl font-normal text-stone-900">
              Criar Novo Convite Digital
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Escolha o modelo base e dê um título ao seu evento.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Título do Evento ou Nomes
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Casamento de Joana & Miguel ou 40 Anos da Marta"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Selecione o Modelo Base
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {INITIAL_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                    selectedTemplate.id === tmpl.id
                      ? 'border-stone-900 bg-stone-50 shadow-xs ring-1 ring-stone-900'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <img
                    src={tmpl.previewImage}
                    alt={tmpl.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-900 truncate">
                        {tmpl.name}
                      </span>
                      {selectedTemplate.id === tmpl.id && (
                        <Check className="w-4 h-4 text-amber-800 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-amber-900 block capitalize mt-0.5">
                      {tmpl.category.replace('_', ' ')}
                    </span>
                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-1">
                      {tmpl.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Criar & Abrir no Editor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
