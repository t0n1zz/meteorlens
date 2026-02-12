import React from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AddressInput } from '../components/wallet/AddressInput';
import { AddressManager } from '../components/wallet/AddressManager';
import { useAddresses } from '../hooks/useAddresses';
import { useAddressesStore } from '../store/addressesStore';
import type { TrackStackParams } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<TrackStackParams, 'WalletInput'>;

export function WalletInputScreen() {
  const navigation = useNavigation<Nav>();
  const activeAddress = useAddressesStore((s) => s.activeAddress);
  const {
    addresses,
    addAddress,
    setActiveAddress,
    removeAddress,
    hydrated,
  } = useAddresses();

  const handleSubmit = async (address: string) => {
    await addAddress(address, address.slice(0, 8));
    await setActiveAddress(address);
    // Navigate first so user always sees Dashboard; positions load via usePositions effect
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Dashboard' }] })
    );
  };

  const handleSelectSaved = async (address: string) => {
    await setActiveAddress(address);
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Dashboard' }] })
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Meteora DLMM Tracker</Text>
          <Text style={styles.subtitle}>
            Paste a Solana wallet address to track DLMM positions. Read-only — no connection or private keys.
          </Text>
          {hydrated && (
            <AddressManager
              addresses={addresses}
              activeAddress={activeAddress}
              onSelect={handleSelectSaved}
              onRemove={removeAddress}
            />
          )}
          <AddressInput onSubmit={handleSubmit} loading={false} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f14' },
  keyboard: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 20 },
});
