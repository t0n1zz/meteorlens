/**
 * Zustand store for saved wallet addresses (read-only tracking).
 * Persisted to AsyncStorage; addresses never sent to external servers.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SavedAddress } from '../types/wallet';
import { STORAGE_KEYS } from '../utils/constants';

interface AddressesState {
  addresses: SavedAddress[];
  activeAddress: string | null;
  hydrated: boolean;
  addAddress: (address: string, label: string) => Promise<void>;
  removeAddress: (address: string) => Promise<void>;
  setActiveAddress: (address: string | null) => Promise<void>;
  setLabel: (address: string, label: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAddressesStore = create<AddressesState>((set, get) => ({
  addresses: [],
  activeAddress: null,
  hydrated: false,

  addAddress: async (address: string, label: string) => {
    const trimmed = address.trim();
    const entry: SavedAddress = { address: trimmed, label: label || trimmed.slice(0, 8), addedAt: Date.now() };
    set((s) => {
      const exists = s.addresses.some((a) => a.address === trimmed);
      if (exists) return s;
      return { addresses: [...s.addresses, entry] };
    });
    const { addresses } = get();
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ADDRESSES, JSON.stringify(addresses));
  },

  removeAddress: async (address: string) => {
    const normalized = address.trim();
    set((s) => ({
      addresses: s.addresses.filter((a) => a.address !== normalized),
      activeAddress: s.activeAddress === normalized ? null : s.activeAddress,
    }));
    const { addresses, activeAddress } = get();
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ADDRESSES, JSON.stringify(addresses));
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_ADDRESS, activeAddress ?? '');
  },

  setActiveAddress: async (address: string | null) => {
    set({ activeAddress: address });
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_ADDRESS, address ?? '');
  },

  setLabel: async (address: string, label: string) => {
    const normalized = address.trim();
    set((s) => ({
      addresses: s.addresses.map((a) => (a.address === normalized ? { ...a, label } : a)),
    }));
    const { addresses } = get();
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_ADDRESSES, JSON.stringify(addresses));
  },

  hydrate: async () => {
    try {
      const [saved, active] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SAVED_ADDRESSES),
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_ADDRESS),
      ]);
      const addresses: SavedAddress[] = saved ? JSON.parse(saved) : [];
      const activeAddress = active && active.length > 0 ? active : null;
      set({ addresses, activeAddress, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
}));
