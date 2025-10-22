import { VehicleFormData, VehicleValidationErrors, VehicleType, DistanceUnit } from '@/types/vehicle';
import { VALIDATION_LIMITS } from '@/constants/storage';

export class VehicleValidationService {
  static validate(vehicle: VehicleFormData): VehicleValidationErrors {
    const errors: VehicleValidationErrors = {};

    // Make validation
    if (!vehicle.make || vehicle.make.trim().length < 2) {
      errors.make = 'Make must be at least 2 characters long';
    } else if (vehicle.make.trim().length > 50) {
      errors.make = 'Make must be 50 characters or less';
    }

    // Model validation
    if (!vehicle.model || vehicle.model.trim().length < 2) {
      errors.model = 'Model must be at least 2 characters long';
    } else if (vehicle.model.trim().length > 50) {
      errors.model = 'Model must be 50 characters or less';
    }

    // Year validation
    if (!vehicle.year || vehicle.year < VALIDATION_LIMITS.VEHICLE_YEAR_MIN || vehicle.year > VALIDATION_LIMITS.VEHICLE_YEAR_MAX) {
      errors.year = `Year must be between ${VALIDATION_LIMITS.VEHICLE_YEAR_MIN} and ${VALIDATION_LIMITS.VEHICLE_YEAR_MAX}`;
    }

    // Vehicle type validation
    if (!vehicle.vehicleType || !Object.values(VehicleType).includes(vehicle.vehicleType)) {
      errors.vehicleType = 'Please select a valid vehicle type';
    }

    // License plate validation
    if (!vehicle.licensePlate || vehicle.licensePlate.trim().length < VALIDATION_LIMITS.LICENSE_PLATE_MIN_LENGTH) {
      errors.licensePlate = `License plate must be at least ${VALIDATION_LIMITS.LICENSE_PLATE_MIN_LENGTH} characters long`;
    } else if (vehicle.licensePlate.trim().length > VALIDATION_LIMITS.LICENSE_PLATE_MAX_LENGTH) {
      errors.licensePlate = `License plate must be ${VALIDATION_LIMITS.LICENSE_PLATE_MAX_LENGTH} characters or less`;
    }

    // Color validation
    if (!vehicle.color || vehicle.color.trim().length === 0) {
      errors.color = 'Color is required';
    } else if (vehicle.color.trim().length > 30) {
      errors.color = 'Color must be 30 characters or less';
    }

    // VIN validation (optional)
    if (vehicle.vin && vehicle.vin.trim().length > 0) {
      if (vehicle.vin.trim().length !== VALIDATION_LIMITS.VIN_LENGTH) {
        errors.vin = `VIN must be exactly ${VALIDATION_LIMITS.VIN_LENGTH} characters long`;
      }
    }

    // Current mileage validation
    if (vehicle.currentMileage === undefined || vehicle.currentMileage === null) {
      errors.currentMileage = 'Current mileage is required';
    } else if (vehicle.currentMileage < 0) {
      errors.currentMileage = 'Mileage cannot be negative';
    } else if (vehicle.currentMileage > 9999999) {
      errors.currentMileage = 'Mileage seems too high - please check the value';
    }

    // Mileage unit validation
    if (!vehicle.mileageUnit || !Object.values(DistanceUnit).includes(vehicle.mileageUnit)) {
      errors.mileageUnit = 'Please select a valid mileage unit';
    }

    return errors;
  }

  static isValid(vehicle: VehicleFormData): boolean {
    const errors = this.validate(vehicle);
    return Object.keys(errors).length === 0;
  }

  static getErrorSummary(errors: VehicleValidationErrors): string[] {
    return Object.values(errors).filter(error => error !== undefined);
  }
}

export default VehicleValidationService;