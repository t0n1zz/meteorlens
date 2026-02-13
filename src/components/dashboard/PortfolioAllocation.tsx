import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatUsd, formatPercent } from '../../utils/formatters';
import { useTheme } from '../../hooks/useTheme';
import type { AppPosition } from '../../types/position';

interface PortfolioAllocationProps {
  positions: AppPosition[];
}

interface AllocationItem {
  label: string;
  valueUsd: number;
  percent: number;
}

export function PortfolioAllocation({ positions }: PortfolioAllocationProps) {
  const { screen } = useTheme();
  const totalValue = positions.reduce((s, p) => s + p.value.valueUsd, 0);

  if (totalValue === 0 || positions.length === 0) return null;

  // Allocation by pool
  const poolMap = new Map<string, number>();
  positions.forEach((p) => {
    const current = poolMap.get(p.pairName) ?? 0;
    poolMap.set(p.pairName, current + p.value.valueUsd);
  });
  const poolAllocation: AllocationItem[] = Array.from(poolMap.entries())
    .map(([label, valueUsd]) => ({
      label,
      valueUsd,
      percent: (valueUsd / totalValue) * 100,
    }))
    .sort((a, b) => b.valueUsd - a.valueUsd)
    .slice(0, 5); // Top 5 pools

  // Allocation by token
  const tokenMap = new Map<string, number>();
  positions.forEach((p) => {
    const xSymbol = p.value.tokenXSymbol;
    const ySymbol = p.value.tokenYSymbol;
    const xValue = tokenMap.get(xSymbol) ?? 0;
    const yValue = tokenMap.get(ySymbol) ?? 0;
    tokenMap.set(xSymbol, xValue + p.value.valueTokenXUsd);
    tokenMap.set(ySymbol, yValue + p.value.valueTokenYUsd);
  });
  const tokenAllocation: AllocationItem[] = Array.from(tokenMap.entries())
    .map(([label, valueUsd]) => ({
      label,
      valueUsd,
      percent: (valueUsd / totalValue) * 100,
    }))
    .sort((a, b) => b.valueUsd - a.valueUsd)
    .slice(0, 5); // Top 5 tokens

  return (
    <View style={[styles.wrap, { backgroundColor: screen.card, borderColor: screen.cardBorder }]}>
      <Text style={[styles.title, { color: screen.text }]}>Allocation</Text>

      {poolAllocation.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: screen.textMuted }]}>By Pool</Text>
          {poolAllocation.map((item) => (
            <View key={item.label} style={styles.row}>
              <Text style={[styles.label, { color: screen.text }]} numberOfLines={1}>
                {item.label}
              </Text>
              <View style={styles.values}>
                <Text style={[styles.value, { color: screen.text }]}>{formatUsd(item.valueUsd)}</Text>
                <Text style={[styles.percent, { color: screen.textMuted }]}>{formatPercent(item.percent)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {tokenAllocation.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: screen.textMuted }]}>By Token</Text>
          {tokenAllocation.map((item) => (
            <View key={item.label} style={styles.row}>
              <Text style={[styles.label, { color: screen.text }]} numberOfLines={1}>
                {item.label}
              </Text>
              <View style={styles.values}>
                <Text style={[styles.value, { color: screen.text }]}>{formatUsd(item.valueUsd)}</Text>
                <Text style={[styles.percent, { color: screen.textMuted }]}>{formatPercent(item.percent)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
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
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  values: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  percent: {
    fontSize: 12,
  },
});
