import React, { useState } from 'react';
import { User, OTARelease, ThemeMode } from '../types';
import {
  Cpu,
  Plus,
  Radio,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  RefreshCw,
  X,
  Sparkles,
  Server,
  FileCode,
} from 'lucide-react';

interface OTAViewProps {
  currentUser: User;
  users: User[];
  otaReleases: OTARelease[];
  theme?: ThemeMode;
  isLoading?: boolean;
  onRefresh?: () => void;
  onAddOTARelease: (release: Omit<OTARelease, 'id' | 'releaseDate' | 'downloadCount' | 'successRate'>) => Promise<void>;
  onToggleOTAStatus: (releaseId: string) => Promise<void>;
  onDeleteOTARelease?: (releaseId: string) => Promise<void>;
}

export const OTAView: React.FC<OTAViewProps> = ({
  currentUser,
  users,
  otaReleases,
  theme = 'dark',
  isLoading = false,
  onRefresh,
  onAddOTARelease,
  onToggleOTAStatus,
  onDeleteOTARelease,
}) => {
  const isDark = theme === 'dark';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [version, setVersion] = useState('v3.5.0');
  const [versionCode, setVersionCode] = useState(350);
  const [apkUrl, setApkUrl] = useState('http://177.153.68.5:8080/apks/atv-launcher-v3.5.0.apk');
  const [fileSize, setFileSize] = useState('24.8 MB');
  const [isMandatory, setIsMandatory] = useState(false);
  const [targetScope, setTargetScope] = useState<'all' | 'specific_reseller' | 'beta'>('all');
  const [targetResellerId, setTargetResellerId] = useState('');
  const [changelogText, setChangelogText] = useState(
    'Otimização do buffer de canais HLS\nCorreção do layout dock de 5 apps na TV Box\nIntegração com a API de produção da VPS'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim() || !apkUrl.trim()) return;

    const changelog = changelogText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    setIsSubmitting(true);
    try {
      await onAddOTARelease({
        version: version.trim(),
        versionCode: Number(versionCode),
        apkUrl: apkUrl.trim(),
        fileSize: fileSize.trim(),
        isMandatory,
        targetScope,
        targetResellerId: targetScope === 'specific_reseller' ? targetResellerId : undefined,
        changelog,
        status: 'active',
      });
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resellers = users.filter((u) => u.role === 'reseller');

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
            <Cpu className="w-5 h-5 text-blue-500" />
            <h1 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Atualização OTA (Firmware & Launcher)
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
              POST /api/ota • VPS
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Dispare pacotes de atualização Over-The-Air para as TV Boxes diretamente pelo servidor Linux.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Recarregar da VPS"
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>Disparar Nova Versão OTA</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={`p-4 rounded-3xl border ${
            isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Versão em Produção (VPS)
          </div>
          <div className={`mt-2 text-2xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {otaReleases[0]?.version || 'v3.5.0'}
          </div>
          <p className="text-[11px] text-emerald-500 mt-0.5 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ativa no endpoint /api/launcher/ota
          </p>
        </div>

        <div
          className={`p-4 rounded-3xl border ${
            isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total de Pacotes Registrados
          </div>
          <div className={`mt-2 text-2xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {otaReleases.length} versões
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Histórico salvo na base de dados
          </p>
        </div>

        <div
          className={`p-4 rounded-3xl border ${
            isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Taxa Média de Sucesso
          </div>
          <div className="mt-2 text-2xl font-black font-mono text-emerald-500">
            99.2%
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Instalação silenciosa em background
          </p>
        </div>
      </div>

      {/* OTA History List */}
      <div
        className={`rounded-3xl border shadow-xl overflow-hidden ${
          isDark ? 'bg-[#0F172A]/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="p-4 border-b border-slate-700/40 flex items-center justify-between">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Histórico e Fila de Distribuição OTA (VPS)
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {otaReleases.length} pacotes encontrados
          </span>
        </div>

        <div className="divide-y divide-slate-700/30">
          {otaReleases.map((ota) => {
            return (
              <div
                key={ota.id}
                className={`p-5 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`font-mono text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {ota.version}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-700/30 px-2 py-0.5 rounded">
                      Build #{ota.versionCode}
                    </span>
                    {ota.isMandatory ? (
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        Obrigatória
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                        Recomendada
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        ota.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}
                    >
                      {ota.status === 'active' ? 'Transmitindo' : 'Pausada'}
                    </span>
                  </div>

                  {/* Changelog notes */}
                  <div className="text-xs">
                    <span className="text-slate-400 font-semibold">Changelog: </span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-slate-400">
                      {ota.changelog.map((log, idx) => (
                        <li key={idx}>{log}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                    <span>Lançado em: {ota.releaseDate}</span>
                    <span>•</span>
                    <span className="font-mono truncate max-w-sm">APK: {ota.apkUrl}</span>
                    <span>•</span>
                    <span>Tamanho: {ota.fileSize}</span>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 self-end lg:self-center">
                  <button
                    onClick={() => onToggleOTAStatus(ota.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      ota.status === 'active'
                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/30'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                    }`}
                  >
                    {ota.status === 'active' ? 'Pausar Distribuição' : 'Reativar Disparo'}
                  </button>

                  {onDeleteOTARelease && (
                    <button
                      onClick={() => onDeleteOTARelease(ota.id)}
                      title="Remover pacote OTA"
                      className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: DISPARAR NOVA VERSÃO OTA (POST /api/ota) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className={`w-full max-w-lg border rounded-3xl shadow-2xl p-6 relative ${
              isDark ? 'bg-[#0F172A] border-slate-700' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-500">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Disparar Nova Atualização OTA</h3>
                  <p className="text-xs text-slate-400">
                    Envia pacote para o endpoint POST /api/ota na VPS
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 uppercase tracking-wider">
                    Versão <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="v3.5.1"
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-blue-500 font-mono ${
                      isDark
                        ? 'bg-[#0B0F19] border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 uppercase tracking-wider">
                    Build Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={versionCode}
                    onChange={(e) => setVersionCode(Number(e.target.value))}
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-blue-500 font-mono ${
                      isDark
                        ? 'bg-[#0B0F19] border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-wider">
                  URL Direta do APK de Atualização <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={apkUrl}
                  onChange={(e) => setApkUrl(e.target.value)}
                  placeholder="http://177.153.68.5:8080/apks/atv-launcher.apk"
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-blue-500 font-mono ${
                    isDark
                      ? 'bg-[#0B0F19] border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 uppercase tracking-wider">
                    Alvo da Distribuição
                  </label>
                  <select
                    value={targetScope}
                    onChange={(e) => setTargetScope(e.target.value as any)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-blue-500 ${
                      isDark
                        ? 'bg-[#0B0F19] border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="all">Todas as TV Boxes</option>
                    <option value="specific_reseller">Apenas Revendedor Específico</option>
                    <option value="beta">Apenas Grupo Beta Teste</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 uppercase tracking-wider">
                    Tamanho do Arquivo
                  </label>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-blue-500 font-mono ${
                      isDark
                        ? 'bg-[#0B0F19] border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={isMandatory}
                    onChange={(e) => setIsMandatory(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>
                    Forçar Atualização Obrigatória (Instalação compulsória na TV Box)
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-wider">
                  Notas de Lançamento / Changelog (1 item por linha)
                </label>
                <textarea
                  value={changelogText}
                  onChange={(e) => setChangelogText(e.target.value)}
                  rows={3}
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none focus:border-blue-500 font-mono resize-none ${
                    isDark
                      ? 'bg-[#0B0F19] border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-700/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-600/30 cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Transmitindo à VPS...' : 'Publicar e Disparar OTA'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
