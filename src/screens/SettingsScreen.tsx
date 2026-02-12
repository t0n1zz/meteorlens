import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.paragraph}>
          Read-only mode: addresses are stored only on this device. We never request private keys or send addresses to external servers.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f14' },
  scroll: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 16 },
  paragraph: { color: '#888', fontSize: 14, lineHeight: 22 },
});
