import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SparklineProps {
  data: number[];
  width: number;
  height: number;
  positiveColor?: string;
  negativeColor?: string;
  strokeWidth?: number;
}

/**
 * Minimal sparkline: draws a simple line/area trend from numeric data.
 * Uses View bars for compatibility without react-native-svg.
 */
export function Sparkline({
  data,
  width,
  height,
  positiveColor = '#22c55e',
  negativeColor = '#ef4444',
  strokeWidth = 2,
}: SparklineProps) {
  if (data.length < 2) return <View style={[styles.container, { width, height }]} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const isPositive = data[data.length - 1] >= (data[0] ?? 0);
  const color = isPositive ? positiveColor : negativeColor;

  // Build bars (vertical segments) to approximate a line
  const bars = data.map((value, i) => {
    const x = i * step;
    const normalized = (value - min) / range;
    const barHeight = Math.max(2, normalized * (height - 4));
    const marginTop = height - barHeight - 2;

    return (
      <View
        key={i}
        style={[
          styles.bar,
          {
            width: Math.max(1, step - 1),
            height: barHeight,
            marginLeft: i === 0 ? 0 : 0,
            marginTop,
            backgroundColor: color,
            opacity: 0.3 + 0.7 * (i / data.length),
          },
        ]}
      />
    );
  });

  return (
    <View style={[styles.container, { width, height }]}>
      <View style={styles.barRow}>{bars}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 4,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
  },
  bar: {
    borderRadius: 1,
  },
});
