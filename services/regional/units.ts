import { DistanceUnit, FuelUnit, Region } from '@/types';

export interface ConversionResult {
  value: number;
  unit: string;
  originalValue: number;
  originalUnit: string;
}

export class UnitConversionService {
  // Distance conversions
  static milesToKilometers(miles: number): number {
    return miles * 1.60934;
  }

  static kilometersToMiles(kilometers: number): number {
    return kilometers * 0.621371;
  }

  // Fuel volume conversions
  static gallonsToLiters(gallons: number): number {
    return gallons * 3.78541;
  }

  static litersToGallons(liters: number): number {
    return liters * 0.264172;
  }

  // Distance unit conversion
  static convertDistance(
    value: number,
    fromUnit: DistanceUnit,
    toUnit: DistanceUnit
  ): ConversionResult {
    if (fromUnit === toUnit) {
      return {
        value,
        unit: toUnit,
        originalValue: value,
        originalUnit: fromUnit,
      };
    }

    let convertedValue: number;

    if (fromUnit === DistanceUnit.MILES && toUnit === DistanceUnit.KILOMETERS) {
      convertedValue = this.milesToKilometers(value);
    } else if (fromUnit === DistanceUnit.KILOMETERS && toUnit === DistanceUnit.MILES) {
      convertedValue = this.kilometersToMiles(value);
    } else {
      convertedValue = value; // Should not happen, but fallback
    }

    return {
      value: convertedValue,
      unit: toUnit,
      originalValue: value,
      originalUnit: fromUnit,
    };
  }

  // Fuel unit conversion
  static convertFuelVolume(
    value: number,
    fromUnit: FuelUnit,
    toUnit: FuelUnit
  ): ConversionResult {
    if (fromUnit === toUnit) {
      return {
        value,
        unit: toUnit,
        originalValue: value,
        originalUnit: fromUnit,
      };
    }

    let convertedValue: number;

    if (fromUnit === FuelUnit.GALLONS && toUnit === FuelUnit.LITERS) {
      convertedValue = this.gallonsToLiters(value);
    } else if (fromUnit === FuelUnit.LITERS && toUnit === FuelUnit.GALLONS) {
      convertedValue = this.litersToGallons(value);
    } else {
      convertedValue = value; // Should not happen, but fallback
    }

    return {
      value: convertedValue,
      unit: toUnit,
      originalValue: value,
      originalUnit: fromUnit,
    };
  }

  // Get regional units
  static getRegionalDistanceUnit(region: Region): DistanceUnit {
    switch (region) {
      case Region.INDONESIA:
        return DistanceUnit.KILOMETERS;
      case Region.UNITED_STATES:
      default:
        return DistanceUnit.MILES;
    }
  }

  static getRegionalFuelUnit(region: Region): FuelUnit {
    switch (region) {
      case Region.INDONESIA:
        return FuelUnit.LITERS;
      case Region.UNITED_STATES:
      default:
        return FuelUnit.GALLONS;
    }
  }

  // Format distance with appropriate unit
  static formatDistance(
    value: number,
    unit: DistanceUnit,
    precision: number = 1
  ): string {
    const unitDisplay = unit === DistanceUnit.MILES ? 'mi' : 'km';
    return `${value.toFixed(precision)} ${unitDisplay}`;
  }

  // Format fuel volume with appropriate unit
  static formatFuelVolume(
    value: number,
    unit: FuelUnit,
    precision: number = 2
  ): string {
    const unitDisplay = unit === FuelUnit.GALLONS ? 'gal' : 'L';
    return `${value.toFixed(precision)} ${unitDisplay}`;
  }

  // Calculate fuel efficiency
  static calculateMPG(
    miles: number,
    gallons: number
  ): number {
    if (gallons <= 0) return 0;
    return miles / gallons;
  }

  static calculateLPH(
    liters: number,
    kilometers: number
  ): number {
    if (kilometers <= 0) return 0;
    return (liters * 100) / kilometers; // Liters per 100km
  }

  // Convert fuel efficiency between different formats
  static convertFuelEfficiency(
    value: number,
    fromType: 'mpg' | 'lph',
    toType: 'mpg' | 'lph'
  ): number {
    if (fromType === toType) {
      return value;
    }

    if (fromType === 'mpg' && toType === 'lph') {
      // Convert MPG to L/100km
      const gallonsPerMile = 1 / value;
      const litersPerMile = gallonsPerMile * 3.78541;
      return litersPerMile * 100;
    }

    if (fromType === 'lph' && toType === 'mpg') {
      // Convert L/100km to MPG
      const litersPerMile = value / 100;
      const gallonsPerMile = litersPerMile / 3.78541;
      return 1 / gallonsPerMile;
    }

    return value;
  }

  // Validate input ranges
  static validateFuelAmount(amount: number): { isValid: boolean; error?: string } {
    const { VALIDATION_LIMITS } = require('@/constants/storage');

    if (amount < VALIDATION_LIMITS.FUEL_AMOUNT_MIN || amount > VALIDATION_LIMITS.FUEL_AMOUNT_MAX) {
      return {
        isValid: false,
        error: `Fuel amount must be between ${VALIDATION_LIMITS.FUEL_AMOUNT_MIN} and ${VALIDATION_LIMITS.FUEL_AMOUNT_MAX} units`,
      };
    }

    return { isValid: true };
  }
}

export default UnitConversionService;