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
      backgroundColor: isActive ? colors.tabActive : colors.tabInactive,
      borderColor: colors.border,
      borderWidth: 2,
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
      <View style={getButtonStyle()}>
        <View style={getIconStyle()}>
          <IconSymbol
            name="house.fill"
            size={Spacing.navigation.iconSize + 4}
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Spacing.navigation.circularButton,
    height: Spacing.navigation.circularButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.navigation.circularButton / 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  button: {
    width: Spacing.navigation.circularButton - 8,
    height: Spacing.navigation.circularButton - 8,
    borderRadius: (Spacing.navigation.circularButton - 8) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: (Spacing.navigation.circularButton - 4) / 2,
    borderWidth: 2,
    opacity: 0.6,
  },
  pressed: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});