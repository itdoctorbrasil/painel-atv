import React from 'react';
import { AppItem, AdvertisingConfig, LogoConfig } from '../types';
import { X, Tv, Sparkles } from 'lucide-react';
import { RealLauncherTemplatePreview } from './RealLauncherTemplatePreview';

interface TVLauncherPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppItem[];
  advertising: AdvertisingConfig;
  logo: LogoConfig;
}

export const TVLauncherPreviewModal: React.FC<TVLauncherPreviewModalProps> = ({
  isOpen,
  onClose,
  apps,
  advertising,
  logo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-6xl bg-[#090D17] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Control Bar */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Simulador do Launcher Real da TV
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Resolução 16:9 • 4K HDR
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Visualização em tempo real baseada no layout oficial com 5 aplicativos fixos e banner central.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 16:9 Screen Frame with Real Template */}
        <div className="p-4 sm:p-8 bg-black/70 flex items-center justify-center">
          <div className="w-full max-w-5xl">
            <RealLauncherTemplatePreview
              apps={apps}
              advertising={advertising}
              logo={logo}
              className="w-full"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            💡 Os 5 aplicativos configurados na dock inferior e a logomarca do topo esquerdo são atualizados em tempo real.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all cursor-pointer"
          >
            Fechar Simulador
          </button>
        </div>
      </div>
    </div>
  );
};
