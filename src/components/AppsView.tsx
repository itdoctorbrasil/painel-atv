import React, { useState, useRef } from 'react';
import { User, AppItem, AdvertisingConfig, LogoConfig, ThemeMode } from '../types';
import {
  Grid,
  Save,
  Check,
  Upload,
  Link,
  Download,
  Smartphone,
  Eye,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { RealLauncherTemplatePreview } from './RealLauncherTemplatePreview';

interface AppsViewProps {
  currentUser: User;
  apps: AppItem[];
  advertising: AdvertisingConfig;
  logo: LogoConfig;
  theme: ThemeMode;
  onUpdateAllApps: (apps: AppItem[]) => void;
}

export const AppsView: React.FC<AppsViewProps> = ({
  currentUser,
  apps,
  advertising,
  logo,
  theme,
  onUpdateAllApps,
}) => {
  const isDark = theme === 'dark';
  const [selectedPosition, setSelectedPosition] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [localApps, setLocalApps] = useState<AppItem[]>(apps);
  const [isSaved, setIsSaved] = useState(false);

  const iconFileInputRef = useRef<HTMLInputElement>(null);

  // Active app being edited
  const currentApp = localApps.find((a) => a.position === selectedPosition) || {
    id: `pos-${selectedPosition}`,
    position: selectedPosition,
    name: `App ${selectedPosition}`,
    packageName: `com.app.pos${selectedPosition}`,
    iconUrl: '',
    downloadUrl: '',
    cardBg: '#ffffff',
    textColor: '#0f172a',
  };

  const handleUpdateCurrentField = (field: keyof AppItem, value: any) => {
    setLocalApps((prev) =>
      prev.map((a) => {
        if (a.position === selectedPosition) {
          return { ...a, [field]: value };
        }
        return a;
      })
    );
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        handleUpdateCurrentField('iconUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = () => {
    onUpdateAllApps(localApps);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Preset button to restore the 5 original apps from the reference image
  const handleRestoreDefaults = () => {
    const defaults: AppItem[] = [
      {
        id: 'pos-1',
        position: 1,
        name: 'UniTV',
        packageName: 'com.unitv.android.tv',
        iconUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=200&auto=format&fit=crop&q=80',
        downloadUrl: 'https://cdn.atvlauncher.pro/apks/unitv-latest.apk',
        cardBg: '#f1f5f9',
        textColor: '#0f172a',
      },
      {
        id: 'pos-2',
        position: 2,
        name: 'Google Play',
        packageName: 'com.android.vending',
        iconUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&auto=format&fit=crop&q=80',
        downloadUrl: 'https://cdn.atvlauncher.pro/apks/google-play-tv.apk',
        cardBg: '#ffffff',
        textColor: '#334155',
      },
      {
        id: 'pos-3',
        position: 3,
        name: 'prime video',
        packageName: 'com.amazon.amazonvideo.livingroom',
        iconUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=200&auto=format&fit=crop&q=80',
        downloadUrl: 'https://cdn.atvlauncher.pro/apks/primevideo-tv.apk',
        cardBg: '#0f2238',
        textColor: '#ffffff',
      },
      {
        id: 'pos-4',
        position: 4,
        name: 'NETFLIX',
        packageName: 'com.netflix.ninja',
        iconUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&auto=format&fit=crop&q=80',
        downloadUrl: 'https://cdn.atvlauncher.pro/apks/netflix-ninja-tv.apk',
        cardBg: '#ffffff',
        textColor: '#e50914',
      },
      {
        id: 'pos-5',
        position: 5,
        name: 'YouTube TV',
        packageName: 'com.google.android.youtube.tv',
        iconUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200&auto=format&fit=crop&q=80',
        downloadUrl: 'https://cdn.atvlauncher.pro/apks/youtube-tv.apk',
        cardBg: '#000000',
        textColor: '#ffffff',
      },
    ];
    setLocalApps(defaults);
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
            <Grid className="w-5 h-5 text-blue-500" />
            <h1 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Meus Apps (Grade Fixa de 5 Aplicativos)
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
              5 Posições Exclusivas
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            O launcher possui exatamente 5 posições fixas. Altere nome, pacote, ícone e link de download a qualquer momento.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Salvo no Launcher!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Grade de Apps</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5 Positions Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        {([1, 2, 3, 4, 5] as const).map((pos) => {
          const app = localApps.find((a) => a.position === pos);
          const isSelected = selectedPosition === pos;

          return (
            <button
              key={pos}
              type="button"
              onClick={() => setSelectedPosition(pos)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/25 ring-2 ring-blue-400'
                  : isDark
                  ? 'bg-[#0F172A] border-slate-800 hover:bg-slate-800/80 text-slate-300'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-700/30 text-slate-400'
                }`}>
                  POSIÇÃO {pos}
                </span>
                {app?.iconUrl && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </div>
              <div className="font-extrabold text-xs sm:text-sm truncate w-full">
                {app?.name || `Posição ${pos}`}
              </div>
              <div className={`text-[10px] truncate w-full font-mono mt-0.5 ${
                isSelected ? 'text-blue-100' : 'text-slate-500'
              }`}>
                {app?.packageName || 'Sem pacote'}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form to edit the selected position */}
        <div className="lg:col-span-6 space-y-4">
          <div
            className={`p-6 rounded-3xl border space-y-4 ${
              isDark ? 'bg-[#0F172A]/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-mono font-black text-xs flex items-center justify-center">
                  #{selectedPosition}
                </div>
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Configuração da Posição {selectedPosition}
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">
                Altere os 4 campos abaixo
              </span>
            </div>

            {/* 1. Nome a ser exibido no launcher */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                1. Nome a ser exibido no launcher <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={currentApp.name}
                onChange={(e) => handleUpdateCurrentField('name', e.target.value)}
                placeholder="Ex: UniTV, Netflix, YouTube TV"
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-semibold border focus:outline-none focus:border-blue-500 ${
                  isDark
                    ? 'bg-[#0B0F19] border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
                required
              />
            </div>

            {/* 2. Nome do pacote */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  2. Nome do pacote Android <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] font-mono text-cyan-400">Ex: com.unitv.app</span>
              </div>
              <input
                type="text"
                value={currentApp.packageName}
                onChange={(e) => handleUpdateCurrentField('packageName', e.target.value)}
                placeholder="com.empresa.aplicativo.tv"
                className={`w-full font-mono font-bold rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:border-cyan-500 ${
                  isDark
                    ? 'bg-[#0B0F19] border-slate-700 text-cyan-300 placeholder-slate-600'
                    : 'bg-slate-50 border-slate-300 text-cyan-700 placeholder-slate-400'
                }`}
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Identificador único do APK no Android para inicialização direta via controle remoto.
              </p>
            </div>

            {/* 3. URL do ícone (com Upload do PC ou URL) */}
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                3. Ícone do Aplicativo (Upload ou URL)
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentApp.iconUrl}
                  onChange={(e) => handleUpdateCurrentField('iconUrl', e.target.value)}
                  placeholder="https://exemplo.com/icone.png"
                  className={`flex-1 rounded-xl px-3.5 py-2 text-xs border focus:outline-none focus:border-blue-500 ${
                    isDark
                      ? 'bg-[#0B0F19] border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />

                <input
                  type="file"
                  ref={iconFileInputRef}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleIconUpload}
                  className="hidden"
                  id={`icon-upload-${selectedPosition}`}
                />

                <label
                  htmlFor={`icon-upload-${selectedPosition}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all border border-slate-700"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>Upload Ícone</span>
                </label>
              </div>

              {currentApp.iconUrl && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-8 h-8 rounded-lg bg-white p-1 border border-slate-700 flex items-center justify-center">
                    <img src={currentApp.iconUrl} alt="Preview" className="h-full object-contain" />
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold">Ícone carregado</span>
                </div>
              )}
            </div>

            {/* 4. URL de download */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  4. URL de Download (Link direto do APK)
                </label>
                <span className="text-[10px] text-slate-400">Instalação automática</span>
              </div>
              <div className="relative">
                <input
                  type="url"
                  value={currentApp.downloadUrl || ''}
                  onChange={(e) => handleUpdateCurrentField('downloadUrl', e.target.value)}
                  placeholder="https://cdn.seusite.com/apks/aplicativo.apk"
                  className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-xs border focus:outline-none focus:border-blue-500 ${
                    isDark
                      ? 'bg-[#0B0F19] border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <Download className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Link onde a TV Box baixará o APK caso o app ainda não esteja instalado no sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Real Launcher Template Dock Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="sticky top-20">
            <div
              className={`p-5 rounded-3xl border space-y-3 ${
                isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  <Eye className="w-4 h-4 text-blue-500" />
                  Visualização da Dock (Posição #{selectedPosition} Destacada)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Tempo Real
                </span>
              </div>

              {/* Real Launcher Template highlighting current slot */}
              <RealLauncherTemplatePreview
                apps={localApps}
                advertising={advertising}
                logo={logo}
                highlightSlot={selectedPosition}
              />

              <div className="pt-2 text-center">
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  A posição <strong className="text-blue-400">#{selectedPosition}</strong> está em destaque com borda azul na dock inferior acima.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
