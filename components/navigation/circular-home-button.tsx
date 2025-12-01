import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';

interface CircularHomeButtonProps {
  isActive: boolean;
  colors: any;
  onPress: () => void;
}

export function CircularHomeButton({ isActive, colors, onPress }: CircularHomeButtonProps) {
  const getButtonStyle = () => [
    styles.button,
    {
      backgroundColor: isActive ? colors.tabActive : colors.card,
      borderColor: colors.border,
      borderWidth: 1,
    }
  ];

  const getIconStyle = () => [
    styles.iconContainer
  ];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          shadowColor: colors.shadow,
          borderColor: colors.border,
        },
        pressed && styles.pressed,
      ]}
      accessible={true}
      accessibilityLabel="Home"
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <View style={styles.buttonContent}>
        <View style={getButtonStyle()}>
          <View style={getIconStyle()}>
            <IconSymbol
              name="house.fill"
              size={28}
              color={isActive ? colors.background : colors.tabInactive}
            />
          </View>

          {/* Active indicator ring */}
          {isActive && (
            <View
              style={[
                styles.activeRing,
                {
                  borderColor: colors.tabActive,
                },
              ]}
            />
          )}
        </View>

        {/* Home Label */}
        <ThemedText
          style={[
            styles.homeLabel,
            {
              color: isActive ? colors.tabActive : colors.tabInactive,
              fontWeight: isActive ? '600' : '400',
            },
          ]}
          numberOfLines={1}
        >
          Home
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  button: {
    width: Spacing.navigation.circularButton,
    height: Spacing.navigation.circularButton,
    borderRadius: Spacing.navigation.circularButton / 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRing: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: (Spacing.navigation.circularButton + 2) / 2,
    borderWidth: 1,
    opacity: 0.8,
  },
  pressed: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
});