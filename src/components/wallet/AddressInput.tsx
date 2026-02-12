import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { validateAddressInput } from './AddressValidator';

interface AddressInputProps {
  onSubmit: (address: string) => void;
  loading?: boolean;
  placeholder?: string;
}

export function AddressInput({
  onSubmit,
  loading = false,
  placeholder = 'Paste Solana wallet address...',
}: AddressInputProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const err = validateAddressInput(value);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onSubmit(value.trim());
  };

  return (
    <View style={styles.wrap}>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder={placeholder}
        placeholderTextColor="#666"
        value={value}
        onChangeText={(t) => {
          setValue(t);
          if (error) setError(null);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />
      {error ? (
        <View style={styles.errorWrap}>
          <Alert message={error} variant="error" />
        </View>
      ) : null}
      <Button
        title="Track positions"
        onPress={handleSubmit}
        loading={loading}
        disabled={!value.trim()}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  input: {
    backgroundColor: '#1a1a22',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2a2a35',
    marginBottom: 12,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  inputError: { borderColor: '#a44' },
  errorWrap: { marginBottom: 12 },
  button: { marginTop: 4 },
});
