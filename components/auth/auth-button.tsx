import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '../themed-text';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors } from '../../constants/theme';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'google';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function AuthButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon
}: AuthButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';

  const getButtonStyle = () => {
    switch (variant) {
      case 'google':
        return [
          styles.button,
          styles.googleButton,
          {
            backgroundColor: '#ffffff',
            borderColor: Colors[colorScheme].border,
            opacity: disabled || loading ? 0.6 : 1,
          },
        ];
      case 'secondary':
        return [
          styles.button,
          styles.secondaryButton,
          {
            backgroundColor: 'transparent',
            borderColor: Colors[colorScheme].tint,
            opacity: disabled || loading ? 0.6 : 1,
          },
        ];
      default:
        return [
          styles.button,
          {
            backgroundColor: Colors[colorScheme].tint,
            opacity: disabled || loading ? 0.6 : 1,
          },
        ];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'google':
        return [
          styles.text,
          styles.googleText,
          { color: Colors[colorScheme].text },
        ];
      case 'secondary':
        return [
          styles.text,
          { color: Colors[colorScheme].tint },
        ];
      default:
        return [
          styles.text,
          { color: '#ffffff' },
        ];
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#ffffff' : Colors[colorScheme].tint}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <ThemedText style={getTextStyle()}>{title}</ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  googleButton: {
    borderWidth: 1,
  },
  secondaryButton: {
    borderWidth: 2,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  googleText: {
    fontWeight: '500',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
});