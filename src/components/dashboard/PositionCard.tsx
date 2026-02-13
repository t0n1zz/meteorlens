import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatUsd, formatPercent } from '../../utils/formatters';
import { Card } from '../common/Card';
import { RiskScore } from './RiskScore';
import { useTheme } from '../../hooks/useTheme';
import type { AppPosition } from '../../types/position';

interface PositionCardProps {
  position: AppPosition;
  onPress?: () => void;
}

export const PositionCard = React.memo(function PositionCard({ position, onPress }: PositionCardProps) {
  const { screen } = useTheme();
  const { value, range, fees, pnl, pairName } = position;
  const inRangeColor = range.inRange ? screen.positive : screen.negative;

  const content = (
    <>
      <View style={styles.header}>
        <View style={styles.pairRow}>
          <View style={[styles.pairIcon, { backgroundColor: screen.accentMuted }]}>
            <Text style={[styles.pairIconText, { color: screen.accent }]}>◉</Text>
          </View>
          <Text style={[styles.pair, { color: screen.text }]} numberOfLines={1}>{pairName}</Text>
        </View>
        <View style={[styles.rangeBadge, { backgroundColor: inRangeColor + '22' }]}>
          <Text style={[styles.rangeText, { color: inRangeColor }]}>
            {range.inRange ? 'In range' : 'Out of range'}
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: screen.textMuted }]}>Value</Text>
        <Text style={[styles.value, { color: screen.text }]}>{formatUsd(value.valueUsd)}</Text>
      </View>
      {fees.feeApr24h != null && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: screen.textMuted }]}>Fee APR (24h)</Text>
          <Text style={[styles.value, { color: screen.text }]}>{formatPercent(fees.feeApr24h)}</Text>
        </View>
      )}
      {fees.totalFeeUsdClaimed != null && fees.totalFeeUsdClaimed > 0 && (
        <View style={styles.row}>
          <Text style={[styles.label, { color: screen.textMuted }]}>Fees claimed</Text>
          <Text style={[styles.value, { color: screen.text }]}>{formatUsd(fees.totalFeeUsdClaimed)}</Text>
        </View>
      )}
      {pnl && (
        <>
          <View style={styles.row}>
            <Text style={[styles.label, { color: screen.textMuted }]}>PnL</Text>
            <Text style={[styles.value, { color: pnl.totalPnlUsd >= 0 ? screen.positive : screen.negative }]}>
              {formatUsd(pnl.totalPnlUsd)} ({formatPercent(pnl.totalPnlPercent)})
            </Text>
          </View>
          {pnl.roiPercent != null && (
            <View style={styles.row}>
              <Text style={[styles.label, { color: screen.textMuted }]}>ROI</Text>
              <Text style={[styles.value, { color: pnl.roiPercent >= 0 ? screen.positive : screen.negative }]}>
                {formatPercent(pnl.roiPercent)}
              </Text>
            </View>
          )}
        </>
      )}
      <View style={[styles.footer, { borderTopColor: screen.cardBorder }]}>
        <Text style={[styles.bins, { color: screen.textMuted }]}>
          Bins {range.minBinId} – {range.maxBinId} · active {range.activeBinId}
        </Text>
        <RiskScore score={position.riskScore?.score} size="small" />
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.72}>
        <Card style={styles.card}>{content}</Card>
      </TouchableOpacity>
    );
  }
  return <Card style={styles.card}>{content}</Card>;
});

const styles = StyleSheet.create({
  card: { marginBottom: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  pairRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  pairIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pairIconText: { fontSize: 14 },
  pair: { fontSize: 16, fontWeight: '700', flex: 1 },
  rangeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  rangeText: { fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  bins: { fontSize: 12 },
});
