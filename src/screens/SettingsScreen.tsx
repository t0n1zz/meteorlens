import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useSettingsStore } from '../store/settingsStore';

export function SettingsScreen() {
  const hasHeliusKey = Boolean(
    Constants.expoConfig?.extra?.EXPO_PUBLIC_HELIUS_API_KEY
  );
  const { ilAlertThresholdPercent, setIlAlertThreshold } = useSettingsStore();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.sectionLabel}>Setup</Text>
        <Text style={styles.paragraph}>
          Copy <Text style={styles.mono}>.env.example</Text> to <Text style={styles.mono}>.env</Text> and set{' '}
          <Text style={styles.mono}>EXPO_PUBLIC_HELIUS_API_KEY</Text> (get a key at helius.dev). Restart the dev server after changing .env.
        </Text>
        <Text style={[styles.paragraph, styles.rpcRow]}>
          RPC: {hasHeliusKey ? 'Helius (key set)' : 'Public (rate-limited — add key if loading fails)'}
        </Text>
        <Text style={styles.sectionLabel}>Alerts</Text>
        <Text style={styles.paragraph}>
          Configure when to receive alerts for impermanent loss.
        </Text>
        <View style={styles.thresholdRow}>
          {[5, 10, 15, 20].map((threshold) => (
            <TouchableOpacity
              key={threshold}
              style={[
                styles.thresholdButton,
                ilAlertThresholdPercent === threshold && styles.thresholdButtonActive,
              ]}
              onPress={() => setIlAlertThreshold(threshold)}
            >
              <Text
                style={[
                  styles.thresholdText,
                  ilAlertThresholdPercent === threshold && styles.thresholdTextActive,
                ]}
              >
                {threshold}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.hint}>
          Alert when IL exceeds {ilAlertThresholdPercent}% (default: 5%)
        </Text>
        <Text style={styles.sectionLabel}>Privacy</Text>
        <Text style={styles.paragraph}>
          Read-only mode: addresses are stored only on this device. We never request private keys or send addresses to external servers.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f14' },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 16 },
  sectionLabel: { fontSize: 12, color: '#9945FF', marginBottom: 8, marginTop: 16, textTransform: 'uppercase' },
  paragraph: { color: '#888', fontSize: 14, lineHeight: 22 },
  mono: { fontFamily: 'monospace', color: '#aaa' },
  rpcRow: { marginTop: 4 },
  thresholdRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  thresholdButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1a1a22',
    borderWidth: 1,
    borderColor: '#2a2a35',
    alignItems: 'center',
  },
  thresholdButtonActive: {
    backgroundColor: '#9945FF22',
    borderColor: '#9945FF',
  },
  thresholdText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  thresholdTextActive: {
    color: '#9945FF',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
