import React, { useState } from 'react';
import { EventInvitation, AgendaItem, GiftOption, EventCategory } from '../types';
import { ASSET_HERO, ASSET_WEDDING, ASSET_BIRTHDAY, ASSET_BAPTISM } from '../data/initialData';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Calendar, 
  Gift, 
  Music, 
  Plus, 
  Trash2, 
  Check, 
  Eye, 
  Palette, 
  Type, 
  Image as ImageIcon,
  Save,
  Upload,
  Star,
  ExternalLink,
  Church,
  Landmark,
  Sliders,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

interface VisualEditorProps {
  event: EventInvitation;
  onSave: (updated: EventInvitation) => void;
  onPreview: () => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  event,
  onSave,
  onPreview,
}) => {
  const [formData, setFormData] = useState<EventInvitation>({ ...event });
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [customGalleryUrl, setCustomGalleryUrl] = useState('');

  // Synchronize if event changes externally
  React.useEffect(() => {
    setFormData({ ...event });
  }, [event.id]);

  const handleChange = (field: keyof EventInvitation, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        handleChange('coverImage', result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          setFormData((prev) => ({
            ...prev,
            galleryImages: [...(prev.galleryImages || []), result],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddGalleryByUrl = () => {
    if (!customGalleryUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      galleryImages: [...(prev.galleryImages || []), customGalleryUrl.trim()],
    }));
    setCustomGalleryUrl('');
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== idx),
    }));
  };

  const handleThemeChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [field]: value,
      },
    }));
  };

  const handleAddAgendaItem = () => {
    const newItem: AgendaItem = {
      id: 'ag_' + Date.now(),
      time: '18h00',
      title: 'Novo Momento',
      description: 'Descrição do momento',
    };
    setFormData((prev) => ({
      ...prev,
      agenda: [...prev.agenda, newItem],
    }));
  };

  const handleUpdateAgendaItem = (id: string, field: keyof AgendaItem, value: string) => {
    setFormData((prev) => ({
      ...prev,
      agenda: prev.agenda.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const handleRemoveAgendaItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      agenda: prev.agenda.filter((item) => item.id !== id),
    }));
  };

  const handleAddGift = () => {
    const newGift: GiftOption = {
      type: 'mbway',
      title: 'MB Way',
      details: '+351 912 000 000',
      holderName: 'Nome do Titular',
    };
    setFormData((prev) => ({
      ...prev,
      gifts: [...prev.gifts, newGift],
    }));
  };

  const coverSettings = formData.coverImageSettings || {
    zoom: 1,
    positionX: 50,
    positionY: 50,
    aspectRatio: '16/9',
    filter: 'none',
  };

  const handleCoverSettingsChange = (field: string, val: any) => {
    setFormData((prev) => ({
      ...prev,
      coverImageSettings: {
        ...(prev.coverImageSettings || coverSettings),
        [field]: val,
      },
    }));
  };

  const handleResetCoverSettings = () => {
    setFormData((prev) => ({
      ...prev,
      coverImageSettings: {
        zoom: 1,
        positionX: 50,
        positionY: 50,
        aspectRatio: '16/9',
        filter: 'none',
      },
    }));
  };

  const handleAddCrowdfundingGift = () => {
    const newGift: GiftOption = {
      type: 'crowdfunding',
      title: 'Lua de Mel dos Noivos',
      details: 'Contribuição para a nossa viagem de sonho',
      holderName: `${formData.celebrants} (MCX Express: 923 888 777)`,
      targetAmount: 350000,
      currentAmount: 0,
      currency: 'Kz',
      contributions: [],
    };
    setFormData((prev) => ({
      ...prev,
      gifts: [...prev.gifts, newGift],
    }));
  };

  const handleUpdateGift = (idx: number, field: keyof GiftOption, value: any) => {
    const updated = [...formData.gifts];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData((prev) => ({ ...prev, gifts: updated }));
  };

  const handleRemoveGift = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      gifts: prev.gifts.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="font-serif text-2xl font-normal text-stone-900">
            Editor Visual do Convite
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Personalize todas as informações visíveis aos convidados em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSavedToast && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              <span>Guardado com sucesso!</span>
            </div>
          )}
          <button
            type="button"
            onClick={onPreview}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            Pré-visualizar
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5 text-amber-300" />
            Guardar Alterações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Basic Info & Venue */}
        <div className="space-y-6">
          
          {/* Card 1: Identidade do Evento */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              Informações Principais
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Tipo de Evento
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value as EventCategory)}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 capitalize"
                >
                  <option value="casamento">Casamento</option>
                  <option value="aniversario">Aniversário</option>
                  <option value="baptizado">Baptizado</option>
                  <option value="baby_shower">Baby Shower</option>
                  <option value="corporativo">Corporativo</option>
                  <option value="outro">Outro Evento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Nome dos Celebrantes / Anfitriões
                </label>
                <input
                  type="text"
                  required
                  value={formData.celebrants}
                  onChange={(e) => handleChange('celebrants', e.target.value)}
                  placeholder="Ex: Mariana & Gonçalo"
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Título do Convite
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ex: O Nosso Casamento"
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Subtítulo / Frase de Acolhimento
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                placeholder="Ex: Com grande alegria celebramos a nossa união"
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Mensagem aos Convidados
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Texto carinhoso sobre o dia..."
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

          {/* Card: Fotografias do Convite (Foto de Capa & Galeria) */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-700" />
                Fotografias do Convite (Capa & Galeria)
              </h3>
              <span className="text-[11px] text-stone-500 font-medium">
                {formData.galleryImages?.length || 0} na galeria
              </span>
            </div>

            {/* 1. Foto de Capa Atual & Controles de Alteração e Redimensionamento */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-stone-800">
                  Foto de Capa Principal
                </label>
                <button
                  type="button"
                  onClick={handleResetCoverSettings}
                  className="text-[11px] text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  Repor Padrão
                </button>
              </div>

              {/* Dynamic Aspect Ratio and Live Scaled/Positioned Cover Preview */}
              <div 
                className={`relative w-full rounded-xl overflow-hidden border-2 border-stone-300 bg-stone-950 group shadow-md ${
                  coverSettings.aspectRatio === '21/9'
                    ? 'aspect-[21/9]'
                    : coverSettings.aspectRatio === '4/3'
                    ? 'aspect-[4/3]'
                    : coverSettings.aspectRatio === '16/10'
                    ? 'aspect-[16/10]'
                    : 'aspect-[16/9]'
                }`}
              >
                <img
                  src={formData.coverImage}
                  alt="Capa do convite"
                  referrerPolicy="no-referrer"
                  style={{
                    transform: `scale(${coverSettings.zoom || 1})`,
                    transformOrigin: `${coverSettings.positionX ?? 50}% ${coverSettings.positionY ?? 50}%`,
                    objectPosition: `${coverSettings.positionX ?? 50}% ${coverSettings.positionY ?? 50}%`,
                  }}
                  className="w-full h-full object-cover transition-transform duration-150"
                />
                <div className="absolute top-2.5 left-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                  Pré-visualização do Enquadramento ({Math.round((coverSettings.zoom || 1) * 100)}%)
                </div>
              </div>

              {/* CONTROLES INTUITIVOS DE AJUSTE / REDIMENSIONAMENTO */}
              <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-700" />
                    Ajustar & Redimensionar Enquadramento da Capa
                  </span>
                  <span className="text-[10px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded font-mono font-bold">
                    Zoom: {Math.round((coverSettings.zoom || 1) * 100)}%
                  </span>
                </div>

                {/* Zoom / Escala Slider */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-stone-600">
                    <span className="flex items-center gap-1">
                      <ZoomOut className="w-3 h-3 text-stone-400" />
                      Zoom / Escala (100% a 200%)
                    </span>
                    <span className="flex items-center gap-1">
                      <ZoomIn className="w-3 h-3 text-stone-400" />
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.05"
                    value={coverSettings.zoom || 1}
                    onChange={(e) => handleCoverSettingsChange('zoom', parseFloat(e.target.value))}
                    className="w-full accent-amber-700 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* Vertical Position (Y) Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-stone-600">
                      <span>Posição Vertical:</span>
                      <span className="font-mono text-[10px] text-stone-500">{coverSettings.positionY ?? 50}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={coverSettings.positionY ?? 50}
                      onChange={(e) => handleCoverSettingsChange('positionY', parseInt(e.target.value, 10))}
                      className="w-full accent-amber-700 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-stone-400">
                      <span>Topo</span>
                      <span>Centro</span>
                      <span>Base</span>
                    </div>
                  </div>

                  {/* Horizontal Position (X) Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-stone-600">
                      <span>Posição Horizontal:</span>
                      <span className="font-mono text-[10px] text-stone-500">{coverSettings.positionX ?? 50}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={coverSettings.positionX ?? 50}
                      onChange={(e) => handleCoverSettingsChange('positionX', parseInt(e.target.value, 10))}
                      className="w-full accent-amber-700 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-stone-400">
                      <span>Esquerda</span>
                      <span>Centro</span>
                      <span>Direita</span>
                    </div>
                  </div>
                </div>

                {/* Aspect Ratio Choice */}
                <div className="pt-1 border-t border-amber-200/60">
                  <span className="text-[10px] text-stone-600 font-medium block mb-1.5">
                    Proporção do Enquadramento da Capa:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: '16/9', label: 'Panorâmico 16:9' },
                      { id: '16/10', label: 'Elegante 16:10' },
                      { id: '21/9', label: 'Cinema 21:9' },
                      { id: '4/3', label: 'Retrato 4:3' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => handleCoverSettingsChange('aspectRatio', fmt.id)}
                        className={`py-1.5 px-1 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                          (coverSettings.aspectRatio || '16/9') === fmt.id
                            ? 'bg-amber-900 text-white border-amber-900 shadow-2xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botões de Ação para a Capa (Carregar / Link) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Upload Local */}
                <div>
                  <input
                    type="file"
                    id="cover-upload-input"
                    accept="image/*"
                    onChange={handleCoverFileUpload}
                    className="sr-only"
                  />
                  <label
                    htmlFor="cover-upload-input"
                    className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-300" />
                    Carregar Nova Capa
                  </label>
                </div>

                {/* Inserir URL */}
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    placeholder="Ou cole o link da foto..."
                    value={customCoverUrl}
                    onChange={(e) => setCustomCoverUrl(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customCoverUrl.trim()) {
                        handleChange('coverImage', customCoverUrl.trim());
                        setCustomCoverUrl('');
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200 transition-colors cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              {/* Presets de Fotos Elegantes */}
              <div className="pt-1">
                <span className="text-[11px] text-stone-500 block mb-1.5 font-medium">
                  Escolher da Coleção Ki-eventos (1 Clique):
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Noivos & Alianças', src: ASSET_WEDDING },
                    { label: 'Quinta & Jardins', src: ASSET_HERO },
                    { label: 'Festa & Brinde', src: ASSET_BIRTHDAY },
                    { label: 'Tons Claros', src: ASSET_BAPTISM },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChange('coverImage', preset.src)}
                      className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        formData.coverImage === preset.src
                          ? 'border-amber-700 ring-2 ring-amber-300/60'
                          : 'border-stone-200 hover:border-stone-400 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.src}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-stone-950/70 text-white text-[9px] py-0.5 px-1 truncate block text-center">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Galeria de Fotos Adicionais */}
            <div className="pt-3 border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-stone-800">
                    Galeria de Fotos do Casal / Celebração
                  </label>
                  <p className="text-[11px] text-stone-500">
                    Estas fotografias serão apresentadas no carrossel do convite digital.
                  </p>
                </div>

                <div>
                  <input
                    type="file"
                    id="gallery-upload-input"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryFileUpload}
                    className="sr-only"
                  />
                  <label
                    htmlFor="gallery-upload-input"
                    className="py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer border border-stone-300 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Fotos
                  </label>
                </div>
              </div>

              {/* URL para a Galeria */}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Ou adicione foto por URL..."
                  value={customGalleryUrl}
                  onChange={(e) => setCustomGalleryUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryByUrl}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200 cursor-pointer"
                >
                  Adicionar
                </button>
              </div>

              {/* Grid de Miniaturas da Galeria */}
              {formData.galleryImages && formData.galleryImages.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                  {formData.galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shadow-2xs"
                    >
                      <img
                        src={img}
                        alt={`Galeria ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />

                      {/* Badge if it's currently the cover */}
                      {formData.coverImage === img && (
                        <div className="absolute top-1 left-1 bg-amber-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                          Capa
                        </div>
                      )}

                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                        {formData.coverImage !== img && (
                          <button
                            type="button"
                            onClick={() => handleChange('coverImage', img)}
                            title="Definir como foto de capa"
                            className="p-1 bg-white/90 text-amber-800 hover:bg-white rounded transition-colors cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          title="Remover foto da galeria"
                          className="p-1 bg-white/90 text-red-600 hover:bg-white rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-stone-50 rounded-lg border border-dashed border-stone-300 text-center text-[11px] text-stone-500">
                  Nenhuma fotografia adicional na galeria. Carregue fotos do casal para encantar os convidados!
                </div>
              )}
            </div>
          </div>

          {/* Card: Data e Horário Geral */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-stone-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-700" />
                Data do Evento & Prazos Gerais
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Data Principal
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Horário de Início Geral
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Prazo Limite RSVP
                </label>
                <input
                  type="date"
                  required
                  value={formData.rsvpDeadline}
                  onChange={(e) => handleChange('rsvpDeadline', e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Lugares a Reservar (Capacidade)
                </label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  value={formData.totalSeats || 150}
                  onChange={(e) => handleChange('totalSeats', parseInt(e.target.value) || 150)}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 font-semibold"
                />
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  Descontado automaticamente
                </span>
              </div>
            </div>
          </div>

          {/* Card: LOCAL DA CERIMÓNIA CIVIL (ANTES DA CELEBRAÇÃO) */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-800" />
                Local da Cerimónia Civil
              </h3>
              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.hasCivilCeremony ?? true}
                  onChange={(e) => handleChange('hasCivilCeremony', e.target.checked)}
                  className="w-4 h-4 text-amber-800 rounded border-stone-300 focus:ring-amber-800 cursor-pointer"
                />
                <span className="font-medium">Incluir no Convite</span>
              </label>
            </div>

            {(formData.hasCivilCeremony ?? true) ? (
              <div className="space-y-3 pt-1 border-t border-stone-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Local / Registo da Cerimónia Civil
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Registo Civil & Palácio dos Arcos"
                      value={formData.civilVenueName || ''}
                      onChange={(e) => handleChange('civilVenueName', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Horário Civil
                    </label>
                    <input
                      type="time"
                      value={formData.civilTime || '13:30'}
                      onChange={(e) => handleChange('civilTime', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Morada da Cerimónia Civil
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Estrada Marginal, Paço de Arcos"
                    value={formData.civilVenueAddress || ''}
                    onChange={(e) => handleChange('civilVenueAddress', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Link do Google Maps para o Local Civil
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://maps.google.com/?q=..."
                      value={formData.civilMapsUrl || ''}
                      onChange={(e) => handleChange('civilMapsUrl', e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none font-mono text-[11px]"
                    />
                    <a
                      href={formData.civilMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(formData.civilVenueName || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg flex items-center gap-1 shrink-0"
                    >
                      <MapPin className="w-3.5 h-3.5 text-stone-600" />
                      Maps
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">
                A cerimónia civil não será apresentada no convite público.
              </p>
            )}
          </div>

          {/* Card: LOCAL DA IGREJA / CERIMÓNIA RELIGIOSA (ANTES DA CELEBRAÇÃO) */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                <Church className="w-4 h-4 text-amber-800" />
                Local da Igreja / Cerimónia Religiosa
              </h3>
              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.hasChurchCeremony ?? true}
                  onChange={(e) => handleChange('hasChurchCeremony', e.target.checked)}
                  className="w-4 h-4 text-amber-800 rounded border-stone-300 focus:ring-amber-800 cursor-pointer"
                />
                <span className="font-medium">Incluir no Convite</span>
              </label>
            </div>

            {(formData.hasChurchCeremony ?? true) ? (
              <div className="space-y-3 pt-1 border-t border-stone-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nome da Igreja / Sé / Santuário
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Igreja Paroquial de São Pedro de Sintra"
                      value={formData.churchVenueName || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleChange('churchVenueName', val);
                        if (!formData.churchMapsUrl) {
                          handleChange('churchMapsUrl', `https://maps.google.com/?q=${encodeURIComponent(val)}`);
                        }
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Horário da Missa / Bênção
                    </label>
                    <input
                      type="time"
                      value={formData.churchTime || '15:00'}
                      onChange={(e) => handleChange('churchTime', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Morada da Igreja
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Largo Dom Fernando II, 2710-545 Sintra"
                    value={formData.churchVenueAddress || ''}
                    onChange={(e) => handleChange('churchVenueAddress', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Link do Google Maps para a Igreja
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://maps.google.com/?q=..."
                      value={formData.churchMapsUrl || ''}
                      onChange={(e) => handleChange('churchMapsUrl', e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none font-mono text-[11px]"
                    />
                    <a
                      href={formData.churchMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(formData.churchVenueName || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg flex items-center gap-1 shrink-0"
                    >
                      <MapPin className="w-3.5 h-3.5 text-stone-600" />
                      Maps
                    </a>
                  </div>
                </div>

                {/* Church Presets */}
                <div className="pt-1">
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1">
                    Sugestões Rápidas de Igrejas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Igreja de São Pedro de Sintra', addr: 'Largo Dom Fernando II, Sintra', q: 'Igreja+Sao+Pedro+Sintra' },
                      { name: 'Sé Patriarcal de Lisboa', addr: 'Largo da Sé 1, Lisboa', q: 'Se+de+Lisboa' },
                      { name: 'Sé Catedral de Luanda', addr: 'Rua da Sé, Luanda', q: 'Se+Catedral+Luanda' },
                      { name: 'Igreja Nossa Senhora dos Remédios', addr: 'Baixa de Luanda, Angola', q: 'Igreja+Remedios+Luanda' },
                    ].map((ch) => (
                      <button
                        key={ch.name}
                        type="button"
                        onClick={() => {
                          handleChange('churchVenueName', ch.name);
                          handleChange('churchVenueAddress', ch.addr);
                          handleChange('churchMapsUrl', `https://maps.google.com/?q=${ch.q}`);
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-md border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 cursor-pointer"
                      >
                        {ch.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">
                A cerimónia religiosa na igreja não será apresentada no convite.
              </p>
            )}
          </div>

          {/* Card: LOCAL DA CELEBRAÇÃO / FESTA (QUINTA / RECEPÇÃO) */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-stone-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700" />
                Local da Celebração / Festa (Quinta & Copo d'Água)
              </span>
              <span className="text-[11px] font-normal text-amber-800">
                Pesquisa direta no Maps
              </span>
            </h3>

            {/* Quick Venue Search & Presets */}
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <label className="block text-xs font-medium text-stone-800">
                Nome do Espaço / Quinta de Celebração
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escreva o nome da quinta ou local para pesquisar..."
                  value={formData.venueName}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleChange('venueName', val);
                    handleChange('googleMapsUrl', `https://maps.google.com/?q=${encodeURIComponent(val)}`);
                  }}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <a
                  href={formData.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(formData.venueName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg flex items-center gap-1.5 shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  Ver no Maps
                </a>
              </div>

              {/* Suggestions Chips */}
              <div className="pt-1">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block mb-1.5">
                  Sugestões Rápidas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'Quinta do Casal Novo', addr: 'Estrada do Casal Novo, 2640-201 Mafra / Sintra', q: 'Quinta+do+Casal+Novo+Mafra' },
                    { name: 'Quinta da Regaleira', addr: 'Rua Barbosa du Bocage 5, 2710-567 Sintra', q: 'Quinta+da+Regaleira+Sintra' },
                    { name: 'Palácio de Queluz', addr: 'Largo Palácio de Queluz, 2745-191 Queluz', q: 'Palacio+de+Queluz' },
                    { name: 'Quinta da Pacheca', addr: 'Rua do Relógio 4, Lamego, Douro', q: 'Quinta+da+Pacheca' },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        handleChange('venueName', preset.name);
                        handleChange('venueAddress', preset.addr);
                        handleChange('googleMapsUrl', `https://maps.google.com/?q=${preset.q}`);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                        formData.venueName.includes(preset.name)
                          ? 'bg-amber-100 border-amber-300 text-amber-900 font-medium'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Morada Detalhada da Quinta
              </label>
              <input
                type="text"
                required
                value={formData.venueAddress}
                onChange={(e) => handleChange('venueAddress', e.target.value)}
                placeholder="Ex: Estrada do Casal Novo, 2640-201 Mafra / Sintra"
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Link do Google Maps para os Convidados
              </label>
              <input
                type="url"
                value={formData.googleMapsUrl}
                onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono text-[11px]"
              />
            </div>

            {/* Interactive Google Maps Live Embed */}
            <div className="rounded-xl overflow-hidden border border-stone-200 shadow-inner h-40 bg-stone-100 relative">
              <iframe
                title="Google Maps Preview"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  formData.venueName + ' ' + formData.venueAddress
                )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>

          {/* Card 3: Dress Code */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-stone-900">
              Código de Vestuário (Dress Code)
            </h3>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Tipo de Traje
              </label>
              <input
                type="text"
                value={formData.dressCode}
                onChange={(e) => handleChange('dressCode', e.target.value)}
                placeholder="Ex: Traje Formal / Passeio Completo"
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Detalhes ou Paleta de Cores
              </label>
              <input
                type="text"
                value={formData.dressCodeDetails || ''}
                onChange={(e) => handleChange('dressCodeDetails', e.target.value)}
                placeholder="Ex: Tons pastel bem-vindos. Evitar branco."
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

        </div>

        {/* Right Column: Theme, Schedule, Gifts & Features */}
        <div className="space-y-6">
          
          {/* Card 4: Design, Cores & Selo de Cera */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-700" />
              Estilo Visual, Cores & Selo de Cera
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Cor do Selo de Cera
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.theme.waxSealColor}
                    onChange={(e) => handleThemeChange('waxSealColor', e.target.value)}
                    className="w-8 h-8 rounded border border-stone-300 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-stone-600 uppercase">
                    {formData.theme.waxSealColor}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Cor de Destaque
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.theme.primaryColor}
                    onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                    className="w-8 h-8 rounded border border-stone-300 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-stone-600 uppercase">
                    {formData.theme.primaryColor}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Estilo Tipográfico
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleThemeChange('fontFamily', 'serif')}
                  className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                    formData.theme.fontFamily === 'serif'
                      ? 'border-stone-900 bg-stone-100 font-serif font-bold text-stone-900'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <span className="text-sm font-serif">Serifada Clássica</span>
                  <span className="block text-[10px] text-stone-500 font-sans">Romântico & Editorial</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleThemeChange('fontFamily', 'sans')}
                  className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                    formData.theme.fontFamily === 'sans'
                      ? 'border-stone-900 bg-stone-100 font-bold text-stone-900'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <span className="text-sm font-sans">Moderna Geométrica</span>
                  <span className="block text-[10px] text-stone-500 font-sans">Minimalista & Clean</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 5: Cronograma do Dia */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700" />
                Programa / Cronograma do Dia
              </h3>
              <button
                type="button"
                onClick={handleAddAgendaItem}
                className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Momento
              </button>
            </div>

            <div className="space-y-3">
              {formData.agenda.map((item) => (
                <div key={item.id} className="p-3 bg-stone-50 rounded-lg border border-stone-200/80 flex items-start gap-3">
                  <input
                    type="text"
                    value={item.time}
                    onChange={(e) => handleUpdateAgendaItem(item.id, 'time', e.target.value)}
                    placeholder="15h30"
                    className="w-20 px-2 py-1 text-xs font-mono bg-white border border-stone-300 rounded focus:outline-none"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateAgendaItem(item.id, 'title', e.target.value)}
                      placeholder="Título do momento"
                      className="w-full px-2 py-1 text-xs font-medium bg-white border border-stone-300 rounded focus:outline-none"
                    />
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => handleUpdateAgendaItem(item.id, 'description', e.target.value)}
                      placeholder="Breve descrição..."
                      className="w-full px-2 py-1 text-[11px] text-stone-600 bg-white border border-stone-300 rounded focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAgendaItem(item.id)}
                    className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 6: Lista de Presentes, Metas com Barra de Progresso & Contas */}
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-700" />
                  Lista de Presentes & Metas (Kz)
                </h3>
                <p className="text-[11px] text-stone-500">
                  Crie presentes com meta e barra de progresso (ex: Lua de Mel 350.000 Kz) ou contas diretas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddCrowdfundingGift}
                  className="px-2.5 py-1.5 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Presente com Meta (Kz)
                </button>
                <button
                  type="button"
                  onClick={handleAddGift}
                  className="px-2.5 py-1.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Conta
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {formData.gifts.map((gift, idx) => {
                const isGoal = gift.type === 'crowdfunding' || typeof gift.targetAmount === 'number';
                const target = gift.targetAmount || 0;
                const current = gift.currentAmount || 0;
                const remaining = Math.max(0, target - current);
                const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                const currency = gift.currency || 'Kz';

                return (
                  <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          isGoal ? 'bg-amber-100 text-amber-900' : 'bg-stone-200 text-stone-700'
                        }`}>
                          {isGoal ? 'Meta com Progresso' : 'Conta Direta'}
                        </span>
                        <input
                          type="text"
                          value={gift.title}
                          onChange={(e) => handleUpdateGift(idx, 'title', e.target.value)}
                          placeholder="Ex: Lua de Mel dos Noivos"
                          className="px-2 py-1 text-xs font-bold text-stone-900 bg-white border border-stone-300 rounded focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveGift(idx)}
                        className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remover presente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Progress Bar & Goal Settings if Crowdfunding */}
                    {isGoal && (
                      <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-2.5">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] text-stone-500 mb-0.5 font-medium">
                              Meta Total do Presente
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="5000"
                              value={gift.targetAmount || 0}
                              onChange={(e) => handleUpdateGift(idx, 'targetAmount', parseInt(e.target.value, 10) || 0)}
                              className="w-full px-2 py-1 text-xs font-mono font-semibold bg-stone-50 border border-stone-300 rounded focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-stone-500 mb-0.5 font-medium">
                              Valor Arrecadado Atual
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={gift.currentAmount || 0}
                              onChange={(e) => handleUpdateGift(idx, 'currentAmount', parseInt(e.target.value, 10) || 0)}
                              className="w-full px-2 py-1 text-xs font-mono font-semibold bg-stone-50 border border-stone-300 rounded focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-stone-500 mb-0.5 font-medium">
                              Moeda
                            </label>
                            <select
                              value={gift.currency || 'Kz'}
                              onChange={(e) => handleUpdateGift(idx, 'currency', e.target.value)}
                              className="w-full px-2 py-1 text-xs bg-stone-50 border border-stone-300 rounded focus:outline-none"
                            >
                              <option value="Kz">Kz (Kwanzas)</option>
                              <option value="€">€ (Euros)</option>
                              <option value="R$">R$ (Reais)</option>
                              <option value="$">$ (USD)</option>
                            </select>
                          </div>
                        </div>

                        {/* Visual Progress Bar in Editor */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-stone-600 font-medium">
                              Progresso: {percent}% ({new Intl.NumberFormat('pt-PT').format(current)} de {new Intl.NumberFormat('pt-PT').format(target)} {currency})
                            </span>
                            <span className="text-amber-800 font-bold font-mono">
                              Falta: {new Intl.NumberFormat('pt-PT').format(remaining)} {currency}
                            </span>
                          </div>
                          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Holder & Payment Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-stone-500 mb-0.5 font-medium">
                          Titular / Identificação (ex: Noivos, MCX Express)
                        </label>
                        <input
                          type="text"
                          value={gift.holderName || ''}
                          onChange={(e) => handleUpdateGift(idx, 'holderName', e.target.value)}
                          placeholder="Ex: João & Alice (Express: 923 888 777)"
                          className="w-full px-2 py-1 text-[11px] bg-white border border-stone-300 rounded focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-stone-500 mb-0.5 font-medium">
                          Detalhes / IBAN ou Número de Telemóvel
                        </label>
                        <input
                          type="text"
                          value={gift.details}
                          onChange={(e) => handleUpdateGift(idx, 'details', e.target.value)}
                          placeholder="Ex: AO06 0040 ... ou +244 923 888 777"
                          className="w-full px-2 py-1 text-[11px] font-mono bg-white border border-stone-300 rounded focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </form>
  );
};
