export type EventCategory = 'casamento' | 'aniversario' | 'baptizado' | 'baby_shower' | 'corporativo' | 'outro';

export type RsvpStatus = 'confirmado' | 'recusado' | 'pendente';

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  group: string; // ex: 'Família Noiva', 'Amigos', 'Trabalho'
  belongsToSide?: 'noivo' | 'noiva' | 'amigo' | 'colega'; // Pertence a que parte
  companionName?: string; // Nome do acompanhante
  hasCompanion?: boolean;
  adultsCount: number;
  childrenCount: number;
  status: RsvpStatus;
  dietaryRestrictions?: string; // ex: 'Vegetariano', 'Sem glúten', 'Nenhuma'
  notes?: string;
  respondedAt?: string;
  tableNumber?: string;
  qrCodePass?: string; // Código único do convite para portaria (ex: CVT-JA26-4891)
  checkedIn?: boolean; // Se realizou check-in na portaria
  checkedInAt?: string; // Hora do check-in
}

export interface StoryMoment {
  id: string;
  title: string;
  dateOrYear?: string;
  description: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
}

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface GiftContribution {
  id: string;
  contributorName: string;
  contributorAvatar?: string;
  amount: number;
  message?: string;
  paymentMethod: 'express' | 'mbway' | 'iban' | 'referencia';
  createdAt: string;
}

export interface GiftOption {
  type: 'iban' | 'mbway' | 'pix' | 'link' | 'custom' | 'crowdfunding';
  title: string;
  details: string;
  holderName?: string;
  targetAmount?: number; // e.g. 350000
  currentAmount?: number; // e.g. 210000
  currency?: string; // 'Kz' | '€' | 'R$'
  contributions?: GiftContribution[];
}

export interface GuestMessage {
  id: string;
  guestName: string;
  message: string;
  createdAt: string;
  approved: boolean;
}

export interface EventTheme {
  id: string;
  name: string;
  primaryColor: string; // hex
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
  fontFamily: 'serif' | 'sans';
  envelopeColor: string;
  waxSealColor: string;
  sealIcon: 'rings' | 'cake' | 'cross' | 'heart' | 'sparkle';
}

export interface CoverImageSettings {
  zoom: number; // 1 to 2
  positionX?: number; // 0 to 100
  positionY: number; // 0 to 100
  aspectRatio: '16/9' | '21/9' | '4/3' | '1/1' | '16/10';
  filter?: 'none' | 'warm' | 'soft' | 'vintage';
}

export interface EventInvitation {
  id: string;
  slug: string;
  category: EventCategory;
  title: string;
  subtitle: string;
  celebrants: string; // Ex: João e Alice
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  timezone: string;
  // Capacidade e Lugares Reservados
  totalSeats?: number; // Lotação / Lugares reservados (descontados automaticamente com RSVP)
  // Local da Igreja / Cerimónia Religiosa
  hasChurchCeremony?: boolean;
  churchVenueName?: string;
  churchVenueAddress?: string;
  churchTime?: string;
  churchMapsUrl?: string;
  // Local da Cerimónia Civil
  hasCivilCeremony?: boolean;
  civilVenueName?: string;
  civilVenueAddress?: string;
  civilTime?: string;
  civilMapsUrl?: string;
  // Local da Celebração / Festa (Quinta)
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
  // Imagens e Ajustes
  coverImage: string;
  coverImageSettings?: CoverImageSettings;
  galleryImages: string[];
  // Momentos Especiais & A Nossa História (Fotos e Vídeos Curtos)
  ourStoryTitle?: string;
  ourStoryDescription?: string;
  ourStoryMoments?: StoryMoment[];
  description: string;
  dressCode: string;
  dressCodeDetails?: string;
  rsvpDeadline: string;
  theme: EventTheme;
  agenda: AgendaItem[];
  gifts: GiftOption[];
  backgroundMusicEnabled?: boolean;
  backgroundMusicUrl?: string;
  showGuestbook: boolean;
  showCountdown: boolean;
  guests: Guest[];
  messages: GuestMessage[];
  createdAt: string;
  viewsCount: number;
}

export interface InvitationTemplate {
  id: string;
  name: string;
  category: EventCategory;
  tagline: string;
  description: string;
  previewImage: string;
  theme: EventTheme;
  sampleCelebrants: string;
  featured: boolean;
  customizableColors?: boolean;
  layoutStyle?: 'editorial' | 'modern' | 'romantic' | 'minimalist';
}

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: 'host' | 'planner' | 'admin' | 'superadmin';
  plan: 'free' | 'premium' | 'pro';
  avatar?: string;
  phone?: string;
  accountStatus?: 'ativo' | 'aguardando_pagamento' | 'bloqueado';
  eventTitle?: string;
}

export interface PackagePricing {
  id: string;
  name: string;
  priceKz: number;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  badge?: string;
}

export interface PackageRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  packageName: string;
  priceKz: number;
  paymentMethod: 'express' | 'iban' | 'unitel_money';
  paymentReference?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  requestedAt: string;
  eventTitle: string;
  notes?: string;
}
