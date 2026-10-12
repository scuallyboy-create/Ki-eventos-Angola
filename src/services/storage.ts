import { EventInvitation, Guest, GuestMessage, User, InvitationTemplate, PackagePricing, PackageRequest } from '../types';
import { INITIAL_EVENTS, INITIAL_USER, INITIAL_TEMPLATES, INITIAL_PACKAGES, INITIAL_PACKAGE_REQUESTS } from '../data/initialData';

const STORAGE_KEYS = {
  EVENTS: 'ki_eventos_events_v5',
  CURRENT_USER: 'ki_eventos_current_user_v5',
  ACTIVE_EVENT_ID: 'ki_eventos_active_event_id_v5',
  TEMPLATES: 'ki_eventos_templates_v5',
  PACKAGES: 'ki_eventos_packages_v5',
  PACKAGE_REQUESTS: 'ki_eventos_package_requests_v5',
};

export const getStoredEvents = (): EventInvitation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      saveStoredEvents(INITIAL_EVENTS);
      return INITIAL_EVENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load events from storage', e);
    return INITIAL_EVENTS;
  }
};

export const saveStoredEvents = (events: EventInvitation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save events to storage', e);
  }
};

export const getStoredUser = (): User => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return INITIAL_USER;
    return JSON.parse(raw);
  } catch {
    return INITIAL_USER;
  }
};

export const saveStoredUser = (user: User): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user', e);
  }
};

export const getActiveEventId = (): string => {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT_ID) || INITIAL_EVENTS[0].id;
};

export const setActiveEventId = (id: string): void => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, id);
};

export const getStoredTemplates = (): InvitationTemplate[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (!raw) {
      saveStoredTemplates(INITIAL_TEMPLATES);
      return INITIAL_TEMPLATES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TEMPLATES;
  }
};

export const saveStoredTemplates = (templates: InvitationTemplate[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates', e);
  }
};

export const getStoredPackages = (): PackagePricing[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PACKAGES);
    if (!raw) {
      saveStoredPackages(INITIAL_PACKAGES);
      return INITIAL_PACKAGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PACKAGES;
  }
};

export const saveStoredPackages = (packages: PackagePricing[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
  } catch (e) {
    console.error('Failed to save packages', e);
  }
};

export const getStoredPackageRequests = (): PackageRequest[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PACKAGE_REQUESTS);
    if (!raw) {
      saveStoredPackageRequests(INITIAL_PACKAGE_REQUESTS);
      return INITIAL_PACKAGE_REQUESTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PACKAGE_REQUESTS;
  }
};

export const saveStoredPackageRequests = (requests: PackageRequest[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PACKAGE_REQUESTS, JSON.stringify(requests));
  } catch (e) {
    console.error('Failed to save package requests', e);
  }
};

export const createEventFromTemplate = (template: InvitationTemplate, userGivenTitle?: string): EventInvitation => {
  const newId = 'evt_' + Date.now();
  const slug = (userGivenTitle || template.name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const newEvent: EventInvitation = {
    id: newId,
    slug: `${slug}-${Date.now().toString().slice(-4)}`,
    category: template.category,
    title: userGivenTitle || `Novo Convite de ${template.name}`,
    subtitle: template.tagline,
    celebrants: template.sampleCelebrants,
    date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '16:00',
    timezone: 'Europe/Lisbon',
    venueName: 'Quinta dos Sonhos',
    venueAddress: 'Avenida Principal 100, Sintra / Lisboa',
    googleMapsUrl: 'https://maps.google.com/?q=Lisboa',
    coverImage: template.previewImage,
    galleryImages: [template.previewImage],
    description: 'Com muita alegria preparamos este dia especial e queremos partilhá-lo consigo!',
    dressCode: 'Esporte Fino / Passeio',
    dressCodeDetails: 'Venha confortável para celebrar connosco.',
    rsvpDeadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    theme: { ...template.theme },
    agenda: [
      { id: 'ag_new_1', time: '16h00', title: 'Chegada e Boas-Vindas', description: 'Recepção dos convidados.' },
      { id: 'ag_new_2', time: '17h00', title: 'Início da Celebração', description: 'Momento solene principal.' },
      { id: 'ag_new_3', time: '19h00', title: 'Jantar / Coquetel', description: 'Momento de confraternização.' },
    ],
    gifts: [
      {
        type: 'mbway',
        title: 'Presente por MB Way',
        details: '+351 910 000 000',
        holderName: 'Nome do Titular',
      },
    ],
    backgroundMusicEnabled: true,
    showGuestbook: true,
    showCountdown: true,
    guests: [],
    messages: [],
    createdAt: new Date().toISOString(),
    viewsCount: 1,
  };

  const currentEvents = getStoredEvents();
  const updated = [newEvent, ...currentEvents];
  saveStoredEvents(updated);
  setActiveEventId(newId);
  return newEvent;
};
