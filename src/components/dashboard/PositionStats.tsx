import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatUsd, formatPercent } from '../../utils/formatters';
import type { AppPosition } from '../../types/position';

interface PositionStatsProps {
  positions: AppPosition[];
}

/**
 * Additional position statistics: in-range count, total fees, etc.
 */
export function PositionStats({ positions }: PositionStatsProps) {
  if (positions.length === 0) return null;

  const inRangeCount = positions.filter((p) => p.range.inRange).length;
  const outOfRangeCount = positions.length - inRangeCount;
  const totalFees = positions.reduce((s, p) => s + (p.fees.totalFeeUsdClaimed ?? 0), 0);
  const avgRiskScore = positions.reduce((s, p) => s + (p.riskScore?.score ?? 50), 0) / positions.length;
  const highRiskCount = positions.filter((p) => (p.riskScore?.score ?? 50) < 50).length;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Stats</Text>
      <View style={styles.grid}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{inRangeCount}</Text>
          <Text style={styles.statLabel}>In range</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{outOfRangeCount}</Text>
          <Text style={styles.statLabel}>Out of range</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatUsd(totalFees)}</Text>
          <Text style={styles.statLabel}>Total fees</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, avgRiskScore >= 80 ? styles.good : avgRiskScore >= 50 ? styles.warning : styles.bad]}>
            {Math.round(avgRiskScore)}
          </Text>
          <Text style={styles.statLabel}>Avg risk</Text>
        </View>
        {highRiskCount > 0 && (
          <View style={styles.stat}>
            <Text style={[styles.statValue, styles.bad]}>{highRiskCount}</Text>
            <Text style={styles.statLabel}>High risk</Text>
          </View>
        )}
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stat: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#0f0f14',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  good: { color: '#22c55e' },
  warning: { color: '#f59e0b' },
  bad: { color: '#ef4444' },
});
