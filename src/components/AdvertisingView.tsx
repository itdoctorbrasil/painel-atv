import React, { useState, useRef } from 'react';
import { User, AdvertisingConfig, AppItem, LogoConfig, ThemeMode } from '../types';
import {
  Megaphone,
  Upload,
  Link,
  Save,
  Check,
  Tv,
  Trash2,
  FileVideo,
  FileImage,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { RealLauncherTemplatePreview } from './RealLauncherTemplatePreview';

interface AdvertisingViewProps {
  currentUser: User;
  advertising: AdvertisingConfig;
  apps: AppItem[];
  logo: LogoConfig;
  theme: ThemeMode;
  onSaveAdvertising: (newConfig: AdvertisingConfig) => void;
  onOpenTVPreview: () => void;
}

export const AdvertisingView: React.FC<AdvertisingViewProps> = ({
  currentUser,
  advertising,
  apps,
  logo,
  theme,
  onSaveAdvertising,
  onOpenTVPreview,
}) => {
  const isDark = theme === 'dark';

  const [form, setForm] = useState<AdvertisingConfig>(advertising);
  const [bgInputUrl, setBgInputUrl] = useState(advertising.backgroundUrl || '');
  const [videoInputUrl, setVideoInputUrl] = useState(advertising.videoUrl || '');
  const [bannerText, setBannerText] = useState(advertising.bannerText || 'o que você quiser');
  const [isSaved, setIsSaved] = useState(false);

  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Background File Upload
  const handleBgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setForm((prev) => ({ ...prev, backgroundUrl: result }));
        setBgInputUrl('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Video File Upload
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setForm((prev) => ({ ...prev, videoUrl: result }));
        setVideoInputUrl('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyBgUrl = () => {
    if (bgInputUrl.trim()) {
      setForm((prev) => ({ ...prev, backgroundUrl: bgInputUrl.trim() }));
    }
  };

  const handleApplyVideoUrl = () => {
    if (videoInputUrl.trim()) {
      setForm((prev) => ({ ...prev, videoUrl: videoInputUrl.trim() }));
    }
  };

  const handleResetToDefaultBg = () => {
    setForm((prev) => ({ ...prev, backgroundUrl: '' }));
    setBgInputUrl('');
    if (bgFileInputRef.current) bgFileInputRef.current.value = '';
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: AdvertisingConfig = {
      ...form,
      bannerText: bannerText.trim(),
    };
    onSaveAdvertising(updated);
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
            <Megaphone className="w-5 h-5 text-blue-500" />
            <h1 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Menu Publicidade
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Template Oficial
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Gerenciamento simplificado de imagem de fundo e vídeo publicitário para o launcher Android TV.
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
            <span>Simulador na TV</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Salvo com Sucesso!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Publicidade</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Exactly the requested 2 sections */}
        <div className="lg:col-span-6 space-y-6">
          {/* SECTION 1: Imagem de Fundo (Background do Launcher) - APENAS 2 OPÇÕES */}
          <div
            className={`p-5 rounded-3xl border space-y-4 ${
              isDark ? 'bg-[#0F172A]/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-blue-500" />
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  1. Imagem de Fundo (Background)
                </h3>
              </div>
              {form.backgroundUrl && (
                <button
                  type="button"
                  onClick={handleResetToDefaultBg}
                  className="flex items-center gap-1 text-[11px] text-amber-500 hover:text-amber-400 font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar Fundo Padrão</span>
                </button>
              )}
            </div>

            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Escolha uma das 2 opções abaixo para alterar a imagem de fundo:
            </p>

            <div className="space-y-3">
              {/* Opção A: Fazer upload a partir do computador */}
              <div
                className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  <Upload className="w-3.5 h-3.5 text-blue-500" />
                  Opção A: Fazer Upload a partir do Computador
                </label>
                <input
                  type="file"
                  ref={bgFileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleBgFileUpload}
                  className="hidden"
                  id="bg-file-upload"
                />
                <label
                  htmlFor="bg-file-upload"
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all ${
                    isDark
                      ? 'border-slate-700 hover:border-blue-500 hover:bg-slate-800/60 text-slate-300'
                      : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-600'
                  }`}
                >
                  <Upload className="w-5 h-5 text-blue-500 mb-1" />
                  <span className="text-xs font-semibold">Clique para selecionar imagem do PC</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG ou WEBP (1920x1080)</span>
                </label>
              </div>

              {/* Opção B: Inserir URL da imagem */}
              <div
                className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  <Link className="w-3.5 h-3.5 text-blue-500" />
                  Opção B: Inserir URL da Imagem
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={bgInputUrl}
                    onChange={(e) => setBgInputUrl(e.target.value)}
                    placeholder="https://exemplo.com/fundo-launcher.jpg"
                    className={`flex-1 rounded-xl px-3.5 py-2 text-xs border focus:outline-none focus:border-blue-500 ${
                      isDark
                        ? 'bg-[#0B0F19] border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleApplyBgUrl}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-all shrink-0"
                  >
                    Aplicar URL
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Vídeo Publicitário (Trailer / Anúncio) - APENAS 2 OPÇÕES */}
          <div
            className={`p-5 rounded-3xl border space-y-4 ${
              isDark ? 'bg-[#0F172A]/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <FileVideo className="w-4 h-4 text-cyan-400" />
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  2. Vídeo Publicitário (Trailer / Anúncio)
                </h3>
              </div>
            </div>

            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Escolha uma das 2 opções abaixo para alterar a mídia do banner central:
            </p>

            <div className="space-y-3">
              {/* Opção A: Fazer upload a partir do computador */}
              <div
                className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  Opção A: Fazer Upload a partir do Computador
                </label>
                <input
                  type="file"
                  ref={videoFileInputRef}
                  accept="video/mp4, video/webm, image/*"
                  onChange={handleVideoFileUpload}
                  className="hidden"
                  id="video-file-upload"
                />
                <label
                  htmlFor="video-file-upload"
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all ${
                    isDark
                      ? 'border-slate-700 hover:border-cyan-500 hover:bg-slate-800/60 text-slate-300'
                      : 'border-slate-300 hover:border-cyan-500 hover:bg-cyan-50/50 text-slate-600'
                  }`}
                >
                  <FileVideo className="w-5 h-5 text-cyan-400 mb-1" />
                  <span className="text-xs font-semibold">Clique para selecionar vídeo do PC</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">MP4, WEBM ou imagem de divulgação</span>
                </label>
              </div>

              {/* Opção B: Inserir URL da imagem / vídeo */}
              <div
                className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  <Link className="w-3.5 h-3.5 text-cyan-400" />
                  Opção B: Inserir URL do Vídeo ou Imagem
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={videoInputUrl}
                    onChange={(e) => setVideoInputUrl(e.target.value)}
                    placeholder="https://exemplo.com/trailer.mp4"
                    className={`flex-1 rounded-xl px-3.5 py-2 text-xs border focus:outline-none focus:border-cyan-500 ${
                      isDark
                        ? 'bg-[#0B0F19] border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleApplyVideoUrl}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer transition-all shrink-0"
                  >
                    Aplicar URL
                  </button>
                </div>
              </div>

              {/* Texto do Banner (Ex: "o que você quiser") */}
              <div
                className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Texto Central do Banner (Ex: "o que você quiser")
                </label>
                <input
                  type="text"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  placeholder="o que você quiser"
                  className={`w-full rounded-xl px-3.5 py-2 text-xs border focus:outline-none focus:border-blue-500 ${
                    isDark
                      ? 'bg-[#0B0F19] border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Real Template Preview */}
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
                  Visualização no Template Real do Launcher
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ao Vivo
                </span>
              </div>

              {/* Reusable Real Launcher Preview */}
              <RealLauncherTemplatePreview
                apps={apps}
                advertising={{
                  ...form,
                  bannerText,
                }}
                logo={logo}
              />

              <div className="pt-2 text-center">
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Todas as alterações de fundo e vídeo refletem imediatamente no launcher das TV Boxes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
