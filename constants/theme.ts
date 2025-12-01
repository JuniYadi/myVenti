/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Modern UI extensions for Vehicle Tracking App
    primary: '#007AFF',
    secondary: '#5856D6',
    accent: '#FF9500',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    surface: '#F2F2F7',
    surfaceSecondary: '#FFFFFF',
    border: '#C6C6C8',
    card: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.1)',
    navigation: '#F8F9FA',
    tabActive: '#007AFF',
    tabInactive: '#8E8E93',
    vehicleOnline: '#34C759',
    vehicleOffline: '#FF3B30',
    fuelLow: '#FF9500',
    serviceDue: '#FF9500',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Modern UI extensions for Vehicle Tracking App
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    accent: '#FF9F0A',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    surface: '#1C1C1E',
    surfaceSecondary: '#2C2C2E',
    border: '#38383A',
    card: '#2C2C2E',
    shadow: 'rgba(0, 0, 0, 0.3)',
    navigation: '#1C1C1E',
    tabActive: '#0A84FF',
    tabInactive: '#8E8E93',
    vehicleOnline: '#30D158',
    vehicleOffline: '#FF453A',
    fuelLow: '#FF9F0A',
    serviceDue: '#FF9F0A',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Modern UI Animation Constants
export const Animation = {
  // Durations in milliseconds
  duration: {
    quick: 200,
    normal: 300,
    slow: 500,
    tabSwitch: 250,
    buttonPress: 150,
    cardHover: 200,
    screenTransition: 350,
  },
  // Easing functions for React Native Reanimated
  easing: {
    easeIn: 'easeIn',
    easeOut: 'easeOut',
    easeInOut: 'easeInOut',
    bounce: 'easeBack', // Custom bounce effect
    spring: 'spring', // Spring animation
  },
};

// Modern UI Spacing & Sizing System
export const Spacing = {
  // Base spacing unit (4px)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  // Component-specific spacing
  padding: {
    small: 12,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  margin: {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  // Card and container spacing
  card: {
    padding: 16,
    margin: 8,
    borderRadius: 12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  // Compact card layouts for better space utilization
  cardCompact: {
    padding: 10,
    margin: 5,
    borderRadius: 8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    minHeight: 65, // Ultra-compact layout for better space utilization
  },
  quickActionCompact: {
    padding: 6,
    margin: 3,
    borderRadius: 6,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    minWidth: 72, // More compact quick action buttons
    minHeight: 52, // Further reduced height for quick actions
  },
  // Navigation spacing
  navigation: {
    height: 80,
    tabBarHeight: 95,
    buttonSize: 44, // Minimum touch target
    iconSize: 24,
    circularButton: 64, // Central home button - large focal point (~1.5x other icons)
    borderRadius: 20,
  },
};

// Modern UI Typography Scale
export const Typography = {
  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    heading: 28,
    title: 22,
    subtitle: 18,
    body: 16,
    caption: 14,
    small: 12,
  },
  // Font weights
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
};
