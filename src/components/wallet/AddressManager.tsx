import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { shortenAddress } from '../../utils/addressUtils';
import type { SavedAddress } from '../../types/wallet';

interface AddressManagerProps {
  addresses: SavedAddress[];
  activeAddress: string | null;
  onSelect: (address: string) => void;
  onRemove?: (address: string) => void;
}

export function AddressManager({ addresses, activeAddress, onSelect, onRemove }: AddressManagerProps) {
  if (addresses.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Saved addresses</Text>
      {addresses.map((a) => (
        <TouchableOpacity
          key={a.address}
          style={[styles.row, activeAddress === a.address && styles.rowActive]}
          onPress={() => onSelect(a.address)}
          activeOpacity={0.7}
        >
          <View style={styles.rowContent}>
            <Text style={styles.label} numberOfLines={1}>
              {a.label}
            </Text>
            <Text style={styles.address}>{shortenAddress(a.address)}</Text>
          </View>
          {onRemove && (
            <TouchableOpacity
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => onRemove(a.address)}
            >
              <Text style={styles.remove}>Remove</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  title: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#1a1a22',
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rowActive: {
    borderColor: '#9945FF',
  },
  rowContent: { flex: 1 },
  label: { color: '#fff', fontWeight: '600', marginBottom: 2 },
  address: { color: '#888', fontSize: 12 },
  remove: { color: '#a66', fontSize: 12 },
});
