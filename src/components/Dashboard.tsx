import React, { useState } from 'react';
import { EventInvitation } from '../types';
import { VisualEditor } from './VisualEditor';
import { GuestManager } from './GuestManager';
import { QrCodeModal } from './QrCodeModal';
import { 
  Calendar, 
  Users, 
  Edit3, 
  Share2, 
  MessageSquare, 
  Eye, 
  ExternalLink, 
  QrCode, 
  Copy, 
  Check, 
  Sparkles,
  Send,
  CalendarCheck,
  CheckCircle2,
  Trash2,
  Download,
  Smartphone,
  ShieldCheck,
  Printer,
  Sliders,
  X
} from 'lucide-react';

interface DashboardProps {
  events: EventInvitation[];
  activeEvent: EventInvitation;
  onSelectEvent: (eventId: string) => void;
  onUpdateEvent: (updated: EventInvitation) => void;
  onPreviewPublic: () => void;
  onOpenNewEventModal: () => void;
  onOpenPortaria?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  events,
  activeEvent,
  onSelectEvent,
  onUpdateEvent,
  onPreviewPublic,
  onOpenNewEventModal,
  onOpenPortaria,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'guests' | 'mural' | 'share'>('editor');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPortariaLink, setCopiedPortariaLink] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSeatsModalOpen, setIsSeatsModalOpen] = useState(false);
  const [newTotalSeats, setNewTotalSeats] = useState(activeEvent.totalSeats || 150);

  // Compute clean, robust public URL that works both in iframe and new tabs
  const getCleanBaseUrl = () => {
    try {
      const href = window.location.href;
      return href.split('?')[0].split('#')[0];
    } catch {
      return window.location.origin;
    }
  };

  // Synchronized Public Invite and Portaria URLs
  const publicInviteUrl = `${getCleanBaseUrl()}?convite=${encodeURIComponent(activeEvent.id)}`;
  const portariaUrl = `${getCleanBaseUrl()}?portaria=true&evento=${encodeURIComponent(activeEvent.id)}`;

  // Capacity & Seats calculation (Automatically discounted as guests confirm)
  const totalSeats = activeEvent.totalSeats || 150;
  const confirmedGuests = activeEvent.guests.filter((g) => g.status === 'confirmado');
  const occupiedSeats = confirmedGuests.reduce(
    (acc, g) => acc + g.adultsCount + (g.companionName || g.hasCompanion ? 1 : 0) + g.childrenCount,
    0
  );
  const remainingSeats = Math.max(0, totalSeats - occupiedSeats);
  const occupancyPercentage = Math.min(100, Math.round((occupiedSeats / totalSeats) * 100));

  // Stats calculation
  const totalGuests = activeEvent.guests.length;
  const pendingGuests = activeEvent.guests.filter((g) => g.status === 'pendente');
  const confirmedRate = totalGuests > 0 ? Math.round((confirmedGuests.length / totalGuests) * 100) : 0;

  // Days until event
  const eventDate = new Date(`${activeEvent.date}T00:00:00`);
  const today = new Date();
  const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const [whatsappTemplate, setWhatsappTemplate] = useState(
    `Olá! É com muita alegria que te convidamos para o ${activeEvent.title} de ${activeEvent.celebrants}.\n\nPodes ver todas as informações, localização no mapa e confirmar a tua presença aqui:\n${publicInviteUrl}\n\nEsperamos muito por ti!`
  );

  React.useEffect(() => {
    setWhatsappTemplate(
      `Olá! É com muita alegria que te convidamos para o ${activeEvent.title} de ${activeEvent.celebrants}.\n\nPodes ver todas as informações, localização no mapa e confirmar a tua presença aqui:\n${publicInviteUrl}\n\nEsperamos muito por ti!`
    );
  }, [activeEvent.id, publicInviteUrl]);

  React.useEffect(() => {
    setNewTotalSeats(activeEvent.totalSeats || 150);
  }, [activeEvent.totalSeats]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicInviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPortariaLink = () => {
    navigator.clipboard.writeText(portariaUrl);
    setCopiedPortariaLink(true);
    setTimeout(() => setCopiedPortariaLink(false), 2500);
  };

  const handleSaveTotalSeats = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEvent({
      ...activeEvent,
      totalSeats: Number(newTotalSeats) || 150,
    });
    setIsSeatsModalOpen(false);
  };

  const handleDownloadQrCode = async () => {
    try {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=15&data=${encodeURIComponent(publicInviteUrl)}`;
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode_${activeEvent.slug || 'convite'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(`https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=15&data=${encodeURIComponent(publicInviteUrl)}`, '_blank');
    }
  };

  const handleExportGuestsCSV = () => {
    const headers = ['Nome', 'Acompanhante', 'Lado/Pertence', 'Grupo', 'Telefone', 'Status', 'Lugares', 'Restricoes', 'Mesa', 'Codigo_QR', 'Notas'];
    const rows = activeEvent.guests.map((g) => [
      `"${g.name.replace(/"/g, '""')}"`,
      `"${(g.companionName || 'Sem acompanhante').replace(/"/g, '""')}"`,
      `"${(g.belongsToSide || 'Geral').replace(/"/g, '""')}"`,
      `"${g.group.replace(/"/g, '""')}"`,
      `"${g.phone.replace(/"/g, '""')}"`,
      `"${g.status}"`,
      g.adultsCount + (g.companionName || g.hasCompanion ? 1 : 0),
      `"${(g.dietaryRestrictions || 'Nenhuma').replace(/"/g, '""')}"`,
      `"${(g.tableNumber || '-').replace(/"/g, '""')}"`,
      `"${g.qrCodePass || 'CVT-' + g.id.slice(-6)}"`,
      `"${(g.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lista_convidados_${activeEvent.slug || 'evento'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export and Print PDF for Portaria
  const handlePrintPdfPortaria = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const rowsHtml = activeEvent.guests
      .filter((g) => g.status === 'confirmado')
      .map(
        (g, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
          <td style="padding: 7px 8px; font-weight: bold;">${idx + 1}</td>
          <td style="padding: 7px 8px; font-weight: 600;">
            ${g.name}
            ${g.companionName ? `<br><span style="color:#64748b; font-weight:normal;">+ Acomp: ${g.companionName}</span>` : ''}
          </td>
          <td style="padding: 7px 8px; text-transform: capitalize;">${g.belongsToSide || g.group || 'Geral'}</td>
          <td style="padding: 7px 8px; text-align: center; font-weight: bold;">${g.adultsCount + (g.companionName || g.hasCompanion ? 1 : 0)}</td>
          <td style="padding: 7px 8px;">${g.tableNumber || '-'}</td>
          <td style="padding: 7px 8px; font-family: monospace; font-size: 10px;">${g.qrCodePass || 'CVT-' + g.id.slice(-6)}</td>
          <td style="padding: 7px 8px; text-align: center;">
            <div style="width: 14px; height: 14px; border: 1.5px solid #000; margin: 0 auto; display: inline-block;"></div>
          </td>
          <td style="padding: 7px 8px; color: #94a3b8;">___:___</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lista Oficial da Portaria - ${activeEvent.celebrants}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 25px; color: #0f172a; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 18px; }
          .title { font-size: 22px; font-weight: bold; margin: 0; }
          .sub { font-size: 13px; color: #475569; margin: 4px 0 0 0; }
          .kpis { display: flex; justify-content: space-around; background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 8px; margin-bottom: 18px; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #0f172a; color: #fff; padding: 8px 8px; text-align: left; font-size: 11px; text-transform: uppercase; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #92400e; margin: 0; font-weight: bold;">Ki-Eventos · Lista Oficial da Portaria & Validação de Acesso</p>
          <h1 class="title">${activeEvent.celebrants} — ${activeEvent.title}</h1>
          <p class="sub">Data: ${new Date(activeEvent.date).toLocaleDateString('pt-PT')} · Local: ${activeEvent.venueName}</p>
        </div>
        <div class="kpis">
          <div><strong>Lotação Reservada:</strong> ${totalSeats} lugares</div>
          <div><strong>Lugares Confirmados:</strong> ${occupiedSeats} lugares</div>
          <div><strong>Vagas Disponíveis:</strong> ${remainingSeats} lugares</div>
          <div><strong>Data de Emissão:</strong> ${new Date().toLocaleDateString('pt-PT')}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Convidado & Acompanhante</th>
              <th>Pertence a</th>
              <th>Lugares</th>
              <th>Mesa</th>
              <th>Código Passe</th>
              <th>Check-in</th>
              <th>Hora Entrada</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div style="margin-top: 35px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 15px;">
          <div>Responsável da Recepção / Portaria: _____________________________________</div>
          <div>Visto do Cerimonial / Segurança: _____________________________________</div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDeleteMessage = (msgId: string) => {
    const updatedMessages = activeEvent.messages.filter((m) => m.id !== msgId);
    onUpdateEvent({ ...activeEvent, messages: updatedMessages });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Event Selector & Action Bar */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="uppercase tracking-wider font-semibold text-amber-800">Painel do Anfitrião</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{activeEvent.category.replace('_', ' ')}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-800 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Plano Premium Ativo
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <select
                value={activeEvent.id}
                onChange={(e) => onSelectEvent(e.target.value)}
                className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 bg-transparent border-b border-stone-300 pb-1 focus:outline-none focus:border-stone-900 cursor-pointer"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id} className="text-sm font-sans text-stone-800">
                    {evt.celebrants} — {evt.title}
                  </option>
                ))}
              </select>

              <button
                onClick={onOpenNewEventModal}
                className="text-xs font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-4 cursor-pointer"
              >
                + Criar outro evento
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Data: {new Date(activeEvent.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })} · {activeEvent.venueName}
            </p>
          </div>

          {/* Quick Actions: Preview, Portaria, PDF & Share */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenPortaria}
              className="px-3.5 py-2.5 text-xs font-semibold text-white bg-amber-900 hover:bg-amber-800 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              title="Abrir o Sistema da Portaria com Scanner de Código QR para os seguranças"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Abrir Portaria & Scanner</span>
            </button>

            <button
              onClick={handlePrintPdfPortaria}
              className="px-3.5 py-2.5 text-xs font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              title="Exportar Lista Oficial para a Portaria em PDF para impressão"
            >
              <Printer className="w-4 h-4 text-amber-700" />
              <span>PDF Portaria</span>
            </button>

            <button
              onClick={handleExportGuestsCSV}
              className="px-3.5 py-2.5 text-xs font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              title="Exportar lista de convidados para ficheiro CSV"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>CSV ({activeEvent.guests.length})</span>
            </button>

            <button
              onClick={onPreviewPublic}
              className="px-3.5 py-2.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Eye className="w-4 h-4 text-stone-600" />
              <span>Ver Convite</span>
            </button>

            <button
              onClick={() => setActiveTab('share')}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4 text-amber-300" />
              <span>Partilhar</span>
            </button>
          </div>
        </div>

        {/* Global KPIs with AUTOMATIC SEAT OCCUPANCY DISCOUNT BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Card 1: Capacidade e Lugares Reservados (Descontados Automaticamente) */}
          <div className="md:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border-2 border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-700" />
                Lugares Reservados & Lotação
              </span>
              <button
                onClick={() => setIsSeatsModalOpen(true)}
                className="text-xs text-amber-800 hover:text-amber-900 font-semibold underline underline-offset-2 cursor-pointer flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                Alterar Total de Lugares
              </button>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tabular-nums">
                  {occupiedSeats}
                </span>
                <span className="text-stone-500 font-serif text-2xl font-light"> / {totalSeats}</span>
                <span className="text-xs text-stone-500 ml-2">lugares ocupados</span>
              </div>
              
              <div className="text-right">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {remainingSeats} lugares livres
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1">
              <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    occupancyPercentage >= 95
                      ? 'bg-rose-600'
                      : occupancyPercentage >= 75
                      ? 'bg-amber-600'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${occupancyPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>Desconto automático no ato de confirmação de presença (RSVP)</span>
                <span className="font-bold text-stone-700">{occupancyPercentage}% ocupado</span>
              </div>
            </div>
          </div>

          {/* Card 2: Taxa de Confirmação */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
                <span>Taxa de Confirmação</span>
                <CalendarCheck className="w-4 h-4 text-stone-400" />
              </div>
              <p className="font-serif text-3xl font-semibold text-stone-900 tabular-nums">
                {confirmedRate}%
              </p>
            </div>
            <p className="text-[11px] text-stone-500 mt-2">
              {confirmedGuests.length} de {totalGuests} convites respondidos ({pendingGuests.length} pendentes)
            </p>
          </div>

          {/* Card 3: Contagem Regressiva */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
                <span>Dias para o Evento</span>
                <Calendar className="w-4 h-4 text-stone-400" />
              </div>
              <p className="font-serif text-3xl font-semibold text-stone-900 tabular-nums">
                {diffDays > 0 ? diffDays : 'Hoje!'}
              </p>
            </div>
            <p className="text-[11px] text-stone-500 mt-2 truncate">
              {activeEvent.time}h · {activeEvent.venueName}
            </p>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('editor')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'editor'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Editor do Convite & A Nossa História
          </button>

          <button
            onClick={() => setActiveTab('guests')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'guests'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Gestão de Convidados ({activeEvent.guests.length})
          </button>

          <button
            onClick={() => setActiveTab('mural')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'mural'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Mural de Recados ({activeEvent.messages.length})
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'share'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Share2 className="w-4 h-4" />
            Partilhar, Portaria & QR Code
          </button>
        </div>

        {/* Tab 1: Visual Editor */}
        {activeTab === 'editor' && (
          <VisualEditor
            event={activeEvent}
            onSave={onUpdateEvent}
            onPreview={onPreviewPublic}
          />
        )}

        {/* Tab 2: Guest Manager */}
        {activeTab === 'guests' && (
          <GuestManager
            event={activeEvent}
            onUpdateEvent={onUpdateEvent}
          />
        )}

        {/* Tab 3: Mural de Recados */}
        {activeTab === 'mural' && (
          <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="font-serif text-xl font-normal text-stone-900">
                Mural de Mensagens dos Convidados
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Votos de carinho deixados pelos convidados aquando da confirmação ou envio de presentes.
              </p>
            </div>

            {activeEvent.messages.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                <p className="text-xs">Ainda não foram recebidas mensagens no mural.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeEvent.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 rounded-xl border border-stone-200 bg-[#FAF9F5] space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-xs text-stone-700 italic leading-relaxed">
                        "{msg.message}"
                      </p>
                    </div>
                    <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500">
                      <div>
                        <span className="font-semibold text-stone-900">{msg.guestName}</span>
                        <span className="ml-2">({new Date(msg.createdAt).toLocaleDateString('pt-PT')})</span>
                      </div>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="text-stone-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                        title="Remover mensagem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Partilhar, Portaria & QR Code */}
        {activeTab === 'share' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Share link & WhatsApp card */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="font-serif text-xl font-normal text-stone-900">
                    Partilha Oficial do Convite
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Este link carrega sempre as informações mais recentes e atualizadas deste evento.
                  </p>
                </div>

                {/* Direct link input with actions */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-semibold text-stone-700">
                    Link Direto Sincronizado do Convite
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={publicInviteUrl}
                      className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg font-mono text-stone-700 select-all"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleCopyLink}
                        className="px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={onPreviewPublic}
                        className="px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Navegar diretamente para a tela do convite público"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-800" />
                        <span>Abrir</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Message Template */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mensagem Padrão para Envio por WhatsApp
                  </label>
                  <textarea
                    rows={4}
                    value={whatsappTemplate}
                    onChange={(e) => setWhatsappTemplate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappTemplate)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  Abrir WhatsApp e Enviar aos Convidados
                </a>
              </div>

              {/* QR Code Card */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col justify-between text-center space-y-4">
                <div>
                  <h3 className="font-serif text-xl font-normal text-stone-900">
                    Código QR do Convite
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Imprima em cartões físicos ou envie digitalmente.
                  </p>

                  <div 
                    onClick={() => setIsQrModalOpen(true)}
                    className="my-5 mx-auto w-48 h-48 bg-stone-50 border-2 border-stone-900 rounded-2xl p-4 flex flex-col items-center justify-center shadow-xs cursor-pointer group hover:border-amber-700 transition-colors"
                    title="Clique para testar o QR Code"
                  >
                    <div className="w-36 h-36 bg-white border border-stone-200 rounded-xl flex items-center justify-center p-2 shadow-inner group-hover:scale-105 transition-transform">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=6&data=${encodeURIComponent(publicInviteUrl)}`}
                        alt="Código QR Real do Convite"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  <p className="text-xs font-medium text-stone-800">
                    {activeEvent.celebrants}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Aponte a câmara para abrir diretamente o convite com todos os dados
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    onClick={() => setIsQrModalOpen(true)}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-amber-800 hover:bg-amber-900 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-amber-200" />
                    Simular Leitura
                  </button>
                  <button
                    onClick={onPreviewPublic}
                    className="px-3.5 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-stone-600" />
                    Abrir Convite
                  </button>
                  <button
                    onClick={handleDownloadQrCode}
                    className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-stone-500" />
                    Descarregar PNG
                  </button>
                </div>
              </div>

            </div>

            {/* DEDICATED PORTARIA & RECEPTION LINK CARD */}
            <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-900 text-[10px] font-bold uppercase tracking-wider">
                    Acesso para Porteiros & Seguranças
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-normal text-white">
                  Link Exclusivo da Portaria & Scanner de Check-in
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed font-light">
                  Envie este link para a equipa da portaria. Eles poderão usar a câmara do telemóvel para ler os códigos QR dos convidados, validar nomes e acompanhantes autorizados, e marcar entradas em tempo real.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] text-amber-300/90 bg-stone-950 p-2.5 rounded-lg border border-stone-800 break-all">
                  <span>{portariaUrl}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
                <button
                  onClick={onOpenPortaria}
                  className="px-5 py-3 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <ShieldCheck className="w-4 h-4 text-stone-900" />
                  <span>Abrir Tela da Portaria Agora</span>
                </button>

                <button
                  onClick={handleCopyPortariaLink}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedPortariaLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Link Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-stone-300" />
                      <span>Copiar Link para o Porteiro</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePrintPdfPortaria}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-300 hover:text-white bg-stone-950 hover:bg-stone-800 border border-stone-800 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Imprimir Lista em PDF</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL: EDITAR TOTAL DE LUGARES RESERVADOS */}
      {isSeatsModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif text-xl font-normal text-stone-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-800" />
                Definir Lugares Reservados
              </h3>
              <button
                onClick={() => setIsSeatsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Defina a lotação máxima reservada para o evento. À medida que os convidados confirmarem presença no RSVP (com ou sem acompanhante), as vagas serão descontadas automaticamente.
            </p>

            <form onSubmit={handleSaveTotalSeats} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Número Total de Lugares Reservados (Capacidade)
                </label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  required
                  value={newTotalSeats}
                  onChange={(e) => setNewTotalSeats(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm font-bold text-stone-900 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono tabular-nums"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Atualmente ocupados: {occupiedSeats} lugares ({remainingSeats} vagas restantes com esta alteração).
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSeatsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer shadow-xs"
                >
                  Salvar Capacidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Simulation & Inspection Modal */}
      {isQrModalOpen && (
        <QrCodeModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          inviteUrl={publicInviteUrl}
          celebrants={activeEvent.celebrants}
          onSimulateScan={onPreviewPublic}
        />
      )}

    </div>
  );
};
