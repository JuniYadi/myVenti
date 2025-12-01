import React from 'react';
import {
  Pressable,
  StyleSheet,
  Animated,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, Animation } from '@/constants/theme';

interface CircularHomeButtonProps {
  isActive: boolean;
  colors: any;
  onPress: () => void;
}

export function CircularHomeButton({ isActive, colors, onPress }: CircularHomeButtonProps) {
  const scaleValue = useSharedValue(1);
  const rotationValue = useSharedValue(0);
  const backgroundColorValue = useSharedValue(colors.tabInactive);

  const handlePressIn = () => {
    scaleValue.value = withSequence(
      withTiming(0.9, { duration: Animation.duration.buttonPress }),
      withSpring(1.1, { dampingRatio: 0.8 })
    );

    if (!isActive) {
      backgroundColorValue.value = withTiming(colors.tabActive, {
        duration: Animation.duration.buttonPress,
      });
    }
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, {
      duration: Animation.duration.buttonPress,
      dampingRatio: 0.5,
    });

    if (!isActive) {
      backgroundColorValue.value = withTiming(colors.tabInactive, {
        duration: Animation.duration.buttonPress,
      });
    }

    rotationValue.value = withSpring(rotationValue.value + 360, {
      duration: Animation.duration.quick,
      dampingRatio: 0.8,
    });
  };

  React.useEffect(() => {
    backgroundColorValue.value = withSpring(
      isActive ? colors.tabActive : colors.tabInactive,
      { duration: Animation.duration.normal }
    );
  }, [isActive, colors]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleValue.value },
        { rotate: `${rotationValue.value}deg` },
      ],
      backgroundColor: backgroundColorValue.value,
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleValue.value },
      ],
    };
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
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
      <Animated.View
        style={[
          styles.button,
          animatedStyle,
          {
            borderColor: colors.border,
            borderWidth: 2,
          },
        ]}
      >
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <IconSymbol
            name="house.fill"
            size={Spacing.navigation.iconSize + 4}
            color={isActive ? colors.background : colors.tabInactive}
          />
        </Animated.View>

        {/* Active indicator ring */}
        {isActive && (
          <Animated.View
            style={[
              styles.activeRing,
              {
                borderColor: colors.tabActive,
              },
            ]}
          />
        )}
      </Animated.View>
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