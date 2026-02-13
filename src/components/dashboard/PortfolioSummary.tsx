import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatUsd, formatPercent } from '../../utils/formatters';
import { useTheme } from '../../hooks/useTheme';
import type { AppPosition } from '../../types/position';

interface PortfolioSummaryProps {
  positions: AppPosition[];
}

export function PortfolioSummary({ positions }: PortfolioSummaryProps) {
  const { screen } = useTheme();
  const totalValue = positions.reduce((s, p) => s + p.value.valueUsd, 0);
  const totalFees = positions.reduce((s, p) => s + (p.fees.totalFeeUsdClaimed ?? 0), 0);
  const totalPnl = positions.reduce((s, p) => s + (p.pnl?.totalPnlUsd ?? 0), 0);
  const totalPnlPercent = totalValue > 0 ? (totalPnl / (totalValue - totalFees)) * 100 : 0;

  const byPnlPercent = [...positions].sort((a, b) => {
    const aPct = a.pnl?.totalPnlPercent ?? 0;
    const bPct = b.pnl?.totalPnlPercent ?? 0;
    return bPct - aPct;
  });
  const best = byPnlPercent[0];
  const worst = byPnlPercent.length > 1 ? byPnlPercent[byPnlPercent.length - 1] : null;

  return (
    <View style={[styles.wrap, { backgroundColor: screen.card, borderColor: screen.cardBorder }]}>
      <View style={styles.titleRow}>
        <Text style={[styles.icon, { color: screen.accent }]}>◉</Text>
        <Text style={[styles.title, { color: screen.text }]}>Portfolio</Text>
      </View>
      <View style={styles.grid}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: screen.textMuted }]}>Total value</Text>
          <Text style={[styles.value, { color: screen.text }]}>{formatUsd(totalValue)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: screen.textMuted }]}>Fees earned</Text>
          <Text style={[styles.value, { color: screen.text }]}>{formatUsd(totalFees)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: screen.textMuted }]}>Total PnL</Text>
          <Text style={[styles.value, totalPnl >= 0 ? { color: screen.positive } : { color: screen.negative }]}>
            {formatUsd(totalPnl)} ({formatPercent(totalPnlPercent)})
          </Text>
        </View>
        {best && (
          <View style={styles.row}>
            <Text style={[styles.label, { color: screen.textMuted }]}>Best</Text>
            <Text style={[styles.value, { color: screen.positive }]}>
              {best.pairName} {formatPercent(best.pnl?.totalPnlPercent ?? 0)}
            </Text>
          </View>
        )}
        {worst && worst !== best && (
          <View style={styles.row}>
            <Text style={[styles.label, { color: screen.textMuted }]}>Worst</Text>
            <Text style={[styles.value, (worst.pnl?.totalPnlPercent ?? 0) >= 0 ? { color: screen.positive } : { color: screen.negative }]}>
              {worst.pairName} {formatPercent(worst.pnl?.totalPnlPercent ?? 0)}
            </Text>
          </View>
        )}
        <View style={[styles.row, styles.rowLast]}>
          <Text style={[styles.label, { color: screen.textMuted }]}>Positions</Text>
          <Text style={[styles.value, { color: screen.text }]}>{positions.length}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  icon: { fontSize: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  grid: {},
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rowLast: { marginBottom: 0 },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '600' },
});
