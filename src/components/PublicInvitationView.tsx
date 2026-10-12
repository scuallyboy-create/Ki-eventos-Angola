import React, { useState, useEffect } from 'react';
import { EventInvitation, Guest, GiftOption, GiftContribution } from '../types';
import { GiftContributionModal } from './GiftContributionModal';
import { GiftContributorsModal } from './GiftContributorsModal';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Check, 
  Heart, 
  Share2, 
  Gift, 
  MessageSquare, 
  Send, 
  Sparkles, 
  ExternalLink,
  Copy,
  ArrowLeft,
  Download,
  Printer,
  CalendarCheck,
  RotateCcw,
  Image as ImageIcon,
  Church,
  Landmark,
  PlusCircle,
  Smartphone,
  Video,
  Play,
  Film,
  Users,
  QrCode
} from 'lucide-react';

interface PublicInvitationViewProps {
  event: EventInvitation;
  onClose?: () => void;
  onUpdateEvent: (updated: EventInvitation) => void;
  guestId?: string;
}

export const PublicInvitationView: React.FC<PublicInvitationViewProps> = ({
  event,
  onClose,
  onUpdateEvent,
  guestId,
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Gift modals state
  const [selectedGiftForContribute, setSelectedGiftForContribute] = useState<GiftOption | null>(null);
  const [selectedGiftForViewMore, setSelectedGiftForViewMore] = useState<GiftOption | null>(null);

  // RSVP Form State with companion control & side selection
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpSide, setRsvpSide] = useState<'noivo' | 'noiva' | 'amigo' | 'colega'>('noivo');
  const [companionCount, setCompanionCount] = useState<0 | 1>(0); // By default only 1 companion available
  const [companionName, setCompanionName] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpAttending, setRsvpAttending] = useState<'confirmado' | 'recusado'>('confirmado');
  const [dietary, setDietary] = useState('Nenhuma');
  const [customMessage, setCustomMessage] = useState('');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');

  // Countdown State
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(`${event.date}T${event.time}:00`);
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [event.date, event.time]);

  // Realistic envelope opening animation (Quiet & Elegant)
  const handleOpenEnvelope = () => {
    if (isOpening || isOpened) return;
    setIsOpening(true);

    // Envelope flap folds open, letter slides out, then reveal full invite smoothly
    setTimeout(() => {
      setIsOpened(true);
      setIsOpening(false);
    }, 1100);
  };

  const handleReplayEnvelope = () => {
    setIsOpened(false);
    setIsOpening(false);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleContributeToGift = (contribution: GiftContribution, amountToAdd: number) => {
    if (!selectedGiftForContribute) return;

    const updatedGifts = (event.gifts || []).map((g) => {
      if (g.title === selectedGiftForContribute.title) {
        const newCurrent = (g.currentAmount || 0) + amountToAdd;
        const existingContributions = g.contributions || [];
        return {
          ...g,
          currentAmount: newCurrent,
          contributions: [contribution, ...existingContributions],
        };
      }
      return g;
    });

    // Also add to guest mural if contributor left a message
    let updatedMessages = [...event.messages];
    if (contribution.message) {
      updatedMessages = [
        {
          id: 'msg_gift_' + Date.now(),
          guestName: contribution.contributorName,
          message: contribution.message,
          createdAt: new Date().toISOString().split('T')[0],
          approved: true,
        },
        ...updatedMessages,
      ];
    }

    const updatedEvent: EventInvitation = {
      ...event,
      gifts: updatedGifts,
      messages: updatedMessages,
    };

    onUpdateEvent(updatedEvent);

    // Keep current selected modal state in sync
    setSelectedGiftForContribute((prev) => prev ? {
      ...prev,
      currentAmount: (prev.currentAmount || 0) + amountToAdd,
      contributions: [contribution, ...(prev.contributions || [])],
    } : null);
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;

    // Generate unique individual confirmation QR pass code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `CVT-JA26-${randomSuffix}`;
    setConfirmationCode(code);

    const hasCompanion = companionCount === 1 && Boolean(companionName.trim());
    const seatsOccupied = rsvpAttending === 'confirmado' ? (hasCompanion ? 2 : 1) : 0;

    // Save as guest with companion and side details
    const newGuest: Guest = {
      id: 'gst_' + Date.now(),
      name: rsvpName.trim(),
      phone: rsvpPhone.trim() || 'Não informado',
      group: rsvpSide === 'noivo' ? 'Família do Noivo' : rsvpSide === 'noiva' ? 'Família da Noiva' : rsvpSide === 'amigo' ? 'Amigos' : 'Trabalho',
      belongsToSide: rsvpSide,
      companionName: hasCompanion ? companionName.trim() : undefined,
      hasCompanion: hasCompanion,
      adultsCount: seatsOccupied,
      childrenCount: 0,
      status: rsvpAttending,
      dietaryRestrictions: dietary !== 'Nenhuma' ? dietary : undefined,
      notes: customMessage,
      respondedAt: new Date().toISOString().split('T')[0],
      qrCodePass: code,
      checkedIn: false,
    };

    const updatedGuests = [newGuest, ...event.guests.filter((g) => g.name.toLowerCase() !== rsvpName.toLowerCase())];

    let updatedMessages = [...event.messages];
    if (customMessage.trim()) {
      updatedMessages = [
        {
          id: 'msg_' + Date.now(),
          guestName: rsvpName.trim(),
          message: customMessage.trim(),
          createdAt: new Date().toISOString().split('T')[0],
          approved: true,
        },
        ...updatedMessages,
      ];
    }

    const updatedEvent: EventInvitation = {
      ...event,
      guests: updatedGuests,
      messages: updatedMessages,
    };

    onUpdateEvent(updatedEvent);
    setRsvpSubmitted(true);
  };

  // Download printable / digital RSVP confirmation file
  const handleDownloadConfirmationFile = () => {
    const code = confirmationCode || `RSVP-JA26-9281`;
    const formattedEventDate = new Date(`${event.date}T00:00:00`).toLocaleDateString('pt-PT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const passHtml = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <title>Comprovativo de Confirmação RSVP - ${event.celebrants}</title>
  <style>
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: #f5f4ef;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      color: #1c1917;
    }
    .ticket {
      background: #faf9f5;
      max-width: 580px;
      width: 100%;
      border: 2px solid #b48a44;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      position: relative;
    }
    .badge {
      display: inline-block;
      background: #fef3c7;
      color: #92400e;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 4px 12px;
      border-radius: 999px;
      margin-bottom: 16px;
    }
    h1 {
      font-family: Georgia, serif;
      font-size: 32px;
      margin: 0 0 6px 0;
      color: #1c1917;
    }
    .subtitle {
      font-size: 14px;
      color: #78716c;
      margin-bottom: 24px;
    }
    .details-box {
      background: #ffffff;
      border: 1px solid #e7e5e4;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f4;
      font-size: 13px;
    }
    .row:last-child {
      border-bottom: none;
    }
    .label {
      color: #78716c;
    }
    .val {
      font-weight: 600;
      color: #1c1917;
      text-align: right;
    }
    .code-box {
      text-align: center;
      padding: 16px;
      background: #f5f5f4;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .code {
      font-family: monospace;
      font-size: 20px;
      font-weight: bold;
      color: #b48a44;
      letter-spacing: 2px;
    }
    .btn-print {
      display: block;
      width: 100%;
      text-align: center;
      background: #1c1917;
      color: #ffffff;
      text-decoration: none;
      padding: 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }
    @media print {
      body { background: white; padding: 0; }
      .ticket { border-color: #000; box-shadow: none; }
      .btn-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="badge">Passe Oficial de Confirmação RSVP</div>
    <h1>${event.celebrants}</h1>
    <div class="subtitle">${event.title} · Ki-eventos</div>

    <div class="code-box">
      <div style="font-size: 11px; color: #78716c; text-transform: uppercase; margin-bottom: 4px;">Código de Validação</div>
      <div class="code">${code}</div>
    </div>

    <div class="details-box">
      <div class="row">
        <span class="label">Convidado(a)</span>
        <span class="val">${rsvpName}</span>
      </div>
      <div class="row">
        <span class="label">Status</span>
        <span class="val" style="color: #047857;">${rsvpAttending === 'confirmado' ? 'Presença Confirmada' : 'Ausência Registada'}</span>
      </div>
      <div class="row">
        <span class="label">Lugares Reservados</span>
        <span class="val">${adultsCount} Adulto(s) ${childrenCount > 0 ? '+ ' + childrenCount + ' Criança(s)' : ''}</span>
      </div>
      <div class="row">
        <span class="label">Restrições Alimentares</span>
        <span class="val">${dietary}</span>
      </div>
      <div class="row">
        <span class="label">Data & Horário</span>
        <span class="val">${formattedEventDate} às ${event.time}h</span>
      </div>
      <div class="row">
        <span class="label">Local</span>
        <span class="val">${event.venueName}</span>
      </div>
      <div class="row">
        <span class="label">Morada</span>
        <span class="val">${event.venueAddress}</span>
      </div>
    </div>

    <button class="btn-print" onclick="window.print()">Imprimir ou Guardar em PDF</button>
  </div>
</body>
</html>`;

    const blob = new Blob([passHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comprovativo_rsvp_${event.slug || 'evento'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download real .ics calendar file
  const handleDownloadIcsCalendar = () => {
    const dateFormatted = event.date.replace(/-/g, '');
    const timeFormatted = event.time.replace(':', '') + '00';
    const startDateTime = `${dateFormatted}T${timeFormatted}Z`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Ki-eventos//Convite Digital//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:rsvp-${event.slug}-${Date.now()}@kieventos.pt`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startDateTime}`,
      `DTEND:${dateFormatted}T235900Z`,
      `SUMMARY:${event.title} - ${event.celebrants}`,
      `DESCRIPTION:Celebração do ${event.title} de ${event.celebrants}. RSVP confirmado para ${rsvpName}.`,
      `LOCATION:${event.venueName}, ${event.venueAddress}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      `DESCRIPTION:Lembrete: ${event.title} de ${event.celebrants} amanhã!`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evento_${event.slug || 'convite'}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formattedDate = new Date(`${event.date}T00:00:00`).toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#F6F4ED] text-stone-800 flex flex-col items-center justify-start relative select-none">
      
      {/* Top Bar for Back / Admin Navigation */}
      {onClose && (
        <div className="w-full bg-stone-900/90 backdrop-blur-md text-white py-2.5 px-4 sticky top-0 z-50 flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Painel do Anfitrião</span>
          </button>
          
          <div className="flex items-center gap-3">
            {isOpened && (
              <button
                onClick={handleReplayEnvelope}
                className="flex items-center gap-1 text-stone-300 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                <span>Ver Envelope Novamente</span>
              </button>
            )}
            <span className="text-stone-400 hidden sm:inline">Vista do Convidado</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* LUXURY ENVELOPE INTERACTION (Matching Convite_Interativo_Capa_1080x1920) */}
      {/* ========================================================================= */}
      {!isOpened ? (
        <div className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-6 min-h-[92vh]">
          
          {/* Main Envelope Mockup Container */}
          <div className="relative w-full max-w-[430px] aspect-[9/16] max-h-[820px] rounded-3xl overflow-hidden shadow-2xl border border-stone-200/90 bg-[#F7F5EE] flex flex-col justify-between">
            
            {/* Fine Paper Texture Grid Mesh */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
              style={{
                backgroundImage: 'radial-gradient(#a8a29e 0.75px, transparent 0.75px)',
                backgroundSize: '16px 16px'
              }}
            />

            {/* Subtle Diagonal Side Folds of the envelope body */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Left diagonal fold crease */}
              <div 
                className="absolute top-0 left-0 w-full h-full opacity-20"
                style={{
                  background: 'linear-gradient(135deg, transparent 49%, rgba(0,0,0,0.15) 50%, transparent 51%)'
                }}
              />
              {/* Right diagonal fold crease */}
              <div 
                className="absolute top-0 right-0 w-full h-full opacity-20"
                style={{
                  background: 'linear-gradient(225deg, transparent 49%, rgba(0,0,0,0.15) 50%, transparent 51%)'
                }}
              />
            </div>

            {/* Interior letter emerging during opening */}
            <div 
              className={`absolute inset-x-6 top-16 bg-white rounded-xl p-6 shadow-xl border border-stone-200 text-center transition-all duration-700 ease-out z-10 ${
                isOpening ? '-translate-y-24 opacity-100 scale-102' : 'translate-y-12 opacity-0'
              }`}
            >
              <span className="text-[10px] uppercase tracking-widest text-amber-800 font-semibold block">
                {event.subtitle}
              </span>
              <h3 className="font-serif text-2xl text-stone-900 mt-2">
                {event.celebrants}
              </h3>
              <p className="text-xs text-stone-500 mt-1 capitalize">
                {formattedDate} · {event.time}h
              </p>
            </div>

            {/* TOP TRIANGULAR ENVELOPE FLAP */}
            <div 
              className={`absolute inset-x-0 top-0 h-[52%] z-20 transition-all duration-800 origin-top ${
                isOpening ? '[transform:rotateX(170deg)] shadow-xs opacity-60' : ''
              }`}
              style={{
                perspective: '1200px',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Triangular Flap Body */}
              <div 
                className="w-full h-full bg-[#F7F5EE] relative shadow-md"
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  background: 'linear-gradient(180deg, #F9F8F3 0%, #F5F3EC 100%)'
                }}
              >
                {/* Paper crease border */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: 'inset 0 -2px 6px rgba(0,0,0,0.06)'
                  }}
                />
              </div>

              {/* Apex Point with 3D Golden Stud & "Toque para abrir" curved ribbon */}
              <div 
                onClick={handleOpenEnvelope}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex items-center z-30 cursor-pointer group"
                title="Toque para abrir o convite"
              >
                {/* Gleaming Golden Metallic Spherical Pin/Stud */}
                <div className="relative w-8 h-8 rounded-full shadow-lg group-hover:scale-110 active:scale-95 transition-transform duration-300 z-10 flex items-center justify-center">
                  <div 
                    className="w-full h-full rounded-full border border-amber-300/60 shadow-inner"
                    style={{
                      background: 'radial-gradient(circle at 35% 32%, #FFFFFF 0%, #FFF5C0 18%, #EAB308 52%, #B4730A 82%, #451A03 100%)',
                      boxShadow: '0 4px 10px rgba(90, 50, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.9)'
                    }}
                  />
                  {/* Specular highlight glint */}
                  <div className="absolute top-1.5 left-2 w-2 h-1.5 bg-white/90 rounded-full blur-[0.5px]" />
                </div>

                {/* Curved Fine Paper Tab with "Toque para abrir" */}
                <div 
                  className="relative -ml-3 pl-5 pr-6 py-2.5 bg-[#FAF8F2] rounded-r-full shadow-md border-y border-r border-stone-200/80 group-hover:translate-x-1 transition-all duration-300"
                  style={{
                    filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.06))'
                  }}
                >
                  <span className="font-serif italic text-stone-700 text-sm sm:text-base tracking-wide font-normal select-none whitespace-nowrap">
                    Toque para abrir
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Half of the Envelope Body */}
            <div className="h-full flex flex-col justify-end p-8 text-center pointer-events-none">
              <div className="mb-8">
                <span className="text-[11px] uppercase tracking-widest text-stone-500 block mb-1">
                  Convite Digital
                </span>
                <h2 className="font-serif text-3xl font-normal text-stone-900 tracking-tight">
                  {event.celebrants}
                </h2>
                <p className="text-xs text-stone-500 mt-1 capitalize">
                  {formattedDate}
                </p>
              </div>

              <div className="text-[11px] text-stone-400">
                Toque no botão dourado para desdobrar
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* ========================================================================= */
        /* UNFOLDED INTERACTIVE DIGITAL INVITATION VIEW */
        /* ========================================================================= */
        <div className="w-full max-w-2xl mx-auto my-6 sm:my-10 bg-[#FAF9F5] rounded-2xl shadow-2xl border border-stone-200 overflow-hidden transition-all duration-700 animate-fadeIn">
          
          {/* Hero Banner / Cover Image with user-configured zoom, position and aspect ratio */}
          <div 
            className={`relative w-full ${
              event.coverImageSettings?.aspectRatio === '21/9'
                ? 'aspect-[21/9]'
                : event.coverImageSettings?.aspectRatio === '4/3'
                ? 'aspect-[4/3]'
                : event.coverImageSettings?.aspectRatio === '16/10'
                ? 'aspect-[16/10]'
                : 'aspect-[16/9]'
            } bg-stone-900 overflow-hidden`}
          >
            <img
              src={event.coverImage}
              alt={event.celebrants}
              referrerPolicy="no-referrer"
              style={{
                transform: `scale(${event.coverImageSettings?.zoom || 1})`,
                transformOrigin: `${event.coverImageSettings?.positionX ?? 50}% ${event.coverImageSettings?.positionY ?? 50}%`,
                objectPosition: `${event.coverImageSettings?.positionX ?? 50}% ${event.coverImageSettings?.positionY ?? 50}%`,
              }}
              className="w-full h-full object-cover opacity-90 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent flex flex-col justify-end p-8 text-white text-center">
              <span className="text-xs uppercase tracking-widest text-amber-300 font-medium mb-1">
                {event.subtitle}
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-white">
                {event.celebrants}
              </h1>
              <p className="text-xs text-stone-200 mt-2 font-light capitalize">
                {formattedDate} · {event.time}h
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-12">
            
            {/* Countdown Clock */}
            {event.showCountdown && (
              <div className="text-center bg-[#F3EFE6] rounded-xl p-6 border border-stone-200">
                <span className="text-xs uppercase tracking-widest text-stone-600 font-semibold">
                  Contagem Decrescente
                </span>
                <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-sm mx-auto mt-4">
                  <div className="bg-white rounded-lg p-2.5 shadow-xs border border-stone-200/80">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">
                      {timeLeft.days}
                    </span>
                    <span className="block text-[10px] uppercase text-stone-500 mt-0.5">Dias</span>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 shadow-xs border border-stone-200/80">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">
                      {timeLeft.hours}
                    </span>
                    <span className="block text-[10px] uppercase text-stone-500 mt-0.5">Horas</span>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 shadow-xs border border-stone-200/80">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">
                      {timeLeft.minutes}
                    </span>
                    <span className="block text-[10px] uppercase text-stone-500 mt-0.5">Minutos</span>
                  </div>
                  <div className="bg-white rounded-lg p-2.5 shadow-xs border border-stone-200/80">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tabular-nums">
                      {timeLeft.seconds}
                    </span>
                    <span className="block text-[10px] uppercase text-stone-500 mt-0.5">Segundos</span>
                  </div>
                </div>
              </div>
            )}

            {/* Couple's Note / Welcome Message */}
            <div className="text-center max-w-lg mx-auto space-y-4">
              <div className="w-12 h-0.5 bg-amber-700/40 mx-auto" />
              <p className="font-serif text-lg sm:text-xl text-stone-800 leading-relaxed italic">
                "{event.description}"
              </p>
              <div className="w-12 h-0.5 bg-amber-700/40 mx-auto" />
            </div>

            {/* ========================================================================= */}
            {/* MOMENTOS ESPECIAIS · A NOSSA HISTÓRIA (FOTOS E VÍDEOS CURTOS) */}
            {/* ========================================================================= */}
            {((event.ourStoryMoments && event.ourStoryMoments.length > 0) || (event.galleryImages && event.galleryImages.length > 0)) && (
              <div className="space-y-6 pt-2">
                <div className="text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-[11px] font-semibold border border-amber-200/80 mb-2">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>Momentos Especiais</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                    {event.ourStoryTitle || 'A Nossa História'}
                  </h3>
                  {event.ourStoryDescription && (
                    <p className="text-xs text-stone-600 max-w-md mx-auto mt-1 leading-relaxed">
                      {event.ourStoryDescription}
                    </p>
                  )}
                </div>

                {/* Our Story Moments (Cards with Photos & Short Videos) */}
                {event.ourStoryMoments && event.ourStoryMoments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.ourStoryMoments.map((moment) => (
                      <div
                        key={moment.id}
                        className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                      >
                        <div>
                          {moment.mediaType === 'video' ? (
                            <div className="relative aspect-video bg-black rounded-t-2xl overflow-hidden group">
                              <video
                                src={moment.mediaUrl}
                                poster={moment.thumbnailUrl}
                                controls
                                preload="metadata"
                                playsInline
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 pointer-events-none">
                                <Video className="w-3 h-3 text-amber-300" />
                                <span>Vídeo Curto</span>
                              </div>
                            </div>
                          ) : (
                            <div className="relative aspect-video overflow-hidden rounded-t-2xl">
                              <img
                                src={moment.mediaUrl}
                                alt={moment.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <ImageIcon className="w-3 h-3 text-amber-300" />
                                <span>Fotografia</span>
                              </div>
                            </div>
                          )}

                          <div className="p-4 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-serif font-bold text-stone-900 text-sm">
                                {moment.title}
                              </span>
                              {moment.dateOrYear && (
                                <span className="font-mono text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                                  {moment.dateOrYear}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-600 leading-relaxed font-light">
                              {moment.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Additional Gallery Strip */}
                {event.galleryImages && event.galleryImages.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2 text-center">
                      Mais Registos & Fotografias do Casal
                    </span>
                    <div className="grid grid-cols-3 gap-2.5">
                      {event.galleryImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="aspect-square rounded-xl overflow-hidden border border-stone-200 shadow-xs group"
                        >
                          <img
                            src={img}
                            alt={`Momento ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* LOCAIS DO EVENTO: 1. CERIMÓNIA CIVIL -> 2. IGREJA -> 3. CELEBRAÇÃO */}
            {/* ========================================================================= */}
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
                  Itinerário & Locais do Evento
                </span>
                <h3 className="font-serif text-2xl font-normal text-stone-900 mt-1">
                  Onde Estaremos a Celebrar
                </h3>
              </div>

              {/* 1. LOCAL DA CERIMÓNIA CIVIL (SE CONFIGURADO) */}
              {(event.hasCivilCeremony || event.civilVenueName) && (
                <div className="border border-stone-200 rounded-2xl p-6 sm:p-7 bg-white text-center space-y-3.5 shadow-xs">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-[11px] font-semibold border border-amber-200/80">
                    <Landmark className="w-3.5 h-3.5 text-amber-800" />
                    <span>1º Momento · Cerimónia Civil</span>
                  </div>

                  <div>
                    <h4 className="font-serif text-xl sm:text-2xl font-normal text-stone-900">
                      {event.civilVenueName || 'Registo Civil & Solenidade'}
                    </h4>
                    {event.civilTime && (
                      <p className="text-xs font-semibold text-amber-800 font-mono mt-1">
                        Horário: {event.civilTime}h
                      </p>
                    )}
                    {event.civilVenueAddress && (
                      <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto">
                        {event.civilVenueAddress}
                      </p>
                    )}
                  </div>

                  <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5">
                    <a
                      href={event.civilMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(event.civilVenueName + ' ' + (event.civilVenueAddress || ''))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-amber-300" />
                      Ver no Google Maps
                      <ExternalLink className="w-3 h-3 text-stone-400" />
                    </a>
                    {event.civilVenueAddress && (
                      <a
                        href={`https://waze.com/ul?q=${encodeURIComponent(event.civilVenueAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        Navegar com Waze
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* 2. LOCAL DA IGREJA / CERIMÓNIA RELIGIOSA (SE CONFIGURADO) */}
              {(event.hasChurchCeremony || event.churchVenueName) && (
                <div className="border border-stone-200 rounded-2xl p-6 sm:p-7 bg-white text-center space-y-3.5 shadow-xs">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-[11px] font-semibold border border-amber-200/80">
                    <Church className="w-3.5 h-3.5 text-amber-800" />
                    <span>2º Momento · Cerimónia Religiosa na Igreja</span>
                  </div>

                  <div>
                    <h4 className="font-serif text-xl sm:text-2xl font-normal text-stone-900">
                      {event.churchVenueName || 'Igreja Paroquial'}
                    </h4>
                    {event.churchTime && (
                      <p className="text-xs font-semibold text-amber-800 font-mono mt-1">
                        Missa & Votos: {event.churchTime}h
                      </p>
                    )}
                    {event.churchVenueAddress && (
                      <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto">
                        {event.churchVenueAddress}
                      </p>
                    )}
                  </div>

                  <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5">
                    <a
                      href={event.churchMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(event.churchVenueName + ' ' + (event.churchVenueAddress || ''))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-amber-300" />
                      Ver no Google Maps
                      <ExternalLink className="w-3 h-3 text-stone-400" />
                    </a>
                    {event.churchVenueAddress && (
                      <a
                        href={`https://waze.com/ul?q=${encodeURIComponent(event.churchVenueAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        Navegar com Waze
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* 3. LOCAL DA CELEBRAÇÃO / FESTA (QUINTA & COPO D'ÁGUA) */}
              <div className="border-2 border-stone-300 rounded-2xl p-6 sm:p-8 bg-white text-center space-y-4 shadow-sm">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 text-amber-300 text-[11px] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Copo d'Água & Grande Celebração</span>
                </div>

                <div>
                  <h4 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
                    {event.venueName}
                  </h4>
                  <p className="text-xs font-semibold text-stone-600 font-mono mt-1">
                    Recepção & Festa: {event.time}h
                  </p>
                  <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto">
                    {event.venueAddress}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={event.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-300" />
                    Abrir no Google Maps
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                  </a>
                  <a
                    href={`https://waze.com/ul?q=${encodeURIComponent(event.venueAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-2"
                  >
                    Navegar com Waze
                  </a>
                </div>

                {/* Direct Interactive Google Maps Frame */}
                <div className="mt-4 rounded-xl overflow-hidden border border-stone-200 shadow-inner h-52 bg-stone-100 relative">
                  <iframe
                    title="Mapa de Localização da Celebração"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      event.venueName + ' ' + event.venueAddress
                    )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Schedule of the Day / Agenda */}
            {event.agenda && event.agenda.length > 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
                    Programa do Dia
                  </span>
                  <h3 className="font-serif text-2xl font-normal text-stone-900 mt-1">
                    Cronograma dos Momentos
                  </h3>
                </div>

                <div className="relative pl-6 sm:pl-8 border-l border-stone-300 space-y-6 max-w-lg mx-auto">
                  {event.agenda.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full bg-white border-2 border-stone-800 group-hover:scale-125 transition-transform" />
                      <div>
                        <span className="text-xs font-bold text-amber-800 font-mono tracking-wider">
                          {item.time}
                        </span>
                        <h4 className="text-sm font-semibold text-stone-900 mt-0.5">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dress Code */}
            {event.dressCode && (
              <div className="bg-[#F8F5EE] rounded-xl p-6 border border-stone-200 text-center space-y-2">
                <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
                  Código de Vestuário
                </span>
                <h4 className="font-serif text-xl font-normal text-stone-900">
                  {event.dressCode}
                </h4>
                {event.dressCodeDetails && (
                  <p className="text-xs text-stone-600 max-w-md mx-auto">
                    {event.dressCodeDetails}
                  </p>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* INTERACTIVE RSVP FORM & POST-CONFIRMATION PASS GENERATOR */}
            {/* ========================================================================= */}
            <div id="rsvp-section" className="bg-white rounded-2xl border-2 border-amber-900/20 p-6 sm:p-8 shadow-md">
              <div className="text-center max-w-md mx-auto mb-6">
                <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold">
                  Confirmação de Presença
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 mt-1">
                  RSVP · Estará presente?
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Por favor confirme até ao dia {new Date(event.rsvpDeadline).toLocaleDateString('pt-PT')}
                </p>
              </div>

              {rsvpSubmitted ? (
                /* LUXURY CONFIRMATION CARD & PASS FILE GENERATOR */
                <div className="bg-[#FAF9F5] border border-amber-300 rounded-xl p-6 text-center space-y-5">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest block mb-1">
                      Confirmação Concluída com Sucesso
                    </span>
                    <h4 className="font-serif text-2xl font-normal text-stone-900">
                      Obrigado, {rsvpName}!
                    </h4>
                    <p className="text-xs text-stone-600 max-w-sm mx-auto mt-1 leading-relaxed">
                      A sua resposta foi registada na lista oficial de convidados de {event.celebrants}.
                    </p>
                  </div>

                  {/* Digital Pass Voucher Box with Scannable QR Code */}
                  <div className="bg-white rounded-2xl p-5 border-2 border-amber-300 text-left space-y-3.5 text-xs shadow-sm max-w-md mx-auto">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                      <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-amber-800" />
                        Passe Digital de Acesso à Portaria
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
                        {confirmationCode}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Scannable Pass QR Code */}
                      <div className="w-28 h-28 bg-stone-50 border-2 border-stone-900 rounded-xl p-1.5 flex flex-col items-center justify-center shrink-0">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(confirmationCode)}`}
                          alt="Código QR de Portaria"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 w-full space-y-1.5 text-[11px]">
                        <div>
                          <span className="text-stone-400 block">Convidado Principal:</span>
                          <span className="font-semibold text-stone-900 text-xs">{rsvpName}</span>
                        </div>

                        {companionCount === 1 && companionName && (
                          <div>
                            <span className="text-amber-800 font-medium block">Acompanhante:</span>
                            <span className="font-semibold text-stone-900">{companionName}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
                          <div>
                            <span className="text-stone-400 block">Pertence a:</span>
                            <span className="font-semibold text-stone-800 capitalize">
                              {rsvpSide === 'noivo' ? 'Família Noivo' : rsvpSide === 'noiva' ? 'Família Noiva' : rsvpSide === 'amigo' ? 'Amigo' : 'Colega'}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 block">Lugares Reservados:</span>
                            <span className="font-semibold text-stone-800">
                              {companionCount === 1 ? '2 Lugares' : '1 Lugar'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-[10px] text-amber-900 text-center font-medium">
                      Apresente este código QR na portaria na chegada à {event.venueName}.
                    </div>
                  </div>

                  {/* FILE GENERATION & DOWNLOAD ACTIONS */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                    <button
                      onClick={handleDownloadConfirmationFile}
                      className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-300" />
                      <span>Descarregar Bilhete Digital (Portaria)</span>
                    </button>

                    <button
                      onClick={handleDownloadIcsCalendar}
                      className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-50 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Guardar no Calendário (.ics)</span>
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setRsvpSubmitted(false)}
                      className="text-[11px] text-stone-500 underline hover:text-stone-800 cursor-pointer"
                    >
                      Alterar a minha resposta
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="space-y-4 max-w-md mx-auto">
                  
                  {/* Attendance choice */}
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                        rsvpAttending === 'confirmado'
                          ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rsvpAttending"
                        value="confirmado"
                        checked={rsvpAttending === 'confirmado'}
                        onChange={() => setRsvpAttending('confirmado')}
                        className="sr-only"
                      />
                      <span className="text-xs font-semibold block">Sim, estarei presente!</span>
                      <span className="text-[10px] block opacity-80 mt-0.5">Com certeza</span>
                    </label>

                    <label
                      className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                        rsvpAttending === 'recusado'
                          ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rsvpAttending"
                        value="recusado"
                        checked={rsvpAttending === 'recusado'}
                        onChange={() => setRsvpAttending('recusado')}
                        className="sr-only"
                      />
                      <span className="text-xs font-semibold block">Não poderei ir</span>
                      <span className="text-[10px] block opacity-80 mt-0.5">Com muita pena</span>
                    </label>
                  </div>

                  {/* Nome do Convidado */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      O seu Nome Completo
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Pedro Silva"
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>

                  {/* Pertence a que parte? */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Pertence a que parte?
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 'noivo', label: 'Família do Noivo' },
                        { id: 'noiva', label: 'Família da Noiva' },
                        { id: 'amigo', label: 'Amigo(a)' },
                        { id: 'colega', label: 'Colega de Trabalho' },
                      ].map((side) => (
                        <button
                          key={side.id}
                          type="button"
                          onClick={() => setRsvpSide(side.id as any)}
                          className={`py-2 px-3 rounded-lg border text-xs font-medium text-left transition-all cursor-pointer ${
                            rsvpSide === side.id
                              ? 'bg-stone-900 text-white border-stone-900 font-semibold shadow-xs'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          {side.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Número de Acompanhantes (Por defeito apenas 1 disponível) */}
                  {rsvpAttending === 'confirmado' && (
                    <div className="space-y-3 pt-1">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-stone-700">
                            Número de Acompanhantes
                          </label>
                          <span className="text-[10px] text-stone-400">
                            (Máximo 1 acompanhante por convite)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setCompanionCount(0)}
                            className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer text-center ${
                              companionCount === 0
                                ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                            }`}
                          >
                            0 (Vou sozinho)
                          </button>
                          <button
                            type="button"
                            onClick={() => setCompanionCount(1)}
                            className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all cursor-pointer text-center ${
                              companionCount === 1
                                ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                            }`}
                          >
                            1 Acompanhante
                          </button>
                        </div>
                      </div>

                      {/* Campo para o Nome do Acompanhante (Abre quando selecionado 1) */}
                      {companionCount === 1 && (
                        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 animate-in fade-in slide-in-from-top duration-200">
                          <label className="block text-xs font-semibold text-amber-950">
                            Nome Completo do Acompanhante *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Maria Fernandes"
                            value={companionName}
                            onChange={(e) => setCompanionName(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                          />
                          <p className="text-[10px] text-amber-800 leading-tight">
                            O nome do seu acompanhante será associado ao seu código QR e ficará disponível na portaria.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contacto WhatsApp */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Contacto WhatsApp / Telemóvel
                    </label>
                    <input
                      type="tel"
                      placeholder="Ex: +244 923 888 777 ou +351 912 345 678"
                      value={rsvpPhone}
                      onChange={(e) => setRsvpPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>

                  {rsvpAttending === 'confirmado' && (
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Restrições Alimentares / Alergias
                      </label>
                      <select
                        value={dietary}
                        onChange={(e) => setDietary(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                      >
                        <option value="Nenhuma">Nenhuma restrição alimentar</option>
                        <option value="Vegetariano">Vegetariano</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Sem Glúten (Celíaco)">Sem Glúten (Celíaco)</option>
                        <option value="Intolerante a Lactose">Intolerante a Lactose</option>
                        <option value="Alergia a Marisco / Frutos Secos">Alergia a Marisco / Frutos Secos</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Mensagem de Felicitações para os Anfitriões
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Deixe uma mensagem que ficará registada no mural do evento..."
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-300" />
                    <span>Confirmar Presença & Gerar Passe com QR Code</span>
                  </button>
                </form>
              )}
            </div>

            {/* ========================================================================= */}
            {/* LISTA DE PRESENTES: METAS COM PROGRESSO, MINIATURAS & MEIOS LOCAIS */}
            {/* ========================================================================= */}
            {event.gifts && event.gifts.length > 0 && (
              <div className="bg-[#FAF8F5] rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-800 flex items-center justify-center mx-auto mb-2">
                    <Gift className="w-5 h-5" />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
                    Lista de Presentes & Contribuições
                  </span>
                  <h3 className="font-serif text-2xl font-normal text-stone-900 mt-1">
                    A Vossa Presença é o Maior Presente
                  </h3>
                  <p className="text-xs text-stone-600 max-w-md mx-auto mt-1">
                    Se desejarem mimar-nos com uma lembrança ou contributo para a nossa nova etapa, deixamos as seguintes opções:
                  </p>
                </div>

                <div className="space-y-4 max-w-xl mx-auto">
                  {event.gifts.map((gift, idx) => {
                    const isGoal = gift.type === 'crowdfunding' || typeof gift.targetAmount === 'number';
                    const target = gift.targetAmount || 0;
                    const current = gift.currentAmount || 0;
                    const remaining = Math.max(0, target - current);
                    const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                    const currency = gift.currency || 'Kz';
                    const contributions = gift.contributions || [];
                    const top3 = contributions.slice(0, 3);
                    const remainingCount = contributions.length - 3;

                    if (isGoal) {
                      return (
                        <div
                          key={idx}
                          className="bg-white border-2 border-amber-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 hover:border-amber-300 transition-all"
                        >
                          {/* Title & Goal Meta */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                            <div>
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-1">
                                <Sparkles className="w-3 h-3 text-amber-700" />
                                <span>Presente Coletivo dos Noivos</span>
                              </div>
                              <h4 className="font-serif text-xl sm:text-2xl font-normal text-stone-900">
                                {gift.title}
                              </h4>
                              {gift.details && (
                                <p className="text-xs text-stone-500 mt-0.5">
                                  {gift.details}
                                </p>
                              )}
                            </div>

                            <div className="text-left sm:text-right shrink-0">
                              <span className="text-[10px] uppercase text-stone-400 font-semibold block">
                                Meta Total
                              </span>
                              <span className="font-serif text-xl font-bold text-stone-900 font-mono">
                                {new Intl.NumberFormat('pt-PT').format(target)} {currency}
                              </span>
                            </div>
                          </div>

                          {/* Live Progress Bar & Automatic Deduction Calculation */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <div>
                                <span className="text-stone-500 text-[11px]">Arrecadado: </span>
                                <span className="font-bold text-emerald-800 font-mono">
                                  {new Intl.NumberFormat('pt-PT').format(current)} {currency}
                                </span>
                                <span className="text-[11px] text-stone-400 ml-1">({percent}%)</span>
                              </div>
                              <div>
                                <span className="text-stone-500 text-[11px]">Falta apenas: </span>
                                <span className="font-bold text-amber-900 font-mono">
                                  {new Intl.NumberFormat('pt-PT').format(remaining)} {currency}
                                </span>
                              </div>
                            </div>

                            {/* Gradient Golden Progress Bar */}
                            <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden p-0.5 border border-stone-200">
                              <div
                                className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 rounded-full transition-all duration-700 shadow-xs"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>

                          {/* 3 MINIATURAS COM O ROSTO DE QUEM CONTRIBUIU E DEIXOU UMA MENSAGEM + RETICÊNCIAS (...) + VER MAIS */}
                          {contributions.length > 0 && (
                            <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                {/* Avatar Stack (3 miniaturas) */}
                                <div className="flex items-center -space-x-2.5">
                                  {top3.map((cnt, cIdx) => (
                                    <div
                                      key={cnt.id || cIdx}
                                      className="relative group"
                                      title={`${cnt.contributorName}: "${cnt.message || 'Muitas felicidades!'}"`}
                                    >
                                      {cnt.contributorAvatar ? (
                                        <img
                                          src={cnt.contributorAvatar}
                                          alt={cnt.contributorName}
                                          className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-xs"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-amber-200 border-2 border-white text-amber-900 font-bold text-[10px] flex items-center justify-center shadow-xs">
                                          {cnt.contributorName.slice(0, 2).toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>

                                {/* Reticências (...) e nome resumido */}
                                <div className="text-xs text-stone-600">
                                  <span className="font-medium text-stone-800">
                                    {top3[0]?.contributorName.split(' ')[0]}
                                    {top3.length > 1 ? `, ${top3[1]?.contributorName.split(' ')[0]}` : ''}
                                  </span>
                                  {remainingCount > 0 ? (
                                    <span> e mais {remainingCount} contribuíram...</span>
                                  ) : (
                                    <span> já contribuíram...</span>
                                  )}
                                </div>
                              </div>

                              {/* Botão Ver Mais para abrir modal com todas as mensagens */}
                              <button
                                type="button"
                                onClick={() => setSelectedGiftForViewMore(gift)}
                                className="text-xs font-semibold text-amber-800 hover:text-amber-900 underline underline-offset-2 cursor-pointer flex items-center gap-1"
                              >
                                <span>Ver mais ({contributions.length} mensagens)</span>
                              </button>
                            </div>
                          )}

                          {/* Botão Principal para Contribuir com este Presente */}
                          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60">
                            <div className="text-xs text-stone-600">
                              <span className="font-semibold text-stone-900 block">
                                Deseja ajudar os noivos nesta meta?
                              </span>
                              <span className="text-[11px] text-stone-500">
                                Pagamento via Multicaixa Express, IBAN ou Unitel Money.
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedGiftForContribute(gift)}
                              className="py-2.5 px-4 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
                            >
                              <PlusCircle className="w-4 h-4 text-amber-300" />
                              <span>Contribuir com este Presente</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // Traditional Account Card (MB Way, IBAN)
                    return (
                      <div
                        key={idx}
                        className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-amber-900 uppercase">
                            {gift.title}
                          </span>
                          {gift.holderName && (
                            <p className="text-xs text-stone-500">
                              Titular: {gift.holderName}
                            </p>
                          )}
                          <p className="font-mono text-xs font-semibold text-stone-800 break-all">
                            {gift.details}
                          </p>
                        </div>

                        <button
                          onClick={() => handleCopy(gift.details, `gift_${idx}`)}
                          className="py-2 px-3.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        >
                          {copiedKey === `gift_${idx}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copiado com Sucesso!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-stone-500" />
                              <span>Copiar Dados</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Guestbook Mural of Messages */}
            {event.showGuestbook && event.messages && event.messages.length > 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
                    Mural de Carinho
                  </span>
                  <h3 className="font-serif text-2xl font-normal text-stone-900 mt-1">
                    Mensagens dos Convidados
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.messages.slice(0, 6).map((msg) => (
                    <div key={msg.id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
                      <p className="text-xs text-stone-700 italic font-serif leading-relaxed">
                        "{msg.message}"
                      </p>
                      <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                        <span className="font-semibold text-stone-900">{msg.guestName}</span>
                        <span>{new Date(msg.createdAt).toLocaleDateString('pt-PT')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quiet Footer Inside Invitation */}
            <div className="text-center pt-8 border-t border-stone-200 text-stone-400 text-xs">
              <p className="font-serif text-base text-stone-600">Com amor,</p>
              <p className="font-serif text-xl font-medium text-stone-800 mt-1">
                {event.celebrants}
              </p>
              <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
                <span>Criado com</span>
                <span className="text-amber-800 font-semibold">Ki-eventos</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* MODAL PARA CONTRIBUIR COM O PRESENTE (MULTICAIXA EXPRESS, IBAN, ETC.) */}
      {selectedGiftForContribute && (
        <GiftContributionModal
          isOpen={Boolean(selectedGiftForContribute)}
          onClose={() => setSelectedGiftForContribute(null)}
          gift={selectedGiftForContribute}
          celebrants={event.celebrants}
          onContribute={handleContributeToGift}
        />
      )}

      {/* MODAL VER MAIS CONTRIBUIDORES E MENSAGENS */}
      {selectedGiftForViewMore && (
        <GiftContributorsModal
          isOpen={Boolean(selectedGiftForViewMore)}
          onClose={() => setSelectedGiftForViewMore(null)}
          gift={selectedGiftForViewMore}
          celebrants={event.celebrants}
          onOpenContributeModal={() => {
            const currentGift = selectedGiftForViewMore;
            setSelectedGiftForViewMore(null);
            setSelectedGiftForContribute(currentGift);
          }}
        />
      )}

    </div>
  );
};
