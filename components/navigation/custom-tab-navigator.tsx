import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter, usePathname } from 'expo-router';
import { Colors, Spacing, Animation } from '@/constants/theme';
import { CircularHomeButton } from './circular-home-button';
import { TabButton } from './tab-button';

interface TabItem {
  name: string;
  label: string;
  icon: string;
  route: string;
}

const { width: screenWidth } = Dimensions.get('window');
const TAB_WIDTH = 70;
const CIRCULAR_BUTTON_SIZE = Spacing.navigation.circularButton;

const TABS: TabItem[] = [
  { name: 'vehicle', label: 'Vehicles', icon: 'car.fill', route: '/vehicle' },
  { name: 'fuel', label: 'Fuel', icon: 'fuelpump.fill', route: '/fuel' },
  { name: 'service', label: 'Service', icon: 'wrench.fill', route: '/service' },
  { name: 'settings', label: 'Settings', icon: 'gearshape.fill', route: '/settings' },
];

export function CustomTabNavigator() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<string>(() => {
  if (pathname === '/') return 'home';
  if (pathname === '/vehicle') return 'vehicle';
  if (pathname === '/fuel') return 'fuel';
  if (pathname === '/service') return 'service';
  if (pathname === '/settings') return 'settings';
  return 'home';
});
  const animatedIndicator = useSharedValue(0);

  const colors = Colors[colorScheme];

  // Initialize animated indicator based on current active tab
  React.useEffect(() => {
    const activeIndex = TABS.findIndex(tab => tab.name === activeTab);
    if (activeIndex !== -1) {
      animatedIndicator.value = activeIndex;
    }
  }, []);

  const handleTabPress = (tabName: string, route: string, index: number) => {
    // Trigger haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Update active tab
    setActiveTab(tabName);

    // Animate indicator
    animatedIndicator.value = withSpring(index, {
      duration: Animation.duration.tabSwitch,
      dampingRatio: 0.8,
    });

    // Navigate to route
    if (pathname !== route) {
      router.push(route as any);
    }
  };

  const handleHomePress = () => {
    // Trigger haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setActiveTab('home');

    // Navigate to home
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: animatedIndicator.value * TAB_WIDTH,
        },
      ],
    };
  });

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: 0,
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={[styles.navigationContainer, { backgroundColor: colors.navigation }]}>
        {/* Active Tab Indicator */}
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              backgroundColor: colors.tabActive,
              width: TAB_WIDTH - 20,
            },
            indicatorStyle,
          ]}
        />

        {/* Left Side Tabs */}
        <View style={styles.leftTabs}>
          {TABS.slice(0, 2).map((tab, index) => (
            <TabButton
              key={tab.name}
              name={tab.name}
              label={tab.label}
              icon={tab.icon}
              route={tab.route}
              isActive={activeTab === tab.name}
              colors={colors}
              onPress={() => handleTabPress(tab.name, tab.route, index)}
            />
          ))}
        </View>

        {/* Circular Home Button */}
        <View style={styles.centerButton}>
          <CircularHomeButton
            isActive={activeTab === 'home'}
            colors={colors}
            onPress={handleHomePress}
          />
        </View>

        {/* Right Side Tabs */}
        <View style={styles.rightTabs}>
          {TABS.slice(2).map((tab, index) => (
            <TabButton
              key={tab.name}
              name={tab.name}
              label={tab.label}
              icon={tab.icon}
              route={tab.route}
              isActive={activeTab === tab.name}
              colors={colors}
              onPress={() => handleTabPress(tab.name, tab.route, index + 2)}
            />
          ))}
        </View>
      </View>

      {/* Shadow/Border */}
      <View
        style={[
         styles.shadowLine,
          {
            backgroundColor: colors.border,
            shadowColor: colors.shadow,
          }
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  navigationContainer: {
    height: Spacing.navigation.tabBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    borderTopLeftRadius: Spacing.navigation.borderRadius,
    borderTopRightRadius: Spacing.navigation.borderRadius,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 10,
    height: 4,
    borderRadius: 2,
    zIndex: 1,
  },
  leftTabs: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rightTabs: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  centerButton: {
    width: CIRCULAR_BUTTON_SIZE,
    height: CIRCULAR_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.md,
  },
  shadowLine: {
    height: 1,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});