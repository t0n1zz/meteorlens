import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatUsd } from '../../utils/formatters';
import { useTheme } from '../../hooks/useTheme';
import type { AppPosition } from '../../types/position';

interface PositionStatsProps {
  positions: AppPosition[];
}

/**
 * Additional position statistics: in-range count, total fees, etc.
 */
export function PositionStats({ positions }: PositionStatsProps) {
  const { screen } = useTheme();
  if (positions.length === 0) return null;

  const inRangeCount = positions.filter((p) => p.range.inRange).length;
  const outOfRangeCount = positions.length - inRangeCount;
  const totalFees = positions.reduce((s, p) => s + (p.fees.totalFeeUsdClaimed ?? 0), 0);
  const avgRiskScore = positions.reduce((s, p) => s + (p.riskScore?.score ?? 50), 0) / positions.length;
  const highRiskCount = positions.filter((p) => (p.riskScore?.score ?? 50) < 50).length;
  const riskColor = avgRiskScore >= 80 ? screen.positive : avgRiskScore >= 50 ? '#eab308' : screen.negative;

  return (
    <View style={[styles.wrap, { backgroundColor: screen.card, borderColor: screen.cardBorder }]}>
      <Text style={[styles.title, { color: screen.text }]}>Stats</Text>
      <View style={styles.grid}>
        <View style={[styles.stat, { backgroundColor: screen.background }]}>
          <Text style={[styles.statValue, { color: screen.positive }]}>{inRangeCount}</Text>
          <Text style={[styles.statLabel, { color: screen.textMuted }]}>In range</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: screen.background }]}>
          <Text style={[styles.statValue, { color: screen.text }]}>{outOfRangeCount}</Text>
          <Text style={[styles.statLabel, { color: screen.textMuted }]}>Out of range</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: screen.background }]}>
          <Text style={[styles.statValue, { color: screen.text }]}>{formatUsd(totalFees)}</Text>
          <Text style={[styles.statLabel, { color: screen.textMuted }]}>Total fees</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: screen.background }]}>
          <Text style={[styles.statValue, { color: riskColor }]}>{Math.round(avgRiskScore)}</Text>
          <Text style={[styles.statLabel, { color: screen.textMuted }]}>Avg risk</Text>
        </View>
        {highRiskCount > 0 && (
          <View style={[styles.stat, { backgroundColor: screen.background }]}>
            <Text style={[styles.statValue, { color: screen.negative }]}>{highRiskCount}</Text>
            <Text style={[styles.statLabel, { color: screen.textMuted }]}>High risk</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
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
    padding: 12,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
});
