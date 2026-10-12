import React from 'react';
import { User } from '../types';
import { Sparkles, Calendar, User as UserIcon, LayoutDashboard, ShieldCheck, LogOut } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'admin';
  onNavigate: (view: 'landing' | 'dashboard' | 'admin') => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenNewEventModal: () => void;
  onPreviewPublic: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenNewEventModal,
  onPreviewPublic,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="group flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="w-9 h-9 rounded-full bg-stone-900 text-[#FAF9F5] flex items-center justify-center font-serif text-lg font-bold shadow-sm transition-transform group-hover:scale-105">
            Ki
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0">
            Ki-eventos
          </span>
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          {currentView === 'landing' ? (
            <>
              <a href="#modelos" className="hover:text-stone-950 transition-colors whitespace-nowrap shrink-0">
                Modelos de Convites
              </a>
              <a href="#funcionalidades" className="hover:text-stone-950 transition-colors whitespace-nowrap shrink-0">
                Funcionalidades
              </a>
              <a href="#como-funciona" className="hover:text-stone-950 transition-colors whitespace-nowrap shrink-0">
                Como Funciona
              </a>
              <a href="#planos" className="hover:text-stone-950 transition-colors whitespace-nowrap shrink-0">
                Planos & Preços
              </a>
              <button
                onClick={onPreviewPublic}
                className="hover:text-amber-800 transition-colors whitespace-nowrap shrink-0 text-amber-700 font-semibold cursor-pointer"
              >
                Ver Exemplo Interativo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('landing')}
                className="hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Página Inicial
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currentView === 'dashboard' ? 'text-amber-800 font-semibold' : 'hover:text-stone-950'
                }`}
              >
                Painel do Evento
              </button>
              <button
                onClick={onPreviewPublic}
                className="hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-stone-600"
              >
                Ver Convite Convidado
              </button>
              <button
                onClick={() => onNavigate('admin')}
                className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  currentView === 'admin' ? 'text-amber-800 font-semibold' : 'hover:text-stone-950'
                }`}
              >
                Administração
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: 1 primary action / user state */}
        <div className="flex items-center gap-3 shrink-0">
          {currentView === 'landing' ? (
            <>
              <button
                onClick={onOpenAuth}
                className="hidden sm:inline-flex px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Entrar
              </button>
              <button
                onClick={() => {
                  if (currentUser) {
                    onNavigate('dashboard');
                  } else {
                    onOpenNewEventModal();
                  }
                }}
                className="px-4.5 py-2.5 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 active:scale-98 transition-all shadow-sm whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Criar Convite Grátis
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenNewEventModal}
                className="hidden sm:inline-flex px-3.5 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-stone-600" />
                Novo Evento
              </button>
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <div className="flex items-center gap-1.5 hidden sm:flex">
                  <span className="text-xs text-stone-800 font-semibold max-w-[130px] truncate">
                    {currentUser?.name || 'João e Alice'}
                  </span>
                  {currentUser?.plan === 'premium' && (
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-200">
                      Premium
                    </span>
                  )}
                </div>
                <button
                  onClick={onLogout}
                  title="Terminar sessão"
                  className="p-1.5 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
