import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Platform,
  Share,
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
import { AppLogo } from '../components/common/AppLogo';
import { useAddressesStore } from '../store/addressesStore';
import { usePositions } from '../hooks/usePositions';
import { usePoolsMap } from '../hooks/usePoolsMap';
import { useTheme } from '../hooks/useTheme';
import { shortenAddress } from '../utils/addressUtils';
import { positionsToCsv, downloadCsv } from '../utils/exportCsv';
import type { TrackStackParams } from '../navigation/AppNavigator';
import type { AppPosition } from '../types/position';

type Nav = NativeStackNavigationProp<TrackStackParams, 'Dashboard'>;

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
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

  const handleExportCsv = () => {
    const csv = positionsToCsv(positions);
    const filename = `dlmm-positions-${Date.now()}.csv`;
    if (Platform.OS === 'web') {
      downloadCsv(csv, filename);
    } else {
      Share.share({
        message: csv,
        title: 'DLMM Positions Export',
        type: 'text/csv',
      }).catch(() => {});
    }
  };

  const screen = theme.screen;

  const renderItem = useCallback(
    ({ item }: { item: AppPosition }) => (
      <PositionCard
        position={item}
        onPress={() => goToPositionDetail(item.publicKey)}
      />
    ),
    [goToPositionDetail]
  );

  const keyExtractor = useCallback((p: AppPosition) => p.publicKey, []);

  const listHeader = useMemo(
    () => (
      <View style={styles.scroll}>
        <View style={styles.dashboardHeader}>
          <AppLogo size="sm" />
        </View>
        {activeAddress && (
          <TouchableOpacity
            style={[styles.walletRow, { backgroundColor: screen.card, borderColor: screen.cardBorder }]}
            onPress={goToWalletInput}
            activeOpacity={0.8}
          >
            <View style={[styles.walletIcon, { backgroundColor: screen.accentMuted }]}>
              <Text style={[styles.walletIconText, { color: screen.accent }]}>◉</Text>
            </View>
            <View style={styles.walletInfo}>
              <Text style={[styles.walletLabel, { color: screen.textMuted }]}>Tracking</Text>
              <Text style={[styles.walletAddress, { color: screen.text }]}>{shortenAddress(activeAddress, 6)}</Text>
            </View>
            <Text style={[styles.switchText, { color: screen.accent }]}>Switch</Text>
          </TouchableOpacity>
        )}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={[styles.errorText, { color: screen.negative }]}>{error}</Text>
            <Button title="Retry" onPress={onRefresh} variant="outline" />
          </View>
        ) : null}
        {positions.length > 0 && (
          <>
            <PortfolioSummary positions={positions} />
            <AlertsList positions={positions} pools={poolsMap} />
            <PositionStats positions={positions} />
            <PortfolioAllocation positions={positions} />
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: screen.text }]}>Positions</Text>
              <TouchableOpacity onPress={handleExportCsv}>
                <Text style={[styles.exportButton, { color: screen.accent }]}>Export CSV</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    ),
    [
      activeAddress,
      error,
      screen.text,
      screen.textMuted,
      screen.accent,
      screen.negative,
      positions,
      poolsMap,
      goToWalletInput,
      onRefresh,
      handleExportCsv,
    ]
  );

  const contentContainerStyle = positions.length === 0
    ? styles.scrollContent
    : [styles.scrollContent, styles.listContent];

  if (positions.length === 0 && !loading && !error) {
    const hasWallet = Boolean(activeAddress);
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: screen.background }]} edges={['top', 'bottom']}>
        <View style={styles.empty}>
          <AppLogo size="lg" showTagline />
          <Text style={[styles.emptyTitle, { color: screen.text }]}>
            {hasWallet ? 'No DLMM positions found' : 'No positions yet'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: screen.textMuted }]}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: screen.background }]} edges={['top', 'bottom']}>
      <FlatList
        data={positions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        contentContainerStyle={contentContainerStyle}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={screen.accent} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  scrollContent: { paddingBottom: 40, flexGrow: 1 },
  listContent: { paddingBottom: 40, paddingHorizontal: 20 },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  walletIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletIconText: { fontSize: 16 },
  walletInfo: { flex: 1 },
  walletLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  walletAddress: { fontSize: 15, fontWeight: '600' },
  switchText: { fontSize: 14, fontWeight: '600' },
  errorBox: { marginBottom: 16 },
  errorText: { marginBottom: 8 },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  exportButton: { fontSize: 14, fontWeight: '600' },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  dashboardHeader: { marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 24, marginBottom: 8 },
  emptySubtitle: { textAlign: 'center', marginBottom: 24 },
  emptyButton: { minWidth: 200 },
  webButton: { cursor: 'pointer' },
});
