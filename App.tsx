/**
 * Meteora DLMM Portfolio Tracker — read-only, web-first.
 * Paste wallet addresses to track positions; no wallet connection or private keys.
 * Mobile (Solana Seeker) build supported when you're ready.
 */
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { WebLayout } from './src/components/common/WebLayout';
import { useSettingsStore } from './src/store/settingsStore';
import { darkTheme, lightTheme } from './src/theme/theme';

export default function App() {
  const themeMode = useSettingsStore((s) => s.theme);
  const hydrate = useSettingsStore((s) => s.hydrate);
  const systemDark = useColorScheme() === 'dark';

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemDark);
  const navTheme = isDark ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <WebLayout>
        <NavigationContainer
          theme={{
            dark: navTheme.dark,
            colors: navTheme.colors,
            fonts: navTheme.fonts,
          }}
        >
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <AppNavigator />
        </NavigationContainer>
      </WebLayout>
    </SafeAreaProvider>
  );
}
