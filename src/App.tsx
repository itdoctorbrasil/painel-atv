import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Device,
  DeviceStatus,
  AppItem,
  AdvertisingConfig,
  LogoConfig,
  OTARelease,
  MenuTab,
  ToastMessage,
  ThemeMode,
} from './types';
import { api } from './services/api';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DevicesView } from './components/DevicesView';
import { ClientsView } from './components/ClientsView';
import { AdvertisingView } from './components/AdvertisingView';
import { AppsView } from './components/AppsView';
import { LogoView } from './components/LogoView';
import { DownloadView } from './components/DownloadView';
import { OTAView } from './components/OTAView';
import { TVLauncherPreviewModal } from './components/TVLauncherPreviewModal';
import { ToastContainer } from './components/Toast';

export default function App() {
  // Theme Mode State (Dark Mode vs Light Mode)
  const [theme, setTheme] = useState<ThemeMode>('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Authentication State: Check stored user in localStorage or require real login
  const [currentUser, setCurrentUser] = useState<User | null>(() => api.getStoredUser());
  const [masterAdminBackup, setMasterAdminBackup] = useState<User | null>(() => {
    const stored = api.getStoredUser();
    return stored?.role === 'admin' ? stored : null;
  });
  const [impersonatingUser, setImpersonatingUser] = useState<User | null>(null);

  // Applet Data State (Synchronized with VPS backend)
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [advertising, setAdvertising] = useState<AdvertisingConfig>({
    backgroundUrl: '',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    bannerText: 'o que você quiser',
  });
  const [logo, setLogo] = useState<LogoConfig>({
    logoUrl: '',
    brandName: 'ATV LAUNCHER',
  });
  const [otaReleases, setOtaReleases] = useState<OTARelease[]>([]);

  // Navigation & Modals State
  const [activeTab, setActiveTab] = useState<MenuTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTVPreviewOpen, setIsTVPreviewOpen] = useState(false);
  const [isNewDeviceModalOpen, setIsNewDeviceModalOpen] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // -------------------------------------------------------------
  // CARREGAR DADOS REAIS DA VPS
  // -------------------------------------------------------------
  const loadVpsData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingData(true);

    try {
      // 1. Devices (GET /api/devices)
      const fetchedDevices = await api.getDevices().catch(() => []);
      setDevices(fetchedDevices);

      // 2. Launcher Config & Apps (GET /api/launcher/config & /api/launcher/apps)
      const [configData, appsData] = await Promise.all([
        api.getLauncherConfig().catch(() => null),
        api.getLauncherApps().catch(() => []),
      ]);

      if (configData) {
        setAdvertising(configData.advertising);
        setLogo(configData.logo);
      }
      if (appsData && appsData.length > 0) {
        setApps(appsData);
      }

      // 3. Admin-specific: Resellers & OTA
      if (currentUser.role === 'admin') {
        const [resellersData, otaData] = await Promise.all([
          api.getResellers().catch(() => []),
          api.getOtaList().catch(() => []),
        ]);
        setUsers(resellersData);
        setOtaReleases(otaData);
      }
    } catch (err: any) {
      console.warn('[VPS] Falha ao sincronizar dados iniciais:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadVpsData();
    }
  }, [currentUser, loadVpsData]);

  // Login handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setMasterAdminBackup(user);
    }
    setImpersonatingUser(null);
    setActiveTab('dashboard');
    addToast(
      `Conectado com Sucesso!`,
      user.role === 'admin'
        ? `Autenticado como Master ADM na VPS 177.153.68.5:8080.`
        : `Acesso autenticado para seu Token de Revendedor: ${user.token}`,
      'success'
    );
  };

  // Logout handler
  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setImpersonatingUser(null);
    addToast('Sessão Encerrada', 'Desconectado da VPS com sucesso.', 'info');
  };

  // Quick Profile Switcher for Demonstration
  const handleSwitchProfileDemo = () => {
    if (!currentUser) return;

    if (currentUser.role === 'admin') {
      const resellerUser = users.find((u) => u.role === 'reseller') || {
        id: 'user-revenda-demo',
        username: 'revenda_sp',
        name: 'Carlos Silva (Revenda SP)',
        role: 'reseller' as const,
        token: 'TOKEN-BR-SP-9041',
        email: 'carlos.sp@iptvbrasil.tv',
        maxDevices: 250,
        status: 'active' as const,
        expiresAt: '2027-06-30',
        createdAt: '2025-01-01',
        devicesCount: 2,
      };
      setMasterAdminBackup(currentUser);
      setCurrentUser(resellerUser);
      setImpersonatingUser(null);
      if (activeTab === 'clients' || activeTab === 'ota') {
        setActiveTab('dashboard');
      }
      addToast(
        'Visualização Alternada: Revendedor',
        `Você agora está na visão de revenda (${resellerUser.name}). O menu OTA e visão global foram ocultados.`,
        'info'
      );
    } else {
      const adminUser = masterAdminBackup || {
        id: 'user-admin',
        username: 'admin',
        name: 'Administrador Master',
        role: 'admin' as const,
        token: 'MASTER-ADM-TOKEN',
        email: 'admin@atvlauncher.pro',
        maxDevices: 99999,
        status: 'active' as const,
        expiresAt: '2030-12-31',
        createdAt: '2025-01-01',
        devicesCount: devices.length,
      };
      setCurrentUser(adminUser);
      setImpersonatingUser(null);
      addToast(
        'Visualização Alternada: Master ADM',
        'Visão global reativada com controle OTA e suporte a clientes.',
        'info'
      );
    }
  };

  // Impersonate customer ("Logar como Cliente")
  const handleImpersonateUser = (targetUser: User) => {
    if (currentUser?.role === 'admin') {
      setMasterAdminBackup(currentUser);
    }
    setImpersonatingUser(targetUser);
    setCurrentUser(targetUser);
    setActiveTab('devices');
    addToast(
      'Modo Suporte Ativado',
      `Você está logado na visão do cliente ${targetUser.name}. Você pode cadastrar dispositivos diretamente nesta conta.`,
      'warning'
    );
  };

  // Stop impersonating customer
  const handleStopImpersonating = () => {
    const adminUser = masterAdminBackup || {
      id: 'user-admin',
      username: 'admin',
      name: 'Administrador Master',
      role: 'admin' as const,
      token: 'MASTER-ADM-TOKEN',
      email: 'admin@atvlauncher.pro',
      maxDevices: 99999,
      status: 'active' as const,
      expiresAt: '2030-12-31',
      createdAt: '2025-01-01',
      devicesCount: devices.length,
    };
    setCurrentUser(adminUser);
    setImpersonatingUser(null);
    setActiveTab('clients');
    addToast(
      'Retorno ao Master ADM',
      'Você voltou à sua conta administrativa principal.',
      'success'
    );
  };

  // -------------------------------------------------------------
  // DEVICE ACTIONS (POST, PUT, DELETE via /api/devices na VPS)
  // -------------------------------------------------------------
  const handleAddDevice = async (
    newDevData: Omit<Device, 'id' | 'createdAt' | 'lastSeen' | 'appVersion' | 'ipAddress'>
  ) => {
    try {
      const created = await api.createDevice(newDevData);
      setDevices((prev) => [created, ...prev]);
      addToast(
        'Dispositivo Salvo na VPS!',
        `MAC ${created.macAddress} cadastrado via POST /api/devices.`,
        'success'
      );
    } catch (err: any) {
      addToast('Erro ao Salvar Dispositivo', err.message || 'Falha na VPS', 'error');
    }
  };

  const handleUpdateDevice = async (updated: Device) => {
    try {
      await api.updateDevice(updated.id, updated);
      setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      addToast(
        'Dispositivo Atualizado na VPS',
        `Alterações salvas para "${updated.clientName}".`,
        'success'
      );
    } catch (err: any) {
      addToast('Erro ao Atualizar', err.message || 'Falha na VPS', 'error');
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      await api.deleteDevice(deviceId);
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
      addToast(
        'Dispositivo Removido',
        `Dispositivo ID ${deviceId} excluído da VPS via DELETE /api/devices.`,
        'info'
      );
    } catch (err: any) {
      addToast('Erro ao Deletar', err.message || 'Falha na VPS', 'error');
    }
  };

  const handleUpdateDeviceStatus = async (deviceId: string, status: DeviceStatus) => {
    const target = devices.find((d) => d.id === deviceId);
    if (!target) return;
    const updated = { ...target, status };

    try {
      await api.updateDevice(deviceId, updated);
      setDevices((prev) => prev.map((d) => (d.id === deviceId ? updated : d)));
      addToast(
        status === 'active' ? 'Dispositivo Ativado' : 'Dispositivo Bloqueado',
        `Status na VPS alterado para ${status.toUpperCase()}.`,
        status === 'active' ? 'success' : 'warning'
      );
    } catch (err: any) {
      addToast('Erro ao Alterar Status', err.message || 'Falha na VPS', 'error');
    }
  };

  const handleRenewDeviceQuick = async (deviceId: string, days: number) => {
    const target = devices.find((d) => d.id === deviceId);
    if (!target) return;

    const currentExp = new Date(target.expiresAt);
    const baseDate = isNaN(currentExp.getTime()) || currentExp < new Date() ? new Date() : currentExp;
    baseDate.setDate(baseDate.getDate() + days);

    const updated: Device = {
      ...target,
      expiresAt: baseDate.toISOString().split('T')[0],
      status: 'active',
    };

    try {
      await api.updateDevice(deviceId, updated);
      setDevices((prev) => prev.map((d) => (d.id === deviceId ? updated : d)));
      addToast(
        'Renovação Registrada na VPS!',
        `Prorrogado por +${days} dias para "${target.clientName}".`,
        'success'
      );
    } catch (err: any) {
      addToast('Erro ao Renovar', err.message || 'Falha na VPS', 'error');
    }
  };

  // -------------------------------------------------------------
  // RESELLER / CLIENT ACTIONS (CRUD via /api/resellers na VPS)
  // -------------------------------------------------------------
  const handleAddClient = async (
    newClientData: Omit<User, 'id' | 'createdAt' | 'devicesCount'> & { password?: string }
  ) => {
    try {
      const created = await api.createReseller(newClientData);
      setUsers((prev) => [created, ...prev.filter((u) => u.id !== created.id)]);
      addToast(
        'Revendedor Cadastrado na VPS!',
        `Revenda "${created.name}" criada com Token ${created.token}.`,
        'success'
      );
    } catch (err: any) {
      addToast('Erro ao Criar Revendedor', err.message || 'Falha na VPS', 'error');
    }
  };

  const handleUpdateClient = async (userId: string, data: Partial<User> & { password?: string }) => {
    try {
      await api.updateReseller(userId, data);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...data } : u)));
      addToast(
        'Revendedor Atualizado na VPS',
        `Informações e limites salvos via PUT /api/resellers/${userId}.`,
        'success'
      );
    } catch (err: any) {
      addToast('Erro ao Atualizar', err.message || 'Falha na VPS', 'error');
    }
  };

  const handleDeleteClient = async (userId: string) => {
    try {
      await api.deleteReseller(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      addToast(
        'Revendedor Excluído',
        `Conta removida da VPS via DELETE /api/resellers/${userId}.`,
        'info'
      );
    } catch (err: any) {
      addToast('Erro ao Excluir', err.message || 'Falha na VPS', 'error');
    }
  };

  const handleUpdateClientStatus = async (userId: string, status: 'active' | 'blocked') => {
    try {
      await api.updateReseller(userId, { status });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)));
      addToast(
        status === 'active' ? 'Revenda Ativada' : 'Revenda Bloqueada',
        `Status atualizado na VPS com sucesso.`,
        status === 'active' ? 'success' : 'warning'
      );
    } catch (err: any) {
      addToast('Erro ao Alterar Status', err.message || 'Falha na VPS', 'error');
    }
  };

  const handleResetPassword = async (userId: string, newPass: string) => {
    try {
      await api.updateReseller(userId, { password: newPass });
      addToast(
        'Senha Redefinida na VPS!',
        'A nova credencial de acesso foi gravada no servidor.',
        'success'
      );
    } catch (err: any) {
      addToast('Erro ao Redefinir Senha', err.message || 'Falha na VPS', 'error');
    }
  };

  // -------------------------------------------------------------
  // LAUNCHER CONFIG & APPS (POST /api/launcher/config e /launcher/apps)
  // -------------------------------------------------------------
  const handleSaveAdvertising = async (newConfig: AdvertisingConfig) => {
    setAdvertising(newConfig);
    try {
      await api.updateLauncherConfig({ advertising: newConfig, logo });
      addToast(
        'Publicidade Salva na VPS!',
        'Imagem de fundo e vídeo propagados para o launcher Android TV.',
        'success'
      );
    } catch (err: any) {
      addToast('Erro ao Salvar na VPS', err.message || 'Falha de conexão', 'error');
    }
  };

  const handleSaveLogo = async (newConfig: LogoConfig) => {
    setLogo(newConfig);
    try {
      await api.updateLauncherConfig({ advertising, logo: newConfig });
      addToast(
        'Logomarca Salva na VPS!',
        'Posicionamento e URL da logo atualizados no launcher.',
        'success'
      );
    } catch (err: any) {
      addToast('Erro ao Salvar na VPS', err.message || 'Falha de conexão', 'error');
    }
  };

  const handleUpdateAllApps = async (updatedApps: AppItem[]) => {
    setApps(updatedApps);
    try {
      await api.updateLauncherApps(updatedApps);
      addToast(
        'Grade de 5 Apps Atualizada na VPS!',
        'Pacotes e ícones salvos via POST /api/launcher/apps.',
        'success'
      );
    } catch (err: any) {
      addToast('Erro ao Salvar Apps', err.message || 'Falha de conexão', 'error');
    }
  };

  // -------------------------------------------------------------
  // OTA ACTIONS (/api/ota na VPS)
  // -------------------------------------------------------------
  const handleAddOTARelease = async (
    newOtaData: Omit<OTARelease, 'id' | 'releaseDate' | 'downloadCount' | 'successRate'>
  ) => {
    try {
      const created = await api.createOta(newOtaData);
      setOtaReleases((prev) => [created, ...prev]);
      addToast(
        'Disparo OTA Enviado à VPS!',
        `Versão ${created.version} registrada via POST /api/ota.`,
        'success'
      );
    } catch (err: any) {
      addToast('Erro no Disparo OTA', err.message || 'Falha na VPS', 'error');
    }
  };

  const handleToggleOTAStatus = async (releaseId: string) => {
    const target = otaReleases.find((o) => o.id === releaseId);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'paused' : 'active';

    try {
      await api.updateOta(releaseId, { status: newStatus });
      setOtaReleases((prev) =>
        prev.map((o) => (o.id === releaseId ? { ...o, status: newStatus } : o))
      );
      addToast(
        'Status OTA Atualizado na VPS',
        `Distribuição do pacote agora está ${newStatus.toUpperCase()}.`,
        'info'
      );
    } catch (err: any) {
      addToast('Erro ao Alterar OTA', err.message || 'Falha na VPS', 'error');
    }
  };

  const handleDeleteOTARelease = async (releaseId: string) => {
    try {
      await api.deleteOta(releaseId);
      setOtaReleases((prev) => prev.filter((o) => o.id !== releaseId));
      addToast('Pacote OTA Removido', `Versão excluída da VPS.`, 'info');
    } catch (err: any) {
      addToast('Erro ao Excluir OTA', err.message || 'Falha na VPS', 'error');
    }
  };

  const isDark = theme === 'dark';

  // If user is not authenticated, render LoginScreen directly
  if (!currentUser) {
    return (
      <>
        <LoginScreen
          theme={theme}
          onToggleTheme={toggleTheme}
          onLoginSuccess={handleLoginSuccess}
        />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  const isAdmin = currentUser.role === 'admin';
  const relevantDevices = isAdmin
    ? devices
    : devices.filter((d) => d.resellerId === currentUser.id || d.resellerToken === currentUser.token);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 selection:bg-blue-600 selection:text-white ${
        isDark ? 'bg-[#070A12] text-slate-100' : 'bg-slate-100/90 text-slate-900'
      }`}
    >
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Navigation Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSelectTab={setActiveTab}
        onLogout={handleLogout}
        deviceCount={relevantDevices.length}
        impersonatingUser={impersonatingUser}
        onStopImpersonating={handleStopImpersonating}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Sticky Header with Theme Switcher, Impersonate Alert & Profile Switcher */}
        <Header
          currentUser={currentUser}
          theme={theme}
          onToggleTheme={toggleTheme}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenTVPreview={() => setIsTVPreviewOpen(true)}
          onSwitchProfileDemo={handleSwitchProfileDemo}
          impersonatingUser={impersonatingUser}
          onStopImpersonating={handleStopImpersonating}
        />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              devices={devices}
              users={users}
              theme={theme}
              onNavigateTab={setActiveTab}
              onOpenNewDeviceModal={() => setIsNewDeviceModalOpen(true)}
              onUpdateDeviceStatus={handleUpdateDeviceStatus}
              onRenewDeviceQuick={handleRenewDeviceQuick}
            />
          )}

          {activeTab === 'devices' && (
            <DevicesView
              currentUser={currentUser}
              devices={devices}
              theme={theme}
              isLoading={isLoadingData}
              onRefresh={loadVpsData}
              onAddDevice={handleAddDevice}
              onUpdateDevice={handleUpdateDevice}
              onDeleteDevice={handleDeleteDevice}
              onUpdateStatus={handleUpdateDeviceStatus}
              isModalOpenExternal={isNewDeviceModalOpen}
              setIsModalOpenExternal={setIsNewDeviceModalOpen}
            />
          )}

          {activeTab === 'clients' && isAdmin && (
            <ClientsView
              users={users}
              devices={devices}
              theme={theme}
              isLoading={isLoadingData}
              onRefresh={loadVpsData}
              onImpersonateUser={handleImpersonateUser}
              onAddClient={handleAddClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
              onUpdateClientStatus={handleUpdateClientStatus}
              onResetPassword={handleResetPassword}
            />
          )}

          {activeTab === 'advertising' && (
            <AdvertisingView
              currentUser={currentUser}
              advertising={advertising}
              apps={apps}
              logo={logo}
              theme={theme}
              onSaveAdvertising={handleSaveAdvertising}
              onOpenTVPreview={() => setIsTVPreviewOpen(true)}
            />
          )}

          {activeTab === 'apps' && (
            <AppsView
              currentUser={currentUser}
              apps={apps}
              advertising={advertising}
              logo={logo}
              theme={theme}
              onUpdateAllApps={handleUpdateAllApps}
            />
          )}

          {activeTab === 'logo' && (
            <LogoView
              currentUser={currentUser}
              logo={logo}
              apps={apps}
              advertising={advertising}
              theme={theme}
              onSaveLogo={handleSaveLogo}
              onOpenTVPreview={() => setIsTVPreviewOpen(true)}
            />
          )}

          {activeTab === 'download' && (
            <DownloadView currentUser={currentUser} theme={theme} />
          )}

          {activeTab === 'ota' && isAdmin && (
            <OTAView
              currentUser={currentUser}
              users={users}
              otaReleases={otaReleases}
              theme={theme}
              isLoading={isLoadingData}
              onRefresh={loadVpsData}
              onAddOTARelease={handleAddOTARelease}
              onToggleOTAStatus={handleToggleOTAStatus}
              onDeleteOTARelease={handleDeleteOTARelease}
            />
          )}
        </main>
      </div>

      {/* TV Launcher 16:9 Real Template Preview Modal */}
      <TVLauncherPreviewModal
        isOpen={isTVPreviewOpen}
        onClose={() => setIsTVPreviewOpen(false)}
        apps={apps}
        advertising={advertising}
        logo={logo}
      />
    </div>
  );
}
