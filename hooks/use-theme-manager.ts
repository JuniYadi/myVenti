import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import { DatabaseManager } from '@/services/DatabaseManager';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

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
      // Ensure database is initialized
      await DatabaseManager.getInstance().initDatabase();

      const db = DatabaseManager.getInstance();
      const result = await db.executeSql('SELECT value FROM app_settings WHERE key = ?', ['theme_mode']);

      if (result.rows && result.rows.length > 0) {
        const savedTheme = result.rows[0].value;
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeModeState(savedTheme as ThemeMode);
        }
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
      const db = DatabaseManager.getInstance();
      await db.executeSql(
        'UPDATE app_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
        [mode, 'theme_mode']
      );
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
  const systemColorScheme = useNativeColorScheme() ?? 'light';

  // Return system theme while loading to prevent layout shifts
  if (isLoading) {
    return systemColorScheme;
  }

  return colorScheme;
}