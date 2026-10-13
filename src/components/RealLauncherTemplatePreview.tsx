import React from 'react';
import { AppItem, AdvertisingConfig, LogoConfig } from '../types';
import { Wifi, Settings, User as UserIcon, ChevronDown, LayoutGrid, Play } from 'lucide-react';

interface RealLauncherTemplatePreviewProps {
  apps: AppItem[];
  advertising: AdvertisingConfig;
  logo: LogoConfig;
  highlightSlot?: number | null;
  highlightLogo?: boolean;
  className?: string;
}

export const RealLauncherTemplatePreview: React.FC<RealLauncherTemplatePreviewProps> = ({
  apps,
  advertising,
  logo,
  highlightSlot = null,
  highlightLogo = false,
  className = '',
}) => {
  // Sort the 5 apps by position (1 to 5)
  const sortedApps = [1, 2, 3, 4, 5].map((pos) => {
    return (
      apps.find((a) => a.position === pos) || {
        id: `pos-${pos}`,
        position: pos as 1 | 2 | 3 | 4 | 5,
        name: `Posição ${pos}`,
        packageName: `com.app.pos${pos}`,
        iconUrl: '',
        downloadUrl: '',
      }
    );
  });

  const hasCustomBackground = Boolean(advertising?.backgroundUrl?.trim());

  return (
    <div
      className={`relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-700/60 select-none flex flex-col justify-between p-4 sm:p-7 ${className}`}
      style={{
        background: hasCustomBackground
          ? `url(${advertising.backgroundUrl}) center/cover no-repeat`
          : 'radial-gradient(circle at 10% 20%, #f7d2e3 0%, #e4dbfa 26%, #d4e8fa 52%, #dbf3e8 75%, #fef3c7 100%)',
      }}
    >
      {/* Subtle overlay if custom background has dark tones */}
      {hasCustomBackground && (
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      )}

      {/* TOP BAR: Logo (Left), Clock (Center), 3 Circular Icons (Right) */}
      <div className="relative z-10 flex items-center justify-between">
        {/* LOGO AREA (Top Left) */}
        <div
          className={`flex items-center gap-2 p-1.5 rounded-xl transition-all ${
            highlightLogo
              ? 'ring-2 ring-blue-500 bg-white/40 shadow-lg scale-105'
              : 'hover:bg-white/20'
          }`}
        >
          {logo?.logoUrl ? (
            <img
              src={logo.logoUrl}
              alt={logo.brandName || 'Logo'}
              className="h-7 sm:h-9 max-w-[160px] object-contain drop-shadow-md rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex items-center gap-1.5 bg-white/35 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/40 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-black tracking-wider text-slate-900 drop-shadow-sm uppercase">
                {logo?.brandName || 'SUA LOGO AQUI'}
              </span>
            </div>
          )}
        </div>

        {/* TIME CLOCK (Top Center - 14:13 from reference image) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 sm:top-6 text-white font-bold text-sm sm:text-lg tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] font-sans">
          14:13
        </div>

        {/* 3 CIRCULAR ICONS (Top Right - Wifi, Settings, Profile) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center text-white shadow-sm">
            <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center text-white shadow-sm">
            <Settings className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center text-white shadow-sm">
            <UserIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
        </div>
      </div>

      {/* CENTER BANNER: Video or Image with "o que você quiser" overlay */}
      <div className="relative z-10 w-full max-w-2xl sm:max-w-3xl mx-auto my-auto px-2">
        <div className="relative aspect-[16/6] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-slate-900/80 group">
          {advertising?.videoUrl ? (
            <video
              src={advertising.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1280&auto=format&fit=crop&q=80')`,
              }}
            />
          )}

          {/* Dark scrim overlay */}
          <div className="absolute inset-0 bg-black/25 backdrop-brightness-95 pointer-events-none" />

          {/* Central Banner Text (matches "o que você quiser") */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <h2 className="text-white text-base sm:text-2xl md:text-3xl font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-wide text-center">
              {advertising?.bannerText || 'o que você quiser'}
            </h2>
          </div>
        </div>
      </div>

      {/* BOTTOM AREA: Dark capsule dock with EXACT 5 FIXED APPS */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Floating Capsule Dock Container */}
        <div className="w-full max-w-xl sm:max-w-2xl bg-[#162334]/95 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2.5 shadow-2xl shadow-black/40">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
            {sortedApps.map((app) => {
              const isSlotActive = highlightSlot === app.position;

              return (
                <div
                  key={app.position}
                  className={`aspect-[16/10] sm:aspect-[16/9] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-1 sm:p-2 transition-all relative overflow-hidden shadow-md cursor-pointer ${
                    isSlotActive
                      ? 'ring-4 ring-blue-500 scale-105 shadow-blue-500/40 z-20'
                      : 'hover:scale-[1.03]'
                  }`}
                  style={{
                    backgroundColor: app.cardBg || (app.position === 3 ? '#0f2238' : app.position === 5 ? '#000000' : '#ffffff'),
                    color: app.textColor || (app.position === 3 || app.position === 5 ? '#ffffff' : '#0f172a'),
                  }}
                >
                  {/* Position Badge in corner */}
                  <span className="absolute top-1 left-1.5 text-[8px] sm:text-[9px] font-mono font-bold opacity-60">
                    #{app.position}
                  </span>

                  {/* Icon or App Logo Presentation */}
                  {app.iconUrl ? (
                    <img
                      src={app.iconUrl}
                      alt={app.name}
                      className="h-4 sm:h-6 object-contain mb-0.5 rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}

                  {/* App Name */}
                  <span
                    className={`text-[9px] sm:text-xs font-black truncate max-w-full px-1 text-center ${
                      app.position === 4 ? 'text-red-600 font-extrabold tracking-wider' : ''
                    }`}
                  >
                    {app.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Down chevron & drawer circle button from real launcher screenshot */}
        <div className="flex flex-col items-center mt-1 sm:mt-1.5 text-white/70">
          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80 -mb-0.5 animate-bounce" />
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white/90">
            <LayoutGrid className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};
