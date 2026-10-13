import React, { useState } from 'react';
import { User, Device, DeviceStatus, ThemeMode } from '../types';
import {
  Smartphone,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Edit2,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  X,
  Sparkles,
  KeyRound,
  Tv,
  RefreshCw,
} from 'lucide-react';

interface DevicesViewProps {
  currentUser: User;
  devices: Device[];
  theme?: ThemeMode;
  isLoading?: boolean;
  onRefresh?: () => void;
  onAddDevice: (newDev: Omit<Device, 'id' | 'createdAt' | 'lastSeen' | 'appVersion' | 'ipAddress'>) => Promise<void> | void;
  onUpdateDevice: (device: Device) => Promise<void> | void;
  onDeleteDevice: (deviceId: string) => Promise<void> | void;
  onUpdateStatus: (deviceId: string, status: DeviceStatus) => Promise<void> | void;
  isModalOpenExternal?: boolean;
  setIsModalOpenExternal?: (open: boolean) => void;
}

export const DevicesView: React.FC<DevicesViewProps> = ({
  currentUser,
  devices,
  theme = 'dark',
  isLoading = false,
  onRefresh,
  onAddDevice,
  onUpdateDevice,
  onDeleteDevice,
  onUpdateStatus,
  isModalOpenExternal,
  setIsModalOpenExternal,
}) => {
  const isDark = theme === 'dark';
  const isAdmin = currentUser.role === 'admin';

  // Reseller sees only their devices; ADM in this view sees active scope
  const targetDevices = isAdmin
    ? devices
    : devices.filter((d) => d.resellerId === currentUser.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DeviceStatus>('all');

  // Modal State
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const isModalOpen = isModalOpenExternal !== undefined ? isModalOpenExternal : internalModalOpen;
  const setModalOpen = (open: boolean) => {
    if (setIsModalOpenExternal) setIsModalOpenExternal(open);
    setInternalModalOpen(open);
  };

  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  // Form Fields
  const [clientName, setClientName] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [deviceModel, setDeviceModel] = useState('Xiaomi Mi Box S 4K');
  const [notes, setNotes] = useState('');
  const [activeShortcut, setActiveShortcut] = useState<number | null>(30);

  // Auto-format MAC address as user types (XX:XX:XX:XX:XX:XX)
  const handleMacChange = (value: string) => {
    // Keep only hexadecimal characters
    const clean = value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
    const parts: string[] = [];
    for (let i = 0; i < clean.length && i < 12; i += 2) {
      parts.push(clean.substring(i, i + 2));
    }
    setMacAddress(parts.join(':'));
  };

  // Quick preset helper
  const applyDateShortcut = (days: number) => {
    setActiveShortcut(days);
    const date = new Date();
    date.setDate(date.getDate() + days);
    setExpiresAt(date.toISOString().split('T')[0]);
  };

  const openCreateModal = () => {
    setEditingDevice(null);
    setClientName('');
    setMacAddress('');
    applyDateShortcut(30);
    setDeviceModel('Xiaomi Mi Box S 4K');
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (dev: Device) => {
    setEditingDevice(dev);
    setClientName(dev.clientName);
    setMacAddress(dev.macAddress);
    setExpiresAt(dev.expiresAt);
    setDeviceModel(dev.deviceModel);
    setNotes(dev.notes || '');
    setActiveShortcut(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !macAddress.trim() || !expiresAt) return;

    if (editingDevice) {
      onUpdateDevice({
        ...editingDevice,
        clientName: clientName.trim(),
        macAddress: macAddress.trim().toUpperCase(),
        expiresAt,
        deviceModel,
        notes: notes.trim(),
      });
    } else {
      onAddDevice({
        clientName: clientName.trim(),
        macAddress: macAddress.trim().toUpperCase(),
        resellerId: currentUser.id,
        resellerName: currentUser.name,
        resellerToken: currentUser.token,
        expiresAt,
        status: 'active',
        deviceModel,
        notes: notes.trim(),
      });
    }

    setModalOpen(false);
  };

  // Filter devices
  const filtered = targetDevices.filter((d) => {
    const matchesSearch =
      d.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.macAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.deviceModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0F172A]/80 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-extrabold text-white">
              Gestão de Dispositivos & Cadastro
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cadastre novas TV Boxes pelo MAC Address e defina a validade das assinaturas com atalhos rápidos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Recarregar da VPS"
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          )}

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Dispositivo</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#0F172A]/60 border border-slate-800 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, MAC, modelo..."
            className="w-full bg-[#0B0F19] border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'Todos' },
              { id: 'active', label: 'Ativos' },
              { id: 'expiring_soon', label: 'A Vencer' },
              { id: 'blocked', label: 'Bloqueados' },
              { id: 'expired', label: 'Expirados' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === item.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Devices List Table */}
      <div className="bg-[#0F172A]/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-5">Cliente / Usuário</th>
                <th className="py-3.5 px-4">Endereço MAC</th>
                <th className="py-3.5 px-4">Modelo do Aparelho</th>
                <th className="py-3.5 px-4">Vencimento</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Gerenciar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Nenhum dispositivo encontrado. Clique em "Cadastrar Novo Dispositivo" para adicionar.
                  </td>
                </tr>
              ) : (
                filtered.map((device) => (
                  <tr
                    key={device.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 sm:px-5">
                      <div className="font-semibold text-white">{device.clientName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {device.notes || 'Sem observações'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-800/40">
                        {device.macAddress}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">{device.deviceModel}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Último IP: {device.ipAddress}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{device.expiresAt}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {device.status === 'active' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Ativo
                        </span>
                      )}
                      {device.status === 'expiring_soon' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          Por Vencer
                        </span>
                      )}
                      {device.status === 'blocked' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          Bloqueado
                        </span>
                      )}
                      {device.status === 'expired' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-400 border border-slate-600/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          Expirado
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(device)}
                          title="Editar cadastro"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {device.status === 'blocked' ? (
                          <button
                            onClick={() => onUpdateStatus(device.id, 'active')}
                            title="Desbloquear"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onUpdateStatus(device.id, 'blocked')}
                            title="Bloquear"
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteDevice(device.id)}
                          title="Excluir dispositivo"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Cadastrar / Editar Novo Dispositivo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0F172A] border border-slate-700 rounded-3xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingDevice ? 'Editar Dispositivo' : 'Cadastrar Novo Dispositivo'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Vincule a TV Box através do MAC Address para liberação no launcher
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Nome do Cliente */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Nome do Cliente <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo - Sala de Estar"
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* MAC Address do Dispositivo */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    MAC Address do Dispositivo <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-cyan-400">
                    Ex: 00:1A:79:B4:9C:21
                  </span>
                </div>
                <input
                  type="text"
                  value={macAddress}
                  onChange={(e) => handleMacChange(e.target.value)}
                  placeholder="XX:XX:XX:XX:XX:XX"
                  maxLength={17}
                  className="w-full font-mono font-bold text-cyan-300 bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Formatado automaticamente em maiúsculas com separação de dois pontos.
                </p>
              </div>

              {/* Data de Vencimento com BOTÕES DE ATALHO RÁPIDO (30, 60, 90, 180, 360 dias) */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    Data de Vencimento <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-blue-400 font-semibold">
                    Atalhos Pré-definidos
                  </span>
                </div>

                {/* BOTÕES DE ATALHO RÁPIDO (30, 60, 90, 180 ou 360 dias) */}
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { days: 30, label: '30 dias', sub: '1 Mês' },
                    { days: 60, label: '60 dias', sub: '2 Meses' },
                    { days: 90, label: '90 dias', sub: 'Trimestre' },
                    { days: 180, label: '180 dias', sub: 'Semestre' },
                    { days: 360, label: '360 dias', sub: '1 Ano' },
                  ].map((preset) => {
                    const isSelected = activeShortcut === preset.days;
                    return (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => applyDateShortcut(preset.days)}
                        className={`py-2 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-600/30 font-bold'
                            : 'bg-[#0B0F19] hover:bg-slate-800 border-slate-700/80 text-slate-300'
                        }`}
                      >
                        <div className="text-xs">{preset.label}</div>
                        <div className="text-[9px] opacity-75">{preset.sub}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Input de Data */}
                <div>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => {
                      setExpiresAt(e.target.value);
                      setActiveShortcut(null);
                    }}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Modelo da Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Modelo do Aparelho / TV Box
                </label>
                <select
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Xiaomi Mi Box S 4K (2nd Gen)">Xiaomi Mi Box S 4K (2nd Gen)</option>
                  <option value="Amazon Fire TV Stick 4K Max">Amazon Fire TV Stick 4K Max</option>
                  <option value="Aquário STV-3000 4K">Aquário STV-3000 4K</option>
                  <option value="TX9 Pro Android 11">TX9 Pro Android 11</option>
                  <option value="BTV Cast B13 Ultra HD">BTV Cast B13 Ultra HD</option>
                  <option value="Chromecast com Google TV">Chromecast com Google TV</option>
                  <option value="Outro Modelo Android TV">Outro Modelo Android TV</option>
                </select>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Notas / Observações (Opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Contato via WhatsApp (11) 99999-9999, cliente solicitou canais esportivos."
                  rows={2}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  {editingDevice ? 'Salvar Alterações' : 'Concluir Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
