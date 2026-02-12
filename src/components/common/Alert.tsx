import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AlertProps {
  message: string;
  variant?: 'error' | 'warning' | 'info';
}

export function Alert({ message, variant = 'error' }: AlertProps) {
  const isError = variant === 'error';
  const isWarning = variant === 'warning';
  return (
    <View style={[styles.box, isError && styles.error, isWarning && styles.warning]}>
      <Text style={[styles.text, isError && styles.errorText, isWarning && styles.warningText]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#2a1515',
  },
  error: {
    backgroundColor: '#2a1515',
  },
  warning: {
    backgroundColor: '#2a2515',
  },
  text: {
    fontSize: 14,
    color: '#f66',
  },
  errorText: {
    color: '#f66',
  },
  warningText: {
    color: '#db9',
  },
});
