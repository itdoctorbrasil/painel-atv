import React, { useState } from 'react';
import { User, Device, DeviceStatus, MenuTab, ThemeMode } from '../types';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Tv,
  Users,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  Smartphone,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Calendar,
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: User;
  devices: Device[];
  users: User[];
  theme?: ThemeMode;
  onNavigateTab: (tab: MenuTab) => void;
  onOpenNewDeviceModal: () => void;
  onUpdateDeviceStatus: (deviceId: string, status: DeviceStatus) => void;
  onRenewDeviceQuick: (deviceId: string, days: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  devices,
  users,
  theme = 'dark',
  onNavigateTab,
  onOpenNewDeviceModal,
  onUpdateDeviceStatus,
  onRenewDeviceQuick,
}) => {
  const isDark = theme === 'dark';
  const isAdmin = currentUser.role === 'admin';

  // Filter devices to this user if reseller
  const userDevices = isAdmin
    ? devices
    : devices.filter((d) => d.resellerId === currentUser.id);

  // Statistics
  const activeCount = userDevices.filter((d) => d.status === 'active').length;
  const blockedCount = userDevices.filter((d) => d.status === 'blocked').length;
  const expiredCount = userDevices.filter((d) => d.status === 'expired').length;
  const expiringSoonCount = userDevices.filter((d) => d.status === 'expiring_soon').length;
  const totalCount = userDevices.length;

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DeviceStatus>('all');

  const filteredDevices = userDevices.filter((d) => {
    const matchesSearch =
      d.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.macAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.resellerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ativo
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Bloqueado
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-400 border border-slate-600/40">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Expirado
          </span>
        );
      case 'expiring_soon':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Por Vencer
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Bar */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border transition-colors ${
          isDark
            ? 'bg-gradient-to-r from-slate-900 via-[#0E1527] to-slate-900 border-slate-800 shadow-xl'
            : 'bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white border-blue-100 shadow-sm'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Olá, {currentUser.name}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-500 border border-blue-500/30">
              {isAdmin ? 'Master ADM' : 'Painel de Revenda'}
            </span>
          </div>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isAdmin
              ? 'Visão macro consolidada de todos os revendedores, caixas conectadas e status do launcher.'
              : `Gerenciando ${userDevices.length} dispositivos cadastrados na sua conta.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewDeviceModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Dispositivo</span>
          </button>
        </div>
      </div>

      {/* 4 Statistics Cards (Ativos, Bloqueados, Expirados, Próximos a Vencer) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ativos */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            statusFilter === 'active'
              ? 'bg-emerald-950/40 border-emerald-500/60 ring-2 ring-emerald-500/30'
              : 'bg-[#0F172A]/80 hover:bg-[#0F172A] border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Clientes Ativos
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {activeCount}
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              {totalCount > 0 ? `${Math.round((activeCount / totalCount) * 100)}%` : '0%'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Acesso liberado no launcher</span>
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-60" />
        </div>

        {/* Bloqueados */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'blocked' ? 'all' : 'blocked')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            statusFilter === 'blocked'
              ? 'bg-rose-950/40 border-rose-500/60 ring-2 ring-rose-500/30'
              : 'bg-[#0F172A]/80 hover:bg-[#0F172A] border-slate-800 hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Clientes Bloqueados
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {blockedCount}
            </span>
            <span className="text-xs font-semibold text-rose-400">
              {blockedCount > 0 ? 'Acesso revogado' : 'Sem bloqueios'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Dispositivos impedidos de carregar canais
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-400 opacity-60" />
        </div>

        {/* Expirados */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'expired' ? 'all' : 'expired')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            statusFilter === 'expired'
              ? 'bg-slate-900 border-slate-600 ring-2 ring-slate-500/30'
              : 'bg-[#0F172A]/80 hover:bg-[#0F172A] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Clientes Expirados
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {expiredCount}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Requer renovação
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Assinaturas vencidas no sistema
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-600 to-slate-500 opacity-60" />
        </div>

        {/* Próximos a Vencer */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'expiring_soon' ? 'all' : 'expiring_soon')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
            statusFilter === 'expiring_soon'
              ? 'bg-amber-950/40 border-amber-500/60 ring-2 ring-amber-500/30'
              : 'bg-[#0F172A]/80 hover:bg-[#0F172A] border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Próximos a Vencer
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {expiringSoonCount}
            </span>
            <span className="text-xs font-semibold text-amber-400">
              Vencendo em até 7 dias
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Oportunidade para cobrar e renovar
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400 opacity-60" />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#0F172A]/90 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              {isAdmin ? 'Todos os Dispositivos da Operação' : 'Meus Dispositivos'}
            </h3>
            <span className="text-xs font-medium text-slate-400">
              ({filteredDevices.length} listados)
            </span>
          </div>

          {/* Search & Filter pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por cliente, MAC, box..."
                className="w-full bg-[#0B0F19] border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-xl border border-slate-700/80 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Ativos
              </button>
              <button
                onClick={() => setStatusFilter('expiring_soon')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === 'expiring_soon'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                A Vencer
              </button>
              <button
                onClick={() => setStatusFilter('blocked')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === 'blocked'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bloqueados
              </button>
              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === 'expired'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Expirados
              </button>
            </div>
          </div>
        </div>

        {/* Table content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-5">Cliente & Identificação</th>
                <th className="py-3.5 px-4">Endereço MAC</th>
                <th className="py-3.5 px-4">Modelo da Box</th>
                {isAdmin && <th className="py-3.5 px-4">Revendedor / Token</th>}
                <th className="py-3.5 px-4">Vencimento</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 7 : 6}
                    className="py-12 text-center text-slate-500"
                  >
                    Nenhum dispositivo encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => {
                  return (
                    <tr
                      key={device.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Cliente */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {device.clientName}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>Visto: {device.lastSeen}</span>
                          <span className="text-slate-600">•</span>
                          <span className="font-mono text-slate-500">{device.ipAddress}</span>
                        </div>
                      </td>

                      {/* MAC */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-800/40">
                          {device.macAddress}
                        </span>
                      </td>

                      {/* Modelo */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">{device.deviceModel}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          App {device.appVersion}
                        </div>
                      </td>

                      {/* Revendedor (ADM only) */}
                      {isAdmin && (
                        <td className="py-3.5 px-4">
                          <div className="text-slate-300 font-medium">{device.resellerName}</div>
                          <div className="text-[10px] text-cyan-400/80 font-mono">
                            {device.resellerToken}
                          </div>
                        </td>
                      )}

                      {/* Vencimento */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{device.expiresAt}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(device.status)}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Renew +30 days */}
                          <button
                            onClick={() => onRenewDeviceQuick(device.id, 30)}
                            title="Renovar por +30 dias"
                            className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-medium text-[11px] border border-emerald-500/30 transition-all cursor-pointer"
                          >
                            +30d
                          </button>

                          {/* Toggle Block / Activate */}
                          {device.status === 'blocked' ? (
                            <button
                              onClick={() => onUpdateDeviceStatus(device.id, 'active')}
                              title="Desbloquear dispositivo"
                              className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onUpdateDeviceStatus(device.id, 'blocked')}
                              title="Bloquear dispositivo"
                              className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & pagination */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>
            Mostrando <strong>{filteredDevices.length}</strong> de{' '}
            <strong>{userDevices.length}</strong> caixas cadastradas
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab(isAdmin ? 'clients' : 'devices')}
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              <span>Abrir gerenciador avançado</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
