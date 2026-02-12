import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePoolData } from '../hooks/usePoolData';
import { formatUsd, formatPercent, formatTokenAmount } from '../utils/formatters';
import { Card } from '../components/common/Card';
import type { AppPosition } from '../types/position';

interface PositionDetailScreenProps {
  position: AppPosition | null;
  onBack?: () => void;
}

export function PositionDetailScreen({ position, onBack }: PositionDetailScreenProps) {
  const { pool, fetchPool } = usePoolData();

  useEffect(() => {
    if (position?.lbPair) {
      fetchPool(position.lbPair);
    }
  }, [position?.lbPair, fetchPool]);

  if (!position) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.placeholder}>Select a position</Text>
      </SafeAreaView>
    );
  }

  const { value, range, fees, pnl, pairName } = position;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pairTitle}>{pairName}</Text>
        <View style={[styles.rangeBadge, { backgroundColor: range.inRange ? '#22c55e22' : '#ef444422' }]}>
          <Text style={{ color: range.inRange ? '#22c55e' : '#ef4444' }}>
            {range.inRange ? 'In range' : 'Out of range'}
          </Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Value</Text>
          <Text style={styles.bigValue}>{formatUsd(value.valueUsd)}</Text>
          <View style={styles.row}>
            <Text style={styles.muted}>{formatTokenAmount(value.tokenXAmount, value.tokenXSymbol)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.muted}>{formatTokenAmount(value.tokenYAmount, value.tokenYSymbol)}</Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Fees</Text>
          {fees.totalFeeUsdClaimed != null && (
            <Text style={styles.value}>{formatUsd(fees.totalFeeUsdClaimed)} claimed</Text>
          )}
          {fees.feeApr24h != null && (
            <View style={styles.row}>
              <Text style={styles.label}>APR (24h)</Text>
              <Text style={styles.value}>{formatPercent(fees.feeApr24h)}</Text>
            </View>
          )}
        </Card>

        {pnl && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>PnL</Text>
            <Text style={[styles.bigValue, pnl.totalPnlUsd >= 0 ? styles.positive : styles.negative]}>
              {formatUsd(pnl.totalPnlUsd)} ({formatPercent(pnl.totalPnlPercent)})
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>Fee income</Text>
              <Text style={styles.value}>{formatUsd(pnl.feeIncomeUsd)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Impermanent loss</Text>
              <Text style={styles.negative}>
                {formatPercent(pnl.impermanentLossPercent)}
              </Text>
            </View>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Range</Text>
          <Text style={styles.muted}>
            Bins {range.minBinId} – {range.maxBinId}
          </Text>
          <Text style={styles.muted}>Active bin: {range.activeBinId}</Text>
        </Card>

        {pool && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Pool</Text>
            <View style={styles.row}>
              <Text style={styles.label}>TVL</Text>
              <Text style={styles.value}>{formatUsd(pool.tvl ?? 0)}</Text>
            </View>
            {pool.volume?.['24h'] != null && (
              <View style={styles.row}>
                <Text style={styles.label}>24h volume</Text>
                <Text style={styles.value}>{formatUsd(pool.volume['24h'])}</Text>
              </View>
            )}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f14' },
  scroll: { padding: 20, paddingBottom: 40 },
  placeholder: { color: '#888', textAlign: 'center', marginTop: 40 },
  pairTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 8 },
  rangeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
  },
  card: { marginBottom: 16 },
  cardTitle: { fontSize: 14, color: '#888', marginBottom: 8 },
  bigValue: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: '#888' },
  value: { color: '#fff', fontWeight: '600' },
  muted: { color: '#888', fontSize: 14 },
  positive: { color: '#22c55e' },
  negative: { color: '#ef4444' },
});
