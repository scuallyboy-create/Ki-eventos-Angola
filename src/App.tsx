import React, { useState, useEffect } from 'react';
import { EventInvitation, User, InvitationTemplate } from './types';
import { 
  getStoredEvents, 
  saveStoredEvents, 
  getStoredUser, 
  saveStoredUser, 
  getActiveEventId, 
  setActiveEventId, 
  createEventFromTemplate 
} from './services/storage';
import { INITIAL_EVENTS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { PublicInvitationView } from './components/PublicInvitationView';
import { PortariaView } from './components/PortariaView';
import { AuthModal } from './components/AuthModal';
import { NewEventModal } from './components/NewEventModal';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'admin'>('landing');
  const [events, setEvents] = useState<EventInvitation[]>([]);
  const [activeEventId, setActiveEventIdState] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Modals & Fullscreen states
  const [isPublicInviteOpen, setIsPublicInviteOpen] = useState(false);
  const [isPortariaOpen, setIsPortariaOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [selectedTemplateForNew, setSelectedTemplateForNew] = useState<InvitationTemplate | undefined>(undefined);

  // Load initial data and support ?convite= and ?portaria= deep links
  useEffect(() => {
    let loadedEvents = getStoredEvents();
    const loadedUser = getStoredUser();
    const storedActiveId = getActiveEventId();

    // Check if URL contains embedded event state in hash #d=...
    if (window.location.hash && window.location.hash.includes('d=')) {
      try {
        const hashMatch = window.location.hash.match(/[#&]d=([^&]+)/);
        if (hashMatch && hashMatch[1]) {
          const parsed = JSON.parse(decodeURIComponent(hashMatch[1]));
          if (parsed && parsed.id) {
            const idx = loadedEvents.findIndex((e) => e.id === parsed.id);
            if (idx >= 0) {
              loadedEvents[idx] = parsed;
            } else {
              loadedEvents = [parsed, ...loadedEvents];
            }
            saveStoredEvents(loadedEvents);
          }
        }
      } catch (err) {
        console.warn('Could not parse hash payload', err);
      }
    }

    setEvents(loadedEvents);
    setCurrentUser(loadedUser);

    const urlParams = new URLSearchParams(window.location.search);
    const isPortariaParam = urlParams.get('portaria') === 'true' || urlParams.has('portaria');
    let inviteParam = urlParams.get('convite') || urlParams.get('invite') || urlParams.get('evento');

    if (!inviteParam && window.location.hash) {
      const hashClean = window.location.hash.replace(/^#\/?/, '');
      const hashParams = new URLSearchParams(hashClean.includes('=') ? hashClean : `convite=${hashClean}`);
      inviteParam = hashParams.get('convite') || hashParams.get('invite') || (!hashClean.startsWith('d=') ? hashClean : null);
    }

    if (inviteParam) {
      const allPossibleEvents = [...loadedEvents, ...INITIAL_EVENTS];
      const targetEvent = allPossibleEvents.find(
        (e) => e.slug === inviteParam || e.id === inviteParam
      ) || allPossibleEvents[0];

      if (targetEvent) {
        setActiveEventIdState(targetEvent.id);
        setActiveEventId(targetEvent.id);
        if (isPortariaParam) {
          setIsPortariaOpen(true);
        } else {
          setIsPublicInviteOpen(true);
        }
        return;
      }
    }

    if (isPortariaParam) {
      setIsPortariaOpen(true);
      return;
    }

    if (loadedEvents.some((e) => e.id === storedActiveId)) {
      setActiveEventIdState(storedActiveId);
    } else if (loadedEvents.length > 0) {
      setActiveEventIdState(loadedEvents[0].id);
      setActiveEventId(loadedEvents[0].id);
    }
  }, []);

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  const handleUpdateEvent = (updated: EventInvitation) => {
    const newEvents = events.map((e) => (e.id === updated.id ? updated : e));
    setEvents(newEvents);
    saveStoredEvents(newEvents);
  };

  const handleSelectEvent = (id: string) => {
    setActiveEventIdState(id);
    setActiveEventId(id);
    setCurrentView('dashboard');
  };

  const handleCreateEvent = (template: InvitationTemplate, title: string) => {
    const newEvt = createEventFromTemplate(template, title);
    setEvents(getStoredEvents());
    setActiveEventIdState(newEvt.id);
    setCurrentView('dashboard');
  };

  const handleStartCreate = (template?: InvitationTemplate) => {
    setSelectedTemplateForNew(template);
    setIsNewEventModalOpen(true);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    saveStoredUser(user);
    if (user.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-stone-900 font-sans">
      
      {/* Portaria View Mode (Door staff & security QR Code scanning & Guest Check-in) */}
      {isPortariaOpen && activeEvent ? (
        <PortariaView
          event={activeEvent}
          onClose={() => {
            setIsPortariaOpen(false);
            const url = new URL(window.location.href);
            url.searchParams.delete('portaria');
            window.history.replaceState({}, '', url.toString());
          }}
          onUpdateEvent={handleUpdateEvent}
        />
      ) : isPublicInviteOpen && activeEvent ? (
        <PublicInvitationView
          event={activeEvent}
          onClose={() => setIsPublicInviteOpen(false)}
          onUpdateEvent={handleUpdateEvent}
        />
      ) : (
        <>
          {/* Main Top Navigation */}
          <Navbar
            currentView={currentView}
            onNavigate={(view) => setCurrentView(view)}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
            onOpenNewEventModal={() => {
              setSelectedTemplateForNew(undefined);
              setIsNewEventModalOpen(true);
            }}
            onPreviewPublic={() => setIsPublicInviteOpen(true)}
          />

          {/* Active View Router */}
          <main className="flex-1">
            {currentView === 'landing' && (
              <LandingPage
                onStartCreate={handleStartCreate}
                onPreviewSample={() => setIsPublicInviteOpen(true)}
                onSelectTemplate={(template) => handleStartCreate(template)}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            )}

            {currentView === 'dashboard' && activeEvent && (
              <Dashboard
                events={events}
                activeEvent={activeEvent}
                onSelectEvent={handleSelectEvent}
                onUpdateEvent={handleUpdateEvent}
                onPreviewPublic={() => setIsPublicInviteOpen(true)}
                onOpenPortaria={() => setIsPortariaOpen(true)}
                onOpenNewEventModal={() => {
                  setSelectedTemplateForNew(undefined);
                  setIsNewEventModalOpen(true);
                }}
              />
            )}

            {currentView === 'admin' && (
              <AdminPanel
                events={events}
                onSelectEvent={handleSelectEvent}
                onPreviewPublic={() => setIsPublicInviteOpen(true)}
              />
            )}
          </main>

          {/* Authentication Modal */}
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onLogin={handleLogin}
          />

          {/* New Event Launcher Modal */}
          <NewEventModal
            isOpen={isNewEventModalOpen}
            onClose={() => setIsNewEventModalOpen(false)}
            onCreate={handleCreateEvent}
            defaultTemplate={selectedTemplateForNew}
          />
        </>
      )}

    </div>
  );
}
