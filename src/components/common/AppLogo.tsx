import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function AppLogo({ size = 'md', showTagline = false }: AppLogoProps) {
  const { screen } = useTheme();
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: screen.accentMuted }]}>
        <Text style={[styles.icon, isSmall && styles.iconSm, isLarge && styles.iconLg]}>◉</Text>
      </View>
      <View style={styles.textWrap}>
        <Text
          style={[
            styles.name,
            { color: screen.text },
            isSmall && styles.nameSm,
            isLarge && styles.nameLg,
          ]}
        >
          Meteor Lens
        </Text>
        {showTagline && (
          <Text style={[styles.tagline, { color: screen.textMuted }]}>
            Meteora DLMM · Read-only
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
    color: '#a855f7',
  },
  iconSm: { fontSize: 16 },
  iconLg: { fontSize: 28 },
  textWrap: { flex: 1 },
  name: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  nameSm: { fontSize: 16 },
  nameLg: { fontSize: 26 },
  tagline: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
});
