import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePoolData } from '../hooks/usePoolData';
import { formatUsd, formatPercent, formatTokenAmount } from '../utils/formatters';
import { Card } from '../components/common/Card';
import { PnLChart } from '../components/charts/PnLChart';
import { PriceChart, type OhlcvPoint } from '../components/charts/PriceChart';
import { fetchPoolOhlcv } from '../services/meteora/api';
import { useTheme } from '../hooks/useTheme';
import type { AppPosition } from '../types/position';

function parseOhlcvResponse(raw: unknown): OhlcvPoint[] {
  const arr = Array.isArray(raw) ? raw : (raw as { data?: unknown[] })?.data;
  if (!Array.isArray(arr)) return [];
  return arr
    .map((item: unknown) => {
      const o = item as Record<string, unknown>;
      const t = Number(o.timestamp ?? o.time ?? o.t);
      const open = Number(o.open ?? o.o);
      const high = Number(o.high ?? o.h);
      const low = Number(o.low ?? o.l);
      const close = Number(o.close ?? o.c);
      if (!Number.isFinite(close)) return null;
      return { timestamp: t, open, high, low, close };
    })
    .filter((x): x is OhlcvPoint => x != null);
}

interface PositionDetailScreenProps {
  position: AppPosition | null;
  onBack?: () => void;
}

