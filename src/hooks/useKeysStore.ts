import { create } from 'zustand';
import { keysApi, Key } from '../services/api';

interface KeysState {
  keys: Key[];
  isLoading: boolean;
  isRefreshing: boolean;
  currentPage: number;
  lastPage: number;
  total: number;
  fetchKeys: (page?: number) => Promise<void>;
  refreshKeys: () => Promise<void>;
  addKey: (name: string, imageFront: string, imageBack: string, description?: string) => Promise<Key>;
  updateKey: (id: number, data: { name?: string; description?: string }) => Promise<void>;
  deleteKey: (id: number) => Promise<void>;
}

export const useKeysStore = create<KeysState>((set, get) => ({
  keys: [],
  isLoading: false,
  isRefreshing: false,
  currentPage: 1,
  lastPage: 1,
  total: 0,

  fetchKeys: async (page = 1) => {
    set({ isLoading: true });
    try {
      const { data } = await keysApi.list(page);
      set({
        keys: page === 1 ? data.data : [...get().keys, ...data.data],
        currentPage: data.meta.current_page,
        lastPage: data.meta.last_page,
        total: data.meta.total,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshKeys: async () => {
    set({ isRefreshing: true });
    try {
      const { data } = await keysApi.list(1);
      set({ keys: data.data, currentPage: 1, lastPage: data.meta.last_page, total: data.meta.total });
    } finally {
      set({ isRefreshing: false });
    }
  },

  addKey: async (name, imageFront, imageBack, description) => {
    const { data } = await keysApi.store(name, imageFront, imageBack, description);
    set((state) => ({ keys: [data, ...state.keys], total: state.total + 1 }));
    return data;
  },

  updateKey: async (id, updates) => {
    const { data } = await keysApi.update(id, updates);
    set((state) => ({ keys: state.keys.map((k) => (k.id === id ? data : k)) }));
  },

  deleteKey: async (id) => {
    await keysApi.destroy(id);
    set((state) => ({ keys: state.keys.filter((k) => k.id !== id), total: state.total - 1 }));
  },
}));
