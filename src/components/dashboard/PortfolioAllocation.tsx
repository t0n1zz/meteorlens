import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatUsd, formatPercent } from '../../utils/formatters';
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
    <View style={styles.wrap}>
      <Text style={styles.title}>Allocation</Text>
      
      {poolAllocation.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>By Pool</Text>
          {poolAllocation.map((item) => (
            <View key={item.label} style={styles.row}>
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
              <View style={styles.values}>
                <Text style={styles.value}>{formatUsd(item.valueUsd)}</Text>
                <Text style={styles.percent}>{formatPercent(item.percent)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {tokenAllocation.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>By Token</Text>
          {tokenAllocation.map((item) => (
            <View key={item.label} style={styles.row}>
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
              <View style={styles.values}>
                <Text style={styles.value}>{formatUsd(item.valueUsd)}</Text>
                <Text style={styles.percent}>{formatPercent(item.percent)}</Text>
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
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#fff',
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
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  percent: {
    color: '#888',
    fontSize: 12,
  },
});
