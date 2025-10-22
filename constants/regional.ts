// Regional settings configuration for MyVenti application
// Supports United States and Indonesia markets with proper unit conversions

export type Region = 'US' | 'ID';
export type Currency = 'USD' | 'IDR';
export type FuelUnit = 'gallons' | 'liters';
export type DistanceUnit = 'miles' | 'kilometers';
export type TimeFormat = '12h' | '24h';

export interface RegionalSettings {
  region: Region;
  currency: Currency;
  fuelUnit: FuelUnit;
  distanceUnit: DistanceUnit;
  dateFormat: string;
  timeFormat: TimeFormat;
  numberFormat: Intl.NumberFormatOptions;
  timezone: string;
}

// Pre-configured regional settings
export const REGIONAL_PRESETS: Record<Region, RegionalSettings> = {
  US: {
    region: 'US',
    currency: 'USD',
    fuelUnit: 'gallons',
    distanceUnit: 'miles',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    numberFormat: {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    timezone: 'America/New_York',
  },
  ID: {
    region: 'ID',
    currency: 'IDR',
    fuelUnit: 'liters',
    distanceUnit: 'kilometers',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    numberFormat: {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
    timezone: 'Asia/Jakarta',
  },
} as const;

// Default regional setting (United States)
export const DEFAULT_REGIONAL_SETTINGS: RegionalSettings = REGIONAL_PRESETS.US;

// Unit conversion constants
export const UNIT_CONVERSIONS = {
  // Volume conversions (1 gallon = 3.78541 liters)
  GALLON_TO_LITER: 3.78541,
  LITER_TO_GALLON: 0.264172,

  // Distance conversions (1 mile = 1.60934 kilometers)
  MILE_TO_KILOMETER: 1.60934,
  KILOMETER_TO_MILE: 0.621371,
} as const;

// Currency symbols for display
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  IDR: 'Rp',
} as const;

// Unit symbols for display
export const UNIT_SYMBOLS = {
  gallons: 'gal',
  liters: 'L',
  miles: 'mi',
  kilometers: 'km',
} as const;