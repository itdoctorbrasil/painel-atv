import React from 'react';
import { User, MenuTab, ThemeMode } from '../types';
import {
  LayoutDashboard,
  Users,
  Tv2,
  Megaphone,
  Grid,
  Image as ImageIcon,
  Download,
  Cpu,
  LogOut,
  KeyRound,
  ShieldAlert,
  HardDrive,
  Copy,
  Check,
  Smartphone,
  Sun,
  Moon,
} from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  activeTab: MenuTab;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onSelectTab: (tab: MenuTab) => void;
  onLogout: () => void;
  deviceCount: number;
  impersonatingUser: User | null;
  onStopImpersonating?: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  theme,
  onToggleTheme,
  onSelectTab,
  onLogout,
  deviceCount,
  impersonatingUser,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const isDark = theme === 'dark';
  const [copiedToken, setCopiedToken] = React.useState(false);
  const isAdmin = currentUser.role === 'admin';

  const copyToken = () => {
    navigator.clipboard.writeText(currentUser.token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const navItems = [
    {
      id: 'dashboard' as MenuTab,
      label: isAdmin ? 'Dashboard Geral' : 'Dashboard Revenda',
      icon: LayoutDashboard,
      badge: null,
      adminOnly: false,
    },
    ...(isAdmin
      ? [
          {
            id: 'clients' as MenuTab,
            label: 'Clientes & Suporte',
            icon: Users,
            badge: 'Logar como',
            adminOnly: true,
          },
        ]
      : [
          {
            id: 'devices' as MenuTab,
            label: 'Dispositivos & Cadastro',
            icon: Smartphone,
            badge: `${deviceCount}`,
            adminOnly: false,
          },
        ]),
    {
      id: 'advertising' as MenuTab,
      label: 'Publicidade (Vídeo/Fundo)',
      icon: Megaphone,
      badge: null,
      adminOnly: false,
    },
    {
      id: 'apps' as MenuTab,
      label: 'Meus Apps (5 Fixos)',
      icon: Grid,
      badge: '5 Apps',
      adminOnly: false,
    },
    {
      id: 'logo' as MenuTab,
      label: 'Menu Logo',
      icon: ImageIcon,
      badge: null,
      adminOnly: false,
    },
    {
      id: 'download' as MenuTab,
      label: 'Baixar Launcher (APK)',
      icon: Download,
      badge: 'v3.5.0',
      adminOnly: false,
    },
    ...(isAdmin
      ? [
          {
            id: 'ota' as MenuTab,
            label: 'Atualização OTA',
            icon: Cpu,
            badge: 'ADM Exclusivo',
            adminOnly: true,
          },
        ]
      : []),
  ];

  const handleNavClick = (tabId: MenuTab) => {
    onSelectTab(tabId);
    if (window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 border-r flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDark
            ? 'bg-[#090D17] border-slate-800/80 text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        {/* Brand / Logo Top */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800/80' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20">
              <div
                className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                  isDark ? 'bg-[#090D17]' : 'bg-white'
                }`}
              >
                <Tv2 className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight">ATV LAUNCHER</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-500/20 text-blue-500 rounded border border-blue-500/30">
                  PRO
                </span>
              </div>
              <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Painel Administrativo
              </p>
            </div>
          </div>
        </div>

        {/* User Role Card */}
        <div
          className={`px-4 py-3.5 border-b ${
            isDark
              ? 'border-slate-800/60 bg-slate-900/40'
              : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
                isAdmin
                  ? 'bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-amber-500/20'
                  : 'bg-gradient-to-br from-blue-600 to-emerald-600 text-white shadow-blue-500/20'
              }`}
            >
              {isAdmin ? 'ADM' : 'REV'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate">{currentUser.name}</p>
              <p
                className={`text-[11px] truncate flex items-center gap-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isAdmin ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
                {isAdmin ? 'Master Administrador' : 'Revendedor Autorizado'}
              </p>
            </div>
          </div>

          {/* Reseller Unique Token Box */}
          {!isAdmin && (
            <div
              className={`mt-2.5 p-2 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="min-w-0 flex-1 mr-2">
                <div
                  className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  <KeyRound className="w-3 h-3 text-cyan-400" />
                  Meu Token
                </div>
                <div className="text-[11px] font-mono font-bold text-cyan-500 truncate">
                  {currentUser.token}
                </div>
              </div>
              <button
                type="button"
                onClick={copyToken}
                title="Copiar Token do Launcher"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                    : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                {copiedToken ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          {/* Impersonation Indicator in Sidebar */}
          {impersonatingUser && (
            <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[11px] flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">Modo suporte ativo</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div
            className={`px-3 pb-2 text-[10px] font-bold uppercase tracking-wider ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {isAdmin ? 'Menu Administrativo Master' : 'Painel do Revendedor'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : isDark
                    ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-white'
                        : isDark
                        ? 'text-slate-400 group-hover:text-blue-400'
                        : 'text-slate-500 group-hover:text-blue-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.adminOnly
                        ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                        : isDark
                        ? 'bg-slate-800 text-slate-300 border border-slate-700/60'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section: Theme toggle & Logout */}
        <div
          className={`p-4 border-t space-y-2.5 ${
            isDark ? 'border-slate-800/80 bg-[#070A12]/80' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <button
            type="button"
            onClick={onToggleTheme}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-800'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
              <span>{isDark ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}</span>
            </div>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>
    </>
  );
};
