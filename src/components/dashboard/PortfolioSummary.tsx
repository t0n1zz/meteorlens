import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatUsd, formatPercent } from '../../utils/formatters';
import type { AppPosition } from '../../types/position';

interface PortfolioSummaryProps {
  positions: AppPosition[];
}

export function PortfolioSummary({ positions }: PortfolioSummaryProps) {
  const totalValue = positions.reduce((s, p) => s + p.value.valueUsd, 0);
  const totalFees = positions.reduce((s, p) => s + (p.fees.totalFeeUsdClaimed ?? 0), 0);
  const totalPnl = positions.reduce((s, p) => s + (p.pnl?.totalPnlUsd ?? 0), 0);
  const totalPnlPercent = totalValue > 0 ? (totalPnl / (totalValue - totalFees)) * 100 : 0;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Portfolio</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Total value</Text>
        <Text style={styles.value}>{formatUsd(totalValue)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Fees earned</Text>
        <Text style={styles.value}>{formatUsd(totalFees)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Total PnL</Text>
        <Text style={[styles.value, totalPnl >= 0 ? styles.positive : styles.negative]}>
          {formatUsd(totalPnl)} ({formatPercent(totalPnlPercent)})
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Positions</Text>
        <Text style={styles.value}>{positions.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#1a1a22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a35',
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { color: '#888', fontSize: 14 },
  value: { color: '#fff', fontSize: 14, fontWeight: '600' },
  positive: { color: '#22c55e' },
  negative: { color: '#ef4444' },
});