export function PositionDetailScreen({ position, onBack }: PositionDetailScreenProps) {
  const theme = useTheme();
  const screen = theme.screen;
  const { pool, fetchPool } = usePoolData();
  const [ohlcv, setOhlcv] = useState<OhlcvPoint[]>([]);

  useEffect(() => {
    if (position?.lbPair) {
      fetchPool(position.lbPair);
    }
  }, [position?.lbPair, fetchPool]);

  useEffect(() => {
    if (!position?.lbPair) {
      setOhlcv([]);
      return;
    }
    let cancelled = false;
    fetchPoolOhlcv(position.lbPair, '24h')
      .then((raw) => {
        if (!cancelled) setOhlcv(parseOhlcvResponse(raw));
      })
      .catch(() => {
        if (!cancelled) setOhlcv([]);
      });
    return () => {
      cancelled = true;
    };
  }, [position?.lbPair]);

  if (!position) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: screen.background }]}>
        <Text style={[styles.placeholder, { color: screen.textMuted }]}>Select a position</Text>
      </SafeAreaView>
    );
  }

  const { value, range, fees, pnl, pairName, createdAt } = position;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screen.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.pairTitle, { color: screen.text }]}>{pairName}</Text>
        <View style={[styles.rangeBadge, { backgroundColor: range.inRange ? `${screen.positive}22` : `${screen.negative}22` }]}>
          <Text style={{ color: range.inRange ? screen.positive : screen.negative }}>
            {range.inRange ? 'In range' : 'Out of range'}
          </Text>
        </View>

        {ohlcv.length >= 2 && (
          <Card style={styles.card}>
            <PriceChart
              data={ohlcv}
              width={340}
              height={140}
              rangeMin={range.priceMin}
              rangeMax={range.priceMax}
              accentColor={screen.accent}
              mutedColor={screen.textMuted}
            />
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: screen.textMuted }]}>Value</Text>
          <Text style={[styles.bigValue, { color: screen.text }]}>{formatUsd(value.valueUsd)}</Text>
          <View style={styles.row}>
            <Text style={[styles.muted, { color: screen.textMuted }]}>{formatTokenAmount(value.tokenXAmount, value.tokenXSymbol)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.muted, { color: screen.textMuted }]}>{formatTokenAmount(value.tokenYAmount, value.tokenYSymbol)}</Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: screen.textMuted }]}>Fees</Text>
          {fees.totalFeeUsdClaimed != null && (
            <Text style={[styles.value, { color: screen.text }]}>{formatUsd(fees.totalFeeUsdClaimed)} claimed</Text>
          )}
          {fees.feeApr24h != null && (
            <View style={styles.row}>
              <Text style={[styles.label, { color: screen.textMuted }]}>APR (24h)</Text>
              <Text style={[styles.value, { color: screen.text }]}>{formatPercent(fees.feeApr24h)}</Text>
            </View>
          )}
          {fees.feePeriods && (
            <>
              {fees.feePeriods.daily > 0 && (
                <View style={styles.row}>
                  <Text style={[styles.label, { color: screen.textMuted }]}>Last 24h</Text>
                  <Text style={[styles.value, { color: screen.text }]}>{formatUsd(fees.feePeriods.daily)}</Text>
                </View>
              )}
              {fees.feePeriods.weekly > 0 && (
                <View style={styles.row}>
                  <Text style={[styles.label, { color: screen.textMuted }]}>Last 7 days</Text>
                  <Text style={[styles.value, { color: screen.text }]}>{formatUsd(fees.feePeriods.weekly)}</Text>
                </View>
              )}
              {fees.feePeriods.monthly > 0 && (
                <View style={styles.row}>
                  <Text style={[styles.label, { color: screen.textMuted }]}>Last 30 days</Text>
                  <Text style={[styles.value, { color: screen.text }]}>{formatUsd(fees.feePeriods.monthly)}</Text>
                </View>
              )}
              {fees.feeGrowthRatePerDay != null && fees.feeGrowthRatePerDay > 0 && (
                <View style={styles.row}>
                  <Text style={[styles.label, { color: screen.textMuted }]}>Avg per day</Text>
                  <Text style={[styles.value, { color: screen.text }]}>{formatUsd(fees.feeGrowthRatePerDay)}</Text>
                </View>
              )}
            </>
          )}
        </Card>

        <PnLChart
          positionPubkey={position.publicKey}
          pairName={pairName}
          width={340}
          height={88}
        />
        {pnl && (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: screen.textMuted }]}>PnL</Text>
            <Text style={[styles.bigValue, { color: pnl.totalPnlUsd >= 0 ? screen.positive : screen.negative }]}>
              {formatUsd(pnl.totalPnlUsd)} ({formatPercent(pnl.totalPnlPercent)})
            </Text>
            {pnl.roiPercent != null && (
              <View style={styles.row}>
                <Text style={[styles.label, { color: screen.textMuted }]}>ROI</Text>
                <Text style={[styles.value, { color: pnl.roiPercent >= 0 ? screen.positive : screen.negative }]}>
                  {formatPercent(pnl.roiPercent)}
                </Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={[styles.label, { color: screen.textMuted }]}>Fee income</Text>
              <Text style={[styles.value, { color: screen.text }]}>{formatUsd(pnl.feeIncomeUsd)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: screen.textMuted }]}>Impermanent loss</Text>
              <Text style={[styles.negative, { color: screen.negative }]}>
                {formatPercent(pnl.impermanentLossPercent)}
              </Text>
            </View>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: screen.textMuted }]}>Range</Text>
          <Text style={[styles.muted, { color: screen.textMuted }]}>
            Bins {range.minBinId} – {range.maxBinId}
          </Text>
          <Text style={[styles.muted, { color: screen.textMuted }]}>Active bin: {range.activeBinId}</Text>
          {range.distanceToMinPercent != null && range.distanceToMaxPercent != null && (
            <>
              <View style={styles.row}>
                <Text style={[styles.label, { color: screen.textMuted }]}>Distance to min edge</Text>
                <Text style={[styles.value, { color: screen.text }]}>
                  {range.distanceToMinPercent.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: screen.textMuted }]}>Distance to max edge</Text>
                <Text style={[styles.value, { color: screen.text }]}>
                  {range.distanceToMaxPercent.toFixed(1)}%
                </Text>
              </View>
            </>
          )}
        </Card>

        {createdAt != null && (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: screen.textMuted }]}>Entry</Text>
            <Text style={[styles.muted, { color: screen.textMuted }]}>
              {new Date(createdAt).toLocaleDateString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </Text>
          </Card>
        )}

        {pool && (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: screen.textMuted }]}>Pool</Text>
            <View style={styles.row}>
              <Text style={[styles.label, { color: screen.textMuted }]}>TVL</Text>
              <Text style={[styles.value, { color: screen.text }]}>{formatUsd(pool.tvl ?? 0)}</Text>
            </View>
            {pool.volume?.['24h'] != null && (
              <View style={styles.row}>
                <Text style={[styles.label, { color: screen.textMuted }]}>24h volume</Text>
                <Text style={[styles.value, { color: screen.text }]}>{formatUsd(pool.volume['24h'])}</Text>
              </View>
            )}
            {pool.tvl != null && pool.tvl > 0 && pool.volume?.['24h'] != null && (
              <View style={styles.row}>
                <Text style={[styles.label, { color: screen.textMuted }]}>24h volume / TVL</Text>
                <Text style={[styles.value, { color: screen.text }]}>
                  {((pool.volume['24h'] / pool.tvl) * 100).toFixed(1)}%
                </Text>
              </View>
            )}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  placeholder: { textAlign: 'center', marginTop: 40 },
  pairTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  rangeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
  },
  card: { marginBottom: 16 },
  cardTitle: { fontSize: 14, marginBottom: 8 },
  bigValue: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: {},
  value: { fontWeight: '600' },
  muted: { fontSize: 14 },
  positive: {},
  negative: {},
});
