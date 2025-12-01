import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme_mode';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);
  const systemColorScheme = useNativeColorScheme() ?? 'light';

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
      // Still update local state even if storage fails
      setThemeModeState(mode);
    }
  };

  // Determine actual color scheme based on user preference
  const colorScheme = themeMode === 'system' ? systemColorScheme : themeMode;

  const value: ThemeContextType = {
    themeMode,
    colorScheme,
    setThemeMode,
    isLoading,
  };

  return React.createElement(
    ThemeContext.Provider,
    { value },
    children
  );
}

export function useThemeManager(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeManager must be used within a ThemeProvider');
  }
  return context;
}

// Export a hook that mimics the original useColorScheme interface for backward compatibility
export function useColorScheme(): 'light' | 'dark' {
  const { colorScheme, isLoading } = useThemeManager();

  // Return system theme while loading to prevent layout shifts
  if (isLoading) {
    return useNativeColorScheme() ?? 'light';
  }

  return colorScheme;
}