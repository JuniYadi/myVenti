/**
 * Region management hook for myVenti app
 * Handles currency, units, and formatting based on user's region preference
 */

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RegionCode, RegionConfig, DEFAULT_REGION, REGION_CONFIGS } from '@/types/region';

const REGION_STORAGE_KEY = 'myVenti_region';

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

  useEffect(() => {
    loadRegionPreference();
  }, []);

  const loadRegionPreference = async () => {
    try {
      const savedRegion = await AsyncStorage.getItem(REGION_STORAGE_KEY);
      if (savedRegion && savedRegion in REGION_CONFIGS) {
        setCurrentRegion(savedRegion as RegionCode);
      } else {
        // Set default region to storage if none exists
        await AsyncStorage.setItem(REGION_STORAGE_KEY, DEFAULT_REGION);
      }
    } catch (error) {
      console.error('Error loading region preference:', error);
      // Fallback to default region
      await AsyncStorage.setItem(REGION_STORAGE_KEY, DEFAULT_REGION);
    } finally {
      setIsLoading(false);
    }
  };

  const setRegion = async (region: RegionCode) => {
    try {
      await AsyncStorage.setItem(REGION_STORAGE_KEY, region);
      setCurrentRegion(region);
    } catch (error) {
      console.error('Error saving region preference:', error);
      throw error;
    }
  };

  const value: RegionContextType = {
    currentRegion,
    regionConfig: REGION_CONFIGS[currentRegion],
    setRegion,
    isLoading,
  };

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