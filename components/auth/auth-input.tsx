import React from 'react';
import { TextInput, TextInputProps, View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, style, ...props }: AuthInputProps) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: Colors[colorScheme].inputBackground,
            color: Colors[colorScheme].text,
            borderColor: error ? Colors[colorScheme].error : Colors[colorScheme].border,
          },
          style,
        ]}
        placeholderTextColor={Colors[colorScheme].tabIconDefault}
        {...props}
      />
      {error && (
        <ThemedText style={[styles.errorText, { color: Colors[colorScheme].error }]}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'System',
  },
  errorText: {
    marginTop: 4,
    fontSize: 14,
  },
});