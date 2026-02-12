import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

const WEB_MAX_WIDTH = 720;

/**
 * Wraps content for web: centered, max-width for readable desktop layout.
 * On native (iOS/Android) this is a simple passthrough so mobile/Solana Seeker is unchanged.
 */
export function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.outer}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#0f0f14',
    ...(Platform.OS === 'web' && {
      alignItems: 'center',
      width: '100%',
    }),
  },
  inner: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web' && {
      maxWidth: WEB_MAX_WIDTH,
    }),
  },
});
