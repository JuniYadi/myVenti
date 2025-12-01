import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Typography } from '@/constants/theme';

interface TabButtonProps {
  name: string;
  label: string;
  icon: string;
  route: string;
  isActive: boolean;
  colors: any;
  onPress: () => void;
}

export function TabButton({
  name,
  label,
  icon,
  route,
  isActive,
  colors,
  onPress,
}: TabButtonProps) {
  const getButtonStyle = () => [
    styles.container,
    {
      opacity: isActive ? 1 : 0.6,
    }
  ];

  const getIconStyle = () => [
    styles.iconContainer,
    {
      transform: [{ scale: isActive ? 1.1 : 1 }]
    }
  ];

  const getIndicatorStyle = () => [
    styles.activeIndicator,
    {
      opacity: isActive ? 1 : 0,
      backgroundColor: colors.tabActive,
    }
  ];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        getButtonStyle(),
        pressed && styles.pressed,
      ]}
      accessible={true}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <View style={styles.buttonContent}>
        {/* Active indicator dot */}
        <View style={getIndicatorStyle()} />

        <View style={getIconStyle()}>
          <IconSymbol
            name={icon as any}
            size={Spacing.navigation.iconSize}
            color={isActive ? colors.tabActive : colors.tabInactive}
          />
        </View>

        {/* Optional label for larger screens */}
        <View style={getButtonStyle()}>
          <ThemedText
            style={[
              styles.label,
              {
                color: isActive ? colors.tabActive : colors.tabInactive,
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Spacing.navigation.buttonSize,
    paddingVertical: Spacing.xs,
    position: 'relative',
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xs,
    borderRadius: 8,
  },
  activeIndicator: {
    position: 'absolute',
    top: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: Typography.sizes.small,
    fontWeight: '500' as const,
    textAlign: 'center',
    marginTop: 2,
  },
  pressed: {
    opacity: 0.8,
  },
});