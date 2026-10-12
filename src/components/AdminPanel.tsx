import React, { useState } from 'react';
import { EventInvitation, InvitationTemplate, PackagePricing, PackageRequest, User } from '../types';
import { 
  getStoredTemplates, 
  saveStoredTemplates, 
  getStoredPackages, 
  saveStoredPackages, 
  getStoredPackageRequests, 
  saveStoredPackageRequests,
  getStoredEvents 
} from '../services/storage';
import { 
  ShieldCheck, 
  BarChart3, 
  Users, 
  Calendar, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  Database,
  ExternalLink,
  Layers,
  DollarSign,
  PackageCheck,
  Palette,
  Check,
  X,
  Clock,
  Smartphone,
  CreditCard,
  Building2,
  Edit2,
  Trash2,
  Plus,
  Lock,
  Unlock,
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface AdminPanelProps {
  events: EventInvitation[];
  onSelectEvent: (eventId: string) => void;
  onPreviewPublic: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  events,
  onSelectEvent,
  onPreviewPublic,
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'packages' | 'templates' | 'clients' | 'overview'>('requests');
  
  // Storage state
  const [packageRequests, setPackageRequests] = useState<PackageRequest[]>(getStoredPackageRequests());
  const [packages, setPackages] = useState<PackagePricing[]>(getStoredPackages());
  const [templates, setTemplates] = useState<InvitationTemplate[]>(getStoredTemplates());
  
  // Clients state (combined from events and package requests)
  const [clientAccounts, setClientAccounts] = useState<User[]>([
    {
      id: 'usr_jolice',
      name: 'João e Alice',
      email: 'jolice@kieventos.pt',
      username: 'jolice',
      role: 'host',
      plan: 'premium',
      accountStatus: 'ativo',
      phone: '+244 923 888 777',
      eventTitle: 'Casamento de João e Alice (14 Nov 2026)',
    },
    {
      id: 'usr_manuel_sofia',
      name: 'Manuel & Sofia Baptista',
      email: 'manuel.baptista@gmail.com',
      username: 'mbaptista',
      role: 'host',
      plan: 'free',
      accountStatus: 'aguardando_pagamento',
      phone: '+244 923 456 789',
      eventTitle: 'Bodas de Prata dos Baptista',
    },
    {
      id: 'usr_beatriz_costa',
      name: 'Dra. Beatriz Costa & Paulo',
      email: 'beatriz.costa@hotmail.com',
      username: 'bcosta',
      role: 'host',
      plan: 'premium',
      accountStatus: 'ativo',
      phone: '+244 912 345 678',
      eventTitle: 'Cerimónia Civil & Recepção',
    },
    {
      id: 'usr_tiago_daniela',
      name: 'Tiago Mendes & Daniela',
      email: 'tiago.mendes@angola.ao',
      username: 'tmendes',
      role: 'host',
      plan: 'free',
      accountStatus: 'aguardando_pagamento',
      phone: '+244 931 889 900',
      eventTitle: 'Noivado Tiago & Daniela no Talatona',
    },
  ]);

  // Template Editing State
  const [editingTemplate, setEditingTemplate] = useState<InvitationTemplate | null>(null);
  
  // Package Editing State
  const [editingPackage, setEditingPackage] = useState<PackagePricing | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Stats calculation
  const totalEvents = events.length;
  const totalGuests = events.reduce((acc, evt) => acc + evt.guests.length, 0);
  const totalViews = events.reduce((acc, evt) => acc + evt.viewsCount, 0);
  const pendingRequestsCount = packageRequests.filter((r) => r.status === 'pendente').length;
  const totalRevenueKz = packageRequests
    .filter((r) => r.status === 'aprovado')
    .reduce((acc, r) => acc + r.priceKz, 0);

  // 1. Actions on Package Requests
  const handleApproveRequest = (requestId: string) => {
    const updated = packageRequests.map((r) => {
      if (r.id === requestId) {
        return { ...r, status: 'aprovado' as const };
      }
      return r;
    });
    setPackageRequests(updated);
    saveStoredPackageRequests(updated);

    // Also update client status and grant premium access
    const req = packageRequests.find((r) => r.id === requestId);
    if (req) {
      setClientAccounts((prev) =>
        prev.map((c) =>
          c.email.toLowerCase() === req.clientEmail.toLowerCase()
            ? { ...c, accountStatus: 'ativo', plan: 'premium' }
            : c
        )
      );
      showToast(`Pagamento de ${req.clientName} aprovado! Permissões e acesso ao plano libertados.`);
    }
  };

  const handleRejectRequest = (requestId: string) => {
    const updated = packageRequests.map((r) => {
      if (r.id === requestId) {
        return { ...r, status: 'rejeitado' as const };
      }
      return r;
    });
    setPackageRequests(updated);
    saveStoredPackageRequests(updated);
    showToast('Solicitação rejeitada.');
  };

  // 2. Action to toggle Client Permission / Access
  const handleToggleClientAccess = (clientId: string) => {
    setClientAccounts((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const newStatus = c.accountStatus === 'ativo' ? 'aguardando_pagamento' : 'ativo';
          const newPlan = newStatus === 'ativo' ? 'premium' : 'free';
          showToast(newStatus === 'ativo' ? `Acesso Premium libertado para ${c.name}!` : `Acesso restrito para ${c.name}.`);
          return { ...c, accountStatus: newStatus, plan: newPlan };
        }
        return c;
      })
    );
  };

  // 3. Save Edited Template
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    const updated = templates.map((t) => (t.id === editingTemplate.id ? editingTemplate : t));
    setTemplates(updated);
    saveStoredTemplates(updated);
    setEditingTemplate(null);
    showToast(`Modelo "${editingTemplate.name}" atualizado com sucesso!`);
  };

  // 4. Save Edited Package Pricing
  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;

    const updated = packages.map((p) => (p.id === editingPackage.id ? editingPackage : p));
    setPackages(updated);
    saveStoredPackages(updated);
    setEditingPackage(null);
    showToast(`Preço e detalhes do pacote "${editingPackage.name}" atualizados!`);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top duration-200 border border-amber-500/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Super Admin Top Header */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <span className="uppercase tracking-wider font-semibold text-amber-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Super Admin Ki-Eventos
              </span>
              <span aria-hidden="true">·</span>
              <span>Gestão Central da Plataforma</span>
            </div>
            <h1 className="font-serif text-3xl font-normal text-stone-900">
              Painel de Gestão & Controlo Global
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Aprovações de pagamentos de pacotes, tabela de preços em Kz, personalização de modelos e controlo de anfitriões.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 bg-stone-100 px-3.5 py-2 rounded-xl border border-stone-200">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Sincronização: Ativa</span>
            </div>

            <button
              onClick={onPreviewPublic}
              className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-amber-300" />
              <span>Ver Convite de Exemplo</span>
            </button>
          </div>
        </div>

        {/* KPI Strip with Kwanzas (Kz) Revenue */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Faturação Confirmada (Kz)
            </span>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-emerald-800 tabular-nums">
              {totalRevenueKz.toLocaleString('pt-PT')} Kz
            </span>
            <span className="text-[11px] text-stone-400 block mt-0.5">pagamentos validados</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Solicitações Pendentes
            </span>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-800 tabular-nums">
              {pendingRequestsCount}
            </span>
            <span className="text-[11px] text-amber-700 block mt-0.5">aguardam confirmação</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Eventos Ativos
            </span>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">
              {totalEvents}
            </span>
            <span className="text-[11px] text-stone-400 block mt-0.5">na plataforma</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
              Convidados Cadastrados
            </span>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">
              {totalGuests}
            </span>
            <span className="text-[11px] text-stone-400 block mt-0.5">em listas ativas</span>
          </div>
        </div>

        {/* Tab Navigation for Super Admin */}
        <div className="flex border-b border-stone-200 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <PackageCheck className="w-4 h-4 text-amber-700" />
            <span>Solicitações de Pacotes ({packageRequests.length})</span>
            {pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                {pendingRequestsCount} pendentes
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'packages'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <DollarSign className="w-4 h-4 text-amber-700" />
            <span>Tabela de Preços em Kz</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'templates'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Palette className="w-4 h-4 text-amber-700" />
            <span>Editar Modelos & Cores ({templates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'clients'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-4 h-4 text-amber-700" />
            <span>Gestão de Clientes & Acessos ({clientAccounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-700" />
            <span>Eventos Registados ({events.length})</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: SOLICITAÇÕES DE PACOTES E PAGAMENTOS */}
        {/* ========================================================================= */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-xl font-normal text-stone-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-amber-800" />
                  Solicitações de Pacotes & Validação de Pagamento
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Valide os pagamentos por Multicaixa Express, IBAN ou Unitel Money e conceda acesso e permissões imediatas ao cliente.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-600 font-semibold">
                    <th className="py-3 px-4">Cliente & Contacto</th>
                    <th className="py-3 px-4">Evento</th>
                    <th className="py-3 px-4">Pacote Solicitado</th>
                    <th className="py-3 px-4">Valor em Kwanzas</th>
                    <th className="py-3 px-4">Meio de Pagamento</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Ação Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {packageRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-stone-900">
                        <div>{req.clientName}</div>
                        <div className="text-[11px] text-stone-500 font-normal">{req.clientPhone} · {req.clientEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-700">
                        {req.eventTitle}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-stone-900">
                        {req.packageName}
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-stone-900 tabular-nums">
                        {req.priceKz.toLocaleString('pt-PT')} Kz
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        <div className="flex items-center gap-1.5 capitalize font-medium">
                          {req.paymentMethod === 'express' && <Smartphone className="w-3.5 h-3.5 text-amber-700" />}
                          {req.paymentMethod === 'iban' && <Building2 className="w-3.5 h-3.5 text-blue-700" />}
                          {req.paymentMethod === 'unitel_money' && <Smartphone className="w-3.5 h-3.5 text-red-600" />}
                          <span>{req.paymentMethod.replace('_', ' ')}</span>
                        </div>
                        {req.paymentReference && (
                          <div className="text-[10px] text-stone-400 font-mono">Ref: {req.paymentReference}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          req.status === 'aprovado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'pendente'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {req.status === 'aprovado' && <Check className="w-3 h-3" />}
                          {req.status === 'pendente' && <Clock className="w-3 h-3" />}
                          {req.status === 'rejeitado' && <X className="w-3 h-3" />}
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {req.status === 'pendente' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveRequest(req.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                              title="Confirmar pagamento e liberar acesso Premium"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Confirmar & Dar Acesso</span>
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req.id)}
                              className="px-2 py-1.5 text-xs text-stone-500 hover:text-rose-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                              title="Rejeitar solicitação"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : req.status === 'aprovado' ? (
                          <span className="text-emerald-800 text-[11px] font-medium flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Acesso Ativo
                          </span>
                        ) : (
                          <span className="text-rose-600 text-[11px]">Rejeitado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TABELA DE PREÇOS EM KZ & EDIÇÃO */}
        {/* ========================================================================= */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-normal text-stone-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-800" />
                    Tabela de Pacotes & Preços Oficiais em Kwanzas (Kz)
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Configure os valores cobrados em Kz, descrição e recursos de cada plano para anfitriões.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="p-6 rounded-2xl border-2 border-stone-200 bg-stone-50/30 flex flex-col justify-between space-y-4 hover:border-stone-400 transition-colors">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                          {pkg.badge || 'Pacote'}
                        </span>
                        <button
                          onClick={() => setEditingPackage(pkg)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
                          title="Editar Preço e Detalhes"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="font-serif text-xl font-normal text-stone-900 mt-2">
                        {pkg.name}
                      </h4>

                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="font-serif text-3xl font-bold text-stone-900 tabular-nums">
                          {pkg.priceKz.toLocaleString('pt-PT')} Kz
                        </span>
                        <span className="text-xs text-stone-500">/ {pkg.period}</span>
                      </div>

                      <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                        {pkg.description}
                      </p>

                      <div className="mt-4 pt-4 border-t border-stone-200/80 space-y-2 text-xs text-stone-700">
                        {pkg.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingPackage(pkg)}
                      className="w-full py-2.5 text-xs font-semibold text-stone-900 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-stone-600" />
                      <span>Editar Preço em Kz & Conteúdo</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal de Edição de Pacote */}
            {editingPackage && (
              <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <h3 className="font-serif text-xl font-normal text-stone-900">
                      Editar Pacote & Preço: {editingPackage.name}
                    </h3>
                    <button
                      onClick={() => setEditingPackage(null)}
                      className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSavePackage} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Nome do Pacote
                      </label>
                      <input
                        type="text"
                        required
                        value={editingPackage.name}
                        onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Preço em Kwanzas (Kz)
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="1000"
                          value={editingPackage.priceKz}
                          onChange={(e) => setEditingPackage({ ...editingPackage, priceKz: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Período / Cobrança
                        </label>
                        <input
                          type="text"
                          required
                          value={editingPackage.period}
                          onChange={(e) => setEditingPackage({ ...editingPackage, period: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                          placeholder="por evento"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Descrição Breve
                      </label>
                      <textarea
                        rows={2}
                        value={editingPackage.description}
                        onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setEditingPackage(null)}
                        className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer shadow-xs"
                      >
                        Guardar Alterações em Kz
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: EDITAR MODELOS DESENHADOS (CORES, DISPOSIÇÃO, IMAGENS) */}
        {/* ========================================================================= */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
              <div>
                <h3 className="font-serif text-xl font-normal text-stone-900 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-800" />
                  Editar Modelos Desenhados (Cor, Disposição, Imagem & Apresentação)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Personalize a paleta de cores, tipografia, capa, selo de cera e layout de apresentação dos modelos do catálogo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {templates.map((tmpl) => (
                  <div key={tmpl.id} className="p-5 rounded-2xl border border-stone-200 bg-white shadow-xs space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="relative rounded-xl overflow-hidden aspect-video border border-stone-200">
                        <img
                          src={tmpl.previewImage}
                          alt={tmpl.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <span
                            className="w-5 h-5 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: tmpl.theme.primaryColor }}
                            title="Cor Primária"
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: tmpl.theme.envelopeColor }}
                            title="Cor Envelope"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                            {tmpl.category}
                          </span>
                          <span className="text-[10px] text-stone-400 capitalize">
                            Layout: {tmpl.layoutStyle || 'editorial'}
                          </span>
                        </div>
                        <h4 className="font-serif text-lg font-semibold text-stone-900 mt-0.5">
                          {tmpl.name}
                        </h4>
                        <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                          {tmpl.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2 text-[11px] text-stone-600">
                        <div>
                          <span className="text-stone-400 block">Selo de Cera:</span>
                          <span className="font-semibold" style={{ color: tmpl.theme.waxSealColor }}>
                            ● {tmpl.theme.waxSealColor}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 block">Tipografia:</span>
                          <span className="font-semibold capitalize text-stone-800">
                            {tmpl.theme.fontFamily}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingTemplate(tmpl)}
                      className="w-full py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>Editar Cores & Apresentação</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal de Edição de Modelo */}
            {editingTemplate && (
              <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <h3 className="font-serif text-xl font-normal text-stone-900">
                      Editar Modelo: {editingTemplate.name}
                    </h3>
                    <button
                      onClick={() => setEditingTemplate(null)}
                      className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveTemplate} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Nome do Modelo
                      </label>
                      <input
                        type="text"
                        required
                        value={editingTemplate.name}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Imagem de Capa / Amostra (URL)
                      </label>
                      <input
                        type="text"
                        required
                        value={editingTemplate.previewImage}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, previewImage: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Cor Primária
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editingTemplate.theme.primaryColor}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                theme: { ...editingTemplate.theme, primaryColor: e.target.value },
                              })
                            }
                            className="w-8 h-8 rounded border border-stone-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingTemplate.theme.primaryColor}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                theme: { ...editingTemplate.theme, primaryColor: e.target.value },
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs font-mono border border-stone-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Cor do Envelope
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editingTemplate.theme.envelopeColor}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                theme: { ...editingTemplate.theme, envelopeColor: e.target.value },
                              })
                            }
                            className="w-8 h-8 rounded border border-stone-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingTemplate.theme.envelopeColor}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                theme: { ...editingTemplate.theme, envelopeColor: e.target.value },
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs font-mono border border-stone-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Cor do Selo de Cera
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={editingTemplate.theme.waxSealColor}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                theme: { ...editingTemplate.theme, waxSealColor: e.target.value },
                              })
                            }
                            className="w-8 h-8 rounded border border-stone-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingTemplate.theme.waxSealColor}
                            onChange={(e) =>
                              setEditingTemplate({
                                ...editingTemplate,
                                theme: { ...editingTemplate.theme, waxSealColor: e.target.value },
                              })
                            }
                            className="w-full px-2.5 py-1.5 text-xs font-mono border border-stone-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Disposição / Layout
                        </label>
                        <select
                          value={editingTemplate.layoutStyle || 'editorial'}
                          onChange={(e) =>
                            setEditingTemplate({
                              ...editingTemplate,
                              layoutStyle: e.target.value as any,
                            })
                          }
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                        >
                          <option value="editorial">Editorial & Clássico Nobre</option>
                          <option value="modern">Moderno & Minimalista</option>
                          <option value="romantic">Romântico & Caligrafia</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setEditingTemplate(null)}
                        className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer shadow-xs"
                      >
                        Guardar Modelo Atualizado
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: GESTÃO DE CLIENTES & ACESSOS */}
        {/* ========================================================================= */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
            <div>
              <h3 className="font-serif text-xl font-normal text-stone-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-800" />
                Gestão dos Clientes & Permissões
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Controle os acessos aos planos após a confirmação de pagamento dos pacotes.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-600 font-semibold">
                    <th className="py-3 px-4">Cliente / Anfitrião</th>
                    <th className="py-3 px-4">Evento Vinculado</th>
                    <th className="py-3 px-4">Contacto</th>
                    <th className="py-3 px-4">Plano Atual</th>
                    <th className="py-3 px-4 text-center">Status da Conta</th>
                    <th className="py-3 px-4 text-right">Controlo de Permissão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {clientAccounts.map((client) => (
                    <tr key={client.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-stone-900">
                        <div>{client.name}</div>
                        <div className="text-[11px] text-stone-500 font-normal">@{client.username || client.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-700">
                        {client.eventTitle || 'Evento em criação'}
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        <div>{client.phone || '-'}</div>
                        <div className="text-[11px] text-stone-400">{client.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          client.plan === 'premium' || client.plan === 'pro'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          Plano {client.plan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          client.accountStatus === 'ativo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {client.accountStatus === 'ativo' ? (
                            <>
                              <Unlock className="w-3 h-3" />
                              Ativo & Pago
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              Aguardando Pagamento
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleClientAccess(client.id)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ml-auto shadow-xs ${
                            client.accountStatus === 'ativo'
                              ? 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                              : 'bg-emerald-800 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {client.accountStatus === 'ativo' ? (
                            <>
                              <Lock className="w-3.5 h-3.5 text-stone-500" />
                              <span>Restringir Acesso</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5 text-amber-300" />
                              <span>Dar Acesso Premium</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: VISÃO GERAL DE EVENTOS */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-normal text-stone-900">
                Eventos Cadastrados no Sistema
              </h3>
              <span className="text-xs text-stone-500">
                {events.length} registos
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-600 font-semibold">
                    <th className="py-3 px-4">Celebrantes & Título</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Data do Evento</th>
                    <th className="py-3 px-4">Local</th>
                    <th className="py-3 px-4 text-center">Lugares / Lotação</th>
                    <th className="py-3 px-4 text-center">RSVP Confirmados</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {events.map((evt) => {
                    const confirmed = evt.guests.filter((g) => g.status === 'confirmado');
                    const confirmedSeats = confirmed.reduce((acc, g) => acc + g.adultsCount + g.childrenCount, 0);
                    return (
                      <tr key={evt.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-stone-900">
                          <div>{evt.celebrants}</div>
                          <div className="text-[11px] text-stone-500 font-normal">{evt.title}</div>
                        </td>
                        <td className="py-3.5 px-4 capitalize text-stone-600">
                          {evt.category.replace('_', ' ')}
                        </td>
                        <td className="py-3.5 px-4 text-stone-700">
                          {new Date(evt.date).toLocaleDateString('pt-PT')}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                          {evt.venueName}
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-stone-900">
                          {evt.totalSeats || 150} lugares
                        </td>
                        <td className="py-3.5 px-4 text-center tabular-nums font-semibold text-emerald-800">
                          {confirmedSeats} lugares ({confirmed.length} convites)
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onSelectEvent(evt.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                          >
                            Abrir no Painel
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
