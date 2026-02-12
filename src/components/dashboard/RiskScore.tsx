import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { RiskScore as RiskScoreType } from '../../types/risk';
import { RISK_GREEN_MIN, RISK_YELLOW_MIN } from '../../utils/constants';

interface RiskScoreProps {
  score: number | null | undefined;
  size?: 'small' | 'medium';
}

function getLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= RISK_GREEN_MIN) return 'low';
  if (score >= RISK_YELLOW_MIN) return 'medium';
  return 'high';
}

function getColor(level: 'low' | 'medium' | 'high') {
  switch (level) {
    case 'low':
      return '#22c55e';
    case 'medium':
      return '#eab308';
    case 'high':
      return '#ef4444';
  }
}

export function RiskScore({ score, size = 'medium' }: RiskScoreProps) {
  if (score == null || score < 0) {
    return (
      <View style={styles.wrap}>
        <Text style={[styles.label, size === 'small' && styles.labelSmall]}>Risk</Text>
        <Text style={[styles.value, size === 'small' && styles.valueSmall]}>—</Text>
      </View>
    );
  }
  const level = getLevel(score);
  const color = getColor(level);
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, size === 'small' && styles.labelSmall]}>Risk</Text>
      <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
        <Text style={[styles.value, size === 'small' && styles.valueSmall, { color }]}>
          {Math.round(score)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-start' },
  label: { fontSize: 12, color: '#888', marginBottom: 4 },
  labelSmall: { fontSize: 10 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  value: { fontSize: 16, fontWeight: '700' },
  valueSmall: { fontSize: 14 },
});
