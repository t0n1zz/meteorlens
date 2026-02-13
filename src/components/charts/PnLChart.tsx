import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkline } from './Sparkline';
import { getPnLHistory } from '../../services/positions/pnlHistory';
import { formatUsd } from '../../utils/formatters';

interface PnLChartProps {
  positionPubkey: string;
  pairName: string;
  width?: number;
  height?: number;
}

export function PnLChart({
  positionPubkey,
  pairName,
  width = 280,
  height = 80,
}: PnLChartProps) {
  const [points, setPoints] = useState<{ totalPnlUsd: number }[]>([]);

  useEffect(() => {
    let cancelled = false;
    getPnLHistory(positionPubkey, 24).then((history) => {
      if (!cancelled) {
        setPoints(history.map((p) => ({ totalPnlUsd: p.totalPnlUsd })));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [positionPubkey]);

  if (points.length < 2) {
    return (
      <View style={[styles.wrap, { width }]}>
        <Text style={styles.label}>PnL over time</Text>
        <Text style={styles.hint}>Collecting data… Check back after a few refreshes.</Text>
      </View>
    );
  }

  const values = points.map((p) => p.totalPnlUsd);
  const latest = values[values.length - 1] ?? 0;

  return (
    <View style={[styles.wrap, { width }]}>
      <View style={styles.header}>
        <Text style={styles.label}>PnL over time</Text>
        <Text style={[styles.value, latest >= 0 ? styles.positive : styles.negative]}>
          {formatUsd(latest)}
        </Text>
      </View>
      <Sparkline
        data={values}
        width={width}
        height={height}
        positiveColor="#22c55e"
        negativeColor="#ef4444"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#888',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
  positive: { color: '#22c55e' },
  negative: { color: '#ef4444' },
  hint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
