export type UserRole = 'admin' | 'reseller';

export type ThemeMode = 'dark' | 'light';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  token: string;
  email: string;
  maxDevices: number;
  status: 'active' | 'blocked' | 'expired';
  expiresAt: string;
  createdAt: string;
  devicesCount: number;
  phone?: string;
  notes?: string;
}

export type DeviceStatus = 'active' | 'blocked' | 'expired' | 'expiring_soon';

export interface Device {
  id: string;
  clientName: string;
  macAddress: string;
  resellerId: string;
  resellerName: string;
  resellerToken: string;
  expiresAt: string;
  status: DeviceStatus;
  deviceModel: string;
  appVersion: string;
  lastSeen: string;
  createdAt: string;
  ipAddress: string;
  notes?: string;
}

export interface AppItem {
  id: string;
  position: 1 | 2 | 3 | 4 | 5;
  name: string; // Nome a ser exibido no launcher
  packageName: string; // Nome do pacote (ex: com.unitv.app)
  iconUrl: string; // URL do ícone
  downloadUrl: string; // URL de download
  cardBg?: string; // Cor de fundo do card
  textColor?: string; // Cor do texto
}

export interface AdvertisingConfig {
  backgroundUrl: string;
  videoUrl: string;
  bannerText?: string;
}

export interface LogoConfig {
  logoUrl: string;
  brandName: string;
}

export interface OTARelease {
  id: string;
  version: string;
  versionCode: number;
  apkUrl: string;
  fileSize: string;
  releaseDate: string;
  isMandatory: boolean;
  targetScope: 'all' | 'specific_reseller' | 'beta';
  targetResellerId?: string;
  changelog: string[];
  downloadCount: number;
  successRate: number;
  status: 'active' | 'paused' | 'archived';
}

export type MenuTab = 
  | 'dashboard'
  | 'clients'
  | 'devices'
  | 'advertising'
  | 'apps'
  | 'logo'
  | 'download'
  | 'ota';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
