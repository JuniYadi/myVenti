/**
 * Region and localization configuration for myVenti app
 * Supports USD (US) and IDR (Indonesia) with default to IDR
 */

export type CurrencyCode = 'USD' | 'IDR';
export type VolumeUnit = 'gallons' | 'liters';
export type DistanceUnit = 'miles' | 'kilometers';
export type EfficiencyUnit = 'mpg' | 'kmpl' | 'l/100km';
export type RegionCode = 'US' | 'ID';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  name: string;
}

export interface VolumeConfig {
  unit: VolumeUnit;
  label: string;
  abbreviation: string;
  conversionRate: number; // conversion from gallons
}

export interface DistanceConfig {
  unit: DistanceUnit;
  label: string;
  abbreviation: string;
  conversionRate: number; // conversion from miles
}

export interface EfficiencyConfig {
  unit: EfficiencyUnit;
  label: string;
  formula: string;
}

export interface RegionConfig {
  code: RegionCode;
  name: string;
  flag: string;
  currency: CurrencyConfig;
  volume: VolumeConfig;
  distance: DistanceConfig;
  efficiency: EfficiencyConfig;
}

export const REGION_CONFIGS: Record<RegionCode, RegionConfig> = {
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: {
      code: 'USD',
      symbol: '$',
      locale: 'en-US',
      name: 'US Dollar',
    },
    volume: {
      unit: 'gallons',
      label: 'gallons',
      abbreviation: 'gal',
      conversionRate: 1, // 1 gallon = 1 gallon
    },
    distance: {
      unit: 'miles',
      label: 'miles',
      abbreviation: 'mi',
      conversionRate: 1, // 1 mile = 1 mile
    },
    efficiency: {
      unit: 'mpg',
      label: 'MPG',
      formula: 'miles per gallon',
    },
  },
  ID: {
    code: 'ID',
    name: 'Indonesia',
    flag: '🇮🇩',
    currency: {
      code: 'IDR',
      symbol: 'Rp',
      locale: 'id-ID',
      name: 'Indonesian Rupiah',
    },
    volume: {
      unit: 'liters',
      label: 'liters',
      abbreviation: 'L',
      conversionRate: 3.78541, // 1 gallon = 3.78541 liters
    },
    distance: {
      unit: 'kilometers',
      label: 'kilometers',
      abbreviation: 'km',
      conversionRate: 1.60934, // 1 mile = 1.60934 kilometers
    },
    efficiency: {
      unit: 'kmpl',
      label: 'km/L',
      formula: 'kilometers per liter',
    },
  },
};

// Default region is Indonesia (IDR)
export const DEFAULT_REGION: RegionCode = 'ID';

export const ALL_REGIONS: RegionCode[] = ['US', 'ID'];