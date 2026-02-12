import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AddressInput } from '../components/wallet/AddressInput';
import { AddressManager } from '../components/wallet/AddressManager';
import { useAddresses } from '../hooks/useAddresses';
import { useAddressesStore } from '../store/addressesStore';
import { usePositions } from '../hooks/usePositions';
import type { TrackStackParams } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<TrackStackParams, 'WalletInput'>;

export function WalletInputScreen() {
  const navigation = useNavigation<Nav>();
  const activeAddress = useAddressesStore((s) => s.activeAddress);
  useEffect(() => {
    if (activeAddress) navigation.replace('Dashboard');
  }, [activeAddress, navigation]);
  const {
    addresses,
    addAddress,
    setActiveAddress,
    removeAddress,
    hydrated,
  } = useAddresses();
  const { loadPositions, loading, error } = usePositions();

  const handleSubmit = async (address: string) => {
    await addAddress(address, address.slice(0, 8));
    await setActiveAddress(address);
    await loadPositions(address);
    navigation.replace('Dashboard');
  };

  const handleSelectSaved = async (address: string) => {
    await setActiveAddress(address);
    await loadPositions(address);
    navigation.replace('Dashboard');
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
          <AddressInput onSubmit={handleSubmit} loading={loading} />
          {error ? (
            <View style={styles.errorWrap}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
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
  errorWrap: { marginTop: 12 },
  errorText: { color: '#f66', fontSize: 14 },
});
