import React, { useState } from 'react';
import { Guest, EventInvitation, RsvpStatus } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  Send, 
  Check, 
  X, 
  Clock, 
  MessageSquare, 
  Trash2, 
  Edit3,
  Phone,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Utensils,
  Printer,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface GuestManagerProps {
  event: EventInvitation;
  onUpdateEvent: (updated: EventInvitation) => void;
}

export const GuestManager: React.FC<GuestManagerProps> = ({
  event,
  onUpdateEvent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RsvpStatus | 'todos'>('todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // New Guest Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [group, setGroup] = useState('Família');
  const [belongsToSide, setBelongsToSide] = useState<'noivo' | 'noiva' | 'amigo' | 'colega'>('noivo');
  const [companionName, setCompanionName] = useState('');
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [status, setStatus] = useState<RsvpStatus>('pendente');
  const [dietary, setDietary] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Stats calculation
  const totalGuestsCount = event.guests.length;
  const confirmedGuests = event.guests.filter((g) => g.status === 'confirmado');
  const pendingGuests = event.guests.filter((g) => g.status === 'pendente');
  const declinedGuests = event.guests.filter((g) => g.status === 'recusado');

  const confirmedAdults = confirmedGuests.reduce((acc, g) => acc + g.adultsCount, 0);
  const confirmedChildren = confirmedGuests.reduce((acc, g) => acc + g.childrenCount, 0);
  const dietaryAlertsCount = event.guests.filter((g) => g.dietaryRestrictions && g.dietaryRestrictions !== 'Nenhuma').length;

  // Filtered list
  const filteredGuests = event.guests.filter((g) => {
    const matchesSearch = 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.dietaryRestrictions && g.dietaryRestrictions.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'todos' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setName('');
    setPhone('');
    setEmail('');
    setGroup('Família');
    setBelongsToSide('noivo');
    setCompanionName('');
    setAdultsCount(1);
    setChildrenCount(0);
    setStatus('pendente');
    setDietary('');
    setTableNumber('');
    setNotes('');
    setEditingGuest(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setName(guest.name);
    setPhone(guest.phone);
    setEmail(guest.email || '');
    setGroup(guest.group);
    setBelongsToSide(guest.belongsToSide || 'noivo');
    setCompanionName(guest.companionName || '');
    setAdultsCount(guest.adultsCount);
    setChildrenCount(guest.childrenCount);
    setStatus(guest.status);
    setDietary(guest.dietaryRestrictions || '');
    setTableNumber(guest.tableNumber || '');
    setNotes(guest.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingGuest) {
      // Update
      const updatedGuests = event.guests.map((g) =>
        g.id === editingGuest.id
          ? {
              ...g,
              name,
              phone,
              email: email || undefined,
              group,
              belongsToSide,
              companionName: companionName.trim() || undefined,
              hasCompanion: Boolean(companionName.trim()),
              adultsCount,
              childrenCount,
              status,
              dietaryRestrictions: dietary || undefined,
              tableNumber: tableNumber || undefined,
              notes: notes || undefined,
            }
          : g
      );
      onUpdateEvent({ ...event, guests: updatedGuests });
    } else {
      // Add
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const code = `CVT-JA26-${randomSuffix}`;
      const newGuest: Guest = {
        id: 'gst_' + Date.now(),
        name,
        phone,
        email: email || undefined,
        group,
        belongsToSide,
        companionName: companionName.trim() || undefined,
        hasCompanion: Boolean(companionName.trim()),
        adultsCount,
        childrenCount,
        status,
        dietaryRestrictions: dietary || undefined,
        tableNumber: tableNumber || undefined,
        notes: notes || undefined,
        qrCodePass: code,
        checkedIn: false,
      };
      onUpdateEvent({ ...event, guests: [newGuest, ...event.guests] });
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteGuest = (id: string) => {
    if (confirm('Tem a certeza que deseja remover este convidado da lista?')) {
      const updated = event.guests.filter((g) => g.id !== id);
      onUpdateEvent({ ...event, guests: updated });
    }
  };

  const handleQuickStatusChange = (id: string, newStatus: RsvpStatus) => {
    const updated = event.guests.map((g) => (g.id === id ? { ...g, status: newStatus } : g));
    onUpdateEvent({ ...event, guests: updated });
  };

  // WhatsApp invite dispatch helper
  const handleSendWhatsApp = (guest: Guest) => {
    const inviteUrl = window.location.origin;
    const message = `Olá ${guest.name}! 😊\nCom muito carinho, convidamos para o ${event.title} de ${event.celebrants}.\n\nPode ver todos os detalhes e confirmar a sua presença no link:\n${inviteUrl}\n\nEsperamos muito por si!`;
    const cleanPhone = guest.phone.replace(/[^0-9]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Nome', 'Acompanhante', 'Pertence a', 'Grupo', 'Telefone', 'Status', 'Adultos', 'Criancas', 'Codigo QR', 'Check-in', 'Restricoes Alimentares', 'Mesa', 'Notas'];
    const rows = event.guests.map((g) => [
      `"${g.name}"`,
      `"${g.companionName || '-'}"`,
      `"${g.belongsToSide || '-'}"`,
      `"${g.group}"`,
      `"${g.phone}"`,
      `"${g.status}"`,
      g.adultsCount,
      g.childrenCount,
      `"${g.qrCodePass || '-'}"`,
      `"${g.checkedIn ? 'Sim (' + (g.checkedInAt || '') + ')' : 'Não'}"`,
      `"${g.dietaryRestrictions || 'Nenhuma'}"`,
      `"${g.tableNumber || '-'}"`,
      `"${g.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lista_convidados_${event.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Official PDF for Reception / Portaria
  const handlePrintPdfPortaria = () => {
    const confirmed = event.guests.filter((g) => g.status === 'confirmado');
    const totalPessoas = confirmed.reduce(
      (acc, g) => acc + g.adultsCount + (g.companionName || g.hasCompanion ? 1 : 0) + g.childrenCount,
      0
    );

    const printHtml = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>Lista da Portaria - ${event.celebrants}</title>
  <style>
    @page { size: A4 landscape; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1917; background: #fff; margin: 0; padding: 20px; font-size: 11px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1c1917; padding-bottom: 12px; margin-bottom: 16px; }
    .title { font-size: 22px; font-weight: bold; margin: 0; }
    .subtitle { font-size: 12px; color: #78716c; margin-top: 4px; }
    .badges { display: flex; gap: 12px; margin-top: 10px; }
    .badge { background: #f5f5f4; border: 1px solid #d6d3d1; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #1c1917; color: #fff; text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 7px 10px; border-bottom: 1px solid #e7e5e4; }
    tr:nth-child(even) td { background-color: #fafaf9; }
    .check-box { width: 20px; height: 20px; border: 1.5px solid #a8a29e; border-radius: 4px; display: inline-block; }
    .side-pill { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; }
    .side-noivo { background: #e0f2fe; color: #0369a1; }
    .side-noiva { background: #fce7f3; color: #be185d; }
    .side-amigo { background: #fef3c7; color: #92400e; }
    .side-colega { background: #f3f4f6; color: #374151; }
    .footer { margin-top: 25px; display: flex; justify-content: space-between; font-size: 10px; color: #a8a29e; border-top: 1px solid #e7e5e4; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">LISTA OFICIAL DA PORTARIA & CONTROLO DE ACESSO</h1>
      <div class="subtitle">${event.title} — ${event.celebrants} | Data: ${event.date} às ${event.time}h | Local: ${event.venueName}</div>
      <div class="badges">
        <span class="badge">Capacidade Total: ${event.totalSeats || 150} lugares</span>
        <span class="badge">Convites Confirmados: ${confirmed.length}</span>
        <span class="badge">Total de Pessoas Autorizadas: ${totalPessoas}</span>
      </div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: bold; font-size: 12px; color: #b45309;">KI-EVENTOS PORTARIA</div>
      <div style="font-size: 9px; color: #78716c; margin-top: 4px;">Gerado em ${new Date().toLocaleDateString('pt-PT')}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 35px; text-align: center;">Nº</th>
        <th>Nome do Convidado Titular</th>
        <th>Acompanhante Autorizado</th>
        <th>Pertence a</th>
        <th style="text-align: center;">Lugares</th>
        <th>Telefone / Contacto</th>
        <th>Código QR Pass</th>
        <th>Mesa / Dieta</th>
        <th style="width: 70px; text-align: center;">Entrada</th>
      </tr>
    </thead>
    <tbody>
      ${confirmed.map((g, idx) => `
        <tr>
          <td style="text-align: center; font-weight: bold; color: #78716c;">${idx + 1}</td>
          <td style="font-weight: bold;">${g.name}</td>
          <td style="color: ${g.companionName ? '#000' : '#a8a29e'}; font-style: ${g.companionName ? 'normal' : 'italic'};">
            ${g.companionName || 'Sem acompanhante'}
          </td>
          <td>
            <span class="side-pill side-${g.belongsToSide || 'noivo'}">
              ${g.belongsToSide === 'noivo' ? 'Família Noivo' : g.belongsToSide === 'noiva' ? 'Família Noiva' : g.belongsToSide === 'amigo' ? 'Amigo(a)' : g.belongsToSide === 'colega' ? 'Colega' : g.group}
            </span>
          </td>
          <td style="text-align: center; font-weight: bold;">${g.adultsCount + (g.companionName ? 1 : 0) + g.childrenCount}</td>
          <td style="font-family: monospace;">${g.phone}</td>
          <td style="font-family: monospace; font-weight: bold; color: #b45309;">${g.qrCodePass || 'CVT-PADRAO'}</td>
          <td style="font-size: 10px;">${g.tableNumber ? 'Mesa ' + g.tableNumber : '-'}${g.dietaryRestrictions && g.dietaryRestrictions !== 'Nenhuma' ? ' (' + g.dietaryRestrictions + ')' : ''}</td>
          <td style="text-align: center;">
            ${g.checkedIn ? '<span style="color: green; font-weight: bold;">ENTROU (' + (g.checkedInAt || '') + ')</span>' : '<span class="check-box"></span>'}
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <div>Validação e conferência por: __________________________________________________ (Assinatura do Porteiro / Responsável)</div>
    <div>Ki-Eventos Protocolo · Documento Oficial para Portaria e Segurança</div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>`;

    const printWin = window.open('', '_blank', 'width=1100,height=850');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printHtml);
      printWin.document.close();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block">
            Total Adultos
          </span>
          <span className="font-serif text-2xl font-bold text-stone-900 tabular-nums">
            {confirmedAdults}
          </span>
          <span className="text-[11px] text-stone-400 block mt-0.5">confirmados</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block">
            Crianças
          </span>
          <span className="font-serif text-2xl font-bold text-stone-900 tabular-nums">
            {confirmedChildren}
          </span>
          <span className="text-[11px] text-stone-400 block mt-0.5">menu infantil</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block">
            Aguardam Resposta
          </span>
          <span className="font-serif text-2xl font-bold text-amber-800 tabular-nums">
            {pendingGuests.length}
          </span>
          <span className="text-[11px] text-stone-400 block mt-0.5">convites pendentes</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider block">
            Dietas Especiais
          </span>
          <span className="font-serif text-2xl font-bold text-stone-900 tabular-nums">
            {dietaryAlertsCount}
          </span>
          <span className="text-[11px] text-stone-400 block mt-0.5">alergias / restrições</span>
        </div>
      </div>

      {/* Toolbar: Search, Filters & Export */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por nome, grupo ou dieta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg border border-stone-200 text-xs w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'todos' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Todos ({totalGuestsCount})
            </button>
            <button
              onClick={() => setStatusFilter('confirmado')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'confirmado' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Confirmados ({confirmedGuests.length})
            </button>
            <button
              onClick={() => setStatusFilter('pendente')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'pendente' ? 'bg-white text-amber-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Pendentes ({pendingGuests.length})
            </button>
            <button
              onClick={() => setStatusFilter('recusado')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === 'recusado' ? 'bg-white text-stone-700 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Recusados ({declinedGuests.length})
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={handlePrintPdfPortaria}
            className="px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Exportar documento oficial em PDF para a equipa da portaria"
          >
            <Printer className="w-3.5 h-3.5 text-amber-700" />
            Exportar PDF (Portaria)
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar Convidado
          </button>
        </div>

      </div>

      {/* Guests Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredGuests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-8 h-8 text-stone-300 mx-auto" />
            <h4 className="text-sm font-semibold text-stone-800">
              Nenhum convidado encontrado
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Tente alterar os termos de pesquisa ou adicione novos convidados para começar a gerir presenças.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-2 px-4 py-2 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Adicionar Primeiro Convidado
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-600 font-medium">
                  <th className="py-3 px-4">Nome & Acompanhante</th>
                  <th className="py-3 px-4">Pertence a / Grupo</th>
                  <th className="py-3 px-4">Status RSVP</th>
                  <th className="py-3 px-4 text-center">Lugares</th>
                  <th className="py-3 px-4">Dieta / Alergias</th>
                  <th className="py-3 px-4">Mesa</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-stone-50/60 transition-colors">
                    
                    {/* Name & companion */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{guest.name}</div>
                      {guest.companionName && (
                        <div className="text-[11px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1 border border-amber-200/60 font-medium">
                          <Users className="w-3 h-3 text-amber-700" />
                          <span>Acomp: {guest.companionName}</span>
                        </div>
                      )}
                      <div className="text-[11px] text-stone-500 font-mono mt-0.5">{guest.phone}</div>
                      {guest.qrCodePass && (
                        <div className="text-[10px] text-stone-400 font-mono flex items-center gap-1 mt-0.5">
                          <span className="font-semibold text-stone-500">Passe:</span> {guest.qrCodePass}
                        </div>
                      )}
                      {guest.notes && (
                        <div className="text-[11px] text-stone-500 italic mt-0.5 max-w-xs truncate">
                          "{guest.notes}"
                        </div>
                      )}
                    </td>

                    {/* Group & Side */}
                    <td className="py-3.5 px-4 text-stone-600">
                      <div className="font-medium text-stone-800">{guest.group}</div>
                      {guest.belongsToSide && (
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mt-1 ${
                          guest.belongsToSide === 'noivo' ? 'bg-sky-50 text-sky-800 border border-sky-200' :
                          guest.belongsToSide === 'noiva' ? 'bg-pink-50 text-pink-800 border border-pink-200' :
                          guest.belongsToSide === 'amigo' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}>
                          {guest.belongsToSide === 'noivo' ? 'Família do Noivo' :
                           guest.belongsToSide === 'noiva' ? 'Família da Noiva' :
                           guest.belongsToSide === 'amigo' ? 'Amigo(a)' : 'Colega de Trabalho'}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {guest.status === 'confirmado' && (
                        <div>
                          <span className="text-xs font-medium text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Confirmado
                          </span>
                          {guest.checkedIn && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5 inline-block border border-emerald-200">
                              Entrou na Portaria
                            </span>
                          )}
                        </div>
                      )}
                      {guest.status === 'pendente' && (
                        <span className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-600" />
                          Pendente
                        </span>
                      )}
                      {guest.status === 'recusado' && (
                        <span className="text-xs font-medium text-stone-500 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-stone-400" />
                          Recusado
                        </span>
                      )}
                    </td>

                    {/* Adults / Children count */}
                    <td className="py-3.5 px-4 text-center tabular-nums">
                      <span className="font-semibold text-stone-900">{guest.adultsCount} ad.</span>
                      {guest.childrenCount > 0 && (
                        <span className="text-stone-500 block text-[11px]">+{guest.childrenCount} cr.</span>
                      )}
                    </td>

                    {/* Dietary */}
                    <td className="py-3.5 px-4 text-stone-600">
                      {guest.dietaryRestrictions && guest.dietaryRestrictions !== 'Nenhuma' ? (
                        <span className="text-amber-900 font-medium flex items-center gap-1">
                          <Utensils className="w-3.5 h-3.5 text-amber-700" />
                          {guest.dietaryRestrictions}
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Sem restrições</span>
                      )}
                    </td>

                    {/* Table */}
                    <td className="py-3.5 px-4 text-stone-600">
                      <span>{guest.tableNumber || '-'}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* WhatsApp Invite Launcher */}
                        <button
                          onClick={() => handleSendWhatsApp(guest)}
                          title="Enviar convite por WhatsApp"
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(guest)}
                          title="Editar convidado"
                          className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteGuest(guest.id)}
                          title="Remover convidado"
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Guest Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h3 className="font-serif text-xl font-normal text-stone-900">
                {editingGuest ? 'Editar Convidado' : 'Adicionar Novo Convidado'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGuest} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Nome do Convidado / Família
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Teresa Fonseca & Esposo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Contacto Telefónico (WhatsApp)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+351 912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Pertence a que parte?
                  </label>
                  <select
                    value={belongsToSide}
                    onChange={(e) => setBelongsToSide(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 font-medium"
                  >
                    <option value="noivo">Família do Noivo</option>
                    <option value="noiva">Família da Noiva</option>
                    <option value="amigo">Amigo(a)</option>
                    <option value="colega">Colega de Trabalho</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Nome do Acompanhante (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Maria Fernandes"
                    value={companionName}
                    onChange={(e) => setCompanionName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Grupo / Mesa Padrão
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Família Noiva, Amigos"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Adultos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={adultsCount}
                    onChange={(e) => setAdultsCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Crianças
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RsvpStatus)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="recusado">Recusado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Restrições Alimentares
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Vegetariano, Sem lactose"
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Mesa Atribuída
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mesa 4"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Notas Internas
                </label>
                <textarea
                  rows={2}
                  placeholder="Observações do anfitrião..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                >
                  {editingGuest ? 'Guardar Alterações' : 'Adicionar Convidado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
