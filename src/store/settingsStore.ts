/**
 * App settings (theme, alerts, etc.). Persisted locally.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

export type ThemeMode = 'dark' | 'light' | 'system';

interface SettingsState {
  theme: ThemeMode;
  ilAlertThresholdPercent: number;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setIlAlertThreshold: (percent: number) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'dark',
  ilAlertThresholdPercent: 5,

  setTheme: async (theme) => {
    set({ theme });
    const g = get();
    await AsyncStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify({ theme: g.theme, ilAlertThresholdPercent: g.ilAlertThresholdPercent })
    );
  },

  setIlAlertThreshold: async (percent) => {
    set({ ilAlertThresholdPercent: percent });
    const g = get();
    await AsyncStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify({ theme: g.theme, ilAlertThresholdPercent: g.ilAlertThresholdPercent })
    );
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (raw) {
        const data = JSON.parse(raw) as { theme?: ThemeMode; ilAlertThresholdPercent?: number };
        set({
          theme: data.theme ?? 'dark',
          ilAlertThresholdPercent: data.ilAlertThresholdPercent ?? 5,
        });
      }
    } catch {
      // keep defaults
    }
  },
}));
