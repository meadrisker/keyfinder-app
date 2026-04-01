import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import { authApi, Device, Household } from '../services/api';

// Generate or retrieve a stable device UUID
async function getDeviceUuid(): Promise<string> {
  let uuid = await SecureStore.getItemAsync('keyring_device_uuid');
  if (!uuid) {
    uuid = Platform.OS === 'android'
      ? (Application.androidId ?? Crypto.randomUUID())
      : (await Application.getIosIdForVendorAsync() ?? Crypto.randomUUID());
    await SecureStore.setItemAsync('keyring_device_uuid', uuid);
  }
  return uuid;
}

interface AuthState {
  token: string | null;
  device: Device | null;
  household: Household | null;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  register: (deviceName: string) => Promise<void>;
  join: (deviceName: string, inviteCode: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshInvite: () => Promise<string>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  device: null,
  household: null,
  isHydrated: false,

  hydrate: async () => {
    const token = await SecureStore.getItemAsync('keyring_token');
    if (token) {
      try {
        const { data } = await authApi.me();
        set({ token, device: data.device, household: data.household, isHydrated: true });
      } catch {
        await SecureStore.deleteItemAsync('keyring_token');
        set({ token: null, device: null, household: null, isHydrated: true });
      }
    } else {
      set({ isHydrated: true });
    }
  },

  register: async (deviceName) => {
    const uuid = await getDeviceUuid();
    const { data } = await authApi.register(uuid, deviceName);
    await SecureStore.setItemAsync('keyring_token', data.token);
    set({ token: data.token, device: data.device, household: data.household });
  },

  join: async (deviceName, inviteCode) => {
    const uuid = await getDeviceUuid();
    const { data } = await authApi.join(uuid, deviceName, inviteCode);
    await SecureStore.setItemAsync('keyring_token', data.token);
    set({ token: data.token, device: data.device, household: data.household });
  },

  logout: async () => {
    try { await authApi.logout(); } catch {}
    await SecureStore.deleteItemAsync('keyring_token');
    set({ token: null, device: null, household: null });
  },

  refreshInvite: async () => {
    const { data } = await authApi.invite();
    return data.invite_code;
  },
}));
