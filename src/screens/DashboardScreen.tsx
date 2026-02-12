import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PortfolioSummary } from '../components/dashboard/PortfolioSummary';
import { PortfolioAllocation } from '../components/dashboard/PortfolioAllocation';
import { PositionStats } from '../components/dashboard/PositionStats';
import { PositionCard } from '../components/dashboard/PositionCard';
import { AlertsList } from '../components/alerts/AlertsList';
import { Button } from '../components/common/Button';
import { useAddressesStore } from '../store/addressesStore';
import { usePositions } from '../hooks/usePositions';
import { usePoolsMap } from '../hooks/usePoolsMap';
import { shortenAddress } from '../utils/addressUtils';
import type { TrackStackParams } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<TrackStackParams, 'Dashboard'>;

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { positions, loading, error, loadPositions } = usePositions();
  const activeAddress = useAddressesStore((s) => s.activeAddress);
  const poolsMap = usePoolsMap(positions);

  const onRefresh = () => {
    if (activeAddress) loadPositions(activeAddress);
  };

  const goToWalletInput = () => {
    navigation.dispatch(
      CommonActions.navigate({ name: 'WalletInput' })
    );
  };
  const goToPositionDetail = (positionKey: string) =>
    navigation.navigate('PositionDetail', { positionKey });

  if (positions.length === 0 && !loading && !error) {
    const hasWallet = Boolean(activeAddress);
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            {hasWallet ? 'No DLMM positions found' : 'No positions yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {hasWallet
              ? 'This wallet has no Meteora DLMM (Liquidity Book) positions, or the RPC returned none. We only track DLMM positions—not AMM or other pools. Try another address or check app.meteora.ag/dlmm.'
              : 'Add a wallet address to track your Meteora DLMM positions.'}
          </Text>
          <Button
            title={hasWallet ? 'Switch wallet' : 'Add wallet address'}
            onPress={goToWalletInput}
            style={Platform.OS === 'web' ? [styles.emptyButton, styles.webButton] : styles.emptyButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor="#9945FF" />
        }
      >
        {activeAddress && (
          <View style={styles.walletRow}>
            <Text style={styles.walletLabel}>Tracking</Text>
            <Text style={styles.walletAddress}>{shortenAddress(activeAddress, 6)}</Text>
            <TouchableOpacity onPress={goToWalletInput}>
              <Text style={styles.switchText}>Switch</Text>
            </TouchableOpacity>
          </View>
        )}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Retry" onPress={onRefresh} variant="outline" />
          </View>
        ) : null}
        {positions.length > 0 && (
          <>
            <PortfolioSummary positions={positions} />
            <AlertsList positions={positions} pools={poolsMap} />
            <PositionStats positions={positions} />
            <PortfolioAllocation positions={positions} />
            <Text style={styles.sectionTitle}>Positions</Text>
            {positions.map((p) => (
              <PositionCard
                key={p.publicKey}
                position={p}
                onPress={() => goToPositionDetail(p.publicKey)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f14' },
  scroll: { padding: 20, paddingBottom: 40 },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  walletLabel: { color: '#888', fontSize: 12 },
  walletAddress: { color: '#fff', fontSize: 14, flex: 1 },
  switchText: { color: '#9945FF', fontSize: 14 },
  errorBox: { marginBottom: 16 },
  errorText: { color: '#f66', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 },
  emptySubtitle: { color: '#888', textAlign: 'center', marginBottom: 24 },
  emptyButton: { minWidth: 200 },
  webButton: { cursor: 'pointer' },
});
