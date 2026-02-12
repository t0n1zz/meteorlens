/**
 * Meteora DLMM Portfolio Tracker — read-only, mobile-first.
 * Paste wallet addresses to track positions; no wallet connection or private keys.
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
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
        }}
      >
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
