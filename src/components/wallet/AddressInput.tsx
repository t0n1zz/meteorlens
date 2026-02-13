import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { useTheme } from '../../hooks/useTheme';
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
  const { screen } = useTheme();
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
        style={[
          styles.input,
          {
            backgroundColor: screen.card,
            borderColor: error ? screen.negative : screen.cardBorder,
            color: screen.text,
          },
          Platform.OS === 'web' ? { outlineStyle: 'none' as const } : {},
        ]}
        placeholder={placeholder}
        placeholderTextColor={screen.textMuted}
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
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 12,
  },
  errorWrap: { marginBottom: 12 },
  button: { marginTop: 4 },
});
