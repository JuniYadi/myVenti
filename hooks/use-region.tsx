/**
 * Region management hook for myVenti app
 * Handles currency, units, and formatting based on user's region preference
 */

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { DatabaseManager } from '@/services/DatabaseManager';
import { RegionCode, RegionConfig, DEFAULT_REGION, REGION_CONFIGS } from '@/types/region';

interface RegionContextType {
  currentRegion: RegionCode;
  regionConfig: RegionConfig;
  setRegion: (region: RegionCode) => Promise<void>;
  isLoading: boolean;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

interface RegionProviderProps {
  children: ReactNode;
}

export function RegionProvider({ children }: RegionProviderProps) {
  const [currentRegion, setCurrentRegion] = useState<RegionCode>(DEFAULT_REGION);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initRegion = async () => {
      try {
        await loadRegionPreference();
      } catch (error) {
        console.error('Failed to load region preference:', error);
        if (isMounted) {
          setHasError(true);
          // Always use default region on error
          setCurrentRegion(DEFAULT_REGION);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initRegion();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadRegionPreference = async () => {
    // Initialize database without throwing errors
    const db = DatabaseManager.getInstance();

    // Try to initialize but don't let errors propagate
    try {
      await db.initDatabase();
    } catch (error) {
      // DatabaseManager now handles errors internally
      console.warn('Database initialization issue (using fallback):', error);
    }

    // Try to load region from database
    try {
      const result = await db.executeSql('SELECT value FROM app_settings WHERE key = ?', ['region']);

      if (result.rows && result.rows.length > 0) {
        const savedRegion = result.rows[0].value;
        if (savedRegion && savedRegion in REGION_CONFIGS) {
          setCurrentRegion(savedRegion as RegionCode);
          return;
        } else {
          // Update with default region if invalid
          await db.executeSql(
            'UPDATE app_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
            [DEFAULT_REGION, 'region']
          );
        }
      }
    } catch (error) {
      // Any error reading from database is not critical
      console.warn('Error reading region from database (using default):', error);
    }

    // Always use default region as fallback
    setCurrentRegion(DEFAULT_REGION);
  };

  const setRegion = async (region: RegionCode) => {
    try {
      const db = DatabaseManager.getInstance();
      await db.executeSql(
        'UPDATE app_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
        [region, 'region']
      );
      setCurrentRegion(region);
    } catch (error) {
      console.error('Error saving region preference:', error);
      // Don't throw error, just log it
      console.warn('Failed to save region preference, but continuing with region change');
      // Still update the local state even if database fails
      setCurrentRegion(region);
    }
  };

  const value: RegionContextType = {
    currentRegion,
    regionConfig: REGION_CONFIGS[currentRegion],
    setRegion,
    isLoading,
  };

  // Always render the provider, even if there's an error
  // The context will have default values if database fails
  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion(): RegionContextType {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}

// Utility functions for formatting
export function formatCurrency(amount: number, regionConfig: RegionConfig): string {
  try {
    return new Intl.NumberFormat(regionConfig.currency.locale, {
      style: 'currency',
      currency: regionConfig.currency.code,
      minimumFractionDigits: regionConfig.currency.code === 'USD' ? 2 : 0,
      maximumFractionDigits: regionConfig.currency.code === 'USD' ? 2 : 0,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `${regionConfig.currency.symbol}${amount.toLocaleString()}`;
  }
}

export function formatNumber(amount: number, regionConfig: RegionConfig): string {
  try {
    return new Intl.NumberFormat(regionConfig.currency.locale).format(amount);
  } catch (error) {
    // Fallback formatting
    return amount.toLocaleString();
  }
}

export function formatDecimal(amount: number, decimals: number = 2, regionConfig: RegionConfig): string {
  try {
    return new Intl.NumberFormat(regionConfig.currency.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return amount.toFixed(decimals);
  }
}

export function convertVolume(amount: number, from: 'gallons', to: 'liters' | 'gallons'): number {
  if (from === 'gallons' && to === 'liters') {
    return amount * 3.78541;
  }
  if (from === 'gallons' && to === 'gallons') {
    return amount;
  }
  return amount; // fallback
}

export function convertDistance(amount: number, from: 'miles', to: 'kilometers' | 'miles'): number {
  if (from === 'miles' && to === 'kilometers') {
    return amount * 1.60934;
  }
  if (from === 'miles' && to === 'miles') {
    return amount;
  }
  return amount; // fallback
}