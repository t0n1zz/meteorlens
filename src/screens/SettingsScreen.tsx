import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useSettingsStore, type ThemeMode } from '../store/settingsStore';
import { useTheme } from '../hooks/useTheme';

export function SettingsScreen() {
  const hasHeliusKey = Boolean(
    Constants.expoConfig?.extra?.EXPO_PUBLIC_HELIUS_API_KEY
  );
  const { theme, setTheme, ilAlertThresholdPercent, setIlAlertThreshold } = useSettingsStore();
  const appTheme = useTheme();
  const screen = appTheme.screen;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screen.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: screen.text }]}>Settings</Text>
        <Text style={[styles.sectionLabel, { color: screen.accent }]}>Setup</Text>
        <Text style={[styles.paragraph, { color: screen.textMuted }]}>
          Copy <Text style={[styles.mono, { color: screen.textMuted }]}>.env.example</Text> to <Text style={[styles.mono, { color: screen.textMuted }]}>.env</Text> and set{' '}
          <Text style={[styles.mono, { color: screen.textMuted }]}>EXPO_PUBLIC_HELIUS_API_KEY</Text> (get a key at helius.dev). Restart the dev server after changing .env.
        </Text>
        <Text style={[styles.paragraph, styles.rpcRow, { color: screen.textMuted }]}>
          RPC: {hasHeliusKey ? 'Helius (key set)' : 'Public (rate-limited — add key if loading fails)'}
        </Text>
        <Text style={[styles.sectionLabel, { color: screen.accent }]}>Appearance</Text>
        <View style={styles.thresholdRow}>
          {(['dark', 'light', 'system'] as ThemeMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.thresholdButton,
                { backgroundColor: screen.card, borderColor: screen.cardBorder },
                theme === mode && { backgroundColor: `${screen.accent}22`, borderColor: screen.accent },
              ]}
              onPress={() => setTheme(mode)}
            >
              <Text
                style={[
                  styles.thresholdText,
                  { color: screen.textMuted },
                  theme === mode && { color: screen.accent },
                ]}
              >
                {mode === 'dark' ? 'Dark' : mode === 'light' ? 'Light' : 'System'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.sectionLabel, { color: screen.accent }]}>Alerts</Text>
        <Text style={[styles.paragraph, { color: screen.textMuted }]}>
          Configure when to receive alerts for impermanent loss.
        </Text>
        <View style={styles.thresholdRow}>
          {[5, 10, 15, 20].map((threshold) => (
            <TouchableOpacity
              key={threshold}
              style={[
                styles.thresholdButton,
                { backgroundColor: screen.card, borderColor: screen.cardBorder },
                ilAlertThresholdPercent === threshold && { backgroundColor: `${screen.accent}22`, borderColor: screen.accent },
              ]}
              onPress={() => setIlAlertThreshold(threshold)}
            >
              <Text
                style={[
                  styles.thresholdText,
                  { color: screen.textMuted },
                  ilAlertThresholdPercent === threshold && { color: screen.accent },
                ]}
              >
                {threshold}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.hint, { color: screen.textMuted }]}>
          Alert when IL exceeds {ilAlertThresholdPercent}% (default: 5%)
        </Text>
        <Text style={[styles.sectionLabel, { color: screen.accent }]}>Privacy</Text>
        <Text style={[styles.paragraph, { color: screen.textMuted }]}>
          Read-only mode: addresses are stored only on this device. We never request private keys or send addresses to external servers.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  sectionLabel: { fontSize: 12, marginBottom: 8, marginTop: 16, textTransform: 'uppercase' },
  paragraph: { fontSize: 14, lineHeight: 22 },
  mono: { fontFamily: 'monospace' },
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
    borderWidth: 1,
    alignItems: 'center',
  },
  thresholdText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
});
