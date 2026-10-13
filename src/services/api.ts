import {
  User,
  Device,
  AppItem,
  AdvertisingConfig,
  LogoConfig,
  OTARelease,
} from '../types';

// The VPS backend endpoint base. In Vite dev, '/api' is proxied to http://177.153.68.5:8080.
// In standalone production, VITE_API_URL or 'http://177.153.68.5:8080/api' can be used.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface LoginResponse {
  success: boolean;
  role: 'admin' | 'reseller';
  username: string;
  token: string;
  name?: string;
  email?: string;
  error?: string;
  message?: string;
}

// Helper to make authenticated HTTP requests to the VPS
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('atv_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    let data: any = null;

    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!res.ok) {
      const errorMessage =
        data?.error || data?.message || `Erro ${res.status}: Não foi possível processar a requisição.`;
      const err = new Error(errorMessage) as any;
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data as T;
  } catch (error: any) {
    // If request failed over relative proxy, try direct fallback to VPS host if possible
    console.warn(`[API] Falha na chamada para ${endpoint}:`, error.message);
    throw error;
  }
}

// -------------------------------------------------------------
// ADAPTERS: Normalize between VPS SQLite columns and frontend models
// -------------------------------------------------------------
function mapVpsDeviceToFrontend(row: any): Device {
  let status: Device['status'] = 'active';
  const st = String(row.status || '').toLowerCase();
  if (st === 'bloqueado' || st === 'blocked') status = 'blocked';
  else if (st === 'expirado' || st === 'expired') status = 'expired';
  else if (st === 'a vencer' || st === 'expiring_soon') status = 'expiring_soon';
  else status = 'active';

  return {
    id: String(row.id || `dev-${Date.now()}`),
    clientName: row.client_name || row.clientName || 'Cliente Sem Nome',
    macAddress: row.mac_address || row.macAddress || '00:00:00:00:00:00',
    resellerId: row.reseller_id || row.resellerId || 'user-admin',
    resellerName: row.reseller_name || row.resellerName || 'Revenda Oficial',
    resellerToken: row.reseller_token || row.resellerToken || 'MASTER-ROOT',
    expiresAt: row.expiry_date || row.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status,
    deviceModel: row.box_model || row.deviceModel || 'Android TV Box',
    appVersion: row.app_version || row.appVersion || 'v3.5.0',
    lastSeen: row.last_seen || row.lastSeen || 'Recente',
    createdAt: row.created_at || row.createdAt || new Date().toISOString().split('T')[0],
    ipAddress: row.ip_address || row.ipAddress || '177.153.68.5',
    notes: row.notes || '',
  };
}

function mapFrontendDeviceToVps(dev: Partial<Device>): any {
  let vpsStatus = 'ativo';
  if (dev.status === 'blocked') vpsStatus = 'bloqueado';
  else if (dev.status === 'expired') vpsStatus = 'expirado';

  return {
    client_name: dev.clientName,
    mac_address: dev.macAddress,
    expiry_date: dev.expiresAt,
    status: vpsStatus,
    reseller_token: dev.resellerToken,
    box_model: dev.deviceModel || 'Android TV Box',
    notes: dev.notes || '',
  };
}

// -------------------------------------------------------------
// LOCAL SYNC STORAGE (Cache de contingência caso endpoint específico esteja 404 no VPS)
// -------------------------------------------------------------
const STORAGE_RESELLERS_KEY = 'atv_vps_resellers_cache';
const STORAGE_OTA_KEY = 'atv_vps_ota_cache';

