import { FuelFormData, FuelValidationErrors } from '@/types/fuel';
import { VALIDATION_LIMITS } from '@/constants/storage';

export class FuelValidationService {
  static validate(fuel: FuelFormData): FuelValidationErrors {
    const errors: FuelValidationErrors = {};

    // Vehicle ID validation
    if (!fuel.vehicleId || fuel.vehicleId.trim().length === 0) {
      errors.vehicleId = 'Vehicle selection is required';
    }

    // Fill date validation
    if (!fuel.fillDate) {
      errors.fillDate = 'Fill date is required';
    } else if (fuel.fillDate > new Date()) {
      errors.fillDate = 'Fill date cannot be in the future';
    }

    // Odometer reading validation
    if (fuel.odometerReading === undefined || fuel.odometerReading === null) {
      errors.odometerReading = 'Odometer reading is required';
    } else if (fuel.odometerReading < 0) {
      errors.odometerReading = 'Odometer reading cannot be negative';
    }

    // Fuel amount validation
    if (fuel.fuelAmount === undefined || fuel.fuelAmount === null) {
      errors.fuelAmount = 'Fuel amount is required';
    } else if (fuel.fuelAmount < VALIDATION_LIMITS.FUEL_AMOUNT_MIN || fuel.fuelAmount > VALIDATION_LIMITS.FUEL_AMOUNT_MAX) {
      errors.fuelAmount = `Fuel amount must be between ${VALIDATION_LIMITS.FUEL_AMOUNT_MIN} and ${VALIDATION_LIMITS.FUEL_AMOUNT_MAX} units`;
    }

    // Cost per unit validation
    if (fuel.costPerUnit === undefined || fuel.costPerUnit === null) {
      errors.costPerUnit = 'Cost per unit is required';
    } else if (fuel.costPerUnit < 0) {
      errors.costPerUnit = 'Cost per unit cannot be negative';
    }

    // Total cost validation
    if (fuel.totalCost === undefined || fuel.totalCost === null) {
      errors.totalCost = 'Total cost is required';
    } else if (fuel.totalCost <= 0) {
      errors.totalCost = 'Total cost must be greater than 0';
    }

    // Fuel type validation
    if (!fuel.fuelType) {
      errors.fuelType = 'Fuel type is required';
    }

    // Cost consistency validation
    if (fuel.fuelAmount && fuel.costPerUnit && fuel.totalCost) {
      const calculatedCost = fuel.fuelAmount * fuel.costPerUnit;
      const tolerance = 0.01; // Small tolerance for floating point math
      if (Math.abs(calculatedCost - fuel.totalCost) > tolerance) {
        errors.totalCost = 'Total cost does not match fuel amount × cost per unit';
      }
    }

    return errors;
  }

  static isValid(fuel: FuelFormData): boolean {
    const errors = this.validate(fuel);
    return Object.keys(errors).length === 0;
  }

  static getErrorSummary(errors: FuelValidationErrors): string[] {
    return Object.values(errors).filter(error => error !== undefined);
  }

  static calculateTotalCost(fuelAmount: number, costPerUnit: number): number {
    return Math.round((fuelAmount * costPerUnit) * 100) / 100; // Round to 2 decimal places
  }

  static calculateCostPerUnit(totalCost: number, fuelAmount: number): number {
    if (fuelAmount <= 0) return 0;
    return Math.round((totalCost / fuelAmount) * 100) / 100; // Round to 2 decimal places
  }
}

export default FuelValidationService;