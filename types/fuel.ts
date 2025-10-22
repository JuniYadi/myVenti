import { DistanceUnit, Currency } from './service';

export interface FuelRecord {
  id: string;                    // UUID
  vehicleId: string;             // Foreign key to Vehicle
  fillDate: Date;                // Date of fuel purchase
  odometerReading: number;       // Odometer at fill-up
  mileageUnit: DistanceUnit;     // miles | kilometers
  fuelAmount: number;            // Amount of fuel (validated: 0.01-1000)
  fuelUnit: FuelUnit;            // gallons | liters (preserved original)
  costPerUnit: number;           // Price per gallon/liter
  totalCost: number;             // Total cost of fill-up
  currency: Currency;            // USD | IDR (preserved original)
  fuelType: FuelType;            // Type of fuel
  fuelStation?: string;          // Gas station name
  location?: string;             // Location of gas station
  isFullTank: boolean;           // Whether tank was filled completely
  notes?: string;                // Additional notes
  mpg?: number;                  // Calculated miles per gallon
  lph?: number;                  // Calculated liters per 100km
  createdAt: Date;               // When record was created
  updatedAt: Date;               // Last update timestamp
}

export enum FuelUnit {
  GALLONS = 'gallons',
  LITERS = 'liters'
}

export enum FuelType {
  REGULAR = 'regular',
  PREMIUM = 'premium',
  DIESEL = 'diesel',
  E85 = 'e85',
  ELECTRIC = 'electric',
  OTHER = 'other'
}

export interface FuelFormData {
  vehicleId: string;
  fillDate: Date;
  odometerReading: number;
  mileageUnit: DistanceUnit;
  fuelAmount: number;
  fuelUnit: FuelUnit;
  costPerUnit: number;
  totalCost: number;
  currency: Currency;
  fuelType: FuelType;
  fuelStation?: string;
  location?: string;
  isFullTank: boolean;
  notes?: string;
}

export interface FuelValidationErrors {
  vehicleId?: string;
  fillDate?: string;
  odometerReading?: string;
  fuelAmount?: string;
  costPerUnit?: string;
  totalCost?: string;
  fuelType?: string;
}

export interface FuelEfficiency {
  mpg?: number;                  // Miles per gallon
  kmpl?: number;                 // Kilometers per liter
  lph?: number;                  // Liters per 100km
  averageMpg: number;            // Average MPG over time
  averageCostPerMile: number;    // Cost per mile driven
  averageCostPerGallon: number;  // Average cost per gallon
}

export interface FuelStatistics {
  totalFuelCost: number;         // Total spent on fuel
  totalFuelAmount: number;       // Total fuel purchased
  averageMpg: number;            // Average fuel efficiency
  averageCostPerGallon: number;  // Average cost per gallon
  averageCostPerMile: number;    // Cost per mile driven
  fuelRecords: FuelRecord[];     // All fuel records
  efficiency: FuelEfficiency;    // Calculated efficiency metrics
}