import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://keyfinder.meadriskersoftware.com';

export const api = axios.create({
  baseURL: `${BASE_URL}/keyring`,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 60000, // longer timeout for two-image analysis
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('keyring_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface Device {
  id: number;
  device_uuid: string;
  device_name: string;
}

export interface Household {
  id: number;
  name: string;
  device_count: number;
}

export interface KeyKeywords {
  colour: string;
  hex: string;
  size: 'small' | 'medium' | 'large';
  bow_shape: string;
  cut_count: number;
  material: string;
  markings: string | null;
}

export interface Key {
  id: number;
  name: string;
  description: string | null;
  keywords: KeyKeywords | null;
  svg_front: string | null;
  svg_back: string | null;
  added_by: string;
  created_at: string;
}

export interface IdentifyResult {
  matched: boolean;
  key: Key | null;
  confidence: number;
  reason: string;
}

export interface PaginatedKeys {
  data: Key[];
  meta: { current_page: number; last_page: number; total: number };
}

export interface AuthResponse {
  token: string;
  device: Device;
  household: Household;
}

export const authApi = {
  register: (device_uuid: string, device_name: string) =>
    api.post<AuthResponse>('/auth/register', { device_uuid, device_name }),
  join: (device_uuid: string, device_name: string, invite_code: string) =>
    api.post<AuthResponse>('/auth/join', { device_uuid, device_name, invite_code }),
  invite: () =>
    api.post<{ invite_code: string; expires: string }>('/auth/invite'),
  me: () =>
    api.get<{ device: Device; household: Household }>('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const keysApi = {
  list: (page = 1) => api.get<PaginatedKeys>('/keys', { params: { page } }),
  store: (name: string, image_front: string, image_back: string, description?: string) =>
    api.post<Key>('/keys', { name, image_front, image_back, description }),
  update: (id: number, data: { name?: string; description?: string }) =>
    api.put<Key>(`/keys/${id}`, data),
  destroy: (id: number) => api.delete(`/keys/${id}`),
  identify: (image: string) => api.post<IdentifyResult>('/identify', { image }),
};
