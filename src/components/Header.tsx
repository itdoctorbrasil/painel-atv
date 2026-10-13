import React from 'react';
import { User, ThemeMode } from '../types';
import {
  Menu,
  Tv,
  Repeat,
  Bell,
  ArrowLeft,
  KeyRound,
  Check,
  Copy,
  Sun,
  Moon,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onToggleMobileSidebar: () => void;
  onOpenTVPreview: () => void;
  onSwitchProfileDemo: () => void;
  impersonatingUser: User | null;
  onStopImpersonating: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  theme,
  onToggleTheme,
  onToggleMobileSidebar,
  onOpenTVPreview,
  onSwitchProfileDemo,
  impersonatingUser,
  onStopImpersonating,
}) => {
  const isDark = theme === 'dark';
  const [copiedToken, setCopiedToken] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const isAdmin = currentUser.role === 'admin';

  const copyToken = () => {
    navigator.clipboard.writeText(currentUser.token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors ${
        isDark
          ? 'bg-[#090D17]/95 border-slate-800/80 text-white'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Impersonation Alert Banner */}
      {impersonatingUser && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2 text-xs font-semibold flex flex-wrap items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>
              MODO SUPORTE ATIVO: Você está navegando como{' '}
              <strong className="underline">{impersonatingUser.name}</strong> (Token: {impersonatingUser.token}).
            </span>
          </div>
          <button
            onClick={onStopImpersonating}
            className="flex items-center gap-1.5 bg-black/30 hover:bg-black/50 text-white px-3 py-1 rounded-lg text-xs font-bold border border-white/20 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retornar ao Painel Master ADM
          </button>
        </div>
      )}

      {/* Main Header Bar */}
      <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Context */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className={`lg:hidden p-2 rounded-xl focus:outline-none ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
            }`}
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isAdmin ? 'Painel Master ADM' : 'Painel do Revendedor'}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isAdmin
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                }`}
              >
                {isAdmin ? 'Controle Global' : 'Rede Privada'}
              </span>
            </div>
            <p className={`text-[11px] hidden sm:block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isAdmin
                ? 'Gerenciamento global de launchers, publicidade e caixas Android TV'
                : 'Gerenciamento de clientes e caixas vinculadas ao seu token'}
            </p>
          </div>
        </div>

        {/* Right: Actions, Theme Switcher, TV Preview, Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* THEME TOGGLE (Claro / Escuro) */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Ativar Tema Claro' : 'Ativar Tema Escuro'}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-blue-600 border-slate-200'
            }`}
            aria-label="Alternar Tema Claro e Escuro"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Quick Demo Switcher Button */}
          <button
            onClick={onSwitchProfileDemo}
            title="Alternar rapidamente entre perfil ADM e Revendedor"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-sm ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-blue-500/50'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <Repeat className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden md:inline">Alternar:</span>
            <span className="text-blue-500 font-bold">
              {isAdmin ? 'Ver como Revendedor' : 'Ver como Master ADM'}
            </span>
          </button>

          {/* Live Android TV Launcher Preview Modal Trigger */}
          <button
            onClick={onOpenTVPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Tv className="w-4 h-4 text-cyan-300" />
            <span className="hidden sm:inline">Simular Launcher TV</span>
            <span className="sm:hidden">TV</span>
          </button>

          {/* Reseller Token Copy Button (visible on md screens) */}
          {!isAdmin && (
            <button
              onClick={copyToken}
              title="Copiar seu token para vincular na TV Box"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/50 text-cyan-300 text-xs font-mono font-medium transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentUser.token}</span>
              {copiedToken ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-cyan-400" />
              )}
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-xl relative transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              aria-label="Notificações"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
            </button>

            {showNotifications && (
              <div
                className={`absolute right-0 mt-2 w-80 border rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200 ${
                  isDark
                    ? 'bg-[#0F172A] border-slate-700 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Notificações do Sistema
                  </h4>
                  <span className="text-[10px] text-blue-500 font-medium">3 novas</span>
                </div>
                <div className="mt-3 space-y-2.5">
                  <div
                    className={`p-2.5 rounded-xl text-xs border ${
                      isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <p className="font-semibold">3 caixas com vencimento próximo</p>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Clientes expiram em menos de 72 horas.
                    </p>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl text-xs border ${
                      isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <p className="font-semibold">OTA v3.5.0 disparada com sucesso</p>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Grade de 5 apps sincronizada.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
