import React, { useState } from 'react';
import { User, Device, ThemeMode } from '../types';
import {
  Users,
  Plus,
  KeyRound,
  LogIn,
  ShieldCheck,
  ShieldAlert,
  Search,
  Lock,
  Calendar,
  Copy,
  Check,
  Smartphone,
  X,
  UserPlus,
  Sparkles,
  Edit2,
  Trash2,
  RefreshCw,
  Server,
  AlertTriangle,
} from 'lucide-react';

interface ClientsViewProps {
  users: User[];
  devices: Device[];
  theme?: ThemeMode;
  isLoading?: boolean;
  onRefresh?: () => void;
  onImpersonateUser: (user: User) => void;
  onAddClient: (newClient: Omit<User, 'id' | 'createdAt' | 'devicesCount'> & { password?: string }) => Promise<void>;
  onUpdateClient: (userId: string, data: Partial<User> & { password?: string }) => Promise<void>;
  onDeleteClient: (userId: string) => Promise<void>;
  onUpdateClientStatus: (userId: string, status: 'active' | 'blocked') => Promise<void>;
  onResetPassword: (userId: string, newPass: string) => Promise<void>;
  onAddDeviceForClient?: (client: User) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  users,
  devices,
  theme = 'dark',
  isLoading = false,
  onRefresh,
  onImpersonateUser,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onUpdateClientStatus,
  onResetPassword,
  onAddDeviceForClient,
}) => {
  const isDark = theme === 'dark';
  const resellers = users.filter((u) => u.role === 'reseller');

  const [searchTerm, setSearchTerm] = useState('');
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null);

  // Form Fields - Create
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newMaxDevices, setNewMaxDevices] = useState(150);
  const [newExpiresAt, setNewExpiresAt] = useState('2027-12-31');
  const [generatedToken, setGeneratedToken] = useState('TOKEN-BR-SP-9041');

  // Form Fields - Edit
  const [editName, setEditName] = useState('');
  const [editMaxDevices, setEditMaxDevices] = useState(150);
  const [editExpiresAt, setEditExpiresAt] = useState('2027-12-31');
  const [editPhone, setEditPhone] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Password Reset
  const [newPassInput, setNewPassInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateRandomToken = () => {
    const letters = ['SP', 'RJ', 'MG', 'RS', 'PR', 'BA', 'PE', 'SC'];
    const randomRegion = letters[Math.floor(Math.random() * letters.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setGeneratedToken(`TOKEN-BR-${randomRegion}-${randomNum}`);
  };

  const copyToken = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  // Open Edit Modal
  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditMaxDevices(u.maxDevices);
    setEditExpiresAt(u.expiresAt);
    setEditPhone(u.phone || '');
    setEditNotes(u.notes || '');
    setIsEditModalOpen(true);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim() || !newPassword.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddClient({
        name: newName.trim(),
        username: newUsername.trim().toLowerCase(),
        password: newPassword.trim(),
        role: 'reseller',
        token: generatedToken,
        email: newEmail.trim() || `${newUsername.trim().toLowerCase()}@atvlauncher.pro`,
        maxDevices: Number(newMaxDevices),
        status: 'active',
        expiresAt: newExpiresAt,
        phone: newPhone.trim(),
      });
      setIsAddModalOpen(false);
      setNewName('');
      setNewUsername('');
      setNewPassword('');
      setNewEmail('');
      setNewPhone('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      await onUpdateClient(editingUser.id, {
        name: editName.trim(),
        maxDevices: Number(editMaxDevices),
        expiresAt: editExpiresAt,
        phone: editPhone.trim(),
        notes: editNotes.trim(),
      });
      setIsEditModalOpen(false);
      setEditingUser(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !newPassInput.trim()) return;

    setIsSubmitting(true);
    try {
      await onResetPassword(passwordModalUser.id, newPassInput.trim());
      setPasswordModalUser(null);
      setNewPassInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalUser) return;

    setIsSubmitting(true);
    try {
      await onDeleteClient(deleteModalUser.id);
      setDeleteModalUser(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredResellers = resellers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.token.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Users className="w-5 h-5 text-blue-500" />
            <h1 className={`text-xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Gestão de Clientes & Suporte
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
              CRUD Real /api/resellers
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Cadastre, edite limites, redefina senhas e acerte permissões das contas de revendedores conectadas à VPS.
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
            onClick={() => {
              generateRandomToken();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Novo Revendedor</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div
        className={`flex items-center justify-between gap-3 p-4 rounded-2xl border ${
          isDark ? 'bg-[#0F172A]/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por revendedor, usuário, token..."
            className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs border focus:outline-none focus:border-blue-500 ${
              isDark
                ? 'bg-[#0B0F19] border-slate-700/80 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>
        <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Total de <strong>{filteredResellers.length}</strong> revendedores cadastrados
        </div>
      </div>

      {/* Reseller Accounts List */}
      <div
        className={`rounded-3xl border shadow-xl overflow-hidden ${
          isDark ? 'bg-[#0F172A]/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                  isDark
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <th className="py-3.5 px-4 sm:px-5">Revendedor / Usuário</th>
                <th className="py-3.5 px-4">Token Exclusivo</th>
                <th className="py-3.5 px-4">Limite de Caixas</th>
                <th className="py-3.5 px-4">Validade da Parceria</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ações & Suporte</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y text-xs ${
                isDark ? 'divide-slate-800/60 text-slate-200' : 'divide-slate-200 text-slate-700'
              }`}
            >
              {filteredResellers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Nenhum revendedor encontrado na base da VPS.
                  </td>
                </tr>
              ) : (
                filteredResellers.map((user) => {
                  const clientDeviceCount = devices.filter(
                    (d) => d.resellerId === user.id || d.resellerToken === user.token
                  ).length;

                  return (
                    <tr
                      key={user.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Name & Username */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {user.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="font-mono text-blue-500 font-semibold">@{user.username}</span>
                          <span>•</span>
                          <span>{user.email}</span>
                          {user.phone && (
                            <>
                              <span>•</span>
                              <span>{user.phone}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Unique Token */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-cyan-500 bg-cyan-950/20 px-2.5 py-1 rounded-md border border-cyan-800/30 text-[11px]">
                            {user.token}
                          </span>
                          <button
                            onClick={() => copyToken(user.token, user.id)}
                            className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Copiar Token"
                          >
                            {copiedTokenId === user.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Device Count & Limit */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                          <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {clientDeviceCount}
                          </span>
                          <span className="text-slate-500">/ {user.maxDevices} caixas</span>
                        </div>
                        <div className="w-28 bg-slate-700/30 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((clientDeviceCount / user.maxDevices) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </td>

                      {/* Expiration */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.expiresAt}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {user.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Bloqueado
                          </span>
                        )}
                      </td>

                      {/* Actions: Logar como Cliente, Editar, Alterar Senha, Bloquear, Excluir */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Logar como Cliente */}
                          <button
                            onClick={() => onImpersonateUser(user)}
                            title="Entrar no painel deste cliente para prestar suporte e cadastrar dispositivos"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-500 border border-blue-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Logar</span>
                          </button>

                          {/* Editar informações e limites */}
                          <button
                            onClick={() => openEditModal(user)}
                            title="Editar informações do revendedor (PUT /api/resellers/:id)"
                            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                              isDark
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            }`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Alterar Senha */}
                          <button
                            onClick={() => {
                              setPasswordModalUser(user);
                              setNewPassInput('');
                            }}
                            title="Redefinir senha"
                            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                              isDark
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            }`}
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>

                          {/* Bloquear / Ativar */}
                          {user.status === 'active' ? (
                            <button
                              onClick={() => onUpdateClientStatus(user.id, 'blocked')}
                              title="Bloquear conta do revendedor"
                              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer border border-rose-500/20"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onUpdateClientStatus(user.id, 'active')}
                              title="Desbloquear conta do revendedor"
                              className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors cursor-pointer border border-emerald-500/20"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Excluir Conta (DELETE /api/resellers/:id) */}
                          <button
                            onClick={() => setDeleteModalUser(user)}
                            title="Excluir revendedor da VPS"
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer border border-rose-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CADASTRAR NOVO REVENDEDOR (POST /api/resellers) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className={`w-full max-w-lg border rounded-3xl shadow-2xl p-6 relative ${
              isDark ? 'bg-[#0F172A] border-slate-700' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-500">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Cadastrar Novo Revendedor</h3>
                  <p className="text-xs text-slate-400">
                    Cria conta no backend VPS via POST /api/resellers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider">
                  Nome Completo / Razão Social <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: João Silveira (Stream TV)"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:border-blue-500 ${
                    isDark
                      ? 'bg-[#0B0F19] border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider">
                    Usuário de Login <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="revenda_sp"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:border-blue-500 ${
                      isDark
                        ? 'bg-[#0B0F19] border-slate-700 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider">
                    Senha Inicial <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="senha@123"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:border-blue-500 ${
                      isDark
                        ? 'bg-[#0B0F19] border-slate-700 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Token do Revendedor */}
              <div
                className={`p-3.5 rounded-2xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    Token Exclusivo do Revendedor
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomToken}
                    className="text-[11px] text-cyan-500 hover:underline font-semibold cursor-pointer"
                  >
                    Gerar Novo
                  </button>
                </div>
                <div className="font-mono font-bold text-sm text-cyan-400 bg-black/40 p-2.5 rounded-xl border border-slate-700/60">
                  {generatedToken}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider">
                    Limite Máximo de Caixas
                  </label>
                  <input
                    type="number"
                    value={newMaxDevices}
                    onChange={(e) => setNewMaxDevices(Number(e.target.value))}
                    min={1}
                    className={`w-full rounded-xl px-3.5 py-2 text-xs border focus:outline-none focus:border-blue-500 ${
                      isDark
                        ? 'bg-[#0B0F19] border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider">
                    Validade da Parceria
                  </label>
                  <input
                    type="date"
                    value={newExpiresAt}
                    onChange={(e) => setNewExpiresAt(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2 text-xs border focus:outline-none focus:border-blue-500 ${
                      isDark
                        ? 'bg-[#0B0F19] border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-700/40">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Cadastrando na VPS...' : 'Criar Revendedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR INFORMAÇÕES E LIMITES (PUT /api/resellers/:id) */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className={`w-full max-w-lg border rounded-3xl shadow-2xl p-6 relative ${
              isDark ? 'bg-[#0F172A] border-slate-700' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-500">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Editar Conta do Revendedor</h3>
                  <p className="text-xs text-slate-400">
                    Alterar limites e dados cadastrais (PUT /api/resellers/{editingUser.id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider">
                  Nome do Revendedor
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:border-blue-500 ${
                    isDark
                      ? 'bg-[#0B0F19] border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider">
                    Limite Máximo de Caixas
                  </label>
                  <input
                    type="number"
                    value={editMaxDevices}
                    onChange={(e) => setEditMaxDevices(Number(e.target.value))}
                    min={1}
                    className={`w-full rounded-xl px-3.5 py-2 text-xs border focus:outline-none focus:border-blue-500 ${
                      isDark
                        ? 'bg-[#0B0F19] border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    value={editExpiresAt}
                    onChange={(e) => setEditExpiresAt(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2 text-xs border focus:outline-none focus:border-blue-500 ${
                      isDark
                        ? 'bg-[#0B0F19] border-slate-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className={`w-full rounded-xl px-3.5 py-2 text-xs border focus:outline-none focus:border-blue-500 ${
                    isDark
                      ? 'bg-[#0B0F19] border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider">
                  Notas / Observações
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className={`w-full rounded-xl px-3.5 py-2 text-xs border focus:outline-none focus:border-blue-500 resize-none ${
                    isDark
                      ? 'bg-[#0B0F19] border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-700/40">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Salvando na VPS...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REDEFINIR SENHA */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm border rounded-3xl shadow-2xl p-6 relative ${
              isDark ? 'bg-[#0F172A] border-slate-700' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                Redefinir Senha do Revendedor
              </h3>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Defina a nova senha para <strong className="text-blue-400">{passwordModalUser.name}</strong> (@{passwordModalUser.username}).
            </p>

            <form onSubmit={handleSavePassword} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-wider">
                  Nova Senha
                </label>
                <input
                  type="text"
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  placeholder="Digite a nova senha segura"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:border-blue-500 ${
                    isDark
                      ? 'bg-[#0B0F19] border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? 'Atualizando...' : 'Gravar Nova Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRMAÇÃO DE EXCLUSÃO (DELETE /api/resellers/:id) */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-sm border rounded-3xl shadow-2xl p-6 relative ${
              isDark ? 'bg-[#0F172A] border-slate-700' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 mb-3 text-rose-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold">Excluir Revendedor?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Você está prestes a remover permanentemente a conta de{' '}
              <strong className="text-white">{deleteModalUser.name}</strong> (@{deleteModalUser.username}).
            </p>

            <p className="text-[11px] text-slate-500 mt-2">
              Esta ação enviará um comando <strong>DELETE /api/resellers/{deleteModalUser.id}</strong> para a VPS.
            </p>

            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
