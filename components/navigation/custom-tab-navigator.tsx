import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, usePathname } from 'expo-router';
import { Colors, Spacing } from '@/constants/theme';
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
  const colors = Colors[colorScheme];

  const handleTabPress = (tabName: string, route: string, index: number) => {
    // Trigger haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Update active tab
    setActiveTab(tabName);

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

  
  return (
    <View style={[styles.container]}>
      <View style={[styles.navigationContainer, { backgroundColor: colors.navigation }]}>
        {/* Left Side Tabs */}
        <View style={styles.leftTabs}>
          {TABS.slice(0, 2).map((tab, index) => (
            <View key={tab.name} style={styles.tabWrapper}>
              <TabButton
                name={tab.name}
                label={tab.label}
                icon={tab.icon}
                route={tab.route}
                isActive={activeTab === tab.name}
                colors={colors}
                onPress={() => handleTabPress(tab.name, tab.route, index)}
              />
              {/* Individual Tab Indicator */}
              {activeTab === tab.name && (
                <View style={[styles.tabIndicator, { backgroundColor: colors.tabActive }]} />
              )}
            </View>
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
            <View key={tab.name} style={styles.tabWrapper}>
              <TabButton
                name={tab.name}
                label={tab.label}
                icon={tab.icon}
                route={tab.route}
                isActive={activeTab === tab.name}
                colors={colors}
                onPress={() => handleTabPress(tab.name, tab.route, index + 2)}
              />
              {/* Individual Tab Indicator */}
              {activeTab === tab.name && (
                <View style={[styles.tabIndicator, { backgroundColor: colors.tabActive }]} />
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
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
  tabWrapper: {
    position: 'relative',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
  },
  tabIndicator: {
    position: 'absolute',
    top: -2,
    height: 4,
    width: 40,
    borderRadius: 2,
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
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  rightTabs: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  centerButton: {
    width: CIRCULAR_BUTTON_SIZE,
    height: CIRCULAR_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.sm,
  },
  });