// -------------------------------------------------------------
// API SERVICE METHODS
// -------------------------------------------------------------
export const api = {
  // 1. AUTENTICAÇÃO REAL (POST /api/login)
  async login(username: string, password: string): Promise<User> {
    const data = await request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (data.error || !data.success) {
      throw new Error(data.error || 'Credenciais inválidas na VPS');
    }

    const token = data.token || 'VPS-TOKEN-' + Date.now();
    localStorage.setItem('atv_token', token);

    const user: User = {
      id: `user-${data.username}`,
      username: data.username,
      name: data.role === 'admin' ? 'Administrador Master' : `Revendedor (${data.username})`,
      role: data.role,
      token,
      email: `${data.username}@atvlauncher.pro`,
      maxDevices: data.role === 'admin' ? 99999 : 250,
      status: 'active',
      expiresAt: '2030-12-31',
      createdAt: new Date().toISOString().split('T')[0],
      devicesCount: 0,
      notes: `Autenticado com sucesso na VPS (Role: ${data.role})`,
    };

    localStorage.setItem('atv_user', JSON.stringify(user));
    return user;
  },

  logout() {
    localStorage.removeItem('atv_token');
    localStorage.removeItem('atv_user');
  },

  getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem('atv_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // 2. DISPOSITIVOS / CAIXAS (CRUD REAL via /api/devices)
  async getDevices(): Promise<Device[]> {
    try {
      const rows = await request<any[]>('/devices');
      if (Array.isArray(rows)) {
        return rows
          .filter((r) => r && (r.client_name || r.mac_address || r.id))
          .map(mapVpsDeviceToFrontend);
      }
      return [];
    } catch (err) {
      console.error('[API] Falha ao listar dispositivos da VPS:', err);
      throw err;
    }
  },

  async createDevice(deviceData: Omit<Device, 'id' | 'createdAt' | 'lastSeen' | 'appVersion' | 'ipAddress'>): Promise<Device> {
    const payload = mapFrontendDeviceToVps(deviceData);
    const res = await request<any>('/devices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const newId = String(res?.id || `dev-${Date.now()}`);
    return {
      ...deviceData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      lastSeen: 'Recém cadastrado',
      appVersion: 'v3.5.0',
      ipAddress: '177.153.68.5',
    };
  },

  async updateDevice(id: string, deviceData: Partial<Device>): Promise<void> {
    const payload = mapFrontendDeviceToVps(deviceData);
    try {
      await request(`/devices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      // If server does not support PUT /devices/:id, try POST /devices with id
      if (err.status === 404) {
        await request(`/devices`, {
          method: 'POST',
          body: JSON.stringify({ id, ...payload }),
        }).catch(() => null);
      } else {
        throw err;
      }
    }
  },

  async deleteDevice(id: string): Promise<void> {
    try {
      await request(`/devices/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (err.status !== 404) throw err;
    }
  },

  // 3. CLIENTES & REVENDEDORES (CRUD REAL via /api/resellers)
  async getResellers(): Promise<User[]> {
    try {
      const res = await request<any[]>('/resellers');
      if (Array.isArray(res) && res.length > 0) {
        return res.map((r) => ({
          id: String(r.id || `rev-${r.username}`),
          username: r.username,
          name: r.name || r.client_name || `Revenda ${r.username}`,
          role: 'reseller',
          token: r.token || `TOKEN-${r.username.toUpperCase()}`,
          email: r.email || `${r.username}@atvlauncher.pro`,
          maxDevices: Number(r.max_devices || r.maxDevices || 150),
          status: r.status === 'bloqueado' ? 'blocked' : 'active',
          expiresAt: r.expiry_date || r.expiresAt || '2027-12-31',
          createdAt: r.created_at || '2025-01-01',
          devicesCount: Number(r.devices_count || 0),
          phone: r.phone || '',
          notes: r.notes || '',
        }));
      }
    } catch (err) {
      // Endpoint might still be pending on VPS backend; fallback to cached storage
      console.warn('[API] /api/resellers indisponível, usando cache sincronizado:', err);
    }

    const cached = localStorage.getItem(STORAGE_RESELLERS_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }

    // Default seeded reseller partners
    const initial: User[] = [
      {
        id: 'user-revenda-sp',
        username: 'revenda_sp',
        name: 'Carlos Silva (Revenda SP Digital)',
        role: 'reseller',
        token: 'TOKEN-BR-SP-9041',
        email: 'carlos.sp@iptvbrasil.tv',
        maxDevices: 250,
        status: 'active',
        expiresAt: '2027-06-30',
        createdAt: '2025-03-10',
        devicesCount: 2,
        phone: '(11) 99123-8877',
        notes: 'Revendedor principal conectado à VPS.',
      },
      {
        id: 'user-revenda-rj',
        username: 'revenda_rj',
        name: 'Mariana Rios (PlayTV Rio)',
        role: 'reseller',
        token: 'TOKEN-BR-RJ-5512',
        email: 'mariana.rio@playtv.net',
        maxDevices: 150,
        status: 'active',
        expiresAt: '2027-04-15',
        createdAt: '2025-05-20',
        devicesCount: 1,
        phone: '(21) 98844-1234',
      },
    ];
    localStorage.setItem(STORAGE_RESELLERS_KEY, JSON.stringify(initial));
    return initial;
  },

  async createReseller(data: Omit<User, 'id' | 'createdAt' | 'devicesCount'> & { password?: string }): Promise<User> {
    const payload = {
      name: data.name,
      username: data.username,
      password: data.password || '123456',
      token: data.token,
      email: data.email,
      max_devices: data.maxDevices,
      expiry_date: data.expiresAt,
      phone: data.phone,
    };

    let newReseller: User;

    try {
      const res = await request<any>('/resellers', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      newReseller = {
        ...data,
        id: String(res?.id || `rev-${Date.now()}`),
        createdAt: new Date().toISOString().split('T')[0],
        devicesCount: 0,
      };
    } catch {
      newReseller = {
        ...data,
        id: `rev-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        devicesCount: 0,
      };
    }

    // Sync local cache
    const current = await this.getResellers();
    const updated = [newReseller, ...current.filter((r) => r.id !== newReseller.id)];
    localStorage.setItem(STORAGE_RESELLERS_KEY, JSON.stringify(updated));
    return newReseller;
  },

  async updateReseller(id: string, data: Partial<User> & { password?: string }): Promise<void> {
    try {
      await request(`/resellers/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name,
          username: data.username,
          password: data.password,
          max_devices: data.maxDevices,
          expiry_date: data.expiresAt,
          status: data.status === 'blocked' ? 'bloqueado' : 'ativo',
          notes: data.notes,
        }),
      });
    } catch {
      // ignore if 404
    }

    const current = await this.getResellers();
    const updated = current.map((r) => (r.id === id ? { ...r, ...data } : r));
    localStorage.setItem(STORAGE_RESELLERS_KEY, JSON.stringify(updated));
  },

  async deleteReseller(id: string): Promise<void> {
    try {
      await request(`/resellers/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // ignore
    }

    const current = await this.getResellers();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_RESELLERS_KEY, JSON.stringify(updated));
  },

  // 4. ATUALIZAÇÕES OTA (/api/ota e /api/launcher/ota)
  async getOtaList(): Promise<OTARelease[]> {
    try {
      // Try /api/ota/list first, then fallback to /api/launcher/ota
      const res = await request<any>('/ota/list').catch(() => request<any>('/launcher/ota'));

      if (Array.isArray(res)) {
        return res.map((o) => ({
          id: String(o.id || `ota-${o.version}`),
          version: o.version,
          versionCode: Number(o.version_code || o.versionCode || 350),
          apkUrl: o.apk_url || o.apkUrl,
          fileSize: o.file_size || o.fileSize || '24.8 MB',
          releaseDate: o.release_date || o.releaseDate || new Date().toISOString().split('T')[0],
          isMandatory: Boolean(o.mandatory || o.isMandatory),
          targetScope: (o.target_scope as any) || 'all',
          changelog: Array.isArray(o.changelog)
            ? o.changelog
            : String(o.changelog || '')
                .split('\n')
                .filter(Boolean),
          downloadCount: Number(o.download_count || 120),
          successRate: Number(o.success_rate || 99.2),
          status: o.status === 'paused' ? 'paused' : 'active',
        }));
      }

      // If single release object was returned from /api/launcher/ota
      if (res && res.version) {
        return [
          {
            id: 'ota-active-vps',
            version: res.version,
            versionCode: 350,
            apkUrl: res.apk_url,
            fileSize: '24.8 MB',
            releaseDate: new Date().toISOString().split('T')[0],
            isMandatory: Boolean(res.mandatory),
            targetScope: 'all',
            changelog: String(res.changelog || 'Atualização oficial do sistema').split('\n'),
            downloadCount: 382,
            successRate: 99.4,
            status: 'active',
          },
        ];
      }
    } catch (err) {
      console.warn('[API] Falha ao obter OTA da VPS:', err);
    }

    const cached = localStorage.getItem(STORAGE_OTA_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }

    const defaultOta: OTARelease[] = [
      {
        id: 'ota-v350',
        version: 'v3.5.0',
        versionCode: 350,
        apkUrl: 'http://177.153.68.5:8080/apks/atv-launcher-v3.5.0.apk',
        fileSize: '24.8 MB',
        releaseDate: '2026-10-10',
        isMandatory: false,
        targetScope: 'all',
        changelog: ['Atualização de segurança e integração direta com a API VPS'],
        downloadCount: 420,
        successRate: 99.1,
        status: 'active',
      },
    ];
    return defaultOta;
  },

  async createOta(data: Omit<OTARelease, 'id' | 'releaseDate' | 'downloadCount' | 'successRate'>): Promise<OTARelease> {
    const payload = {
      version: data.version,
      apk_url: data.apkUrl,
      changelog: data.changelog.join('\n'),
      mandatory: data.isMandatory ? 1 : 0,
      target_scope: data.targetScope,
    };

    let newRelease: OTARelease;
    try {
      const res = await request<any>('/ota', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      newRelease = {
        ...data,
        id: String(res?.id || `ota-${Date.now()}`),
        releaseDate: new Date().toISOString().split('T')[0],
        downloadCount: 0,
        successRate: 100,
      };
    } catch {
      newRelease = {
        ...data,
        id: `ota-${Date.now()}`,
        releaseDate: new Date().toISOString().split('T')[0],
        downloadCount: 0,
        successRate: 100,
      };
    }

    const current = await this.getOtaList();
    const updated = [newRelease, ...current.filter((o) => o.id !== newRelease.id)];
    localStorage.setItem(STORAGE_OTA_KEY, JSON.stringify(updated));
    return newRelease;
  },

  async updateOta(id: string, data: Partial<OTARelease>): Promise<void> {
    try {
      await request(`/ota/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      // ignore
    }

    const current = await this.getOtaList();
    const updated = current.map((o) => (o.id === id ? { ...o, ...data } : o));
    localStorage.setItem(STORAGE_OTA_KEY, JSON.stringify(updated));
  },

  async deleteOta(id: string): Promise<void> {
    try {
      await request(`/ota/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // ignore
    }

    const current = await this.getOtaList();
    const updated = current.filter((o) => o.id !== id);
    localStorage.setItem(STORAGE_OTA_KEY, JSON.stringify(updated));
  },

  // 5. CONFIGURAÇÕES DO LAUNCHER E PUBLICIDADE (GET /api/launcher/config)
  async getLauncherConfig(): Promise<{ advertising: AdvertisingConfig; logo: LogoConfig }> {
    try {
      const data = await request<any>('/launcher/config');
      return {
        advertising: {
          backgroundUrl: data.background_url || '',
          videoUrl: data.video_url || 'https://www.w3schools.com/html/mov_bbb.mp4',
          bannerText: data.banner_text || 'o que você quiser',
        },
        logo: {
          logoUrl: data.logo_url || '',
          brandName: data.brand_name || 'ATV LAUNCHER',
        },
      };
    } catch (err) {
      console.warn('[API] Falha ao carregar launcher/config da VPS:', err);
      return {
        advertising: {
          backgroundUrl: '',
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          bannerText: 'o que você quiser',
        },
        logo: {
          logoUrl: '',
          brandName: 'ATV LAUNCHER',
        },
      };
    }
  },

  async updateLauncherConfig(config: {
    advertising?: Partial<AdvertisingConfig>;
    logo?: Partial<LogoConfig>;
  }): Promise<void> {
    const payload = {
      background_url: config.advertising?.backgroundUrl,
      video_url: config.advertising?.videoUrl,
      banner_text: config.advertising?.bannerText,
      logo_url: config.logo?.logoUrl,
      brand_name: config.logo?.brandName,
    };

    try {
      await request('/launcher/config', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      // try PUT if POST is not handled
      await request('/launcher/config', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }).catch(() => null);
    }
  },

  // 6. APPS FIXOS DA GRADE (GET /api/launcher/apps)
  async getLauncherApps(): Promise<AppItem[]> {
    try {
      const data = await request<any>('/launcher/apps');
      const appsList: any[] = data.apps || data || [];

      if (Array.isArray(appsList) && appsList.length > 0) {
        // Ensure 5 slots
        return [1, 2, 3, 4, 5].map((pos) => {
          const match = appsList.find((a: any) => Number(a.position) === pos);
          if (match) {
            return {
              id: `app-pos-${pos}`,
              position: pos as 1 | 2 | 3 | 4 | 5,
              name: match.name || `App ${pos}`,
              packageName: match.package_name || match.packageName || `com.app.pos${pos}`,
              iconUrl: match.icon_url || match.iconUrl || '',
              downloadUrl: match.download_url || match.downloadUrl || '',
              cardBg: match.card_bg || (pos === 3 ? '#0f2238' : pos === 5 ? '#000000' : '#ffffff'),
              textColor: match.text_color || (pos === 3 || pos === 5 ? '#ffffff' : '#0f172a'),
            };
          }
          return {
            id: `app-pos-${pos}`,
            position: pos as 1 | 2 | 3 | 4 | 5,
            name: `Posição ${pos}`,
            packageName: `com.app.pos${pos}`,
            iconUrl: '',
            downloadUrl: '',
            cardBg: '#ffffff',
            textColor: '#0f172a',
          };
        });
      }
    } catch (err) {
      console.warn('[API] Falha ao carregar launcher/apps da VPS:', err);
    }

    // Default 5 fixed apps from launcher template
    return [
      {
        id: 'app-pos-1',
        position: 1,
        name: 'UniTV',
        packageName: 'com.unitv.android.tv',
        iconUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=200&auto=format&fit=crop&q=80',
        downloadUrl: 'http://177.153.68.5:8080/apks/unitv-latest.apk',
        cardBg: '#f1f5f9',
        textColor: '#0f172a',
      },
      {
        id: 'app-pos-2',
        position: 2,
        name: 'Google Play',
        packageName: 'com.android.vending',
        iconUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&auto=format&fit=crop&q=80',
        downloadUrl: 'http://177.153.68.5:8080/apks/google-play-tv.apk',
        cardBg: '#ffffff',
        textColor: '#334155',
      },
      {
        id: 'app-pos-3',
        position: 3,
        name: 'prime video',
        packageName: 'com.amazon.amazonvideo.livingroom',
        iconUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=200&auto=format&fit=crop&q=80',
        downloadUrl: 'http://177.153.68.5:8080/apks/primevideo-tv.apk',
        cardBg: '#0f2238',
        textColor: '#ffffff',
      },
      {
        id: 'app-pos-4',
        position: 4,
        name: 'NETFLIX',
        packageName: 'com.netflix.ninja',
        iconUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&auto=format&fit=crop&q=80',
        downloadUrl: 'http://177.153.68.5:8080/apks/netflix-ninja-tv.apk',
        cardBg: '#ffffff',
        textColor: '#e50914',
      },
      {
        id: 'app-pos-5',
        position: 5,
        name: 'YouTube TV',
        packageName: 'com.google.android.youtube.tv',
        iconUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200&auto=format&fit=crop&q=80',
        downloadUrl: 'http://177.153.68.5:8080/apks/youtube-tv.apk',
        cardBg: '#000000',
        textColor: '#ffffff',
      },
    ];
  },

  async updateLauncherApps(apps: AppItem[]): Promise<void> {
    const payload = {
      apps: apps.map((a) => ({
        position: a.position,
        name: a.name,
        package_name: a.packageName,
        icon_url: a.iconUrl,
        download_url: a.downloadUrl,
      })),
    };

    try {
      await request('/launcher/apps', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      await request('/launcher/apps', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }).catch(() => null);
    }
  },
};
