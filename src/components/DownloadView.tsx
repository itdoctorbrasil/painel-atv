import React, { useState } from 'react';
import { User, ThemeMode } from '../types';
import {
  Download,
  QrCode,
  Copy,
  Check,
  Smartphone,
  Tv,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';

interface DownloadViewProps {
  currentUser: User;
  theme?: ThemeMode;
}

export const DownloadView: React.FC<DownloadViewProps> = ({ currentUser, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const isAdmin = currentUser.role === 'admin';
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const directApkUrl = isAdmin
    ? 'https://cdn.atvlauncher.pro/releases/atv-launcher-v3.5.0-pro.apk'
    : `https://cdn.atvlauncher.pro/releases/atv-launcher-v3.5.0-pro.apk?token=${currentUser.token}`;

  const downloaderCode = '849201';

  const copyApkLink = () => {
    navigator.clipboard.writeText(directApkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyShortCode = () => {
    navigator.clipboard.writeText(downloaderCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0F172A]/80 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-extrabold text-white">
              Central de Download do Launcher (APK)
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Versão Estável v3.5.0
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Links diretos e código rápido do aplicativo <strong>Downloader</strong> para instalação em qualquer Android TV ou TV Box.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: APK Variants & Fast Codes */}
        <div className="lg:col-span-7 space-y-5">
          {/* Downloader App Code Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-950/40 via-[#0F172A] to-slate-900 border border-blue-500/30 shadow-2xl relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Código do App Downloader (AFTVnews)
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">
                  Instalação em 1 Minuto na TV
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Digite apenas este código de 6 dígitos no aplicativo <strong>Downloader</strong> na TV Box ou Fire Stick:
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="bg-[#0B0F19] px-6 py-3 rounded-2xl border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/10 font-mono text-3xl font-extrabold text-cyan-300 tracking-widest">
                {downloaderCode}
              </div>

              <button
                type="button"
                onClick={copyShortCode}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Direct APK Download Cards */}
          <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Arquivos APK Disponíveis para Download
            </h3>

            <div className="space-y-3">
              {/* Universal APK */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    APK
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      ATV Launcher Pro - Universal (Recomendado)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Compatível com Android 7.0 até Android 14 • 24.8 MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyApkLink}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Copiar URL direta"
                  >
                    {copiedLink ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <a
                    href={directApkUrl}
                    download="atv-launcher-v3.5.0-pro.apk"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar APK</span>
                  </a>
                </div>
              </div>

              {/* ARM64 APK */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                    64b
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      ATV Launcher Pro - Build arm64-v8a
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Para Mi Box S (2nd Gen), Fire Stick 4K Max, Shield TV • 18.2 MB
                    </p>
                  </div>
                </div>

                <a
                  href={directApkUrl}
                  download="atv-launcher-v3.5.0-arm64.apk"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar ARM64</span>
                </a>
              </div>
            </div>
          </div>

          {/* Installation Instructions */}
          <div className="p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Passo a Passo de Instalação na TV Box:
            </h4>
            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Instale o aplicativo <strong className="text-white">Downloader</strong> pela Google Play Store da TV Box ou Amazon Appstore.
              </li>
              <li>
                Abra o Downloader e digite o código <strong className="text-cyan-400 font-mono font-bold">{downloaderCode}</strong> no campo URL.
              </li>
              <li>
                Aguarde o download e clique em <strong className="text-white">Instalar</strong>.
              </li>
              <li>
                Ao abrir o launcher pela primeira vez, selecione-o como inicializador padrão (Pressione a tecla Home e marque "Sempre").
              </li>
            </ol>
          </div>
        </div>

        {/* Right Column: QR Code Box */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 text-center space-y-4 shadow-xl">
            <div className="inline-flex p-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
              <QrCode className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">QR Code de Download Direto</h3>
              <p className="text-xs text-slate-400 mt-1">
                Aponte a câmera do celular ou scanner da TV Box para baixar diretamente.
              </p>
            </div>

            {/* Generated QR Code representation */}
            <div className="w-52 h-52 mx-auto bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  directApkUrl
                )}`}
                alt="QR Code ATV Launcher"
                className="w-full h-full object-contain"
              />
            </div>

            {!isAdmin && (
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200">
                <span className="font-semibold">Seu Token Vinculado:</span>
                <div className="font-mono font-bold text-cyan-300 mt-0.5">
                  {currentUser.token}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
