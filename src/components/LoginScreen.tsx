import React, { useState } from 'react';
import { User, ThemeMode } from '../types';
import { api } from '../services/api';
import {
  Tv,
  Lock,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Server,
  Sun,
  Moon,
} from 'lucide-react';

interface LoginScreenProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  theme,
  onToggleTheme,
  onLoginSuccess,
}) => {
  const isDark = theme === 'dark';

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Real API POST to http://177.153.68.5:8080/api/login
      const user = await api.login(username.trim(), password.trim());
      setIsLoading(false);
      onLoginSuccess(user);
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'Falha ao autenticar na VPS. Verifique usuário e senha.';
      setErrorMessage(msg);
    }
  };

  const quickFillCredentials = (demoUsername: string, demoPass: string) => {
    setUsername(demoUsername);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-[#070A12] text-slate-100' : 'bg-[#F1F5F9] text-slate-900'
      }`}
    >
      {/* Theme Toggle Button in Top Right */}
      <div className="absolute top-5 right-5 z-20">
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
          className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer shadow-sm ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-slate-700/80'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
          }`}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Tema Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-blue-600" />
              <span>Tema Escuro</span>
            </>
          )}
        </button>
      </div>

      {/* Ambient glowing background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)'} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-xl shadow-blue-500/20 mb-4 animate-in fade-in zoom-in duration-500">
            <div
              className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                isDark ? 'bg-[#0B0F19]' : 'bg-white'
              }`}
            >
              <Tv className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ATV LAUNCHER{' '}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              PRO
            </span>
          </h1>
          <p
            className={`text-xs sm:text-sm mt-1.5 font-medium ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Painel Administrativo Conectado à VPS Linux
          </p>
        </div>

        {/* Card Box */}
        <div
          className={`backdrop-blur-xl border rounded-3xl shadow-2xl p-6 sm:p-8 relative transition-colors ${
            isDark
              ? 'bg-[#0F172A]/90 border-slate-800/80 shadow-black/50'
              : 'bg-white/95 border-slate-200/90 shadow-slate-300/40 text-slate-900'
          }`}
        >
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Acesso ao Painel</h2>
              <span className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <Server className="w-3 h-3 text-emerald-500" />
                177.153.68.5:8080
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Autenticação direta com validação de role (`admin` ou `reseller`).
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start gap-2.5 animate-in fade-in">
              <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                className={`block text-xs font-bold mb-1.5 uppercase tracking-wider ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin ou usuário de revenda"
                  className={`w-full rounded-2xl pl-10 pr-4 py-2.5 text-sm border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium ${
                    isDark
                      ? 'bg-[#0B0F19] border-slate-700/80 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className={`block text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Senha de Acesso
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full rounded-2xl pl-10 pr-10 py-2.5 text-sm border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium ${
                    isDark
                      ? 'bg-[#0B0F19] border-slate-700/80 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label
                className={`flex items-center gap-2 cursor-pointer text-xs select-none ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                Lembrar sessão
              </label>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                POST /api/login
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-2xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Conectando à VPS...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Credentials Helper */}
          <div
            className={`mt-6 pt-5 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div
              className={`flex items-center gap-1.5 text-xs font-bold mb-2.5 ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Preencher Credenciais Testadas na VPS:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickFillCredentials('admin', 'admin123')}
                className={`flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all group cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800/90 border-slate-700/60 hover:border-blue-500/50'
                    : 'bg-slate-50 hover:bg-blue-50/50 border-slate-200 hover:border-blue-400'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1 text-xs font-bold group-hover:text-blue-500">
                    <span>👑 Master ADM</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">admin / admin123</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickFillCredentials('revenda_sp', 'token123')}
                className={`flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all group cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800/90 border-slate-700/60 hover:border-emerald-500/50'
                    : 'bg-slate-50 hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-400'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1 text-xs font-bold group-hover:text-emerald-500">
                    <span>💼 Revendedor</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">revenda_sp / token123</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <p
          className={`text-center text-xs mt-6 font-medium ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          ATV Launcher Pro • Conectado a http://177.153.68.5:8080/api/
        </p>
      </div>
    </div>
  );
};
