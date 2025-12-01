import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useFocusEffect } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Platform, AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/theme';

interface NavigationState {
  activeTab: string;
  isTransitioning: boolean;
  previousRoute: string | null;
}

interface NavigationOptions {
  haptic?: boolean;
  accessibility?: boolean;
  animation?: {
    duration?: number;
    easing?: string;
  };
}

interface NavigationRoute {
  name: string;
  path: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const NAVIGATION_ROUTES: NavigationRoute[] = [
  {
    name: 'home',
    path: '/',
    accessible: true,
    accessibilityLabel: 'Home dashboard',
    accessibilityHint: 'View vehicle dashboard and overview',
  },
  {
    name: 'vehicle',
    path: '/vehicle',
    accessible: true,
    accessibilityLabel: 'Vehicles',
    accessibilityHint: 'Manage and view your vehicles',
  },
  {
    name: 'fuel',
    path: '/fuel',
    accessible: true,
    accessibilityLabel: 'Fuel',
    accessibilityHint: 'Track fuel entries and expenses',
  },
  {
    name: 'service',
    path: '/service',
    accessible: true,
    accessibilityLabel: 'Service',
    accessibilityHint: 'View service records and maintenance',
  },
  {
    name: 'settings',
    path: '/settings',
    accessible: true,
    accessibilityLabel: 'Settings',
    accessibilityHint: 'Configure app preferences and settings',
  },
];

export function useCustomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme() ?? 'light';

  const [navigationState, setNavigationState] = useState<NavigationState>({
    activeTab: 'home',
    isTransitioning: false,
    previousRoute: null,
  });

  const colors = Colors[colorScheme];

  // Get current active tab based on pathname
  const getCurrentTab = useCallback((path: string): string => {
    const route = NAVIGATION_ROUTES.find(route => route.path === path);
    return route?.name || 'home';
  }, []);

  // Update active tab when pathname changes
  useEffect(() => {
    const currentTab = getCurrentTab(pathname);
    setNavigationState(prev => ({
      activeTab: currentTab,
      isTransitioning: false,
      previousRoute: prev.activeTab !== currentTab ? prev.activeTab : prev.previousRoute,
    }));
  }, [pathname, getCurrentTab]);

  // Navigation function with haptic feedback and accessibility
  const navigate = useCallback(
    async (
      tabName: string,
      options: NavigationOptions = {}
    ) => {
      const route = NAVIGATION_ROUTES.find(r => r.name === tabName);

      if (!route) {
        console.warn(`Route '${tabName}' not found`);
        return;
      }

      // Don't navigate if already on this route
      if (pathname === route.path) {
        return;
      }

      try {
        // Set transitioning state
        setNavigationState(prev => ({
          ...prev,
          isTransitioning: true,
        }));

        // Trigger haptic feedback
        if (options.haptic !== false && Platform.OS === 'ios') {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Announce navigation for screen readers
        if (options.accessibility !== false && route.accessibility) {
          const announcement = route.accessibilityLabel || `Navigating to ${route.name}`;
          AccessibilityInfo.announceForAccessibility(announcement);
        }

        // Perform navigation
        router.push(route.path as any);

      } catch (error) {
        console.error('Navigation error:', error);
        setNavigationState(prev => ({
          ...prev,
          isTransitioning: false,
        }));
      }
    },
    [pathname, router]
  );

  // Safe navigation with validation
  const safeNavigate = useCallback(
    async (tabName: string, options?: NavigationOptions) => {
      const route = NAVIGATION_ROUTES.find(r => r.name === tabName);

      if (!route) {
        console.warn(`Navigation attempted to unknown route: ${tabName}`);
        return false;
      }

      await navigate(tabName, options);
      return true;
    },
    [navigate]
  );

  // Go back to previous route
  const goBack = useCallback(() => {
    if (navigationState.previousRoute) {
      navigate(navigationState.previousRoute);
    } else {
      router.back();
    }
  }, [navigationState.previousRoute, navigate, router]);

  // Check if a tab is active
  const isTabActive = useCallback((tabName: string): boolean => {
    return navigationState.activeTab === tabName;
  }, [navigationState.activeTab]);

  // Get accessibility props for navigation items
  const getAccessibilityProps = useCallback((tabName: string) => {
    const route = NAVIGATION_ROUTES.find(r => r.name === tabName);
    const isActive = isTabActive(tabName);

    return {
      accessible: route?.accessible !== false,
      accessibilityLabel: route?.accessibilityLabel || `${tabName} tab`,
      accessibilityHint: route?.accessibilityHint,
      accessibilityRole: 'tab' as const,
      accessibilityState: { selected: isActive },
    };
  }, [isTabActive]);

  // Memoized navigation utilities
  const navigationUtils = useMemo(() => ({
    routes: NAVIGATION_ROUTES,
    colors,
    isTransitioning: navigationState.isTransitioning,
    activeTab: navigationState.activeTab,
    previousRoute: navigationState.previousRoute,
  }), [
    colors,
    navigationState.isTransitioning,
    navigationState.activeTab,
    navigationState.previousRoute,
  ]);

  // Animation helpers
  const animationHelpers = useMemo(() => ({
    getTabAnimationDelay: (index: number) => index * 50,
    getTransitionDuration: () => 300,
    getSpringConfig: () => ({
      damping: 0.8,
      stiffness: 100,
      mass: 1,
    }),
  }), []);

  // Focus effect for accessibility announcements
  useFocusEffect(
    useCallback(() => {
      const route = NAVIGATION_ROUTES.find(r => r.path === pathname);
      if (route?.accessibilityLabel) {
        // Small delay to ensure screen has finished transitioning
        const timer = setTimeout(() => {
          AccessibilityInfo.announceForAccessibility(
            `${route.accessibilityLabel} screen loaded`
          );
        }, 500);

        return () => clearTimeout(timer);
      }
    }, [pathname])
  );

  return {
    // State
    ...navigationState,

    // Navigation functions
    navigate,
    safeNavigate,
    goBack,

    // Utilities
    isTabActive,
    getAccessibilityProps,

    // Helpers
    navigationUtils,
    animationHelpers,

    // Constants
    NAVIGATION_ROUTES,
  };
}

// Export types for external use
export type {
  NavigationState,
  NavigationOptions,
  NavigationRoute,
};

// Export hook factory for custom configurations
export function createNavigationHook(defaultOptions: NavigationOptions) {
  return function useCustomNavigationWithOptions() {
    const navigation = useCustomNavigation();

    return {
      ...navigation,
      navigate: (tabName: string, options?: NavigationOptions) =>
        navigation.navigate(tabName, { ...defaultOptions, ...options }),
    };
  };
}