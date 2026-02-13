import React from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AddressInput } from '../components/wallet/AddressInput';
import { AddressManager } from '../components/wallet/AddressManager';
import { AppLogo } from '../components/common/AppLogo';
import { useAddresses } from '../hooks/useAddresses';
import { useAddressesStore } from '../store/addressesStore';
import { useTheme } from '../hooks/useTheme';
import type { TrackStackParams } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<TrackStackParams, 'WalletInput'>;

export function WalletInputScreen() {
  const navigation = useNavigation<Nav>();
  const { screen } = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: screen.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppLogo size="lg" showTagline />
          <Text style={[styles.subtitle, { color: screen.textMuted }]}>
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
  container: { flex: 1 },
  keyboard: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 48 },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 24 },
});
