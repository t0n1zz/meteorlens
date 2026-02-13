import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type OhlcvPoint = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

interface PriceChartProps {
  data: OhlcvPoint[];
  width: number;
  height: number;
  /** Optional position range: show band between these prices */
  rangeMin?: number;
  rangeMax?: number;
  accentColor?: string;
  mutedColor?: string;
}

/**
 * Simple price chart from OHLCV close prices. Optional shaded band for position range.
 * No extra deps; uses View bars like Sparkline.
 */
export function PriceChart({
  data,
  width,
  height,
  rangeMin,
  rangeMax,
  accentColor = '#9945FF',
  mutedColor = '#888',
}: PriceChartProps) {
  const closes = data.map((d) => d.close).filter((c) => typeof c === 'number' && c > 0);
  if (closes.length < 2) {
    return (
      <View style={[styles.wrap, { width, height }]}>
        <Text style={[styles.label, { color: mutedColor }]}>Price (24h)</Text>
        <Text style={[styles.noData, { color: mutedColor }]}>No price data</Text>
      </View>
    );
  }

  const minP = Math.min(...closes);
  const maxP = Math.max(...closes);
  const range = maxP - minP || 1;
  const step = width / (closes.length - 1);

  // Range band in data coordinates
  let bandTop = 0;
  let bandHeight = 0;
  if (typeof rangeMin === 'number' && typeof rangeMax === 'number' && rangeMin < rangeMax) {
    const yMax = (Math.min(rangeMax, maxP) - minP) / range;
    const yMin = (Math.max(rangeMin, minP) - minP) / range;
    bandTop = (1 - yMax) * (height - 24);
    bandHeight = Math.max(4, (yMax - yMin) * (height - 24));
  }

  const bars = closes.map((value, i) => {
    const normalized = (value - minP) / range;
    const barHeight = Math.max(2, normalized * (height - 28));
    const marginTop = height - 28 - barHeight;

    return (
      <View
        key={i}
        style={[
          styles.bar,
          {
            width: Math.max(1, step - 1),
            height: barHeight,
            marginTop,
            backgroundColor: accentColor,
            opacity: 0.4 + 0.6 * (i / closes.length),
          },
        ]}
      />
    );
  });

  return (
    <View style={[styles.wrap, { width }]}>
      <Text style={[styles.label, { color: mutedColor }]}>Price (24h)</Text>
      <View style={[styles.chart, { width, height: height - 20 }]}>
        {bandHeight > 0 && (
          <View
            style={[
              styles.rangeBand,
              {
                top: bandTop,
                height: bandHeight,
                backgroundColor: `${accentColor}30`,
              },
            ]}
          />
        )}
        <View style={styles.barRow}>{bars}</View>
      </View>
      <View style={styles.axisRow}>
        <Text style={[styles.axisText, { color: mutedColor }]}>
          {minP < 1 ? minP.toFixed(6) : minP.toFixed(2)}
        </Text>
        <Text style={[styles.axisText, { color: mutedColor }]}>
          {maxP < 1 ? maxP.toFixed(6) : maxP.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  label: { fontSize: 12, marginBottom: 4 },
  noData: { fontSize: 12 },
  chart: { position: 'relative', overflow: 'hidden', borderRadius: 4 },
  rangeBand: { position: 'absolute', left: 0, right: 0, borderRadius: 2 },
  barRow: { flexDirection: 'row', alignItems: 'flex-end', height: '100%' },
  bar: { borderRadius: 1 },
  axisRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  axisText: { fontSize: 10 },
});
