import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatUsd, formatPercent } from '../../utils/formatters';
import { Card } from '../common/Card';
import { RiskScore } from './RiskScore';
import type { AppPosition } from '../../types/position';

interface PositionCardProps {
  position: AppPosition;
  onPress?: () => void;
}

export function PositionCard({ position, onPress }: PositionCardProps) {
  const { value, range, fees, pnl, pairName } = position;
  const inRangeColor = range.inRange ? '#22c55e' : '#ef4444';

  const content = (
    <>
      <View style={styles.header}>
        <Text style={styles.pair}>{pairName}</Text>
        <View style={[styles.rangeBadge, { backgroundColor: inRangeColor + '22' }]}>
          <Text style={[styles.rangeText, { color: inRangeColor }]}>
            {range.inRange ? 'In range' : 'Out of range'}
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Value</Text>
        <Text style={styles.value}>{formatUsd(value.valueUsd)}</Text>
      </View>
      {fees.feeApr24h != null && (
        <View style={styles.row}>
          <Text style={styles.label}>Fee APR (24h)</Text>
          <Text style={styles.value}>{formatPercent(fees.feeApr24h)}</Text>
        </View>
      )}
      {fees.totalFeeUsdClaimed != null && fees.totalFeeUsdClaimed > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Fees claimed</Text>
          <Text style={styles.value}>{formatUsd(fees.totalFeeUsdClaimed)}</Text>
        </View>
      )}
      {pnl && (
        <>
          <View style={styles.row}>
            <Text style={styles.label}>PnL</Text>
            <Text style={[styles.value, pnl.totalPnlUsd >= 0 ? styles.positive : styles.negative]}>
              {formatUsd(pnl.totalPnlUsd)} ({formatPercent(pnl.totalPnlPercent)})
            </Text>
          </View>
          {pnl.roiPercent != null && (
            <View style={styles.row}>
              <Text style={styles.label}>ROI</Text>
              <Text style={[styles.value, pnl.roiPercent >= 0 ? styles.positive : styles.negative]}>
                {formatPercent(pnl.roiPercent)}
              </Text>
            </View>
          )}
        </>
      )}
      <View style={styles.footer}>
        <Text style={styles.bins}>
          Bins {range.minBinId} – {range.maxBinId} (active: {range.activeBinId})
        </Text>
        <RiskScore score={position.riskScore?.score} size="small" />
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Card style={styles.card}>{content}</Card>
      </TouchableOpacity>
    );
  }
  return <Card style={styles.card}>{content}</Card>;
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pair: { fontSize: 16, fontWeight: '700', color: '#fff' },
  rangeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rangeText: { fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: '#888', fontSize: 14 },
  value: { color: '#fff', fontSize: 14, fontWeight: '600' },
  positive: { color: '#22c55e' },
  negative: { color: '#ef4444' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2a2a35',
  },
  bins: { color: '#666', fontSize: 12 },
});
