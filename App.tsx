/**
 * Meteora DLMM Portfolio Tracker — read-only, web-first.
 * Paste wallet addresses to track positions; no wallet connection or private keys.
 * Mobile (Solana Seeker) build supported when you’re ready.
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { WebLayout } from './src/components/common/WebLayout';

export default function App() {
  return (
    <SafeAreaProvider>
      <WebLayout>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: '#9945FF',
            background: '#0f0f14',
            card: '#0f0f14',
            text: '#fff',
            border: '#2a2a35',
            notification: '#9945FF',
          },
          // Required by @react-navigation/elements HeaderTitle (uses fonts.bold / fonts.medium)
          fonts: {
            bold: { fontWeight: '700' as const },
            medium: { fontWeight: '500' as const },
            regular: { fontWeight: '400' as const },
            heavy: { fontWeight: '700' as const },
          },
        }}
      >
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
      </WebLayout>
    </SafeAreaProvider>
  );
}
