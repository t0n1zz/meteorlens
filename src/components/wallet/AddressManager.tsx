import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { shortenAddress } from '../../utils/addressUtils';
import { useTheme } from '../../hooks/useTheme';
import type { SavedAddress } from '../../types/wallet';

interface AddressManagerProps {
  addresses: SavedAddress[];
  activeAddress: string | null;
  onSelect: (address: string) => void;
  onRemove?: (address: string) => void;
}

export function AddressManager({ addresses, activeAddress, onSelect, onRemove }: AddressManagerProps) {
  const { screen } = useTheme();
  if (addresses.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: screen.textMuted }]}>Saved addresses</Text>
      {addresses.map((a) => (
        <TouchableOpacity
          key={a.address}
          style={[
            styles.row,
            { backgroundColor: screen.card, borderColor: activeAddress === a.address ? screen.accent : screen.cardBorder },
          ]}
          onPress={() => onSelect(a.address)}
          activeOpacity={0.7}
        >
          <View style={styles.rowContent}>
            <Text style={[styles.label, { color: screen.text }]} numberOfLines={1}>
              {a.label}
            </Text>
            <Text style={[styles.address, { color: screen.textMuted }]}>{shortenAddress(a.address)}</Text>
          </View>
          {onRemove && (
            <TouchableOpacity
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => onRemove(a.address)}
            >
              <Text style={[styles.remove, { color: screen.negative }]}>Remove</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 24 },
  title: {
    fontSize: 12,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  rowContent: { flex: 1 },
  label: { fontWeight: '600', marginBottom: 2 },
  address: { fontSize: 13 },
  remove: { fontSize: 12 },
});
