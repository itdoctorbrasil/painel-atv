import React, { useState, useRef } from 'react';
import { User, LogoConfig, AppItem, AdvertisingConfig, ThemeMode } from '../types';
import {
  Image as ImageIcon,
  Upload,
  Link,
  Save,
  Check,
  Tv,
  Trash2,
  Eye,
  Sparkles,
} from 'lucide-react';
import { RealLauncherTemplatePreview } from './RealLauncherTemplatePreview';

interface LogoViewProps {
  currentUser: User;
  logo: LogoConfig;
  apps: AppItem[];
  advertising: AdvertisingConfig;
  theme: ThemeMode;
  onSaveLogo: (newConfig: LogoConfig) => void;
  onOpenTVPreview: () => void;
}

export const LogoView: React.FC<LogoViewProps> = ({
  currentUser,
  logo,
  apps,
  advertising,
  theme,
  onSaveLogo,
  onOpenTVPreview,
}) => {
  const isDark = theme === 'dark';

  const [form, setForm] = useState<LogoConfig>(logo);
  const [logoInputUrl, setLogoInputUrl] = useState(logo.logoUrl || '');
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload a partir do computador (Botão Upload)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setForm((prev) => ({ ...prev, logoUrl: result }));
        setLogoInputUrl('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Botão URL da logo
  const handleApplyLogoUrl = () => {
    if (logoInputUrl.trim()) {
      setForm((prev) => ({ ...prev, logoUrl: logoInputUrl.trim() }));
    }
  };

  const handleRemoveLogo = () => {
    setForm((prev) => ({ ...prev, logoUrl: '' }));
    setLogoInputUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    onSaveLogo(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
          isDark
            ? 'bg-[#0F172A]/80 border-slate-800 shadow-xl'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-500" />
            <h1 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Menu Logo & Identidade Visual
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Posicionamento no Launcher
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Configure a logomarca que será exibida no canto superior do launcher das TV Boxes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenTVPreview}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          >
            <Tv className="w-4 h-4 text-cyan-400" />
            <span>Ver em Tela Cheia</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Logo Salva!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Logomarca</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & URL Buttons */}
        <div className="lg:col-span-5 space-y-5">
          <div
            className={`p-6 rounded-3xl border space-y-4 ${
              isDark ? 'bg-[#0F172A]/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Origem da Logomarca
              </h3>
              {form.logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-400 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover Logo</span>
                </button>
              )}
            </div>

            {/* BOTÃO 1: BOTÃO UPLOAD */}
            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                <Upload className="w-4 h-4 text-blue-500" />
                Botão Upload da Logo (Do Computador)
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
                id="logo-upload-input"
              />

              <label
                htmlFor="logo-upload-input"
                className={`w-full py-3.5 px-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 font-bold text-xs cursor-pointer transition-all ${
                  isDark
                    ? 'border-slate-700 hover:border-blue-500 hover:bg-slate-800 text-slate-200'
                    : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-slate-700'
                }`}
              >
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Fazer Upload do Arquivo de Logo</span>
              </label>
              <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                Recomendado: PNG com fundo transparente (300x100 px)
              </p>
            </div>

            {/* BOTÃO 2: BOTÃO URL DA LOGO */}
            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                <Link className="w-4 h-4 text-cyan-400" />
                Botão URL da Logo (Link Web)
              </label>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={logoInputUrl}
                  onChange={(e) => setLogoInputUrl(e.target.value)}
                  placeholder="https://exemplo.com/minha-logo.png"
                  className={`flex-1 rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:border-cyan-500 ${
                    isDark
                      ? 'bg-[#0B0F19] border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleApplyLogoUrl}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer transition-all shrink-0"
                >
                  Aplicar URL
                </button>
              </div>
            </div>

            {/* Nome da Marca / Texto de Identificação */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Nome da Marca / Operador
              </label>
              <input
                type="text"
                value={form.brandName}
                onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                placeholder="Ex: ATV LAUNCHER PRO"
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase border focus:outline-none focus:border-blue-500 ${
                  isDark
                    ? 'bg-[#0B0F19] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            {/* Current Logo Status */}
            {form.logoUrl ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white p-1 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <img src={form.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <div className="font-bold text-emerald-400">Logomarca Ativa</div>
                  <div className="text-[11px] text-slate-400 truncate">Exibida no canto superior esquerdo</div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-400 text-center">
                Nenhuma imagem de logo carregada. O launcher exibirá o texto padrão da marca.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pré-visualização exata da logo no modelo real do launcher */}
        <div className="lg:col-span-7 space-y-4">
          <div className="sticky top-20">
            <div
              className={`p-5 rounded-3xl border space-y-3 ${
                isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  <Eye className="w-4 h-4 text-blue-500" />
                  Pré-visualização do Posicionamento no Launcher Real
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Modelo Anexado
                </span>
              </div>

              {/* Template Real do Launcher com highlight na Logo (Canto Superior Esquerdo) */}
              <RealLauncherTemplatePreview
                apps={apps}
                advertising={advertising}
                logo={form}
                highlightLogo={true}
              />

              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                <p className="leading-relaxed">
                  💡 <strong>Modelo Real do Launcher:</strong> A logomarca fica posicionada no <strong>canto superior esquerdo</strong>, alinhada com o relógio central (14:13) e os 3 botões circulares no canto superior direito.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
