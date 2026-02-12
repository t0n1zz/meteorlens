import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertBanner } from './AlertBanner';
import { checkAllPositionsAlerts } from '../../services/alerts/alertService';
import { useSettingsStore } from '../../store/settingsStore';
import type { AppPosition } from '../../types/position';
import type { PoolMetrics } from '../../types/pool';

interface AlertsListProps {
  positions: AppPosition[];
  pools: Map<string, PoolMetrics>;
  maxAlerts?: number;
}

export function AlertsList({ positions, pools, maxAlerts = 5 }: AlertsListProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const ilAlertThreshold = useSettingsStore((s) => s.ilAlertThresholdPercent);

  const allAlerts = checkAllPositionsAlerts(positions, pools, {
    ilPercentThreshold: -ilAlertThreshold, // Negative because IL is negative
  });
  const visibleAlerts = allAlerts
    .filter((a) => !dismissedIds.has(a.id))
    .slice(0, maxAlerts);

  const handleDismiss = (alertId: string) => {
    setDismissedIds((prev) => new Set(prev).add(alertId));
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Alerts</Text>
      {visibleAlerts.map((alert) => (
        <AlertBanner
          key={alert.id}
          alert={alert}
          onDismiss={handleDismiss}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
});
