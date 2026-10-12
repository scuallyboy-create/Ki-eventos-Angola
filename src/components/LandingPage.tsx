import React, { useState } from 'react';
import { EventCategory, InvitationTemplate } from '../types';
import { ASSET_HERO, INITIAL_TEMPLATES } from '../data/initialData';
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  Heart, 
  MapPin, 
  Gift, 
  Smartphone, 
  Music, 
  Users, 
  MessageSquare,
  QrCode,
  CalendarCheck,
  Eye,
  Shield,
  Clock
} from 'lucide-react';

interface LandingPageProps {
  onStartCreate: (template?: InvitationTemplate) => void;
  onPreviewSample: () => void;
  onSelectTemplate: (template: InvitationTemplate) => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCreate,
  onPreviewSample,
  onSelectTemplate,
  onOpenAuth,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'todos'>('todos');

  const filteredTemplates = selectedCategory === 'todos'
    ? INITIAL_TEMPLATES
    : INITIAL_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-20 lg:pt-14 lg:pb-32 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
                <span className="uppercase tracking-widest text-amber-800 font-semibold">Ki-eventos</span>
                <span aria-hidden="true">·</span>
                <span>Convites Digitais Memoráveis</span>
                <span aria-hidden="true">·</span>
                <span>RSVP em Tempo Real</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight text-stone-900 [text-wrap:balance]">
                Convites elegantes que emocionam antes mesmo da festa começar.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 font-light leading-relaxed max-w-2xl">
                Crie convites digitais sofisticados para casamentos, aniversários e celebrações especiais. 
                Envie por WhatsApp, recolha confirmações de presença imediatas, partilhe itinerários com Google Maps e receba mensagens de carinho num mural exclusivo.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onStartCreate()}
                  className="px-6 py-3.5 text-sm font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 active:scale-98 transition-all shadow-sm cursor-pointer flex items-center gap-2.5 whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Criar o Meu Convite Agora
                </button>
                <button
                  onClick={onPreviewSample}
                  className="px-6 py-3.5 text-sm font-medium text-stone-800 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 active:scale-98 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shadow-xs"
                >
                  <Eye className="w-4 h-4 text-stone-600" />
                  Ver Convite de João e Alice
                </button>
              </div>

              {/* Quiet Highlights */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-stone-600">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-amber-700" />
                  <span>Sem necessidade de aplicações</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-amber-700" />
                  <span>Envio direto por WhatsApp</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-amber-700" />
                  <span>Controlo total de acompanhantes</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset - João e Alice */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-xl border border-stone-200/80 bg-stone-100">
                <img
                  src={ASSET_HERO}
                  alt="Casamento de João e Alice Ki-eventos"
                  referrerPolicy="no-referrer"
                  className="w-full h-[430px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-300 mb-1">
                    <span>Quinta do Casal Novo · Mafra / Sintra</span>
                    <span aria-hidden="true">·</span>
                    <span>14 de Novembro</span>
                  </div>
                  <h3 className="font-serif text-2xl font-normal text-white">
                    João e Alice
                  </h3>
                  <p className="text-xs text-stone-200 mt-1 line-clamp-2 font-light">
                    Selo de cera virtual, contagem decrescente, mapa interativo e confirmação de presença (RSVP) em tempo real.
                  </p>
                  <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                    <span className="text-xs text-stone-300">14 de Novembro de 2026</span>
                    <button
                      onClick={onPreviewSample}
                      className="text-xs font-semibold text-white underline underline-offset-4 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      Abrir convite digital →
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating detail tag */}
              <div className="absolute -bottom-5 -left-4 sm:left-4 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-xl p-3 shadow-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-900">Confirmação Imediata (RSVP)</p>
                  <p className="text-[11px] text-stone-500">Notificação instantânea para os noivos</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Quantitative Rigor Proof Strip */}
      <section className="bg-stone-100/80 border-b border-stone-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 tabular-nums">
                +18.400
              </p>
              <p className="text-xs text-stone-500 mt-0.5">Convites Entregues</p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 tabular-nums">
                98.6%
              </p>
              <p className="text-xs text-stone-500 mt-0.5">Taxa de Resposta em 72h</p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 tabular-nums">
                100%
              </p>
              <p className="text-xs text-stone-500 mt-0.5">Otimizado para WhatsApp</p>
            </div>
            <div>
              <p className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 tabular-nums">
                4.9 / 5
              </p>
              <p className="text-xs text-stone-500 mt-0.5">Avaliação dos Noivos & Anfitriões</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Template Catalog */}
      <section id="modelos" className="py-20 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-stone-500 mb-2">
                <span>Catálogo de Design</span>
                <span aria-hidden="true">·</span>
                <span>Coleção Exclusiva</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 [text-wrap:balance]">
                Modelos desenhados para cada tipo de celebração
              </h2>
              <p className="text-sm text-stone-600 mt-2 max-w-xl font-light">
                Escolha um tema pré-configurado e personalize textos, datas, fotografias, música e endereço ao seu gosto.
              </p>
            </div>

            {/* Segmented Filter Control */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg overflow-x-auto shrink-0 border border-stone-200">
              <button
                onClick={() => setSelectedCategory('todos')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'todos'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedCategory('casamento')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'casamento'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Casamentos
              </button>
              <button
                onClick={() => setSelectedCategory('aniversario')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'aniversario'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Aniversários
              </button>
              <button
                onClick={() => setSelectedCategory('baptizado')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'baptizado'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Baptizados
              </button>
              <button
                onClick={() => setSelectedCategory('baby_shower')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'baby_shower'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Baby Shower
              </button>
            </div>
          </div>

          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                    <img
                      src={template.previewImage}
                      alt={template.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-medium text-stone-700 border border-stone-200 shadow-xs">
                      {template.theme.name}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                      <span className="capitalize">{template.category.replace('_', ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span>{template.sampleCelebrants}</span>
                    </div>

                    <h3 className="font-serif text-xl font-normal text-stone-900 group-hover:text-amber-800 transition-colors">
                      {template.name}
                    </h3>

                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onSelectTemplate(template)}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Personalizar Este Modelo
                    <ArrowRight className="w-3.5 h-3.5 text-stone-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. Core Capabilities Bento-Grid */}
      <section id="funcionalidades" className="py-20 border-b border-stone-200 bg-stone-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-14">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500 mb-2">
              <span>Tecnologia & Experiência</span>
              <span aria-hidden="true">·</span>
              <span>Sem Complicações</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 [text-wrap:balance]">
              Tudo o que precisa para gerir convidados com tranquilidade
            </h2>
            <p className="text-sm text-stone-600 mt-2 font-light">
              Diga adeus às listas em papel e às mensagens perdidas. A Ki-eventos centraliza todo o fluxo do evento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento 1: RSVP Real Time (col-span-2) */}
            <div className="md:col-span-2 bg-white rounded-xl border border-stone-200 p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center mb-5">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-2xl font-normal text-stone-900 mb-2">
                  Confirmação de Presença (RSVP) em Tempo Real
                </h3>
                <p className="text-sm text-stone-600 max-w-xl leading-relaxed">
                  Os convidados confirmam com 1 toque no smartphone, indicando quantos adultos e crianças os acompanham, além de restrições alimentares (vegetariano, sem glúten, etc.). Os dados entram automaticamente no seu painel.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-100 grid grid-cols-3 gap-4 text-xs text-stone-600">
                <div>
                  <span className="font-semibold text-stone-900 block text-base tabular-nums">01.</span>
                  Status atualizado ao segundo
                </div>
                <div>
                  <span className="font-semibold text-stone-900 block text-base tabular-nums">02.</span>
                  Controlo de dietas para o catering
                </div>
                <div>
                  <span className="font-semibold text-stone-900 block text-base tabular-nums">03.</span>
                  Exportação de listas para Excel / PDF
                </div>
              </div>
            </div>

            {/* Bento 2: WhatsApp Envio Imediato */}
            <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-5">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-2xl font-normal text-stone-900 mb-2">
                  Disparo Fácil por WhatsApp
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Envie links personalizados com mensagens carinhosas diretamente pelo WhatsApp. Sem necessidade de instalar aplicações.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Compatível com Android, iPhone e PC</span>
              </div>
            </div>

            {/* Bento 3: Localização Google Maps */}
            <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-800 flex items-center justify-center mb-5">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-2xl font-normal text-stone-900 mb-2">
                  Google Maps & Waze Direto
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Nenhum convidado se perde a caminho da quinta ou da igreja. O convite inclui traçado de rota em 1 clique direto no mapa.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500">
                <Check className="w-4 h-4 text-sky-600" />
                <span>Itinerário detalhado com horários</span>
              </div>
            </div>

            {/* Bento 4: Presentes & MB Way / IBAN */}
            <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-800 flex items-center justify-center mb-5">
                  <Gift className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-2xl font-normal text-stone-900 mb-2">
                  Lista de Presentes & MB Way
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Disponibilize dados bancários (IBAN, MB Way, PIX) ou listas em lojas parceiras com botão de cópia rápida.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500">
                <Check className="w-4 h-4 text-rose-600" />
                <span>100% dos valores vão para si</span>
              </div>
            </div>

            {/* Bento 5: QR Code & Mural de Mensagens */}
            <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center mb-5">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-2xl font-normal text-stone-900 mb-2">
                  Mural de Afetos & QR Code
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Os convidados podem deixar mensagens de carinho que ficam guardadas para sempre. Gere QR Code para imprimir na entrada.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500">
                <Check className="w-4 h-4 text-purple-600" />
                <span>Recordação eterna do seu dia</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Como Funciona (3 Steps) */}
      <section id="como-funciona" className="py-20 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-stone-500 mb-2">
              <span>Simplicidade Absoluta</span>
              <span aria-hidden="true">·</span>
              <span>Em Menos de 5 Minutos</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 [text-wrap:balance]">
              Como criar o seu convite na Ki-eventos
            </h2>
            <p className="text-sm text-stone-600 mt-2 font-light">
              Processo intuitivo e descomplicado para que se concentre no que realmente importa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-stone-200 rounded-xl p-8 bg-white relative">
              <span className="text-xs font-mono text-amber-800 font-bold tracking-wider">PASSO 01</span>
              <h3 className="font-serif text-xl font-normal text-stone-900 mt-3 mb-2">
                Escolha o Modelo Desejado
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Selecione o design que melhor reflete o tom do seu casamento, aniversário ou baptizado entre a nossa coleção exclusiva.
              </p>
            </div>

            <div className="border border-stone-200 rounded-xl p-8 bg-white relative">
              <span className="text-xs font-mono text-amber-800 font-bold tracking-wider">PASSO 02</span>
              <h3 className="font-serif text-xl font-normal text-stone-900 mt-3 mb-2">
                Personalize no Editor Visual
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Insira nomes, data, horário, morada da quinta com Google Maps, opções de presentes, fotos e música de fundo.
              </p>
            </div>

            <div className="border border-stone-200 rounded-xl p-8 bg-white relative">
              <span className="text-xs font-mono text-amber-800 font-bold tracking-wider">PASSO 03</span>
              <h3 className="font-serif text-xl font-normal text-stone-900 mt-3 mb-2">
                Partilhe & Receba as Confirmações
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Envie o link por WhatsApp para a sua lista de contactos e acompanhe quem vai, adultos, crianças e notas alimentares no painel.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => onStartCreate()}
              className="px-7 py-3.5 text-sm font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm"
            >
              Começar Agora sem Compromisso
              <ArrowRight className="w-4 h-4 text-stone-300" />
            </button>
          </div>

        </div>
      </section>

      {/* 5. Planos e Preços */}
      <section id="planos" className="py-20 border-b border-stone-200 bg-stone-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-stone-500 mb-2">
              <span>Transparência Total</span>
              <span aria-hidden="true">·</span>
              <span>Sem Mensalidades Escondidas</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 [text-wrap:balance]">
              Planos desenhados para cada dimensão de evento
            </h2>
            <p className="text-sm text-stone-600 mt-2 font-light">
              Experimente gratuitamente ou active funcionalidades premium para eventos inesquecíveis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Plano Gratuito */}
            <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Gratuito</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">0 Kz</span>
                  <span className="text-xs text-stone-500">/ evento</span>
                </div>
                <p className="text-xs text-stone-600 mt-2">
                  Ideal para pequenas reuniões de família ou aniversários íntimos.
                </p>

                <div className="mt-6 pt-6 border-t border-stone-100 space-y-3 text-xs text-stone-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Até 25 convidados registados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>RSVP e contagem básica</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Localização com Google Maps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Partilha por link e WhatsApp</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6">
                <button
                  onClick={() => onStartCreate()}
                  className="w-full py-2.5 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                >
                  Começar Grátis
                </button>
              </div>
            </div>

            {/* Plano Premium (Featured) */}
            <div className="bg-white rounded-xl border-2 border-stone-900 p-8 shadow-md flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-900 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                Mais Escolhido por Noivos
              </div>

              <div>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Premium Evento</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">35.000 Kz</span>
                  <span className="text-xs text-stone-500">/ pagamento único</span>
                </div>
                <p className="text-xs text-stone-600 mt-2">
                  Perfeito para casamentos, batizados e grandes celebrações de aniversário.
                </p>

                <div className="mt-6 pt-6 border-t border-stone-100 space-y-3 text-xs text-stone-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="font-medium text-stone-900">Convidados ilimitados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Selo de cera virtual com animação de envelope</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>A Nossa História com fotos e vídeos curtos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Lista de presentes com Express, Multicaixa & IBAN</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Link e Leitor de QR Code para a Portaria</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Exportação de lista oficial em PDF & CSV</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6">
                <button
                  onClick={() => onStartCreate()}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                >
                  Criar com Funcionalidades Totais
                </button>
              </div>
            </div>

            {/* Plano Cerimonialista / Pro */}
            <div className="bg-white rounded-xl border border-stone-200 p-8 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Cerimonial & Pro</span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">75.000 Kz</span>
                  <span className="text-xs text-stone-500">/ mês</span>
                </div>
                <p className="text-xs text-stone-600 mt-2">
                  Para wedding planners, quintas e organizadores de eventos profissionais.
                </p>

                <div className="mt-6 pt-6 border-t border-stone-100 space-y-3 text-xs text-stone-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Múltiplos eventos simultâneos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Painel multi-cliente com gestão de acessos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Portaria inteligente & validação de QR Code</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Apoio prioritário por WhatsApp</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6">
                <button
                  onClick={onOpenAuth}
                  className="w-full py-2.5 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                >
                  Contactar Cerimonial
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Testemunhos Reais */}
      <section className="py-20 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-2xl mb-12">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500 mb-2">
              <span>Opinião de Quem Usou</span>
              <span aria-hidden="true">·</span>
              <span>Experiências Reais</span>
            </div>
            <h2 className="font-serif text-3xl font-normal text-stone-900">
              Casais e anfitriões que confiaram na Ki-eventos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-stone-100/50 p-6 rounded-xl border border-stone-200">
              <p className="text-xs text-stone-700 leading-relaxed font-light italic">
                "Foi a melhor decisão para o nosso casamento em Sintra. Os convidados adoraram a animação do selo de cera e nós conseguimos fechar a lista com o catering duas semanas antes do prazo limite."
              </p>
              <div className="mt-5 pt-4 border-t border-stone-200/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-200/80 flex items-center justify-center font-serif text-xs font-bold text-amber-900">
                  MG
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-900">Mariana & Gonçalo</p>
                  <p className="text-[11px] text-stone-500">Casamento · Quinta dos Carvalhos</p>
                </div>
              </div>
            </div>

            <div className="bg-stone-100/50 p-6 rounded-xl border border-stone-200">
              <p className="text-xs text-stone-700 leading-relaxed font-light italic">
                "Para os meus 30 anos queria algo diferente dos convites de PDF banais. O envio por WhatsApp com o link direto e o passe digital com QR Code fez um sucesso gigante entre os amigos."
              </p>
              <div className="mt-5 pt-4 border-t border-stone-200/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-300 flex items-center justify-center font-serif text-xs font-bold text-stone-800">
                  TM
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-900">Tomás Matos</p>
                  <p className="text-[11px] text-stone-500">Aniversário · Cais do Sodré</p>
                </div>
              </div>
            </div>

            <div className="bg-stone-100/50 p-6 rounded-xl border border-stone-200">
              <p className="text-xs text-stone-700 leading-relaxed font-light italic">
                "O controlo de convidados com dietas especiais e crianças facilitou imenso a organização do baptizado da Leonor. O suporte foi atencioso e a página ficou linda."
              </p>
              <div className="mt-5 pt-4 border-t border-stone-200/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-200/80 flex items-center justify-center font-serif text-xs font-bold text-emerald-900">
                  CS
                </div>
                <div>
                  <p className="text-xs font-medium text-stone-900">Cláudia & Simão</p>
                  <p className="text-[11px] text-stone-500">Baptizado · Cascais</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 7. Footer Quiet */}
      <footer className="py-12 bg-stone-900 text-stone-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-stone-800 text-amber-300 flex items-center justify-center font-serif font-bold text-sm">
                Ki
              </div>
              <span className="font-serif text-xl font-bold text-white">Ki-eventos</span>
              <span className="text-stone-500">·</span>
              <span>A plataforma portuguesa de convites digitais</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-stone-300">
              <a href="#modelos" className="hover:text-white transition-colors">Modelos</a>
              <a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a>
              <a href="#planos" className="hover:text-white transition-colors">Planos</a>
              <button onClick={onOpenAuth} className="hover:text-white transition-colors cursor-pointer">Acesso Anfitrião</button>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
            <p>© {new Date().getFullYear()} Ki-eventos. Todos os direitos reservados. Feito com amor para momentos inesquecíveis.</p>
            <div className="flex items-center gap-4">
              <span>Termos de Serviço</span>
              <span>·</span>
              <span>Privacidade & RGPD</span>
              <span>·</span>
              <span>Suporte ao Cliente</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
