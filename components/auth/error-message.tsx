import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../themed-text';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors } from '../../constants/theme';

interface ErrorMessageProps {
  message: string | null;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  const colorScheme = useColorScheme() ?? 'light';

  if (!message) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].error + '20' }]}>
      <ThemedText style={[styles.text, { color: Colors[colorScheme].error }]}>
        {message}
      </ThemedText>
      {onDismiss && (
        <ThemedText style={[styles.dismiss, { color: Colors[colorScheme].error }]} onPress={onDismiss}>
          Dismiss
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  dismiss: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});