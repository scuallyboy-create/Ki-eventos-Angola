import React, { useState } from 'react';
import { EventInvitation, Guest } from '../types';
import { 
  ShieldCheck, 
  QrCode, 
  Search, 
  Check, 
  X, 
  UserCheck, 
  Users, 
  Clock, 
  AlertTriangle, 
  Printer, 
  Download, 
  ArrowLeft, 
  Sparkles,
  Heart,
  Phone,
  Camera,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface PortariaViewProps {
  event: EventInvitation;
  onUpdateEvent: (updated: EventInvitation) => void;
  onClose?: () => void;
}

export const PortariaView: React.FC<PortariaViewProps> = ({
  event,
  onUpdateEvent,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sideFilter, setSideFilter] = useState<'todos' | 'noivo' | 'noiva' | 'amigo' | 'colega' | 'pendentes' | 'entraram'>('todos');
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [scannedGuest, setScannedGuest] = useState<Guest | null>(null);
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Stats calculation
  const totalSeats = event.totalSeats || 150;
  const confirmedGuests = event.guests.filter((g) => g.status === 'confirmado');
  const totalExpectedPeople = confirmedGuests.reduce(
    (acc, g) => acc + g.adultsCount + (g.companionName || g.hasCompanion ? 1 : 0) + g.childrenCount,
    0
  );
  const checkedInGuests = confirmedGuests.filter((g) => g.checkedIn);
  const totalCheckedInPeople = checkedInGuests.reduce(
    (acc, g) => acc + g.adultsCount + (g.companionName || g.hasCompanion ? 1 : 0) + g.childrenCount,
    0
  );
  const remainingPeople = Math.max(0, totalExpectedPeople - totalCheckedInPeople);

  // Quick QR Scan or Code Search Handler
  const handleProcessCode = (codeToSearch: string) => {
    const cleanCode = codeToSearch.trim().toUpperCase();
    if (!cleanCode) return;

    // Search by qrCodePass, or guest ID, or guest name
    const found = event.guests.find(
      (g) =>
        (g.qrCodePass && g.qrCodePass.toUpperCase() === cleanCode) ||
        g.id.toUpperCase() === cleanCode ||
        g.name.toUpperCase().includes(cleanCode)
    );

    if (found) {
      setScannedGuest(found);
      if (found.checkedIn) {
        setScanMessage({
          type: 'warning',
          text: `Atenção: Check-in já havia sido realizado às ${found.checkedInAt || 'hora anterior'}!`,
        });
      } else {
        setScanMessage({
          type: 'success',
          text: 'Bilhete Válido e Aprovado! Pronto para autorizar a entrada.',
        });
      }
    } else {
      setScannedGuest(null);
      setScanMessage({
        type: 'error',
        text: 'Código QR / Convite não encontrado na lista oficial deste evento.',
      });
    }
  };

  const handleManualSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessCode(manualCodeInput);
  };

  // Perform Check-in
  const handleConfirmCheckIn = (guestId: string) => {
    const nowTime = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    const updatedGuests = event.guests.map((g) => {
      if (g.id === guestId) {
        return {
          ...g,
          checkedIn: true,
          checkedInAt: nowTime,
        };
      }
      return g;
    });

    const updatedEvent = { ...event, guests: updatedGuests };
    onUpdateEvent(updatedEvent);

    // Update current scanned state
    if (scannedGuest && scannedGuest.id === guestId) {
      setScannedGuest({ ...scannedGuest, checkedIn: true, checkedInAt: nowTime });
      setScanMessage({
        type: 'success',
        text: `Entrada confirmada com sucesso às ${nowTime}!`,
      });
    }
  };

  // Undo Check-in if needed
  const handleUndoCheckIn = (guestId: string) => {
    const updatedGuests = event.guests.map((g) => {
      if (g.id === guestId) {
        return {
          ...g,
          checkedIn: false,
          checkedInAt: undefined,
        };
      }
      return g;
    });

    const updatedEvent = { ...event, guests: updatedGuests };
    onUpdateEvent(updatedEvent);

    if (scannedGuest && scannedGuest.id === guestId) {
      setScannedGuest({ ...scannedGuest, checkedIn: false, checkedInAt: undefined });
      setScanMessage({
        type: 'warning',
        text: 'Check-in revertido para pendente.',
      });
    }
  };

  // Filtered Guest List for portaria
  const filteredGuests = event.guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.companionName && g.companionName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (g.qrCodePass && g.qrCodePass.toLowerCase().includes(searchTerm.toLowerCase())) ||
      g.phone.includes(searchTerm);

    if (!matchesSearch) return false;

    if (sideFilter === 'pendentes') return g.status === 'confirmado' && !g.checkedIn;
    if (sideFilter === 'entraram') return g.checkedIn;
    if (sideFilter === 'noivo') return g.belongsToSide === 'noivo';
    if (sideFilter === 'noiva') return g.belongsToSide === 'noiva';
    if (sideFilter === 'amigo') return g.belongsToSide === 'amigo';
    if (sideFilter === 'colega') return g.belongsToSide === 'colega';

    return true;
  });

  // Print Official PDF for Portaria
  const handlePrintPdfPortaria = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const rowsHtml = event.guests
      .filter((g) => g.status === 'confirmado')
      .map(
        (g, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
          <td style="padding: 6px 8px; font-weight: bold;">${idx + 1}</td>
          <td style="padding: 6px 8px; font-weight: 600;">
            ${g.name}
            ${g.companionName ? `<br><span style="color:#64748b; font-weight:normal;">+ Acomp: ${g.companionName}</span>` : ''}
          </td>
          <td style="padding: 6px 8px; text-transform: capitalize;">${g.belongsToSide || g.group || 'Geral'}</td>
          <td style="padding: 6px 8px; text-align: center;">${g.adultsCount + (g.companionName || g.hasCompanion ? 1 : 0)}</td>
          <td style="padding: 6px 8px;">${g.tableNumber || '-'}</td>
          <td style="padding: 6px 8px; font-family: monospace;">${g.qrCodePass || 'CVT-' + g.id.slice(-4)}</td>
          <td style="padding: 6px 8px; text-align: center;">
            <div style="width: 14px; height: 14px; border: 1.5px solid #000; margin: 0 auto; display: inline-block;"></div>
          </td>
          <td style="padding: 6px 8px; color: #94a3b8;">___:___</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lista Oficial de Portaria - ${event.celebrants}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #0f172a; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 20px; font-weight: bold; margin: 0; }
          .sub { font-size: 12px; color: #475569; margin: 4px 0 0 0; }
          .kpis { display: flex; justify-content: space-around; background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 8px; margin-bottom: 16px; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #0f172a; color: #fff; padding: 7px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #92400e; margin: 0; font-weight: bold;">Ki-Eventos · Controlo Oficial de Acesso & Portaria</p>
          <h1 class="title">${event.celebrants} — ${event.title}</h1>
          <p class="sub">Data: ${new Date(event.date).toLocaleDateString('pt-PT')} · Local: ${event.venueName}</p>
        </div>
        <div class="kpis">
          <div><strong>Total de Lugares Reservados:</strong> ${totalSeats}</div>
          <div><strong>Convidados Esperados:</strong> ${totalExpectedPeople}</div>
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
              <th>Hora</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 12px;">
          <div>Responsável da Portaria / Segurança: _____________________________________</div>
          <div>Assinatura: _____________________________________</div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans">
      
      {/* Top Security Header */}
      <header className="bg-stone-950 border-b border-stone-800 py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  Portal da Portaria & Segurança
                </span>
                <span className="text-stone-600">·</span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Tempo Real
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-serif text-white font-normal">
                {event.celebrants} · {event.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrintPdfPortaria}
              className="px-3.5 py-2 text-xs font-semibold text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-xl transition-colors flex items-center gap-2 cursor-pointer border border-stone-700"
              title="Exportar ou Imprimir Lista de Convidados em PDF"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Imprimir / PDF da Portaria</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Real-time Attendance KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="bg-stone-950/80 p-4 rounded-2xl border border-stone-800">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Lotação Total Reservada
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-bold text-white tabular-nums">
              {totalSeats}
            </span>
            <span className="text-[11px] text-stone-500 block mt-0.5">lugares contratados</span>
          </div>

          <div className="bg-stone-950/80 p-4 rounded-2xl border border-stone-800">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Confirmados no RSVP
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-bold text-amber-300 tabular-nums">
              {totalExpectedPeople}
            </span>
            <span className="text-[11px] text-stone-500 block mt-0.5">pessoas esperadas</span>
          </div>

          <div className="bg-stone-950/80 p-4 rounded-2xl border border-emerald-900/40 bg-emerald-950/10">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
              Já Entraram (Check-in)
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-bold text-emerald-400 tabular-nums">
              {totalCheckedInPeople}
            </span>
            <span className="text-[11px] text-emerald-500/80 block mt-0.5">
              {totalExpectedPeople > 0 ? Math.round((totalCheckedInPeople / totalExpectedPeople) * 100) : 0}% dos confirmados
            </span>
          </div>

          <div className="bg-stone-950/80 p-4 rounded-2xl border border-stone-800">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Faltam Chegar
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-300 tabular-nums">
              {remainingPeople}
            </span>
            <span className="text-[11px] text-stone-500 block mt-0.5">pessoas a caminho</span>
          </div>
        </div>

        {/* Top Scanner & Quick Check Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: QR Code Scanner & Manual Search */}
          <div className="lg:col-span-5 bg-stone-950 rounded-2xl border border-stone-800 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                Leitor de Código QR & Validador
              </h2>
              <span className="text-[11px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full font-mono">
                Scan Instantâneo
              </span>
            </div>

            {/* Simulated Live Camera Scanner */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-stone-700 bg-stone-900 aspect-video flex flex-col items-center justify-center p-4 text-center group">
              {isCameraActive ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 bg-stone-950/40" />
                  <div className="w-44 h-44 border-2 border-amber-400 rounded-2xl relative animate-pulse flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-300" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-300" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-300" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-300" />
                    <div className="h-0.5 w-full bg-amber-400/80 absolute shadow-[0_0_8px_#f59e0b] animate-bounce" />
                    <span className="text-[11px] text-amber-200 font-medium">Aponte para o QR do Convidado</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-full bg-stone-800 text-amber-400 flex items-center justify-center mx-auto">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Scanner de Câmara Fotográfica</p>
                    <p className="text-[11px] text-stone-400 max-w-xs mt-0.5">
                      Use a câmara do telemóvel para ler os códigos QR apresentados pelos convidados no telemóvel ou passe impresso.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCameraActive(true)}
                    className="px-4 py-2 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer shadow-md"
                  >
                    Ativar Câmara do Telemóvel
                  </button>
                </div>
              )}
            </div>

            {/* Quick Manual Code / Pass Input */}
            <form onSubmit={handleManualSearchSubmit} className="space-y-2">
              <label className="block text-xs font-semibold text-stone-300">
                Inserir Código do Bilhete ou Nome Rápido
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: CVT-JA26-1049 ou Pedro..."
                  value={manualCodeInput}
                  onChange={(e) => setManualCodeInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-xs bg-stone-900 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Validar
                </button>
              </div>
            </form>

            {/* Quick Demo Test Barcodes */}
            <div className="pt-2 border-t border-stone-800/80">
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-1.5">
                Testes Rápidos de Leitura da Portaria:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {event.guests.slice(0, 3).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setManualCodeInput(g.qrCodePass || g.name);
                      handleProcessCode(g.qrCodePass || g.name);
                    }}
                    className="px-2 py-1 text-[11px] bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg text-stone-300 cursor-pointer"
                  >
                    Simular QR: {g.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Scanned Guest Card & Immediate Validation */}
          <div className="lg:col-span-7 bg-stone-950 rounded-2xl border border-stone-800 p-5 sm:p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  Resultado da Validação do Convidado
                </h3>
                {scannedGuest && (
                  <button
                    onClick={() => {
                      setScannedGuest(null);
                      setScanMessage(null);
                      setManualCodeInput('');
                    }}
                    className="text-xs text-stone-400 hover:text-white cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Status Message Banner */}
              {scanMessage && (
                <div className={`mt-4 p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                  scanMessage.type === 'success'
                    ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                    : scanMessage.type === 'warning'
                    ? 'bg-amber-950/30 border-amber-800 text-amber-300'
                    : 'bg-rose-950/30 border-rose-800 text-rose-300'
                }`}>
                  {scanMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                  {scanMessage.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                  {scanMessage.type === 'error' && <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                  <span className="font-medium">{scanMessage.text}</span>
                </div>
              )}

              {scannedGuest ? (
                <div className="mt-4 p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                        Convidado Principal
                      </span>
                      <h4 className="font-serif text-2xl font-bold text-white mt-0.5">
                        {scannedGuest.name}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-stone-400 block">Código Passe:</span>
                      <span className="font-mono text-sm font-bold text-amber-300 bg-stone-950 px-2 py-0.5 rounded border border-stone-700">
                        {scannedGuest.qrCodePass || 'CVT-' + scannedGuest.id.slice(-6)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80">
                      <span className="text-stone-400 text-[10px] uppercase tracking-wider block">Pertence a</span>
                      <span className="font-semibold text-white capitalize mt-0.5 block">
                        {scannedGuest.belongsToSide
                          ? (scannedGuest.belongsToSide === 'noivo' ? 'Família do Noivo' :
                             scannedGuest.belongsToSide === 'noiva' ? 'Família da Noiva' :
                             scannedGuest.belongsToSide === 'amigo' ? 'Amigo(a)' : 'Colega de Trabalho')
                          : scannedGuest.group}
                      </span>
                    </div>

                    <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80">
                      <span className="text-stone-400 text-[10px] uppercase tracking-wider block">Lugares / Pessoas</span>
                      <span className="font-semibold text-amber-300 mt-0.5 block">
                        {scannedGuest.adultsCount} Adulto(s)
                        {scannedGuest.companionName ? ' + 1 Acomp.' : ''}
                        {scannedGuest.childrenCount > 0 ? ` + ${scannedGuest.childrenCount} Cr.` : ''}
                      </span>
                    </div>

                    <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80 col-span-2 sm:col-span-1">
                      <span className="text-stone-400 text-[10px] uppercase tracking-wider block">Mesa Designada</span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {scannedGuest.tableNumber || 'Recepção / Livre'}
                      </span>
                    </div>
                  </div>

                  {/* Companion Details if specified */}
                  {scannedGuest.companionName && (
                    <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-900/40 text-xs">
                      <span className="text-amber-400 font-bold block text-[11px]">Acompanhante Autorizado:</span>
                      <span className="text-stone-100 font-semibold text-sm">{scannedGuest.companionName}</span>
                    </div>
                  )}

                  {/* Dietary notes */}
                  {scannedGuest.dietaryRestrictions && (
                    <div className="p-3 bg-stone-950/50 rounded-xl border border-stone-800 text-xs text-amber-200">
                      <span className="font-bold text-[10px] uppercase tracking-wider block">Alergias / Restrições:</span>
                      <span>{scannedGuest.dietaryRestrictions}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-8 text-center py-10 text-stone-500 space-y-2">
                  <QrCode className="w-12 h-12 text-stone-700 mx-auto" />
                  <p className="text-xs">Aguardando leitura de código QR ou pesquisa de convidado...</p>
                </div>
              )}
            </div>

            {/* Big Action Button */}
            {scannedGuest && (
              <div className="pt-4 border-t border-stone-800">
                {!scannedGuest.checkedIn ? (
                  <button
                    onClick={() => handleConfirmCheckIn(scannedGuest.id)}
                    className="w-full py-3.5 px-4 text-sm font-bold text-stone-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    <span>CONFIRMAR ENTRADA & VALIDAR CHECK-IN</span>
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="flex-1 py-3 px-4 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800 rounded-xl text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Check-in já realizado às {scannedGuest.checkedInAt || '15:30'}</span>
                    </div>
                    <button
                      onClick={() => handleUndoCheckIn(scannedGuest.id)}
                      className="px-4 py-3 text-xs font-semibold text-stone-400 hover:text-rose-400 bg-stone-900 rounded-xl transition-colors cursor-pointer border border-stone-800"
                    >
                      Reverter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Guest Roster & Manual Check-in Table */}
        <div className="bg-stone-950 rounded-2xl border border-stone-800 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Lista Geral de Convidados para Validação Manual
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Caso o convidado não tenha o telemóvel à mão, valide a entrada diretamente pesquisando pelo nome.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou telemóvel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-stone-900 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              onClick={() => setSideFilter('todos')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                sideFilter === 'todos' ? 'bg-amber-400 text-stone-900 font-bold' : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              Todos ({event.guests.length})
            </button>
            <button
              onClick={() => setSideFilter('pendentes')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                sideFilter === 'pendentes' ? 'bg-amber-400 text-stone-900 font-bold' : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              Faltam Entrar ({event.guests.filter((g) => g.status === 'confirmado' && !g.checkedIn).length})
            </button>
            <button
              onClick={() => setSideFilter('entraram')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                sideFilter === 'entraram' ? 'bg-emerald-400 text-stone-900 font-bold' : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              Já Entraram ({event.guests.filter((g) => g.checkedIn).length})
            </button>
            <button
              onClick={() => setSideFilter('noivo')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                sideFilter === 'noivo' ? 'bg-amber-400 text-stone-900 font-bold' : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              Família do Noivo
            </button>
            <button
              onClick={() => setSideFilter('noiva')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                sideFilter === 'noiva' ? 'bg-amber-400 text-stone-900 font-bold' : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              Família da Noiva
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-800 bg-stone-900/60 text-stone-400 font-semibold">
                  <th className="py-3 px-4">Convidado & Acompanhante</th>
                  <th className="py-3 px-4">Pertence a</th>
                  <th className="py-3 px-4 text-center">Lugares</th>
                  <th className="py-3 px-4">Mesa</th>
                  <th className="py-3 px-4">Código Passe</th>
                  <th className="py-3 px-4 text-center">Status Check-in</th>
                  <th className="py-3 px-4 text-right">Ação Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {filteredGuests.map((guest) => {
                  const isChecked = guest.checkedIn;
                  return (
                    <tr key={guest.id} className="hover:bg-stone-900/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">
                        <div>{guest.name}</div>
                        {guest.companionName && (
                          <div className="text-[11px] text-amber-300 font-normal">
                            + Acompanhante: {guest.companionName}
                          </div>
                        )}
                        <div className="text-[10px] text-stone-500 font-mono">{guest.phone}</div>
                      </td>

                      <td className="py-3 px-4 capitalize text-stone-300">
                        {guest.belongsToSide
                          ? (guest.belongsToSide === 'noivo' ? 'Família Noivo' :
                             guest.belongsToSide === 'noiva' ? 'Família Noiva' :
                             guest.belongsToSide === 'amigo' ? 'Amigo' : 'Colega')
                          : guest.group}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-amber-300 tabular-nums">
                        {guest.adultsCount + (guest.companionName || guest.hasCompanion ? 1 : 0) + guest.childrenCount}
                      </td>

                      <td className="py-3 px-4 text-stone-400">
                        {guest.tableNumber || '-'}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-stone-400">
                        {guest.qrCodePass || 'CVT-' + guest.id.slice(-6)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isChecked
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : 'bg-stone-900 text-stone-400 border border-stone-800'
                        }`}>
                          {isChecked ? `Entrou (${guest.checkedInAt || '15:30'})` : 'Aguardando'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!isChecked ? (
                          <button
                            onClick={() => handleConfirmCheckIn(guest.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-stone-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            Dar Entrada
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUndoCheckIn(guest.id)}
                            className="px-2 py-1 text-[11px] text-stone-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                          >
                            Reverter
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};
