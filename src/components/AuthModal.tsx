import React, { useState } from 'react';
import { User } from '../types';
import { SUPER_ADMIN_USER, INITIAL_USER } from '../data/initialData';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle,
  KeyRound,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'host' | 'admin'>('host');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Clean inputs with NO pre-filled exposed credentials for safety
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    setTimeout(() => {
      // 1. Check Super Admin Credentials (Ki-eventos / admin123)
      if (cleanId === 'ki-eventos' || cleanId === 'admin@kieventos.pt' || cleanId === 'admin') {
        if (cleanPass === 'admin123') {
          onLogin(SUPER_ADMIN_USER);
          setIsLoading(false);
          onClose();
          return;
        } else {
          setIsLoading(false);
          setErrorMsg('Palavra-passe de administrador incorreta. Por favor verifique.');
          return;
        }
      }

      // 2. Check Host Jolice Credentials (jolice / 0315)
      if (cleanId === 'jolice' || cleanId === 'jolice@kieventos.pt') {
        if (cleanPass === '0315') {
          onLogin(INITIAL_USER);
          setIsLoading(false);
          onClose();
          return;
        } else {
          setIsLoading(false);
          setErrorMsg('Palavra-passe incorreta para a conta de João e Alice.');
          return;
        }
      }

      // 3. Admin tab requires proper admin credentials
      if (activeTab === 'admin') {
        setIsLoading(false);
        setErrorMsg('Credenciais de Super Administrador inválidas. Acesso restrito.');
        return;
      }

      // 4. Standard Host Registration/Login
      if (mode === 'register' && !name.trim()) {
        setIsLoading(false);
        setErrorMsg('Por favor informe o seu nome ou o do casal.');
        return;
      }

      const registeredUser: User = {
        id: 'usr_' + Date.now(),
        name: name || (identifier.split('@')[0] || 'Anfitrião'),
        email: identifier.includes('@') ? identifier : `${cleanId}@kieventos.pt`,
        username: cleanId,
        role: 'host',
        plan: 'premium',
        accountStatus: 'ativo',
      };

      onLogin(registeredUser);
      setIsLoading(false);
      onClose();
    }, 400);
  };

  const handleQuickSwitch = (tab: 'host' | 'admin') => {
    setActiveTab(tab);
    setErrorMsg('');
    setIdentifier('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200/80 relative">
        
        {/* Subtle decorative top border */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700" />

        <div className="p-6 sm:p-8">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-serif font-bold text-sm tracking-wider text-amber-900">Ki-Eventos</span>
                <span className="text-stone-300">·</span>
                <span className="text-[11px] uppercase tracking-widest text-stone-500 font-semibold">
                  Portal Seguro
                </span>
              </div>
              <h3 className="font-serif text-2xl font-normal text-stone-900">
                {activeTab === 'admin' 
                  ? 'Portal Super Admin' 
                  : (mode === 'login' ? 'Acesso ao Seu Evento' : 'Criar Conta de Anfitrião')}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {activeTab === 'admin'
                  ? 'Gestão de pacotes, preços, modelos e autorizações'
                  : 'Gerencie o seu convite digital, convidados e lista de presentes'}
              </p>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Segmented Selector (Host vs Super Admin) */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-stone-100 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => handleQuickSwitch('host')}
              className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'host'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 text-amber-700" />
              <span>Anfitrião / Casal</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSwitch('admin')}
              className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
              <span>Super Admin</span>
            </button>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {activeTab === 'host' && mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome do Anfitrião ou Casal
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: João e Alice"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-3.5 pr-3 py-2.5 text-xs bg-stone-50/50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {activeTab === 'admin' ? 'Utilizador Administrativo' : 'Utilizador ou E-mail'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={activeTab === 'admin' ? 'Utilizador Super Admin' : 'O seu nome de utilizador ou e-mail'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-3.5 pr-3 py-2.5 text-xs bg-stone-50/50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all font-sans"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Palavra-passe
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-stone-50/50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all font-mono"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 active:scale-[0.99] rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <span>A autenticar com segurança...</span>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {activeTab === 'admin' 
                      ? 'Entrar no Painel Super Admin' 
                      : (mode === 'login' ? 'Entrar no Painel do Evento' : 'Criar Conta')}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          {activeTab === 'host' && (
            <div className="pt-5 mt-4 border-t border-stone-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setErrorMsg('');
                }}
                className="text-xs text-stone-600 hover:text-stone-900 underline underline-offset-4 cursor-pointer"
              >
                {mode === 'login'
                  ? 'Ainda não tem conta? Crie o seu convite aqui'
                  : 'Já tem conta registada? Iniciar sessão'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
