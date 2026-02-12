import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Alert } from '../../services/alerts/alertService';

interface AlertBannerProps {
  alert: Alert;
  onDismiss?: (alertId: string) => void;
  onPress?: (alert: Alert) => void;
}

export function AlertBanner({ alert, onDismiss, onPress }: AlertBannerProps) {
  const severityColors = {
    high: { bg: '#ef444422', border: '#ef4444', text: '#ef4444' },
    medium: { bg: '#f59e0b22', border: '#f59e0b', text: '#f59e0b' },
    low: { bg: '#3b82f622', border: '#3b82f6', text: '#3b82f6' },
  };

  const colors = severityColors[alert.severity];

  return (
    <TouchableOpacity
      onPress={() => onPress?.(alert)}
      activeOpacity={0.8}
      style={[styles.banner, { backgroundColor: colors.bg, borderColor: colors.border }]}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.severity, { color: colors.text }]}>
            {alert.severity.toUpperCase()}
          </Text>
          <Text style={styles.message}>{alert.message}</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity
            onPress={() => onDismiss(alert.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.dismiss}>×</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  severity: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  message: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  dismiss: {
    color: '#888',
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '300',
  },
});
