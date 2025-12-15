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

// Create a default context value for fallback
const defaultContextValue: RegionContextType = {
  currentRegion: DEFAULT_REGION,
  regionConfig: REGION_CONFIGS[DEFAULT_REGION],
  setRegion: async () => {},
  isLoading: false,
};

interface RegionProviderProps {
  children: ReactNode;
}

export function RegionProvider({ children }: RegionProviderProps) {
  const [currentRegion, setCurrentRegion] = useState<RegionCode>(DEFAULT_REGION);
  const [isLoading, setIsLoading] = useState(true);

  // Load region preference asynchronously
  useEffect(() => {
    let isMounted = true;

    const loadRegionPreference = async () => {
      // Initialize database without throwing errors
      const db = DatabaseManager.getInstance();

      // Don't wait for database initialization - it's non-blocking
      db.initDatabase().catch(() => {
        // Ignore errors, database will use fallback
      });

      // Try to load region from database
      try {
        const result = await db.executeSql('SELECT value FROM app_settings WHERE key = ?', ['region']);

        if (result.rows && result.rows.length > 0) {
          const savedRegion = result.rows[0].value;
          if (savedRegion && savedRegion in REGION_CONFIGS && isMounted) {
            setCurrentRegion(savedRegion as RegionCode);
          }
        }
      } catch (error) {
        // Any error reading from database is not critical
        console.warn('Error reading region from database (using default):', error);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    loadRegionPreference();

    return () => {
      isMounted = false;
    };
  }, []);

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
  // Provide fallback context value if provider is not available
  // This prevents crashes and allows the app to work even if RegionProvider fails
  return context || defaultContextValue;
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