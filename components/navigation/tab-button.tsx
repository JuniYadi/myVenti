import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Spacing, Animation, Typography } from '@/constants/theme';

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
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(isActive ? 1 : 0.6);
  const translateYValue = useSharedValue(0);

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.95, {
      duration: Animation.duration.buttonPress,
      dampingRatio: 0.8,
    });

    translateYValue.value = withSpring(-2, {
      duration: Animation.duration.buttonPress,
    });
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, {
      duration: Animation.duration.buttonPress,
      dampingRatio: 0.5,
    });

    translateYValue.value = withSpring(0, {
      duration: Animation.duration.buttonPress,
    });
  };

  React.useEffect(() => {
    opacityValue.value = withSpring(isActive ? 1 : 0.6, {
      duration: Animation.duration.normal,
    });
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleValue.value },
        { translateY: translateYValue.value },
      ],
      opacity: opacityValue.value,
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: isActive ? scaleValue.value * 1.1 : scaleValue.value },
      ],
    };
  });

  const activeIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: isActive ? 1 : 0,
      backgroundColor: colors.tabActive,
    };
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      accessible={true}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <View style={styles.buttonContent}>
        {/* Active indicator dot */}
        <Animated.View
          style={[
            styles.activeIndicator,
            activeIndicatorStyle,
          ]}
        />

        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <IconSymbol
            name={icon as any}
            size={Spacing.navigation.iconSize}
            color={isActive ? colors.tabActive : colors.tabInactive}
          />
        </Animated.View>

        {/* Optional label for larger screens */}
        <Animated.View style={animatedStyle}>
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
        </Animated.View>
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